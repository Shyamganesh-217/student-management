package com.studentauth.config;

import com.studentauth.entity.Student;
import com.studentauth.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Initializes and synchronizes the single authorized Administrator account
 * defined in backend environment variables (ADMIN_EMAIL, ADMIN_PASSWORD) on startup.
 */
@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name:System Administrator}")
    private String adminName;

    public AdminInitializer(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            logger.error("ADMIN_EMAIL or ADMIN_PASSWORD is not configured in the environment variables!");
            throw new IllegalStateException("ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment variables.");
        }

        String normalizedEmail = adminEmail.trim().toLowerCase();

        // Ensure any unauthorized accounts claiming ADMIN role are downgraded
        List<Student> allAdmins = studentRepository.findByRoleOrderByCreatedAtDesc("ADMIN");
        for (Student admin : allAdmins) {
            if (!admin.getEmail().equalsIgnoreCase(normalizedEmail)) {
                logger.warn("Downgrading unauthorized admin account '{}' to STUDENT.", admin.getEmail());
                admin.setRole("STUDENT");
                studentRepository.save(admin);
            }
        }

        Optional<Student> existingAdminOpt = studentRepository.findByEmail(normalizedEmail);

        if (existingAdminOpt.isEmpty()) {
            // Create authorized administrator with BCrypt password hash
            Student admin = new Student(
                    adminName,
                    normalizedEmail,
                    passwordEncoder.encode(adminPassword),
                    "ADMIN"
            );
            studentRepository.save(admin);
            logger.info("Authorized Administrator account initialized securely for: {}", normalizedEmail);
        } else {
            Student existingAdmin = existingAdminOpt.get();
            boolean updated = false;

            // Ensure role is ADMIN
            if (!"ADMIN".equals(existingAdmin.getRole())) {
                existingAdmin.setRole("ADMIN");
                updated = true;
            }

            // If admin password in environment variables has changed, update BCrypt hash safely
            if (!passwordEncoder.matches(adminPassword, existingAdmin.getPassword())) {
                existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
                updated = true;
                logger.info("Administrator password synchronized with environment variables.");
            }

            if (updated) {
                studentRepository.save(existingAdmin);
            }
            logger.info("Authorized Administrator verified for: {}", normalizedEmail);
        }
    }
}
