let defaultExams = [
    {
        id: 1,
        title: "Software Engineering Fundamentals",
        duration: 5,
        questions: [
            {
                q: "Which model follows a sequential development process?",
                o: ["Agile", "Waterfall", "Spiral", "Prototype"],
                a: 1
            },
            {
                q: "What does SDLC stand for?",
                o: [
                    "Software Development Life Cycle",
                    "System Design Logic Cycle",
                    "Software Data Life Cycle",
                    "System Development Level Code"
                ],
                a: 0
            },
            {
                q: "Which document describes software requirements?",
                o: ["SRS", "WBS", "Gantt Chart", "Risk Matrix"],
                a: 0
            },
            {
                q: "What is the main purpose of software testing?",
                o: [
                    "Increase code length",
                    "Find defects",
                    "Create requirements",
                    "Design hardware"
                ],
                a: 1
            },
            {
                q: "Which diagram shows system actors and their interactions?",
                o: [
                    "Class Diagram",
                    "Use Case Diagram",
                    "Activity Diagram",
                    "Sequence Diagram"
                ],
                a: 1
            }
        ]
    },
    {
        id: 2,
        title: "Project Management Basics",
        duration: 5,
        questions: [
            {
                q: "What does WBS stand for?",
                o: [
                    "Work Breakdown Structure",
                    "Web Based System",
                    "Work Business Schedule",
                    "Workflow Build System"
                ],
                a: 0
            },
            {
                q: "A Gantt chart is mainly used for:",
                o: [
                    "Database design",
                    "Project scheduling",
                    "Coding",
                    "Encryption"
                ],
                a: 1
            },
            {
                q: "Risk management includes:",
                o: [
                    "Identifying and controlling risks",
                    "Only coding",
                    "Only documentation",
                    "Deleting tasks"
                ],
                a: 0
            },
            {
                q: "A project milestone represents:",
                o: [
                    "A key point or event",
                    "A programming language",
                    "A database",
                    "A user password"
                ],
                a: 0
            },
            {
                q: "Which of the following is a project constraint?",
                o: [
                    "Time",
                    "Logo",
                    "Font",
                    "Wallpaper"
                ],
                a: 0
            }
        ]
    }
];

let exams;

const savedExams = localStorage.getItem("exams");

if (savedExams) {
    try {
        exams = JSON.parse(savedExams);

        if (!Array.isArray(exams)) {
            exams = defaultExams;
            localStorage.setItem("exams", JSON.stringify(exams));
        }

        exams.forEach(exam => {
            if (!Array.isArray(exam.questions)) {
                exam.questions = [];
            }
        });

    } catch (error) {
        exams = defaultExams;
        localStorage.setItem("exams", JSON.stringify(exams));
    }
} else {
    exams = defaultExams;
    localStorage.setItem("exams", JSON.stringify(exams));
}

let currentUser = "";
let currentExam = null;
let currentIndex = 0;
let answers = [];
let timerId = null;
let remaining = 0;

const $ = id => document.getElementById(id);

function show(id) {
    const element = $(id);

    if (element) {
        element.classList.remove("hidden");
    }
}

function hide(id) {
    const element = $(id);

    if (element) {
        element.classList.add("hidden");
    }
}
function checkSession() {

const loggedIn =
    sessionStorage.getItem("loggedIn");

const savedName =
    sessionStorage.getItem("userName");

const savedRole =
    sessionStorage.getItem("userRole");

if (
    loggedIn === "true" &&
    savedName &&
    savedRole
) {

    currentUser = savedName;

    hide("loginScreen");
    show("logoutBtn");

    if (savedRole === "admin") {
        loadAdmin();
    } else {
        loadStudent();
    }

} else {

    show("loginScreen");
    hide("studentScreen");
    hide("adminScreen");
    hide("examScreen");
    hide("resultScreen");
    hide("logoutBtn");
}

}

const ADMIN_USERNAME = "Aryan";
const ADMIN_PASSWORD = "123";
const STUDENT_PASSWORD = "123";

