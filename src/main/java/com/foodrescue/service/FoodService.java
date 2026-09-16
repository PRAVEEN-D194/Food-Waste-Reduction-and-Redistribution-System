package com.foodrescue.service;

import com.foodrescue.dto.FoodItemDTO;
import com.foodrescue.entity.DonorProfile;
import com.foodrescue.entity.FoodHistory;
import com.foodrescue.entity.FoodItem;
import com.foodrescue.entity.User;
import com.foodrescue.enums.FoodCategory;
import com.foodrescue.enums.FoodStatus;
import com.foodrescue.enums.Role;
import com.foodrescue.repository.DonorRepository;
import com.foodrescue.repository.FoodHistoryRepository;
import com.foodrescue.repository.FoodItemRepository;
import com.foodrescue.repository.FoodRequestRepository;
import com.foodrescue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FoodService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private FoodHistoryRepository foodHistoryRepository;

    @Autowired
    private FoodRequestRepository foodRequestRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public FoodItemDTO createFoodItem(FoodItemDTO dto, String username) {
        User donor = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Donor not found"));

        FoodItem food = new FoodItem();
        long count = foodItemRepository.count() + 1;
        food.setFoodCode("FOOD" + String.format("%03d", count));
        food.setFoodName(dto.getFoodName());
        food.setCategory(dto.getCategory());
        food.setQuantity(dto.getQuantity());
        food.setRemainingQuantity(dto.getQuantity());
        food.setIsActive(true);
        food.setUnit(dto.getUnit());
        food.setDonor(donor);
        food.setDonationDate(LocalDateTime.now());
        food.setPreparationDate(dto.getPreparationDate() != null ? dto.getPreparationDate() : LocalDateTime.now());
        food.setExpiryDate(dto.getExpiryDate());
        food.setFoodCondition(dto.getFoodCondition());
        food.setStorageCondition(dto.getStorageCondition());
        food.setPickupLocation(dto.getPickupLocation());
        food.setDescription(dto.getDescription());
        food.setStatus(FoodStatus.AVAILABLE);

        FoodItem savedFood = foodItemRepository.save(food);

        // Audit Trail Entry
        String donorName = donor.getFullName();
        DonorProfile profile = donorRepository.findByUser(donor).orElse(null);
        if (profile != null && profile.getOrganizationName() != null) {
            donorName += " (" + profile.getOrganizationName() + ")";
        }
        FoodHistory history = new FoodHistory(
                savedFood.getId(),
                savedFood.getFoodCode(),
                savedFood.getFoodName(),
                "FOOD_ADDED",
                null,
                FoodStatus.AVAILABLE,
                donorName,
                "DONOR",
                "Food item registered and marked AVAILABLE"
        );
        foodHistoryRepository.save(history);

        // Send Admin Notification
        notificationService.createNotification(
                Role.ROLE_ADMIN,
                null,
                "New Food Donation",
                "New food donation received: " + savedFood.getFoodName() + " (" + savedFood.getQuantity() + " " + savedFood.getUnit() + ") from " + donorName,
                "INFO",
                savedFood.getId(),
                null
        );

        return convertToDTO(savedFood);
    }

    @Transactional
    public FoodItemDTO removeFood(Long id, String username) {
        FoodItem food = foodItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found with ID: " + id));

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        // Security check: Only the owning donor or ADMIN can remove
        if (currentUser.getRole() != Role.ROLE_ADMIN && !food.getDonor().getId().equals(currentUser.getId())) {
            throw new SecurityException("Unauthorized: You can only remove your own food donations.");
        }

        // Feature 8, 9, 10, 11: Donor can remove ONLY if AVAILABLE and NO receiver request exists
        if (food.getStatus() != FoodStatus.AVAILABLE) {
            throw new IllegalStateException("Food cannot be removed because its status is " + food.getStatus() + " (only AVAILABLE food without requests can be removed).");
        }

        long requestCount = foodRequestRepository.countByFoodItem(food);
        if (requestCount > 0) {
            throw new IllegalStateException("Food cannot be removed because a receiver request already exists.");
        }

        FoodStatus oldStatus = food.getStatus();
        food.setStatus(FoodStatus.REMOVED);
        food.setIsActive(false);
        FoodItem updated = foodItemRepository.save(food);

        // Audit Trail
        String donorName = currentUser.getFullName();
        FoodHistory history = new FoodHistory(
                updated.getId(),
                updated.getFoodCode(),
                updated.getFoodName(),
                "FOOD_REMOVED",
                oldStatus,
                FoodStatus.REMOVED,
                donorName,
                currentUser.getRole().name(),
                "Food donation removed by donor before any receiver requested it."
        );
        foodHistoryRepository.save(history);

        return convertToDTO(updated);
    }

    public List<FoodItemDTO> searchFoodItems(String query, FoodCategory category, FoodStatus status, Long donorId) {
        List<FoodItem> items = foodItemRepository.searchFoodItems(query, category, status, donorId);
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<FoodItemDTO> getAllFoodItems() {
        return foodItemRepository.findAllByOrderByCreatedAtDesc().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<FoodItemDTO> getAvailableFoodItems() {
        return foodItemRepository.findByStatusOrderByCreatedAtDesc(FoodStatus.AVAILABLE).stream()
                .filter(f -> (f.getIsActive() == null || f.getIsActive()) && (f.getRemainingQuantity() == null || f.getRemainingQuantity() > 0))
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<FoodItemDTO> getExpiredFoodItems() {
        return foodItemRepository.findByStatusOrderByCreatedAtDesc(FoodStatus.EXPIRED).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<FoodItemDTO> getFoodItemsByDonor(String username) {
        User donor = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Donor not found"));
        return foodItemRepository.findByDonorOrderByCreatedAtDesc(donor).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public FoodItemDTO getFoodById(Long id) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found with ID: " + id));
        return convertToDTO(item);
    }

    @Transactional
    public FoodItemDTO updateFoodStatus(Long id, FoodStatus newStatus, String action, String performedBy, String remarks) {
        FoodItem item = foodItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food item not found"));

        FoodStatus oldStatus = item.getStatus();
        item.setStatus(newStatus);
        FoodItem updated = foodItemRepository.save(item);

        FoodHistory history = new FoodHistory(
                updated.getId(),
                updated.getFoodCode(),
                updated.getFoodName(),
                action != null ? action : "STATUS_CHANGE",
                oldStatus,
                newStatus,
                performedBy,
                "ADMIN",
                remarks
        );
        foodHistoryRepository.save(history);

        return convertToDTO(updated);
    }

    public List<FoodHistory> getFoodHistory(Long foodId) {
        return foodHistoryRepository.findByFoodIdOrderByTimestampDesc(foodId);
    }

    public List<FoodHistory> getAllHistory() {
        return foodHistoryRepository.findAllByOrderByTimestampDesc();
    }

    public FoodItemDTO convertToDTO(FoodItem item) {
        FoodItemDTO dto = new FoodItemDTO();
        dto.setId(item.getId());
        dto.setFoodCode(item.getFoodCode());
        dto.setFoodName(item.getFoodName());
        dto.setCategory(item.getCategory());
        dto.setQuantity(item.getQuantity());
        dto.setRemainingQuantity(item.getRemainingQuantity());
        dto.setUnit(item.getUnit());

        if (item.getDonor() != null) {
            dto.setDonorId(item.getDonor().getId());
            dto.setDonorName(item.getDonor().getFullName());
            DonorProfile profile = donorRepository.findByUser(item.getDonor()).orElse(null);
            if (profile != null) {
                dto.setDonorOrganization(profile.getOrganizationName());
            }
        }

        dto.setDonationDate(item.getDonationDate());
        dto.setPreparationDate(item.getPreparationDate());
        dto.setExpiryDate(item.getExpiryDate());
        dto.setFoodCondition(item.getFoodCondition());
        dto.setStorageCondition(item.getStorageCondition());
        dto.setPickupLocation(item.getPickupLocation());
        dto.setDescription(item.getDescription());
        dto.setStatus(item.getStatus());

        // Check if receiver requests exist for donor removal decision
        long requestCount = foodRequestRepository.countByFoodItem(item);
        dto.setHasReceiverRequests(requestCount > 0);

        return dto;
    }
}
