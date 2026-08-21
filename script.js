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

let exams = [];
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

function initializeExams() {
    const saved = localStorage.getItem("exams");
    const initialized = localStorage.getItem("examSystemInitialized");

    if (!saved || !initialized) {
        exams = JSON.parse(JSON.stringify(defaultExams));

        localStorage.setItem(
            "exams",
            JSON.stringify(exams)
        );

        localStorage.setItem(
            "examSystemInitialized",
            "true"
        );

        return;
    }

    try {
        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            exams = JSON.parse(JSON.stringify(defaultExams));

            localStorage.setItem(
                "exams",
                JSON.stringify(exams)
            );
        } else {
            exams = parsed;
        }
    } catch (error) {
        exams = JSON.parse(JSON.stringify(defaultExams));

        localStorage.setItem(
            "exams",
            JSON.stringify(exams)
        );
    }
}

initializeExams();

$("loginBtn").onclick = function () {
    const name = $("nameInput").value.trim();

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    currentUser = name;

    hide("loginScreen");
    show("logoutBtn");

    if ($("roleInput").value === "admin") {
        loadAdmin();
    } else {
        loadStudent();
    }
};

$("logoutBtn").onclick = function () {
    clearInterval(timerId);
    location.reload();
};

function loadStudent() {
    hide("adminScreen");
    hide("examScreen");
    hide("resultScreen");

    show("studentScreen");

    $("studentWelcome").textContent =
        "Hello, " + currentUser + "!";

    renderExams();

    const history = JSON.parse(
        localStorage.getItem("examHistory") || "[]"
    ).filter(item => item.name === currentUser);

    $("attemptCount").textContent = history.length;

    if (history.length > 0) {
        $("bestScore").textContent =
            Math.max(...history.map(item => item.score)) + "%";
    } else {
        $("bestScore").textContent = "—";
    }
}

function renderExams() {
    const examList = $("examList");

    if (!examList) {
        return;
    }

    examList.innerHTML = "";

    if (!Array.isArray(exams) || exams.length === 0) {
        examList.innerHTML = `
            <div class="exam">
                <h4>No examinations available</h4>
                <p>Please contact the administrator.</p>
            </div>
        `;

        return;
    }

    exams.forEach(function (exam) {
        const card = document.createElement("div");

        card.className = "exam";

        card.innerHTML = `
            <span class="badge">
                AVAILABLE
            </span>

            <h4>
                ${exam.title}
            </h4>

            <p>
                ${exam.questions.length} Questions
            </p>

            <p>
                Duration:
                ${exam.duration} Minutes
            </p>

            <button
                type="button"
                class="startExamButton"
            >
                Start Exam
            </button>
        `;

        card.querySelector(
            ".startExamButton"
        ).onclick = function () {
            startExam(exam.id);
        };

        examList.appendChild(card);
    });
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
        alert("This examination has no questions.");
        return;
    }

    currentIndex = 0;

    answers = new Array(
        currentExam.questions.length
    ).fill(null);

    remaining = currentExam.duration * 60;

    hide("studentScreen");
    hide("resultScreen");
    hide("adminScreen");

    show("examScreen");

    $("examTitle").textContent =
        currentExam.title;

    startTimer();
    renderQuestion();
}