$("loginBtn").onclick = () => {

const name = $("nameInput").value.trim();
const role = $("roleInput").value;
const password = $("passwordInput").value;

if (!name) {
    alert("Please enter your name / Student ID.");
    return;
}

if (!password) {
    alert("Please enter your password.");
    return;
}

if (role === "admin") {

    if (
        name !== ADMIN_USERNAME ||
        password !== ADMIN_PASSWORD
    ) {
        alert("Invalid admin username or password.");
        return;
    }

} else {

    if (password !== STUDENT_PASSWORD) {
        alert("Invalid student password.");
        return;
    }
}

currentUser = name;

sessionStorage.setItem("loggedIn", "true");
sessionStorage.setItem("userName", currentUser);
sessionStorage.setItem("userRole", role);

hide("loginScreen");
show("logoutBtn");

if (role === "admin") {
    loadAdmin();
} else {
    loadStudent();
}

};

$("togglePassword").onclick = () => {

const passwordInput = $("passwordInput");
const toggleButton = $("togglePassword");

if (passwordInput.type === "password") {

    passwordInput.type = "text";
    toggleButton.textContent = "Hide";

} else {

    passwordInput.type = "password";
    toggleButton.textContent = "Show";
}

};

$("logoutBtn").onclick = () => {

clearInterval(timerId);

sessionStorage.clear();

location.reload();

};

function loadStudent() {

    hide("adminScreen");
    hide("examScreen");
    hide("resultScreen");

    show("studentScreen");

    $("studentWelcome").textContent =
        `Hello, ${currentUser}!`;

    renderExams();

    const history = JSON.parse(
        localStorage.getItem("examHistory") || "[]"
    ).filter(
        item => item.name === currentUser
    );

    $("attemptCount").textContent =
        history.length;

    $("bestScore").textContent =
        history.length
            ? Math.max(
                ...history.map(item => item.score)
            ) + "%"
            : "—";
}

function renderExams() {

    const examList = $("examList");

    if (!examList) {
        return;
    }

    if (!exams.length) {
        examList.innerHTML = `
            <p>
                No examinations are currently available.
            </p>
        `;
        return;
    }

    examList.innerHTML = exams.map(exam => {

        const questionCount =
            Array.isArray(exam.questions)
                ? exam.questions.length
                : 0;

        return `
            <div class="exam">

                <span class="badge">
                    ${questionCount > 0
                        ? "AVAILABLE"
                        : "NOT READY"}
                </span>

                <h4>
                    ${exam.title}
                </h4>

                <p>
                    📝 ${questionCount} Questions
                </p>

                <p>
                    ⏱️ Duration:
                    ${exam.duration} Minutes
                </p>

                ${
                    questionCount > 0
                        ? `
                            <button
                                onclick="startExam(${exam.id})"
                            >
                                Start Exam
                            </button>
                        `
                        : `
                            <button
                                disabled
                                style="
                                    opacity:0.5;
                                    cursor:not-allowed;
                                "
                            >
                                No Questions Available
                            </button>
                        `
                }

            </div>
        `;
    }).join("");
}

function startExam(id) {

    currentExam = exams.find(
        exam => Number(exam.id) === Number(id)
    );

    if (!currentExam) {
        alert("Exam not found.");
        return;
    }

    if (
        !currentExam.questions ||
        currentExam.questions.length === 0
    ) {
        alert(
            "This examination has no questions yet."
        );
        return;
    }

    currentIndex = 0;

    answers = new Array(
        currentExam.questions.length
    ).fill(null);

    remaining =
        currentExam.duration * 60;

    hide("studentScreen");
    hide("resultScreen");

    show("examScreen");

    $("examTitle").textContent =
        currentExam.title;

    startTimer();
    renderQuestion();
}

function startTimer() {

    clearInterval(timerId);

    updateTimer();

    timerId = setInterval(() => {

        remaining--;

        updateTimer();

        if (remaining <= 0) {

            clearInterval(timerId);

            finishExam();
        }

    }, 1000);
}

