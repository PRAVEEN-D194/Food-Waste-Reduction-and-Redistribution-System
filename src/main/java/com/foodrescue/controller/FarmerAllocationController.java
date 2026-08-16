package com.foodrescue.controller;

import com.foodrescue.dto.FarmerAllocationDTO;
import com.foodrescue.service.FarmerAllocationService;
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
@RequestMapping("/api/farmer-allocations")
public class FarmerAllocationController {

    @Autowired
    private FarmerAllocationService farmerAllocationService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FarmerAllocationDTO> allocateToFarmer(@RequestBody Map<String, Object> payload, Authentication authentication) {
        Long foodItemId = Long.valueOf(payload.get("foodItemId").toString());
        Long farmerUserId = Long.valueOf(payload.get("farmerUserId").toString());
        Double quantity = payload.containsKey("quantity") && payload.get("quantity") != null ? Double.valueOf(payload.get("quantity").toString()) : null;

        String pickupLocation = payload.containsKey("pickupLocation") && payload.get("pickupLocation") != null ? payload.get("pickupLocation").toString() : null;
        String notes = payload.containsKey("notes") && payload.get("notes") != null ? payload.get("notes").toString() : null;

        LocalDateTime pickupDate = null;
        if (payload.containsKey("pickupDate") && payload.get("pickupDate") != null) {
            pickupDate = LocalDateTime.parse(payload.get("pickupDate").toString());
        }

        FarmerAllocationDTO allocation = farmerAllocationService.allocateExpiredFoodToFarmer(foodItemId, farmerUserId, quantity, pickupDate, pickupLocation, notes, authentication.getName());
        return new ResponseEntity<>(allocation, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FarmerAllocationDTO>> getAllFarmerAllocations() {
        return ResponseEntity.ok(farmerAllocationService.getAllFarmerAllocations());
    }

    @GetMapping("/my-allocations")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<List<FarmerAllocationDTO>> getMyAllocations(Authentication authentication) {
        return ResponseEntity.ok(farmerAllocationService.getAllocationsForFarmer(authentication.getName()));
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<FarmerAllocationDTO> respondToAllocation(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication
    ) {
        return ResponseEntity.ok(farmerAllocationService.farmerRespond(id, status, authentication.getName()));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<FarmerAllocationDTO> markCompleted(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(farmerAllocationService.markCompleted(id, authentication.getName()));
    }
}
