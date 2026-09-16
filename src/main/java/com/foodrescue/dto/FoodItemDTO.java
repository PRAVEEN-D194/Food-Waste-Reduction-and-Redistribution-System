package com.foodrescue.dto;

import com.foodrescue.enums.FoodCategory;
import com.foodrescue.enums.FoodStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class FoodItemDTO {

    private Long id;
    private String foodCode;

    @NotBlank(message = "Food name is required")
    private String foodName;

    @NotNull(message = "Category is required")
    private FoodCategory category;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be greater than 0")
    private Double quantity;

    @NotBlank(message = "Unit is required")
    private String unit;

    private Long donorId;
    private String donorName;
    private String donorOrganization;

    private LocalDateTime donationDate;
    private LocalDateTime preparationDate;

    @NotNull(message = "Expiry date is required")
    private LocalDateTime expiryDate;

    private String foodCondition;
    private String storageCondition;

    @NotBlank(message = "Pickup location is required")
    private String pickupLocation;

    private String description;
    private FoodStatus status;
    private Double remainingQuantity;
    private Boolean hasReceiverRequests;

    public FoodItemDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFoodCode() { return foodCode; }
    public void setFoodCode(String foodCode) { this.foodCode = foodCode; }

    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }

    public FoodCategory getCategory() { return category; }
    public void setCategory(FoodCategory category) { this.category = category; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getRemainingQuantity() { return remainingQuantity != null ? remainingQuantity : quantity; }
    public void setRemainingQuantity(Double remainingQuantity) { this.remainingQuantity = remainingQuantity; }

    public Boolean getHasReceiverRequests() { return hasReceiverRequests != null ? hasReceiverRequests : false; }
    public void setHasReceiverRequests(Boolean hasReceiverRequests) { this.hasReceiverRequests = hasReceiverRequests; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Long getDonorId() { return donorId; }
    public void setDonorId(Long donorId) { this.donorId = donorId; }

    public String getDonorName() { return donorName; }
    public void setDonorName(String donorName) { this.donorName = donorName; }

    public String getDonorOrganization() { return donorOrganization; }
    public void setDonorOrganization(String donorOrganization) { this.donorOrganization = donorOrganization; }

    public LocalDateTime getDonationDate() { return donationDate; }
    public void setDonationDate(LocalDateTime donationDate) { this.donationDate = donationDate; }

    public LocalDateTime getPreparationDate() { return preparationDate; }
    public void setPreparationDate(LocalDateTime preparationDate) { this.preparationDate = preparationDate; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public String getFoodCondition() { return foodCondition; }
    public void setFoodCondition(String foodCondition) { this.foodCondition = foodCondition; }

    public String getStorageCondition() { return storageCondition; }
    public void setStorageCondition(String storageCondition) { this.storageCondition = storageCondition; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public FoodStatus getStatus() { return status; }
    public void setStatus(FoodStatus status) { this.status = status; }
}
