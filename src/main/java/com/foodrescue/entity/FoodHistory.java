package com.foodrescue.entity;

import com.foodrescue.enums.FoodStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "food_history")
public class FoodHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long foodId;

    private String foodCode;
    private String foodName;

    @Column(nullable = false)
    private String action;

    @Enumerated(EnumType.STRING)
    private FoodStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FoodStatus newStatus;

    private String performedBy;
    private String performedByRole;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 500)
    private String remarks;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public FoodHistory() {}

    public FoodHistory(Long foodId, String foodCode, String foodName, String action, FoodStatus previousStatus, FoodStatus newStatus, String performedBy, String remarks) {
        this.foodId = foodId;
        this.foodCode = foodCode;
        this.foodName = foodName;
        this.action = action;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.performedBy = performedBy;
        this.remarks = remarks;
        this.timestamp = LocalDateTime.now();
    }

    public FoodHistory(Long foodId, String foodCode, String foodName, String action, FoodStatus previousStatus, FoodStatus newStatus, String performedBy, String performedByRole, String remarks) {
        this.foodId = foodId;
        this.foodCode = foodCode;
        this.foodName = foodName;
        this.action = action;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.performedBy = performedBy;
        this.performedByRole = performedByRole;
        this.remarks = remarks;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFoodId() { return foodId; }
    public void setFoodId(Long foodId) { this.foodId = foodId; }

    public String getFoodCode() { return foodCode; }
    public void setFoodCode(String foodCode) { this.foodCode = foodCode; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public FoodStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(FoodStatus previousStatus) { this.previousStatus = previousStatus; }

    public FoodStatus getNewStatus() { return newStatus; }
    public void setNewStatus(FoodStatus newStatus) { this.newStatus = newStatus; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public String getPerformedByRole() { return performedByRole; }
    public void setPerformedByRole(String performedByRole) { this.performedByRole = performedByRole; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
