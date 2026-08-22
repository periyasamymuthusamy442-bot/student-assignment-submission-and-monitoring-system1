/* =========================================================
   ADMIN DASHBOARD
   STUDENT ASSIGNMENT TRACKING SYSTEM

   STORAGE:
   LOCAL STORAGE ONLY

   IMPORTANT FIXES:
   1. Detect studentId/studentName login data
   2. Correct total student count
   3. Correct submitted count
   4. Correct pending / not submitted count
   5. Do not trust stale empty pendingStudents
   6. Existing assignments also get corrected
   7. New assignments automatically include students
   8. Alerts work with pending students
   9. Dashboard auto refresh
========================================================= */


/* =========================================================
   ADMIN SESSION
========================================================= */

const adminId =
    localStorage.getItem("adminId");

const adminLoggedIn =
    localStorage.getItem("adminLoggedIn");

const adminName =
    localStorage.getItem("adminName") ||
    localStorage.getItem("adminUsername") ||
    "Admin";


/* =========================================================
   ADMIN SESSION PROTECTION
========================================================= */

if (
    !adminId ||
    adminId === "null" ||
    adminId === "undefined" ||
    String(adminId).trim() === ""
) {
    console.warn(
        "Admin session not found."
    );

    window.location.href =
        "index.html?role=admin";
}


/* =========================================================
   SEED DEMO STUDENT ROSTER
   (nothing in this app ever writes a student list into
   localStorage on its own, so getStudents() would stay
   empty forever - this seeds the known accounts from
   data/students.txt once, so admin can see everyone,
   not just whichever student last logged in)
========================================================= */

function seedDemoStudentsIfMissing() {

    const existing =
        parseJSON(
            "students",
            []
        );


    if (
        Array.isArray(existing) &&
        existing.length > 0
    ) {

        return;

    }


    const demoStudents = [

        {
            id: "S001",
            name: "Arun",
            email: "arun@gmail.com",
            department: "Computer Science"
        },

        {
            id: "S002",
            name: "Kumar",
            email: "kumar@gmail.com",
            department: "Computer Science"
        },

        {
            id: "S003",
            name: "Ravi",
            email: "ravi@gmail.com",
            department: "Computer Science"
        }

    ];


    localStorage.setItem(
        "students",
        JSON.stringify(
            demoStudents
        )
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        seedDemoStudentsIfMissing();

        initializeAdmin();

        initializeSidebar();

        initializeLogout();

        initializeCreateAssignment();

        initializeAddStudent();

        initializeRequestActions();

        loadDashboard();

        refreshRequestBadge();

    }
);


/* =========================================================
   INITIALIZE ADMIN
========================================================= */

function initializeAdmin() {

    const possibleNameElements = [
        "adminName",
        "headerAdminName",
        "profileName",
        "adminUsername"
    ];


    possibleNameElements.forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    adminName;

            }

        }
    );


    const adminIdElement =
        document.getElementById(
            "adminId"
        );


    if (adminIdElement) {

        adminIdElement.textContent =
            adminId;

    }


    const avatar =
        document.getElementById(
            "adminAvatar"
        );


    if (avatar) {

        avatar.textContent =
            getInitials(adminName);

    }

}


/* =========================================================
   GET INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {
        return "AD";
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
   SIDEBAR
========================================================= */

function initializeSidebar() {

    const tabs =
        document.querySelectorAll(
            ".sidebar-link[data-tab]"
        );


    const dashboardTab =
        document.getElementById(
            "dashboardTab"
        );


    const createTab =
        document.getElementById(
            "createTab"
        );


    const addStudentTab =
        document.getElementById(
            "addStudentTab"
        );


    const requestsTab =
        document.getElementById(
            "requestsTab"
        );


    tabs.forEach(
        function (tab) {

            tab.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    tabs.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    if (dashboardTab) {

                        dashboardTab.style.display =
                            "none";

                    }


                    if (createTab) {

                        createTab.style.display =
                            "none";

                    }


                    if (addStudentTab) {

                        addStudentTab.style.display =
                            "none";

                    }


                    if (requestsTab) {

                        requestsTab.style.display =
                            "none";

                    }


                    const targetId =
                        tab.dataset.tab;


                    const target =
                        document.getElementById(
                            targetId
                        );


                    if (target) {

                        target.style.display =
                            "block";

                    }


                    if (
                        targetId ===
                        "dashboardTab"
                    ) {

                        loadDashboard();

                    }


                    if (
                        targetId ===
                        "requestsTab"
                    ) {

                        loadSubmissionRequests();

                    }

                }
            );

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) {

        console.warn(
            "logoutBtn not found."
        );

        return;

    }


    logoutBtn.addEventListener(
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
                "adminId"
            );

            localStorage.removeItem(
                "adminName"
            );

            localStorage.removeItem(
                "adminUsername"
            );

            localStorage.removeItem(
                "adminLoggedIn"
            );


            /*
             * Student session cleanup
             */

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

}


