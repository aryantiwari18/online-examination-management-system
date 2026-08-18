const exams = [
    {
        id: 1,
        title: "Software Engineering Fundamentals",
        duration: 5,

        questions: [
            {
                q: "Which model follows a sequential development process?",
                o: [
                    "Agile",
                    "Waterfall",
                    "Spiral",
                    "Prototype"
                ],
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
                o: [
                    "SRS",
                    "WBS",
                    "Gantt Chart",
                    "Risk Matrix"
                ],
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


let currentUser = "";
let currentExam = null;
let currentIndex = 0;
let answers = [];
let timerId = null;
let remaining = 0;


const $ = (id) => {
    return document.getElementById(id);
};


function show(id) {
    $(id).classList.remove("hidden");
}


function hide(id) {
    $(id).classList.add("hidden");
}


/* =========================
   LOGIN
========================= */

$("loginBtn").onclick = () => {

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


/* =========================
   LOGOUT
========================= */

$("logoutBtn").onclick = () => {

    clearInterval(timerId);

    location.reload();
};


/* =========================
   STUDENT DASHBOARD
========================= */

function loadStudent() {

    hide("adminScreen");
    hide("examScreen");
    hide("resultScreen");

    show("studentScreen");

    $("studentWelcome").textContent =
        `Hello, ${currentUser}!`;

    renderExams();

    const history =
        JSON.parse(
            localStorage.getItem("examHistory") || "[]"
        ).filter(
            item => item.name === currentUser
        );

    $("attemptCount").textContent =
        history.length;

    $("bestScore").textContent =
        history.length
            ? Math.max(...history.map(item => item.score)) + "%"
            : "—";
}


/* =========================
   EXAM LIST
========================= */

function renderExams() {

    $("examList").innerHTML =
        exams.map(exam => {

            return `
                <div class="exam">

                    <h4>
                        ${exam.title}
                    </h4>

                    <p>
                        ${exam.questions.length}
                        Questions •
                        ${exam.duration}
                        Minutes
                    </p>

                    <button
                        onclick="startExam(${exam.id})">
                        Start Exam
                    </button>

                </div>
            `;

        }).join("");
}


/* =========================
   START EXAM
========================= */

function startExam(id) {

    currentExam =
        exams.find(
            exam => exam.id === id
        );

    currentIndex = 0;

    answers =
        new Array(
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


/* =========================
   TIMER
========================= */

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


/* =========================
   DISPLAY QUESTION
========================= */

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


/* =========================
   PREVIOUS
========================= */

$("prevBtn").onclick = () => {

    if (currentIndex > 0) {

        currentIndex--;

        renderQuestion();
    }
};


/* =========================
   NEXT
========================= */

$("nextBtn").onclick = () => {

    if (
        currentIndex <
        currentExam.questions.length - 1
    ) {

        currentIndex++;

        renderQuestion();
    }
};


/* =========================
   SUBMIT
========================= */

$("submitBtn").onclick = () => {

    if (
        confirm(
            "Are you sure you want to submit the exam?"
        )
    ) {

        finishExam();
    }
};


/* =========================
   FINISH EXAM
========================= */

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


/* =========================
   BACK TO EXAMS
========================= */

$("backToExams").onclick = () => {

    loadStudent();
};


/* =========================
   ADMIN DASHBOARD
========================= */

function loadAdmin() {

    hide("studentScreen");
    hide("examScreen");
    hide("resultScreen");

    show("adminScreen");


    const history =
        JSON.parse(
            localStorage.getItem("examHistory") || "[]"
        );


    $("adminExamList").innerHTML =

        exams.map(exam => {

            return `
                <div
                    class="exam"
                    style="margin-bottom:12px">

                    <h4>
                        ${exam.title}
                    </h4>

                    <p>
                        ${exam.questions.length}
                        Questions •
                        ${exam.duration}
                        Minutes
                    </p>

                </div>
            `;

        }).join("");


    $("adminExamList").innerHTML += `

        <h3 style="margin-top:25px;">
            Recent Attempts:
            ${history.length}
        </h3>

    `;


    if (history.length) {

        $("adminExamList").innerHTML +=

            history
                .slice(-10)
                .reverse()
                .map(item => {

                    return `
                        <p style="margin-top:10px;">

                            ${item.name}
                            —
                            ${item.exam}
                            —
                            <strong>
                                ${item.score}%
                            </strong>
                            —
                            ${item.date}

                        </p>
                    `;

                })
                .join("");

    } else {

        $("adminExamList").innerHTML += `
            <p style="margin-top:10px;">
                No attempts yet.
            </p>
        `;
    }
}