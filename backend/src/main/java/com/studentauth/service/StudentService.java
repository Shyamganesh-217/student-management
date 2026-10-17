package com.studentauth.service;

import com.studentauth.dto.StudentResponse;
import com.studentauth.entity.Student;
import com.studentauth.exception.ResourceNotFoundException;
import com.studentauth.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling student profile operations.
 */
@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    /**
     * Retrieves the profile of the authenticated student by email.
     * Guaranteed never to include password or hash data.
     */
    @Transactional(readOnly = true)
    public StudentResponse getProfileByEmail(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for email: " + email));

        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getRole(),
                student.getCreatedAt()
        );
    }
}
