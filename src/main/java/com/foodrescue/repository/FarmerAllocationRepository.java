package com.foodrescue.repository;

import com.foodrescue.entity.FarmerAllocation;
import com.foodrescue.entity.FoodItem;
import com.foodrescue.entity.User;
import com.foodrescue.enums.FarmerAllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmerAllocationRepository extends JpaRepository<FarmerAllocation, Long> {
    List<FarmerAllocation> findByFarmer(User farmer);
    List<FarmerAllocation> findByFarmerOrderByRequestDateDesc(User farmer);
    List<FarmerAllocation> findByFarmerOrderByAllocatedAtDesc(User farmer);
    List<FarmerAllocation> findByFarmerId(Long farmerId);
    List<FarmerAllocation> findByFoodItem(FoodItem foodItem);
    List<FarmerAllocation> findByStatus(FarmerAllocationStatus status);
    List<FarmerAllocation> findByFarmerIdAndStatus(Long farmerId, FarmerAllocationStatus status);
    List<FarmerAllocation> findAllByOrderByRequestDateDesc();
    List<FarmerAllocation> findAllByOrderByAllocatedAtDesc();
    long countByFarmerAndStatus(User farmer, FarmerAllocationStatus status);
    long countByFarmer(User farmer);
}