function updateTimer() {

    const minutes =
        Math.floor(remaining / 60);

    const seconds =
        remaining % 60;

    $("timer").textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderQuestion() {

    const question =
        currentExam.questions[currentIndex];

    $("questionProgress").textContent =
        `Question ${currentIndex + 1} of ${currentExam.questions.length}`;

    $("questionText").textContent =
        question.q;

    $("options").innerHTML =
        question.o.map((option, index) => {

            return `
                <label class="option">

                    <input
                        type="radio"
                        name="answer"
                        value="${index}"
                        ${
                            answers[currentIndex] === index
                                ? "checked"
                                : ""
                        }
                    >

                    ${option}

                </label>
            `;

        }).join("");

    $("options")
        .querySelectorAll("input")
        .forEach(radio => {

            radio.onchange = () => {

                answers[currentIndex] =
                    Number(radio.value);

            };

        });

    $("prevBtn").disabled =
        currentIndex === 0;

    $("nextBtn").classList.toggle(
        "hidden",
        currentIndex ===
        currentExam.questions.length - 1
    );

    $("submitBtn").classList.toggle(
        "hidden",
        currentIndex !==
        currentExam.questions.length - 1
    );
}

$("prevBtn").onclick = () => {

    if (currentIndex > 0) {

        currentIndex--;

        renderQuestion();
    }
};

$("nextBtn").onclick = () => {

    if (
        currentIndex <
        currentExam.questions.length - 1
    ) {

        currentIndex++;

        renderQuestion();
    }
};

$("submitBtn").onclick = () => {

    if (
        confirm(
            "Are you sure you want to submit the exam?"
        )
    ) {

        finishExam();
    }
};

function finishExam() {

    clearInterval(timerId);

    let correct = 0;

    answers.forEach((answer, index) => {

        if (
            answer ===
            currentExam.questions[index].a
        ) {
            correct++;
        }

    });

    const score =
        Math.round(
            correct /
            currentExam.questions.length *
            100
        );

    const history =
        JSON.parse(
            localStorage.getItem("examHistory") || "[]"
        );

    history.push({

        name: currentUser,

        exam: currentExam.title,

        score: score,

        date:
            new Date().toLocaleString()

    });

    localStorage.setItem(
        "examHistory",
        JSON.stringify(history)
    );

    hide("examScreen");

    show("resultScreen");

    $("resultTitle").textContent =
        currentExam.title;

    $("scoreValue").textContent =
        `${score}%`;

    $("resultMessage").textContent =
        `You answered ${correct} out of ${currentExam.questions.length} questions correctly.`;
}

$("backToExams").onclick = () => {
    loadStudent();
};

function loadAdmin() {

    hide("studentScreen");
    hide("examScreen");
    hide("resultScreen");

    show("adminScreen");

    const history =
        JSON.parse(
            localStorage.getItem("examHistory") || "[]"
        );

    const totalExams =
        exams.length;

    const totalQuestions =
        exams.reduce(
            function (total, exam) {

                return total +
                    (
                        Array.isArray(exam.questions)
                            ? exam.questions.length
                            : 0
                    );

            },
            0
        );

    const totalAttempts =
        history.length;

    const averageScore =
        totalAttempts > 0
            ? Math.round(
                history.reduce(
                    function (total, item) {
                        return total + Number(item.score || 0);
                    },
                    0
                ) / totalAttempts
            )
            : 0;

    $("adminScreen").innerHTML = `

        <div class="hero card">

            <div>

                <span class="badge">
                    ADMIN PANEL
                </span>

                <h2>
                    Examination Dashboard
                </h2>

                <p>
                    Welcome, ${currentUser}.
                    Manage examinations and monitor
                    project data.
                </p>

            </div>

        </div>

        <div
            class="stats"
            style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(180px,1fr));
                gap:15px;
                margin-bottom:25px;
            "
        >

            <div
                class="card"
                style="margin:0;text-align:center;"
            >
                <strong>
                    ${totalExams}
                </strong>

                <span>
                    Total Exams
                </span>
            </div>

            <div
                class="card"
                style="margin:0;text-align:center;"
            >
                <strong>
                    ${totalQuestions}
                </strong>

                <span>
                    Total Questions
                </span>
            </div>

            <div
                class="card"
                style="margin:0;text-align:center;"
            >
                <strong>
                    ${totalAttempts}
                </strong>

                <span>
                    Total Attempts
                </span>
            </div>

            <div
                class="card"
                style="margin:0;text-align:center;"
            >
                <strong>
                    ${averageScore}%
                </strong>

                <span>
                    Average Score
                </span>
            </div>

        </div>

        <div class="card">

            <h3>
                Examination Management
            </h3>

            <button
                onclick="addExam()"
                style="
                    margin-top:15px;
                    margin-bottom:20px;
                "
            >
                + Add New Examination
            </button>

            <div
                id="adminExamList"
                class="exam-grid"
            >

                ${
                    exams.length
                        ? exams.map(exam => {

                            const questionCount =
                                Array.isArray(exam.questions)
                                    ? exam.questions.length
                                    : 0;

                            return `
                                <div class="exam">

                                    <span class="badge">
                                        ${
                                            questionCount > 0
                                                ? "READY"
                                                : "NO QUESTIONS"
                                        }
                                    </span>

                                    <h4
                                        style="
                                            margin-top:12px;
                                        "
                                    >
                                        ${exam.title}
                                    </h4>

                                    <div
                                        style="
                                            display:flex;
                                            gap:10px;
                                            flex-wrap:wrap;
                                            margin:12px 0;
                                        "
                                    >

                                        <span>
                                            📝
                                            ${questionCount}
                                            Questions
                                        </span>

                                        <span>
                                            ⏱️
                                            ${exam.duration}
                                            Minutes
                                        </span>

                                    </div>

                                    <div
                                        style="
                                            display:flex;
                                            gap:8px;
                                            flex-wrap:wrap;
                                            margin-top:15px;
                                        "
                                    >

                                        <button
                                            onclick="
                                                manageQuestions(${exam.id})
                                            "
                                        >
                                            Manage Questions
                                        </button>

                                        <button
                                            onclick="
                                                adminViewExam(${exam.id})
                                            "
                                            class="secondary"
                                        >
                                            View Questions
                                        </button>

                                        <button
                                            onclick="
                                                deleteExam(${exam.id})
                                            "
                                            style="
                                                background:#ef4444;
                                                color:white;
                                                border:none;
                                            "
                                        >
                                            Delete Exam
                                        </button>

                                    </div>

                                </div>
                            `;

                        }).join("")

                        : `
                            <p>
                                No examinations available.
                            </p>
                        `
                }

            </div>

        </div>

        <div class="card">

            <h3>
                Recent Student Results
            </h3>

            <br>

            ${
                history.length
                    ? history
                        .slice(-10)
                        .reverse()
                        .map((item, index) => {

                            const actualIndex =
                                history.length - 1 - index;

                            return `
                                <div
                                    class="exam"
                                    style="
                                        margin-bottom:12px;
                                    "
                                >

                                    <strong>
                                        ${item.name}
                                    </strong>

                                    <p>
                                        ${item.exam}
            </p>

                                    <p>
                                        Score:

                                        <strong
                                            style="
                                                color:#00ff66;
                                                text-shadow:
                                                0 0 8px #00ff66;
                                            "
                                        >
                                            ${item.score}%
                                        </strong>

                                    </p>

                                    <small>
                                        ${item.date}
                                    </small>

                                    <br><br>

                                    <button
                                        onclick="
                                            deleteResult(${actualIndex})
                                        "
                                        style="
                                            background:#ef4444;
                                            color:white;
                                            border:none;
                                            padding:8px 14px;
                                            border-radius:6px;
                                            cursor:pointer;
                                        "
                                    >
                                        Delete Result
                                    </button>

                                </div>
                            `;

                        })
                        .join("")

                    : `
                        <p>
                            No student attempts yet.
                        </p>
                    `
            }

        </div>

    `;
}

function addExam() {

    $("adminScreen").innerHTML = `

        <div class="card">

            <span class="badge">
                CREATE EXAMINATION
            </span>

            <h2 style="margin-top:15px;">
                Add New Examination
            </h2>

            <p style="margin-bottom:25px;">
                Create a new examination for students.
            </p>

            <label>
                Examination Title
            </label>

            <input
                id="newExamTitle"
                type="text"
                placeholder="Enter examination title"
            >

            <label>
                Duration (Minutes)
            </label>

            <input
                id="newExamDuration"
                type="number"
                min="1"
                value="30"
                placeholder="Enter duration"
            >

            <button
                onclick="saveNewExam()"
            >
                Create Examination
            </button>

            <button
                onclick="loadAdmin()"
                class="secondary"
            >
                Cancel
            </button>

        </div>
    `;
}

function saveNewExam() {

    const title =
        $("newExamTitle").value.trim();

    const duration =
        Number($("newExamDuration").value);

    if (!title) {

        alert(
            "Please enter an examination title."
        );

        return;
    }

    if (!duration || duration < 1) {

        alert(
            "Please enter a valid duration."
        );

        return;
    }

    const newExam = {

        id: Date.now(),

        title: title,

        duration: duration,

        questions: []

    };

    exams.push(newExam);

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    alert(
        "Examination created successfully."
    );

    loadAdmin();
}
function manageQuestions(examId) {

    const exam =
        exams.find(
            item =>
                Number(item.id) ===
                Number(examId)
        );

    if (!exam) {

        alert("Exam not found.");

        return;
    }

    if (!Array.isArray(exam.questions)) {
        exam.questions = [];
    }

    $("adminScreen").innerHTML = `

        <div class="card">

            <span class="badge">
                QUESTION MANAGEMENT
            </span>

            <h2 style="margin-top:15px;">
                ${exam.title}
            </h2>

            <p style="margin:10px 0 25px;">
                ${exam.questions.length}
                Questions
            </p>

            <button
                onclick="addQuestion(${exam.id})"
            >
                + Add Question
            </button>

            <button
                onclick="loadAdmin()"
                class="secondary"
            >
                ← Back
            </button>

            <div style="margin-top:25px;">

                ${
                    exam.questions.length
                        ? exam.questions.map(
                            (question, index) => `

                                <div
                                    class="exam"
                                    style="
                                        margin-bottom:15px;
                                    "
                                >

                                    <h4>
                                        Q${index + 1}.
                                        ${question.q}
                                    </h4>

                                    <p>
                                        A. ${question.o[0]}
                                    </p>

                                    <p>
                                        B. ${question.o[1]}
                                    </p>

                                    <p>
                                        C. ${question.o[2]}
                                    </p>

                                    <p>
                                        D. ${question.o[3]}
                                    </p>

                                    <p>
                                        Correct Answer:

                                        <strong>
                                            ${String.fromCharCode(
                                                65 + question.a
                                            )}
                                        </strong>
                                    </p>

                                    <button
                                        onclick="
                                            editQuestion(
                                                ${exam.id},
                                                ${index}
                                            )
                                        "
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onclick="
                                            deleteQuestion(
                                                ${exam.id},
                                                ${index}
                                            )
                                        "
                                        style="
                                            background:#ef4444;
                                            color:white;
                                            border:none;
                                            margin-left:6px;
                                        "
                                    >
                                        Delete
                                    </button>

                                </div>

                            `
                        ).join("")

                        : `
                            <p>
                                No questions available.
                            </p>
                        `
                }

            </div>

        </div>
    `;
}

function addQuestion(examId) {

    const exam =
        exams.find(
            item =>
                Number(item.id) ===
                Number(examId)
        );

    if (!exam) {

        alert("Exam not found.");

        return;
    }

    $("adminScreen").innerHTML = `

        <div class="card">

            <span class="badge">
                ADD QUESTION
            </span>

            <h2 style="margin-top:15px;">
                ${exam.title}
            </h2>

            <p style="margin-bottom:25px;">
                Add a new question to this examination.
            </p>

            <input
                id="newQuestion"
                type="text"
                placeholder="Enter question"
            >

            <input
                id="option0"
                type="text"
                placeholder="Option A"
            >

            <input
                id="option1"
                type="text"
                placeholder="Option B"
            >

            <input
                id="option2"
                type="text"
                placeholder="Option C"
            >

            <input
                id="option3"
                type="text"
                placeholder="Option D"
            >

            <label>
                Correct Answer
            </label>

            <select id="correctAnswer">

                <option value="0">
                    Option A
                </option>

                <option value="1">
                    Option B
                </option>

                <option value="2">
                    Option C
                </option>

                <option value="3">
                    Option D
                </option>

            </select>

            <button
                onclick="
                    saveNewQuestion(${exam.id})
                "
            >
                Add Question
            </button>

            <button
                onclick="
                    manageQuestions(${exam.id})
                "
                class="secondary"
            >
                Cancel
            </button>

        </div>
    `;
}
function saveNewQuestion(examId) {

    const exam =
        exams.find(
            item =>
                Number(item.id) ===
                Number(examId)
        );

    if (!exam) {

        alert("Exam not found.");

        return;
    }

    const question =
        $("newQuestion").value.trim();

    const options = [
        $("option0").value.trim(),
        $("option1").value.trim(),
        $("option2").value.trim(),
        $("option3").value.trim()
    ];

    const correctAnswer =
        Number(
            $("correctAnswer").value
        );

    if (
        !question ||
        options.some(
            option => !option
        )
    ) {

        alert(
            "Please fill in all question and option fields."
        );

        return;
    }

    if (!Array.isArray(exam.questions)) {
        exam.questions = [];
    }

    exam.questions.push({

        q: question,

        o: options,

        a: correctAnswer

    });

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    alert(
        "Question added successfully."
    );

    manageQuestions(exam.id);
}

function editQuestion(
    examId,
    questionIndex
) {

    const exam =
        exams.find(
            item =>
                Number(item.id) ===
                Number(examId)
        );

    if (
        !exam ||
        !exam.questions[questionIndex]
    ) {

        alert("Question not found.");

        return;
    }

    const question =
        exam.questions[questionIndex];

    $("adminScreen").innerHTML = `

        <div class="card">

            <span class="badge">
                EDIT QUESTION
            </span>

            <h2 style="margin-top:15px;">
                ${exam.title}
            </h2>

            <p style="margin-bottom:25px;">
                Edit question ${questionIndex + 1}.
            </p>

            <input
                id="editQuestion"
                type="text"
                value="${String(question.q).replace(/"/g, "&quot;")}"
                placeholder="Enter question"
            >

            ${question.o.map(
                (option, index) => `
                    <input
                        id="editOption${index}"
                        type="text"
                        value="${String(option).replace(/"/g, "&quot;")}"
                        placeholder="
                            Option
                            ${String.fromCharCode(
                                65 + index
                            )}
                        "
                    >
                `
            ).join("")}

            <label>
                Correct Answer
            </label>

            <select id="editCorrectAnswer">

                <option
                    value="0"
                    ${
                        question.a === 0
                            ? "selected"
                            : ""
                    }
                >
                    Option A
                </option>

                <option
                    value="1"
                    ${
                        question.a === 1
                            ? "selected"
                            : ""
                    }
                >
                    Option B
                </option>

                <option
                    value="2"
                    ${
                        question.a === 2
                            ? "selected"
                            : ""
                    }
                >
                    Option C
                </option>

                <option
                    value="3"
                    ${
                        question.a === 3
                            ? "selected"
                            : ""
                    }
                >
                    Option D
                </option>

            </select>

            <button
                onclick="
                    saveEditedQuestion(
                        ${exam.id},
                        ${questionIndex}
                    )
                "
            >
                Save Changes
            </button>

            <button
                onclick="
                    manageQuestions(${exam.id})
                "
                class="secondary"
            >
                Cancel
            </button>

        </div>
    `;
}