/* =========================================================
   SAFE JSON PARSER
========================================================= */

function parseJSON(
    key,
    fallback = []
) {

    try {

        const value =
            localStorage.getItem(key);


        if (!value) {
            return fallback;
        }


        const parsed =
            JSON.parse(value);


        return parsed;

    } catch (error) {

        console.warn(
            `Unable to parse localStorage key: ${key}`,
            error
        );

        return fallback;

    }

}


/* =========================================================
   GET ASSIGNMENTS
========================================================= */

function getAssignments() {

    const data =
        parseJSON(
            "assignments",
            []
        );


    return Array.isArray(data)
        ? data
        : [];

}


/* =========================================================
   SAVE ASSIGNMENTS
========================================================= */

function saveAssignments(
    assignments
) {

    localStorage.setItem(
        "assignments",
        JSON.stringify(
            assignments
        )
    );

}


/* =========================================================
   SUBMISSION REQUESTS
   (students create these when they mark work done;
   admin must approve before it counts as submitted)
========================================================= */

function getSubmissionRequests() {

    const data =
        parseJSON(
            "submissionRequests",
            []
        );


    return Array.isArray(data)
        ? data
        : [];

}


function saveSubmissionRequests(
    requests
) {

    localStorage.setItem(
        "submissionRequests",
        JSON.stringify(
            requests
        )
    );

}


function refreshRequestBadge() {

    const badge =
        document.getElementById(
            "requestBadge"
        );


    if (!badge) {

        return;

    }


    const pendingCount =
        getSubmissionRequests()
            .filter(function (request) {

                return (
                    request.status ===
                    "pending"
                );

            })
            .length;


    if (pendingCount > 0) {

        badge.textContent =
            String(pendingCount);

        badge.style.display =
            "inline-flex";

    } else {

        badge.style.display =
            "none";

    }

}


function loadSubmissionRequests() {

    const tbody =
        document.getElementById(
            "requestsTableBody"
        );


    if (!tbody) {

        return;

    }


    const requests =
        getSubmissionRequests()
            .slice()
            .sort(function (a, b) {

                return (
                    new Date(
                        b.requestedAt || 0
                    ) -
                    new Date(
                        a.requestedAt || 0
                    )
                );

            });


    if (requests.length === 0) {

        tbody.innerHTML =
            "<tr><td colspan=\"5\" class=\"table-loading\">" +
            "No submission requests yet." +
            "</td></tr>";

        refreshRequestBadge();

        return;

    }


    tbody.innerHTML =
        requests
            .map(function (request) {

                const requestedOn =
                    request.requestedAt
                        ? new Date(
                            request.requestedAt
                          ).toLocaleString()
                        : "-";


                let statusHTML = "";

                let actionHTML = "";


                if (
                    request.status ===
                    "approved"
                ) {

                    statusHTML =
                        "<span class=\"req-status req-approved\">✓ Approved</span>";

                    actionHTML =
                        "<span class=\"req-done-label\">Verified</span>";

                } else if (
                    request.status ===
                    "rejected"
                ) {

                    statusHTML =
                        "<span class=\"req-status req-rejected\">✗ Rejected</span>";

                    actionHTML =
                        "<span class=\"req-done-label\">Sent back to student</span>";

                } else {

                    statusHTML =
                        "<span class=\"req-status req-pending\">⏳ Pending Review</span>";

                    actionHTML =
                        "<button type=\"button\" class=\"approve-btn\" data-request-id=\"" +
                        escapeHTML(request.id) +
                        "\">✓ Approve</button>" +
                        "<button type=\"button\" class=\"reject-btn\" data-request-id=\"" +
                        escapeHTML(request.id) +
                        "\">✗ Reject</button>";

                }


                return (
                    "<tr>" +
                    "<td><strong>" + escapeHTML(request.studentName || request.studentId) + "</strong>" +
                    "<div class=\"req-sub\">" + escapeHTML(request.studentId) + "</div></td>" +
                    "<td>" + escapeHTML(request.assignmentTitle) + "</td>" +
                    "<td>" + escapeHTML(requestedOn) + "</td>" +
                    "<td>" + statusHTML + "</td>" +
                    "<td class=\"req-actions\">" + actionHTML + "</td>" +
                    "</tr>"
                );

            })
            .join("");


    refreshRequestBadge();

}


