// ===============================
// ONLINE EXAMINATION SYSTEM
// Dynamic Exam + Question Management
// ===============================

let exams = JSON.parse(localStorage.getItem("exams")) || [
    {
        id: 1,
        title: "Software Engineering",
        duration: 30,
        active: true
    }
];

let questions = JSON.parse(localStorage.getItem("questions")) || [
    {
        id: 1,
        examId: 1,
        question: "What does SDLC stand for?",
        options: [
            "Software Development Life Cycle",
            "System Design Life Cycle",
            "Software Data Life Cycle",
            "System Development Logic"
        ],
        correct: 0
    },
    {
        id: 2,
        examId: 1,
        question: "Which model follows a sequential development process?",
        options: [
            "Agile",
            "Waterfall",
            "Spiral",
            "Prototype"
        ],
        correct: 1
    }
];

let attempts = JSON.parse(localStorage.getItem("attempts")) || [];

let currentUser = "";
let currentExam = null;
let currentQuestion = 0;
let selectedAnswers = [];
let timer;
let timeLeft;


// ===============================
// STORAGE
// ===============================

function saveData() {
    localStorage.setItem("exams", JSON.stringify(exams));
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("attempts", JSON.stringify(attempts));
}


// ===============================
// LOGIN
// ===============================

function login() {

    const name = document.getElementById("loginName").value.trim();
    const role = document.getElementById("loginRole").value;

    if (name === "") {
        alert("Please enter your name.");
        return;
    }

    currentUser = name;

    document.getElementById("loginPage").style.display = "none";

    if (role === "admin") {

        document.getElementById("adminPage").style.display = "block";

        renderAdminExams();
        renderQuestionExamList();
        renderAdminQuestions();
        renderAdminStats();

    } else {

        document.getElementById("studentPage").style.display = "block";

        renderStudentExams();
        renderStudentHistory();
    }
}


// ===============================
// LOGOUT
// ===============================

function logout() {

    clearInterval(timer);

    location.reload();
}


// ===============================
// ADMIN EXAM MANAGEMENT
// ===============================

function addExam() {

    const title = document
        .getElementById("examTitle")
        .value
        .trim();

    const duration = Number(
        document.getElementById("examDuration").value
    );

    if (!title || duration <= 0) {

        alert("Enter valid exam details.");
        return;
    }

    const newExam = {

        id: Date.now(),

        title: title,

        duration: duration,

        active: true
    };

    exams.push(newExam);

    saveData();

    document.getElementById("examTitle").value = "";
    document.getElementById("examDuration").value = "";

    renderAdminExams();
    renderQuestionExamList();
    renderAdminStats();

    alert("Exam created successfully!");
}


// ===============================
// EDIT EXAM
// ===============================

function editExam(id) {

    const exam = exams.find(e => e.id === id);

    if (!exam) return;

    const newTitle = prompt(
        "Enter new exam title:",
        exam.title
    );

    if (!newTitle) return;

    const newDuration = prompt(
        "Enter duration in minutes:",
        exam.duration
    );

    if (!newDuration || Number(newDuration) <= 0) return;

    exam.title = newTitle;
    exam.duration = Number(newDuration);

    saveData();

    renderAdminExams();
    renderQuestionExamList();
    renderStudentExams();
}


// ===============================
// ACTIVATE / DEACTIVATE EXAM
// ===============================

function toggleExam(id) {

    const exam = exams.find(e => e.id === id);

    if (!exam) return;

    exam.active = !exam.active;

    saveData();

    renderAdminExams();
    renderStudentExams();
}


// ===============================
// DELETE EXAM
// ===============================

function deleteExam(id) {

    const exam = exams.find(e => e.id === id);

    if (!exam) return;

    const confirmDelete = confirm(
        `Delete "${exam.title}" and all its questions?`
    );

    if (!confirmDelete) return;

    exams = exams.filter(e => e.id !== id);

    questions = questions.filter(
        q => q.examId !== id
    );

    saveData();

    renderAdminExams();
    renderQuestionExamList();
    renderAdminQuestions();
    renderAdminStats();
}


