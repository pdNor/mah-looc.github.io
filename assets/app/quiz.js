import PubSub from "pubsub-js";
import Cache from "./cache.js";
import ENDPOINTS from "./endpoints.js";
import {
    byId,
    bySelector,
    create,
    shuffle,
    toArray,
    click
} from "./helpers.js";

let Http = window.qwest;

// Converts a list to form alternatives
function convertAlternatives(list, index) {
    let isMulti = list.classList.contains("multiple"),
        div = create("div"),
        alpha = "abcdefghj".split("");

    div.id = "answer-" + index;

    // Creates a <input> alternative
    function createAlternative(li, i) {
        let label = create("label"),
            input = create("input");

        input.type = isMulti ? "checkbox" : "radio";
        input.name = "answer-" + index;
        input.value = alpha[i];

        // TODO: should we worry about this?
        // input.name = isMultiple ? "answer-" + index + "[]" : "answer-" + index;

        label.appendChild(input);
        label.innerHTML += li.innerHTML;
        return label;
    }

    // Shuffle alternatives, then create them and append them to the <div>
    shuffle(toArray(list.children)
        .map(createAlternative))
        .map((label) => div.appendChild(label));
    
    return div;
}

// Toggles visibility of a question
function addToggleButton(list, index, headers, form) {
    // TODO: better solution for all of this
    // We go from one header to the list of alternatives
    // and append all the elements to a div and then create
    // a button at the end which toggles the CSS display
    // attribute of the div. Unsure of the performance.
    let header = headers[index],
        div = create("div"),
        i = 0,
        cur = header,
        prev;

    div.className = "toggle-question";
    div.style.display = "none";

    while (cur !== list || i >= 50) {
        if (prev && prev.nodeType == document.ELEMENT_NODE && prev !== header) {
            div.appendChild(prev);
        }

        prev = cur;
        cur = cur.nextSibling;
        i++;
    }

    form.insertBefore(div, list);
    div.appendChild(list);

    let btn = create("button");
    btn.type = "button";
    btn.className = "toggle-question-button";
    btn.textContent = "Visa frågan";

    form.insertBefore(btn, div);

    click(btn, () => {
        if (div.style.display == "none") {
            div.style.display = "block";
            btn.textContent = "Dölj frågan";
        } else {
            div.style.display = "none";
            btn.textContent = "Visa frågan";
        }
    });
}

// Serialize form data into an object
function serializeFormData(target) {
    return toArray(target)
        // Only filter for input elements (radio + checkbox in this case)
        .filter((el) => (el.tagName == "INPUT") && el.type == "checkbox" || el.type == "radio")
        .reduce((acc, curr, i, arr) => {
            // Check if previous input is from a different group of alternatives.
            // So we can add the appropriate object attribute for the payload
            if (i == 0 || (i > 0 && arr[i].name !== arr[i - 1].name)) {
                acc[curr.name] = curr.type == "checkbox" ? [] : "";
            }
            // If isnt checked just return the accumulator
            if (!curr.checked) {
                return acc;
            }
            // Add the chosen answer(s)
            if (curr.type == "checkbox") {
                acc[curr.name].push(curr.value);
            } else {
                acc[curr.name] = curr.value;
            }

            return acc;
        }, {});
}

// Calculate quiz answer result
function calculateResult(userAnswer, answer) {
    // Radio button
    if (answer.type == "radio") {
        return answer.correct == userAnswer;
    }
    // Incorrect amout of choices
    if (userAnswer.length !== answer.correct.length) {
        return false;
    }
    // Sort answers
    userAnswer.sort();
    // Check each answer
    return answer.correct.sort().every((a, i) => a == userAnswer[i]);
}

