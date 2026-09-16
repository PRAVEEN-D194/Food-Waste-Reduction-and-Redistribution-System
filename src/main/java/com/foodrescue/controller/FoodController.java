package com.foodrescue.controller;

import com.foodrescue.dto.FoodItemDTO;
import com.foodrescue.enums.FoodCategory;
import com.foodrescue.enums.FoodStatus;
import com.foodrescue.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
public class FoodController {

    @Autowired
    private FoodService foodService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<FoodItemDTO> createFood(@Valid @RequestBody FoodItemDTO dto, Authentication authentication) {
        FoodItemDTO created = foodService.createFoodItem(dto, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FoodItemDTO>> searchFoods(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) FoodCategory category,
            @RequestParam(required = false) FoodStatus status,
            @RequestParam(required = false) Long donorId
    ) {
        if (query != null || category != null || status != null || donorId != null) {
            return ResponseEntity.ok(foodService.searchFoodItems(query, category, status, donorId));
        }
        return ResponseEntity.ok(foodService.getAllFoodItems());
    }

    @GetMapping("/available")
    public ResponseEntity<List<FoodItemDTO>> getAvailableFoods() {
        return ResponseEntity.ok(foodService.getAvailableFoodItems());
    }

    @GetMapping("/expired")
    public ResponseEntity<List<FoodItemDTO>> getExpiredFoods() {
        return ResponseEntity.ok(foodService.getExpiredFoodItems());
    }

    @GetMapping("/my-donations")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<List<FoodItemDTO>> getMyDonations(Authentication authentication) {
        return ResponseEntity.ok(foodService.getFoodItemsByDonor(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemDTO> getFoodById(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodItemDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam FoodStatus status,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String remarks,
            Authentication authentication
    ) {
        FoodItemDTO updated = foodService.updateFoodStatus(id, status, action, authentication.getName(), remarks);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<?> removeFood(@PathVariable Long id, Authentication authentication) {
        try {
            FoodItemDTO removed = foodService.removeFood(id, authentication.getName());
            return ResponseEntity.ok(removed);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of("message", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/remove")
    @PreAuthorize("hasAnyRole('DONOR', 'ADMIN')")
    public ResponseEntity<?> removeFoodPut(@PathVariable Long id, Authentication authentication) {
        return removeFood(id, authentication);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getFoodHistory(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodHistory(id));
    }
}
