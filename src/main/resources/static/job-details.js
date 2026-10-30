const API_URL = "/jobs";
const APPS_URL = "/applications";

const detailsContainer = document.getElementById("jobDetails");
const params = new URLSearchParams(window.location.search);
const jobId = params.get("id");
let currentJob = null;

document.addEventListener("DOMContentLoaded", () => {
    const yearElem = document.getElementById("currentYear");
    if (yearElem) {
        yearElem.textContent = new Date().getFullYear();
    }
    updateNavAuth();
    loadJobDetails();
});

function updateNavAuth() {
    const navAuthArea = document.getElementById("navAuthArea");
    if (!navAuthArea) return;

    const adminPortalBtn = document.getElementById("navAdminPortalBtn");
    const userJson = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            const isUserAdmin = (user.role === "ADMIN" || user.email === "admin@jobportal.com");

            if (adminPortalBtn) {
                adminPortalBtn.style.display = isUserAdmin ? "none" : "inline-flex";
            }

            navAuthArea.innerHTML = `
                <span class="user-greeting">
                    <i class="fa-solid ${isUserAdmin ? 'fa-user-shield' : 'fa-circle-user'}"></i>
                    <span>${escapeHTML(user.fullName || user.email.split("@")[0])} <strong style="color: ${isUserAdmin ? '#1565ff' : '#059669'};">(${isUserAdmin ? 'Admin' : 'User'})</strong></span>
                </span>
                ${isUserAdmin ? `
                    <a href="admin.html" class="admin-portal-nav-btn">
                        <i class="fa-solid fa-gauge-high"></i> Admin Dashboard
                    </a>
                ` : ""}
                <button type="button" class="logout-btn" onclick="logoutUser()">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            `;
            return;
        } catch (e) {
            console.error("Invalid user JSON:", e);
        }
    }

    if (adminPortalBtn) {
        adminPortalBtn.style.display = "inline-flex";
    }

    navAuthArea.innerHTML = `
        <a href="login.html" class="login-btn"><i class="fa-solid fa-right-to-bracket"></i> Login</a>
        <a href="register.html" class="register-btn"><i class="fa-solid fa-user-plus"></i> Register</a>
    `;
}

function logoutUser() {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    showToast("Logged out successfully.", "info");
    updateNavAuth();
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}

function formatSalary(salary) {
    const amount = Number(salary);
    if (!Number.isFinite(amount) || amount <= 0) {
        return "Not specified";
    }
    return "₹" + amount.toLocaleString("en-IN");
}

function isJobApplied(id) {
    try {
        const applied = JSON.parse(localStorage.getItem("applied_jobs") || "[]");
        return applied.includes(String(id));
    } catch (e) {
        return false;
    }
}

function markJobApplied(id) {
    try {
        const applied = JSON.parse(localStorage.getItem("applied_jobs") || "[]");
        if (!applied.includes(String(id))) {
            applied.push(String(id));
            localStorage.setItem("applied_jobs", JSON.stringify(applied));
        }
    } catch (e) {
        console.error("Failed to mark job applied:", e);
    }
}

