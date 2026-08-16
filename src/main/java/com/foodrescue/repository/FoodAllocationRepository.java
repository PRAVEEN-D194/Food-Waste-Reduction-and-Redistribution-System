package com.foodrescue.repository;

import com.foodrescue.entity.FoodAllocation;
import com.foodrescue.entity.FoodItem;
import com.foodrescue.entity.User;
import com.foodrescue.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodAllocationRepository extends JpaRepository<FoodAllocation, Long> {
    List<FoodAllocation> findByReceiver(User receiver);
    List<FoodAllocation> findByFoodItem(FoodItem foodItem);
    List<FoodAllocation> findByStatus(AllocationStatus status);
}
