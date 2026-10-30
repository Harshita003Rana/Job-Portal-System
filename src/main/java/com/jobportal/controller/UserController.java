package com.jobportal.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jobportal.entity.User;
import com.jobportal.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        User savedUser = userService.registerUser(user);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Registration Successful!");
        response.put("userId", savedUser.getId());
        response.put("fullName", savedUser.getFullName());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // LOGIN USER (Supports email or admin username)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        if (loginRequest == null) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "FAILED");
            errorResponse.put("message", "Request body cannot be empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        String identifier = loginRequest.get("email");
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = loginRequest.get("username");
        }
        if (identifier == null || identifier.trim().isEmpty()) {
            identifier = loginRequest.get("adminName");
        }

        String password = loginRequest.get("password");

        if (identifier == null || identifier.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "FAILED");
            errorResponse.put("message", "Please enter your username/email and password.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }

        User loggedInUser = userService.loginUser(identifier, password);

        if (loggedInUser != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Login Successful");
            response.put("userId", loggedInUser.getId());
            response.put("fullName", loggedInUser.getFullName());
            response.put("email", loggedInUser.getEmail());
            response.put("role", loggedInUser.getRole() != null ? loggedInUser.getRole() : "USER");

            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("status", "FAILED");
            response.put("message", "Invalid username/email or password.");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
}
