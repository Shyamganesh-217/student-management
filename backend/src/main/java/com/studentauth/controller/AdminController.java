package com.studentauth.controller;

import com.studentauth.dto.AdminStatsResponse;
import com.studentauth.dto.StudentResponse;
import com.studentauth.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller handling protected administrator operations.
 * Strictly enforced with hasRole('ADMIN') authorization.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * Retrieves the list of all registered students, optionally filtered by search query.
     * Accessible only by administrators.
     */
    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getStudents(
            @RequestParam(name = "search", required = false) String search) {
        List<StudentResponse> students = adminService.getAllStudents(search);
        return ResponseEntity.ok(students);
    }

    /**
     * Retrieves high-level dashboard metrics for the administrator dashboard.
     * Accessible only by administrators.
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        AdminStatsResponse stats = adminService.getStats();
        return ResponseEntity.ok(stats);
    }
}
