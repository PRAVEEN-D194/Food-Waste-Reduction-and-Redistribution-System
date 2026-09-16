package com.foodrescue.dto;

import com.foodrescue.enums.RequestStatus;
import java.time.LocalDateTime;

public class FoodRequestDTO {

    private Long id;
    private Long foodItemId;
    private String foodCode;
    private String foodName;
    private String category;
    private Double totalAvailableQuantity;
    private String unit;

    private Long receiverId;
    private String receiverName;
    private String receiverOrganization;

    private Double requestedQuantity;
    private RequestStatus status;
    private LocalDateTime requestDate;
    private String notes;

    private Double allocatedQuantity;
    private String pickupLocation;
    private LocalDateTime pickupDate;
    private LocalDateTime approvedAt;
    private LocalDateTime allocatedAt;
    private LocalDateTime readyForPickupAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime completedAt;

    public FoodRequestDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getFoodItemId() { return foodItemId; }
    public void setFoodItemId(Long foodItemId) { this.foodItemId = foodItemId; }

    public String getFoodCode() { return foodCode; }
    public void setFoodCode(String foodCode) { this.foodCode = foodCode; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getTotalAvailableQuantity() { return totalAvailableQuantity; }
    public void setTotalAvailableQuantity(Double totalAvailableQuantity) { this.totalAvailableQuantity = totalAvailableQuantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getReceiverOrganization() { return receiverOrganization; }
    public void setReceiverOrganization(String receiverOrganization) { this.receiverOrganization = receiverOrganization; }

    public Double getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(Double requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public LocalDateTime getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDateTime requestDate) { this.requestDate = requestDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Double getAllocatedQuantity() { return allocatedQuantity; }
    public void setAllocatedQuantity(Double allocatedQuantity) { this.allocatedQuantity = allocatedQuantity; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public LocalDateTime getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDateTime pickupDate) { this.pickupDate = pickupDate; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getAllocatedAt() { return allocatedAt; }
    public void setAllocatedAt(LocalDateTime allocatedAt) { this.allocatedAt = allocatedAt; }

    public LocalDateTime getReadyForPickupAt() { return readyForPickupAt; }
    public void setReadyForPickupAt(LocalDateTime readyForPickupAt) { this.readyForPickupAt = readyForPickupAt; }

    public LocalDateTime getPickedUpAt() { return pickedUpAt; }
    public void setPickedUpAt(LocalDateTime pickedUpAt) { this.pickedUpAt = pickedUpAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
