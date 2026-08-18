let currentUser = null;
let currentExam = null;
let currentQuestion = 0;
let answers = [];
let timerInterval = null;

let exams = JSON.parse(localStorage.getItem("exams")) || [
    {
        id: 1,
        title: "Software Engineering",
        duration: 30,
        active: true,
        questions: [
            {
                question: "What is Software Engineering?",
                options: [
                    "Development of computer hardware",
                    "Systematic development and maintenance of software",
                    "Computer networking",
                    "Database administration"
                ],
                answer: 1
            },
            {
                question: "Which model follows a sequential development approach?",
                options: [
                    "Agile",
                    "Spiral",
                    "Waterfall",
                    "Prototype"
                ],
                answer: 2
            },
            {
                question: "What does SDLC stand for?",
                options: [
                    "Software Development Life Cycle",
                    "System Development Life Cycle",
                    "Software Design Life Cycle",
                    "System Design Level Control"
                ],
                answer: 0
            }
        ]
    },
    {
        id: 2,
        title: "Database Management System",
        duration: 25,
        active: true,
        questions: [
            {
                question: "Which key uniquely identifies a record?",
                options: [
                    "Foreign Key",
                    "Primary Key",
                    "Alternate Key",
                    "Secondary Key"
                ],
                answer: 1
            },
            {
                question: "What does SQL stand for?",
                options: [
                    "Structured Query Language",
                    "Simple Query Language",
                    "System Query Language",
                    "Structured Logic"
                ],
                answer: 0
            }
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    loadUser();
    setupLogin();
    setupNavigation();
    setupLogout();
    setupMobileMenu();
    setupModals();
});

function loadUser() {
    const savedUser = localStorage.getItem("currentUser");

    if (!savedUser) return;

    currentUser = JSON.parse(savedUser);
    showDashboard();
}

function setupLogin() {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const nameInput = document.getElementById("name");
        const roleInput = document.getElementById("role");

        if (!nameInput || !roleInput) {
            alert("Login form fields not found.");
            return;
        }

        const name = nameInput.value.trim();
        const role = roleInput.value;

        if (!name) {
            showLoginError("Please enter your name.");
            return;
        }

        if (!role) {
            showLoginError("Please select your role.");
            return;
        }

        currentUser = {
            name: name,
            role: role
        };

        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );

        clearLoginError();
        showDashboard();
    });
}

function showLoginError(message) {
    const error =
        document.getElementById("loginError") ||
        document.querySelector(".error-message");

    if (error) {
        error.textContent = message;
    } else {
        alert(message);
    }
}

function clearLoginError() {
    const error =
        document.getElementById("loginError") ||
        document.querySelector(".error-message");

    if (error) {
        error.textContent = "";
    }
}

function showDashboard() {
    const loginPage = document.getElementById("loginPage");
    const studentApp = document.getElementById("studentApp");
    const adminApp = document.getElementById("adminApp");

    if (loginPage) {
        loginPage.classList.add("hidden");
    }

    if (studentApp) {
        studentApp.classList.add("hidden");
    }

    if (adminApp) {
        adminApp.classList.add("hidden");
    }

    if (currentUser.role === "admin") {
        if (adminApp) {
            adminApp.classList.remove("hidden");
        }

        updateUserDetails("admin");
        loadAdminDashboard();
    } else {
        if (studentApp) {
            studentApp.classList.remove("hidden");
        }

        updateUserDetails("student");
        loadStudentDashboard();
    }
}

function updateUserDetails(type) {
    const names = document.querySelectorAll(
        type === "admin"
            ? ".admin-name"
            : ".student-name"
    );

    names.forEach(element => {
        element.textContent = currentUser.name;
    });

    const avatars = document.querySelectorAll(
        type === "admin"
            ? ".admin-avatar"
            : ".user-avatar"
    );

    avatars.forEach(element => {
        element.textContent =
            currentUser.name.charAt(0).toUpperCase();
    });
}

function setupNavigation() {
    document.addEventListener("click", function(event) {
        const button = event.target.closest(".nav-item");

        if (!button) return;

        const target = button.dataset.target;

        if (!target) return;

        const app =
            button.closest(".app-page") ||
            button.closest("#studentApp") ||
            button.closest("#adminApp");

        if (!app) return;

        app.querySelectorAll(".nav-item").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        app.querySelectorAll(".content-page").forEach(page => {
            page.classList.remove("active-content");
        });

        const page = app.querySelector("#" + target);

        if (page) {
            page.classList.add("active-content");
        }
    });
}

function setupLogout() {
    document.addEventListener("click", function(event) {
        const button = event.target.closest(
            ".logout-btn, #logoutBtn"
        );

        if (!button) return;

        logout();
    });
}

