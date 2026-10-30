const API_URL = "/jobs";
const APPS_URL = "/applications";

let adminJobs = [];
let adminApplications = [];
let editingJobId = null;

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAuth();
    loadAdminJobs();
    loadApplications();
});

function checkAdminAuth() {
    const userJson = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    const banner = document.getElementById("unauthorizedBanner");
    const nameDisplay = document.getElementById("adminNameDisplay");

    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user.role === "ADMIN" || user.email === "admin@jobportal.com") {
                if (banner) banner.style.display = "none";
                if (nameDisplay) nameDisplay.textContent = user.fullName || "Administrator";
                return;
            }
        } catch (e) {
            console.error("Auth check parse error:", e);
        }
    }

    // If not authenticated as admin, show warning banner
    if (banner) banner.style.display = "block";
    if (nameDisplay) nameDisplay.textContent = "Guest Mode";
}

function logoutAdmin() {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    showToast("Logged out from admin session.", "info");
    setTimeout(() => {
        window.location.href = "login.html?role=admin";
    }, 800);
}

// ================= LOAD & RENDER JOBS =================
async function loadAdminJobs() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Could not load jobs from server.");

        const jobs = await response.json();
        adminJobs = Array.isArray(jobs) ? jobs : [];

        updateAdminKPIs();
        renderAdminJobsTable(adminJobs);
    } catch (err) {
        console.warn("Backend server not reached. Loading preview catalog for admin:", err);
        adminJobs = [
            {
                id: 1,
                title: "Senior Java & Spring Boot Developer",
                company: "Infosys",
                location: "Bengaluru, Karnataka",
                salary: 1400000,
                category: "Software Development",
                source: "Direct",
                description: "Hands-on engineer with solid experience in Java 21, Spring Boot microservices, Oracle SQL database, and RESTful APIs."
            },
            {
                id: 2,
                title: "Full Stack Engineer (React + Node.js)",
                company: "Tata Consultancy Services (TCS)",
                location: "Hyderabad, Telangana",
                salary: 1250000,
                category: "Web Development",
                source: "LinkedIn",
                description: "Building scalable web applications, responsive user interfaces in React, state management, and backend microservices."
            },
            {
                id: 3,
                title: "Cloud & DevOps Solutions Architect",
                company: "Wipro",
                location: "Pune, Maharashtra",
                salary: 1650000,
                category: "Cloud & DevOps",
                source: "Indeed",
                description: "Designing cloud infrastructure on AWS/Azure, Docker containerization, Kubernetes orchestration, and CI/CD automation pipelines."
            },
            {
                id: 4,
                title: "Lead AI & Data Scientist",
                company: "Accenture",
                location: "Noida, Uttar Pradesh",
                salary: 1800000,
                category: "Data Science",
                source: "Naukri",
                description: "Developing machine learning models, natural language processing pipelines, predictive analytics, and enterprise generative AI solutions."
            }
        ];
        updateAdminKPIs();
        renderAdminJobsTable(adminJobs);
    }
}

function updateAdminKPIs() {
    const totalJobsElem = document.getElementById("kpiTotalJobs");
    const externalJobsElem = document.getElementById("kpiExternalJobs");
    const directJobsElem = document.getElementById("kpiDirectJobs");
    const countTab = document.getElementById("countOpeningsTab");

    const total = adminJobs.length;
    const external = adminJobs.filter(j => j.source && j.source.toLowerCase() !== "direct").length;
    const direct = total - external;

    if (totalJobsElem) totalJobsElem.textContent = total;
    if (externalJobsElem) externalJobsElem.textContent = external;
    if (directJobsElem) directJobsElem.textContent = direct;
    if (countTab) countTab.textContent = total;
}

