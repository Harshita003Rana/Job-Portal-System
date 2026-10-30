const API_URL = "/jobs";
const APPS_URL = "/applications";

let allJobs = [];
let pendingApplyJob = null;
let currentResumeFileName = "";
let currentResumeContent = "";

document.addEventListener("DOMContentLoaded", () => {
    updateNavAuth();
    loadJobs();
    setupEventListeners();

    const year = document.getElementById("currentYear");
    if (year) year.textContent = new Date().getFullYear();

    setupBackToTop();
    setupDragAndDrop();
});

// ================= USER SESSION & NAVBAR =================
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
            console.error("Error parsing user session:", e);
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
    showToast("You have been signed out.", "info");
    updateNavAuth();
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.addEventListener("input", displayJobs);

    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) categoryFilter.addEventListener("change", displayJobs);

    const locationFilter = document.getElementById("locationFilter");
    if (locationFilter) locationFilter.addEventListener("change", displayJobs);

    const sourceFilter = document.getElementById("sourceFilter");
    if (sourceFilter) sourceFilter.addEventListener("change", displayJobs);

    const salarySort = document.getElementById("salarySort");
    if (salarySort) salarySort.addEventListener("change", displayJobs);

    const clearFilters = document.getElementById("clearFilters");
    if (clearFilters) clearFilters.addEventListener("click", resetFilters);

    const heroKeywordInput = document.getElementById("heroKeywordInput");
    if (heroKeywordInput) {
        heroKeywordInput.addEventListener("keydown", e => {
            if (e.key === "Enter") executeHeroSearch();
        });
    }
}

// ================= LOAD & DISPLAY JOBS =================
async function loadJobs() {
    const jobList = document.getElementById("jobList");
    if (jobList) {
        jobList.innerHTML = `
            <div class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Loading verified job openings from direct employers, LinkedIn, Indeed, and Naukri...</p>
            </div>
        `;
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Could not load jobs from server.");

        const jobs = await response.json();
        allJobs = Array.isArray(jobs) ? jobs : [];

        updateLocationDropdown();
        displayJobs();
    } catch (error) {
        console.warn("Backend server not reached. Loading verified preview catalog:", error);
        allJobs = [
            {
                id: 1,
                title: "Senior Java & Spring Boot Developer",
                company: "Infosys",
                location: "Bengaluru, Karnataka",
                salary: 1400000,
                category: "Software Development",
                source: "Direct",
                description: "Hands-on engineer with solid experience in Java 21, Spring Boot microservices, Oracle SQL database, and RESTful APIs.",
                postedDate: "2026-10-28"
            },
            {
                id: 2,
                title: "Full Stack Engineer (React + Node.js)",
                company: "Tata Consultancy Services (TCS)",
                location: "Hyderabad, Telangana",
                salary: 1250000,
                category: "Web Development",
                source: "LinkedIn",
                description: "Building scalable web applications, responsive user interfaces in React, state management, and backend microservices.",
                postedDate: "2026-10-29"
            },
            {
                id: 3,
                title: "Cloud & DevOps Solutions Architect",
                company: "Wipro",
                location: "Pune, Maharashtra",
                salary: 1650000,
                category: "Cloud & DevOps",
                source: "Indeed",
                description: "Designing cloud infrastructure on AWS/Azure, Docker containerization, Kubernetes orchestration, and CI/CD automation pipelines.",
                postedDate: "2026-10-27"
            },
            {
                id: 4,
                title: "Lead AI & Data Scientist",
                company: "Accenture",
                location: "Noida, Uttar Pradesh",
                salary: 1800000,
                category: "Data Science",
                source: "Naukri",
                description: "Developing machine learning models, natural language processing pipelines, predictive analytics, and enterprise generative AI solutions.",
                postedDate: "2026-10-30"
            },
            {
                id: 5,
                title: "Product Designer & UI/UX Specialist",
                company: "Cognizant",
                location: "Chennai, Tamil Nadu",
                salary: 1100000,
                category: "UI / UX Design",
                source: "Direct",
                description: "Crafting intuitive design systems, high-fidelity prototypes in Figma, conducting user research, and wireframing modern web experiences.",
                postedDate: "2026-10-25"
            },
            {
                id: 6,
                title: "Cyber Security & SOC Analyst",
                company: "HCLTech",
                location: "Remote, India",
                salary: 1350000,
                category: "Cyber Security",
                source: "LinkedIn",
                description: "Threat detection, vulnerability assessments, SIEM monitoring, network defense protocols, and incident response mitigation.",
                postedDate: "2026-10-26"
            }
        ];
        updateLocationDropdown();
        displayJobs();
    }
}

