package com.foodrescue.service;

import com.foodrescue.dto.FoodRequestDTO;
import com.foodrescue.entity.*;
import com.foodrescue.enums.FoodStatus;
import com.foodrescue.enums.RequestStatus;
import com.foodrescue.enums.Role;
import com.foodrescue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FoodRequestService {

    @Autowired
    private FoodRequestRepository foodRequestRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReceiverRepository receiverRepository;

    @Autowired
    private FoodHistoryRepository foodHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public FoodRequestDTO createRequest(Long foodItemId, Double requestedQuantity, String notes, String receiverUsername) {
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));

        if (foodItem.getStatus() == FoodStatus.EXPIRED || foodItem.getStatus() == FoodStatus.SENT_TO_FARMER) {
            throw new IllegalArgumentException("Expired or farmer-allocated food cannot be requested for human consumption.");
        }

        if (foodItem.getStatus() != FoodStatus.AVAILABLE && foodItem.getStatus() != FoodStatus.REQUESTED) {
            throw new IllegalArgumentException("Food item is currently not available (Status: " + foodItem.getStatus() + ")");
        }

        double availableQty = foodItem.getRemainingQuantity() != null ? foodItem.getRemainingQuantity() : foodItem.getQuantity();
        if (requestedQuantity > availableQty) {
            throw new IllegalArgumentException("Requested quantity (" + requestedQuantity + ") exceeds available quantity (" + availableQty + ")");
        }

        FoodRequest request = new FoodRequest();
        request.setFoodItem(foodItem);
        request.setReceiver(receiver);
        request.setRequestedQuantity(requestedQuantity);
        request.setAllocatedQuantity(requestedQuantity);
        request.setPickupLocation(foodItem.getPickupLocation());
        request.setStatus(RequestStatus.PENDING);
        request.setNotes(notes);

        FoodRequest savedRequest = foodRequestRepository.save(request);

        // Update food status to REQUESTED
        FoodStatus oldStatus = foodItem.getStatus();
        foodItem.setStatus(FoodStatus.REQUESTED);
        foodItemRepository.save(foodItem);

        // Audit Trail
        String receiverName = receiver.getFullName();
        ReceiverProfile profile = receiverRepository.findByUser(receiver).orElse(null);
        if (profile != null && profile.getOrganizationName() != null) {
            receiverName += " (" + profile.getOrganizationName() + ")";
        }
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FOOD_REQUESTED",
                oldStatus,
                FoodStatus.REQUESTED,
                receiverName,
                "RECEIVER",
                "Requested " + requestedQuantity + " " + foodItem.getUnit() + " by receiver: " + receiverName
        );
        foodHistoryRepository.save(history);

        // Receiver Notification (Feature #7)
        notificationService.createNotification(
                null,
                receiver.getId(),
                "Food Request Submitted",
                "Your request for " + foodItem.getFoodName() + " has been submitted successfully.",
                "INFO",
                foodItem.getId(),
                savedRequest.getId()
        );

        // Admin Notification
        notificationService.createNotification(
                Role.ROLE_ADMIN,
                null,
                "New Food Request",
                "Receiver " + receiverName + " requested " + requestedQuantity + " " + foodItem.getUnit() + " of " + foodItem.getFoodName(),
                "INFO",
                foodItem.getId(),
                savedRequest.getId()
        );

        return convertToDTO(savedRequest);
    }

    public List<FoodRequestDTO> getAllRequests() {
        return foodRequestRepository.findAllByOrderByRequestDateDesc().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<FoodRequestDTO> getRequestsByReceiver(String username) {
        User receiver = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        return foodRequestRepository.findByReceiverOrderByRequestDateDesc(receiver).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public FoodRequestDTO approveRequest(Long requestId, String adminUsername) {
        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Food request not found"));

        FoodItem foodItem = request.getFoodItem();
        FoodStatus oldFoodStatus = foodItem.getStatus();

        request.setStatus(RequestStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        if (request.getAllocatedQuantity() == null) {
            request.setAllocatedQuantity(request.getRequestedQuantity());
        }

        // Deduct remaining quantity (Feature #17)
        double currentRem = foodItem.getRemainingQuantity() != null ? foodItem.getRemainingQuantity() : foodItem.getQuantity();
        double updatedRem = Math.max(0.0, currentRem - request.getRequestedQuantity());
        foodItem.setRemainingQuantity(updatedRem);
        foodItem.setStatus(FoodStatus.APPROVED);
        foodItemRepository.save(foodItem);

        FoodRequest updated = foodRequestRepository.save(request);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "REQUEST_APPROVED",
                oldFoodStatus,
                FoodStatus.APPROVED,
                adminUsername,
                "ADMIN",
                "Admin approved request #" + request.getId() + " for " + request.getRequestedQuantity() + " " + foodItem.getUnit() + " (Remaining: " + updatedRem + " " + foodItem.getUnit() + ")"
        );
        foodHistoryRepository.save(history);

        // Notify Receiver (Feature #7)
        notificationService.createNotification(
                null,
                request.getReceiver().getId(),
                "Food Request Approved",
                "Your request for " + foodItem.getFoodName() + " has been approved.",
                "SUCCESS",
                foodItem.getId(),
                request.getId()
        );

        return convertToDTO(updated);
    }

    @Transactional
    public FoodRequestDTO allocateRequest(Long requestId, String pickupLocation, LocalDateTime pickupDate, String adminUsername) {
        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Food request not found"));

        FoodItem foodItem = request.getFoodItem();
        FoodStatus oldFoodStatus = foodItem.getStatus();

        request.setStatus(RequestStatus.ALLOCATED);
        request.setAllocatedAt(LocalDateTime.now());
        if (pickupLocation != null && !pickupLocation.isBlank()) {
            request.setPickupLocation(pickupLocation);
        }
        if (pickupDate != null) {
            request.setPickupDate(pickupDate);
        }
        foodItem.setStatus(FoodStatus.ALLOCATED);
        foodItemRepository.save(foodItem);

        FoodRequest updated = foodRequestRepository.save(request);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FOOD_ALLOCATED",
                oldFoodStatus,
                FoodStatus.ALLOCATED,
                adminUsername,
                "ADMIN",
                "Food allocated for pickup at " + request.getPickupLocation()
        );
        foodHistoryRepository.save(history);

        // Notify Receiver (Feature #7)
        notificationService.createNotification(
                null,
                request.getReceiver().getId(),
                "Food Allocated",
                "Your requested food has been allocated.",
                "SUCCESS",
                foodItem.getId(),
                request.getId()
        );

        return convertToDTO(updated);
    }

    @Transactional
    public FoodRequestDTO markReadyForPickup(Long requestId, String username) {
        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Food request not found"));

        FoodItem foodItem = request.getFoodItem();
        FoodStatus oldFoodStatus = foodItem.getStatus();

        request.setStatus(RequestStatus.READY_FOR_PICKUP);
        request.setReadyForPickupAt(LocalDateTime.now());
        foodItem.setStatus(FoodStatus.READY_FOR_PICKUP);
        foodItemRepository.save(foodItem);

        FoodRequest updated = foodRequestRepository.save(request);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "READY_FOR_PICKUP",
                oldFoodStatus,
                FoodStatus.READY_FOR_PICKUP,
                username,
                "SYSTEM",
                "Food marked ready for receiver pickup at " + request.getPickupLocation()
        );
        foodHistoryRepository.save(history);

        // Notify Receiver (Feature #7)
        notificationService.createNotification(
                null,
                request.getReceiver().getId(),
                "Ready for Pickup",
                "Your food is ready for pickup.",
                "INFO",
                foodItem.getId(),
                request.getId()
        );

        return convertToDTO(updated);
    }

    @Transactional
    public FoodRequestDTO markPickedUp(Long requestId, String username) {
        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Food request not found"));

        FoodItem foodItem = request.getFoodItem();
        FoodStatus oldFoodStatus = foodItem.getStatus();

        request.setStatus(RequestStatus.PICKED_UP);
        request.setPickedUpAt(LocalDateTime.now());
        foodItem.setStatus(FoodStatus.PICKED_UP);
        foodItemRepository.save(foodItem);

        FoodRequest updated = foodRequestRepository.save(request);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FOOD_PICKED_UP",
                oldFoodStatus,
                FoodStatus.PICKED_UP,
                username,
                "RECEIVER",
                "Food picked up by receiver: " + request.getReceiver().getFullName()
        );
        foodHistoryRepository.save(history);

        return convertToDTO(updated);
    }

    @Transactional
    public FoodRequestDTO markCompleted(Long requestId, String username) {
        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Food request not found"));

        FoodItem foodItem = request.getFoodItem();
        FoodStatus oldFoodStatus = foodItem.getStatus();

        request.setStatus(RequestStatus.COMPLETED);
        request.setCompletedAt(LocalDateTime.now());
        foodItem.setStatus(FoodStatus.COMPLETED);
        foodItemRepository.save(foodItem);

        FoodRequest updated = foodRequestRepository.save(request);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FOOD_DISTRIBUTION_COMPLETED",
                oldFoodStatus,
                FoodStatus.COMPLETED,
                username,
                "RECEIVER",
                "Food request distribution completed successfully."
        );
        foodHistoryRepository.save(history);

        // Notify Receiver (Feature #7)
        notificationService.createNotification(
                null,
                request.getReceiver().getId(),
                "Food Distribution Completed",
                "Your food request has been completed successfully.",
                "SUCCESS",
                foodItem.getId(),
                request.getId()
        );

        return convertToDTO(updated);
    }

    @Transactional
    public FoodRequestDTO rejectRequest(Long requestId, String adminUsername) {
        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Food request not found"));

        request.setStatus(RequestStatus.REJECTED);
        FoodRequest updated = foodRequestRepository.save(request);

        // Revert food item status back to AVAILABLE if needed
        FoodItem foodItem = request.getFoodItem();
        if (foodItem.getStatus() == FoodStatus.REQUESTED || foodItem.getStatus() == FoodStatus.APPROVED) {
            foodItem.setStatus(FoodStatus.AVAILABLE);
            foodItemRepository.save(foodItem);

            FoodHistory history = new FoodHistory(
                    foodItem.getId(),
                    foodItem.getFoodCode(),
                    foodItem.getFoodName(),
                    "REQUEST_REJECTED",
                    FoodStatus.REQUESTED,
                    FoodStatus.AVAILABLE,
                    adminUsername,
                    "ADMIN",
                    "Request rejected by Admin. Food returned to AVAILABLE status."
            );
            foodHistoryRepository.save(history);
        }

        // Notify Receiver (Feature #7)
        notificationService.createNotification(
                null,
                request.getReceiver().getId(),
                "Food Request Rejected",
                "Your request for " + request.getFoodItem().getFoodName() + " was rejected.",
                "WARNING",
                foodItem.getId(),
                request.getId()
        );

        return convertToDTO(updated);
    }

    public FoodRequestDTO convertToDTO(FoodRequest request) {
        FoodRequestDTO dto = new FoodRequestDTO();
        dto.setId(request.getId());
        if (request.getFoodItem() != null) {
            dto.setFoodItemId(request.getFoodItem().getId());
            dto.setFoodCode(request.getFoodItem().getFoodCode());
            dto.setFoodName(request.getFoodItem().getFoodName());
            dto.setCategory(request.getFoodItem().getCategory().name());
            dto.setTotalAvailableQuantity(request.getFoodItem().getRemainingQuantity() != null ? request.getFoodItem().getRemainingQuantity() : request.getFoodItem().getQuantity());
            dto.setUnit(request.getFoodItem().getUnit());
        }

        if (request.getReceiver() != null) {
            dto.setReceiverId(request.getReceiver().getId());
            dto.setReceiverName(request.getReceiver().getFullName());
            ReceiverProfile profile = receiverRepository.findByUser(request.getReceiver()).orElse(null);
            if (profile != null) {
                dto.setReceiverOrganization(profile.getOrganizationName());
            }
        }

        dto.setRequestedQuantity(request.getRequestedQuantity());
        dto.setAllocatedQuantity(request.getAllocatedQuantity());
        dto.setPickupLocation(request.getPickupLocation());
        dto.setPickupDate(request.getPickupDate());
        dto.setStatus(request.getStatus());
        dto.setRequestDate(request.getRequestDate());
        dto.setApprovedAt(request.getApprovedAt());
        dto.setAllocatedAt(request.getAllocatedAt());
        dto.setReadyForPickupAt(request.getReadyForPickupAt());
        dto.setPickedUpAt(request.getPickedUpAt());
        dto.setCompletedAt(request.getCompletedAt());
        dto.setNotes(request.getNotes());
        return dto;
    }
}