function saveEditedQuestion(
    examId,
    questionIndex
) {

    const exam =
        exams.find(
            item =>
                Number(item.id) ===
                Number(examId)
        );

    if (
        !exam ||
        !exam.questions[questionIndex]
    ) {

        alert("Question not found.");

        return;
    }

    const question =
        $("editQuestion").value.trim();

    const options = [
        $("editOption0").value.trim(),
        $("editOption1").value.trim(),
        $("editOption2").value.trim(),
        $("editOption3").value.trim()
    ];

    const correctAnswer =
        Number(
            $("editCorrectAnswer").value
        );

    if (
        !question ||
        options.some(
            option => !option
        )
    ) {

        alert(
            "Please fill in all question and option fields."
        );

        return;
    }

    exam.questions[questionIndex] = {

        q: question,

        o: options,

        a: correctAnswer

    };

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    alert(
        "Question updated successfully."
    );

    manageQuestions(exam.id);
}

function deleteQuestion(
    examId,
    questionIndex
) {

    const exam =
        exams.find(
            item =>
                Number(item.id) ===
                Number(examId)
        );

    if (
        !exam ||
        !exam.questions[questionIndex]
    ) {

        alert("Question not found.");

        return;
    }

    if (
        !confirm(
            "Are you sure you want to delete this question?"
        )
    ) {

        return;
    }

    exam.questions.splice(
        questionIndex,
        1
    );

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    alert(
        "Question deleted successfully."
    );

    manageQuestions(exam.id);
}
function deleteExam(id) {

    const exam =
        exams.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!exam) {
        return;
    }

    if (
        !confirm(
            `Are you sure you want to delete "${exam.title}"?`
        )
    ) {

        return;
    }

    exams =
        exams.filter(
            item =>
                Number(item.id) !==
                Number(id)
        );

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    loadAdmin();
}

