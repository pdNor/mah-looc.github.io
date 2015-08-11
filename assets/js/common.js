// Don't clutter global namespace
(function(window, document) {
    // Strict mode
    "use strict";

    // Dependencies
    var Http = window.qwest,
        Storage = window.localStorage,
        Cache;

    var Endpoints = {
        data: "/data.json",
        submitQuiz: "http://178.62.76.67/api/quiz"
        // LOCAL
        // submitQuiz: "http://localhost:3000/api/quiz"
    };

    // TODO: check if localStorage exists
    // Setup cache
    if (Storage.getItem("_mah-looc-data")) {
        Cache = JSON.parse(Storage.getItem("_mah-looc-data"));
    } else {
        Cache = { user: null, domains: null, quizAnswers: null, lastUpdated: null };
    }

    function updateStorage() {
        Storage.setItem("_mah-looc-data", JSON.stringify(Cache));
    }

    // Check wether the user is logged in or not
    function userExists() {
        if (Storage.getItem("_mah-looc-data")) {
            var c = JSON.parse(Storage.getItem("_mah-looc-data"));

            if (c.user) {
                Cache.user = c.user;
                updateStorage();
                return true;
            }
        }

        return false;
    }

    // Fetches Quiz answers and stores them in the cache
    function fetchQuizAnswers(cb) {
        if (Cache.quizAnswers) {
            return cb(Cache.quizAnswers);
        }

        return Http.get(Endpoints.data)
            .then(function(res) {
                Cache.quizAnswers = res.answers;
                updateStorage();
                cb(Cache.quizAnswers);
            })
            .catch(function(e, url) {
                // TODO: better error handling
                console.log(e, url);
            });
    }

    // Initial fetch of quiz answers
    fetchQuizAnswers(function(r) {
        // DEBUG
        console.log("Quiz Answers object:", r);
    });

    // DEBUG
    if (Cache.user) console.log("User object:", Cache.user);

    // Convert a HTML NodeList to an array
    function toArray(nodes) {
        var arr = [],
            len = nodes.length;

        for (var i = 0; i < len; i++) {
            arr.push(nodes[i]);
        }

        return arr;
    }

    // Return element by id
    function byId(id) {
        return document.getElementById(id);
    }

    // Return elements by class
    function bySelector(cls) {
        return toArray(document.querySelectorAll(cls));
    }

    // Return elements by tag name
    function byTag(tag) {
        return toArray(document.getElementsByTagName(tag));
    }

    // Returns a new HTML element
    function create(tag) {
        return document.createElement(tag);
    }

    // Determine if haystack starts with needle
    function startsWith(needle, haystack) {
        return (new RegExp("^" + needle)).test(haystack);
    }

    // Add a click event to an element
    function click(element, callback) {
        return element.addEventListener("click", callback, false);
    }

    // Determine if language exists
    function hasLanguage(lang) {
        var languages = [
            'css', 'language-css',
            'html', 'language-html',
            'js', 'language-js'
        ];

        return languages.indexOf(lang) > -1;
    }

    // Determine if we're in standlone mode
    function inStandalone() {
        return ("standalone" in window.navigator) && window.navigator["standalone"];
    }

    // Activate sidebar functionality
    function activateSidebar() {
        var sidebar = byId("sidebar");

        if (!sidebar || inStandalone()) {
            return false;
        }

        // Make sidebar fixed when scrolling
        var header = byId("header");

        window.addEventListener("scroll", function() {
            var top = document.scrollTop || document.body.scrollTop;

            if (top > header.offsetHeight) {
                if (!document.body.classList.contains("fix-sidebar")) {
                    document.body.classList.add("fix-sidebar");
                }
            } else {
                document.body.classList.remove("fix-sidebar");
            }
        }, false);

        // Toggles visibility of the sidebar
        var sidebarButton = byId("toggle-sidebar");
        click(sidebarButton, function() {
            sidebar.classList.toggle("toggle");
        });

        // Toggles visibility of course elements (assignments, exercises, etc.)
        var courseElements = bySelector(".course-overview-element");
        courseElements.forEach(function(el) {
            click(el, function(e) {
                e.target.classList.toggle("toggle");
            });
        });

        return true;
    }

    // Adds a class to the current active navigation anchor
    function highlightHeaderNavigation() {
        var anchors = bySelector(".navigation li a");

        // Filter out exact matches
        var found = anchors.filter(function(a) {
            return a.href == location.href.replace(/\/+$/, "");
        }).map(function(a) {
            a.classList.add("current");
        });

        // Return if any was found
        if (found.length) {
            return anchors;
        }

        // Otherwise use the starting pathname
        anchors.filter(function(a) {
            return startsWith(a.href, location.href);
        }).forEach(function(a) {
            a.classList.add("current");
        });

        return anchors;
    }

    // Adds a class to the current active sidebar navigation anchor
    function highlightSidebarNavigation() {
        var anchors = bySelector("#sidebar ul ul a");

        anchors.filter(function(a) {
            return startsWith(a.href, location.href);
        }).forEach(function(a) {
            a.classList.add("active");
            // TODO: research a better solution for this.
            // a > li > ul > sibling (span)
            a.parentNode.parentNode.previousElementSibling.classList.add("toggle");
        });

        return anchors;
    }

    // Add an anchor to each header (1 - 3)
    function addAnchorsToHeaders() {
        var headers = bySelector("#content h1, #content h2, #content h3");

        // Utilizes the id created from the header content by jekyll
        headers.filter(function(h) {
            return h.id ? true : false;
        }).forEach(function(h) {
            var a = create("a");
            a.href = "#" + h.id;
            a.className = "header-anchor";
            h.appendChild(a);
        });

        return headers;
    }

    // Make external links open in a new browser tab
    function setTargetForExternalLinks() {
        var anchors = byTag("a");

        anchors.filter(function(a) {
            return !startsWith(location.protocol + "//" + location.host, a.href);
        }).forEach(function(a) {
            a.target = "_blank";
        });

        return anchors;
    }

    // Set minimum height for the content area; creates a "sticky" footer
    function setContentHeight() {
        var content = byId("content"),
            wHeight = window.innerHeight,
            bHeight = document.body.clientHeight,
            cHeight = content.offsetHeight;

        if (wHeight - bHeight > 0) {
            content.style.minHeight = (wHeight - (bHeight - cHeight)) + "px";
        }

        return content;
    }

    // Add functionality to web app navigation elements
    function setWebAppNavigation() {
        var curnode,
            sidebar = byId("sidebar");

        document.body.classList.add("standalone");

        if (sidebar) {
            var sidebarButton = byId("web-app-sidebar");
            click(sidebarButton, function() {
                sidebarButton.classList.toggle("toggle");
            });
        }

        // Navigate up
        var up = byId("web-app-top");
        click(up, function() {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
        });

        // Navigate back in history
        var prev = byId("web-app-prev");
        click(prev, function() {
            window.history.go(-1);
        });

        // Navigate forward in history
        var next = byId("web-app-next");
        click(next, function() {
            window.history.go(1);
        });

        click(document, function(e) {
            var re = /^(a|html)$/i;
            curnode = e.target;

            while (!re.test(curnode.nodeName)) {
                curnode = curnode.parentNode;
            }

            if('href' in curnode &&
               (curnode.href.indexOf('http') || ~curnode.href.indexOf(location.host))) {
                e.preventDefault();
                location.href = curnode.href;
            }
        });
    }

    // Creates a button that toggles line numbers in code examples
    function createLineNumberButton() {
        var btn = create("button"),
            txt = document.createTextNode("radnummer");

        btn.className = "toggle-lineno";
        btn.type = "button";

        var show = create("span");
        show.className = "show";
        show.textContent = "Visa ";

        var hide = create("span");
        hide.className = "hide";
        hide.textContent = "Dölj ";

        btn.appendChild(show);
        btn.appendChild(hide);
        btn.appendChild(txt);

        return btn;
    }

    // Add the button that toggles line numbers to a code example
    function addLineNumberButton(element) {
        // Only add a line number button if the code examples has line numbers
        if (element.firstChild.firstChild.childNodes[0].className != "lineno") {
            return false;
        }

        var btn = createLineNumberButton();

        click(btn, function() {
            this.parentElement.classList.toggle("toggle");
        });

        element.appendChild(btn);

        return true;
    }

    // Serialize contents of a code example
    function serializeCode(element) {
        var code = element.firstChild.firstChild,
            language = code.className,
            data = {};

        // Code has to be HTML, CSS or JS
        if (!hasLanguage(language)) {
            return false;
        }

        var content = toArray(code.childNodes)
                .filter(function(n) {
                    return n.className == "lineno" ? false : true;
                })
                .reduce(function(prev, curr) {
                    return prev + curr.textContent;
                }, "");

        // TODO: better parsing should be done
        data[language.substr(9)] = content;
        data["title"] = "Code Example";
        return data;
    }

    // Sends contents of a code example to CodePen
    function submitToCodePen(element) {
        var serialized = serializeCode(element);

        if (!serialized) {
            return false;
        }

        var form = create("form"),
            input = create("input");

        var json = JSON.stringify(serialized)
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");

        input.setAttribute("type", "hidden");
        input.setAttribute("name", "data");
        input.setAttribute("value", json);
        form.setAttribute("method", "post");
        form.setAttribute("action", "http://codepen.io/pen/define");
        form.setAttribute("target", "_blank");
        form.appendChild(input);
        document.body.appendChild(form);

        return form.submit();
    }

    // Adds a button that sends the code to CodePen to a code example
    function addCodePenButton(element) {
        var language = element.firstChild.firstChild.className;

        if (!hasLanguage(language)) {
            return false;
        }

        var btn = create("button");
        btn.textContent = "Öppna i CodePen";
        btn.className = "codepen-button";
        btn.type = "button";

        click(btn, function() {
            submitToCodePen(this.parentElement);
        });

        return element.appendChild(btn);
    }

    // Extend code examples with further functionality
    function extendCodeExamples() {
        var examples = bySelector(".highlight");

        examples.forEach(function(example) {
            addLineNumberButton(example);
            addCodePenButton(example);
        });

        return examples;
    }

    function createFormAlternatives(alternativeList, index) {
        // Determines wether we should create checkboxes or radiobuttons
        var isMultiple = alternativeList.classList.contains("multiple");
        var container = create("div");
        var alpha = ["a", "b", "c", "d", "e", "f", "g", "h", "j"];

        toArray(alternativeList.children).forEach(function(li, i) {
            var label = create("label");
            var input = create("input");
            input.type = isMultiple ? "checkbox" : "radio";
            input.name = "answer-" + index;
            input.value = alpha[i];
            
            // TODO: should we worry about this?
            // input.name = isMultiple ? "answer-" + index + "[]" : "answer-" + index;

            label.appendChild(input);
            label.innerHTML += li.innerHTML;
            container.appendChild(label);
        });

        // TODO: shuffle alternatives?
        return container;
    }

    // Quiz
    function setupQuiz() {
        var alternativeLists = bySelector("#quiz-container .alternatives");

        // Don't do anything if there is no quiz/questions
        if (!alternativeLists.length) {
            return false;
        }

        // convert <ul> of alternatives to radio/checkbutton inputs
        alternativeLists.forEach(function(alternativeList, index) {
            var formAlternatives = createFormAlternatives(alternativeList, index);
            alternativeList.parentNode.replaceChild(formAlternatives, alternativeList);
        });

        var quizForm = byId("quiz-form"),
            quizMessage = byId("quiz-message");

        quizForm.addEventListener("submit", function(e) {
            e.preventDefault();

            // Show message if no user is active
            if (!userExists()) {
                quizMessage.textContent = "Du måste vara inloggad för att kunna svara på denna Quiz.";
                quizMessage.className = "info";
                return false;
            }

            // Reset message
            quizMessage.textContent = "";
            quizMessage.className = "";

            // Serialize the form data into an object
            var formData = toArray(e.target)
                    .filter(function(el) {
                        // Only filter for input elements (radio + checkbox in this case)
                        return (el.tagName == "INPUT") && el.type == "checkbox" || el.type == "radio";
                    })
                    .reduce(function(acc, curr, i, arr) {
                        // Check if previous input is from a different group of alternatives.
                        // So we can add the appropriate object attribute for the payload
                        if (i == 0 || (i > 0 && arr[i].name !== arr[i - 1].name)) {
                            // Checkboxes will be an array of answers and radiobuttons only a string
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

            console.log(formData);

            var quizId = byId("quiz-id").value,
                moduleId = byId("module-id").value;

            // Reduce to the current quiz
            var currQuizAnswers = Cache.quizAnswers
                    .filter(function(a) { return a.id == quizId; })[0];

            // TODO: check if no quiz was found?

            var results = currQuizAnswers.answers.map(function(answer, i) {
                // TODO: check if no answers was found by user?
                var userAnswer = formData["answer-" + i];

                // Radio button
                if (answer.type == "radio") {
                    return answer.correct == userAnswer;
                }

                // Not enough correct checkboxes
                if (userAnswer.length !== answer.correct.length) {
                    return false;
                }

                // TODO: this doesnt really work with shuffled answers? perhaps if we sort them first?
                return answer.correct.every(function(a, i) {
                    return a == userAnswer[i];
                });
            });

            // Amount of correct answers
            var correctAnswers = results.reduce(function(p, c) { return c ? p + 1 : p + 0; }, 0);

            // TODO: here we could use the quiz level required to pass

            quizMessage.textContent = "Antal rätt svar: " + correctAnswers + "/" + currQuizAnswers.answers.length;
            quizMessage.className = "info";

            console.log(results);

            var payload = {
                id: Cache.user.id, 
                code: Cache.user.code,
                quiz: quizId,
                module: moduleId,
                hash: Cache.user.paths[0].hash,
                answers: formData,
                done: correctAnswers == currQuizAnswers.answers.length
            };

            return Http.post(Endpoints.submitQuiz, payload, { dataType: "json"})
                .then(function(res) { return JSON.parse(res); })
                .then(function(res) {
                    var submitButton;
                    
                    Cache.user = res.user;
                    updateStorage();

                    if (correctAnswers == currQuizAnswers.answers.length) {
                        var index,
                            m;

                        Cache.user.paths[0].modules.forEach(function(module, i, arr) {
                            if (module.mid == moduleId && arr[i + 1]) {
                                index = i + 1;
                                m = arr[i + 1];
                            }
                        });

                        var progressLink = create("a");
                        progressLink.className = "submit-quiz-form";

                        if (index) {
                            progressLink.textContent = "Gå vidare";
                            progressLink.href = "/domains/" + m.domain + "/modules/" + m.mid + ".html";
                        } else {
                            progressLink.textContent = "Profil";
                            progressLink.href = "/path/profile.html";
                        }

                        submitButton = byId("submit-quiz");
                        submitButton.parentNode.replaceChild(progressLink, submitButton);
                    } else {
                        var retryLink = create("a");
                        retryLink.textContent = "Försök igen";
                        retryLink.className = "submit-quiz-form";
                        retryLink.href = "";

                        submitButton = byId("submit-quiz");
                        submitButton.parentNode.replaceChild(retryLink, submitButton);
                    }
                })
                .catch(function(e, url) {
                    // TODO: better error handling
                    console.log(e, url);
                });
        });

        return true;
    }

    // Create the button for showing/hiding the spoiler text
    function createShowSpoilerButton(spoiler) {
        var button = create("button");
        button.type = "button";
        button.className = "show-spoiler";
        button.textContent = "Visa svar";

        // Toggle visibility of the spoiler with classes
        button.addEventListener("click", function() {
            if (this.className == "show-spoiler") {
                // Show the spoiler text
                spoiler.className = "spoiler show";
                this.className = "hide-spoiler";
                this.textContent = "Dölj svar";
            } else {
                // Hide the spoiler text
                spoiler.className = "spoiler";
                this.className = "show-spoiler";
                this.textContent = "Visa svar";
            }
        });

        return button;
    }

    // Spoilers
    function setupSpoilers() {
        var spoilers = bySelector(".spoiler");

        // Don't do anything if there are no spoilers
        if (!spoilers) {
            return false;
        }

        spoilers.forEach(function(spoiler) {
            var button = createShowSpoilerButton(spoiler);
            // TODO: better solution for this (icase nextSibling is undefined)?
            spoiler.parentNode.insertBefore(button, spoiler.nextSibling);
        });
        
        return true;
    }

    // On page load
    window.addEventListener("load", function load() {
        // Only run the event listener once
        window.removeEventListener("load", load, false);

        setContentHeight();
        activateSidebar();
        highlightHeaderNavigation();
        highlightSidebarNavigation();
        addAnchorsToHeaders();
        setTargetForExternalLinks();
        extendCodeExamples();
        setupSpoilers();

        // TODO: Quiz should not be shown or working if no user is active?
        setupQuiz();

        // Only add web app navigation if we're in standalone mode
        if (inStandalone()) {
            setWebAppNavigation();
        }
    }, false);

// Invoke anonymous function
})(window, document);
