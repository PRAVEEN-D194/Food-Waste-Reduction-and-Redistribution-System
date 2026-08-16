package com.foodrescue.dto;

import java.util.Map;

public class DashboardStatsDTO {

    private long totalDonations;
    private long availableFoodCount;
    private long distributedFoodCount;
    private long expiredFoodCount;
    private long sentToFarmersCount;
    private long totalDonors;
    private long totalReceivers;
    private long totalFarmers;

    private double totalQuantityDonatedKg;
    private double totalQuantityDistributedKg;
    private double totalQuantityExpiredKg;
    private double totalQuantitySentToFarmersKg;

    private Map<String, Long> categoryBreakdown;
    private Map<String, Double> monthlyDonationsKg;
    private Map<String, Double> monthlyDistributedKg;

    public DashboardStatsDTO() {}

    public long getTotalDonations() { return totalDonations; }
    public void setTotalDonations(long totalDonations) { this.totalDonations = totalDonations; }

    public long getAvailableFoodCount() { return availableFoodCount; }
    public void setAvailableFoodCount(long availableFoodCount) { this.availableFoodCount = availableFoodCount; }

    public long getDistributedFoodCount() { return distributedFoodCount; }
    public void setDistributedFoodCount(long distributedFoodCount) { this.distributedFoodCount = distributedFoodCount; }

    public long getExpiredFoodCount() { return expiredFoodCount; }
    public void setExpiredFoodCount(long expiredFoodCount) { this.expiredFoodCount = expiredFoodCount; }

    public long getSentToFarmersCount() { return sentToFarmersCount; }
    public void setSentToFarmersCount(long sentToFarmersCount) { this.sentToFarmersCount = sentToFarmersCount; }

    public long getTotalDonors() { return totalDonors; }
    public void setTotalDonors(long totalDonors) { this.totalDonors = totalDonors; }

    public long getTotalReceivers() { return totalReceivers; }
    public void setTotalReceivers(long totalReceivers) { this.totalReceivers = totalReceivers; }

    public long getTotalFarmers() { return totalFarmers; }
    public void setTotalFarmers(long totalFarmers) { this.totalFarmers = totalFarmers; }

    public double getTotalQuantityDonatedKg() { return totalQuantityDonatedKg; }
    public void setTotalQuantityDonatedKg(double totalQuantityDonatedKg) { this.totalQuantityDonatedKg = totalQuantityDonatedKg; }

    public double getTotalQuantityDistributedKg() { return totalQuantityDistributedKg; }
    public void setTotalQuantityDistributedKg(double totalQuantityDistributedKg) { this.totalQuantityDistributedKg = totalQuantityDistributedKg; }

    public double getTotalQuantityExpiredKg() { return totalQuantityExpiredKg; }
    public void setTotalQuantityExpiredKg(double totalQuantityExpiredKg) { this.totalQuantityExpiredKg = totalQuantityExpiredKg; }

    public double getTotalQuantitySentToFarmersKg() { return totalQuantitySentToFarmersKg; }
    public void setTotalQuantitySentToFarmersKg(double totalQuantitySentToFarmersKg) { this.totalQuantitySentToFarmersKg = totalQuantitySentToFarmersKg; }

    public Map<String, Long> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<String, Long> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public Map<String, Double> getMonthlyDonationsKg() { return monthlyDonationsKg; }
    public void setMonthlyDonationsKg(Map<String, Double> monthlyDonationsKg) { this.monthlyDonationsKg = monthlyDonationsKg; }

    public Map<String, Double> getMonthlyDistributedKg() { return monthlyDistributedKg; }
    public void setMonthlyDistributedKg(Map<String, Double> monthlyDistributedKg) { this.monthlyDistributedKg = monthlyDistributedKg; }
}
