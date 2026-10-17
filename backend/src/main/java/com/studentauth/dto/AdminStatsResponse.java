package com.studentauth.dto;

import java.time.LocalDateTime;

/**
 * Statistics response DTO for the Admin Dashboard.
 */
public class AdminStatsResponse {

    private long totalStudents;
    private long totalAdmins;
    private long totalUsers;
    private LocalDateTime serverTime;

    public AdminStatsResponse() {
    }

    public AdminStatsResponse(long totalStudents, long totalAdmins, long totalUsers, LocalDateTime serverTime) {
        this.totalStudents = totalStudents;
        this.totalAdmins = totalAdmins;
        this.totalUsers = totalUsers;
        this.serverTime = serverTime;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public LocalDateTime getServerTime() {
        return serverTime;
    }

    public void setServerTime(LocalDateTime serverTime) {
        this.serverTime = serverTime;
    }
}
