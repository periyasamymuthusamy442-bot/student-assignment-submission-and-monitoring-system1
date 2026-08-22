/* =========================================================
   STUDENT ASSIGNMENT TRACKING SYSTEM
   LOGIN JAVASCRIPT
========================================================= */


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loginForm = document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const usernameLabel =
    document.getElementById("usernameLabel");

const errorMsg =
    document.getElementById("errorMsg");

const roleButtons =
    document.querySelectorAll(".role-option");


/* =========================================================
   CURRENT ROLE
========================================================= */

let currentRole = "student";


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeRoleToggle();

    updateLoginForm();

    clearError();

});


/* =========================================================
   ROLE TOGGLE
========================================================= */

function initializeRoleToggle() {

    roleButtons.forEach(button => {

        button.addEventListener("click", () => {

            const selectedRole =
                button.dataset.role;

            if (!selectedRole) {
                return;
            }

            currentRole = selectedRole;


            /* Remove active from all */

            roleButtons.forEach(btn => {

                btn.classList.remove("active");

            });


            /* Add active to selected */

            button.classList.add("active");


            /* Update form */

            updateLoginForm();


            /* Clear old values */

            if (usernameInput) {
                usernameInput.value = "";
            }

            if (passwordInput) {
                passwordInput.value = "";
            }


            /* Clear error */

            clearError();


            if (usernameInput) {
                usernameInput.focus();
            }

        });

    });

}


/* =========================================================
   UPDATE LOGIN FORM
========================================================= */

function updateLoginForm() {

    if (!usernameLabel || !usernameInput) {
        return;
    }


    if (currentRole === "admin") {

        usernameLabel.textContent =
            "Teacher Username";

        usernameInput.placeholder =
            "Enter teacher username";

    } else {

        usernameLabel.textContent =
            "Registration Number";

        usernameInput.placeholder =
            "e.g. S001";

    }

}


