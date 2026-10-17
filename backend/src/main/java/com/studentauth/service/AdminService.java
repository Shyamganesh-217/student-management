package com.studentauth.service;

import com.studentauth.dto.AdminStatsResponse;
import com.studentauth.dto.StudentResponse;
import com.studentauth.entity.Student;
import com.studentauth.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for administrative queries: student lists, stats, and search.
 */
@Service
public class AdminService {

    private final StudentRepository studentRepository;

    public AdminService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * Retrieves all registered students or searches students by name/email.
     */
    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudents(String query) {
        List<Student> students;
        if (query != null && !query.trim().isEmpty()) {
            students = studentRepository.searchByRoleAndQuery("STUDENT", query.trim());
        } else {
            students = studentRepository.findByRoleOrderByCreatedAtDesc("STUDENT");
        }

        return students.stream()
                .map(s -> new StudentResponse(
                        s.getId(),
                        s.getName(),
                        s.getEmail(),
                        s.getRole(),
                        s.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves dashboard summary metrics for the Admin Dashboard.
     */
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalStudents = studentRepository.countByRole("STUDENT");
        long totalAdmins = studentRepository.countByRole("ADMIN");
        long totalUsers = totalStudents + totalAdmins;

        return new AdminStatsResponse(totalStudents, totalAdmins, totalUsers, LocalDateTime.now());
    }
}