function logout() {
    clearInterval(timerInterval);

    currentUser = null;
    currentExam = null;
    currentQuestion = 0;
    answers = [];

    localStorage.removeItem("currentUser");

    document.querySelectorAll(".app-page").forEach(app => {
        app.classList.add("hidden");
    });

    const loginPage = document.getElementById("loginPage");

    if (loginPage) {
        loginPage.classList.remove("hidden");
    }

    const form = document.getElementById("loginForm");

    if (form) {
        form.reset();
    }
}

function loadStudentDashboard();
loadStudentExamPage();
loadStudentResults(); {
   function loadStudentResults() {
    const table = document.getElementById("studentResultsTable");

    if (!table) return;

    const results =
        JSON.parse(localStorage.getItem("results")) || [];

    const userResults = results.filter(
        result => result.user === currentUser.name
    );

    table.innerHTML = "";

    if (userResults.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No results available.</td>
            </tr>
        `;
        return;
    }

    userResults.forEach(result => {
        const percentage =
            Math.round(
                (result.score / result.total) * 100
            );

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${result.exam}</td>
            <td>${result.score}</td>
            <td>${result.total}</td>
            <td>${percentage}%</td>
            <td>${result.date}</td>
        `;

        table.appendChild(row);
    });
}

    updateStudentStats();
}

function updateStudentStats() {
    const examCount = document.getElementById("examCount");

    if (examCount) {
        examCount.textContent =
            exams.filter(exam => exam.active).length;
    }
}

function startExam(id) {
    const exam = exams.find(item => item.id === id);

    if (!exam) return;

    currentExam = exam;
    currentQuestion = 0;
    answers = new Array(exam.questions.length).fill(null);

    document.querySelectorAll(".app-page").forEach(app => {
        app.classList.add("hidden");
    });

    const examPage = document.getElementById("examPage");

    if (examPage) {
        examPage.classList.remove("hidden");
    }

    const title = document.getElementById("examTitle");

    if (title) {
        title.textContent = exam.title;
    }

    startTimer(exam.duration * 60);
    renderQuestion();
}

function renderQuestion() {
    if (!currentExam) return;

    const question = currentExam.questions[currentQuestion];

    const questionText =
        document.getElementById("questionText");

    const optionsContainer =
        document.getElementById("optionsContainer");

    const questionNumber =
        document.getElementById("currentQuestion");

    const totalQuestions =
        document.getElementById("totalQuestions");

    const progressBar =
        document.getElementById("progressBar");

    if (!questionText || !optionsContainer) return;

    questionText.textContent = question.question;

    if (questionNumber) {
        questionNumber.textContent = currentQuestion + 1;
    }

    if (totalQuestions) {
        totalQuestions.textContent =
            currentExam.questions.length;
    }

    if (progressBar) {
        progressBar.style.width =
            `${((currentQuestion + 1) / currentExam.questions.length) * 100}%`;
    }

    optionsContainer.innerHTML = "";

    question.options.forEach((option, index) => {
        const label = document.createElement("label");

        label.className = "option";

        if (answers[currentQuestion] === index) {
            label.classList.add("selected");
        }

        label.innerHTML = `
            <input
                type="radio"
                name="answer"
                value="${index}"
                ${answers[currentQuestion] === index ? "checked" : ""}
            >
            <span>${option}</span>
        `;

        label.addEventListener("click", () => {
            answers[currentQuestion] = index;
            renderQuestion();
        });

        optionsContainer.appendChild(label);
    });

    renderQuestionNumbers();
}

function renderQuestionNumbers() {
    const container =
        document.getElementById("questionNumbers");

    if (!container || !currentExam) return;

    container.innerHTML = "";

    currentExam.questions.forEach((question, index) => {
        const button = document.createElement("button");

        button.className = "question-number-btn";

        button.textContent = index + 1;

        if (index === currentQuestion) {
            button.classList.add("current");
        }

        if (answers[index] !== null) {
            button.classList.add("answered");
        }

        button.addEventListener("click", () => {
            currentQuestion = index;
            renderQuestion();
        });

        container.appendChild(button);
    });
}

function nextQuestion() {
    if (!currentExam) return;

    if (currentQuestion < currentExam.questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

function
function loadStudentExamPage() {
    const container = document.getElementById("examListPage");

    if (!container) return;

    container.innerHTML = "";

    exams
        .filter(exam => exam.active)
        .forEach(exam => {
            const card = document.createElement("div");

            card.className = "exam-card";

            card.innerHTML = `
                <h3>${exam.title}</h3>
                <p>Complete this examination within the given time.</p>

                <div class="exam-meta">
                    <span>⏱ ${exam.duration} min</span>
                    <span>❓ ${exam.questions.length} Questions</span>
                </div>

                <button class="btn btn-primary">
                    Start Exam
                </button>
            `;

            card.querySelector("button").addEventListener("click", () => {
                startExam(exam.id);
            });

            container.appendChild(card);
        });
}