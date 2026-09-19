package com.foodrescue.controller;

import com.foodrescue.entity.FoodHistory;
import com.foodrescue.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/food-history", "/api/foods/history"})
public class FoodHistoryController {

    @Autowired
    private FoodService foodService;

    @GetMapping("/{foodId}")
    public ResponseEntity<List<FoodHistory>> getFoodHistory(@PathVariable Long foodId) {
        return ResponseEntity.ok(foodService.getFoodHistory(foodId));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FoodHistory>> getAllHistory() {
        return ResponseEntity.ok(foodService.getAllHistory());
    }
}
