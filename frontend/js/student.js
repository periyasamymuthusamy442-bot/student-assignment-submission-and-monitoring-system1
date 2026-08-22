/* =========================================================
   STUDENT ASSIGNMENT TRACKING SYSTEM
   STUDENT.JS
   LOCAL STORAGE VERSION
   ========================================================= */


/* =========================================================
   STUDENT DATA
   ========================================================= */

const studentId =
    localStorage.getItem("studentId");

const studentName =
    localStorage.getItem("studentName") ||
    "Student";

const studentEmail =
    localStorage.getItem("studentEmail") ||
    "";

const studentDepartment =
    localStorage.getItem("studentDepartment") ||
    "Computer Science";


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let assignments = [];

let notifications = [];

let currentFilter = "all";


/* =========================================================
   PAGE PROTECTION
   ========================================================= */

if (!studentId) {

    window.location.href = "index.html";

}


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeStudent();

        initializeNavigation();

        initializeMobileMenu();

        initializeProfileDropdown();

        initializeLogout();

        initializeFilters();

        initializeSettings();

        initializeModal();

        initializeMarkAsDone();

        initializeEditProfile();

        initializePhotoUpload();

        initializeClearNotifications();

        loadAssignments();

        loadStudentAlerts();

        applySavedDarkMode();

    }
);


/* =========================================================
   INITIALIZE STUDENT
   ========================================================= */

function initializeStudent() {

    setText(
        "headerStudentName",
        studentName
    );

    setText(
        "headerStudentId",
        studentId || "-"
    );

    setText(
        "welcomeStudentName",
        studentName
    );

    setText(
        "profileName",
        studentName
    );

    setText(
        "profileStudentId",
        studentId || "-"
    );

    setText(
        "profileStudentId2",
        studentId || "-"
    );

    setText(
        "profileEmail",
        studentEmail || "Not available"
    );

    setText(
        "profileDepartment",
        studentDepartment
    );


    const initials =
        getInitials(studentName);


    applyAvatarEverywhere(
        initials
    );


    setText(
        "dropdownStudentName",
        studentName
    );

    setText(
        "dropdownStudentId",
        studentId || "-"
    );

}


/* =========================================================
   APPLY AVATAR (INITIALS OR UPLOADED PHOTO)
   ========================================================= */

function getStudentPhoto() {

    if (!studentId) {

        return null;

    }


    return localStorage.getItem(
        "studentPhoto_" +
        String(studentId).trim()
    );

}


function applyAvatarEverywhere(initials) {

    const photo =
        getStudentPhoto();


    const spots = [

        "headerAvatar",

        "profileAvatar",

        "dropdownAvatar"

    ];


    spots.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {

                return;

            }


            if (photo) {

                element.innerHTML =
                    "<img src=\"" +
                    photo +
                    "\" alt=\"Profile photo\">";

            } else {

                element.textContent =
                    initials;

            }

        }
    );

}


/* =========================================================
   SAFE TEXT
   ========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {

        return;

    }

    element.textContent =
        value ?? "";

}


/* =========================================================
   GET INITIALS
   ========================================================= */

function getInitials(name) {

    if (!name) {

        return "ST";

    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const menuItems =
        document.querySelectorAll(
            ".menu-item[data-section], " +
            ".nav-item[data-section]"
        );


    menuItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                const section =
                    item.dataset.section;

                if (!section) {

                    return;

                }

                showSection(section);


                const sidebar =
                    document.getElementById(
                        "sidebar"
                    );


                if (sidebar) {

                    sidebar.classList.remove(
                        "sidebar-open"
                    );

                }

            }
        );

    });


    document
        .querySelectorAll(
            "[data-section-target]"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    const target =
                        button.dataset.sectionTarget;

                    if (!target) {

                        return;

                    }

                    showSection(target);

                }
            );

        });


    const hash =
        window.location.hash
            .replace("#", "")
            .trim();


    if (
        hash &&
        document.getElementById(
            `section-${hash}`
        )
    ) {

        showSection(hash);

    } else {

        showSection("dashboard");

    }

}


/* =========================================================
   SHOW SECTION
   ========================================================= */

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    sections.forEach(function (section) {

        section.classList.remove(
            "active-section"
        );

    });


    const target =
        document.getElementById(
            `section-${sectionName}`
        );


    if (target) {

        target.classList.add(
            "active-section"
        );

    }


    const menuItems =
        document.querySelectorAll(
            ".menu-item[data-section], " +
            ".nav-item[data-section]"
        );


    menuItems.forEach(function (item) {

        item.classList.remove(
            "active"
        );


        if (
            item.dataset.section ===
            sectionName
        ) {

            item.classList.add(
                "active"
            );

        }

    });


    const titles = {

        dashboard: [
            "Student Dashboard",
            "Track your assignments and academic activities"
        ],

        assignments: [
            "My Assignments",
            "View and manage your assigned work"
        ],

        schedule: [
            "Schedule",
            "Keep track of your upcoming academic activities"
        ],

        notifications: [
            "Notifications",
            "Important assignment and academic alerts"
        ],

        profile: [
            "My Profile",
            "View your student information"
        ],

        settings: [
            "Settings",
            "Manage your dashboard preferences"
        ]

    };


    const titleData =
        titles[sectionName];


    if (titleData) {

        setText(
            "pageTitle",
            titleData[0]
        );

        setText(
            "pageSubtitle",
            titleData[1]
        );

    }


    if (
        window.location.hash !==
        `#${sectionName}`
    ) {

        history.replaceState(
            null,
            "",
            `#${sectionName}`
        );

    }


    if (
        sectionName ===
        "dashboard"
    ) {

        renderDashboardAssignments();

        updateStatistics();

    }


    if (
        sectionName ===
        "assignments"
    ) {

        renderAssignments();

    }


    if (
        sectionName ===
        "schedule"
    ) {

        renderSchedule();

    }


    if (
        sectionName ===
        "notifications"
    ) {

        renderStudentAlerts();

    }

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const mobileMenuBtn =
        document.getElementById(
            "mobileMenuBtn"
        );


    if (!mobileMenuBtn) {

        return;

    }


    mobileMenuBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const sidebar =
                document.getElementById(
                    "sidebar"
                );


            if (!sidebar) {

                return;

            }


            sidebar.classList.toggle(
                "sidebar-open"
            );

        }
    );


    document.addEventListener(
        "click",
        function (event) {

            const sidebar =
                document.getElementById(
                    "sidebar"
                );


            if (!sidebar) {

                return;

            }


            if (
                !sidebar.contains(
                    event.target
                ) &&
                event.target !==
                mobileMenuBtn
            ) {

                sidebar.classList.remove(
                    "sidebar-open"
                );

            }

        }
    );

}


