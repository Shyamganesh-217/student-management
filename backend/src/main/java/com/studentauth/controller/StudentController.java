package com.studentauth.controller;

import com.studentauth.dto.StudentResponse;
import com.studentauth.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling authenticated student endpoints.
 */
@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * Retrieves the profile details of the currently authenticated student.
     */
    @GetMapping("/me")
    public ResponseEntity<StudentResponse> getCurrentStudentProfile(@AuthenticationPrincipal UserDetails userDetails) {
        StudentResponse response = studentService.getProfileByEmail(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
