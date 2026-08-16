package com.foodrescue.controller;

import com.foodrescue.dto.FoodRequestDTO;
import com.foodrescue.service.FoodRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/food-requests")
public class FoodRequestController {

    @Autowired
    private FoodRequestService foodRequestService;

    @PostMapping
    @PreAuthorize("hasRole('RECEIVER')")
    public ResponseEntity<FoodRequestDTO> createRequest(@RequestBody Map<String, Object> payload, Authentication authentication) {
        Long foodItemId = Long.valueOf(payload.get("foodItemId").toString());
        Double quantity = Double.valueOf(payload.get("requestedQuantity").toString());
        String notes = payload.containsKey("notes") && payload.get("notes") != null ? payload.get("notes").toString() : "";

        FoodRequestDTO created = foodRequestService.createRequest(foodItemId, quantity, notes, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FoodRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(foodRequestService.getAllRequests());
    }

    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('RECEIVER')")
    public ResponseEntity<List<FoodRequestDTO>> getMyRequests(Authentication authentication) {
        return ResponseEntity.ok(foodRequestService.getRequestsByReceiver(authentication.getName()));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodRequestDTO> approveRequest(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(foodRequestService.approveRequest(id, authentication.getName()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodRequestDTO> rejectRequest(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(foodRequestService.rejectRequest(id, authentication.getName()));
    }
}