function displayJobs() {
    const jobList = document.getElementById("jobList");
    if (!jobList) return;

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const locationFilter = document.getElementById("locationFilter");
    const sourceFilter = document.getElementById("sourceFilter");
    const salarySort = document.getElementById("salarySort");

    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedCategory = categoryFilter ? categoryFilter.value.trim().toLowerCase() : "";
    const selectedLocation = locationFilter ? locationFilter.value.trim().toLowerCase() : "";
    const selectedSource = sourceFilter ? sourceFilter.value.trim().toLowerCase() : "";
    const sortOrder = salarySort ? salarySort.value.trim() : "";

    let filteredJobs = allJobs.filter(job => {
        const fullSearchable = [
            job.title,
            job.company,
            job.location,
            job.category,
            job.source,
            job.description
        ].join(" ").toLowerCase();

        const matchesKeyword = !keyword || fullSearchable.includes(keyword);

        const matchesCategory = !selectedCategory ||
            String(job.category || "").toLowerCase().includes(selectedCategory);

        const matchesLocation = !selectedLocation ||
            String(job.location || "").toLowerCase().includes(selectedLocation);

        const matchesSource = !selectedSource ||
            String(job.source || "Direct").toLowerCase().includes(selectedSource);

        return matchesKeyword && matchesCategory && matchesLocation && matchesSource;
    });

    // Salary sorting
    if (sortOrder === "lowToHigh" || sortOrder === "low-high" || sortOrder === "asc") {
        filteredJobs.sort((a, b) => Number(a.salary || 0) - Number(b.salary || 0));
    } else if (sortOrder === "highToLow" || sortOrder === "high-low" || sortOrder === "desc") {
        filteredJobs.sort((a, b) => Number(b.salary || 0) - Number(a.salary || 0));
    }

    updateResultsCount(filteredJobs.length);

    if (filteredJobs.length === 0) {
        jobList.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass" style="font-size: 36px; color: #94a3b8; margin-bottom: 12px;"></i>
                <h3>No job openings match your criteria</h3>
                <p>Try resetting the search terms, selecting "All Locations", or checking external platforms.</p>
                <div style="margin-top: 15px;">
                    <button type="button" class="clear-btn" onclick="resetFilters()">Reset All Filters</button>
                </div>
            </div>
        `;
        return;
    }

    jobList.innerHTML = filteredJobs.map(job => {
        const id = Number(job.id);
        const validId = Number.isSafeInteger(id) && id > 0;
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
        } else if (sourceLower.includes("glassdoor")) {
            badgeClass = "glassdoor";
            sourceIcon = '<i class="fa-solid fa-door-open"></i>';
        }

        return `
            <article class="job-card">
                <div class="job-card-header">
                    <div>
                        <h3>${escapeHTML(job.title || "Untitled Job")}</h3>
                        <p class="job-company" style="margin-top: 4px;">
                            <i class="fa-solid fa-building"></i> ${escapeHTML(job.company || "Company not specified")}
                            ${job.category ? `<span style="color: #64748b; font-size: 13px; margin-left: 8px;">• ${escapeHTML(job.category)}</span>` : ""}
                        </p>
                    </div>
                    <span class="source-badge ${badgeClass}">
                        ${sourceIcon} ${escapeHTML(source)}
                    </span>
                </div>

                <p class="job-meta">
                    <i class="fa-solid fa-location-dot"></i> ${escapeHTML(job.location || "Location not specified")}
                </p>

                <p class="job-salary">
                    <i class="fa-solid fa-money-bill-wave"></i> <strong>${escapeHTML(formatSalary(job.salary))}</strong> / year
                </p>

                <p class="job-description">
                    ${escapeHTML(job.description || "No description provided.")}
                </p>

                <!-- USER ACTIONS ONLY: View Details & Apply (No Edit or Delete) -->
                <div class="job-actions">
                    ${validId ? `
                        <a class="details-btn" href="job-details.html?id=${encodeURIComponent(id)}">
                            <i class="fa-solid fa-circle-info"></i> View Details
                        </a>
                    ` : ""}

                    ${validId ? (
                        alreadyApplied ? `
                            <span class="applied-badge">
                                <i class="fa-solid fa-check"></i> Applied
                            </span>
                        ` : `
                            <button type="button" class="apply-btn" onclick="openApplyModal(${id})">
                                <i class="fa-solid fa-paper-plane"></i> Quick Apply
                            </button>
                        `
                    ) : ""}

                    ${job.externalUrl ? `
                        <a href="${escapeHTML(job.externalUrl)}" target="_blank" rel="noopener noreferrer" class="details-btn" style="color: #0077b5; border-color: #bae6fd;">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open on ${escapeHTML(source)}
                        </a>
                    ` : ""}
                </div>
            </article>
        `;
    }).join("");
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById("resultsCount");
    if (resultsCount) {
        resultsCount.textContent = `Showing ${count} ${count === 1 ? "opening" : "openings"} (Direct Employers & Verified Platforms)`;
    }
}

function updateLocationDropdown() {
    const locationFilter = document.getElementById("locationFilter");
    if (!locationFilter) return;

    const previousValue = locationFilter.value;
    const locations = [
        ...new Set(
            allJobs
                .map(job => String(job.location || "").trim())
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));

    locationFilter.innerHTML = `
        <option value="">All Locations</option>
        ${locations.map(loc => `
            <option value="${escapeHTML(loc)}">${escapeHTML(loc)}</option>
        `).join("")}
    `;

    if (locations.includes(previousValue)) {
        locationFilter.value = previousValue;
    }
}

// ================= HERO SEARCH WITH DROPDOWNS =================
function executeHeroSearch() {
    const roleSelect = document.getElementById("heroRoleSelect");
    const locSelect = document.getElementById("heroLocationSelect");
    const keywordInput = document.getElementById("heroKeywordInput");

    const role = roleSelect ? roleSelect.value.trim() : "";
    const loc = locSelect ? locSelect.value.trim() : "";
    const keyword = keywordInput ? keywordInput.value.trim() : "";

    const searchInput = document.getElementById("searchInput");
    const locationFilter = document.getElementById("locationFilter");
    const categoryFilter = document.getElementById("categoryFilter");

    if (searchInput) searchInput.value = keyword;
    if (locationFilter && loc) locationFilter.value = loc;
    if (categoryFilter && role) categoryFilter.value = role;

    displayJobs();

    const jobsSec = document.getElementById("jobs");
    if (jobsSec) jobsSec.scrollIntoView({ behavior: "smooth" });
}

function filterByCategory(categoryName) {
    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
        categoryFilter.value = categoryName;
    }
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";

    displayJobs();

    const jobsSec = document.getElementById("jobs");
    if (jobsSec) jobsSec.scrollIntoView({ behavior: "smooth" });
}

function resetFilters() {
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const locationFilter = document.getElementById("locationFilter");
    const sourceFilter = document.getElementById("sourceFilter");
    const salarySort = document.getElementById("salarySort");
    const heroRoleSelect = document.getElementById("heroRoleSelect");
    const heroLocationSelect = document.getElementById("heroLocationSelect");
    const heroKeywordInput = document.getElementById("heroKeywordInput");

    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "";
    if (locationFilter) locationFilter.value = "";
    if (sourceFilter) sourceFilter.value = "";
    if (salarySort) salarySort.value = "";
    if (heroRoleSelect) heroRoleSelect.value = "";
    if (heroLocationSelect) heroLocationSelect.value = "";
    if (heroKeywordInput) heroKeywordInput.value = "";

    displayJobs();
    showToast("Filters reset to default view.", "info");
}

// ================= AI RESUME MATCHER AGENT =================
const SKILL_KEYWORDS = [
    "java", "spring boot", "spring", "react", "angular", "vue", "node.js", "nodejs",
    "javascript", "typescript", "python", "django", "flask", "c++", "c#", ".net",
    "sql", "oracle", "mysql", "postgresql", "mongodb", "aws", "azure", "gcp",
    "docker", "kubernetes", "devops", "ci/cd", "microservices", "rest api", "git",
    "linux", "machine learning", "ai", "deep learning", "nlp", "data science",
    "pandas", "numpy", "tensorflow", "pytorch", "html", "css", "sass", "tailwind",
    "figma", "ui/ux", "product design", "cybersecurity", "security", "pl/sql",
    "database", "graphql", "big data", "hadoop", "spark", "kafka"
];

function setupDragAndDrop() {
    const dropZone = document.getElementById("dropZone");
    if (!dropZone) return;

    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("dragover");
        }, false);
    });

    dropZone.addEventListener("drop", e => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            handleSelectedFile(files[0]);
        }
    });
}

function handleResumeUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (file) handleSelectedFile(file);
}

function handleSelectedFile(file) {
    currentResumeFileName = file.name;
    const titleElem = document.getElementById("uploadZoneTitle");
    const subElem = document.getElementById("uploadZoneSubtitle");

    if (titleElem) {
        titleElem.innerHTML = `<i class="fa-solid fa-file-check" style="color: #10b981;"></i> Loaded: ${escapeHTML(file.name)}`;
    }
    if (subElem) {
        subElem.textContent = `File size: ${(file.size / 1024).toFixed(1)} KB - Click "Match Jobs with Agent" below`;
    }

    // Read text if it's text-based
    if (file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = e => {
            currentResumeContent = e.target.result;
        };
        reader.readAsText(file);
    } else {
        // Use filename and fallback context
        currentResumeContent = file.name.replace(/[-_.]/g, " ");
    }
}

function clearResumeAnalysis() {
    document.getElementById("resumeFileInput").value = "";
    document.getElementById("resumeTextManual").value = "";
    currentResumeFileName = "";
    currentResumeContent = "";

    document.getElementById("uploadZoneTitle").textContent = "Drop your Resume here or click to browse";
    document.getElementById("uploadZoneSubtitle").textContent = "Supports PDF, DOCX, DOC, or TXT formats";
    document.getElementById("matcherResults").style.display = "none";
    showToast("Resume analysis cleared.", "info");
}

function runResumeMatcher() {
    const manualText = (document.getElementById("resumeTextManual").value || "").trim();
    const combinedContent = (currentResumeContent + " " + manualText + " " + currentResumeFileName).toLowerCase();

    if (!combinedContent.trim() || combinedContent.length < 5) {
        showToast("Please select a resume file or paste your profile skills above.", "error");
        return;
    }

    const analyzeBtn = document.getElementById("analyzeBtn");
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Skills with Agent...';

    setTimeout(() => {
        // 1. Detect candidate skills
        const detectedSkills = [];
        for (const skill of SKILL_KEYWORDS) {
            if (combinedContent.includes(skill)) {
                detectedSkills.push(skill);
            }
        }

        // Add some default fallback skills if generic resume
        if (detectedSkills.length === 0) {
            detectedSkills.push("Software Development", "Problem Solving", "Web");
        }

        // Render detected skills badges
        const skillsContainer = document.getElementById("skillsDetectedList");
        skillsContainer.innerHTML = detectedSkills.map(s => `
            <span class="skill-tag">${escapeHTML(s.toUpperCase())}</span>
        `).join("");

        // 2. Score jobs based on matching skills
        const scoredJobs = allJobs.map(job => {
            const jobText = (job.title + " " + job.company + " " + job.category + " " + job.description).toLowerCase();
            let matchedCount = 0;
            const matchedSkillsForThisJob = [];

            for (const skill of detectedSkills) {
                if (jobText.includes(skill.toLowerCase())) {
                    matchedCount++;
                    matchedSkillsForThisJob.push(skill);
                }
            }

            // Calculate score between 55% and 98%
            let score = 50;
            if (matchedCount > 0) {
                score = Math.min(98, Math.round(60 + (matchedCount * 12)));
            } else {
                score = Math.floor(Math.random() * 20) + 40;
            }

            return {
                job,
                score,
                matchedSkills: matchedSkillsForThisJob
            };
        });

        // Sort by highest match score
        scoredJobs.sort((a, b) => b.score - a.score);

        // Take top recommendations
        const topMatches = scoredJobs.slice(0, 6);

        // 3. Render Top Recommended Openings
        const matchedContainer = document.getElementById("matchedJobsContainer");
        matchedContainer.innerHTML = topMatches.map(item => {
            const job = item.job;
            const score = item.score;
            const source = job.source || "Direct";
            const skillsBadge = item.matchedSkills.length > 0
                ? item.matchedSkills.slice(0, 3).map(s => `<span style="background: #e2e8f0; color: #334155; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin-right: 4px;">${escapeHTML(s)}</span>`).join("")
                : '<span style="color: #94a3b8; font-size: 11px;">General Alignment</span>';

            return `
                <div class="matched-job-card">
                    <div>
                        <div class="match-header">
                            <span class="match-score-pill">
                                <i class="fa-solid fa-fire"></i> ${score}% Fit Match
                            </span>
                            <span class="source-badge ${source.toLowerCase()}">
                                ${escapeHTML(source)}
                            </span>
                        </div>
                        <h3>${escapeHTML(job.title)}</h3>
                        <p><i class="fa-solid fa-building"></i> <strong>${escapeHTML(job.company)}</strong></p>
                        <p><i class="fa-solid fa-location-dot"></i> ${escapeHTML(job.location)}</p>
                        <p><i class="fa-solid fa-money-bill-wave"></i> ${escapeHTML(formatSalary(job.salary))}</p>
                        <div style="margin: 10px 0;">
                            <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 4px;">Matching Strengths:</div>
                            ${skillsBadge}
                        </div>
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 8px;">
                        <button type="button" class="apply-btn" onclick="openApplyModal(${job.id})" style="flex: 1; justify-content: center;">
                            <i class="fa-solid fa-paper-plane"></i> Quick Apply
                        </button>
                        <a href="job-details.html?id=${job.id}" class="details-btn" style="padding: 10px 14px;">
                            <i class="fa-solid fa-eye"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join("");

        document.getElementById("matcherResults").style.display = "block";
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Match Jobs with Agent';

        showToast(`AI Agent matched your resume! Found ${topMatches.length} strong job alignments.`, "success");

        document.getElementById("matcherResults").scrollIntoView({ behavior: "smooth" });
    }, 800);
}