/* =========================================================
   PROFILE DROPDOWN
   ========================================================= */

function initializeProfileDropdown() {

    const profileButton =
        document.getElementById(
            "profileButton"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );


    if (
        !profileButton ||
        !profileDropdown
    ) {

        return;

    }


    profileButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            profileDropdown.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        function (event) {

            if (
                !profileButton.contains(
                    event.target
                ) &&
                !profileDropdown.contains(
                    event.target
                )
            ) {

                profileDropdown.classList.remove(
                    "show"
                );

            }

        }
    );


    profileDropdown
        .querySelectorAll(
            "[data-section-target]"
        )
        .forEach(function (item) {

            item.addEventListener(
                "click",
                function () {

                    profileDropdown.classList.remove(
                        "show"
                    );

                }
            );

        });

}


/* =========================================================
   LOGOUT
   ========================================================= */

function initializeLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, " +
            ".logout-link, " +
            ".dropdown-logout"
        );


    logoutButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const confirmLogout =
                    window.confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmLogout) {

                    return;

                }


                localStorage.removeItem(
                    "studentId"
                );

                localStorage.removeItem(
                    "studentName"
                );

                localStorage.removeItem(
                    "studentEmail"
                );

                localStorage.removeItem(
                    "studentDepartment"
                );


                window.location.href =
                    "index.html";

            }
        );

    });

}


/* =========================================================
   LOAD ASSIGNMENTS
   LOCAL STORAGE
   ========================================================= */

function loadAssignments() {

    try {

        const storedAssignments =
            localStorage.getItem(
                "assignments"
            );


        if (!storedAssignments) {

            assignments = [];

        } else {

            const parsed =
                JSON.parse(
                    storedAssignments
                );


            assignments =
                Array.isArray(parsed)
                    ? parsed
                    : [];

        }


        console.log(
            "Assignments loaded:",
            assignments
        );


        renderDashboardAssignments();

        renderAssignments();

        renderSchedule();

        updateStatistics();


    } catch (error) {

        console.error(
            "Assignment loading error:",
            error
        );


        assignments = [];


        showAssignmentError();

    }

}


/* =========================================================
   ASSIGNMENT ERROR
   ========================================================= */

function showAssignmentError() {

    const lists = [

        document.getElementById(
            "dashboardAssignmentsList"
        ),

        document.getElementById(
            "allAssignmentsList"
        ),

        document.getElementById(
            "assignmentsList"
        )

    ];


    lists.forEach(function (list) {

        if (!list) {

            return;

        }


        list.innerHTML = `

            <div class="assignment-error">

                <div class="error-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to Load Assignments
                </h3>

                <p>
                    Assignment data is corrupted or unavailable.
                </p>

            </div>

        `;

    });

}


/* =========================================================
   NORMALIZE ASSIGNMENT
   ========================================================= */

function normalizeAssignment(assignment) {

    assignment =
        assignment || {};


    return {

        id:
            assignment.assignmentId ||
            assignment.id ||
            assignment._id ||
            "",


        title:
            assignment.title ||
            assignment.name ||
            "Untitled Assignment",


        subject:
            assignment.subject ||
            assignment.course ||
            "Academic Assignment",


        description:
            assignment.description ||
            "No description available.",


        dueDate:
            assignment.dueDate ||
            assignment.date ||
            assignment.deadline ||
            "",


        dueTime:
            assignment.dueTime ||
            assignment.time ||
            "",


        status:
            assignment.status ||
            "Pending",


        file:
            assignment.file ||
            assignment.fileUrl ||
            assignment.attachment ||
            "",


        createdAt:
            assignment.createdAt ||
            ""

    };

}


/* =========================================================
   SUBMITTED STUDENT IDS
   (mirrors the logic used on the admin dashboard so the
   two sides always agree on who has submitted)
   ========================================================= */