// Submit Quiz
function submitQuiz(e) {
    e.preventDefault();

    let quizMessage = byId("quiz-message"),
        quizId = byId("quiz-id").value,
        moduleId = byId("module-id").value;

    // Can't submit quiz if you're not logged in
    if (!Cache.userExists()) {
        quizMessage.textContent = "Du måste vara inloggad för att kunna svara";
        quizMessage.className = "info";
        return false;
    }

    // Reset message
    quizMessage.textContent = "";
    quizMessage.className = "";

    // Check wether a user has permission to take a quiz or not
    let userCanTakeQuiz = Cache.user.paths[0].modules.some((m) => m.mid == moduleId);

    if (!userCanTakeQuiz) {
        return false;
    }
    // Serialize form data
    let formData = serializeFormData(e.target);
    // Get current quiz answers
    let currQuizAnswers = Cache.quizAnswers.filter((a) => a.id == quizId)[0];
    // Get the correct answers for the user
    let results = currQuizAnswers.answers
            .map((answer, i) => calculateResult(formData["answer-" + i], answer))

    // Amount of correct answers
    let correctAnswers = results.reduce((p, c) => c ? p + 1 : p + 0, 0),
        allCorrectAnswers = correctAnswers == currQuizAnswers.answers.length;

    // TODO: could use level required to pass here

    quizMessage.textContent = "Antal rätt svar: " + correctAnswers + "/" + currQuizAnswers.answers.length;
    quizMessage.className = "info";

    // Quiz payload
    var payload = {
        id: Cache.user.id,
        code: Cache.user.code,
        hash: Cache.user.paths[0].hash,
        quiz: quizId,
        module: moduleId,
        answers: formData,
        done: allCorrectAnswers
    };

    return sendQuizResults(payload, allCorrectAnswers);
}

// Send quiz results
function sendQuizResults(payload, done) {
    return Http.post(ENDPOINTS.submitQuiz, payload, { dataType: "json"})
        .then((res) => JSON.parse(res))
        .then((res) => {
            Cache.updateUser(res.user);
            showQuizCompletionMessage(done);
        })
        .catch((e, url) => console.log(e, url));
}

// Show different messages depending on results from the quiz
function showQuizCompletionMessage(done) {
    let submitBtn = byId("submit-quiz"),
        moduleId = byId("module-id").value,
        a = create("a");

    a.className = "submit-quiz-form";

    if (done) {
        let index, module;

        // Filter out the "next" quiz
        Cache.user.paths[0].modules
            .filter((m) => m.mid == moduleId)
            .forEach((m, i, arr) => {
                if (arr[i + 1]) {
                    index = i + 1;
                    module = arr[i + 1];
                }
            });

        // Another quiz exists
        if (index) {
            a.textContent = "Gå vidare";
            a.href = "/domains/" + m.domain + "/modules/" + m.mid + ".html";
        } else {
            a.textContent = "Profil";
            a.href = "/path/profile.html";
        }

        // Update sidebar path list
        PubSub.publish("user.quiz.done", Cache.user);
    } else {
        a.textContent = "Försök igen";
        a.href = "";
    }

    submitBtn.parentNode.replaceChild(a, submitBtn);
}

// Setup a quiz
function setupQuiz() {
    // Elements
    let quizContainer = byId("quiz-container"),
        quizForm = byId("quiz-form"),
        moduleId = byId("module-id").value,
        questionHeaders = bySelector("#quiz-container h3"),
        alternativeLists = bySelector("#quiz-container .alternatives");

    // Check wether a user has permission to take a quiz or not
    let userCanTakeQuiz = Cache.user.paths[0].modules.some((m) => m.mid == moduleId);

    if (!userCanTakeQuiz) {
        return;
    }

    // Login/Logout events
    PubSub.subscribe("user.login", () => quizContainer.style.display = "block");
    PubSub.subscribe("user.logout", () => quizContainer.style.display = "none");

    // If there are no alternatives we wont convert the lists into a quiz
    if (!alternativeLists.length) {
        return;
    }

    // If there are alternatives and an active user - show the quiz
    if (Cache.userExists()) {
        quizContainer.style.display = "block";
    }

    // Convert all lists to form alternatives
    alternativeLists
        .map((list, index) => {
            let alternatives = convertAlternatives(list, index);
            list.parentNode.replaceChild(alternatives, list);
            return alternatives;
        })
        .map((list, index) => addToggleButton(list, index, questionHeaders, quizForm));

    quizForm.addEventListener("submit", submitQuiz, false);
}

export default setupQuiz;
