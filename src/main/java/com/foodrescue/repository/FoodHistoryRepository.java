package com.foodrescue.repository;

import com.foodrescue.entity.FoodHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodHistoryRepository extends JpaRepository<FoodHistory, Long> {
    List<FoodHistory> findByFoodIdOrderByTimestampDesc(Long foodId);
    List<FoodHistory> findByFoodCodeOrderByTimestampDesc(String foodCode);
    List<FoodHistory> findAllByOrderByTimestampDesc();
}
