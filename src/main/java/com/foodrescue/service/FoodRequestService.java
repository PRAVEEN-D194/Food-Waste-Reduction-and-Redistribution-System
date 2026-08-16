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

        if (foodItem.getStatus() != FoodStatus.AVAILABLE) {
            throw new IllegalArgumentException("Food item is currently not available (Status: " + foodItem.getStatus() + ")");
        }

        if (requestedQuantity > foodItem.getQuantity()) {
            throw new IllegalArgumentException("Requested quantity (" + requestedQuantity + ") exceeds available quantity (" + foodItem.getQuantity() + ")");
        }

        FoodRequest request = new FoodRequest();
        request.setFoodItem(foodItem);
        request.setReceiver(receiver);
        request.setRequestedQuantity(requestedQuantity);
        request.setStatus(RequestStatus.PENDING);
        request.setNotes(notes);

        FoodRequest savedRequest = foodRequestRepository.save(request);

        // Update food status to REQUESTED if pending approval
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
                "Requested " + requestedQuantity + " " + foodItem.getUnit() + " by receiver: " + receiverName
        );
        foodHistoryRepository.save(history);

        // Admin Notification
        notificationService.createNotification(
                Role.ROLE_ADMIN,
                null,
                "New Food Request",
                "Receiver " + receiverName + " requested " + requestedQuantity + " " + foodItem.getUnit() + " of " + foodItem.getFoodName(),
                "INFO"
        );

        return convertToDTO(savedRequest);
    }

    public List<FoodRequestDTO> getAllRequests() {
        return foodRequestRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<FoodRequestDTO> getRequestsByReceiver(String username) {
        User receiver = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        return foodRequestRepository.findByReceiver(receiver).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public FoodRequestDTO approveRequest(Long requestId, String adminUsername) {
        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Food request not found"));

        request.setStatus(RequestStatus.APPROVED);
        FoodRequest updated = foodRequestRepository.save(request);

        // Notify Receiver
        notificationService.createNotification(
                null,
                request.getReceiver().getId(),
                "Food Request Approved",
                "Your request for " + request.getFoodItem().getFoodName() + " (" + request.getRequestedQuantity() + " " + request.getFoodItem().getUnit() + ") has been approved!",
                "SUCCESS"
        );

        return convertToDTO(updated);
    }

    @Transactional
    public FoodRequestDTO rejectRequest(Long requestId, String adminUsername) {
        FoodRequest request = foodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Food request not found"));

        request.setStatus(RequestStatus.REJECTED);
        FoodRequest updated = foodRequestRepository.save(request);

        // Revert food item status back to AVAILABLE
        FoodItem foodItem = request.getFoodItem();
        if (foodItem.getStatus() == FoodStatus.REQUESTED) {
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
                    "Request rejected by Admin. Food returned to AVAILABLE status."
            );
            foodHistoryRepository.save(history);
        }

        // Notify Receiver
        notificationService.createNotification(
                null,
                request.getReceiver().getId(),
                "Food Request Status Update",
                "Your request for " + request.getFoodItem().getFoodName() + " was rejected.",
                "WARNING"
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
            dto.setTotalAvailableQuantity(request.getFoodItem().getQuantity());
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
        dto.setStatus(request.getStatus());
        dto.setRequestDate(request.getRequestDate());
        dto.setNotes(request.getNotes());
        return dto;
    }
}
