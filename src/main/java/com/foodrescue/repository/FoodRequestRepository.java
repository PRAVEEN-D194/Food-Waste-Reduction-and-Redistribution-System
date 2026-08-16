package com.foodrescue.repository;

import com.foodrescue.entity.FoodItem;
import com.foodrescue.entity.FoodRequest;
import com.foodrescue.entity.User;
import com.foodrescue.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRequestRepository extends JpaRepository<FoodRequest, Long> {
    List<FoodRequest> findByReceiver(User receiver);
    List<FoodRequest> findByFoodItem(FoodItem foodItem);
    List<FoodRequest> findByStatus(RequestStatus status);
    List<FoodRequest> findByReceiverId(Long receiverId);
}
