package com.foodrescue.service;

import com.foodrescue.dto.FarmerAllocationDTO;
import com.foodrescue.entity.*;
import com.foodrescue.enums.FarmerAllocationStatus;
import com.foodrescue.enums.FoodStatus;
import com.foodrescue.enums.Role;
import com.foodrescue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FarmerAllocationService {

    @Autowired
    private FarmerAllocationRepository farmerAllocationRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private FoodHistoryRepository foodHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public FarmerAllocationDTO requestExpiredFood(Long foodItemId, Double quantity, String reason, String farmerUsername) {
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));

        if (foodItem.getStatus() != FoodStatus.EXPIRED) {
            throw new IllegalArgumentException("Only expired food items can be requested for approved non-human workflows.");
        }

        User farmer = userRepository.findByUsername(farmerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Farmer user not found: " + farmerUsername));

        FarmerAllocation allocation = new FarmerAllocation();
        allocation.setFoodItem(foodItem);
        allocation.setFarmer(farmer);
        allocation.setQuantity(quantity != null ? quantity : foodItem.getQuantity());
        allocation.setReason(reason != null ? reason : "Agricultural / Composting Non-Human Use");
        allocation.setPickupLocation(foodItem.getPickupLocation());
        allocation.setRequestDate(LocalDateTime.now());
        allocation.setStatus(FarmerAllocationStatus.PENDING);

        FarmerAllocation saved = farmerAllocationRepository.save(allocation);

        // Audit Trail
        String farmerName = farmer.getFullName();
        FarmerProfile profile = farmerRepository.findByUser(farmer).orElse(null);
        if (profile != null && profile.getFarmName() != null) {
            farmerName += " (" + profile.getFarmName() + ")";
        }
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FARMER_REQUESTED",
                FoodStatus.EXPIRED,
                FoodStatus.EXPIRED,
                farmerName,
                "FARMER",
                "Farmer requested " + saved.getQuantity() + " " + foodItem.getUnit() + " of expired food for: " + saved.getReason()
        );
        foodHistoryRepository.save(history);

        // Admin Notification (Feature #4)
        notificationService.createNotification(
                Role.ROLE_ADMIN,
                null,
                "🔔 New Farmer Request",
                "Farmer " + farmer.getFullName() + " requested " + saved.getQuantity() + " " + foodItem.getUnit() + " of expired " + foodItem.getFoodName() + ".",
                "INFO",
                foodItem.getId(),
                saved.getId()
        );

        return convertToDTO(saved);
    }

    @Transactional
    public FarmerAllocationDTO allocateExpiredFoodToFarmer(Long foodItemId, Long farmerUserId, Double quantity, LocalDateTime pickupDate, String pickupLocation, String notes, String adminUsername) {
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));

        if (foodItem.getStatus() != FoodStatus.EXPIRED) {
            throw new IllegalArgumentException("Only food items with EXPIRED status can be allocated to farmers for non-human use.");
        }

        User farmer = userRepository.findById(farmerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer user not found"));

        FarmerAllocation allocation = new FarmerAllocation();
        allocation.setFoodItem(foodItem);
        allocation.setFarmer(farmer);
        allocation.setQuantity(quantity != null ? quantity : foodItem.getQuantity());
        allocation.setPickupDate(pickupDate != null ? pickupDate : LocalDateTime.now().plusHours(48));
        allocation.setPickupLocation(pickupLocation != null ? pickupLocation : foodItem.getPickupLocation());
        allocation.setNotes(notes);
        allocation.setAllocatedAt(LocalDateTime.now());
        allocation.setStatus(FarmerAllocationStatus.ASSIGNED);

        FarmerAllocation saved = farmerAllocationRepository.save(allocation);

        // Update food status to SENT_TO_FARMER
        FoodStatus oldStatus = foodItem.getStatus();
        foodItem.setStatus(FoodStatus.SENT_TO_FARMER);
        foodItemRepository.save(foodItem);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "ASSIGNED_TO_FARMER",
                oldStatus,
                FoodStatus.SENT_TO_FARMER,
                adminUsername,
                "ADMIN",
                "Assigned expired food to farmer: " + farmer.getFullName() + " for composting/agricultural non-human use."
        );
        foodHistoryRepository.save(history);

        // Notify Farmer
        notificationService.createNotification(
                null,
                farmer.getId(),
                "✅ Request Approved",
                "Your request for " + saved.getQuantity() + " " + foodItem.getUnit() + " " + foodItem.getFoodName() + " has been approved. Please check collection details.",
                "SUCCESS",
                foodItem.getId(),
                saved.getId()
        );

        return convertToDTO(saved);
    }

    @Transactional
    public FarmerAllocationDTO approveFarmerRequest(Long requestId, String adminUsername) {
        FarmerAllocation allocation = farmerAllocationRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer request not found with ID: " + requestId));

        FoodItem foodItem = allocation.getFoodItem();
        FoodStatus oldStatus = foodItem.getStatus();

        allocation.setStatus(FarmerAllocationStatus.APPROVED);
        allocation.setAllocatedAt(LocalDateTime.now());
        if (allocation.getPickupDate() == null) {
            allocation.setPickupDate(LocalDateTime.now().plusHours(48));
        }
        if (allocation.getPickupLocation() == null) {
            allocation.setPickupLocation(foodItem.getPickupLocation());
        }
        FarmerAllocation updated = farmerAllocationRepository.save(allocation);

        // Food status becomes SENT_TO_FARMER (Feature #3)
        foodItem.setStatus(FoodStatus.SENT_TO_FARMER);
        foodItemRepository.save(foodItem);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FARMER_REQUEST_APPROVED",
                oldStatus,
                FoodStatus.SENT_TO_FARMER,
                adminUsername,
                "ADMIN",
                "Admin approved farmer request #" + requestId + ". Food assigned to " + allocation.getFarmer().getFullName() + " with status SENT_TO_FARMER."
        );
        foodHistoryRepository.save(history);

        // Farmer Notification (Feature #4)
        notificationService.createNotification(
                null,
                allocation.getFarmer().getId(),
                "✅ Request Approved",
                "Your request for " + allocation.getQuantity() + " " + foodItem.getUnit() + " " + foodItem.getFoodName() + " has been approved. Please check collection details.",
                "SUCCESS",
                foodItem.getId(),
                allocation.getId()
        );

        return convertToDTO(updated);
    }

    @Transactional
    public FarmerAllocationDTO rejectFarmerRequest(Long requestId, String adminUsername) {
        FarmerAllocation allocation = farmerAllocationRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer request not found with ID: " + requestId));

        FoodItem foodItem = allocation.getFoodItem();

        allocation.setStatus(FarmerAllocationStatus.REJECTED);
        allocation.setRespondedAt(LocalDateTime.now());
        FarmerAllocation updated = farmerAllocationRepository.save(allocation);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FARMER_REQUEST_REJECTED",
                FoodStatus.EXPIRED,
                FoodStatus.EXPIRED,
                adminUsername,
                "ADMIN",
                "Admin rejected farmer request #" + requestId + "."
        );
        foodHistoryRepository.save(history);

        // Farmer Notification (Feature #4)
        notificationService.createNotification(
                null,
                allocation.getFarmer().getId(),
                "❌ Request Rejected",
                "Your request for " + allocation.getQuantity() + " " + foodItem.getUnit() + " " + foodItem.getFoodName() + " was rejected.",
                "WARNING",
                foodItem.getId(),
                allocation.getId()
        );

        return convertToDTO(updated);
    }

    @Transactional
    public FarmerAllocationDTO markCollected(Long allocationId, String farmerUsername) {
        FarmerAllocation allocation = farmerAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer allocation not found"));

        User farmer = userRepository.findByUsername(farmerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));

        if (!allocation.getFarmer().getId().equals(farmer.getId()) && farmer.getRole() != Role.ROLE_ADMIN) {
            throw new SecurityException("Unauthorized: This allocation belongs to another farmer.");
        }

        allocation.setStatus(FarmerAllocationStatus.COLLECTED);
        allocation.setCollectedAt(LocalDateTime.now());
        FarmerAllocation updated = farmerAllocationRepository.save(allocation);

        FoodItem foodItem = allocation.getFoodItem();
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FARMER_COLLECTED",
                foodItem.getStatus(),
                FoodStatus.SENT_TO_FARMER,
                farmer.getFullName(),
                "FARMER",
                "Farmer marked expired food as COLLECTED from pickup location."
        );
        foodHistoryRepository.save(history);

        return convertToDTO(updated);
    }

    @Transactional
    public FarmerAllocationDTO markCompleted(Long allocationId, String farmerUsername) {
        FarmerAllocation allocation = farmerAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        User farmer = userRepository.findByUsername(farmerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));

        if (!allocation.getFarmer().getId().equals(farmer.getId()) && farmer.getRole() != Role.ROLE_ADMIN) {
            throw new SecurityException("Unauthorized: This allocation belongs to another farmer.");
        }

        allocation.setStatus(FarmerAllocationStatus.COMPLETED);
        allocation.setCompletedAt(LocalDateTime.now());
        FarmerAllocation updated = farmerAllocationRepository.save(allocation);

        FoodItem foodItem = allocation.getFoodItem();
        FoodStatus oldStatus = foodItem.getStatus();
        foodItem.setStatus(FoodStatus.COMPLETED);
        foodItemRepository.save(foodItem);

        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FARMER_WORKFLOW_COMPLETED",
                oldStatus,
                FoodStatus.COMPLETED,
                farmer.getFullName(),
                "FARMER",
                "Expired food successfully recycled/composted by farmer."
        );
        foodHistoryRepository.save(history);

        return convertToDTO(updated);
    }

    @Transactional
    public FarmerAllocationDTO farmerRespond(Long allocationId, String statusString, String farmerUsername) {
        FarmerAllocation allocation = farmerAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer allocation not found"));

        User farmer = userRepository.findByUsername(farmerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));

        if (!allocation.getFarmer().getId().equals(farmer.getId())) {
            throw new IllegalStateException("Unauthorized: This allocation belongs to another farmer.");
        }

        FarmerAllocationStatus newStatus = FarmerAllocationStatus.valueOf(statusString.toUpperCase());
        allocation.setStatus(newStatus);
        allocation.setRespondedAt(LocalDateTime.now());
        FarmerAllocation updated = farmerAllocationRepository.save(allocation);

        FoodItem foodItem = allocation.getFoodItem();
        FoodStatus oldStatus = foodItem.getStatus();

        if (newStatus == FarmerAllocationStatus.ACCEPTED || newStatus == FarmerAllocationStatus.APPROVED) {
            foodItem.setStatus(FoodStatus.SENT_TO_FARMER);
            foodItemRepository.save(foodItem);

            FoodHistory history = new FoodHistory(
                    foodItem.getId(),
                    foodItem.getFoodCode(),
                    foodItem.getFoodName(),
                    "FARMER_ACCEPTED",
                    oldStatus,
                    FoodStatus.SENT_TO_FARMER,
                    farmer.getFullName(),
                    "FARMER",
                    "Farmer accepted allocation for agricultural/composting redirection."
            );
            foodHistoryRepository.save(history);

            notificationService.createNotification(
                    Role.ROLE_ADMIN,
                    null,
                    "Farmer Accepted Allocation",
                    "Farmer " + farmer.getFullName() + " accepted allocation for " + foodItem.getFoodName() + " (" + foodItem.getFoodCode() + ").",
                    "SUCCESS",
                    foodItem.getId(),
                    updated.getId()
            );
        } else if (newStatus == FarmerAllocationStatus.REJECTED) {
            FoodHistory history = new FoodHistory(
                    foodItem.getId(),
                    foodItem.getFoodCode(),
                    foodItem.getFoodName(),
                    "FARMER_REJECTED",
                    oldStatus,
                    FoodStatus.EXPIRED,
                    farmer.getFullName(),
                    "FARMER",
                    "Farmer declined allocation. Item remains in EXPIRED queue for re-assignment."
            );
            foodHistoryRepository.save(history);

            notificationService.createNotification(
                    Role.ROLE_ADMIN,
                    null,
                    "Farmer Rejected Allocation",
                    "Farmer " + farmer.getFullName() + " declined allocation for " + foodItem.getFoodName() + ".",
                    "WARNING",
                    foodItem.getId(),
                    updated.getId()
            );
        }

        return convertToDTO(updated);
    }

    public List<FarmerAllocationDTO> getAllFarmerAllocations() {
        return farmerAllocationRepository.findAllByOrderByRequestDateDesc().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<FarmerAllocationDTO> getAllocationsForFarmer(String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));
        return farmerAllocationRepository.findByFarmerOrderByRequestDateDesc(farmer).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public java.util.Map<String, Object> getFarmerDashboardStats(String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));

        long expiredFoodsAvailable = foodItemRepository.countByStatus(FoodStatus.EXPIRED);
        long myFoodRequests = farmerAllocationRepository.countByFarmer(farmer);
        long approvedRequests = farmerAllocationRepository.countByFarmerAndStatus(farmer, FarmerAllocationStatus.APPROVED);
        long assignedFoods = farmerAllocationRepository.countByFarmerAndStatus(farmer, FarmerAllocationStatus.ASSIGNED) + approvedRequests;
        long completedCollections = farmerAllocationRepository.countByFarmerAndStatus(farmer, FarmerAllocationStatus.COMPLETED) + farmerAllocationRepository.countByFarmerAndStatus(farmer, FarmerAllocationStatus.COLLECTED);

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("expiredFoodsAvailable", expiredFoodsAvailable);
        stats.put("myFoodRequests", myFoodRequests);
        stats.put("approvedRequests", approvedRequests);
        stats.put("assignedFoods", assignedFoods);
        stats.put("completedCollections", completedCollections);
        return stats;
    }

    public FarmerAllocationDTO convertToDTO(FarmerAllocation allocation) {
        FarmerAllocationDTO dto = new FarmerAllocationDTO();
        dto.setId(allocation.getId());
        if (allocation.getFoodItem() != null) {
            dto.setFoodItemId(allocation.getFoodItem().getId());
            dto.setFoodCode(allocation.getFoodItem().getFoodCode());
            dto.setFoodName(allocation.getFoodItem().getFoodName());
            dto.setCategory(allocation.getFoodItem().getCategory().name());
            dto.setQuantity(allocation.getQuantity());
            dto.setUnit(allocation.getFoodItem().getUnit());
            dto.setExpiryDate(allocation.getFoodItem().getExpiryDate());
            if (allocation.getFoodItem().getDonor() != null) {
                dto.setDonorName(allocation.getFoodItem().getDonor().getFullName());
            }
        }

        if (allocation.getFarmer() != null) {
            dto.setFarmerId(allocation.getFarmer().getId());
            dto.setFarmerName(allocation.getFarmer().getFullName());
            FarmerProfile profile = farmerRepository.findByUser(allocation.getFarmer()).orElse(null);
            if (profile != null) {
                dto.setFarmName(profile.getFarmName());
            }
        }

        dto.setPickupLocation(allocation.getPickupLocation());
        dto.setPickupDate(allocation.getPickupDate());
        dto.setNotes(allocation.getNotes());
        dto.setReason(allocation.getReason());
        dto.setInstructions(allocation.getInstructions());
        dto.setStatus(allocation.getStatus());
        dto.setRequestDate(allocation.getRequestDate());
        dto.setAllocatedAt(allocation.getAllocatedAt());
        dto.setRespondedAt(allocation.getRespondedAt());
        dto.setCollectedAt(allocation.getCollectedAt());
        dto.setCompletedAt(allocation.getCompletedAt());
        return dto;
    }
}