// ===============================
// DISPLAY ADMIN EXAMS
// ===============================

function renderAdminExams() {

    const container =
        document.getElementById("adminExamList");

    if (!container) return;

    container.innerHTML = "";

    exams.forEach(exam => {

        const questionCount =
            questions.filter(
                q => q.examId === exam.id
            ).length;

        container.innerHTML += `

        <div class="exam-card">

            <h3>${exam.title}</h3>

            <p>
                Duration:
                <strong>${exam.duration} minutes</strong>
            </p>

            <p>
                Questions:
                <strong>${questionCount}</strong>
            </p>

            <p>
                Status:
                ${
                    exam.active
                    ? '<span class="active">ACTIVE</span>'
                    : '<span class="inactive">INACTIVE</span>'
                }
            </p>

            <button
                class="blue"
                onclick="editExam(${exam.id})">

                Edit

            </button>

            <button
                class="${exam.active ? 'red' : 'green'}"
                onclick="toggleExam(${exam.id})">

                ${
                    exam.active
                    ? "Deactivate"
                    : "Activate"
                }

            </button>

            <button
                class="red"
                onclick="deleteExam(${exam.id})">

                Delete

            </button>

        </div>

        `;
    });
}


// ===============================
// QUESTION MANAGEMENT
// ===============================

function addQuestion() {

    const examId =
        Number(document.getElementById("questionExam").value);

    const questionText =
        document
        .getElementById("questionText")
        .value
        .trim();

    const optionA =
        document.getElementById("optionA").value.trim();

    const optionB =
        document.getElementById("optionB").value.trim();

    const optionC =
        document.getElementById("optionC").value.trim();

    const optionD =
        document.getElementById("optionD").value.trim();

    const correct =
        Number(
            document.getElementById("correctAnswer").value
        );

    if (
        !questionText ||
        !optionA ||
        !optionB ||
        !optionC ||
        !optionD
    ) {

        alert("Please fill all fields.");
        return;
    }

    questions.push({

        id: Date.now(),

        examId: examId,

        question: questionText,

        options: [
            optionA,
            optionB,
            optionC,
            optionD
        ],

        correct: correct
    });

    saveData();

    clearQuestionForm();

    renderAdminQuestions();
    renderAdminExams();
    renderAdminStats();

    alert("Question added successfully!");
}


// ===============================
// EDIT QUESTION
// ===============================

function editQuestion(id) {

    const question =
        questions.find(q => q.id === id);

    if (!question) return;

    const newQuestion =
        prompt(
            "Edit question:",
            question.question
        );

    if (!newQuestion) return;

    question.question = newQuestion;

    question.options[0] =
        prompt(
            "Option A:",
            question.options[0]
        );

    question.options[1] =
        prompt(
            "Option B:",
            question.options[1]
        );

    question.options[2] =
        prompt(
            "Option C:",
            question.options[2]
        );

    question.options[3] =
        prompt(
            "Option D:",
            question.options[3]
        );

    const correct =
        prompt(
            "Correct option (A/B/C/D):",
            "A"
        );

    const index =
        {
            A: 0,
            B: 1,
            C: 2,
            D: 3
        }[correct.toUpperCase()];

    if (index !== undefined) {

        question.correct = index;
    }

    saveData();

    renderAdminQuestions();
}


// ===============================
// DELETE QUESTION
// ===============================

function deleteQuestion(id) {

    if (!confirm("Delete this question?"))
        return;

    questions =
        questions.filter(
            q => q.id !== id
        );

    saveData();

    renderAdminQuestions();
    renderAdminExams();
    renderAdminStats();
}


// ===============================
// EXAM FILTER FOR QUESTIONS
// ===============================

function renderQuestionExamList() {

    const select =
        document.getElementById("questionExam");

    if (!select) return;

    select.innerHTML = "";

    exams.forEach(exam => {

        select.innerHTML += `

            <option value="${exam.id}">
                ${exam.title}
            </option>

        `;
    });
}


// ===============================
// DISPLAY QUESTIONS
// ===============================

