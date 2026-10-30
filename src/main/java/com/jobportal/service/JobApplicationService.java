package com.jobportal.service;

import com.jobportal.entity.JobApplication;
import com.jobportal.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class JobApplicationService {

    @Autowired
    private JobApplicationRepository applicationRepository;

    public JobApplication saveApplication(JobApplication application) {
        if (application.getAppliedAt() == null) {
            application.setAppliedAt(LocalDateTime.now());
        }
        if (application.getStatus() == null || application.getStatus().trim().isEmpty()) {
            application.setStatus("SUBMITTED");
        }
        return applicationRepository.save(application);
    }

    public List<JobApplication> getAllApplications() {
        return applicationRepository.findAllByOrderByAppliedAtDesc();
    }

    public JobApplication getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Application not found with id: " + id));
    }

    public JobApplication updateStatus(Long id, String status) {
        JobApplication application = getApplicationById(id);
        application.setStatus(status);
        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        JobApplication application = getApplicationById(id);
        applicationRepository.delete(application);
    }
}
