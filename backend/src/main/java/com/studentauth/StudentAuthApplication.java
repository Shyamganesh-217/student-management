package com.studentauth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Student Authentication and Management System.
 * Configured via standard Spring application.properties.
 */
@SpringBootApplication
public class StudentAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudentAuthApplication.class, args);
    }
}
