var colors = {
    agree: "rgb(51, 164, 116)",
    disagree: "rgb(136, 97, 154)",
    neutral: "rgb(81, 89, 106)"
}
var questionCount = 1;
const questionsDiv = document.getElementById("questions");
var dataList = "";
var dataListPersonal = "";
var flipped = false;
var currentQuestion = 1;

function toggleElement(popupId) { // Enables and disables a panel
    if (document.getElementById(popupId).style.visibility == "hidden")
        document.getElementById(popupId).style.visibility = "unset";
    else
        document.getElementById(popupId).style.visibility = "hidden";
}

function createButton(size, color, yOffset, questionNum, answerNum) { // Creates the circle answer buttons
    return btn = "<button id='question" + questionNum + ",answer" + answerNum + "' class='answer' style='width: " + size + "px; height: " + size + "px; border-color: " + color + "; background-color: " + 'rgba(0,0,0,0)' + "; bottom: " + yOffset + "px'></button>";
}

function createQuestion(question, id) { // Displays a question given it's text and index
    let temp = "";
    temp += '<div id="question' + id + '" class="questionBox">';
    temp += '<h2 class="question">' + question + '</h2>';
    temp += '<div id="answerSection' + questionCount + '" class="answerSection">';
    temp += "<h2 style='font-weight: normal; float: left; position: relative; top: 20px; left: 20px; color: " + colors.agree + ";'>Agree</h2>";
    // Creating, positioning, and coloring the answer buttons
    let c = 1;
    for (let i = -2; i < 3; i++) {
        let color = colors.neutral;
        if (i < 0)
            color = colors.agree;
        else if (i > 0)
            color = colors.disagree;
        if (i != 0)
            yOffset = Math.abs(i) * -4;
        else
            yOffset = 0;
        temp += createButton(72 + Math.abs(i * 10), color, yOffset, id, c);
        c++;
    }
    temp += "<h2 style='font-weight: normal; float: right; position: relative; top: 20px; right: 20px; color: " + colors.disagree + ";'>Disagree</h2>";
    temp += '</div>';
    temp += '</div><hr id="hr' + id + '">';
    questionsDiv.innerHTML += temp;
    questionCount++;
}

function loadQuestions() {
    questionsDiv.innerHTML = "";
    // Creates and displays all questions from the dataList
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++)
            createQuestion(dataList.categories[i].questions[j].question, dataList.categories[i].questions[j].index);
    }

    // Handling answer buttons' actions
    let allAnswerButtons = document.getElementsByClassName("answer");
    for (let i = 0; i < allAnswerButtons.length; i++) {
        // When the user hovers over an answer button
        allAnswerButtons[i].addEventListener("mouseover", function (event) {
            event.target.style.backgroundColor = event.target.style.borderColor;
        });
        // When the user stops hovering over an answer
        allAnswerButtons[i].addEventListener("mouseout", function (event) {
            if (getQuestionFromIndex(event.target.id.split(",")[0].replace("question", "")).answer != event.target.id.split(",")[1].replace("answer", ""))
                event.target.style.backgroundColor = "rgba(0,0,0,0)";
        });
        // When the user clicks an answer
        allAnswerButtons[i].addEventListener("click", function (event) {
            let q = event.target.id.split(",")[0].replace("question", "");
            let a = event.target.id.split(",")[1].replace("answer", "");
            for (let i = 1; i <= 5; i++)
                document.getElementById("question" + q + ",answer" + i).style.backgroundColor = "rgba(0,0,0,0)";
            event.target.style.backgroundColor = event.target.style.borderColor;
            answer(q, a);
        });
    }

    fadeAllExceptCurrent();
}

// Returns a question object when given it's category and category-based index
function getQuestionFromCategoryIndex(category, index) {
    for (let i = 0; i < dataList.categories.length; i++) {
        if (dataList.categories[i] == category)
            return dataList.categories[i].questions[index];
    }
    return "question not found";
}

// Returns a question object when given it's global index
function getQuestionFromIndex(index) {
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            if (dataList.categories[i].questions[j].index == index)
                return dataList.categories[i].questions[j];
        }
    }
    return "question not found";
}

// Fades every question
function fadeQuestions() {
    let c = 1;
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            document.getElementById("question" + c).style.opacity = "10%";
            c++;
        }
    }
}

// Makes all questions except the current one faded out
function fadeAllExceptCurrent() {
    let c = 1;
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            if (c != currentQuestion)
                document.getElementById("question" + c).style.opacity = "10%";
            else
                document.getElementById("question" + c).style.opacity = "100%";
            c++;
        }
    }
}

