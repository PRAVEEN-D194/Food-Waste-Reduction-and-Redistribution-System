package com.foodrescue.repository;

import com.foodrescue.entity.ReceiverProfile;
import com.foodrescue.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReceiverRepository extends JpaRepository<ReceiverProfile, Long> {
    Optional<ReceiverProfile> findByUser(User user);
    Optional<ReceiverProfile> findByUserId(Long userId);
}
