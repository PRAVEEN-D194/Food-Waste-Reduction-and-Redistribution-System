package com.foodrescue.controller;

import com.foodrescue.dto.FarmerAllocationDTO;
import com.foodrescue.dto.FoodItemDTO;
import com.foodrescue.service.FarmerAllocationService;
import com.foodrescue.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class FarmerRequestController {

    @Autowired
    private FarmerAllocationService farmerAllocationService;

    @Autowired
    private FoodService foodService;

    // 1. Farmer views expired foods
    @GetMapping("/api/farmer/expired-foods")
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<List<FoodItemDTO>> getExpiredFoodsForFarmer() {
        return ResponseEntity.ok(foodService.getExpiredFoodItems());
    }

    // 2. Farmer dashboard stats
    @GetMapping("/api/farmer/dashboard-stats")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Map<String, Object>> getFarmerDashboardStats(Authentication authentication) {
        return ResponseEntity.ok(farmerAllocationService.getFarmerDashboardStats(authentication.getName()));
    }

    // 3. Farmer requests expired food
    @PostMapping({"/api/farmer/food-requests", "/api/farmer/request/{foodId}"})
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<FarmerAllocationDTO> requestExpiredFood(
            @PathVariable(required = false) Long foodId,
            @RequestBody Map<String, Object> payload,
            Authentication authentication
    ) {
        Long foodItemId = foodId;
        if (foodItemId == null && payload.containsKey("foodItemId") && payload.get("foodItemId") != null) {
            foodItemId = Long.valueOf(payload.get("foodItemId").toString());
        }

        Double quantity = null;
        Object qtyObj = payload.containsKey("quantity") ? payload.get("quantity") : payload.get("requestedQuantity");
        if (qtyObj != null) {
            quantity = Double.valueOf(qtyObj.toString());
        }

        String reason = null;
        Object reasonObj = payload.containsKey("reason") ? payload.get("reason") : payload.get("intendedUse");
        if (reasonObj != null) {
            reason = reasonObj.toString();
        }

        FarmerAllocationDTO created = farmerAllocationService.requestExpiredFood(foodItemId, quantity, reason, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // 4. Farmer views own food requests
    @GetMapping({"/api/farmer/food-requests", "/api/farmer/my-requests"})
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<List<FarmerAllocationDTO>> getMyFarmerRequests(Authentication authentication) {
        return ResponseEntity.ok(farmerAllocationService.getAllocationsForFarmer(authentication.getName()));
    }

    // 5. Admin views all farmer food requests
    @GetMapping({"/api/admin/farmer-requests", "/api/farmer/admin-requests"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FarmerAllocationDTO>> getAllFarmerRequests() {
        return ResponseEntity.ok(farmerAllocationService.getAllFarmerAllocations());
    }

    // 6. Admin approves farmer request
    @PutMapping({"/api/admin/farmer-requests/{id}/approve", "/api/farmer/requests/{id}/approve"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FarmerAllocationDTO> approveFarmerRequest(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(farmerAllocationService.approveFarmerRequest(id, authentication.getName()));
    }

    // 7. Admin rejects farmer request
    @PutMapping({"/api/admin/farmer-requests/{id}/reject", "/api/farmer/requests/{id}/reject"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FarmerAllocationDTO> rejectFarmerRequest(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(farmerAllocationService.rejectFarmerRequest(id, authentication.getName()));
    }

    // 8. Farmer marks request as COLLECTED
    @PutMapping({"/api/farmer/food-requests/{id}/collect", "/api/farmer/requests/{id}/collect"})
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<FarmerAllocationDTO> markCollected(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(farmerAllocationService.markCollected(id, authentication.getName()));
    }

    // 9. Farmer marks request as COMPLETED
    @PutMapping({"/api/farmer/food-requests/{id}/complete", "/api/farmer/requests/{id}/complete"})
    @PreAuthorize("hasAnyRole('FARMER', 'ADMIN')")
    public ResponseEntity<FarmerAllocationDTO> markCompleted(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(farmerAllocationService.markCompleted(id, authentication.getName()));
    }
}
