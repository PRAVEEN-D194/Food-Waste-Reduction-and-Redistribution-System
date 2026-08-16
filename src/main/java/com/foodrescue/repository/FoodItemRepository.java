package com.foodrescue.repository;

import com.foodrescue.entity.FoodItem;
import com.foodrescue.entity.User;
import com.foodrescue.enums.FoodCategory;
import com.foodrescue.enums.FoodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    Optional<FoodItem> findByFoodCode(String foodCode);

    List<FoodItem> findByDonor(User donor);

    List<FoodItem> findByStatus(FoodStatus status);

    List<FoodItem> findByStatusIn(List<FoodStatus> statuses);

    List<FoodItem> findByCategory(FoodCategory category);

    long countByStatus(FoodStatus status);

    @Query("SELECT f FROM FoodItem f WHERE f.expiryDate <= :now AND f.status IN :validStatuses")
    List<FoodItem> findExpiredItems(@Param("now") LocalDateTime now, @Param("validStatuses") List<FoodStatus> validStatuses);

    @Query("SELECT f FROM FoodItem f WHERE " +
           "(:query IS NULL OR LOWER(f.foodName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(f.foodCode) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:category IS NULL OR f.category = :category) AND " +
           "(:status IS NULL OR f.status = :status) AND " +
           "(:donorId IS NULL OR f.donor.id = :donorId)")
    List<FoodItem> searchFoodItems(
            @Param("query") String query,
            @Param("category") FoodCategory category,
            @Param("status") FoodStatus status,
            @Param("donorId") Long donorId
    );

    @Query("SELECT SUM(f.quantity) FROM FoodItem f WHERE f.status = :status")
    Double sumQuantityByStatus(@Param("status") FoodStatus status);
}