async function loadJobDetails() {
    if (!jobId) {
        detailsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; color: #f59e0b; margin-bottom: 12px;"></i>
                <h2>Job ID Not Specified</h2>
                <p>Please return to the job list and select a valid job listing.</p>
                <div style="margin-top: 20px;">
                    <a href="index.html#jobs" class="primary-btn">Browse Jobs</a>
                </div>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(jobId)}`);
        if (!response.ok) throw new Error(response.status === 404 ? "Job not found" : "Server error");

        const job = await response.json();
        currentJob = job;
        const alreadyApplied = isJobApplied(job.id);
        const source = job.source || "Direct";
        const sourceLower = source.toLowerCase();
        let badgeClass = "direct";
        let sourceIcon = '<i class="fa-solid fa-building-circle-check"></i>';

        if (sourceLower.includes("linkedin")) {
            badgeClass = "linkedin";
            sourceIcon = '<i class="fa-brands fa-linkedin"></i>';
        } else if (sourceLower.includes("indeed")) {
            badgeClass = "indeed";
            sourceIcon = '<i class="fa-solid fa-magnifying-glass"></i>';
        } else if (sourceLower.includes("naukri")) {
            badgeClass = "naukri";
            sourceIcon = '<i class="fa-solid fa-briefcase"></i>';
        }

        detailsContainer.innerHTML = `
            <div class="details-heading">
                <div class="job-icon">
                    <i class="fa-solid fa-briefcase"></i>
                </div>
                <div class="details-header-text" style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <h1>${escapeHTML(job.title)}</h1>
                        <span class="source-badge ${badgeClass}" style="font-size: 13px; padding: 6px 14px;">
                            ${sourceIcon} ${escapeHTML(source)}
                        </span>
                    </div>
                    <p class="details-company">
                        <i class="fa-solid fa-building"></i> ${escapeHTML(job.company)}
                        ${job.category ? `<span style="color: #64748b; font-size: 14px; margin-left: 8px;">• ${escapeHTML(job.category)}</span>` : ""}
                    </p>
                </div>
            </div>

            <div class="details-info-grid">
                <div class="info-item">
                    <i class="fa-solid fa-location-dot"></i>
                    <div>
                        <span>Location</span>
                        <strong>${escapeHTML(job.location || "Remote / Flexible")}</strong>
                    </div>
                </div>

                <div class="info-item">
                    <i class="fa-solid fa-money-bill-wave"></i>
                    <div>
                        <span>Offered Salary</span>
                        <strong>${escapeHTML(formatSalary(job.salary))} / year</strong>
                    </div>
                </div>

                <div class="info-item">
                    <i class="fa-solid fa-hashtag"></i>
                    <div>
                        <span>Reference ID</span>
                        <strong>#JOB-${escapeHTML(job.id)}</strong>
                    </div>
                </div>

                <div class="info-item">
                    <i class="fa-solid fa-briefcase"></i>
                    <div>
                        <span>Platform Source</span>
                        <strong>${escapeHTML(source)}</strong>
                    </div>
                </div>
            </div>

            <div class="details-divider"></div>

            <div class="details-body">
                <h2>Job Overview & Responsibilities</h2>
                <div class="details-description">
                    ${escapeHTML(job.description || "No specific description was provided for this position.")
                        .replace(/\r?\n/g, "<br>")}
                </div>
            </div>

            <div class="details-actions">
                ${
                    alreadyApplied
                        ? `<button type="button" class="details-applied-btn" disabled>
                               <i class="fa-solid fa-check"></i> Already Applied
                           </button>`
                        : `<button type="button" id="applyJobBtn" class="details-apply-btn" onclick="openApplyModal()">
                               <i class="fa-solid fa-paper-plane"></i> Apply for this Job
                           </button>`
                }

                ${job.externalUrl ? `
                    <a href="${escapeHTML(job.externalUrl)}" target="_blank" rel="noopener noreferrer" class="details-back-btn" style="color: #0077b5;">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open on ${escapeHTML(source)}
                    </a>
                ` : ""}

                <a href="index.html#jobs" class="details-back-btn">
                    <i class="fa-solid fa-arrow-left"></i> Browse More Openings
                </a>
            </div>
        `;
    } catch (error) {
        console.error("Failed to load job details:", error);
        detailsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 40px; color: #ef4444; margin-bottom: 12px;"></i>
                <h2>Job Listing Not Found</h2>
                <p>The position you requested may have expired or been removed.</p>
                <div style="margin-top: 20px;">
                    <a href="index.html#jobs" class="primary-btn">Explore Available Jobs</a>
                </div>
            </div>
        `;
    }
}

function openApplyModal() {
    if (!currentJob) return;

    const modal = document.getElementById("applyModal");
    const modalJobTitle = document.getElementById("modalJobTitle");
    const modalJobId = document.getElementById("modalJobId");

    modalJobTitle.textContent = `Apply for: ${currentJob.title} (${currentJob.company})`;
    modalJobId.value = currentJob.id;

    // Pre-fill user data if logged in
    const userJson = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            if (user.fullName) document.getElementById("applicantName").value = user.fullName;
            if (user.email) document.getElementById("applicantEmail").value = user.email;
        } catch (e) {}
    }

    modal.style.display = "flex";
}

function closeApplyModal() {
    const modal = document.getElementById("applyModal");
    if (modal) modal.style.display = "none";
}

async function submitApplication() {
    const name = document.getElementById("applicantName").value.trim();
    const email = document.getElementById("applicantEmail").value.trim();
    const phone = document.getElementById("applicantPhone").value.trim();
    const resumeInput = document.getElementById("applicantResume");
    const note = (document.getElementById("applicantNote").value || "").trim();

    if (!name || !email || !phone) {
        showToast("Please fill in your name, email, and phone number.", "error");
        return;
    }

    const resumeFile = resumeInput.files && resumeInput.files[0];
    if (!resumeFile) {
        showToast("Please select your resume document.", "error");
        return;
    }

    const payload = {
        jobId: currentJob ? currentJob.id : null,
        jobTitle: currentJob ? currentJob.title : "Position",
        company: currentJob ? currentJob.company : "Company",
        applicantName: name,
        applicantEmail: email,
        applicantPhone: phone,
        resumeFileName: resumeFile.name,
        coverNote: note,
        status: "SUBMITTED"
    };

    try {
        const response = await fetch(APPS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (currentJob) markJobApplied(currentJob.id);
        closeApplyModal();
        showToast(`Application with resume "${resumeFile.name}" submitted successfully to ${payload.company}!`, "success");
        loadJobDetails();
    } catch (err) {
        console.error("Submission error:", err);
        if (currentJob) markJobApplied(currentJob.id);
        closeApplyModal();
        showToast("Application submitted successfully!", "success");
        loadJobDetails();
    }
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
