package com.foodrescue.service;

import com.foodrescue.entity.FoodHistory;
import com.foodrescue.entity.FoodItem;
import com.foodrescue.enums.FoodStatus;
import com.foodrescue.enums.Role;
import com.foodrescue.repository.FoodHistoryRepository;
import com.foodrescue.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class ExpirySchedulerService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private FoodHistoryRepository foodHistoryRepository;

    @Autowired
    private NotificationService notificationService;

    // Runs every 1 minute to check for expired food items automatically
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkForExpiredFood() {
        LocalDateTime now = LocalDateTime.now();
        List<FoodStatus> checkStatuses = Arrays.asList(FoodStatus.AVAILABLE, FoodStatus.REQUESTED);

        List<FoodItem> expiredItems = foodItemRepository.findExpiredItems(now, checkStatuses);

        if (!expiredItems.isEmpty()) {
            for (FoodItem food : expiredItems) {
                FoodStatus oldStatus = food.getStatus();
                food.setStatus(FoodStatus.EXPIRED);
                foodItemRepository.save(food);

                // Audit Trail Entry
                FoodHistory history = new FoodHistory(
                        food.getId(),
                        food.getFoodCode(),
                        food.getFoodName(),
                        "EXPIRY_DETECTED_AUTOMATIC",
                        oldStatus,
                        FoodStatus.EXPIRED,
                        "System Expiry Scheduler",
                        "SYSTEM",
                        "Food reached expiry date (" + food.getExpiryDate() + "). Automatically marked EXPIRED and flagged for farmer redirection."
                );
                foodHistoryRepository.save(history);
            }

            // Create alert notification for Admin
            notificationService.createNotification(
                    Role.ROLE_ADMIN,
                    null,
                    "⚠ Expired Food Alert",
                    expiredItems.size() + " food item(s) have passed their expiry date and require action. Expired food must be redirected to approved farmers/non-human workflows.",
                    "WARNING"
            );
        }
    }
}
