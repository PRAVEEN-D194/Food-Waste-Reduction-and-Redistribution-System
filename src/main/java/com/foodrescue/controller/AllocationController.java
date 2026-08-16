package com.foodrescue.controller;

import com.foodrescue.entity.FoodAllocation;
import com.foodrescue.service.AllocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    @Autowired
    private AllocationService allocationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodAllocation> createAllocation(@RequestBody Map<String, Object> payload, Authentication authentication) {
        Long foodItemId = Long.valueOf(payload.get("foodItemId").toString());
        Long receiverUserId = Long.valueOf(payload.get("receiverUserId").toString());
        Double quantity = Double.valueOf(payload.get("quantity").toString());

        String pickupLocation = payload.containsKey("pickupLocation") && payload.get("pickupLocation") != null ? payload.get("pickupLocation").toString() : null;
        String notes = payload.containsKey("notes") && payload.get("notes") != null ? payload.get("notes").toString() : null;

        LocalDateTime pickupDate = null;
        if (payload.containsKey("pickupDate") && payload.get("pickupDate") != null) {
            pickupDate = LocalDateTime.parse(payload.get("pickupDate").toString());
        }

        FoodAllocation allocation = allocationService.allocateFood(foodItemId, receiverUserId, quantity, pickupDate, pickupLocation, notes, authentication.getName());
        return new ResponseEntity<>(allocation, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FoodAllocation>> getAllAllocations() {
        return ResponseEntity.ok(allocationService.getAllAllocations());
    }

    @GetMapping("/my-allocations")
    @PreAuthorize("hasRole('RECEIVER')")
    public ResponseEntity<List<FoodAllocation>> getMyAllocations(Authentication authentication) {
        return ResponseEntity.ok(allocationService.getAllocationsForReceiver(authentication.getName()));
    }

    @PutMapping("/{id}/picked-up")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEIVER')")
    public ResponseEntity<FoodAllocation> markPickedUp(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(allocationService.markPickedUpOrDistributed(id, authentication.getName()));
    }

    @PutMapping("/{id}/completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEIVER')")
    public ResponseEntity<FoodAllocation> markCompleted(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(allocationService.markCompleted(id, authentication.getName()));
    }
}