function renderAdminQuestions() {

    const container =
        document.getElementById(
            "adminQuestionList"
        );

    if (!container) return;

    const examId =
        Number(
            document.getElementById("questionExam")
            ?.value
        );

    const examQuestions =
        questions.filter(
            q => q.examId === examId
        );

    container.innerHTML = "";

    examQuestions.forEach((q, index) => {

        container.innerHTML += `

        <div class="question-admin">

            <h4>
                Q${index + 1}.
                ${q.question}
            </h4>

            <p>A. ${q.options[0]}</p>
            <p>B. ${q.options[1]}</p>
            <p>C. ${q.options[2]}</p>
            <p>D. ${q.options[3]}</p>

            <strong>
                Correct:
                ${String.fromCharCode(65 + q.correct)}
            </strong>

            <br><br>

            <button
                class="blue"
                onclick="editQuestion(${q.id})">

                Edit

            </button>

            <button
                class="red"
                onclick="deleteQuestion(${q.id})">

                Delete

            </button>

        </div>

        `;
    });
}


// ===============================
// CLEAR QUESTION FORM
// ===============================

function clearQuestionForm() {

    document.getElementById(
        "questionText"
    ).value = "";

    document.getElementById(
        "optionA"
    ).value = "";

    document.getElementById(
        "optionB"
    ).value = "";

    document.getElementById(
        "optionC"
    ).value = "";

    document.getElementById(
        "optionD"
    ).value = "";

    document.getElementById(
        "correctAnswer"
    ).value = "0";
}


// ===============================
// ADMIN STATISTICS
// ===============================

function renderAdminStats() {

    const examsCount = exams.length;

    const questionCount = questions.length;

    const attemptsCount = attempts.length;

    const stats =
        document.getElementById(
            "adminStats"
        );

    if (!stats) return;

    stats.innerHTML = `

        <div class="stat">
            <h2>${examsCount}</h2>
            <p>Total Exams</p>
        </div>

        <div class="stat">
            <h2>${questionCount}</h2>
            <p>Total Questions</p>
        </div>

        <div class="stat">
            <h2>${attemptsCount}</h2>
            <p>Total Attempts</p>
        </div>

    `;
}


// ===============================
// STUDENT EXAM LIST
// ===============================

function renderStudentExams() {

    const container =
        document.getElementById(
            "examList"
        );

    if (!container) return;

    container.innerHTML = "";

    const activeExams =
        exams.filter(
            exam => exam.active
        );

    activeExams.forEach(exam => {

        const count =
            questions.filter(
                q => q.examId === exam.id
            ).length;

        container.innerHTML += `

        <div class="exam-card">

            <h3>${exam.title}</h3>

            <p>
                ⏱ ${exam.duration} Minutes
            </p>

            <p>
                ❓ ${count} Questions
            </p>

            <button
                class="green"
                onclick="startExam(${exam.id})">

                START EXAM

            </button>

        </div>

        `;
    });
}


// ===============================
// START EXAM
// ===============================

function startExam(id) {

    currentExam =
        exams.find(
            exam => exam.id === id
        );

    if (!currentExam) return;

    const examQuestions =
        questions.filter(
            q => q.examId === id
        );

    if (examQuestions.length === 0) {

        alert(
            "This exam has no questions yet."
        );

        return;
    }

    currentQuestion = 0;

    selectedAnswers =
        new Array(
            examQuestions.length
        ).fill(null);

    timeLeft =
        currentExam.duration * 60;

    document.getElementById(
        "studentPage"
    ).style.display = "none";

    document.getElementById(
        "examPage"
    ).style.display = "block";

    displayQuestion();

    startTimer();
}


// ===============================
// DISPLAY QUESTION
// ===============================

