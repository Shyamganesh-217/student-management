package com.studentauth.repository;

import com.studentauth.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for Student entities.
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Student> findByRoleOrderByCreatedAtDesc(String role);

    long countByRole(String role);

    @Query("SELECT s FROM Student s WHERE s.role = :role AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY s.createdAt DESC")
    List<Student> searchByRoleAndQuery(@Param("role") String role, @Param("query") String query);
}