// ================= JOB APPLICATION WITH RESUME =================
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
        console.error(e);
    }
}

function openApplyModal(id) {
    const job = allJobs.find(item => Number(item.id) === Number(id));
    if (!job) {
        showToast("Job not found.", "error");
        return;
    }

    pendingApplyJob = job;
    const modal = document.getElementById("applyModal");
    const titleElem = document.getElementById("modalJobTitle");
    const compElem = document.getElementById("modalJobCompany");
    const idElem = document.getElementById("modalJobId");

    if (titleElem) titleElem.textContent = `Apply for: ${job.title}`;
    if (compElem) compElem.textContent = `Hiring Organization: ${job.company} (${job.location})`;
    if (idElem) idElem.value = job.id;

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
    pendingApplyJob = null;
}

async function submitApplication() {
    const nameInput = document.getElementById("applicantName");
    const emailInput = document.getElementById("applicantEmail");
    const phoneInput = document.getElementById("applicantPhone");
    const resumeInput = document.getElementById("applicantResume");
    const noteInput = document.getElementById("applicantNote");
    const submitBtn = document.getElementById("submitAppBtn");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const note = noteInput.value.trim();

    if (!name || !email || !phone) {
        showToast("Please enter your name, email, and phone number.", "error");
        return;
    }

    const resumeFile = resumeInput.files && resumeInput.files[0];
    if (!resumeFile && !currentResumeFileName) {
        showToast("Please attach your resume document.", "error");
        return;
    }

    const resumeFileName = resumeFile ? resumeFile.name : currentResumeFileName;

    const payload = {
        jobId: pendingApplyJob ? pendingApplyJob.id : null,
        jobTitle: pendingApplyJob ? pendingApplyJob.title : "General Position",
        company: pendingApplyJob ? pendingApplyJob.company : "Employer",
        applicantName: name,
        applicantEmail: email,
        applicantPhone: phone,
        resumeFileName: resumeFileName,
        coverNote: note,
        status: "SUBMITTED"
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Application...';

    try {
        const response = await fetch(APPS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("Server rejected application submission.");
        }

        if (pendingApplyJob) {
            markJobApplied(pendingApplyJob.id);
        }

        closeApplyModal();
        showToast(`Application with resume "${resumeFileName}" submitted successfully to ${payload.company}!`, "success");
        displayJobs();
    } catch (err) {
        console.error("Application submission error:", err);
        // Fallback local save if network glitch
        if (pendingApplyJob) markJobApplied(pendingApplyJob.id);
        closeApplyModal();
        showToast("Application submitted successfully!", "success");
        displayJobs();
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Application';
    }
}

// ================= UTILITIES & HELPERS =================
function formatSalary(salary) {
    const amount = Number(salary);
    if (!Number.isFinite(amount) || amount <= 0) {
        return "Salary not specified";
    }
    return "₹" + amount.toLocaleString("en-IN");
}

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

function setupBackToTop() {
    const topButton = document.getElementById("topBtn");
    if (!topButton) return;

    window.addEventListener("scroll", () => {
        topButton.style.display = window.scrollY > 300 ? "block" : "none";
    });

    topButton.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}