function displayQuestion() {

    const examQuestions =
        questions.filter(
            q => q.examId === currentExam.id
        );

    const q =
        examQuestions[currentQuestion];

    document.getElementById(
        "questionText"
    ).textContent = q.question;

    document.getElementById(
        "questionNumber"
    ).textContent =
        `Question ${currentQuestion + 1}
         of ${examQuestions.length}`;

    const options =
        document.getElementById(
            "options"
        );

    options.innerHTML = "";

    q.options.forEach(
        (option, index) => {

            options.innerHTML += `

            <label class="option">

                <input
                    type="radio"
                    name="answer"
                    value="${index}"
                    ${
                        selectedAnswers[
                            currentQuestion
                        ] === index
                        ? "checked"
                        : ""
                    }
                    onchange="
                        selectAnswer(${index})
                    "
                >

                ${String.fromCharCode(
                    65 + index
                )}. ${option}

            </label>

            `;
        }
    );
}


// ===============================
// SELECT ANSWER
// ===============================

function selectAnswer(index) {

    selectedAnswers[
        currentQuestion
    ] = index;
}


// ===============================
// NEXT QUESTION
// ===============================

function nextQuestion() {

    const examQuestions =
        questions.filter(
            q => q.examId === currentExam.id
        );

    if (
        currentQuestion <
        examQuestions.length - 1
    ) {

        currentQuestion++;

        displayQuestion();
    }
}


// ===============================
// PREVIOUS QUESTION
// ===============================

function previousQuestion() {

    if (currentQuestion > 0) {

        currentQuestion--;

        displayQuestion();
    }
}


// ===============================
// TIMER
// ===============================

function startTimer() {

    clearInterval(timer);

    timer =
        setInterval(() => {

            timeLeft--;

            updateTimer();

            if (timeLeft <= 0) {

                clearInterval(timer);

                submitExam(true);
            }

        }, 1000);

    updateTimer();
}


function updateTimer() {

    const minutes =
        Math.floor(
            timeLeft / 60
        );

    const seconds =
        timeLeft % 60;

    document.getElementById(
        "timer"
    ).textContent =
        `${String(minutes).padStart(2, "0")}:
         ${String(seconds).padStart(2, "0")}`;
}


// ===============================
// SUBMIT EXAM
// ===============================

function submitExam(auto = false) {

    clearInterval(timer);

    const examQuestions =
        questions.filter(
            q => q.examId === currentExam.id
        );

    let score = 0;

    examQuestions.forEach(
        (q, index) => {

            if (
                selectedAnswers[index]
                === q.correct
            ) {

                score++;
            }
        }
    );

    const percentage =
        Math.round(
            score /
            examQuestions.length *
            100
        );

    attempts.push({

        student: currentUser,

        exam: currentExam.title,

        score: score,

        total: examQuestions.length,

        percentage: percentage,

        date:
            new Date().toLocaleString()

    });

    saveData();

    alert(
        auto
        ? `Time's up! Score: ${score}/${examQuestions.length}`
        : `Exam submitted! Score: ${score}/${examQuestions.length}`
    );

    document.getElementById(
        "examPage"
    ).style.display = "none";

    document.getElementById(
        "studentPage"
    ).style.display = "block";

    renderStudentExams();

    currentExam = null;
}


// ===============================
// QUESTION FILTER CHANGE
// ===============================

document.addEventListener(
    "change",
    function(event) {

        if (
            event.target.id
            === "questionExam"
        ) {

            renderAdminQuestions();
        }

    }
);


// ===============================
// INITIAL SAVE
// ===============================

saveData();
function renderStudentHistory() {

    const history =
        document.getElementById("historyList");

    if (!history) return;

    const studentAttempts =
        attempts.filter(
            a => a.student === currentUser
        );

    if (studentAttempts.length === 0) {

        history.innerHTML =
            "<p class='muted'>No attempts yet.</p>";

        return;
    }

    history.innerHTML = "";

    studentAttempts
        .slice()
        .reverse()
        .forEach(attempt => {

            history.innerHTML += `

                <div class="question-admin">

                    <h4>
                        ${attempt.exam}
                    </h4>

                    <p>
                        Score:
                        ${attempt.score}/${attempt.total}
                    </p>

                    <p>
                        Percentage:
                        ${attempt.percentage}%
                    </p>

                    <p class="muted">
                        ${attempt.date}
                    </p>

                </div>

            `;

        });
}