package com.foodrescue.service;

import com.foodrescue.entity.*;
import com.foodrescue.enums.*;
import com.foodrescue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AllocationService {

    @Autowired
    private FoodAllocationRepository foodAllocationRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodRequestRepository foodRequestRepository;

    @Autowired
    private FoodHistoryRepository foodHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public FoodAllocation allocateFood(Long foodItemId, Long receiverUserId, Double quantity, LocalDateTime pickupDate, String pickupLocation, String notes, String adminUsername) {
        FoodItem foodItem = foodItemRepository.findById(foodItemId)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));

        if (foodItem.getStatus() == FoodStatus.EXPIRED || foodItem.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("CRITICAL SAFETY ERROR: Expired food must not be distributed to people. It can only be redirected through an approved non-human-use workflow.");
        }

        if (quantity > foodItem.getQuantity()) {
            throw new IllegalArgumentException("Allocation quantity (" + quantity + ") cannot exceed available quantity (" + foodItem.getQuantity() + ")");
        }

        User receiver = userRepository.findById(receiverUserId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver user not found"));

        FoodAllocation allocation = new FoodAllocation();
        allocation.setFoodItem(foodItem);
        allocation.setReceiver(receiver);
        allocation.setQuantity(quantity);
        allocation.setPickupDate(pickupDate != null ? pickupDate : LocalDateTime.now().plusHours(24));
        allocation.setPickupLocation(pickupLocation != null ? pickupLocation : foodItem.getPickupLocation());
        allocation.setStatus(AllocationStatus.ALLOCATED);
        allocation.setNotes(notes);

        FoodAllocation savedAllocation = foodAllocationRepository.save(allocation);

        // Update Food Status
        FoodStatus oldStatus = foodItem.getStatus();
        foodItem.setStatus(FoodStatus.ALLOCATED);
        foodItemRepository.save(foodItem);

        // Audit Trail
        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FOOD_ALLOCATED",
                oldStatus,
                FoodStatus.ALLOCATED,
                adminUsername,
                "Allocated " + quantity + " " + foodItem.getUnit() + " to receiver: " + receiver.getFullName()
        );
        foodHistoryRepository.save(history);

        // Notify Receiver & Donor
        notificationService.createNotification(
                null,
                receiver.getId(),
                "Food Allocated",
                "Food " + foodItem.getFoodName() + " (" + quantity + " " + foodItem.getUnit() + ") has been allocated for pickup at " + allocation.getPickupLocation(),
                "SUCCESS"
        );

        notificationService.createNotification(
                null,
                foodItem.getDonor().getId(),
                "Donation Allocated",
                "Your donated food " + foodItem.getFoodName() + " has been allocated to a receiver (" + receiver.getFullName() + ").",
                "INFO"
        );

        return savedAllocation;
    }

    @Transactional
    public FoodAllocation markPickedUpOrDistributed(Long allocationId, String username) {
        FoodAllocation allocation = foodAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        allocation.setStatus(AllocationStatus.PICKED_UP);
        FoodAllocation updated = foodAllocationRepository.save(allocation);

        FoodItem foodItem = allocation.getFoodItem();
        FoodStatus oldStatus = foodItem.getStatus();
        foodItem.setStatus(FoodStatus.DISTRIBUTED);
        foodItemRepository.save(foodItem);

        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "FOOD_DISTRIBUTED",
                oldStatus,
                FoodStatus.DISTRIBUTED,
                username,
                "Food picked up/distributed to " + allocation.getReceiver().getFullName()
        );
        foodHistoryRepository.save(history);

        return updated;
    }

    @Transactional
    public FoodAllocation markCompleted(Long allocationId, String username) {
        FoodAllocation allocation = foodAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        allocation.setStatus(AllocationStatus.COMPLETED);
        FoodAllocation updated = foodAllocationRepository.save(allocation);

        FoodItem foodItem = allocation.getFoodItem();
        FoodStatus oldStatus = foodItem.getStatus();
        foodItem.setStatus(FoodStatus.COMPLETED);
        foodItemRepository.save(foodItem);

        FoodHistory history = new FoodHistory(
                foodItem.getId(),
                foodItem.getFoodCode(),
                foodItem.getFoodName(),
                "WORKFLOW_COMPLETED",
                oldStatus,
                FoodStatus.COMPLETED,
                username,
                "Food distribution cycle completed successfully."
        );
        foodHistoryRepository.save(history);

        return updated;
    }

    public List<FoodAllocation> getAllAllocations() {
        return foodAllocationRepository.findAll();
    }

    public List<FoodAllocation> getAllocationsForReceiver(String username) {
        User receiver = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        return foodAllocationRepository.findByReceiver(receiver);
    }
}