function getSubmittedStudentIds(assignment) {

    if (!assignment) {

        return [];

    }


    const source =
        assignment.submittedStudents;


    if (Array.isArray(source)) {

        return source
            .map(function (entry) {

                if (
                    entry &&
                    typeof entry === "object"
                ) {

                    return String(
                        entry.studentId ||
                        entry.id ||
                        entry.userId ||
                        ""
                    ).trim();

                }

                return String(
                    entry ?? ""
                ).trim();

            })
            .filter(Boolean);

    }


    if (
        source &&
        typeof source === "object"
    ) {

        return Object.keys(source)
            .filter(function (id) {

                return source[id] === true;

            });

    }


    return [];

}


/* =========================================================
   HAS CURRENT STUDENT SUBMITTED?
   ========================================================= */

function isSubmittedByCurrentStudent(assignment) {

    if (!assignment || !studentId) {

        return false;

    }


    return getSubmittedStudentIds(
        assignment
    ).includes(
        String(studentId).trim()
    );

}


/* =========================================================
   SUBMISSION REQUESTS
   (student can't mark work "Submitted" directly anymore -
   they send a request, and it only counts once the
   teacher/admin approves it - this closes the loophole
   where a student could just fake a submission)
   ========================================================= */

function getSubmissionRequests() {

    let data;

    try {

        data =
            JSON.parse(
                localStorage.getItem(
                    "submissionRequests"
                ) || "[]"
            );

    } catch (error) {

        data = [];

    }


    return Array.isArray(data)
        ? data
        : [];

}


function saveSubmissionRequests(requests) {

    localStorage.setItem(
        "submissionRequests",
        JSON.stringify(requests)
    );

}


function getMyRequestForAssignment(assignmentId) {

    if (!studentId) {

        return null;

    }


    const requests =
        getSubmissionRequests();


    const mine =
        requests.filter(
            function (request) {

                return (
                    String(
                        request.assignmentId
                    ) ===
                        String(assignmentId) &&
                    String(
                        request.studentId
                    ).trim() ===
                        String(studentId).trim()
                );

            }
        );


    if (mine.length === 0) {

        return null;

    }


    /*
       Most recent request for this assignment
       wins (covers the resubmit-after-reject case).
    */

    mine.sort(function (a, b) {

        return (
            new Date(b.requestedAt || 0) -
            new Date(a.requestedAt || 0)
        );

    });


    return mine[0];

}


/* =========================================================
   ASSIGNMENT STATUS
   ========================================================= */

function getAssignmentStatus(assignment) {

    const item =
        normalizeAssignment(
            assignment
        );


    const rawStatus =
        String(
            item.status
        )
        .trim()
        .toLowerCase();


    /*
       The current student has explicitly marked
       this assignment as done - this always wins,
       even if the assignment's shared/global status
       still says "Pending".
    */

    if (
        isSubmittedByCurrentStudent(
            assignment
        )
    ) {

        return "Submitted";

    }


    /*
       Student sent a request but the teacher
       hasn't verified it yet - this is NOT the
       same as "Submitted". A rejected request
       falls through and behaves like Pending/
       Overdue again, so the student can resubmit.
    */

    const myRequest =
        getMyRequestForAssignment(
            item.id
        );


    if (
        myRequest &&
        myRequest.status === "pending"
    ) {

        return "Pending Review";

    }


    if (
        rawStatus === "submitted" ||
        rawStatus === "complete" ||
        rawStatus === "completed" ||
        rawStatus === "done"
    ) {

        return "Submitted";

    }


    if (
        rawStatus === "overdue"
    ) {

        return "Overdue";

    }


    if (
        assignment &&
        (
            assignment.submitted === true ||
            assignment.isSubmitted === true
        )
    ) {

        return "Submitted";

    }


    /*
       Automatically detect overdue assignment
       only when it is still pending.
    */

    if (
        item.dueDate &&
        rawStatus !== "submitted" &&
        rawStatus !== "complete" &&
        rawStatus !== "completed"
    ) {

        const due =
            getDueDateTime(
                item.dueDate,
                item.dueTime
            );


        if (
            due &&
            due.getTime() <
            Date.now()
        ) {

            return "Overdue";

        }

    }


    return "Pending";

}


/* =========================================================
   GET DUE DATE + TIME
   ========================================================= */