function deleteResult(index) {

    if (
        !confirm(
            "Are you sure you want to delete this student result?"
        )
    ) {

        return;
    }

    const history =
        JSON.parse(
            localStorage.getItem("examHistory") || "[]"
        );

    if (
        index < 0 ||
        index >= history.length
    ) {

        return;
    }

    history.splice(
        index,
        1
    );

    localStorage.setItem(
        "examHistory",
        JSON.stringify(history)
    );

    loadAdmin();
}

function adminViewExam(id) {

    const exam =
        exams.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!exam) {
        return;
    }

    if (!Array.isArray(exam.questions)) {
        exam.questions = [];
    }

    $("adminScreen").innerHTML = `

        <div class="card">

            <span class="badge">
                EXAM DETAILS
            </span>

            <h2 style="margin-top:15px;">
                ${exam.title}
            </h2>

            <p style="margin:10px 0 25px;">
                ${exam.questions.length}
                Questions •

                ${exam.duration}
                Minutes
            </p>

            ${
                exam.questions.length
                    ? exam.questions.map(
                        (question, index) => `

                            <div
                                class="exam"
                                style="
                                    margin-bottom:15px;
                                "
                            >

                                <h4>
                                    Q${index + 1}.
                                    ${question.q}
                                </h4>

                                <p>
                                    Options:
                                </p>

                                <ol
                                    style="
                                        padding-left:25px;
                                        color:#cccccc;
                                    "
                                >

                                    ${
                                        question.o.map(
                                            option => `
                                                <li>
                                                    ${option}
                                                </li>
                                            `
                                        ).join("")
                                    }

                                </ol>

                                <p>
                                    Correct Answer:
                                    <strong>
                                        ${String.fromCharCode(
                                            65 + question.a
                                        )}
                                    </strong>
                                </p>

                            </div>

                        `
                    ).join("")

                    : `
                        <p>
                            No questions available.
                        </p>
                    `
            }

            <button
                onclick="
                    manageQuestions(${exam.id})
                "
            >
                Manage Questions
            </button>

            <button
                onclick="loadAdmin()"
                class="secondary"
            >
                ← Back to Dashboard
            </button>

        </div>
    `;
}
checkSession();
                             