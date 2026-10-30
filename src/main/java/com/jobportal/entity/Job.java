package com.jobportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "JOBS")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "job_seq")
    @SequenceGenerator(
            name = "job_seq",
            sequenceName = "JOB_SEQ",
            allocationSize = 1
    )
    private Long id;

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Location is required")
    private String location;

    @Positive(message = "Salary must be greater than zero")
    private Double salary;

    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters")
    @Column(length = 1000)
    private String description;

    @Column(name = "SOURCE")
    private String source = "Direct"; // Direct, LinkedIn, Indeed, Naukri, Glassdoor

    @Column(name = "EXTERNAL_URL")
    private String externalUrl;

    @Column(name = "CATEGORY")
    private String category = "Software Development";

    public Job() {
    }

    public Job(Long id, String title, String company,
               String location, Double salary, String description) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.salary = salary;
        this.description = description;
        this.source = "Direct";
    }

    public Job(Long id, String title, String company,
               String location, Double salary, String description,
               String source, String externalUrl, String category) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.location = location;
        this.salary = salary;
        this.description = description;
        this.source = (source != null && !source.trim().isEmpty()) ? source : "Direct";
        this.externalUrl = externalUrl;
        this.category = (category != null && !category.trim().isEmpty()) ? category : "Software Development";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getSalary() {
        return salary;
    }

    public void setSalary(Double salary) {
        this.salary = salary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSource() {
        return source != null ? source : "Direct";
    }

    public void setSource(String source) {
        this.source = (source != null && !source.trim().isEmpty()) ? source : "Direct";
    }

    public String getExternalUrl() {
        return externalUrl;
    }

    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }

    public String getCategory() {
        return category != null ? category : "Software Development";
    }

    public void setCategory(String category) {
        this.category = (category != null && !category.trim().isEmpty()) ? category : "Software Development";
    }
}
