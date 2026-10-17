package com.studentauth.service;

import com.studentauth.dto.AuthResponse;
import com.studentauth.dto.LoginRequest;
import com.studentauth.dto.RegisterRequest;
import com.studentauth.entity.Student;
import com.studentauth.exception.BadRequestException;
import com.studentauth.exception.DuplicateEmailException;
import com.studentauth.repository.StudentRepository;
import com.studentauth.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling registration and authentication logic with strict security checks.
 */
@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.admin.email}")
    private String adminEmail;

    public AuthService(StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Registers a new student.
     * Always assigns STUDENT role and hashes password with BCrypt.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Verify password confirmation matches
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // Disallow public registration of the reserved administrator email
        if (normalizedEmail.equalsIgnoreCase(adminEmail.trim())) {
            throw new BadRequestException("The specified email address is reserved and cannot be registered publicly.");
        }

        // Check if email already exists
        if (studentRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("An account with email '" + normalizedEmail + "' already exists. Please log in.");
        }

        // Create student entity - ALWAYS enforce STUDENT role on backend
        Student student = new Student();
        student.setName(request.getName().trim());
        student.setEmail(normalizedEmail);
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole("STUDENT");

        Student savedStudent = studentRepository.save(student);

        // Generate signed JWT token
        String token = jwtTokenProvider.generateToken(
                savedStudent.getId(),
                savedStudent.getName(),
                savedStudent.getEmail(),
                savedStudent.getRole()
        );

        return new AuthResponse(
                token,
                savedStudent.getId(),
                savedStudent.getName(),
                savedStudent.getEmail(),
                savedStudent.getRole(),
                "Registration successful! Welcome to the Student Portal."
        );
    }

    /**
     * Authenticates a student or admin and returns a signed JWT.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Student student = studentRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email address or password."));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new BadCredentialsException("Invalid email address or password.");
        }

        // Double check admin role integrity
        if ("ADMIN".equals(student.getRole()) && !normalizedEmail.equalsIgnoreCase(adminEmail.trim())) {
            throw new BadCredentialsException("Invalid email address or password.");
        }

        String token = jwtTokenProvider.generateToken(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getRole()
        );

        return new AuthResponse(
                token,
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getRole(),
                "Login successful. Welcome back, " + student.getName() + "!"
        );
    }
}
