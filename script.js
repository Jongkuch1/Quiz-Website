class QuizApp {
    constructor() {
        this.quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
        this.scores = JSON.parse(localStorage.getItem('scores')) || [];
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.questionCount = 1;
        
        this.initEventListeners();
        this.showSection('homeSection');
        this.displayQuizzes();
    }

    initEventListeners() {
        // Navigation
        document.getElementById('homeBtn').addEventListener('click', () => {
            this.showSection('homeSection');
            this.displayQuizzes();
        });
        
        document.getElementById('createBtn').addEventListener('click', () => {
            this.showSection('createSection');
        });
        
        document.getElementById('scoresBtn').addEventListener('click', () => {
            this.showSection('scoresSection');
            this.displayScores();
        });

        // Quiz creation
        document.getElementById('addQuestion').addEventListener('click', () => {
            this.addQuestion();
        });
        
        document.getElementById('createQuizForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createQuiz();
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(sectionId).classList.add('active');
        
        if (sectionId === 'homeSection') {
            document.getElementById('homeBtn').classList.add('active');
        } else if (sectionId === 'createSection') {
            document.getElementById('createBtn').classList.add('active');
        } else if (sectionId === 'scoresSection') {
            document.getElementById('scoresBtn').classList.add('active');
        }
    }

    addQuestion() {
        this.questionCount++;
        const questionsContainer = document.getElementById('questionsContainer');
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <input type="text" class="question-text" placeholder="Question ${this.questionCount}" required>
            <input type="text" class="option" placeholder="Option A" required>
            <input type="text" class="option" placeholder="Option B" required>
            <input type="text" class="option" placeholder="Option C" required>
            <input type="text" class="option" placeholder="Option D" required>
            <select class="correct-answer" required>
                <option value="">Select Correct Answer</option>
                <option value="0">A</option>
                <option value="1">B</option>
                <option value="2">C</option>
                <option value="3">D</option>
            </select>
            <button type="button" class="remove-question" onclick="this.parentElement.remove()">Remove</button>
        `;
        questionsContainer.appendChild(questionDiv);
    }

    createQuiz() {
        const title = document.getElementById('quizTitle').value;
        const questionItems = document.querySelectorAll('.question-item');
        const questions = [];

        questionItems.forEach(item => {
            const questionText = item.querySelector('.question-text').value;
            const options = Array.from(item.querySelectorAll('.option')).map(opt => opt.value);
            const correctAnswer = parseInt(item.querySelector('.correct-answer').value);

            questions.push({
                question: questionText,
                options: options,
                correctAnswer: correctAnswer
            });
        });

        const quiz = {
            id: Date.now(),
            title: title,
            questions: questions,
            createdAt: new Date().toLocaleDateString()
        };

        this.quizzes.push(quiz);
        localStorage.setItem('quizzes', JSON.stringify(this.quizzes));
        
        // Reset form
        document.getElementById('createQuizForm').reset();
        document.getElementById('questionsContainer').innerHTML = `
            <div class="question-item">
                <input type="text" class="question-text" placeholder="Question 1" required>
                <input type="text" class="option" placeholder="Option A" required>
                <input type="text" class="option" placeholder="Option B" required>
                <input type="text" class="option" placeholder="Option C" required>
                <input type="text" class="option" placeholder="Option D" required>
                <select class="correct-answer" required>
                    <option value="">Select Correct Answer</option>
                    <option value="0">A</option>
                    <option value="1">B</option>
                    <option value="2">C</option>
                    <option value="3">D</option>
                </select>
            </div>
        `;
        this.questionCount = 1;
        
        alert('Quiz created successfully!');
        this.showSection('homeSection');
        this.displayQuizzes();
    }

    displayQuizzes() {
        const quizList = document.getElementById('quizList');
        
        if (this.quizzes.length === 0) {
            quizList.innerHTML = '<p style="text-align: center; color: #666;">No quizzes available. Create your first quiz!</p>';
            return;
        }

        quizList.innerHTML = this.quizzes.map(quiz => `
            <div class="quiz-card" onclick="quizApp.startQuiz(${quiz.id})">
                <h3>${quiz.title}</h3>
                <p>${quiz.questions.length} questions</p>
                <p>Created: ${quiz.createdAt}</p>
            </div>
        `).join('');
    }

    startQuiz(quizId) {
        this.currentQuiz = this.quizzes.find(quiz => quiz.id === quizId);
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.showSection('quizSection');
        this.displayQuestion();
    }

    displayQuestion() {
        const quizContent = document.getElementById('quizContent');
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;

        quizContent.innerHTML = `
            <div class="quiz-header">
                <h2>${this.currentQuiz.title}</h2>
                <p>Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.questions.length}</p>
                <div class="quiz-progress">
                    <div class="quiz-progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="quiz-question">
                <h3>${question.question}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="option-btn" onclick="quizApp.selectAnswer(${index})">${String.fromCharCode(65 + index)}. ${option}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    selectAnswer(answerIndex) {
        // Remove previous selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection to clicked option
        event.target.classList.add('selected');
        
        // Store answer and move to next question after delay
        setTimeout(() => {
            this.userAnswers[this.currentQuestionIndex] = answerIndex;
            this.currentQuestionIndex++;
            
            if (this.currentQuestionIndex < this.currentQuiz.questions.length) {
                this.displayQuestion();
            } else {
                this.showResults();
            }
        }, 500);
    }

    showResults() {
        let correctAnswers = 0;
        this.currentQuiz.questions.forEach((question, index) => {
            if (this.userAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / this.currentQuiz.questions.length) * 100);
        
        // Save score
        const scoreRecord = {
            quizTitle: this.currentQuiz.title,
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: this.currentQuiz.questions.length,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };
        
        this.scores.push(scoreRecord);
        localStorage.setItem('scores', JSON.stringify(this.scores));

        const quizContent = document.getElementById('quizContent');
        quizContent.innerHTML = `
            <div class="quiz-result">
                <h2>Quiz Complete!</h2>
                <div class="score-display">${score}%</div>
                <p>You got ${correctAnswers} out of ${this.currentQuiz.questions.length} questions correct!</p>
                <button onclick="quizApp.showSection('homeSection'); quizApp.displayQuizzes()">Back to Home</button>
                <button onclick="quizApp.startQuiz(${this.currentQuiz.id})">Retake Quiz</button>
            </div>
        `;
    }

    displayScores() {
        const scoresList = document.getElementById('scoresList');
        
        if (this.scores.length === 0) {
            scoresList.innerHTML = '<p style="text-align: center; color: #666;">No quiz scores yet. Take a quiz to see your results!</p>';
            return;
        }

        // Sort scores by date (newest first)
        const sortedScores = this.scores.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));

        scoresList.innerHTML = sortedScores.map(score => `
            <div class="score-item">
                <h4>${score.quizTitle}</h4>
                <p><strong>Score:</strong> ${score.score}% (${score.correctAnswers}/${score.totalQuestions})</p>
                <p><strong>Date:</strong> ${score.date} at ${score.time}</p>
            </div>
        `).join('');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});