function approveSubmissionRequest(
    requestId
) {

    const requests =
        getSubmissionRequests();


    const request =
        requests.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(requestId)
                );

            }
        );


    if (!request) {

        return;

    }


    request.status =
        "approved";


    saveSubmissionRequests(
        requests
    );


    const assignments =
        getAssignments();


    const assignment =
        assignments.find(
            function (item) {

                return (
                    String(
                        item.assignmentId ||
                        item.id ||
                        ""
                    ) ===
                    String(
                        request.assignmentId
                    )
                );

            }
        );


    if (assignment) {

        if (
            !Array.isArray(
                assignment.submittedStudents
            )
        ) {

            assignment.submittedStudents = [];

        }


        const trimmedId =
            String(
                request.studentId
            ).trim();


        const already =
            assignment.submittedStudents
                .map(function (entry) {

                    return typeof entry === "object"
                        ? String(
                            entry.studentId ||
                            entry.id ||
                            ""
                        ).trim()
                        : String(entry).trim();

                })
                .includes(trimmedId);


        if (!already) {

            assignment.submittedStudents.push(
                trimmedId
            );

        }


        if (
            Array.isArray(
                assignment.pendingStudents
            )
        ) {

            assignment.pendingStudents =
                assignment.pendingStudents.filter(
                    function (student) {

                        const id =
                            typeof student === "object"
                                ? String(
                                    student.id ||
                                    student.studentId ||
                                    ""
                                ).trim()
                                : String(
                                    student
                                ).trim();

                        return id !== trimmedId;

                    }
                );

        }


        assignment.submitted =
            assignment.submittedStudents.length;


        saveAssignments(
            assignments
        );

    }


    loadSubmissionRequests();

    loadDashboard();

}


function rejectSubmissionRequest(
    requestId
) {

    const requests =
        getSubmissionRequests();


    const request =
        requests.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(requestId)
                );

            }
        );


    if (!request) {

        return;

    }


    request.status =
        "rejected";


    saveSubmissionRequests(
        requests
    );


    loadSubmissionRequests();

}


function initializeRequestActions() {

    const tbody =
        document.getElementById(
            "requestsTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.addEventListener(
        "click",
        function (event) {

            const approveBtn =
                event.target.closest(
                    ".approve-btn"
                );


            if (approveBtn) {

                approveSubmissionRequest(
                    approveBtn.dataset
                        .requestId
                );

                return;

            }


            const rejectBtn =
                event.target.closest(
                    ".reject-btn"
                );


            if (rejectBtn) {

                if (
                    confirm(
                        "Reject this submission? " +
                        "The student will need to resubmit."
                    )
                ) {

                    rejectSubmissionRequest(
                        rejectBtn.dataset
                            .requestId
                    );

                }

            }

        }
    );

}


/* =========================================================
   GET STUDENTS
=========================================================

   IMPORTANT:

   Student login stores:

   studentId
   studentName
   studentEmail
   studentDepartment

   So admin must also detect those values.

   Additionally check:
   registeredStudents
   students
   studentUsers
   users
   registeredUsers
========================================================= */

function getStudents() {

    const studentsMap =
        new Map();


    /*
     * Possible array based student storage
     */

    const possibleKeys = [
        "registeredStudents",
        "students",
        "studentUsers",
        "registeredUsers",
        "users"
    ];


    possibleKeys.forEach(
        function (key) {

            const data =
                parseJSON(
                    key,
                    []
                );


            if (!Array.isArray(data)) {
                return;
            }


            data.forEach(
                function (student) {

                    if (
                        !student ||
                        typeof student !== "object"
                    ) {
                        return;
                    }


                    const normalized =
                        normalizeStudent(
                            student
                        );


                    if (!normalized.id) {
                        return;
                    }


                    studentsMap.set(
                        String(
                            normalized.id
                        ).trim(),
                        normalized
                    );

                }
            );

        }
    );


    /*
     * IMPORTANT:
     *
     * Also detect currently logged-in student.
     */

    const currentStudentId =
        localStorage.getItem(
            "studentId"
        );


    const currentStudentName =
        localStorage.getItem(
            "studentName"
        );


    const currentStudentEmail =
        localStorage.getItem(
            "studentEmail"
        );


    const currentStudentDepartment =
        localStorage.getItem(
            "studentDepartment"
        );


    if (
        currentStudentId &&
        String(currentStudentId).trim() !== ""
    ) {

        const currentStudent = {

            id:
                String(
                    currentStudentId
                ).trim(),

            name:
                currentStudentName ||
                "Student",

            email:
                currentStudentEmail ||
                "",

            department:
                currentStudentDepartment ||
                ""

        };


        studentsMap.set(
            currentStudent.id,
            currentStudent
        );

    }


    return Array.from(
        studentsMap.values()
    );

}


