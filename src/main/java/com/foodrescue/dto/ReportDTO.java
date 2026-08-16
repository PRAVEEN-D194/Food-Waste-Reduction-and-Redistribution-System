package com.foodrescue.dto;

public class ReportDTO {

    private String reportPeriod;
    private double totalDonatedKg;
    private double totalDistributedKg;
    private double totalExpiredKg;
    private double totalSentToFarmersKg;
    private double totalSavedKg;
    private double wasteReductionPercentage;

    private long totalDonorsCount;
    private long totalReceiversCount;
    private long totalFarmersCount;

    public ReportDTO() {}

    public String getReportPeriod() { return reportPeriod; }
    public void setReportPeriod(String reportPeriod) { this.reportPeriod = reportPeriod; }

    public double getTotalDonatedKg() { return totalDonatedKg; }
    public void setTotalDonatedKg(double totalDonatedKg) { this.totalDonatedKg = totalDonatedKg; }

    public double getTotalDistributedKg() { return totalDistributedKg; }
    public void setTotalDistributedKg(double totalDistributedKg) { this.totalDistributedKg = totalDistributedKg; }

    public double getTotalExpiredKg() { return totalExpiredKg; }
    public void setTotalExpiredKg(double totalExpiredKg) { this.totalExpiredKg = totalExpiredKg; }

    public double getTotalSentToFarmersKg() { return totalSentToFarmersKg; }
    public void setTotalSentToFarmersKg(double totalSentToFarmersKg) { this.totalSentToFarmersKg = totalSentToFarmersKg; }

    public double getTotalSavedKg() { return totalSavedKg; }
    public void setTotalSavedKg(double totalSavedKg) { this.totalSavedKg = totalSavedKg; }

    public double getWasteReductionPercentage() { return wasteReductionPercentage; }
    public void setWasteReductionPercentage(double wasteReductionPercentage) { this.wasteReductionPercentage = wasteReductionPercentage; }

    public long getTotalDonorsCount() { return totalDonorsCount; }
    public void setTotalDonorsCount(long totalDonorsCount) { this.totalDonorsCount = totalDonorsCount; }

    public long getTotalReceiversCount() { return totalReceiversCount; }
    public void setTotalReceiversCount(long totalReceiversCount) { this.totalReceiversCount = totalReceiversCount; }

    public long getTotalFarmersCount() { return totalFarmersCount; }
    public void setTotalFarmersCount(long totalFarmersCount) { this.totalFarmersCount = totalFarmersCount; }
}