function getDueDateTime(
    dateValue,
    timeValue
) {

    if (!dateValue) {

        return null;

    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    if (timeValue) {

        const parts =
            String(timeValue)
                .split(":");


        if (parts.length >= 2) {

            const hours =
                parseInt(
                    parts[0],
                    10
                );


            const minutes =
                parseInt(
                    parts[1],
                    10
                );


            if (
                !isNaN(hours) &&
                !isNaN(minutes)
            ) {

                date.setHours(
                    hours,
                    minutes,
                    0,
                    0
                );

            }

        }

    }


    return date;

}


/* =========================================================
   ASSIGNMENT ICON
   ========================================================= */

function getAssignmentIcon(title) {

    const value =
        String(title)
            .toLowerCase();


    if (
        value.includes("java")
    ) {

        return "☕";

    }


    if (
        value.includes("python")
    ) {

        return "🐍";

    }


    if (
        value.includes("web") ||
        value.includes("html") ||
        value.includes("javascript") ||
        value.includes("css")
    ) {

        return "🌐";

    }


    if (
        value.includes("math") ||
        value.includes("mathematics")
    ) {

        return "📐";

    }


    if (
        value.includes("energy") ||
        value.includes("renewable")
    ) {

        return "⚡";

    }


    if (
        value.includes("electrical")
    ) {

        return "⚡";

    }


    return "📚";

}


/* =========================================================
   ICON CLASS
   ========================================================= */

function getIconClass(title) {

    const value =
        String(title)
            .toLowerCase();


    if (
        value.includes("java")
    ) {

        return "purple-icon";

    }


    if (
        value.includes("python")
    ) {

        return "green-icon";

    }


    if (
        value.includes("web") ||
        value.includes("html") ||
        value.includes("javascript") ||
        value.includes("css")
    ) {

        return "blue-icon";

    }


    return "";

}


/* =========================================================
   CREATE ASSIGNMENT CARD
   ========================================================= */

function createAssignmentCard(
    assignment
) {

    const item =
        normalizeAssignment(
            assignment
        );


    const status =
        getAssignmentStatus(
            assignment
        );


    let statusClass =
        "status-pending";


    if (
        status ===
        "Submitted"
    ) {

        statusClass =
            "status-submitted";

    }


    if (
        status ===
        "Overdue"
    ) {

        statusClass =
            "status-overdue";

    }


    if (
        status ===
        "Pending Review"
    ) {

        statusClass =
            "status-review";

    }


    const icon =
        getAssignmentIcon(
            item.title
        );


    const iconClass =
        getIconClass(
            item.title
        );


    return `

        <div class="assignment-card">

            <div class="assignment-left">

                <div class="
                    assignment-icon
                    ${iconClass}
                ">

                    ${icon}

                </div>


                <div class="assignment-info">

                    <h3>
                        ${escapeHTML(
                            item.title
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            item.subject
                        )}
                    </p>


                    <span class="due-date">

                        🕐 Due:

                        ${formatDate(
                            item.dueDate
                        )}

                        ${
                            item.dueTime
                                ? " • " +
                                  formatTime(
                                      item.dueTime
                                  )
                                : ""
                        }

                    </span>

                </div>

            </div>


            <div class="assignment-right">

                <span class="
                    status
                    ${statusClass}
                ">

                    ${status}

                </span>


                <button
                    type="button"
                    class="view-assignment-btn"
                    data-assignment-id="${escapeHTML(
                        item.id
                    )}"
                >

                    View Assignment

                </button>


                ${
                    status === "Submitted"
                        ? ""
                        : status === "Pending Review"
                        ? `
                            <button
                                type="button"
                                class="mark-done-btn pending-review-btn"
                                disabled
                            >

                                ⏳ Waiting for Verification

                            </button>
                        `
                        : `
                            <button
                                type="button"
                                class="mark-done-btn"
                                data-assignment-id="${escapeHTML(
                                    item.id
                                )}"
                            >

                                ${
                                    getMyRequestForAssignment(
                                        item.id
                                    ) &&
                                    getMyRequestForAssignment(
                                        item.id
                                    ).status === "rejected"
                                        ? "↻ Resubmit"
                                        : "✓ Mark as Done"
                                }

                            </button>
                        `
                }

            </div>

        </div>

    `;

}


/* =========================================================
   RENDER DASHBOARD ASSIGNMENTS
   ========================================================= */

function renderDashboardAssignments() {

    const list =
        document.getElementById(
            "dashboardAssignmentsList"
        );


    if (!list) {

        return;

    }


    if (
        assignments.length === 0
    ) {

        list.innerHTML = `

            <div class="empty-box">

                <div class="empty-icon">
                    📚
                </div>

                <h3>
                    No Assignments Available
                </h3>

                <p>
                    Admin has not posted any
                    assignments yet.
                </p>

            </div>

        `;

        return;

    }


    /*
       Show every available assignment here so the
       count shown in "Total Assignments" always
       matches the number of cards rendered.
    */

    list.innerHTML =
        assignments
            .map(function (assignment) {

                return createAssignmentCard(
                    assignment
                );

            })
            .join("");

}


/* =========================================================
   RENDER ALL ASSIGNMENTS
   ========================================================= */

function renderAssignments() {

    const list =
        document.getElementById(
            "allAssignmentsList"
        );


    if (!list) {

        return;

    }


    let filtered =
        assignments;


    if (
        currentFilter !==
        "all"
    ) {

        filtered =
            assignments.filter(
                function (assignment) {

                    return (
                        getAssignmentStatus(
                            assignment
                        ).toLowerCase() ===
                        currentFilter
                    );

                }
            );

    }


    if (
        filtered.length === 0
    ) {

        const filterText =
            currentFilter === "all"
                ? ""
                : currentFilter + " ";


        list.innerHTML = `

            <div class="empty-box">

                No ${filterText}
                assignments found.

            </div>

        `;

        return;

    }


    list.innerHTML =
        filtered
            .map(function (assignment) {

                return createAssignmentCard(
                    assignment
                );

            })
            .join("");

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "Not specified";

    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateValue
        );

    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(timeValue) {

    if (!timeValue) {

        return "Not specified";

    }


    const value =
        String(timeValue)
            .trim();


    const parts =
        value.split(":");


    if (
        parts.length < 2
    ) {

        return value;

    }


    let hours =
        parseInt(
            parts[0],
            10
        );


    const minutes =
        parts[1]
            .substring(0, 2);


    if (
        isNaN(hours)
    ) {

        return value;

    }


    const period =
        hours >= 12
            ? "PM"
            : "AM";


    hours =
        hours % 12;


    if (
        hours === 0
    ) {

        hours = 12;

    }


    return `${hours}:${minutes} ${period}`;

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        assignments.length;


    let submitted = 0;

    let overdue = 0;


    assignments.forEach(
        function (assignment) {

            const status =
                getAssignmentStatus(
                    assignment
                );


            if (
                status ===
                "Submitted"
            ) {

                submitted++;

            }


            if (
                status ===
                "Overdue"
            ) {

                overdue++;

            }

        }
    );


    const pending =
        Math.max(
            total -
            submitted -
            overdue,
            0
        );


    const completion =
        total > 0
            ? Math.round(
                (
                    submitted /
                    total
                ) * 100
            )
            : 0;


    setText(
        "totalAssignments",
        total
    );


    setText(
        "submittedAssignments",
        submitted
    );


    setText(
        "pendingAssignments",
        pending
    );


    setText(
        "completionPercentage",
        `${completion}%`
    );


    setText(
        "submitted",
        submitted
    );


    setText(
        "pending",
        pending
    );


    setText(
        "overdueAssignments",
        overdue
    );

}


