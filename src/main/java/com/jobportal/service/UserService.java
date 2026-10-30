package com.jobportal.service;

import java.util.List;
import java.util.Optional;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void initDefaultAdmin() {
        try {
            String adminEmail = "admin@jobportal.com";
            if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
                User admin = new User(
                    null,
                    "System Administrator",
                    adminEmail,
                    "admin123",
                    "ADMIN"
                );
                userRepository.save(admin);
            }
        } catch (Exception e) {
            System.err.println("Default admin user initialization notice: " + e.getMessage());
        }
    }

    // Register User
    public User registerUser(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User details cannot be empty.");
        }

        if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }

        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }

        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        String normalizedEmail = user.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with email '" + normalizedEmail + "' already exists.");
        }

        user.setFullName(user.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(user.getPassword().trim());

        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        } else {
            user.setRole(user.getRole().trim().toUpperCase());
        }

        return userRepository.save(user);
    }

    // Login User (supports login by Email or Admin Username)
    public User loginUser(String identifier, String password) {
        if (identifier == null || password == null) {
            return null;
        }

        String cleanId = identifier.trim().toLowerCase();
        String cleanPassword = password.trim();

        // 1. Guaranteed Master Admin authentication
        // Accepts admin name: "admin", "administrator", "system", "admin@jobportal.com"
        // Accepts password: "admin", "admin123", "Admin@123", "Harshita@123"
        boolean isAdminName = cleanId.equals("admin")
                           || cleanId.equals("administrator")
                           || cleanId.equals("system")
                           || cleanId.equals("admin@jobportal.com")
                           || cleanId.equals("system administrator");

        boolean isAdminPass = cleanPassword.equals("admin")
                           || cleanPassword.equals("admin123")
                           || cleanPassword.equalsIgnoreCase("admin@123")
                           || cleanPassword.equals("Harshita@123");

        if (isAdminName && isAdminPass) {
            User guaranteedAdmin = new User(1L, "System Administrator", "admin@jobportal.com", cleanPassword, "ADMIN");
            try {
                Optional<User> existing = userRepository.findByEmailIgnoreCase("admin@jobportal.com");
                if (existing.isPresent()) {
                    User u = existing.get();
                    u.setRole("ADMIN");
                    return userRepository.save(u);
                } else {
                    return userRepository.save(guaranteedAdmin);
                }
            } catch (Exception e) {
                // If DB write fails, return guaranteed admin object in memory
                return guaranteedAdmin;
            }
        }

        // 2. Lookup by Email in Database
        Optional<User> userByEmail = userRepository.findByEmailIgnoreCase(cleanId);
        if (userByEmail.isPresent()) {
            User user = userByEmail.get();
            if (user.getPassword() != null && user.getPassword().trim().equals(cleanPassword)) {
                return user;
            }
        }

        // 3. Lookup by Full Name in Database
        List<User> usersByName = userRepository.findAllByFullNameIgnoreCase(identifier.trim());
        for (User u : usersByName) {
            if (u.getPassword() != null && u.getPassword().trim().equals(cleanPassword)) {
                return u;
            }
        }

        // 4. Fallback search by legacy email records
        List<User> users = userRepository.findAllByEmail(identifier.trim());
        for (User u : users) {
            if (u.getPassword() != null && u.getPassword().trim().equals(cleanPassword)) {
                return u;
            }
        }

        return null;
    }
}
