package com.foodrescue.entity;

import com.foodrescue.enums.Role;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Role targetRole;

    private Long targetUserId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    private String type; // ALERT, INFO, SUCCESS, WARNING

    private Long relatedFoodId;
    private Long relatedRequestId;

    private Boolean isRead;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isRead == null) {
            isRead = false;
        }
    }

    public Notification() {}

    public Notification(Role targetRole, Long targetUserId, String title, String message, String type) {
        this.targetRole = targetRole;
        this.targetUserId = targetUserId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(Role targetRole, Long targetUserId, String title, String message, String type, Long relatedFoodId, Long relatedRequestId) {
        this.targetRole = targetRole;
        this.targetUserId = targetUserId;
        this.title = title;
        this.message = message;
        this.type = type;
        this.relatedFoodId = relatedFoodId;
        this.relatedRequestId = relatedRequestId;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Role getTargetRole() { return targetRole; }
    public void setTargetRole(Role targetRole) { this.targetRole = targetRole; }

    public Long getTargetUserId() { return targetUserId; }
    public void setTargetUserId(Long targetUserId) { this.targetUserId = targetUserId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getRelatedFoodId() { return relatedFoodId; }
    public void setRelatedFoodId(Long relatedFoodId) { this.relatedFoodId = relatedFoodId; }

    public Long getRelatedRequestId() { return relatedRequestId; }
    public void setRelatedRequestId(Long relatedRequestId) { this.relatedRequestId = relatedRequestId; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
