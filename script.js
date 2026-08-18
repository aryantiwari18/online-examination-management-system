const users = [
    {
        username: "student",
        password: "1234",
        role: "student",
        name: "Student"
    },
    {
        username: "admin",
        password: "admin123",
        role: "admin",
        name: "Administrator"
    }
];

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
        questions: [
            {
                question: "What is the main purpose of Software Engineering?",
                options: [
                    "To design computer hardware",
                    "To develop reliable and maintainable software",
                    "To increase internet speed",
                    "To manage computer networks"
                ],
                answer: 1
            },
            {
                question: "Which model follows a sequential development process?",
                options: [
                    "Agile Model",
                    "Spiral Model",
                    "Waterfall Model",
                    "Prototype Model"
                ],
                answer: 2
            },
            {
                question: "What does SDLC stand for?",
                options: [
                    "Software Development Life Cycle",
                    "System Design Life Cycle",
                    "Software Design Level Control",
                    "System Development Level Cycle"
                ],
                answer: 0
            }
        ],
        active: true
    },
    {
        id: 2,
        title: "Database Management System",
        duration: 25,
        questions: [
            {
                question: "Which key uniquely identifies a record?",