/* =========================================================
   FILTERS
   ========================================================= */

function initializeFilters() {

    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                buttons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter ||
                    "all";


                renderAssignments();

            }
        );

    });


    const refreshBtn =
        document.getElementById(
            "refreshAssignmentsBtn"
        );


    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            function () {

                loadAssignments();

                loadStudentAlerts();

            }
        );

    }

}


/* =========================================================
   SCHEDULE
   ========================================================= */

function renderSchedule() {

    const list =
        document.getElementById(
            "scheduleList"
        );


    if (!list) {

        return;

    }


    const upcoming =
        assignments
            .filter(function (assignment) {

                return normalizeAssignment(
                    assignment
                ).dueDate;

            })
            .slice()
            .sort(function (a, b) {

                return (
                    getDateValue(a) -
                    getDateValue(b)
                );

            })
            .slice(0, 10);


    if (
        upcoming.length === 0
    ) {

        list.innerHTML = `

            <div class="empty-box">

                📅 No upcoming deadlines.

            </div>

        `;

        return;

    }


    list.innerHTML =
        upcoming
            .map(function (assignment) {

                const item =
                    normalizeAssignment(
                        assignment
                    );


                const date =
                    new Date(
                        item.dueDate
                    );


                let day = "-";

                let month = "-";


                if (
                    !isNaN(
                        date.getTime()
                    )
                ) {

                    day =
                        date.getDate();


                    month =
                        date.toLocaleString(
                            "en-US",
                            {
                                month: "short"
                            }
                        );

                }


                return `

                    <div class="schedule-item">

                        <div class="schedule-date">

                            <strong>
                                ${day}
                            </strong>

                            <span>
                                ${month}
                            </span>

                        </div>


                        <div class="schedule-info">

                            <h4>
                                ${escapeHTML(
                                    item.title
                                )}
                            </h4>

                            <p>
                                ${escapeHTML(
                                    item.subject
                                )}
                            </p>

                        </div>


                        <div class="schedule-time">

                            ${
                                item.dueTime
                                    ? formatTime(
                                        item.dueTime
                                    )
                                    : "Due Soon"
                            }

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =========================================================
   DATE VALUE
   ========================================================= */

function getDateValue(assignment) {

    const item =
        normalizeAssignment(
            assignment
        );


    const date =
        getDueDateTime(
            item.dueDate,
            item.dueTime
        );


    return !date
        ? Number.MAX_SAFE_INTEGER
        : date.getTime();

}


/* =========================================================
   LOAD STUDENT ALERTS
   ========================================================= */

function loadStudentAlerts() {

    const currentStudentId =
        localStorage.getItem(
            "studentId"
        );


    if (!currentStudentId) {

        notifications = [];

        renderStudentAlerts();

        updateNotificationCount();

        return;

    }


    try {

        const storedAlerts =
            localStorage.getItem(
                "studentAlerts"
            );


        const allAlerts =
            storedAlerts
                ? JSON.parse(
                    storedAlerts
                )
                : [];


        notifications =
            Array.isArray(allAlerts)
                ? allAlerts.filter(
                    function (alert) {

                        return (
                            String(
                                alert.studentId
                            ) ===
                            String(
                                currentStudentId
                            )
                        );

                    }
                )
                : [];


        console.log(
            "Student alerts loaded:",
            notifications
        );


        renderStudentAlerts();

        updateNotificationCount();


    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );


        notifications = [];


        renderStudentAlerts();

        updateNotificationCount();

    }

}


/* =========================================================
   RENDER STUDENT ALERTS
   ========================================================= */

function renderStudentAlerts() {

    const list =
        document.getElementById(
            "notificationsList"
        );


    const unreadCount =
        notifications.filter(
            function (notification) {

                return (
                    notification.read !==
                    true
                );

            }
        ).length;


    setText(
        "dashboardNotificationText",
        notifications.length
            ? `${unreadCount} new notification(s)`
            : "No new notifications at the moment."
    );


    if (!list) {

        return;

    }


    if (
        !notifications.length
    ) {

        list.innerHTML = `

            <div class="empty-box">

                🔔 No notifications at the moment.

            </div>

        `;

        return;

    }


    list.innerHTML =
        notifications
            .slice()
            .reverse()
            .map(function (notification) {

                const unreadClass =
                    notification.read
                        ? ""
                        : "unread";


                const notificationId =
                    notification.id ||
                    notification.alertId ||
                    "";


                return `

                    <div class="
                        notification-item
                        ${unreadClass}
                    ">

                        <div class="
                            notification-item-icon
                        ">

                            🔔

                        </div>


                        <div class="
                            notification-item-content
                        ">

                            <h4>

                                ${escapeHTML(
                                    notification.title ||
                                    "Admin Alert"
                                )}

                            </h4>


                            <p>

                                ${escapeHTML(
                                    notification.message ||
                                    ""
                                )}

                            </p>


                            <small>

                                ${formatNotificationDate(
                                    notification.createdAt
                                )}

                            </small>

                        </div>


                        ${
                            notification.read !== true &&
                            notificationId
                                ? `

                                    <button
                                        type="button"
                                        class="mark-read-btn"
                                        data-alert-id="${escapeHTML(
                                            notificationId
                                        )}"
                                    >

                                        ✓

                                    </button>

                                `
                                : ""
                        }

                    </div>

                `;

            })
            .join("");


    list
        .querySelectorAll(
            ".mark-read-btn"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    markNotificationRead(
                        button.dataset.alertId
                    );

                }
            );

        });

}


/* =========================================================
   MARK NOTIFICATION AS READ
   ========================================================= */

function markNotificationRead(
    notificationId
) {

    if (!notificationId) {

        return;

    }


    try {

        const stored =
            localStorage.getItem(
                "studentAlerts"
            );


        const alerts =
            stored
                ? JSON.parse(stored)
                : [];


        if (
            !Array.isArray(alerts)
        ) {

            return;

        }


        const index =
            alerts.findIndex(
                function (alert) {

                    const id =
                        alert.id ||
                        alert.alertId ||
                        "";


                    return (
                        String(id) ===
                        String(notificationId)
                    );

                }
            );


        if (
            index === -1
        ) {

            return;

        }


        alerts[index].read = true;


        localStorage.setItem(
            "studentAlerts",
            JSON.stringify(
                alerts
            )
        );


        loadStudentAlerts();


    } catch (error) {

        console.error(
            "Mark notification error:",
            error
        );

    }

}


/* =========================================================
   FORMAT NOTIFICATION DATE
   ========================================================= */

function formatNotificationDate(
    dateValue
) {

    if (!dateValue) {

        return "Just now";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "Just now";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   CLEAR NOTIFICATIONS
   ========================================================= */

function initializeClearNotifications() {

    const clearButton =
        document.getElementById(
            "clearNotificationsBtn"
        );


    if (!clearButton) {

        return;

    }


    clearButton.addEventListener(
        "click",
        function () {

            const currentStudentId =
                localStorage.getItem(
                    "studentId"
                );


            if (!currentStudentId) {

                return;

            }


            try {

                const stored =
                    localStorage.getItem(
                        "studentAlerts"
                    );


                const alerts =
                    stored
                        ? JSON.parse(stored)
                        : [];


                if (
                    !Array.isArray(alerts)
                ) {

                    return;

                }


                const remainingAlerts =
                    alerts.filter(
                        function (alert) {

                            return (
                                String(
                                    alert.studentId
                                ) !==
                                String(
                                    currentStudentId
                                )
                            );

                        }
                    );


                localStorage.setItem(
                    "studentAlerts",
                    JSON.stringify(
                        remainingAlerts
                    )
                );


                loadStudentAlerts();


            } catch (error) {

                console.error(
                    "Clear notification error:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   NOTIFICATION COUNT
   ========================================================= */

function updateNotificationCount() {

    const unreadCount =
        notifications.filter(
            function (notification) {

                return (
                    notification.read !==
                    true
                );

            }
        ).length;


    setText(
        "notificationCount",
        unreadCount
    );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function initializeSettings() {

    const notificationToggle =
        document.getElementById(
            "notificationToggle"
        );


    const deadlineToggle =
        document.getElementById(
            "deadlineToggle"
        );


    const darkModeToggle =
        document.getElementById(
            "darkModeToggle"
        );


    /* -------------------------------
       Notifications
    ------------------------------- */

    if (notificationToggle) {

        const saved =
            localStorage.getItem(
                "studentNotifications"
            );


        if (saved !== null) {

            notificationToggle.checked =
                saved === "true";

        }


        notificationToggle.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "studentNotifications",
                    String(
                        notificationToggle.checked
                    )
                );

            }
        );

    }


    /* -------------------------------
       Deadline reminders
    ------------------------------- */

    if (deadlineToggle) {

        const saved =
            localStorage.getItem(
                "studentDeadlineReminders"
            );


        if (saved !== null) {

            deadlineToggle.checked =
                saved === "true";

        }


        deadlineToggle.addEventListener(
            "change",
            function () {

                localStorage.setItem(
                    "studentDeadlineReminders",
                    String(
                        deadlineToggle.checked
                    )
                );

            }
        );

    }


    /* -------------------------------
       Dark mode
    ------------------------------- */

    if (darkModeToggle) {

        const saved =
            localStorage.getItem(
                "studentDarkMode"
            );


        darkModeToggle.checked =
            saved === "true";


        darkModeToggle.addEventListener(
            "change",
            function () {

                const enabled =
                    darkModeToggle.checked;


                document.body.classList.toggle(
                    "dark-mode",
                    enabled
                );


                localStorage.setItem(
                    "studentDarkMode",
                    String(enabled)
                );

            }
        );

    }

}


/* =========================================================
   APPLY SAVED DARK MODE
   ========================================================= */

function applySavedDarkMode() {

    const saved =
        localStorage.getItem(
            "studentDarkMode"
        );


    document.body.classList.toggle(
        "dark-mode",
        saved === "true"
    );

}


/* =========================================================
   ASSIGNMENT MODAL
   ========================================================= */

function initializeModal() {

    const modal =
        document.getElementById(
            "assignmentModal"
        );


    const closeBtn =
        document.getElementById(
            "closeAssignmentModal"
        );


    const actionBtn =
        document.getElementById(
            "modalActionBtn"
        );


    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".view-assignment-btn, .view-button"
                );


            if (!button) {

                return;

            }


            const id =
                button.dataset.assignmentId;


            if (!id) {

                return;

            }


            const assignment =
                assignments.find(
                    function (item) {

                        return (
                            String(
                                normalizeAssignment(
                                    item
                                ).id
                            ) ===
                            String(id)
                        );

                    }
                );


            if (assignment) {

                openAssignmentModal(
                    assignment
                );

            }

        }
    );


    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeAssignmentModal
        );

    }


    if (actionBtn) {

        actionBtn.addEventListener(
            "click",
            closeAssignmentModal
        );

    }


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {

                    closeAssignmentModal();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeAssignmentModal();

            }

        }
    );

}


/* =========================================================
   OPEN ASSIGNMENT MODAL
   ========================================================= */

let currentModalAssignmentId = null;

function openAssignmentModal(
    assignment
) {

    const item =
        normalizeAssignment(
            assignment
        );


    const status =
        getAssignmentStatus(
            assignment
        );


    currentModalAssignmentId =
        item.id;


    const markDoneBtn =
        document.getElementById(
            "modalMarkDoneBtn"
        );


    if (markDoneBtn) {

        if (status === "Submitted") {

            markDoneBtn.style.display =
                "none";

        } else if (
            status === "Pending Review"
        ) {

            markDoneBtn.style.display =
                "inline-block";

            markDoneBtn.disabled =
                true;

            markDoneBtn.textContent =
                "⏳ Waiting for Verification";

        } else {

            const myRequest =
                getMyRequestForAssignment(
                    item.id
                );


            markDoneBtn.style.display =
                "inline-block";

            markDoneBtn.disabled =
                false;

            markDoneBtn.textContent =
                myRequest &&
                myRequest.status === "rejected"
                    ? "↻ Resubmit"
                    : "✓ Mark as Done";

        }

    }


    setText(
        "modalAssignmentTitle",
        item.title
    );


    setText(
        "modalAssignmentSubject",
        item.subject
    );


    setText(
        "modalDueDate",
        formatDate(
            item.dueDate
        )
    );


    setText(
        "modalDueTime",
        item.dueTime
            ? formatTime(
                item.dueTime
            )
            : "-"
    );


    setText(
        "modalStatus",
        status
    );


    setText(
        "modalDescription",
        item.description
    );


    const modal =
        document.getElementById(
            "assignmentModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeAssignmentModal() {

    const modal =
        document.getElementById(
            "assignmentModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   MARK ASSIGNMENT AS DONE
   (this no longer submits directly - it sends a
   verification request to the teacher/admin. A student
   only shows as "Submitted" once the admin approves it
   from the Submission Requests screen. This prevents a
   student from just self-marking their own work done.)
   ========================================================= */

function markAssignmentComplete(assignmentId) {

    if (
        !assignmentId ||
        !studentId
    ) {

        return;

    }


    let stored;

    try {

        stored =
            JSON.parse(
                localStorage.getItem(
                    "assignments"
                ) || "[]"
            );

    } catch (error) {

        stored = [];

    }


    if (!Array.isArray(stored)) {

        stored = [];

    }


    const target =
        stored.find(
            function (item) {

                return (
                    String(
                        normalizeAssignment(
                            item
                        ).id
                    ) ===
                    String(assignmentId)
                );

            }
        );


    if (!target) {

        return;

    }


    /*
       Already have a pending request for this
       assignment - don't create a duplicate.
    */

    const existingRequest =
        getMyRequestForAssignment(
            assignmentId
        );


    if (
        existingRequest &&
        existingRequest.status === "pending"
    ) {

        return;

    }


    const requests =
        getSubmissionRequests();


    requests.push({

        id:
            "req_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 8),

        assignmentId:
            String(assignmentId),

        assignmentTitle:
            normalizeAssignment(target).title,

        studentId:
            String(studentId).trim(),

        studentName:
            studentName,

        status: "pending",

        requestedAt:
            new Date().toISOString()

    });


    saveSubmissionRequests(
        requests
    );


    closeAssignmentModal();

    loadAssignments();

    alert(
        "Your submission has been sent to " +
        "your teacher for verification. It will " +
        "show as 'Submitted' once approved."
    );

}


/* =========================================================
   MARK AS DONE - BUTTON WIRING
   ========================================================= */

function initializeMarkAsDone() {

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".mark-done-btn"
                );


            if (!button) {

                return;

            }


            const id =
                button.dataset.assignmentId;


            if (!id) {

                return;

            }


            markAssignmentComplete(id);

        }
    );


    const modalMarkDoneBtn =
        document.getElementById(
            "modalMarkDoneBtn"
        );


    if (modalMarkDoneBtn) {

        modalMarkDoneBtn.addEventListener(
            "click",
            function () {

                if (
                    currentModalAssignmentId
                ) {

                    markAssignmentComplete(
                        currentModalAssignmentId
                    );

                }

            }
        );

    }

}


/* =========================================================
   PROFILE PHOTO UPLOAD
   ========================================================= */

function initializePhotoUpload() {

    const uploadBtn =
        document.getElementById(
            "photoUploadBtn"
        );

    const fileInput =
        document.getElementById(
            "photoUploadInput"
        );


    if (
        !uploadBtn ||
        !fileInput ||
        !studentId
    ) {

        return;

    }


    uploadBtn.addEventListener(
        "click",
        function () {

            fileInput.click();

        }
    );


    fileInput.addEventListener(
        "change",
        function () {

            const file =
                fileInput.files &&
                fileInput.files[0];


            if (!file) {

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please choose an image file."
                );

                return;

            }


            /*
               Keep it small - localStorage has
               limited space, so cap uploads
               around 2MB before reading them in.
            */

            if (
                file.size >
                2 * 1024 * 1024
            ) {

                alert(
                    "Please choose an image smaller than 2MB."
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function () {

                    try {

                        localStorage.setItem(
                            "studentPhoto_" +
                            String(studentId).trim(),
                            reader.result
                        );

                    } catch (error) {

                        alert(
                            "Could not save photo - it may be too large."
                        );

                        return;

                    }


                    applyAvatarEverywhere(
                        getInitials(
                            studentName
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   EDIT PROFILE
   ========================================================= */

function initializeEditProfile() {

    const editBtn =
        document.getElementById(
            "editProfileBtn"
        );

    const saveBtn =
        document.getElementById(
            "saveProfileBtn"
        );

    const cancelBtn =
        document.getElementById(
            "cancelProfileBtn"
        );

    const viewMode =
        document.getElementById(
            "profileViewMode"
        );

    const editMode =
        document.getElementById(
            "profileEditMode"
        );


    if (
        !editBtn ||
        !saveBtn ||
        !cancelBtn ||
        !viewMode ||
        !editMode
    ) {

        return;

    }


    editBtn.addEventListener(
        "click",
        function () {

            document.getElementById(
                "editProfileName"
            ).value =
                studentName;

            document.getElementById(
                "editProfileEmail"
            ).value =
                studentEmail;

            document.getElementById(
                "editProfileDepartment"
            ).value =
                studentDepartment;


            viewMode.style.display =
                "none";

            editMode.style.display =
                "grid";

            editBtn.style.display =
                "none";

        }
    );


    cancelBtn.addEventListener(
        "click",
        function () {

            viewMode.style.display =
                "grid";

            editMode.style.display =
                "none";

            editBtn.style.display =
                "inline-block";

        }
    );


    saveBtn.addEventListener(
        "click",
        function () {

            const newName =
                document.getElementById(
                    "editProfileName"
                ).value
                    .trim();

            const newEmail =
                document.getElementById(
                    "editProfileEmail"
                ).value
                    .trim();

            const newDepartment =
                document.getElementById(
                    "editProfileDepartment"
                ).value
                    .trim();


            if (!newName) {

                alert(
                    "Name cannot be empty."
                );

                return;

            }


            localStorage.setItem(
                "studentName",
                newName
            );

            localStorage.setItem(
                "studentEmail",
                newEmail
            );

            localStorage.setItem(
                "studentDepartment",
                newDepartment ||
                "Computer Science"
            );


            /*
               Also keep the admin-facing
               student roster in sync, since
               admin.js reads the "students"
               list separately.
            */

            syncStudentIntoRoster(
                newName,
                newEmail,
                newDepartment
            );


            viewMode.style.display =
                "grid";

            editMode.style.display =
                "none";

            editBtn.style.display =
                "inline-block";


            window.location.reload();

        }
    );

}


/* =========================================================
   SYNC EDITED PROFILE INTO ADMIN ROSTER
   ========================================================= */

function syncStudentIntoRoster(
    name,
    email,
    department
) {

    if (!studentId) {

        return;

    }


    let roster;

    try {

        roster =
            JSON.parse(
                localStorage.getItem(
                    "students"
                ) || "[]"
            );

    } catch (error) {

        roster = [];

    }


    if (!Array.isArray(roster)) {

        roster = [];

    }


    const trimmedId =
        String(studentId).trim();


    const existing =
        roster.find(
            function (student) {

                return (
                    String(
                        (student && (student.id || student.studentId)) ||
                        ""
                    ).trim() ===
                    trimmedId
                );

            }
        );


    if (existing) {

        existing.name =
            name;

        existing.email =
            email;

        existing.department =
            department ||
            "Computer Science";

    } else {

        roster.push({

            id: trimmedId,

            name: name,

            email: email,

            department:
                department ||
                "Computer Science"

        });

    }


    localStorage.setItem(
        "students",
        JSON.stringify(roster)
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   AUTO REFRESH
   ========================================================= */

setInterval(
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadAssignments();

            loadStudentAlerts();

        }

    },
    5000
);


/* =========================================================
   STORAGE EVENT
   ========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "assignments"
        ) {

            console.log(
                "Assignments updated by admin."
            );


            loadAssignments();

        }


        if (
            event.key ===
            "studentAlerts"
        ) {

            console.log(
                "New admin alert received."
            );


            loadStudentAlerts();

        }

    }
);


/* =========================================================
   WINDOW FOCUS REFRESH
   ========================================================= */

window.addEventListener(
    "focus",
    function () {

        loadAssignments();

        loadStudentAlerts();

    }
);


/* =========================================================
   FINAL CONSOLE
   ========================================================= */

console.log(
    "Student Portal loaded successfully - LocalStorage Mode"
);