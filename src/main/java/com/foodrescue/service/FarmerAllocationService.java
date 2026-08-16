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
        allocation.setStatus(FarmerAllocationStatus.PENDING);

        FarmerAllocation saved = farmerAllocationRepository.save(allocation);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "ASSIGNED_TO_FARMER",
                FoodStatus.EXPIRED,
                FoodStatus.EXPIRED,
                adminUsername,
                "Assigned expired food to farmer: " + farmer.getFullName() + " for composting/agricultural non-human use."
        );
        foodHistoryRepository.save(history);

        // Notify Farmer
        notificationService.createNotification(
                null,
                farmer.getId(),
                "New Expired Food Allocation",
                "You have been assigned an expired food item (" + foodItem.getFoodName() + ", " + allocation.getQuantity() + " " + foodItem.getUnit() + ") for approved non-human use/composting.",
                "INFO"
        );

        return convertToDTO(saved);
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

        if (newStatus == FarmerAllocationStatus.ACCEPTED) {
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
                    "Farmer accepted allocation for agricultural/composting redirection."
            );
            foodHistoryRepository.save(history);

            notificationService.createNotification(
                    Role.ROLE_ADMIN,
                    null,
                    "Farmer Accepted Allocation",
                    "Farmer " + farmer.getFullName() + " accepted allocation for " + foodItem.getFoodName() + " (" + foodItem.getFoodCode() + ").",
                    "SUCCESS"
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
                    "Farmer declined allocation. Item remains in EXPIRED queue for re-assignment."
            );
            foodHistoryRepository.save(history);

            notificationService.createNotification(
                    Role.ROLE_ADMIN,
                    null,
                    "Farmer Rejected Allocation",
                    "Farmer " + farmer.getFullName() + " declined allocation for " + foodItem.getFoodName() + ".",
                    "WARNING"
            );
        }

        return convertToDTO(updated);
    }

    @Transactional
    public FarmerAllocationDTO markCompleted(Long allocationId, String farmerUsername) {
        FarmerAllocation allocation = farmerAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        allocation.setStatus(FarmerAllocationStatus.COMPLETED);
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
                farmerUsername,
                "Expired food successfully collected and recycled/composted by farmer."
        );
        foodHistoryRepository.save(history);

        return convertToDTO(updated);
    }

    public List<FarmerAllocationDTO> getAllFarmerAllocations() {
        return farmerAllocationRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<FarmerAllocationDTO> getAllocationsForFarmer(String username) {
        User farmer = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found"));
        return farmerAllocationRepository.findByFarmer(farmer).stream().map(this::convertToDTO).collect(Collectors.toList());
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
        dto.setStatus(allocation.getStatus());
        dto.setAllocatedAt(allocation.getAllocatedAt());
        dto.setRespondedAt(allocation.getRespondedAt());
        return dto;
    }
}