function renderAdminJobsTable(jobsToRender) {
    const tbody = document.getElementById("adminJobsTableBody");
    if (!tbody) return;

    if (!jobsToRender || jobsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 35px; color: #64748b;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    No job openings found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = jobsToRender.map(job => {
        const source = job.source || "Direct";
        const sourceLower = source.toLowerCase();
        let badgeClass = "direct";
        if (sourceLower.includes("linkedin")) badgeClass = "linkedin";
        else if (sourceLower.includes("indeed")) badgeClass = "indeed";
        else if (sourceLower.includes("naukri")) badgeClass = "naukri";
        else if (sourceLower.includes("glassdoor")) badgeClass = "glassdoor";

        return `
            <tr>
                <td style="font-weight: 600; color: #64748b;">#${escapeHTML(job.id)}</td>
                <td>
                    <strong style="color: #0f172a; font-size: 15px;">${escapeHTML(job.title)}</strong>
                    <div style="font-size: 12px; color: #64748b;">${escapeHTML(job.category || "General")}</div>
                </td>
                <td style="font-weight: 500;">
                    <i class="fa-solid fa-building" style="color: #94a3b8; margin-right: 4px;"></i>
                    ${escapeHTML(job.company)}
                </td>
                <td>
                    <i class="fa-solid fa-location-dot" style="color: #94a3b8; margin-right: 4px;"></i>
                    ${escapeHTML(job.location)}
                </td>
                <td style="font-weight: 600; color: #059669;">
                    ₹${Number(job.salary || 0).toLocaleString("en-IN")}
                </td>
                <td>
                    <span class="source-badge ${badgeClass}">
                        ${escapeHTML(source)}
                    </span>
                    ${job.externalUrl ? `
                        <a href="${escapeHTML(job.externalUrl)}" target="_blank" title="Open external posting" style="margin-left: 4px; color: #1565ff; font-size: 13px;">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    ` : ""}
                </td>
                <td style="text-align: right; white-space: nowrap;">
                    <button type="button" class="action-icon-btn edit" onclick="editAdminJob(${job.id})" title="Edit Opening">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button type="button" class="action-icon-btn delete" onclick="deleteAdminJob(${job.id})" title="Delete Opening">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function filterAdminJobsTable() {
    const query = (document.getElementById("adminTableSearch").value || "").trim().toLowerCase();
    if (!query) {
        renderAdminJobsTable(adminJobs);
        return;
    }

    const filtered = adminJobs.filter(job => {
        const text = [job.title, job.company, job.location, job.category, job.source, job.description].join(" ").toLowerCase();
        return text.includes(query);
    });

    renderAdminJobsTable(filtered);
}

// ================= SAVE / UPDATE JOB (ADMIN) =================
async function handleAdminSaveJob() {
    const idField = document.getElementById("adminJobId");
    const titleField = document.getElementById("adminTitle");
    const companyField = document.getElementById("adminCompany");
    const locationField = document.getElementById("adminLocation");
    const salaryField = document.getElementById("adminSalary");
    const categoryField = document.getElementById("adminCategory");
    const sourceField = document.getElementById("adminSource");
    const externalUrlField = document.getElementById("adminExternalUrl");
    const descriptionField = document.getElementById("adminDescription");

    const title = titleField.value.trim();
    const company = companyField.value.trim();
    const location = locationField.value.trim();
    const salary = parseFloat(salaryField.value);
    const category = categoryField.value.trim();
    const source = sourceField.value.trim();
    const externalUrl = externalUrlField.value.trim();
    const description = descriptionField.value.trim();
    const jobId = idField ? idField.value.trim() : "";

    if (!title || !company || !location || isNaN(salary) || salary <= 0 || !description || description.length < 10) {
        showToast("Please provide all required fields (description must be at least 10 chars).", "error");
        return;
    }

    const jobData = {
        title,
        company,
        location,
        salary,
        category,
        source,
        externalUrl,
        description
    };

    const isEditing = Boolean(jobId);
    const url = isEditing ? `${API_URL}/${encodeURIComponent(jobId)}` : API_URL;

    try {
        const response = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jobData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error((err && err.message) ? err.message : "Failed to save job opening.");
        }

        showToast(isEditing ? "Job opening updated successfully!" : "New job opening published successfully!", "success");
        resetAdminForm();
        await loadAdminJobs();
    } catch (error) {
        console.error("Admin save error:", error);
        showToast(error.message || "Failed to save opening.", "error");
    }
}

function editAdminJob(id) {
    const job = adminJobs.find(j => Number(j.id) === Number(id));
    if (!job) {
        showToast("Job not found.", "error");
        return;
    }

    editingJobId = job.id;
    document.getElementById("adminJobId").value = job.id;
    document.getElementById("adminTitle").value = job.title || "";
    document.getElementById("adminCompany").value = job.company || "";
    document.getElementById("adminLocation").value = job.location || "";
    document.getElementById("adminSalary").value = job.salary ?? "";
    document.getElementById("adminCategory").value = job.category || "Software Development";
    document.getElementById("adminSource").value = job.source || "Direct";
    document.getElementById("adminExternalUrl").value = job.externalUrl || "";
    document.getElementById("adminDescription").value = job.description || "";

    document.getElementById("adminFormHeading").innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: #10b981;"></i> Update Job Opening';
    document.getElementById("adminSaveBtn").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update Opening';
    document.getElementById("adminCancelEditBtn").style.display = "inline-flex";
    document.getElementById("editingBadge").style.display = "inline-block";

    const formSection = document.getElementById("post-job-section");
    if (formSection) formSection.scrollIntoView({ behavior: "smooth" });

    showToast(`Loaded "${job.title}" into the form for editing.`, "info");
}

function resetAdminForm() {
    document.getElementById("adminJobForm").reset();
    document.getElementById("adminJobId").value = "";
    editingJobId = null;

    document.getElementById("adminFormHeading").innerHTML = '<i class="fa-solid fa-plus-circle" style="color: #1565ff;"></i> Post a New Job Opening';
    document.getElementById("adminSaveBtn").innerHTML = '<i class="fa-solid fa-plus"></i> Save Opening';
    document.getElementById("adminCancelEditBtn").style.display = "none";
    document.getElementById("editingBadge").style.display = "none";
}

async function deleteAdminJob(id) {
    const job = adminJobs.find(j => Number(j.id) === Number(id));
    const title = job ? `"${job.title}"` : "this job opening";

    const confirmed = confirm(`Are you sure you want to permanently delete ${title}?`);
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Could not delete job.");

        showToast("Opening removed from portal.", "success");
        if (String(editingJobId) === String(id)) resetAdminForm();
        await loadAdminJobs();
    } catch (err) {
        console.error("Error deleting job:", err);
        showToast("Failed to delete opening.", "error");
    }
}

// ================= APPLICATIONS & RESUMES =================
async function loadApplications() {
    try {
        const response = await fetch(APPS_URL);
        if (!response.ok) throw new Error("Could not load applications.");

        const apps = await response.json();
        adminApplications = Array.isArray(apps) ? apps : [];

        const countAppsElem = document.getElementById("kpiTotalApplications");
        const countAppsTab = document.getElementById("countAppsTab");
        if (countAppsElem) countAppsElem.textContent = adminApplications.length;
        if (countAppsTab) countAppsTab.textContent = adminApplications.length;

        renderApplicationsTable(adminApplications);
    } catch (err) {
        console.warn("Backend server not reached. Loading preview candidate applications:", err);
        adminApplications = [
            {
                id: 1,
                jobTitle: "Senior Java & Spring Boot Developer",
                company: "Infosys",
                applicantName: "Rahul Sharma",
                applicantEmail: "rahul.sharma@example.com",
                applicantPhone: "+91 9876543210",
                resumeFileName: "Rahul_Sharma_Java_Resume.pdf",
                status: "PENDING",
                appliedAt: "2026-10-29T10:30:00"
            },
            {
                id: 2,
                jobTitle: "Lead AI & Data Scientist",
                company: "Accenture",
                applicantName: "Priya Nair",
                applicantEmail: "priya.nair@example.com",
                applicantPhone: "+91 9123456780",
                resumeFileName: "Priya_Nair_DataScience.pdf",
                status: "SHORTLISTED",
                appliedAt: "2026-10-30T14:15:00"
            }
        ];
        const countAppsElem = document.getElementById("kpiTotalApplications");
        const countAppsTab = document.getElementById("countAppsTab");
        if (countAppsElem) countAppsElem.textContent = adminApplications.length;
        if (countAppsTab) countAppsTab.textContent = adminApplications.length;
        renderApplicationsTable(adminApplications);
    }
}

function renderApplicationsTable(apps) {
    const tbody = document.getElementById("adminApplicationsTableBody");
    if (!tbody) return;

    if (!apps || apps.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 35px; color: #64748b;">
                    <i class="fa-solid fa-folder-open" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    No candidate applications submitted yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = apps.map(app => {
        const status = (app.status || "SUBMITTED").toLowerCase();
        let badgeClass = "submitted";
        if (status.includes("shortlist")) badgeClass = "shortlisted";
        else if (status.includes("reject")) badgeClass = "rejected";
        else if (status.includes("review")) badgeClass = "reviewed";

        const formattedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        }) : "Recent";

        return `
            <tr>
                <td style="font-weight: 600; color: #64748b;">#APP-${escapeHTML(app.id)}</td>
                <td>
                    <strong style="color: #0f172a;">${escapeHTML(app.applicantName)}</strong>
                    <div style="font-size: 12px; color: #64748b;">
                        <i class="fa-solid fa-envelope"></i> ${escapeHTML(app.applicantEmail)}
                    </div>
                    <div style="font-size: 12px; color: #64748b;">
                        <i class="fa-solid fa-phone"></i> ${escapeHTML(app.applicantPhone)}
                    </div>
                </td>
                <td>
                    <strong style="color: #1565ff;">${escapeHTML(app.jobTitle || "Direct Role")}</strong>
                    <div style="font-size: 12px; color: #64748b;">${escapeHTML(app.company || "Employer")}</div>
                </td>
                <td>
                    <span style="display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; color: #334155;">
                        <i class="fa-solid fa-file-pdf" style="color: #ef4444;"></i>
                        ${escapeHTML(app.resumeFileName || "resume_document.pdf")}
                    </span>
                    ${app.coverNote ? `
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(app.coverNote)}">
                            <i class="fa-solid fa-quote-left" style="font-size: 10px;"></i> ${escapeHTML(app.coverNote)}
                        </div>
                    ` : ""}
                </td>
                <td style="font-size: 13px; color: #64748b;">
                    ${escapeHTML(formattedDate)}
                </td>
                <td>
                    <span class="status-badge ${badgeClass}">
                        ${escapeHTML(app.status || "SUBMITTED")}
                    </span>
                </td>
                <td style="text-align: right; white-space: nowrap;">
                    <button type="button" class="action-icon-btn shortlist" onclick="updateAppStatus(${app.id}, 'SHORTLISTED')" title="Shortlist Candidate">
                        <i class="fa-solid fa-check"></i> Shortlist
                    </button>
                    <button type="button" class="action-icon-btn delete" onclick="updateAppStatus(${app.id}, 'REJECTED')" title="Reject Application">
                        <i class="fa-solid fa-xmark"></i> Reject
                    </button>
                    <button type="button" class="action-icon-btn delete" onclick="deleteApplicationRow(${app.id})" title="Delete Application">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

async function updateAppStatus(id, newStatus) {
    try {
        const response = await fetch(`${APPS_URL}/${encodeURIComponent(id)}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (!response.ok) throw new Error("Could not update status.");
        showToast(`Candidate status updated to ${newStatus}.`, "success");
        await loadApplications();
    } catch (err) {
        console.error("Status update error:", err);
        showToast("Failed to update candidate status.", "error");
    }
}

async function deleteApplicationRow(id) {
    if (!confirm("Are you sure you want to remove this application record?")) return;
    try {
        const response = await fetch(`${APPS_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Could not delete application.");
        showToast("Application record deleted.", "success");
        await loadApplications();
    } catch (err) {
        console.error("Delete app error:", err);
        showToast("Failed to delete application.", "error");
    }
}

// ================= TAB SWITCHING =================
function switchAdminTab(tab) {
    const tabOpenings = document.getElementById("manage-jobs-section");
    const tabApps = document.getElementById("applications-section");
    const btnOpenings = document.getElementById("tabOpeningsBtn");
    const btnApps = document.getElementById("tabAppsBtn");

    if (tab === "applications") {
        tabOpenings.style.display = "none";
        tabApps.style.display = "block";
        btnApps.classList.add("active");
        btnOpenings.classList.remove("active");
        loadApplications();
    } else {
        tabApps.style.display = "none";
        tabOpenings.style.display = "block";
        btnOpenings.classList.add("active");
        btnApps.classList.remove("active");
    }
}

// ================= UTILITIES =================
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showToast(message, type = "info") {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(() => {
        toast.className = "toast";
    }, 3500);
}
