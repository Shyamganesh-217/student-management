package com.studentauth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.studentauth.dto.LoginRequest;
import com.studentauth.dto.RegisterRequest;
import com.studentauth.entity.Student;
import com.studentauth.repository.StudentRepository;
import com.studentauth.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.TestPropertySource(properties = {
        "spring.datasource.password=root"
})
public class AuthSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        // Clear all non-admin students before each test
        studentRepository.findByRoleOrderByCreatedAtDesc("STUDENT")
                .forEach(student -> studentRepository.delete(student));
    }

    @Test
    @DisplayName("Admin account is automatically initialized from environment variables on startup")
    void testAdminInitialization() {
        Student admin = studentRepository.findByEmail("admin@example.com").orElse(null);
        assertNotNull(admin, "Admin account should be initialized");
        assertEquals("ADMIN", admin.getRole());
    }

    @Test
    @DisplayName("Public student registration assigns STUDENT role and hashes password")
    void testStudentRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Alice Smith",
                "alice.smith@university.edu",
                "Password123!",
                "Password123!"
        );

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.email").value("alice.smith@university.edu"))
                .andExpect(jsonPath("$.name").value("Alice Smith"));

        Student saved = studentRepository.findByEmail("alice.smith@university.edu").orElse(null);
        assertNotNull(saved);
        assertEquals("STUDENT", saved.getRole());
        assertNotEquals("Password123!", saved.getPassword(), "Password must be BCrypt hashed");
        assertTrue(saved.getPassword().startsWith("$2a$"), "Password should be BCrypt format");
    }

    @Test
    @DisplayName("Registration rejects mismatched password confirmation")
    void testRegistrationMismatchedPasswords() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Bob Brown",
                "bob.brown@university.edu",
                "Password123!",
                "MismatchedPass123!"
        );

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("do not match")));
    }

    @Test
    @DisplayName("Registration rejects duplicate email addresses")
    void testDuplicateRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Charlie Day",
                "charlie@university.edu",
                "Password123!",
                "Password123!"
        );

        // First registration
        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Duplicate registration attempt
        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Duplicate Email"));
    }

    @Test
    @DisplayName("Admin Login succeeds with configured environment credentials")
    void testAdminLogin() throws Exception {
        LoginRequest login = new LoginRequest("admin@example.com", "Admin@Secure2026!");

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.email").value("admin@example.com"));
    }

    @Test
    @DisplayName("Login with invalid credentials returns HTTP 401")
    void testInvalidLoginCredentials() throws Exception {
        LoginRequest login = new LoginRequest("admin@example.com", "WrongPassword999!");

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("CRITICAL: Student token cannot access Admin APIs and receives HTTP 403 Forbidden")
    void testStudentForbiddenFromAdminApi() throws Exception {
        // Register a student
        RegisterRequest request = new RegisterRequest(
                "David Miller",
                "david.miller@university.edu",
                "Password123!",
                "Password123!"
        );

        String responseJson = mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String studentToken = objectMapper.readTree(responseJson).get("token").asText();

        // Attempt to access /api/admin/students with STUDENT token -> Must return 403 Forbidden
        mockMvc.perform(get("/api/admin/students")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));

        // Attempt to access /api/admin/stats with STUDENT token -> Must return 403 Forbidden
        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request to protected admin endpoint returns HTTP 401 Unauthorized")
    void testUnauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/admin/students"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Admin token can successfully access Admin APIs and view student records")
    void testAdminCanAccessAdminApi() throws Exception {
        // Generate an admin token
        Student admin = studentRepository.findByEmail("admin@example.com").orElseThrow();
        String adminToken = jwtTokenProvider.generateToken(admin.getId(), admin.getName(), admin.getEmail(), "ADMIN");

        mockMvc.perform(get("/api/admin/students")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAdmins").value(1));
    }

    @Test
    @DisplayName("Student can access their own profile via /api/students/me")
    void testStudentCanAccessOwnProfile() throws Exception {
        RegisterRequest request = new RegisterRequest(
                "Emma Watson",
                "emma.watson@university.edu",
                "Password123!",
                "Password123!"
        );

        String responseJson = mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        String studentToken = objectMapper.readTree(responseJson).get("token").asText();

        mockMvc.perform(get("/api/students/me")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Emma Watson"))
                .andExpect(jsonPath("$.email").value("emma.watson@university.edu"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.password").doesNotExist()); // Never expose password
    }
}