/* =========================================================
   NORMALIZE STUDENT
========================================================= */

function normalizeStudent(
    student
) {

    if (
        !student ||
        typeof student !== "object"
    ) {

        return {
            id: "",
            name: "Student",
            email: "",
            department: ""
        };

    }


    const id =
        student.studentId ||
        student.id ||
        student.userId ||
        student.username ||
        student.rollNo ||
        student.rollNumber ||
        "";


    const name =
        student.studentName ||
        student.name ||
        student.fullName ||
        student.username ||
        "Student";


    const email =
        student.studentEmail ||
        student.email ||
        "";


    const department =
        student.studentDepartment ||
        student.department ||
        "";


    return {

        id:
            String(id).trim(),

        name:
            String(name).trim() ||
            "Student",

        email:
            String(email).trim(),

        department:
            String(department).trim()

    };

}


/* =========================================================
   GET STUDENT ID
========================================================= */

function getStudentId(
    student
) {

    const normalized =
        normalizeStudent(
            student
        );


    return String(
        normalized.id || ""
    ).trim();

}


/* =========================================================
   GET SUBMITTED STUDENT IDS
========================================================= */

function getSubmittedStudentIds(
    assignment
) {

    if (!assignment) {
        return [];
    }


    const submittedSources = [

        assignment.submittedStudents,

        assignment.submissions,

        assignment.submittedBy,

        assignment.completedStudents,

        assignment.submittedStudentIds

    ];


    let submitted = null;


    for (
        const source
        of submittedSources
    ) {

        if (
            Array.isArray(source) &&
            source.length > 0
        ) {

            submitted = source;
            break;

        }


        if (
            typeof source === "string" &&
            source.trim() !== ""
        ) {

            submitted = source;
            break;

        }

    }


    if (Array.isArray(submitted)) {

        const ids =
            submitted
                .map(
                    function (student) {

                        if (
                            typeof student ===
                            "object"
                        ) {

                            return String(
                                student.studentId ||
                                student.id ||
                                student.userId ||
                                student.username ||
                                ""
                            ).trim();

                        }


                        return String(
                            student
                        ).trim();

                    }
                )
                .filter(Boolean);


        return [
            ...new Set(ids)
        ];

    }


    if (
        typeof submitted ===
        "string"
    ) {

        const ids =
            submitted
                .split(";")
                .map(
                    function (item) {

                        return String(item)
                            .split(":")[0]
                            .trim();

                    }
                )
                .filter(Boolean);


        return [
            ...new Set(ids)
        ];

    }


    /*
     * Also support:
     *
     * submittedStudents:
     * {
     *   S001: true,
     *   S002: true
     * }
     */

    if (
        assignment.submittedStudents &&
        typeof assignment.submittedStudents ===
            "object" &&
        !Array.isArray(
            assignment.submittedStudents
        )
    ) {

        return Object.keys(
            assignment.submittedStudents
        )
            .filter(
                function (id) {

                    return (
                        assignment.submittedStudents[id] ===
                        true
                    );

                }
            )
            .map(
                function (id) {

                    return String(id)
                        .trim();

                }
            );

    }


    return [];

}


/* =========================================================
   GET SUBMITTED COUNT
========================================================= */

function getSubmittedCount(
    assignment
) {

    const submittedIds =
        getSubmittedStudentIds(
            assignment
        );


    /*
     * First priority:
     * Actual submitted student IDs
     */

    if (
        submittedIds.length > 0
    ) {

        return submittedIds.length;

    }


    /*
     * Backward compatibility:
     * If old assignment contains
     * numeric submitted value.
     */

    const numericSubmitted =
        Number(
            assignment &&
            assignment.submitted
        );


    if (
        Number.isFinite(
            numericSubmitted
        ) &&
        numericSubmitted > 0
    ) {

        return Math.max(
            0,
            Math.floor(
                numericSubmitted
            )
        );

    }


    return 0;

}


