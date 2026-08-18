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
examList.innerHTML += `
    <div class="exam-card">
        <h3>${exam.title}</h3>
        <p>Duration: ${exam.duration} minutes</p>
        <button onclick="deleteExam(${exam.id})">Delete</button>
    </div>
`;

         
          

                   
                        
                    

                   
                       


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


    /* =========================
       GET EXAM STATISTICS
    ========================= */

    const totalExams = exams.length;

    const totalQuestions = exams.reduce(
        (total, exam) =>
            total + exam.questions.length,
        0
    );


    const history =
        JSON.parse(
            localStorage.getItem("examHistory") || "[]"
        );


    const totalAttempts =
        history.length;


    const averageScore =
        totalAttempts > 0
            ? Math.round(
                history.reduce(
                    (total, item) =>
                        total + item.score,
                    0
                ) / totalAttempts
            )
            : 0;


    /* =========================
       DASHBOARD HEADER
    ========================= */

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
                    student performance.
                </p>

            </div>

        </div>


        <!-- STATISTICS -->

        <div class="stats"
             style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(180px,1fr));
                margin-bottom:25px;
             ">

            <div class="card"
                 style="margin:0;text-align:center;">

                <strong>
                    ${totalExams}
                </strong>

                <span>
                    Total Exams
                </span>

            </div>


            <div class="card"
                 style="margin:0;text-align:center;">

                <strong>
                    ${totalQuestions}
                </strong>

                <span>
                    Total Questions
                </span>

            </div>


            <div class="card"
                 style="margin:0;text-align:center;">

                <strong>
                    ${totalAttempts}
                </strong>

                <span>
                    Total Attempts
                </span>

            </div>


            <div class="card"
                 style="margin:0;text-align:center;">

                <strong>
                    ${averageScore}%
                </strong>

                <span>
                    Average Score
                </span>

            </div>

        </div>


        <!-- EXAM MANAGEMENT -->

        <div class="card">

            <h3>
                Examination Management
            </h3>

            <br>

            <div class="exam-grid">

                ${exams.map(exam => `

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
                            onclick="adminViewExam(${exam.id})">

                            View Questions

                        </button>

                    </div>

                `).join("")}

            </div>

        </div>


        <!-- STUDENT RESULTS -->

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
                        .map(item => `

                            <div
                                class="exam"
                                style="
                                    margin-bottom:10px;
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

                            </div>

                        `)
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


/* =========================
   VIEW EXAM QUESTIONS
========================= */

function adminViewExam(id) {

    const exam =
        exams.find(
            item => item.id === id
        );


    if (!exam) {
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


            ${exam.questions.map(
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
                            Options:
                        </p>

                        <ol
                            style="
                                padding-left:25px;
                                color:#cccccc;
                            "
                        >

                            ${question.o.map(
                                option => `
                                    <li>
                                        ${option}
                                    </li>
                                `
                            ).join("")}

                        </ol>

                    </div>

                `
            ).join("")}


            <button
                onclick="loadAdmin()"
                class="secondary"
            >
                ← Back to Dashboard
            </button>

        </div>

    `;
}
function deleteExam(id) {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    exams = exams.filter(exam => exam.id !== id);
    localStorage.setItem("exams", JSON.stringify(exams));

    renderExams();
}
function deleteResult(index) {
    if (!confirm("Are you sure you want to delete this result?")) return;

    let results = JSON.parse(localStorage.getItem("results")) || [];
    results.splice(index, 1);

    localStorage.setItem("results", JSON.stringify(results));

    renderResults();
}
  
                
                

               
                  
       
                      
                   
               
                          
                           
                           
                           
                 