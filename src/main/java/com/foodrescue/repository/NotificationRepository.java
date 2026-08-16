package com.foodrescue.repository;

import com.foodrescue.entity.Notification;
import com.foodrescue.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId);
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(Role targetRole);
    List<Notification> findByTargetRoleOrTargetUserIdOrderByCreatedAtDesc(Role targetRole, Long targetUserId);
}