// Called when the user clicks on an answer button
function answer(question, answer) {
    getQuestionFromIndex(question).answer = answer; // Recored the user selection to the dataList
    let completion = Math.round(currentQuestion / (questionCount - 1) * 100) + "%";
    document.getElementById("progressBar").style.width = completion; // Changes the status of the progress bar at the top
    document.getElementById("percentage").innerHTML = completion;
    if (question >= questionCount - 1) { // If the user is on the last question
        document.getElementById("question" + (question * 1)).style.opacity = "100%"; // Make the current question not faded
        return;
    }
    fadeQuestions(); // Fade all questions
    document.getElementById("question" + ((question * 1) + 1)).style.opacity = "100%"; // Make the current question not faded
    currentQuestion = (question * 1) + 1;
    open("#question" + question + ",answer1", "_self"); // Scrolls down to the next question
}

// Returns the amount of points that a button gives based on whether the question is worth negative or positive points
function getPoints(answerIndex, worth) {
    answerIndex *= 1;
    let positiveScores = [2, 1, 0, -1, -2];
    let negativeScores = [-2, -1, 0, 1, 2];
    if (worth == "+" || worth == "positive")
        return positiveScores[answerIndex - 1]; // The -1 is because the buttons are labeled with the first index being 1, not 0
    else
        return negativeScores[answerIndex - 1];
}

var storedTestingPage = "";
var personalScores = [];
var otherScores = [];
// Calculates the final score for each category as a percentage
function calculateScore() {
    if (!flipped) {
        flip();
        return;
    }

    for (let i = 0; i < dataList.categories.length; i++) {
        qCount = 0; // Amount of questions in this category
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            // Checking for blank answers
            if (dataList.categories[i].questions[j].answer == "none") // If the user didn't answer a question
                dataList.categories[i].questions[j].answer = 3; // 3 is the middle option (neutral)
            if (dataListPersonal.categories[i].questions[j].answer == "none")
                dataListPersonal.categories[i].questions[j].answer = 3;
            // Getting the category scores
            dataList.categories[i].score += getPoints(dataList.categories[i].questions[j].answer, dataList.categories[i].questions[j].worth); // Adds the score from this question to it's respective category's total score
            dataListPersonal.categories[i].score += getPoints(dataListPersonal.categories[i].questions[j].answer, dataListPersonal.categories[i].questions[j].worth); // Adds the score from this question to it's respective category's total personal score
            qCount++;
        }
        // Making the category scores into percentages
        let score = Math.round(((dataList.categories[i].score + (qCount * 2)) / (qCount * 4)) * 100) + "%"; // Calculates the final percentage
        let personalScore = Math.round(((dataListPersonal.categories[i].score + (qCount * 2)) / (qCount * 4)) * 100) + "%"; // Calculates the final personal percentage
        // Adding the percentages to the final results table
        document.getElementById("resultsTable").innerHTML += "<tr><td>" + dataList.categories[i].name + "</td><td>" + personalScore + "</td><td>" + score + "</td>";
    }

    toggleElement("mainTestPage");
    storedTestingPage = document.getElementById("mainTestPage").innerHTML;
    document.getElementById("mainTestPage").innerHTML = "";
    toggleElement("scoringPage");
    open("#title", "_self"); // Return to top of page
}

// Selects the far left answer choice for each question for testing purposes
function autoComplete() {
    let c = 1;
    for (let i = 0; i < dataList.categories.length; i++) {
        for (let j = 0; j < dataList.categories[i].questions.length; j++) {
            answer(c, 1);
            document.getElementById("question" + c + ",answer1").style.backgroundColor = document.getElementById("question" + c + ",answer1").style.borderColor;
            c++;
        }
    }
}

function onlineStart() { // For if the site is on a server (or VSCode Live Server)
    fetch('questions.json')
        .then(response => response.text())
        .then(data => {
            dataList = JSON.parse(data);
            console.log(dataList);
            loadQuestions();
            // Checks if the user is at a specific question and returns to the top when the page first loads
            if (window.location.href.indexOf("#") > -1)
                window.location.href = (window.location.href.substring(0, window.location.href.indexOf("#")));
        })
        .catch(err => {
            console.error(err);
        });
}

function flip() { // For if the site is on a server (or VSCode Live Server)
    fetch('questions360.json')
        .then(response => response.text())
        .then(data => {
            if (flipped)
                return;
            dataListPersonal = dataList;
            dataList = JSON.parse(data);
            console.log(dataList);
            loadQuestions();
            currentQuestion = 1;
            fadeAllExceptCurrent();
            flipped = true;
            toggleElement("flippedExplanation");

            open("#title", "_self"); // Return to top of page
        })
        .catch(err => {
            console.error(err);
        });
}

onlineStart();