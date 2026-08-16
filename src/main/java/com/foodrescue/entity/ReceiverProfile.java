package com.foodrescue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "receivers")
public class ReceiverProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String organizationName;
    private String requiredFoodType;

    public ReceiverProfile() {}

    public ReceiverProfile(User user, String organizationName, String requiredFoodType) {
        this.user = user;
        this.organizationName = organizationName;
        this.requiredFoodType = requiredFoodType;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getRequiredFoodType() { return requiredFoodType; }
    public void setRequiredFoodType(String requiredFoodType) { this.requiredFoodType = requiredFoodType; }
}