/* =========================================================
   GET PENDING STUDENTS
=========================================================

   IMPORTANT FIX:

   DO NOT blindly trust:

   assignment.pendingStudents

   because old assignments may have:

   pendingStudents: []

   even when students exist.

   We always calculate:

   ALL STUDENTS - SUBMITTED STUDENTS
========================================================= */

function getPendingStudents(
    assignment,
    students
) {

    const allStudents =
        Array.isArray(students)
            ? students
                .map(
                    normalizeStudent
                )
                .filter(
                    function (student) {

                        return (
                            student.id
                        );

                    }
                )
            : [];


    const submittedIds =
        getSubmittedStudentIds(
            assignment
        );


    const submittedSet =
        new Set(
            submittedIds.map(
                function (id) {

                    return String(
                        id
                    ).trim();

                }
            )
        );


    /*
     * Correct calculation
     */

    const pending =
        allStudents.filter(
            function (student) {

                return !submittedSet.has(
                    String(
                        student.id
                    ).trim()
                );

            }
        );


    return pending.map(
        function (student) {

            return {

                id:
                    student.id,

                name:
                    student.name,

                email:
                    student.email

            };

        }
    );

}


/* =========================================================
   CALCULATE ASSIGNMENT STATS
========================================================= */

function calculateAssignmentStats(
    assignment,
    students
) {

    const totalStudents =
        students.length;


    const submittedIds =
        getSubmittedStudentIds(
            assignment
        );


    let submittedCount =
        submittedIds.length;


    /*
     * Backward compatibility
     */

    if (
        submittedCount === 0
    ) {

        const oldSubmitted =
            Number(
                assignment.submitted || 0
            );


        if (
            Number.isFinite(
                oldSubmitted
            ) &&
            oldSubmitted > 0
        ) {

            submittedCount =
                Math.min(
                    oldSubmitted,
                    totalStudents
                );

        }

    }


    const pendingStudents =
        getPendingStudents(
            assignment,
            students
        );


    /*
     * If there are students,
     * pending = total - submitted.
     *
     * Never allow negative values.
     */

    const pendingCount =
        Math.max(
            totalStudents -
            submittedCount,
            0
        );


    return {

        totalStudents:
            totalStudents,

        submitted:
            submittedCount,

        notSubmitted:
            pendingCount,

        pendingStudents:
            pendingStudents

    };

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

function loadDashboard() {

    try {

        const assignments =
            getAssignments();


        const students =
            getStudents();


        updateDashboardStatistics(
            assignments,
            students
        );


        renderAssignmentsTable(
            assignments,
            students
        );


        console.log(
            "================================="
        );

        console.log(
            "ADMIN DASHBOARD DATA"
        );

        console.log(
            "Students:",
            students
        );

        console.log(
            "Assignments:",
            assignments
        );

        console.log(
            "Total Students:",
            students.length
        );

        console.log(
            "================================="
        );


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


/* =========================================================
   UPDATE DASHBOARD STATISTICS
========================================================= */

function updateDashboardStatistics(
    assignments,
    students
) {

    let totalSubmissions =
        0;


    let totalPending =
        0;


    assignments.forEach(
        function (assignment) {

            const stats =
                calculateAssignmentStats(
                    assignment,
                    students
                );


            totalSubmissions +=
                stats.submitted;


            totalPending +=
                stats.notSubmitted;

        }
    );


    /*
     * Total Students
     */

    setText(
        "totalStudents",
        students.length
    );


    /*
     * Total Assignments
     */

    setText(
        "totalAssignments",
        assignments.length
    );


    /*
     * Total Submissions
     */

    setText(
        "totalSubmissions",
        totalSubmissions
    );


    /*
     * Total Pending
     */

    setText(
        "totalPending",
        totalPending
    );

}


/* =========================================================
   RENDER ASSIGNMENTS TABLE
========================================================= */

function renderAssignmentsTable(
    assignments,
    students
) {

    const tbody =
        document.getElementById(
            "assignmentsTableBody"
        );


    if (!tbody) {

        console.warn(
            "assignmentsTableBody not found."
        );

        return;

    }


    tbody.innerHTML =
        "";


    if (
        assignments.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        color:#9ca3af;
                        padding:30px;
                    "
                >

                    No assignments yet

                </td>

            </tr>

        `;

        return;

    }


    assignments.forEach(
        function (assignment) {

            const stats =
                calculateAssignmentStats(
                    assignment,
                    students
                );


            /*
             * Save corrected values
             * back into assignment.
             */

            assignment.submitted =
                stats.submitted;


            assignment.pendingStudents =
                stats.pendingStudents;


            const title =
                escapeHTML(
                    assignment.title ||
                    "Untitled Assignment"
                );


            const dueDate =
                escapeHTML(
                    assignment.dueDate ||
                    "-"
                );


            const dueTime =
                escapeHTML(
                    assignment.dueTime ||
                    "-"
                );


            const assignmentId =
                assignment.assignmentId ||
                assignment.id ||
                assignment._id ||
                "";


            const pendingNames =
                stats.pendingStudents
                    .map(
                        function (student) {

                            return student.name;

                        }
                    )
                    .join(", ");


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${title}
                    </strong>

                </td>


                <td>

                    ${dueDate}

                </td>


                <td>

                    ${dueTime}

                </td>


                <td>

                    <span
                        class="badge badge-submitted"
                    >
                        ${stats.submitted}
                    </span>

                </td>


                <td>

                    <span
                        class="badge badge-pending"
                    >
                        ${stats.notSubmitted}
                    </span>

                    ${
                        pendingNames
                            ? `
                                <div
                                    class="pending-names"
                                >
                                    ${escapeHTML(
                                        pendingNames
                                    )}
                                </div>
                              `
                            : ""
                    }

                </td>


                <td>

                    ${
                        stats.notSubmitted > 0

                            ? `

                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-danger
                                        sendAlertBtn
                                    "
                                    data-id="${escapeHTML(
                                        String(
                                            assignmentId
                                        )
                                    )}"
                                    data-title="${escapeHTML(
                                        assignment.title ||
                                        "Assignment"
                                    )}"
                                >

                                    Send Alert

                                </button>

                              `

                            : `

                                <span
                                    style="
                                        color:#059669;
                                        font-size:12px;
                                        font-weight:600;
                                    "
                                >

                                    All submitted ✓

                                </span>

                              `
                    }

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    /*
     * Save corrected assignment data
     */

    saveAssignments(
        assignments
    );


    initializeSendAlertButtons();

}


/* =========================================================
   SEND ALERT BUTTONS
========================================================= */

function initializeSendAlertButtons() {

    const buttons =
        document.querySelectorAll(
            ".sendAlertBtn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const assignmentId =
                        button.dataset.id;


                    const title =
                        button.dataset.title ||
                        "Assignment";


                    sendAlertsForAssignment(
                        assignmentId,
                        title,
                        button
                    );

                }
            );

        }
    );

}


/* =========================================================
   SEND ALERTS
========================================================= */

function sendAlertsForAssignment(
    assignmentId,
    title,
    button
) {

    try {

        if (!assignmentId) {

            alert(
                "Assignment ID not found."
            );

            return;

        }


        const assignments =
            getAssignments();


        const assignment =
            assignments.find(
                function (item) {

                    return String(
                        item.assignmentId ||
                        item.id ||
                        item._id ||
                        ""
                    ) ===
                    String(
                        assignmentId
                    );

                }
            );


        if (!assignment) {

            alert(
                "Assignment not found."
            );

            return;

        }


        const students =
            getStudents();


        const pendingStudents =
            getPendingStudents(
                assignment,
                students
            );


        if (
            pendingStudents.length ===
            0
        ) {

            alert(
                "All students have submitted this assignment."
            );

            return;

        }


        let alerts =
            parseJSON(
                "studentAlerts",
                []
            );


        if (!Array.isArray(alerts)) {

            alerts = [];

        }


        let successCount =
            0;


        pendingStudents.forEach(
            function (student) {

                const studentId =
                    String(
                        student.id ||
                        student.studentId ||
                        ""
                    ).trim();


                if (!studentId) {
                    return;
                }


                /*
                 * Prevent duplicate unread alert
                 */

                const duplicate =
                    alerts.some(
                        function (alertItem) {

                            return (

                                String(
                                    alertItem.studentId
                                ) ===
                                studentId &&

                                String(
                                    alertItem.assignmentId
                                ) ===
                                String(
                                    assignmentId
                                ) &&

                                alertItem.read !==
                                true

                            );

                        }
                    );


                if (duplicate) {
                    return;
                }


                alerts.push({

                    id:
                        "alert_" +
                        Date.now() +
                        "_" +
                        Math.random()
                            .toString(36)
                            .substring(2, 8),

                    studentId:
                        studentId,

                    studentName:
                        student.name ||
                        "Student",

                    assignmentId:
                        String(
                            assignmentId
                        ),

                    title:
                        "Assignment Reminder",

                    message:
                        `Reminder: Please submit your ${title} assignment before the deadline.`,

                    read:
                        false,

                    createdAt:
                        new Date()
                            .toISOString()

                });


                successCount++;

            }
        );


        localStorage.setItem(
            "studentAlerts",
            JSON.stringify(
                alerts
            )
        );


        /*
         * Update assignment
         */

        assignment.lastAlertSentAt =
            new Date()
                .toISOString();


        assignment.pendingStudents =
            pendingStudents;


        localStorage.setItem(
            "assignments",
            JSON.stringify(
                assignments
            )
        );


        if (
            successCount ===
            0
        ) {

            alert(
                "Alert already sent to all pending students."
            );

            return;

        }


        alert(
            `Alerts sent successfully to ${successCount} pending student(s)!`
        );


        if (button) {

            const oldText =
                button.textContent;


            button.textContent =
                "Alert Sent ✓";


            button.disabled =
                true;


            setTimeout(
                function () {

                    button.textContent =
                        oldText;

                    button.disabled =
                        false;

                },
                2000
            );

        }


        loadDashboard();


    } catch (error) {

        console.error(
            "Send alert error:",
            error
        );


        alert(
            "Unable to send alert."
        );

    }

}


/* =========================================================
   CREATE ASSIGNMENT
========================================================= */

function initializeCreateAssignment() {

    const form =
        document.getElementById(
            "createAssignmentForm"
        );


    if (!form) {

        console.warn(
            "createAssignmentForm not found."
        );

        return;

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const msgBox =
                document.getElementById(
                    "createMsg"
                );


            if (msgBox) {

                msgBox.textContent =
                    "";

            }


            const title =
                getInputValue(
                    "title"
                );


            const description =
                getInputValue(
                    "description"
                );


            const dueDate =
                getInputValue(
                    "dueDate"
                );


            const dueTime =
                getInputValue(
                    "dueTime"
                );


            if (!title) {

                showCreateMessage(
                    "Please enter assignment title.",
                    "error"
                );

                return;

            }


            if (!dueDate) {

                showCreateMessage(
                    "Please select due date.",
                    "error"
                );

                return;

            }


            if (!dueTime) {

                showCreateMessage(
                    "Please select due time.",
                    "error"
                );

                return;

            }


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            const oldText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Posting...";

            }


            try {

                const assignments =
                    getAssignments();


                const students =
                    getStudents();


                /*
                 * Unique assignment ID
                 */

                const assignmentId =
                    "A" +
                    Date.now();


                /*
                 * IMPORTANT:
                 *
                 * Initially every registered
                 * student is pending.
                 */

                const pendingStudents =
                    students
                        .map(
                            normalizeStudent
                        )
                        .filter(
                            function (student) {

                                return (
                                    student.id
                                );

                            }
                        )
                        .map(
                            function (student) {

                                return {

                                    id:
                                        student.id,

                                    name:
                                        student.name,

                                    email:
                                        student.email

                                };

                            }
                        );


                const newAssignment = {

                    assignmentId:
                        assignmentId,

                    title:
                        title,

                    description:
                        description,

                    subject:
                        "Academic Assignment",

                    dueDate:
                        dueDate,

                    dueTime:
                        dueTime,

                    status:
                        "Pending",

                    submitted:
                        0,

                    submittedStudents:
                        [],

                    pendingStudents:
                        pendingStudents,

                    createdAt:
                        new Date()
                            .toISOString(),

                    createdBy:
                        adminId

                };


                assignments.push(
                    newAssignment
                );


                saveAssignments(
                    assignments
                );


                showCreateMessage(
                    "Assignment posted successfully!",
                    "success"
                );


                form.reset();


                /*
                 * Refresh dashboard
                 */

                loadDashboard();


                console.log(
                    "New assignment:",
                    newAssignment
                );


            } catch (error) {

                console.error(
                    "Create assignment error:",
                    error
                );


                showCreateMessage(
                    "Unable to save assignment.",
                    "error"
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        oldText;

                }

            }

        }
    );

}


/* =========================================================
   SAVE STUDENTS (localStorage)
========================================================= */

function saveStudents(students) {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

}


/* =========================================================
   ADD STUDENT (teacher form)
   Posts to the real backend (/api/students) so the new
   student can log in for real, AND mirrors the record into
   localStorage so the rest of the dashboard (which is
   localStorage-driven) sees them immediately too.
========================================================= */

function initializeAddStudent() {

    const form =
        document.getElementById(
            "addStudentForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const msgBox =
                document.getElementById(
                    "addStudentMsg"
                );


            if (msgBox) {

                msgBox.textContent = "";

                msgBox.className =
                    "create-message";

            }


            const name =
                getInputValue(
                    "studentFullName"
                );

            const regNo =
                getInputValue(
                    "studentRegNo"
                );

            const department =
                getInputValue(
                    "studentDept"
                ) ||
                "Computer Science";

            const email =
                getInputValue(
                    "studentEmailInput"
                );

            const password =
                getInputValue(
                    "studentPasswordInput"
                );


            if (
                !name ||
                !regNo ||
                !password
            ) {

                showAddStudentMessage(
                    "Please fill in name, registration number and password.",
                    "error"
                );

                return;

            }


            const existing =
                getStudents().find(
                    function (student) {

                        return (
                            String(
                                normalizeStudent(student).id
                            ).trim()
                                .toLowerCase() ===
                            regNo.trim().toLowerCase()
                        );

                    }
                );


            if (existing) {

                showAddStudentMessage(
                    "A student with that registration number already exists.",
                    "error"
                );

                return;

            }


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            const oldText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Adding...";

            }


            let backendOk = false;


            try {

                const response =
                    await fetch(
                        "/api/students",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                id: regNo,

                                name: name,

                                email: email,

                                password: password,

                                department: department

                            })

                        }
                    );


                const data =
                    await response.json()
                        .catch(function () {

                            return {};

                        });


                backendOk =
                    data &&
                    data.success === true;


                if (
                    !backendOk &&
                    data &&
                    data.message
                ) {

                    showAddStudentMessage(
                        data.message,
                        "error"
                    );

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.textContent =
                            oldText;

                    }

                    return;

                }

            } catch (error) {

                /*
                   Backend not reachable - fall back to
                   the localStorage-only roster so the
                   demo still works, but let the teacher
                   know real login won't work yet.
                */

                console.warn(
                    "Could not reach /api/students:",
                    error
                );

            }


            const students =
                getStudents();


            students.push({

                id: regNo,

                name: name,

                email: email,

                department: department

            });


            saveStudents(
                students
            );


            showAddStudentMessage(
                backendOk
                    ? "Student added! They can now log in with their registration number and password."
                    : "Student added locally. (Could not reach the server, so real login isn't set up yet - make sure the app is running through java -cp out Main.)",
                backendOk ? "success" : "error"
            );


            form.reset();


            loadDashboard();


            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    oldText;

            }

        }
    );

}


function showAddStudentMessage(
    message,
    type
) {

    const msgBox =
        document.getElementById(
            "addStudentMsg"
        );


    if (!msgBox) {

        return;

    }


    msgBox.textContent =
        message;


    msgBox.className =
        "create-message " +
        (type === "success"
            ? "success"
            : "error");

}


/* =========================================================
   GET INPUT VALUE
========================================================= */

function getInputValue(id) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return "";
    }


    return String(
        element.value || ""
    ).trim();

}


/* =========================================================
   CREATE MESSAGE
========================================================= */

function showCreateMessage(
    message,
    type
) {

    const msgBox =
        document.getElementById(
            "createMsg"
        );


    if (!msgBox) {
        return;
    }


    msgBox.textContent =
        message;


    if (
        type ===
        "success"
    ) {

        msgBox.style.color =
            "#059669";

    } else {

        msgBox.style.color =
            "#dc2626";

    }

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ?? "";

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

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

            loadDashboard();

        }

    },
    5000
);


/* =========================================================
   WINDOW FOCUS
========================================================= */

window.addEventListener(
    "focus",
    function () {

        loadDashboard();

    }
);


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (

            event.key ===
                "assignments" ||

            event.key ===
                "studentAlerts" ||

            event.key ===
                "studentId" ||

            event.key ===
                "studentName" ||

            event.key ===
                "registeredStudents" ||

            event.key ===
                "students" ||

            event.key ===
                "studentUsers"

        ) {

            loadDashboard();

        }

    }
);


/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "================================="
);

console.log(
    "Admin dashboard loaded successfully."
);

console.log(
    "Admin ID:",
    adminId
);

console.log(
    "Admin Name:",
    adminName
);

console.log(
    "Students detected:",
    getStudents()
);

console.log(
    "Assignments detected:",
    getAssignments()
);

console.log(
    "================================="
);