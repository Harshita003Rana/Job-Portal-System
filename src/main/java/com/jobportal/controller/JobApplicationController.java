package com.jobportal.controller;

import com.jobportal.entity.JobApplication;
import com.jobportal.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
@CrossOrigin(origins = "*")
public class JobApplicationController {

    @Autowired
    private JobApplicationService applicationService;

    // Submit a new application
    @PostMapping
    public ResponseEntity<?> submitApplication(@Valid @RequestBody JobApplication application) {
        JobApplication saved = applicationService.saveApplication(application);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Application submitted successfully!");
        response.put("applicationId", saved.getId());
        response.put("jobTitle", saved.getJobTitle());
        response.put("applicantName", saved.getApplicantName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get all applications (Admin dashboard)
    @GetMapping
    public ResponseEntity<List<JobApplication>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }

    // Get application by ID
    @GetMapping("/{id}")
    public ResponseEntity<JobApplication> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }

    // Update status (e.g., Shortlisted, Rejected, Reviewed)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusBody) {
        String newStatus = statusBody.getOrDefault("status", "REVIEWED");
        JobApplication updated = applicationService.updateStatus(id, newStatus);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Application status updated to " + newStatus);
        response.put("application", updated);
        return ResponseEntity.ok(response);
    }

    // Delete application
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteApplication(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        Map<String, String> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("message", "Application deleted successfully!");
        return ResponseEntity.ok(response);
    }
}
