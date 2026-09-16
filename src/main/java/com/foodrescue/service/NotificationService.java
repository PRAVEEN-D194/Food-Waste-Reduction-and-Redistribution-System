package com.foodrescue.service;

import com.foodrescue.entity.Notification;
import com.foodrescue.enums.Role;
import com.foodrescue.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Role targetRole, Long targetUserId, String title, String message, String type) {
        Notification notification = new Notification(targetRole, targetUserId, title, message, type);
        return notificationRepository.save(notification);
    }

    public Notification createNotification(Role targetRole, Long targetUserId, String title, String message, String type, Long foodId, Long requestId) {
        Notification notification = new Notification(targetRole, targetUserId, title, message, type, foodId, requestId);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId, Role role) {
        return notificationRepository.findByTargetRoleOrTargetUserIdOrderByCreatedAtDesc(role, userId);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId, Role role) {
        List<Notification> list = notificationRepository.findByTargetRoleOrTargetUserId(role, userId);
        for (Notification n : list) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(list);
    }
}
