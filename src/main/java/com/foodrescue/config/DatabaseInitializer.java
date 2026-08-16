package com.foodrescue.config;

import com.foodrescue.entity.*;
import com.foodrescue.enums.*;
import com.foodrescue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonorRepository donorRepository;

    @Autowired
    private ReceiverRepository receiverRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private FoodRequestRepository foodRequestRepository;

    @Autowired
    private FoodAllocationRepository foodAllocationRepository;

    @Autowired
    private FarmerAllocationRepository farmerAllocationRepository;

    @Autowired
    private FoodHistoryRepository foodHistoryRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Database already seeded
        }

        System.out.println("Initializing FoodRescue Seed Data...");

        String defaultPassword = passwordEncoder.encode("password123");

        // 1. Admin
        User admin = new User(null, "admin", "admin@foodrescue.org", defaultPassword, "System Administrator", "+1-800-FOOD-RESCUE", "100 Rescue Way, HQ City", Role.ROLE_ADMIN);
        userRepository.save(admin);

        // 2. Donors
        User donor1User = new User(null, "abchotel", "contact@abchotel.com", defaultPassword, "ABC Grand Hotel", "+1-555-0101", "123 Hospitality Blvd", Role.ROLE_DONOR);
        userRepository.save(donor1User);
        donorRepository.save(new DonorProfile(donor1User, "ABC Grand Hotel & Suites"));

        User donor2User = new User(null, "citybakery", "info@citybakery.com", defaultPassword, "City Fresh Bakery", "+1-555-0102", "456 Main Street", Role.ROLE_DONOR);
        userRepository.save(donor2User);
        donorRepository.save(new DonorProfile(donor2User, "City Fresh Bakery Co."));

        User donor3User = new User(null, "apexevents", "events@apexcatering.com", defaultPassword, "Apex Event Catering", "+1-555-0103", "789 Event Center Rd", Role.ROLE_DONOR);
        userRepository.save(donor3User);
        donorRepository.save(new DonorProfile(donor3User, "Apex Catering Services"));

        // 3. Receivers
        User rec1User = new User(null, "hopehaven", "shelter@hopehaven.org", defaultPassword, "Hope Haven Shelter", "+1-555-0201", "321 Relief Ave", Role.ROLE_RECEIVER);
        userRepository.save(rec1User);
        receiverRepository.save(new ReceiverProfile(rec1User, "Hope Haven Shelter", "Cooked Meals, Grains"));

        User rec2User = new User(null, "sunshinekids", "care@sunshinekids.org", defaultPassword, "Sunshine Orphanage", "+1-555-0202", "654 Care St", Role.ROLE_RECEIVER);
        userRepository.save(rec2User);
        receiverRepository.save(new ReceiverProfile(rec2User, "Sunshine Kids Orphanage", "Dairy, Bakery, Fruits"));

        User rec3User = new User(null, "communitykitchen", "feed@communitykitchen.org", defaultPassword, "Community Pantry", "+1-555-0203", "987 Unity Square", Role.ROLE_RECEIVER);
        userRepository.save(rec3User);
        receiverRepository.save(new ReceiverProfile(rec3User, "Metro Community Kitchen", "Vegetables, Rice, Packaged"));

        // 4. Farmers
        User farmer1User = new User(null, "greenfarms", "contact@greenfields.com", defaultPassword, "Green Fields Organics", "+1-555-0301", "100 Farm Lane, Rural County", Role.ROLE_FARMER);
        userRepository.save(farmer1User);
        farmerRepository.save(new FarmerProfile(farmer1User, "Green Fields Organic Farm", "Rural County East", "50 Acres"));

        User farmer2User = new User(null, "agricompost", "info@agricompost.com", defaultPassword, "AgriEco Composting", "+1-555-0302", "250 Soil Works Way", Role.ROLE_FARMER);
        userRepository.save(farmer2User);
        farmerRepository.save(new FarmerProfile(farmer2User, "AgriEco Soil Solutions", "West Valley", "120 Acres"));

        User farmer3User = new User(null, "sunriselivestock", "feed@sunriselivestock.com", defaultPassword, "Sunrise Bio-Recycling", "+1-555-0303", "500 Meadow Rd", Role.ROLE_FARMER);
        userRepository.save(farmer3User);
        farmerRepository.save(new FarmerProfile(farmer3User, "Sunrise Agricultural Recycling", "North Pastable", "80 Acres"));

        // 5. Food Items
        LocalDateTime now = LocalDateTime.now();

        // Item 1: Available
        FoodItem item1 = createFood("FOOD001", "Fresh Basmati Rice & Curry", FoodCategory.COOKED_FOOD, 35.0, "kg", donor1User, now.minusHours(2), now.plusHours(12), "Hot & Fresh", "Insulated Container", "ABC Hotel Rear Kitchen", "Surplus banquet catering rice and mixed vegetable curry", FoodStatus.AVAILABLE);
        // Item 2: Available
        FoodItem item2 = createFood("FOOD002", "Assorted Bakery Loaves & Pastries", FoodCategory.BAKERY, 20.0, "boxes", donor2User, now.minusHours(4), now.plusHours(24), "Freshly Baked", "Dry Room Temperature", "City Bakery Counter B", "Whole wheat bread, croissants and dinner rolls", FoodStatus.AVAILABLE);
        // Item 3: Available
        FoodItem item3 = createFood("FOOD003", "Fresh Organic Apples & Oranges", FoodCategory.FRUITS, 50.0, "kg", donor3User, now.minusHours(6), now.plusDays(3), "Crisp & Clean", "Cold Storage 4°C", "Apex Warehouse Dock 2", "Surplus fruit crates from corporate conference", FoodStatus.AVAILABLE);
        // Item 4: Requested
        FoodItem item4 = createFood("FOOD004", "Steamed Vegetable Dumplings", FoodCategory.COOKED_FOOD, 15.0, "kg", donor1User, now.minusHours(3), now.plusHours(8), "Hot", "Thermal Box", "ABC Hotel Kitchen 1", "Freshly cooked vegetable dim sum", FoodStatus.REQUESTED);
        // Item 5: Allocated
        FoodItem item5 = createFood("FOOD005", "Whole Milk Crates & Yoghurt", FoodCategory.DAIRY, 30.0, "liters", donor2User, now.minusHours(5), now.plusDays(2), "Sealed & Chilled", "Refrigerated Truck", "City Bakery Loading Dock", "Grade A pasteurized whole milk cartons", FoodStatus.ALLOCATED);
        // Item 6: Distributed
        FoodItem item6 = createFood("FOOD006", "Raw Mixed Vegetables", FoodCategory.VEGETABLES, 60.0, "kg", donor3User, now.minusDays(1), now.plusDays(2), "Farm Fresh", "Cool Pantry", "Apex Warehouse Dock 1", "Potatoes, carrots, onions, and bell peppers", FoodStatus.DISTRIBUTED);
        // Item 7: Expired
        FoodItem item7 = createFood("FOOD007", "Prepared Pasta Alfredo", FoodCategory.COOKED_FOOD, 25.0, "kg", donor1User, now.minusHours(36), now.minusHours(6), "Expired - Past Human Safety Window", "Ambient", "ABC Hotel Cold Storage B", "Creamy pasta dish past safe consumption timeframe", FoodStatus.EXPIRED);
        // Item 8: Expired
        FoodItem item8 = createFood("FOOD008", "Overripe Bananas & Berries", FoodCategory.FRUITS, 40.0, "kg", donor3User, now.minusDays(3), now.minusHours(12), "Soft / Overripe", "Unrefrigerated", "Apex Warehouse Dock 3", "Overripe fruits ideal for agricultural composting", FoodStatus.EXPIRED);
        // Item 9: Sent to Farmer
        FoodItem item9 = createFood("FOOD009", "Expired Grain & Milling Byproduct", FoodCategory.GRAINS, 100.0, "kg", donor2User, now.minusDays(5), now.minusDays(1), "Expired Raw Grain", "Dry Storage", "City Bakery Grain Silo", "Expired milling residue redirected for eco-composting", FoodStatus.SENT_TO_FARMER);
        // Item 10: Completed
        FoodItem item10 = createFood("FOOD010", "Packaged Canned Beans & Soup", FoodCategory.PACKAGED_FOOD, 45.0, "cans", donor3User, now.minusDays(4), now.plusDays(30), "Sealed Cans", "Dry Shelf", "Apex Pantry Desk", "Sealed non-perishable food drive surplus", FoodStatus.COMPLETED);

        // 6. Food Request
        FoodRequest req1 = new FoodRequest();
        req1.setFoodItem(item4);
        req1.setReceiver(rec1User);
        req1.setRequestedQuantity(15.0);
        req1.setStatus(RequestStatus.PENDING);
        req1.setNotes("Need hot food for dinner distribution at shelter.");
        foodRequestRepository.save(req1);

        // 7. Food Allocation
        FoodAllocation alloc1 = new FoodAllocation();
        alloc1.setFoodItem(item5);
        alloc1.setReceiver(rec2User);
        alloc1.setQuantity(30.0);
        alloc1.setPickupLocation("City Bakery Loading Dock");
        alloc1.setPickupDate(now.plusHours(4));
        alloc1.setStatus(AllocationStatus.ALLOCATED);
        alloc1.setNotes("Cold transport recommended.");
        foodAllocationRepository.save(alloc1);

        // 8. Farmer Allocation (Expired Food Workflow)
        FarmerAllocation farmerAlloc1 = new FarmerAllocation();
        farmerAlloc1.setFoodItem(item9);
        farmerAlloc1.setFarmer(farmer1User);
        farmerAlloc1.setQuantity(100.0);
        farmerAlloc1.setPickupLocation("City Bakery Grain Silo");
        farmerAlloc1.setPickupDate(now.plusHours(12));
        farmerAlloc1.setNotes("For organic soil composting enrichment.");
        farmerAlloc1.setStatus(FarmerAllocationStatus.ACCEPTED);
        farmerAlloc1.setRespondedAt(now.minusHours(2));
        farmerAllocationRepository.save(farmerAlloc1);

        // 9. Initial Notifications
        notificationRepository.save(new Notification(Role.ROLE_ADMIN, null, "⚠ Expired Food Alert", "2 food items (FOOD007, FOOD008) have expired. Please review and assign to approved farmers for composting/agricultural non-human use.", "WARNING"));
        notificationRepository.save(new Notification(null, rec2User.getId(), "Food Allocated", "Whole Milk Crates & Yoghurt has been allocated for pickup at City Bakery Loading Dock.", "SUCCESS"));
        notificationRepository.save(new Notification(null, farmer1User.getId(), "Expired Food Accepted", "You accepted allocation for Expired Grain & Milling Byproduct (FOOD009).", "SUCCESS"));

        System.out.println("FoodRescue Seed Data Initialized Successfully!");
    }

    private FoodItem createFood(String code, String name, FoodCategory cat, Double qty, String unit, User donor, LocalDateTime prepDate, LocalDateTime expiryDate, String cond, String storage, String location, String desc, FoodStatus status) {
        FoodItem item = new FoodItem();
        item.setFoodCode(code);
        item.setFoodName(name);
        item.setCategory(cat);
        item.setQuantity(qty);
        item.setUnit(unit);
        item.setDonor(donor);
        item.setDonationDate(prepDate);
        item.setPreparationDate(prepDate);
        item.setExpiryDate(expiryDate);
        item.setFoodCondition(cond);
        item.setStorageCondition(storage);
        item.setPickupLocation(location);
        item.setDescription(desc);
        item.setStatus(status);

        FoodItem saved = foodItemRepository.save(item);

        // Create Audit Log
        FoodHistory history = new FoodHistory(
                saved.getId(),
                saved.getFoodCode(),
                saved.getFoodName(),
                "INITIAL_ENTRY",
                null,
                status,
                donor.getFullName(),
                "Food item registered in system with status " + status
        );
        foodHistoryRepository.save(history);

        return saved;
    }
}