/* =========================================================
   LOGIN FORM
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearError();


            /* =================================================
               GET INPUT VALUES
            ================================================= */

            const username =
                usernameInput
                    ? usernameInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value.trim()
                    : "";


            /* =================================================
               VALIDATION
            ================================================= */

            if (!username) {

                showError(
                    currentRole === "admin"
                        ? "Please enter teacher username."
                        : "Please enter registration number."
                );

                if (usernameInput) {
                    usernameInput.focus();
                }

                return;
            }


            if (!password) {

                showError(
                    "Please enter your password."
                );

                if (passwordInput) {
                    passwordInput.focus();
                }

                return;
            }


            /* =================================================
               LOGIN BUTTON
            ================================================= */

            const loginButton =
                loginForm.querySelector(
                    ".login-btn"
                );

            const oldButtonText =
                loginButton
                    ? loginButton.textContent
                    : "Login";


            if (loginButton) {

                loginButton.disabled = true;

                loginButton.textContent =
                    "Logging in...";

            }


            /* =================================================
               LOGIN REQUEST
            ================================================= */

            try {

                console.log(
                    "Attempting",
                    currentRole.toUpperCase(),
                    "login..."
                );


                const response =
                    await fetch(
                        "/api/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                role:
                                    currentRole,

                                username:
                                    username,

                                password:
                                    password

                            })

                        }
                    );


                /* =================================================
                   HTTP ERROR
                ================================================= */

                if (!response.ok) {

                    let errorData = {};

                    try {
                        errorData =
                            await response.json();
                    } catch (e) {
                        errorData = {};
                    }

                    throw new Error(
                        errorData.message ||
                        "Login failed. HTTP " +
                        response.status
                    );

                }


                /* =================================================
                   READ RESPONSE
                ================================================= */

                const data =
                    await response.json();


                console.log(
                    "Login response:",
                    data
                );


                /* =================================================
                   LOGIN FAILED
                ================================================= */

                if (
                    data.success !== true
                ) {

                    throw new Error(
                        data.message ||
                        "Invalid username or password."
                    );

                }


                /* =================================================
                   ADMIN LOGIN SUCCESS
                ================================================= */

                if (
                    currentRole === "admin"
                ) {

                    console.log(
                        "ADMIN LOGIN SUCCESS"
                    );


                    /* ---------------------------------------------
                       REMOVE OLD STUDENT SESSION
                    --------------------------------------------- */

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


                    /* ---------------------------------------------
                       GET ADMIN ID SAFELY
                    --------------------------------------------- */

                    const adminId =
                        data.id ||
                        data.adminId ||
                        data.username ||
                        data.name ||
                        username;


                    const adminName =
                        data.name ||
                        data.adminName ||
                        data.username ||
                        username;


                    /* ---------------------------------------------
                       SAVE ADMIN SESSION
                    --------------------------------------------- */

                    localStorage.setItem(
                        "adminLoggedIn",
                        "true"
                    );


                    localStorage.setItem(
                        "adminId",
                        String(adminId)
                    );


                    localStorage.setItem(
                        "adminName",
                        String(adminName)
                    );


                    localStorage.setItem(
                        "adminUsername",
                        String(
                            data.username ||
                            username
                        )
                    );


                    /* ---------------------------------------------
                       DEBUG
                    --------------------------------------------- */

                    console.log(
                        "Admin session saved:"
                    );

                    console.log(
                        "adminLoggedIn:",
                        localStorage.getItem(
                            "adminLoggedIn"
                        )
                    );

                    console.log(
                        "adminId:",
                        localStorage.getItem(
                            "adminId"
                        )
                    );

                    console.log(
                        "adminName:",
                        localStorage.getItem(
                            "adminName"
                        )
                    );


                    /* ---------------------------------------------
                       REDIRECT ADMIN
                    --------------------------------------------- */

                    window.location.href =
                        "admin-dashboard.html";

                    return;

                }


                /* =================================================
                   STUDENT LOGIN SUCCESS
                ================================================= */

                console.log(
                    "STUDENT LOGIN SUCCESS"
                );


                /* ---------------------------------------------
                   REMOVE OLD ADMIN SESSION
                --------------------------------------------- */

                localStorage.removeItem(
                    "adminLoggedIn"
                );

                localStorage.removeItem(
                    "adminUsername"
                );

                localStorage.removeItem(
                    "adminId"
                );

                localStorage.removeItem(
                    "adminName"
                );


                /* ---------------------------------------------
                   SAVE STUDENT SESSION
                --------------------------------------------- */

                localStorage.setItem(
                    "studentId",
                    data.id ||
                    data.studentId ||
                    username
                );


                localStorage.setItem(
                    "studentName",
                    data.name ||
                    data.studentName ||
                    "Student"
                );


                localStorage.setItem(
                    "studentEmail",
                    data.email ||
                    data.studentEmail ||
                    ""
                );


                localStorage.setItem(
                    "studentDepartment",
                    data.department ||
                    data.studentDepartment ||
                    "Computer Science"
                );


                /* ---------------------------------------------
                   DEBUG
                --------------------------------------------- */

                console.log(
                    "Student session saved:"
                );

                console.log(
                    "studentId:",
                    localStorage.getItem(
                        "studentId"
                    )
                );

                console.log(
                    "studentName:",
                    localStorage.getItem(
                        "studentName"
                    )
                );


                /* ---------------------------------------------
                   REDIRECT STUDENT
                --------------------------------------------- */

                window.location.href =
                    "student-dashboard.html";

            }


            /* =================================================
               LOGIN ERROR
            ================================================= */

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showError(
                    error.message ||
                    "Login failed. Please try again."
                );

            }


            /* =================================================
               ENABLE LOGIN BUTTON
            ================================================= */

            finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        oldButtonText;

                }

            }

        }
    );

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(message) {

    if (!errorMsg) {
        return;
    }


    errorMsg.textContent =
        message;


    errorMsg.style.display =
        "block";

}


/* =========================================================
   CLEAR ERROR
========================================================= */

function clearError() {

    if (!errorMsg) {
        return;
    }


    errorMsg.textContent =
        "";


    errorMsg.style.display =
        "none";

}


/* =========================================================
   ENTER KEY SUPPORT
========================================================= */

if (passwordInput) {

    passwordInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();


                if (loginForm) {

                    loginForm.requestSubmit();

                }

            }

        }
    );

}


/* =========================================================
   PAGE SHOW
========================================================= */

window.addEventListener(
    "pageshow",
    () => {

        const loginButton =
            document.querySelector(
                ".login-btn"
            );


        if (loginButton) {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";

        }

    }
);