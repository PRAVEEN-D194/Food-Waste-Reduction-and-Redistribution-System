package com.foodrescue.controller;

import com.foodrescue.entity.*;
import com.foodrescue.enums.Role;
import com.foodrescue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ReceiverRepository receiverRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/donors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DonorProfile>> getDonors() {
        return ResponseEntity.ok(donorRepository.findAll());
    }

    @GetMapping("/receivers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReceiverProfile>> getReceivers() {
        return ResponseEntity.ok(receiverRepository.findAll());
    }

    @GetMapping("/farmers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FarmerProfile>> getFarmers() {
        return ResponseEntity.ok(farmerRepository.findAll());
    }
}
