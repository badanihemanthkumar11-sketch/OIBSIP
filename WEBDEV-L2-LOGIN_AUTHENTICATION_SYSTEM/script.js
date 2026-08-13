// ========================================
// Password Hashing using SHA-256
// ========================================

async function hashPassword(password) {
    const encoder = new TextEncoder();

    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


// ========================================
// Get Users from localStorage
// ========================================

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}


// ========================================
// Save Users to localStorage
// ========================================

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}


// ========================================
// Registration
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const username = document
            .getElementById("registerUsername")
            .value
            .trim();

        const password = document
            .getElementById("registerPassword")
            .value;

        const message = document.getElementById("registerMessage");

        message.textContent = "";
        message.style.color = "#dc3545";


        // Basic validation

        if (username === "" || password === "") {
            message.textContent = "Please fill in all fields.";
            return;
        }


        // Password validation

        if (password.length < 8) {
            message.textContent =
                "Password must contain at least 8 characters.";
            return;
        }

        if (!/\d/.test(password)) {
            message.textContent =
                "Password must contain at least 1 number.";
            return;
        }


        // Check duplicate user

        const users = getUsers();

        const existingUser = users.find(
            user => user.username.toLowerCase() === username.toLowerCase()
        );

        if (existingUser) {
            message.textContent =
                "Username or email already exists.";
            return;
        }


        // Hash password

        const hashedPassword = await hashPassword(password);


        // Create user

        const newUser = {
            username: username,
            password: hashedPassword
        };


        users.push(newUser);

        saveUsers(users);


        // Success message

        message.style.color = "#198754";
        message.textContent =
            "Registration successful! Redirecting to login...";


        setTimeout(() => {
            window.location.href = "index.html";
        }, 1200);
    });
}


// ========================================
// Login
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const username = document
            .getElementById("loginUsername")
            .value
            .trim();

        const password = document
            .getElementById("loginPassword")
            .value;

        const error = document.getElementById("loginError");

        error.textContent = "";


        // Basic validation

        if (username === "" || password === "") {
            error.textContent =
                "Please enter your username/email and password.";
            return;
        }


        // Get users

        const users = getUsers();


        // Find user

        const user = users.find(
            account =>
                account.username.toLowerCase() === username.toLowerCase()
        );


        // General error message
        // This does not reveal which field is incorrect

        if (!user) {
            error.textContent =
                "Invalid username/email or password.";
            return;
        }


        // Hash entered password

        const hashedPassword = await hashPassword(password);


        // Check password

        if (hashedPassword !== user.password) {
            error.textContent =
                "Invalid username/email or password.";
            return;
        }


        // Create session

        sessionStorage.setItem(
            "loggedInUser",
            user.username
        );


        // Redirect to dashboard

        window.location.href = "dashboard.html";
    });
}


// ========================================
// Dashboard Protection
// ========================================

if (window.location.pathname.endsWith("dashboard.html")) {

    const loggedInUser =
        sessionStorage.getItem("loggedInUser");


    // Redirect if no session exists

    if (!loggedInUser) {
        window.location.href = "index.html";
    }
    else {

        const userInfo =
            document.getElementById("userInfo");

        if (userInfo) {
            userInfo.textContent =
                "Logged in as: " + loggedInUser;
        }
    }
}


// ========================================
// Logout
// ========================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function() {

        sessionStorage.removeItem("loggedInUser");

        window.location.href = "index.html";
    });
}