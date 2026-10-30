package com.jobportal.service;

import com.jobportal.entity.Job;
import com.jobportal.repository.JobRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @PostConstruct
    public void initSampleJobs() {
        try {
            if (jobRepository.count() == 0) {
                List<Job> initialJobs = Arrays.asList(
                    new Job(null, "Senior Java Developer", "Infosys", "Bengaluru, Karnataka", 1400000.0,
                            "Looking for an experienced Java and Spring Boot engineer with strong microservices and REST API skills.",
                            "Direct", "", "Software Development"),
                    new Job(null, "Full Stack Engineer (React & Java)", "TCS", "Hyderabad, Telangana", 1250000.0,
                            "Build modern responsive web applications using React, JavaScript, Spring Boot, and Oracle Database.",
                            "Direct", "", "Web Development"),
                    new Job(null, "Cloud DevOps Architect", "Wipro", "Pune, Maharashtra", 1800000.0,
                            "Design and manage cloud infrastructure using AWS, Docker, Kubernetes, Terraform, and CI/CD pipelines.",
                            "Direct", "", "Cloud & DevOps"),
                    new Job(null, "Data Scientist & AI Specialist", "Google", "Bengaluru, Karnataka", 2800000.0,
                            "Lead machine learning model development with Python, TensorFlow, SQL, and big data pipelines for AI search solutions.",
                            "LinkedIn", "https://www.linkedin.com/jobs/view/google-data-scientist", "Data Science"),
                    new Job(null, "Frontend Specialist (React / Next.js)", "Netflix", "Remote, India", 2600000.0,
                            "Craft high-performance streaming user interfaces using React, TypeScript, GraphQL, CSS architectures, and modern browser standards.",
                            "Indeed", "https://www.indeed.com/viewjob?jk=netflix-frontend", "Web Development"),
                    new Job(null, "Senior Database Administrator (Oracle)", "Accenture", "Noida, Uttar Pradesh", 1500000.0,
                            "Manage high-availability Oracle Enterprise databases, PL/SQL optimization, backup strategies, and enterprise migrations.",
                            "Naukri", "https://www.naukri.com/job-listings-oracle-dba-accenture", "Database Management"),
                    new Job(null, "Product Designer (UI / UX)", "Swiggy", "Bengaluru, Karnataka", 1600000.0,
                            "Design intuitive consumer mobile experiences using Figma, design systems, usability testing, and cross-functional user research.",
                            "LinkedIn", "https://www.linkedin.com/jobs/view/swiggy-product-designer", "UI / UX Design"),
                    new Job(null, "Cyber Security Analyst", "HCLTech", "Chennai, Tamil Nadu", 1300000.0,
                            "Monitor enterprise threat vectors, vulnerability assessment, SIEM security logs, and compliance protocols.",
                            "Indeed", "https://www.indeed.com/viewjob?jk=hcl-cyber-security", "Cyber Security")
                );
                jobRepository.saveAll(initialJobs);
            }
        } catch (Exception e) {
            // Non-critical if table is still creating or readonly
            System.err.println("Sample jobs initialization info: " + e.getMessage());
        }
    }

    // SAVE
    public Job saveJob(Job job) {
        if (job.getSource() == null || job.getSource().trim().isEmpty()) {
            job.setSource("Direct");
        }
        if (job.getCategory() == null || job.getCategory().trim().isEmpty()) {
            job.setCategory("Software Development");
        }
        return jobRepository.save(job);
    }

    // GET ALL
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // GET BY ID
    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Job not found with id: " + id));
    }

    // UPDATE
    public Job updateJob(Long id, Job jobDetails) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Job not found with id: " + id));

        job.setTitle(jobDetails.getTitle());
        job.setCompany(jobDetails.getCompany());
        job.setLocation(jobDetails.getLocation());
        job.setSalary(jobDetails.getSalary());
        job.setDescription(jobDetails.getDescription());

        if (jobDetails.getSource() != null && !jobDetails.getSource().trim().isEmpty()) {
            job.setSource(jobDetails.getSource());
        }
        if (jobDetails.getExternalUrl() != null) {
            job.setExternalUrl(jobDetails.getExternalUrl());
        }
        if (jobDetails.getCategory() != null && !jobDetails.getCategory().trim().isEmpty()) {
            job.setCategory(jobDetails.getCategory());
        }

        return jobRepository.save(job);
    }

    // DELETE
    public void deleteJob(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Job not found with id: " + id));

        jobRepository.delete(job);
    }
}
