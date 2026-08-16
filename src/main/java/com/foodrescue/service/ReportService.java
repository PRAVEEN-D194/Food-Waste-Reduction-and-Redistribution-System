package com.foodrescue.service;

import com.foodrescue.dto.DashboardStatsDTO;
import com.foodrescue.dto.ReportDTO;
import com.foodrescue.entity.FoodItem;
import com.foodrescue.enums.FoodCategory;
import com.foodrescue.enums.FoodStatus;
import com.foodrescue.enums.Role;
import com.foodrescue.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ReportService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FoodRequestRepository foodRequestRepository;

    @Autowired
    private FoodAllocationRepository foodAllocationRepository;

    @Autowired
    private FarmerAllocationRepository farmerAllocationRepository;

    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        List<FoodItem> allItems = foodItemRepository.findAll();

        stats.setTotalDonations(allItems.size());
        stats.setAvailableFoodCount(foodItemRepository.countByStatus(FoodStatus.AVAILABLE));
        stats.setDistributedFoodCount(foodItemRepository.countByStatus(FoodStatus.DISTRIBUTED) + foodItemRepository.countByStatus(FoodStatus.COMPLETED));
        stats.setExpiredFoodCount(foodItemRepository.countByStatus(FoodStatus.EXPIRED));
        stats.setSentToFarmersCount(foodItemRepository.countByStatus(FoodStatus.SENT_TO_FARMER));

        stats.setTotalDonors(userRepository.countByRole(Role.ROLE_DONOR));
        stats.setTotalReceivers(userRepository.countByRole(Role.ROLE_RECEIVER));
        stats.setTotalFarmers(userRepository.countByRole(Role.ROLE_FARMER));

        double donatedKg = allItems.stream().mapToDouble(FoodItem::getQuantity).sum();
        double distributedKg = allItems.stream()
                .filter(i -> i.getStatus() == FoodStatus.DISTRIBUTED || i.getStatus() == FoodStatus.COMPLETED)
                .mapToDouble(FoodItem::getQuantity).sum();
        double expiredKg = allItems.stream()
                .filter(i -> i.getStatus() == FoodStatus.EXPIRED)
                .mapToDouble(FoodItem::getQuantity).sum();
        double farmersKg = allItems.stream()
                .filter(i -> i.getStatus() == FoodStatus.SENT_TO_FARMER)
                .mapToDouble(FoodItem::getQuantity).sum();

        stats.setTotalQuantityDonatedKg(donatedKg);
        stats.setTotalQuantityDistributedKg(distributedKg);
        stats.setTotalQuantityExpiredKg(expiredKg);
        stats.setTotalQuantitySentToFarmersKg(farmersKg);

        // Category breakdown
        Map<String, Long> catBreakdown = new LinkedHashMap<>();
        for (FoodCategory cat : FoodCategory.values()) {
            long count = allItems.stream().filter(i -> i.getCategory() == cat).count();
            if (count > 0) {
                catBreakdown.put(cat.name(), count);
            }
        }
        stats.setCategoryBreakdown(catBreakdown);

        // Monthly trends
        Map<String, Double> monthlyDonated = new LinkedHashMap<>();
        Map<String, Double> monthlyDistributed = new LinkedHashMap<>();

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (FoodItem item : allItems) {
            String monthKey = item.getDonationDate() != null ? item.getDonationDate().format(monthFormatter) : "Aug 2026";
            monthlyDonated.put(monthKey, monthlyDonated.getOrDefault(monthKey, 0.0) + item.getQuantity());

            if (item.getStatus() == FoodStatus.DISTRIBUTED || item.getStatus() == FoodStatus.COMPLETED || item.getStatus() == FoodStatus.SENT_TO_FARMER) {
                monthlyDistributed.put(monthKey, monthlyDistributed.getOrDefault(monthKey, 0.0) + item.getQuantity());
            }
        }

        stats.setMonthlyDonationsKg(monthlyDonated);
        stats.setMonthlyDistributedKg(monthlyDistributed);

        return stats;
    }

    public ReportDTO generateMonthlyReport(String monthYearStr) {
        ReportDTO report = new ReportDTO();
        report.setReportPeriod(monthYearStr != null ? monthYearStr : LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMMM yyyy")));

        List<FoodItem> allItems = foodItemRepository.findAll();

        double totalDonated = allItems.stream().mapToDouble(FoodItem::getQuantity).sum();
        double totalDistributed = allItems.stream()
                .filter(i -> i.getStatus() == FoodStatus.DISTRIBUTED || i.getStatus() == FoodStatus.COMPLETED)
                .mapToDouble(FoodItem::getQuantity).sum();
        double totalExpired = allItems.stream()
                .filter(i -> i.getStatus() == FoodStatus.EXPIRED)
                .mapToDouble(FoodItem::getQuantity).sum();
        double totalSentFarmers = allItems.stream()
                .filter(i -> i.getStatus() == FoodStatus.SENT_TO_FARMER)
                .mapToDouble(FoodItem::getQuantity).sum();

        double totalSaved = totalDistributed + totalSentFarmers;
        double reductionPct = totalDonated > 0 ? (totalSaved / totalDonated) * 100.0 : 0.0;

        report.setTotalDonatedKg(totalDonated);
        report.setTotalDistributedKg(totalDistributed);
        report.setTotalExpiredKg(totalExpired);
        report.setTotalSentToFarmersKg(totalSentFarmers);
        report.setTotalSavedKg(totalSaved);
        report.setWasteReductionPercentage(Math.round(reductionPct * 10.0) / 10.0);

        report.setTotalDonorsCount(userRepository.countByRole(Role.ROLE_DONOR));
        report.setTotalReceiversCount(userRepository.countByRole(Role.ROLE_RECEIVER));
        report.setTotalFarmersCount(userRepository.countByRole(Role.ROLE_FARMER));

        return report;
    }

    public String generateCsvReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("Food ID,Food Code,Food Name,Category,Quantity,Unit,Donor,Status,Donation Date,Expiry Date,Pickup Location\n");

        List<FoodItem> items = foodItemRepository.findAll();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (FoodItem item : items) {
            csv.append(item.getId()).append(",")
               .append(escapeCsv(item.getFoodCode())).append(",")
               .append(escapeCsv(item.getFoodName())).append(",")
               .append(item.getCategory().name()).append(",")
               .append(item.getQuantity()).append(",")
               .append(escapeCsv(item.getUnit())).append(",")
               .append(escapeCsv(item.getDonor() != null ? item.getDonor().getFullName() : "N/A")).append(",")
               .append(item.getStatus().name()).append(",")
               .append(item.getDonationDate() != null ? item.getDonationDate().format(fmt) : "").append(",")
               .append(item.getExpiryDate() != null ? item.getExpiryDate().format(fmt) : "").append(",")
               .append(escapeCsv(item.getPickupLocation())).append("\n");
        }

        return csv.toString();
    }

    private String escapeCsv(String input) {
        if (input == null) return "";
        if (input.contains(",") || input.contains("\"") || input.contains("\n")) {
            return "\"" + input.replace("\"", "\"\"") + "\"";
        }
        return input;
    }
}
