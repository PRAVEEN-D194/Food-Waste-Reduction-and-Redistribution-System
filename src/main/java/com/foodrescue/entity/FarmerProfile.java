package com.foodrescue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "farmers")
public class FarmerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String farmName;
    private String farmLocation;
    private String landCapacity;

    public FarmerProfile() {}

    public FarmerProfile(User user, String farmName, String farmLocation, String landCapacity) {
        this.user = user;
        this.farmName = farmName;
        this.farmLocation = farmLocation;
        this.landCapacity = landCapacity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public String getFarmLocation() { return farmLocation; }
    public void setFarmLocation(String farmLocation) { this.farmLocation = farmLocation; }

    public String getLandCapacity() { return landCapacity; }
    public void setLandCapacity(String landCapacity) { this.landCapacity = landCapacity; }
}