function startTimer() {
    clearInterval(timerId);

    updateTimer();

    timerId = setInterval(function () {
        remaining--;

        updateTimer();

        if (remaining <= 0) {
            clearInterval(timerId);
            finishExam();
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(
        remaining / 60
    );

    const seconds = remaining % 60;

    $("timer").textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}

function renderQuestion() {
    if (!currentExam) {
        return;
    }

    const question =
        currentExam.questions[currentIndex];

    $("questionProgress").textContent =
        "Question " +
        (currentIndex + 1) +
        " of " +
        currentExam.questions.length;

    $("questionText").textContent =
        question.q;

    $("options").innerHTML =
        question.o.map(function (option, index) {
            return `
                <label class="option">

                    <input
                        type="radio"
                        name="answer"
                        value="${index}"
                        ${answers[currentIndex] === index
                            ? "checked"
                            : ""}
                    >

                    ${option}

                </label>
            `;
        }).join("");

    $("options")
        .querySelectorAll("input")
        .forEach(function (radio) {
            radio.onchange = function () {
                answers[currentIndex] =
                    Number(radio.value);
            };
        });

    $("prevBtn").disabled =
        currentIndex === 0;

    if (
        currentIndex ===
        currentExam.questions.length - 1
    ) {
        hide("nextBtn");
        show("submitBtn");
    } else {
        show("nextBtn");
        hide("submitBtn");
    }
}

$("prevBtn").onclick = function () {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
};

$("nextBtn").onclick = function () {
    if (
        currentExam &&
        currentIndex <
            currentExam.questions.length - 1
    ) {
        currentIndex++;
        renderQuestion();
    }
};

$("submitBtn").onclick = function () {
    if (
        confirm(
            "Are you sure you want to submit the exam?"
        )
    ) {
        finishExam();
    }
};

function finishExam() {
    if (!currentExam) {
        return;
    }

    clearInterval(timerId);

    let correct = 0;

    answers.forEach(function (answer, index) {
        if (
            answer ===
            currentExam.questions[index].a
        ) {
            correct++;
        }
    });

    const score = Math.round(
        correct /
        currentExam.questions.length *
        100
    );

    const history = JSON.parse(
        localStorage.getItem("examHistory") || "[]"
    );

    history.push({
        name: currentUser,
        exam: currentExam.title,
        score: score,
        date: new Date().toLocaleString()
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
        score + "%";

    $("resultMessage").textContent =
        "You answered " +
        correct +
        " out of " +
        currentExam.questions.length +
        " questions correctly.";
}

$("backToExams").onclick = function () {
    loadStudent();
};

function loadAdmin() {
    hide("studentScreen");
    hide("examScreen");
    hide("resultScreen");

    show("adminScreen");

    const history = JSON.parse(
        localStorage.getItem("examHistory") || "[]"
    );

    const totalExams = exams.length;

    const totalQuestions = exams.reduce(
        function (total, exam) {
            return total +
                (exam.questions
                    ? exam.questions.length
                    : 0);
        },
        0
    );

    const totalAttempts = history.length;

    const averageScore =
        totalAttempts > 0
            ? Math.round(
                history.reduce(
                    function (total, item) {
                        return total + item.score;
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

            <br>

            <div
                id="adminExamList"
                class="exam-grid"
            >

                ${
                    exams.length > 0
                        ? exams.map(function (exam) {
                            return `
                                <div class="exam">

                                    <span class="badge">
                                        ACTIVE
                                    </span>

                                    <h4>
                                        ${exam.title}
                                    </h4>

                                    <p>
                                        ${exam.questions.length}
                                        Questions
                                    </p>

                                    <p>
                                        Duration:
                                        ${exam.duration}
                                        Minutes
                                    </p>

                                    <button
                                        onclick="adminViewExam(${exam.id})"
                                    >
                                        View Questions
                                    </button>
<button
    onclick="manageQuestions(${exam.id})"
>
    Manage Questions
</button>

                                    <button
                                        onclick="deleteExam(${exam.id})"
                                        style="
                                            background:#ff3333;
                                            color:white;
                                            border:none;
                                            margin-top:10px;
                                        "
                                    >
                                        Delete Exam
                                    </button>

                                </div>
                            `;
                        }).join("")
                        : `
                            <div class="exam">
                                <h4>
                                    No examinations available
                                </h4>

                                <p>
                                    All examinations have been deleted.
                                </p>
                            </div>
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
                history.length > 0
                    ? history
                        .slice(-10)
                        .reverse()
                        .map(function (item, index) {

                            const actualIndex =
                                history.length -
                                1 -
                                index;

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
                                        onclick="deleteResult(${actualIndex})"
                                        style="
                                            background:#ff3333;
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

function deleteExam(id) {
    const exam = exams.find(
        item => Number(item.id) === Number(id)
    );

    if (!exam) {
        return;
    }

    const confirmed = confirm(
        'Are you sure you want to delete "' +
        exam.title +
        '"?'
    );

    if (!confirmed) {
        return;
    }

    exams = exams.filter(
        item => Number(item.id) !== Number(id)
    );

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    loadAdmin();
}

function deleteResult(index) {
    const confirmed = confirm(
"Are you sure you want to delete this student result?"
    );

    if (!confirmed) {
        return;
    }

    const history = JSON.parse(
        localStorage.getItem("examHistory") || "[]"
    );

    if (
        index < 0 ||
        index >= history.length
    ) {
        return;
    }

    history.splice(index, 1);

    localStorage.setItem(
        "examHistory",
        JSON.stringify(history)
    );

    loadAdmin();
}

function adminViewExam(id) {
    const exam = exams.find(
        item => Number(item.id) === Number(id)
    );

    if (!exam) {
        alert("Exam not found.");
        return;
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
                exam.questions.map(
                    function (question, index) {
                        return `
                            <div
                                class="exam"
                                style="margin-bottom:15px;"
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
                                            function (option) {
                                                return `
                                                    <li>
                                                        ${option}
                                                    </li>
                                                `;
                                            }
                                        ).join("")
                                    }

                                </ol>

                            </div>
                        `;
                    }
                ).join("")
            }

            <button
                onclick="loadAdmin()"
                class="secondary"
            >
                ← Back to Dashboard
            </button>

        </div>
    `;
}
function manageQuestions(id) {
    const exam = exams.find(
        item => Number(item.id) === Number(id)
    );

    if (!exam) {
        alert("Exam not found.");
        return;
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
                Manage questions for this examination.
            </p>

            <button
                onclick="addQuestion(${exam.id})"
            >
                + Add Question
            </button>

            <button
                onclick="loadAdmin()"
                class="secondary"
                style="margin-left:8px;"
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
                                    style="margin-bottom:15px;"
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
                                        onclick="editQuestion(${exam.id}, ${index})"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onclick="deleteQuestion(${exam.id}, ${index})"
                                        style="
                                            background:#ef4444;
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
    const exam = exams.find(
        item => Number(item.id) === Number(examId)
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
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:12px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

            <input
                id="option0"
                type="text"
                placeholder="Option A"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:12px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

            <input
                id="option1"
                type="text"
                placeholder="Option B"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:12px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

            <input
                id="option2"
                type="text"
                placeholder="Option C"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:12px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

            <input
                id="option3"
                type="text"
                placeholder="Option D"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:18px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

            <label
                style="
                    display:block;
                    margin-bottom:8px;
                    color:#94a3b8;
                "
            >
                Correct Answer
            </label>

            <select
                id="correctAnswer"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:20px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >
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
                onclick="saveNewQuestion(${exam.id})"
            >
                Add Question
            </button>

            <button
                onclick="manageQuestions(${exam.id})"
                class="secondary"
                style="margin-left:8px;"
            >
                Cancel
            </button>

        </div>
    `;
}
function saveNewQuestion(examId) {
    const exam = exams.find(
        item => Number(item.id) === Number(examId)
    );

    if (!exam) {
        alert("Exam not found.");
        return;
    }

    const question =
        $("newQuestion").value.trim();

    const optionA =
        $("option0").value.trim();

    const optionB =
        $("option1").value.trim();

    const optionC =
        $("option2").value.trim();

    const optionD =
        $("option3").value.trim();

    const correctAnswer =
        Number($("correctAnswer").value);

    if (
        !question ||
        !optionA ||
        !optionB ||
        !optionC ||
        !optionD
    ) {
        alert(
            "Please fill in all question and option fields."
        );

        return;
    }

    exam.questions.push({
        q: question,

        o: [
            optionA,
            optionB,
            optionC,
            optionD
        ],

        a: correctAnswer
    });

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    alert("Question added successfully.");

    manageQuestions(exam.id);
}
function editQuestion(examId, questionIndex) {
    const exam = exams.find(
        item => Number(item.id) === Number(examId)
    );

    if (!exam || !exam.questions[questionIndex]) {
        alert("Question not found.");
        return;
    }

    const question = exam.questions[questionIndex];

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
                value="${question.q.replace(/"/g, "&quot;")}"
                placeholder="Enter question"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:12px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

            ${question.o.map((option, index) => `
                <input
                    id="editOption${index}"
                    type="text"
                    value="${option.replace(/"/g, "&quot;")}"
                    placeholder="Option ${String.fromCharCode(65 + index)}"
                    style="
                        width:100%;
                        padding:14px;
                        margin-bottom:12px;
                        background:#0f172a;
                        color:white;
                        border:1px solid #334155;
                        border-radius:8px;
                    "
                >
            `).join("")}

            <label
                style="
                    display:block;
                    margin-bottom:8px;
                    color:#94a3b8;
                "
            >
                Correct Answer
            </label>

            <select
                id="editCorrectAnswer"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:20px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

                <option value="0" ${question.a === 0 ? "selected" : ""}>
                    Option A
                </option>

                <option value="1" ${question.a === 1 ? "selected" : ""}>
                    Option B
                </option>

                <option value="2" ${question.a === 2 ? "selected" : ""}>
                    Option C
                </option>

                <option value="3" ${question.a === 3 ? "selected" : ""}>
                    Option D
                </option>

            </select>

            <button
                onclick="saveEditedQuestion(${exam.id}, ${questionIndex})"
            >
                Save Changes
            </button>

            <button
                onclick="manageQuestions(${exam.id})"
                class="secondary"
                style="margin-left:8px;"
            >
                Cancel
            </button>

        </div>
    `;
}
function saveEditedQuestion(examId, questionIndex) {
    const exam = exams.find(
        item => Number(item.id) === Number(examId)
    );

    if (!exam || !exam.questions[questionIndex]) {
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
        Number($("editCorrectAnswer").value);

    if (
        !question ||
        options.some(option => !option)
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

    alert("Question updated successfully.");

    manageQuestions(exam.id);
}
function deleteQuestion(examId, questionIndex) {
    const exam = exams.find(
        item => Number(item.id) === Number(examId)
    );

    if (!exam || !exam.questions[questionIndex]) {
        alert("Question not found.");
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete this question?"
    );

    if (!confirmed) {
        return;
    }

    exam.questions.splice(questionIndex, 1);

    localStorage.setItem(
        "exams",
        JSON.stringify(exams)
    );

    alert("Question deleted successfully.");

    manageQuestions(exam.id);
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

            <label
                style="
                    display:block;
                    margin-bottom:8px;
                    color:#94a3b8;
                "
            >
                Examination Title
            </label>

            <input
                id="newExamTitle"
                type="text"
                placeholder="Enter examination title"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:18px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

            <label
                style="
                    display:block;
                    margin-bottom:8px;
                    color:#94a3b8;
                "
            >
                Duration (Minutes)
            </label>

            <input
                id="newExamDuration"
                type="number"
                min="1"
                value="30"
                placeholder="Enter duration"
                style="
                    width:100%;
                    padding:14px;
                    margin-bottom:25px;
                    background:#0f172a;
                    color:white;
                    border:1px solid #334155;
                    border-radius:8px;
                "
            >

            <button
                onclick="saveNewExam()"
            >
                Create Examination
            </button>

            <button
                onclick="loadAdmin()"
                class="secondary"
                style="margin-left:8px;"
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