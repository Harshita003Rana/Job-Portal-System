package com.jobportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "JOB_APPLICATIONS")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "app_seq")
    @SequenceGenerator(
            name = "app_seq",
            sequenceName = "APP_SEQ",
            allocationSize = 1
    )
    private Long id;

    @Column(name = "JOB_ID")
    private Long jobId;

    @Column(name = "JOB_TITLE")
    private String jobTitle;

    @Column(name = "COMPANY")
    private String company;

    @NotBlank(message = "Applicant name is required")
    @Column(name = "APPLICANT_NAME", nullable = false)
    private String applicantName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @Column(name = "APPLICANT_EMAIL", nullable = false)
    private String applicantEmail;

    @NotBlank(message = "Phone number is required")
    @Column(name = "APPLICANT_PHONE", nullable = false)
    private String applicantPhone;

    @Column(name = "RESUME_FILE_NAME")
    private String resumeFileName;

    @Column(name = "COVER_NOTE", length = 1000)
    private String coverNote;

    @Column(name = "STATUS")
    private String status = "SUBMITTED"; // SUBMITTED, REVIEWED, SHORTLISTED, REJECTED

    @Column(name = "APPLIED_AT")
    private LocalDateTime appliedAt;

    public JobApplication() {
        this.appliedAt = LocalDateTime.now();
        this.status = "SUBMITTED";
    }

    public JobApplication(Long id, Long jobId, String jobTitle, String company,
                          String applicantName, String applicantEmail, String applicantPhone,
                          String resumeFileName, String coverNote) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.company = company;
        this.applicantName = applicantName;
        this.applicantEmail = applicantEmail;
        this.applicantPhone = applicantPhone;
        this.resumeFileName = resumeFileName;
        this.coverNote = coverNote;
        this.status = "SUBMITTED";
        this.appliedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getApplicantEmail() {
        return applicantEmail;
    }

    public void setApplicantEmail(String applicantEmail) {
        this.applicantEmail = applicantEmail;
    }

    public String getApplicantPhone() {
        return applicantPhone;
    }

    public void setApplicantPhone(String applicantPhone) {
        this.applicantPhone = applicantPhone;
    }

    public String getResumeFileName() {
        return resumeFileName;
    }

    public void setResumeFileName(String resumeFileName) {
        this.resumeFileName = resumeFileName;
    }

    public String getCoverNote() {
        return coverNote;
    }

    public void setCoverNote(String coverNote) {
        this.coverNote = coverNote;
    }

    public String getStatus() {
        return status != null ? status : "SUBMITTED";
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt != null ? appliedAt : LocalDateTime.now();
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
}
