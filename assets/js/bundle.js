/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _cacheJs = __webpack_require__(1);

	var _cacheJs2 = _interopRequireDefault(_cacheJs);

	var _coreJs = __webpack_require__(3);

	var _coreJs2 = _interopRequireDefault(_coreJs);

	var _quizJs = __webpack_require__(5);

	var _quizJs2 = _interopRequireDefault(_quizJs);

	var _helpersJs = __webpack_require__(4);

	// React components

	var _componentsAddPathJs = __webpack_require__(7);

	var _componentsAddPathJs2 = _interopRequireDefault(_componentsAddPathJs);

	var _componentsCreatePathJs = __webpack_require__(8);

	var _componentsCreatePathJs2 = _interopRequireDefault(_componentsCreatePathJs);

	var _componentsSidebarJs = __webpack_require__(9);

	var _componentsSidebarJs2 = _interopRequireDefault(_componentsSidebarJs);

	var _componentsProfileJs = __webpack_require__(10);

	var _componentsProfileJs2 = _interopRequireDefault(_componentsProfileJs);

	var React = window.React,
	    Location = window.location;

	// Update cache with data from webstorage
	// (otherwise fetch the local data from the current server)
	_cacheJs2["default"].refresh();

	function main() {
	    // TODO: better solution for this?

	    // Elements used to activate certain features
	    var sidebar = (0, _helpersJs.byId)("sidebar"),
	        codeExamples = (0, _helpersJs.bySelector)(".highlight"),
	        spoilers = (0, _helpersJs.bySelector)(".spoiler"),
	        quiz = (0, _helpersJs.byId)("quiz-container"),
	        addPathComponent = (0, _helpersJs.byId)("add-path-container"),
	        createPathComponent = (0, _helpersJs.byId)("create-path-container"),
	        sidebarComponent = (0, _helpersJs.byId)("app-sidebar"),
	        profileComponent = (0, _helpersJs.byId)("profile-container");

	    // Common stuff
	    _coreJs2["default"].setExternalHrefs();
	    _coreJs2["default"].setStickyFooter();
	    _coreJs2["default"].setAnchorsToHeaders();
	    _coreJs2["default"].highlightNavigation();
	    // Sidebar
	    if (sidebar) {
	        _coreJs2["default"].setSidebar();
	    }
	    // Code examples
	    if (codeExamples.length) {
	        codeExamples.map(function (e) {
	            _coreJs2["default"].addLineNumberButton(e);
	            _coreJs2["default"].addCodePenButton(e);
	        });
	    }
	    // Spoilers
	    if (spoilers.length) {
	        spoilers.map(function (e) {
	            return _coreJs2["default"].addSpoilerButton(e);
	        });
	    }
	    // Quiz
	    if (quiz) {
	        // TODO: create a proper react component for this
	        (0, _quizJs2["default"])();
	    }

	    // React Components

	    // Add path
	    if (addPathComponent) {
	        var hash = (0, _helpersJs.getUrlParams)(Location.search.substring(1)).hash || "";
	        React.render(React.createElement(_componentsAddPathJs2["default"], { hash: hash }), addPathComponent);
	    }
	    // Sidebar
	    if (sidebarComponent) {
	        React.render(React.createElement(_componentsSidebarJs2["default"], null), sidebarComponent);
	    }
	    // Profile
	    if (profileComponent) {
	        React.render(React.createElement(_componentsProfileJs2["default"], null), profileComponent);
	    }
	    // Create path
	    if (createPathComponent) {
	        React.render(React.createElement(_componentsCreatePathJs2["default"], null), createPathComponent);
	    }
	}

	window.addEventListener("load", function load() {
	    window.removeEventListener("load", load, false);
	    main();
	}, false);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _endpointsJs = __webpack_require__(2);

	var _endpointsJs2 = _interopRequireDefault(_endpointsJs);

	var Http = window.qwest,
	    Storage = window.sessionStorage,
	    identifier = "_mah-looc-data";

	// Wrapper for webstorage

	var Cache = (function () {
	    function Cache(storage, identifier) {
	        _classCallCheck(this, Cache);

	        this.storage = storage;
	        this.identifier = identifier;
	        // storage specific data
	        this.cache = {
	            user: null,
	            domains: null,
	            quizAnswers: null,
	            lastUpdated: null
	        };
	    }

	    // Export the cache object (instance)

	    // Go through all domains, re-assign the modules
	    // property and filter out related modules, sort
	    // all domains by ids

	    _createClass(Cache, [{
	        key: "buildDomainModuleTree",
	        value: function buildDomainModuleTree(domains, modules) {
	            return domains.map(function (domain) {
	                // Re-assign all modules to each domain
	                domain.modules = modules.filter(function (module) {
	                    return module.domain == domain.id;
	                }).map(function (module) {
	                    module.mid = module.id;
	                    delete module.id;
	                    return module;
	                });
	                return domain;
	            }).sort(function (a, b) {
	                // Get numeric values for the ids (ex. "D01" > 1)
	                var idA = +a.id.substring(1),
	                    idB = +b.id.substring(1);
	                return idB < idA ? 1 : -1;
	            });
	        }

	        // Parse JSON data from webstorage
	    }, {
	        key: "getData",
	        value: function getData() {
	            return JSON.parse(this.storage.getItem(this.identifier));
	        }

	        // Check if any data is cached
	    }, {
	        key: "exists",
	        value: function exists() {
	            return Boolean(this.storage.getItem(this.identifier));
	        }

	        // Refresh the cache
	    }, {
	        key: "refresh",
	        value: function refresh() {
	            var _this = this;

	            if (this.exists()) {
	                this.cache = this.getData();
	                return;
	            }

	            // Update local data silently
	            return Http.get(_endpointsJs2["default"].localData).then(function (res) {
	                _this.cache.domains = _this.buildDomainModuleTree(res.domains, res.modules);
	                _this.cache.quizAnswers = res.answers;
	                _this.update();
	            })["catch"](function (e) {
	                return console.log(e);
	            }); // TODO: error handling
	        }

	        // Update webstorage with new data
	    }, {
	        key: "update",
	        value: function update() {
	            this.storage.setItem(this.identifier, JSON.stringify(this.cache));
	        }

	        // Update all quiz answers
	    }, {
	        key: "updateQuizAnswers",
	        value: function updateQuizAnswers(answers) {
	            this.cache.quizAnswers = answers;
	            this.update();
	        }

	        // Update the user object
	    }, {
	        key: "updateUser",
	        value: function updateUser(user) {
	            this.cache.user = user;
	            this.update();
	        }

	        // Update the domains object
	    }, {
	        key: "updateDomains",
	        value: function updateDomains(domains) {
	            this.cache.domains = domains;
	            this.update();
	        }

	        // Check if a user is stored in the webstorage
	    }, {
	        key: "userExists",
	        value: function userExists() {
	            if (this.exists()) {
	                this.cache = this.getData();
	                return this.cache.user ? true : false;
	            }

	            return false;
	        }

	        // Check if quiz answers are stored in the cache
	        // otherwise fetch them from the local JSON file
	    }, {
	        key: "getQuizAnswers",
	        value: function getQuizAnswers(callback) {
	            var _this2 = this;

	            if (this.cache.quizAnswers !== null) {
	                return callback(this.cache.quizAnswers);
	            }

	            return Http.get(_endpointsJs2["default"].localData).then(function (res) {
	                _this2.updateQuizAnswers(res.answers);
	                callback(res.answers);
	            })["catch"](function (e) {
	                return callback(e);
	            }); // TODO: error handling?
	        }

	        // Check if the domains are stored in the cache
	        // otherwise fetch them from the local JSON file
	    }, {
	        key: "getDomains",
	        value: function getDomains(callback) {
	            var _this3 = this;

	            if (this.cache.domains !== null) {
	                return callback(this.cache.domains);
	            }

	            return Http.get(_endpointsJs2["default"].localData).then(function (res) {
	                var domains = _this3.buildDomainModuleTree(res.domains, res.modules);
	                _this3.updateDomains(domains);
	                callback(domains);
	            })["catch"](function (e) {
	                return callback(e);
	            }); // TODO: error handling?
	        }

	        // Check if the user is stored in the cache
	        // otherwise fetch the user from the server (by code)
	    }, {
	        key: "getUser",
	        value: function getUser(code, callback) {
	            var _this4 = this;

	            if (this.cache.user !== null) {
	                return callback(this.cache.user);
	            }

	            return Http.get(_endpointsJs2["default"].getUser, { code: code }).then(function (res) {
	                return JSON.parse(res);
	            }).then(function (res) {
	                _this4.updateUser(res.user);
	                callback(res.user);
	            })["catch"](function (e) {
	                return callback(e);
	            }); // TODO: error handling?
	        }

	        // Getter for user
	    }, {
	        key: "user",
	        get: function get() {
	            return this.cache.user;
	        }

	        // Getter for domains
	    }, {
	        key: "domains",
	        get: function get() {
	            return this.cache.domains;
	        }

	        // Getter for quiz answers
	    }, {
	        key: "quizAnswers",
	        get: function get() {
	            return this.cache.quizAnswers;
	        }
	    }]);

	    return Cache;
	})();

	exports["default"] = new Cache(Storage, identifier);
	module.exports = exports["default"];

/***/ },
/* 2 */
/***/ function(module, exports) {

	// Instance variables
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var Location = window.location,
	    isLocal = Location.hostname == "localhost" || Location.hostname == "127.0.0.1";

	// Endpoints for HTTP requests
	exports["default"] = {
	    localData: "/data.json",
	    addPath: isLocal ? "http://localhost:3000/api/add" : "http://178.62.76.67/api/add",
	    createPath: isLocal ? "http://localhost:3000/api/paths" : "http://178.62.76.67/api/paths",
	    submitQuiz: isLocal ? "http://localhost:3000/api/quiz" : "http://178.62.76.67/api/quiz",
	    getUser: isLocal ? "http://localhost:3000/api/user" : "http://178.62.76.67/api/user"
	};
	module.exports = exports["default"];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// Dependencies
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _helpersJs = __webpack_require__(4);

	var Location = window.location;

	// Anchors with external hrefs gets target="_blank"
	function setExternalHrefs() {
	    var anchors = (0, _helpersJs.byTag)("a"),
	        url = Location.protocol + "//" + Location.host;

	    return anchors.filter(function (a) {
	        return !(0, _helpersJs.startsWith)(url, a.href);
	    }).map(function (a) {
	        return a.target = "_blank";
	    });
	}

	// Add anchors to content headers
	function setAnchorsToHeaders() {
	    var headers = (0, _helpersJs.bySelector)("#content h1, #content h2, #content h3");

	    function appendAnchor(header) {
	        var a = (0, _helpersJs.create)("a");
	        a.href = "#" + header.id;
	        a.className = "header-anchor";
	        header.appendChild(a);
	        return header;
	    }

	    return headers.filter(function (h) {
	        return h.id ? true : false;
	    }).map(appendAnchor);
	}

	// Sticky footer, sets min-height if content height isn't enough
	function setStickyFooter() {
	    var content = (0, _helpersJs.byId)("content"),
	        wH = window.innerHeight,
	        bH = document.body.clientHeight,
	        cH = content.offsetHeight;

	    if (wH - bH > 0) {
	        content.style.minHeight = wH - (bH - cH) + "px";
	    }
	}

	// Sets the sidebar features for toggling visibility
	function setSidebar() {
	    var sidebar = (0, _helpersJs.byId)("sidebar"),
	        header = (0, _helpersJs.byId)("header"),
	        sidebarButton = (0, _helpersJs.byId)("toggle-sidebar"),
	        courseElms = (0, _helpersJs.bySelector)(".course-overview-element"),
	        anchors = (0, _helpersJs.bySelector)("#sidebar ul ul a");

	    // Add the "fix-sidebar" class to the sidebar when scrolling
	    window.addEventListener("scroll", function () {
	        var top = document.scrollTop || document.body.scrollTop,
	            cls = document.body.classList;

	        if (top > header.offsetHeight) {
	            if (!cls.contains("fix-sidebar")) {
	                cls.add("fix-sidebar");
	            }
	        } else {
	            cls.remove("fix-sidebar");
	        }
	    }, false);

	    // Toggle visibility of the sidebar
	    (0, _helpersJs.click)(sidebarButton, function () {
	        return sidebar.classList.toggle("toggle");
	    });
	    // Toggle visibility of course elements (assignments, exercises, etc.)
	    courseElms.map(function (el) {
	        return (0, _helpersJs.click)(el, function (e) {
	            return e.target.classList.toggle("toggle");
	        });
	    });
	    // Add the "active" class to the current active sidebar navigation anchor
	    anchors.filter(function (a) {
	        return (0, _helpersJs.startsWith)(a.href, Location.href);
	    }).map(function (a) {
	        a.classList.add("active");
	        // TODO: better solution for this...
	        a.parentNode.parentNode.previousElementSibling.classList.add("toggle");
	    });
	}

	// Add the "current" class to the current navigation anchor
	function highlightNavigation() {
	    var anchors = (0, _helpersJs.bySelector)(".navigation li a");

	    // Filter out exact matches
	    var found = anchors.filter(function (a) {
	        return a.href == Location.href.replace(/\+$/, "");
	    }).map(function (a) {
	        return a.classList.add("current");
	    });

	    // If no was found use the starting pathname instead
	    if (!found.length) {
	        anchors.filter(function (a) {
	            return (0, _helpersJs.startsWith)(a.href, Location.href);
	        }).map(function (a) {
	            return a.classList.add("current");
	        });
	    }
	}

	// Creates a button that toggles line numbers in code examples
	function createLineNumberButton() {
	    var btn = (0, _helpersJs.create)("button"),
	        txt = document.createTextNode("radnummer"),
	        show = (0, _helpersJs.create)("span"),
	        hide = (0, _helpersJs.create)("span");

	    btn.className = "toggle-lineno";
	    btn.type = "button";
	    show.className = "show";
	    show.textContent = "Visa ";
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
	        return;
	    }

	    var btn = createLineNumberButton();
	    (0, _helpersJs.click)(btn, function () {
	        return btn.parentElement.classList.toggle("toggle");
	    });
	    element.appendChild(btn);

	    return;
	}

	// Serialize contents of a code example
	function serializeCode(element) {
	    var code = element.firstChild.firstChild,
	        lang = code.className,
	        data = {};

	    var content = (0, _helpersJs.toArray)(code.childNodes).filter(function (n) {
	        return n.className == "lineno" ? false : true;
	    }).reduce(function (p, c) {
	        return p + c.textContent;
	    }, "");

	    data[lang.substr(9)] = content;
	    data["title"] = "Code Example";
	    return data;
	}

	// Sends contents of a code example to CodePen
	function submitToCodePen(element) {
	    var data = serializeCode(element);

	    if (!data) {
	        return;
	    }

	    var form = (0, _helpersJs.create)("form"),
	        input = (0, _helpersJs.create)("input"),
	        json = JSON.stringify(data).replace(/"/g, "&quot;").replace(/'/g, "&apos;");

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
	    var lang = element.firstChild.firstChild.className;

	    if (!(0, _helpersJs.hasWebLang)(lang)) {
	        return false;
	    }

	    var btn = (0, _helpersJs.create)("button");
	    btn.textContent = "Öppna i CodePen";
	    btn.className = "codepen-button";
	    btn.type = "button";

	    (0, _helpersJs.click)(btn, function () {
	        return submitToCodePen(btn.parentElement);
	    });

	    return element.appendChild(btn);
	}

	// Create the button to show/hide spoiler text
	function createSpoilerButton(element) {
	    var btn = (0, _helpersJs.create)("button");
	    btn.type = "button";
	    btn.className = "show-spoiler";
	    btn.textContent = "Visa svar";

	    // Toggle visibility with classes
	    (0, _helpersJs.click)(btn, function () {
	        if (btn.className == "show-spoiler") {
	            element.className = "spoiler show";
	            btn.className = "hide-spoiler";
	            btn.textContent = "Dölj svar";
	        } else {
	            element.className = "spoiler";
	            btn.className = "show-spoiler";
	            btn.textContent = "Visa svar";
	        }
	    });

	    return btn;
	}

	// Add a spoiler button to an element
	function addSpoilerButton(element) {
	    var btn = createSpoilerButton(element);
	    element.parentNode.insertBefore(btn, element.nextSibling);
	}

	// Export all functions
	exports["default"] = {
	    setExternalHrefs: setExternalHrefs,
	    setAnchorsToHeaders: setAnchorsToHeaders,
	    setStickyFooter: setStickyFooter,
	    setSidebar: setSidebar,
	    highlightNavigation: highlightNavigation,
	    addLineNumberButton: addLineNumberButton,
	    addCodePenButton: addCodePenButton,
	    addSpoilerButton: addSpoilerButton
	};
	module.exports = exports["default"];

/***/ },
/* 4 */
/***/ function(module, exports) {

	// "Converts" a HTML NodeList to an array
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function toArray(nodes) {
	    var a = [],
	        l = nodes.length;

	    for (var i = 0; i < l; i++) {
	        a.push(nodes[i]);
	    }

	    return a;
	}

	// Shuffle an array (http://stackoverflow.com/a/6274381)
	function shuffle(o) {
	    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	}

	// Return an HTML element by id
	function byId(id) {
	    return document.getElementById(id);
	}

	// Return an array of HTML elements by class
	function bySelector(cls) {
	    return toArray(document.querySelectorAll(cls));
	}

	// Return an array of HTML elements by tagname
	function byTag(tag) {
	    return toArray(document.getElementsByTagName(tag));
	}

	// Create a new HTML element
	function create(elm) {
	    return document.createElement(elm);
	}

	// Check for a needle in a haystack with regexp
	function startsWith(needle, haystack) {
	    return new RegExp("^" + needle).test(haystack);
	}

	// Shorthand for adding a click event to an element
	function click(elm, cb) {
	    return elm.addEventListener("click", cb, false);
	}

	// Check for one of three languages (for codepen)
	function hasWebLang(lang) {
	    var languages = ["css", "language-css", "html", "language-html", "js", "language-js"];

	    return Boolean(languages.indexOf(lang) > -1);
	}

	// Source: http://stackoverflow.com/a/2880929
	function getUrlParams(query) {
	    var match,
	        pl = /\+/g,
	        // Regex for replacing addition symbol with a space
	    search = /([^&=]+)=?([^&]*)/g,
	        decode = function decode(s) {
	        return decodeURIComponent(s.replace(pl, " "));
	    },
	        urlParams = {};

	    while (match = search.exec(query)) {
	        urlParams[decode(match[1])] = decode(match[2]);
	    }

	    return urlParams;
	}

	// Exports functions
	exports["default"] = {
	    toArray: toArray,
	    shuffle: shuffle,
	    byId: byId,
	    bySelector: bySelector,
	    byTag: byTag,
	    create: create,
	    startsWith: startsWith,
	    click: click,
	    hasWebLang: hasWebLang,
	    getUrlParams: getUrlParams
	};
	module.exports = exports["default"];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _pubsubJs = __webpack_require__(6);

	var _pubsubJs2 = _interopRequireDefault(_pubsubJs);

	var _cacheJs = __webpack_require__(1);

	var _cacheJs2 = _interopRequireDefault(_cacheJs);

	var _endpointsJs = __webpack_require__(2);

	var _endpointsJs2 = _interopRequireDefault(_endpointsJs);

	var _helpersJs = __webpack_require__(4);

	var Http = window.qwest;

	// Converts a list to form alternatives
	function convertAlternatives(list, index) {
	    var isMulti = list.classList.contains("multiple"),
	        div = (0, _helpersJs.create)("div"),
	        alpha = "abcdefghj".split("");

	    div.id = "answer-" + index;

	    // Creates a <input> alternative
	    function createAlternative(li, i) {
	        var label = (0, _helpersJs.create)("label"),
	            input = (0, _helpersJs.create)("input");

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
	    (0, _helpersJs.shuffle)((0, _helpersJs.toArray)(list.children)).map(createAlternative).map(function (label) {
	        return div.appendChild(label);
	    });

	    return div;
	}

	// Toggles visibility of a question
	function addToggleButton(list, index, headers, form) {
	    // TODO: better solution for all of this
	    // We go from one header to the list of alternatives
	    // and append all the elements to a div and then create
	    // a button at the end which toggles the CSS display
	    // attribute of the div. Unsure of the performance.
	    var header = headers[index],
	        div = (0, _helpersJs.create)("div"),
	        i = 0,
	        cur = header,
	        prev = undefined;

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

	    var btn = (0, _helpersJs.create)("button");
	    btn.type = "button";
	    btn.className = "toggle-question-button";
	    btn.textContent = "Visa frågan";

	    form.insertBefore(btn, div);

	    (0, _helpersJs.click)(btn, function () {
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
	    return (0, _helpersJs.toArray)(target)
	    // Only filter for input elements (radio + checkbox in this case)
	    .filter(function (el) {
	        return el.tagName == "INPUT" && el.type == "checkbox" || el.type == "radio";
	    }).reduce(function (acc, curr, i, arr) {
	        // Check if previous input is from a different group of alternatives.
	        // So we can add the appropriate object attribute for the payload
	        if (i == 0 || i > 0 && arr[i].name !== arr[i - 1].name) {
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
	    return answer.correct.sort().every(function (a, i) {
	        return a == userAnswer[i];
	    });
	}

	// Submit Quiz
	function submitQuiz(e) {
	    e.preventDefault();

	    var quizMessage = (0, _helpersJs.byId)("quiz-message"),
	        quizId = (0, _helpersJs.byId)("quiz-id").value,
	        moduleId = (0, _helpersJs.byId)("module-id").value;

	    // Can't submit quiz if you're not logged in
	    if (!_cacheJs2["default"].userExists()) {
	        quizMessage.textContent = "Du måste vara inloggad för att kunna svara";
	        quizMessage.className = "info";
	        return false;
	    }

	    // Reset message
	    quizMessage.textContent = "";
	    quizMesage.className = "";

	    // Check wether a user has permission to take a quiz or not
	    var userCanTakeQuiz = _cacheJs2["default"].user.paths[0].modules.some(function (m) {
	        return m.mid == moduleId;
	    });

	    if (!userCanTakeQuiz) {
	        return false;
	    }
	    // Serialize form data
	    var formData = serializeFormData(e.target);
	    // Get current quiz answers
	    var currQuizAnswers = _cacheJs2["default"].quizAnswers.filter(function (a) {
	        return a.id == quizId;
	    })[0];
	    // Get the correct answers for the user
	    var results = currQuizAnswers.answers.map(function (answer, i) {
	        return calculateResult(formData["answer-" + i], answer);
	    });

	    // Amount of correct answers
	    var correctAnswers = results.reduce(function (p, c) {
	        return c ? p + 1 : p + 0;
	    }, 0),
	        allCorrectAnswers = correctAnswers == currQuizAnswers.answers.length;

	    // TODO: could use level required to pass here

	    quizMessage.textContent = "Antal rätt svar: " + correctAnswers + "/" + currQuizAnswers.answers.length;
	    quizMessage.className = "info";

	    // Quiz payload
	    var payload = {
	        id: _cacheJs2["default"].user.id,
	        code: _cacheJs2["default"].user.code,
	        hash: _cacheJs2["default"].user.paths[0].hash,
	        quiz: quizId,
	        module: moduleId,
	        answers: formData,
	        done: allCorrectAnswers
	    };

	    return sendQuizResults(payload, allCorrectAnswers);
	}

	// Send quiz results
	function sendQuizResults(payload, done) {
	    return Http.post(_endpointsJs2["default"].submitQuiz, payload, { dataType: "json" }).then(function (res) {
	        return JSON.parse(res);
	    }).then(function (res) {
	        _cacheJs2["default"].updateUser(res.user);
	        showQuizCompletionMessage(done);
	    })["catch"](function (e, url) {
	        return console.log(e, url);
	    });
	}

	// Show different messages depending on results from the quiz
	function showQuizCompletionMessage(done) {
	    var submitBtn = (0, _helpersJs.byId)("submit-button"),
	        a = (0, _helpersJs.create)("a");

	    a.className = "submit-quiz-form";

	    if (done) {
	        var index = undefined,
	            _module2 = undefined;

	        // Filter out the "next" quiz
	        _cacheJs2["default"].user.paths[0].modules.filter(function (m) {
	            return m.mid == moduleId;
	        }).forEach(function (m, i, arr) {
	            if (arr[i + 1]) {
	                index = i + 1;
	                _module2 = arr[i + 1];
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
	    } else {
	        a.textContent = "Försök igen";
	        a.href = "";
	    }

	    submitBtn.parentNode.replaceChild(a, submitBtn);
	}

	// Setup a quiz
	function setupQuiz() {
	    // Elements
	    var quizContainer = (0, _helpersJs.byId)("quiz-container"),
	        quizForm = (0, _helpersJs.byId)("quiz-form"),
	        moduleId = (0, _helpersJs.byId)("module-id").value,
	        questionHeaders = (0, _helpersJs.bySelector)("#quiz-container h3"),
	        alternativeLists = (0, _helpersJs.bySelector)("#quiz-container .alternatives");

	    // Check wether a user has permission to take a quiz or not
	    var userCanTakeQuiz = _cacheJs2["default"].user.paths[0].modules.some(function (m) {
	        return m.mid == moduleId;
	    });

	    if (!userCanTakeQuiz) {
	        return;
	    }

	    // Login/Logout events
	    _pubsubJs2["default"].subscribe("user.login", function () {
	        return quizContainer.style.display = "block";
	    });
	    _pubsubJs2["default"].subscribe("user.logout", function () {
	        return quizContainer.style.display = "none";
	    });

	    // If there are no alternatives we wont convert the lists into a quiz
	    if (!alternativeLists.length) {
	        return;
	    }

	    // If there are alternatives and an active user - show the quiz
	    if (_cacheJs2["default"].userExists()) {
	        quizContainer.style.display = "block";
	    }

	    // Convert all lists to form alternatives
	    alternativeLists.map(function (list, index) {
	        var alternatives = convertAlternatives(list, index);
	        list.parentNode.replaceChild(alternatives, list);
	        return alternatives;
	    }).map(function (list, index) {
	        return addToggleButton(list, index, questionHeaders, quizForm);
	    });

	    quizForm.addEventListener("submit", submitQuiz, false);
	}

	exports["default"] = setupQuiz;
	module.exports = exports["default"];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
	License: MIT - http://mrgnrdrck.mit-license.org

	https://github.com/mroderick/PubSubJS
	*/
	(function (root, factory){
		'use strict';

	    if (true){
	        // AMD. Register as an anonymous module.
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

	    } else if (typeof exports === 'object'){
	        // CommonJS
	        factory(exports);

	    }

	    // Browser globals
	    var PubSub = {};
	    root.PubSub = PubSub;
	    factory(PubSub);
	    
	}(( typeof window === 'object' && window ) || this, function (PubSub){
		'use strict';

		var messages = {},
			lastUid = -1;

		function hasKeys(obj){
			var key;

			for (key in obj){
				if ( obj.hasOwnProperty(key) ){
					return true;
				}
			}
			return false;
		}

		/**
		 *	Returns a function that throws the passed exception, for use as argument for setTimeout
		 *	@param { Object } ex An Error object
		 */
		function throwException( ex ){
			return function reThrowException(){
				throw ex;
			};
		}

		function callSubscriberWithDelayedExceptions( subscriber, message, data ){
			try {
				subscriber( message, data );
			} catch( ex ){
				setTimeout( throwException( ex ), 0);
			}
		}

		function callSubscriberWithImmediateExceptions( subscriber, message, data ){
			subscriber( message, data );
		}

		function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
			var subscribers = messages[matchedMessage],
				callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
				s;

			if ( !messages.hasOwnProperty( matchedMessage ) ) {
				return;
			}

			for (s in subscribers){
				if ( subscribers.hasOwnProperty(s)){
					callSubscriber( subscribers[s], originalMessage, data );
				}
			}
		}

		function createDeliveryFunction( message, data, immediateExceptions ){
			return function deliverNamespaced(){
				var topic = String( message ),
					position = topic.lastIndexOf( '.' );

				// deliver the message as it is now
				deliverMessage(message, message, data, immediateExceptions);

				// trim the hierarchy and deliver message to each level
				while( position !== -1 ){
					topic = topic.substr( 0, position );
					position = topic.lastIndexOf('.');
					deliverMessage( message, topic, data, immediateExceptions );
				}
			};
		}

		function messageHasSubscribers( message ){
			var topic = String( message ),
				found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic])),
				position = topic.lastIndexOf( '.' );

			while ( !found && position !== -1 ){
				topic = topic.substr( 0, position );
				position = topic.lastIndexOf( '.' );
				found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic]));
			}

			return found;
		}

		function publish( message, data, sync, immediateExceptions ){
			var deliver = createDeliveryFunction( message, data, immediateExceptions ),
				hasSubscribers = messageHasSubscribers( message );

			if ( !hasSubscribers ){
				return false;
			}

			if ( sync === true ){
				deliver();
			} else {
				setTimeout( deliver, 0 );
			}
			return true;
		}

		/**
		 *	PubSub.publish( message[, data] ) -> Boolean
		 *	- message (String): The message to publish
		 *	- data: The data to pass to subscribers
		 *	Publishes the the message, passing the data to it's subscribers
		**/
		PubSub.publish = function( message, data ){
			return publish( message, data, false, PubSub.immediateExceptions );
		};

		/**
		 *	PubSub.publishSync( message[, data] ) -> Boolean
		 *	- message (String): The message to publish
		 *	- data: The data to pass to subscribers
		 *	Publishes the the message synchronously, passing the data to it's subscribers
		**/
		PubSub.publishSync = function( message, data ){
			return publish( message, data, true, PubSub.immediateExceptions );
		};

		/**
		 *	PubSub.subscribe( message, func ) -> String
		 *	- message (String): The message to subscribe to
		 *	- func (Function): The function to call when a new message is published
		 *	Subscribes the passed function to the passed message. Every returned token is unique and should be stored if
		 *	you need to unsubscribe
		**/
		PubSub.subscribe = function( message, func ){
			if ( typeof func !== 'function'){
				return false;
			}

			// message is not registered yet
			if ( !messages.hasOwnProperty( message ) ){
				messages[message] = {};
			}

			// forcing token as String, to allow for future expansions without breaking usage
			// and allow for easy use as key names for the 'messages' object
			var token = 'uid_' + String(++lastUid);
			messages[message][token] = func;

			// return token for unsubscribing
			return token;
		};

		/* Public: Clears all subscriptions
		 */
		PubSub.clearAllSubscriptions = function clearAllSubscriptions(){
			messages = {};
		};

		/*Public: Clear subscriptions by the topic
		*/
		PubSub.clearSubscriptions = function clearSubscriptions(topic){
			var m; 
			for (m in messages){
				if (messages.hasOwnProperty(m) && m.indexOf(topic) === 0){
					delete messages[m];
				}
			}
		};

		/* Public: removes subscriptions.
		 * When passed a token, removes a specific subscription.
		 * When passed a function, removes all subscriptions for that function
		 * When passed a topic, removes all subscriptions for that topic (hierarchy)
		 *
		 * value - A token, function or topic to unsubscribe.
		 *
		 * Examples
		 *
		 *		// Example 1 - unsubscribing with a token
		 *		var token = PubSub.subscribe('mytopic', myFunc);
		 *		PubSub.unsubscribe(token);
		 *
		 *		// Example 2 - unsubscribing with a function
		 *		PubSub.unsubscribe(myFunc);
		 *
		 *		// Example 3 - unsubscribing a topic
		 *		PubSub.unsubscribe('mytopic');
		 */
		PubSub.unsubscribe = function(value){
			var isTopic    = typeof value === 'string' && messages.hasOwnProperty(value),
				isToken    = !isTopic && typeof value === 'string',
				isFunction = typeof value === 'function',
				result = false,
				m, message, t;

			if (isTopic){
				delete messages[value];
				return;
			}

			for ( m in messages ){
				if ( messages.hasOwnProperty( m ) ){
					message = messages[m];

					if ( isToken && message[value] ){
						delete message[value];
						result = value;
						// tokens are unique, so we can just stop here
						break;
					}

					if (isFunction) {
						for ( t in message ){
							if (message.hasOwnProperty(t) && message[t] === value){
								delete message[t];
								result = true;
							}
						}
					}
				}
			}

			return result;
		};
	}));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _cacheJs = __webpack_require__(1);

	var _cacheJs2 = _interopRequireDefault(_cacheJs);

	var _endpointsJs = __webpack_require__(2);

	var _endpointsJs2 = _interopRequireDefault(_endpointsJs);

	// Dependencies
	var React = window.React,
	    Http = window.qwest;

	// Message constants
	var MESSAGE = {
	    ERRINPUT: "Vänligen fyll i en användarkod eller en epost.",
	    ERRHTTP: "Ett fel uppstod! Vänligen kontrollera användarkod, epost eller den länkadress du använt.",
	    ERRHASH: "Den länkadress som används till denna sidan är inkorrekt.",
	    REGINFO: "Nedan kan du fylla i din användarkod för att registrera vägen till din användare. Om du är en ny användare kan du fylla i din epost istället för att registrera dig."
	};

	// Success message if the HTTP request was successful

	var SuccessMessage = (function (_React$Component) {
	    _inherits(SuccessMessage, _React$Component);

	    function SuccessMessage() {
	        _classCallCheck(this, SuccessMessage);

	        _get(Object.getPrototypeOf(SuccessMessage.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Information messages

	    _createClass(SuccessMessage, [{
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "p",
	                { className: "info" },
	                "Vägen är nu tillagd till din användare! Använd koden",
	                React.createElement(
	                    "code",
	                    null,
	                    this.props.code
	                ),
	                " för att logga in. Du kan nu gå vidare till din ",
	                React.createElement(
	                    "a",
	                    { href: "/path/profile.html" },
	                    "profil"
	                ),
	                "för att påbörja din väg."
	            );
	        }
	    }]);

	    return SuccessMessage;
	})(React.Component);

	var InfoMessage = (function (_React$Component2) {
	    _inherits(InfoMessage, _React$Component2);

	    function InfoMessage() {
	        _classCallCheck(this, InfoMessage);

	        _get(Object.getPrototypeOf(InfoMessage.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Form for appending a path to a user (or a new one)

	    _createClass(InfoMessage, [{
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "p",
	                { className: "info" },
	                this.props.text
	            );
	        }
	    }]);

	    return InfoMessage;
	})(React.Component);

	var Form = (function (_React$Component3) {
	    _inherits(Form, _React$Component3);

	    function Form(props) {
	        _classCallCheck(this, Form);

	        _get(Object.getPrototypeOf(Form.prototype), "constructor", this).call(this, props);
	        this.state = {
	            inputValue: "",
	            submitted: false
	        };
	        // Re-bind methods
	        this.handleInputChange = this.handleInputChange.bind(this);
	        this.handleSubmit = this.handleSubmit.bind(this);
	    }

	    // Main component

	    _createClass(Form, [{
	        key: "handleInputChange",
	        value: function handleInputChange(e) {
	            this.setState({ inputValue: e.target.value });
	        }
	    }, {
	        key: "handleSubmit",
	        value: function handleSubmit(e) {
	            var _this = this;

	            e.preventDefault();
	            // Form has already been submitted
	            if (this.state.submitted) {
	                return false;
	            }
	            // Empty input value
	            if (!this.state.inputValue) {
	                this.props.setMessage(React.createElement(InfoMessage, { text: MESSAGE.ERRINPUT }));
	                return false;
	            }

	            var value = this.state.inputValue,
	                payload = { hash: this.props.hash };

	            // Basic check if it contains 6 numbers
	            if (value.length == 6 && !isNaN(+value)) {
	                payload.code = value;
	                // Otherwise just check for an @ sign
	            } else if (value.indexOf("@") !== -1) {
	                    payload.email = value;
	                } else {
	                    // No point in continuing?
	                    return false;
	                }

	            // TODO: Show some kind of loader?

	            // Send request for appending the path to the current user (or a new user)
	            Http.post(_endpointsJs2["default"].addPath, payload, { dataType: "json" }).then(function (res) {
	                _cacheJs2["default"].updateUser(res.user);
	                _this.setState({ submitted: true });
	                _this.props.setMessage(React.createElement(SuccessMessage, null));
	            })["catch"](function () {
	                _this.setState({ submitted: false });
	                _this.props.setMessage(React.createElement(InfoMessage, { text: MESSAGE.ERRHTTP }));
	            });
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "form",
	                { onSubmit: this.handleSubmit },
	                React.createElement("input", { type: "text", onChange: this.handleInputChange, placeholder: "Användarkod eller Epost" }),
	                React.createElement(
	                    "button",
	                    { type: "submit" },
	                    "Skicka"
	                )
	            );
	        }
	    }]);

	    return Form;
	})(React.Component);

	var AddPath = (function (_React$Component4) {
	    _inherits(AddPath, _React$Component4);

	    function AddPath(props) {
	        _classCallCheck(this, AddPath);

	        _get(Object.getPrototypeOf(AddPath.prototype), "constructor", this).call(this, props);
	        this.state = { message: "" };
	        this.setMessage = this.setMessage.bind(this);
	    }

	    // Export the component

	    _createClass(AddPath, [{
	        key: "setMessage",
	        value: function setMessage(m) {
	            this.setState({ message: m });
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            // No hash was found in the URL
	            if (!this.props.hash) {
	                return React.createElement(InfoMessage, { text: MESSAGE.ERRHASH });
	            }

	            return React.createElement(
	                "div",
	                null,
	                React.createElement(
	                    "h3",
	                    null,
	                    "Registrera en befintlig väg"
	                ),
	                React.createElement(
	                    "p",
	                    { className: "intro" },
	                    MESSAGE.REGINFO
	                ),
	                this.state.message ? this.state.message : "",
	                React.createElement(Form, { hash: this.props.hash, setMessage: this.setMessage })
	            );
	        }
	    }]);

	    return AddPath;
	})(React.Component);

	exports["default"] = AddPath;
	module.exports = exports["default"];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _endpointsJs = __webpack_require__(2);

	var _endpointsJs2 = _interopRequireDefault(_endpointsJs);

	var _cacheJs = __webpack_require__(1);

	var _cacheJs2 = _interopRequireDefault(_cacheJs);

	var _pubsubJs = __webpack_require__(6);

	var _pubsubJs2 = _interopRequireDefault(_pubsubJs);

	var _helpersJs = __webpack_require__(4);

	// Global dependencies
	var React = window.React,
	    Http = window.qwest;

	// Message constants
	var MESSAGE = {
	    INFO_NO_MODULE: "Ingen modul vald",
	    INFO_REG_DOMAIN: "Välj moduler från listan nedan som ska ingå i din egen väg. Till vänster visas dina val och längst ner på sidan kan du registrera dig.",
	    INFO_LOADING: "Vänligen vänta...",
	    ERR_NO_CODE: "Fyll i en användarkod",
	    ERR_NO_EMAIL: "Välj moduler och fyll i en email",
	    ERR_USER_EXISTS: "Eposten är redan registrerad, vänligen fyll i användarkoden istället eller välj avbryt för att börja om",
	    ERR_REQUEST: "Ett fel uppstod, vänligen försök igen"
	};

	// Button for sorting all the choices

	var SortButton = (function (_React$Component) {
	    _inherits(SortButton, _React$Component);

	    function SortButton() {
	        _classCallCheck(this, SortButton);

	        _get(Object.getPrototypeOf(SortButton.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Button for clearing all choices

	    _createClass(SortButton, [{
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "button",
	                { type: "button", onClick: this.props.sortChoices },
	                "Sortera"
	            );
	        }
	    }]);

	    return SortButton;
	})(React.Component);

	var ClearButton = (function (_React$Component2) {
	    _inherits(ClearButton, _React$Component2);

	    function ClearButton() {
	        _classCallCheck(this, ClearButton);

	        _get(Object.getPrototypeOf(ClearButton.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Helper function for rendering a module choice

	    _createClass(ClearButton, [{
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "button",
	                { type: "reset", onClick: this.props.clearChoices },
	                "Rensa"
	            );
	        }
	    }]);

	    return ClearButton;
	})(React.Component);

	function renderModuleChoice(k, m, d) {
	    return React.createElement(ModuleChoice, { key: k, module: m, domain: d });
	}

	// Path (list) of modules (choices)

	var Path = (function (_React$Component3) {
	    _inherits(Path, _React$Component3);

	    function Path(props) {
	        _classCallCheck(this, Path);

	        _get(Object.getPrototypeOf(Path.prototype), "constructor", this).call(this, props);
	        // Re-bind methods
	        this.getDomainById = this.getDomainById.bind(this);
	    }

	    // A module choice from a user

	    // Return domain based on id

	    _createClass(Path, [{
	        key: "getDomainById",
	        value: function getDomainById(id) {
	            return this.props.domains.filter(function (d) {
	                return d.id == id;
	            })[0];
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var _this = this;

	            return React.createElement(
	                "div",
	                { className: "path" },
	                React.createElement(
	                    "h5",
	                    null,
	                    "Din väg"
	                ),
	                React.createElement(
	                    "ol",
	                    { className: "choices" },
	                    this.props.choices.length ? this.props.choices.map(function (c, i) {
	                        return renderModuleChoice(i, c, _this.getDomainById(c.domain));
	                    }) : React.createElement(
	                        "li",
	                        null,
	                        MESSAGE.INFO_NO_MODULE
	                    )
	                ),
	                React.createElement(SortButton, { sortChoices: this.props.sortChoices }),
	                React.createElement(ClearButton, { clearChoices: this.props.clearChoices })
	            );
	        }
	    }]);

	    return Path;
	})(React.Component);

	var ModuleChoice = (function (_React$Component4) {
	    _inherits(ModuleChoice, _React$Component4);

	    function ModuleChoice() {
	        _classCallCheck(this, ModuleChoice);

	        _get(Object.getPrototypeOf(ModuleChoice.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Helper function for rendering a domain

	    _createClass(ModuleChoice, [{
	        key: "render",
	        value: function render() {
	            var href = "/domains/" + this.props.module.domain + "/modules/" + this.props.module.mid + ".html";

	            return React.createElement(
	                "li",
	                { className: "choice" },
	                React.createElement(
	                    "a",
	                    { href: href },
	                    this.props.module.name
	                )
	            );
	        }
	    }]);

	    return ModuleChoice;
	})(React.Component);

	function renderDomain(k, d, add, remove) {
	    return React.createElement(Domain, { key: k, domain: d, addChoice: add, removeChoice: remove });
	}

	// List of available modules from domains

	var Domains = (function (_React$Component5) {
	    _inherits(Domains, _React$Component5);

	    function Domains() {
	        _classCallCheck(this, Domains);

	        _get(Object.getPrototypeOf(Domains.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Helper function for rendering a module

	    _createClass(Domains, [{
	        key: "render",
	        value: function render() {
	            var _this2 = this;

	            return React.createElement(
	                "div",
	                null,
	                React.createElement(
	                    "p",
	                    { className: "domains-info" },
	                    MESSAGE.INFO_REG_DOMAIN
	                ),
	                React.createElement(
	                    "ul",
	                    { className: "domains" },
	                    this.props.domains.map(function (d, i) {
	                        return renderDomain(i, d, _this2.props.addChoice, _this2.props.removeChoice);
	                    })
	                )
	            );
	        }
	    }]);

	    return Domains;
	})(React.Component);

	function renderModule(m, add, remove) {
	    return React.createElement(Module, { module: m, addChoice: add, removeChoice: remove });
	}

	// A module within a domain

	var Module = (function (_React$Component6) {
	    _inherits(Module, _React$Component6);

	    function Module(props) {
	        _classCallCheck(this, Module);

	        _get(Object.getPrototypeOf(Module.prototype), "constructor", this).call(this, props);
	        // Re-bind methods
	        this.handleChange = this.handleChange.bind(this);
	    }

	    // A single domain

	    // Listen to events for toggling all module choices

	    _createClass(Module, [{
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            var _this3 = this;

	            var node = React.findDOMNode(this.refs.input);

	            _pubsubJs2["default"].subscribe("domain.toggle.add", function (msg, data) {
	                if (!node.checked && _this3.props.module.domain == data.domain) {
	                    node.checked = true;
	                    _this3.props.addChoice(_this3.props.module);
	                }
	            });

	            _pubsubJs2["default"].subscribe("domain.toggle.remove", function (msg, data) {
	                if (node.checked && _this3.props.module.domain == data.domain) {
	                    node.checked = false;
	                    _this3.props.removeChoice(_this3.props.module);
	                }
	            });
	        }
	    }, {
	        key: "handleChange",
	        value: function handleChange() {
	            var node = React.findDOMNode(this.refs.input);

	            if (node.checked) {
	                this.props.addChoice(this.props.module);
	            } else {
	                this.props.removeChoice(this.props.module);
	            }
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "li",
	                { className: "module" },
	                React.createElement(
	                    "label",
	                    null,
	                    React.createElement("input", { type: "checkbox", ref: "input", onChange: this.handleChange }),
	                    this.props.module.name
	                )
	            );
	        }
	    }]);

	    return Module;
	})(React.Component);

	var Domain = (function (_React$Component7) {
	    _inherits(Domain, _React$Component7);

	    function Domain(props) {
	        _classCallCheck(this, Domain);

	        _get(Object.getPrototypeOf(Domain.prototype), "constructor", this).call(this, props);
	        this.state = { toggle: "expand" };
	        // Re-bind methods
	        this.handleDomainSelection = this.handleDomainSelection.bind(this);
	        this.toggle = this.toggle.bind(this);
	    }

	    // Messages from submitting the form

	    _createClass(Domain, [{
	        key: "handleDomainSelection",
	        value: function handleDomainSelection() {
	            // React DOM reference
	            var ul = React.findDOMNode(this.refs.modules);
	            // Go through all and see if they're checked
	            var allChecked = (0, _helpersJs.toArray)(ul.children).every(function (li) {
	                return li.firstChild.firstChild.checked;
	            });

	            // Publish events for toggling all module choices
	            if (allChecked) {
	                _pubsubJs2["default"].publish("domain.toggle.remove", { domain: this.props.domain.id });
	            } else {
	                _pubsubJs2["default"].publish("domain.toggle.add", { domain: this.props.domain.id });
	            }
	        }
	    }, {
	        key: "toggle",
	        value: function toggle() {
	            this.setState({ toggle: this.state.toggle ? "" : "expand" });
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var _this4 = this;

	            return React.createElement(
	                "li",
	                { className: "domain " + this.state.toggle },
	                React.createElement(
	                    "span",
	                    { onClick: this.toggle, className: "toggle" },
	                    this.state.toggle ? "-" : "+"
	                ),
	                React.createElement(
	                    "span",
	                    { onClick: this.handleDomainSelection, className: "domain-name" },
	                    this.props.domain.name
	                ),
	                React.createElement(
	                    "ul",
	                    { className: "modules", ref: "modules" },
	                    this.props.domain.modules.map(function (m) {
	                        return renderModule(m, _this4.props.addChoice, _this4.props.removeChoice);
	                    })
	                )
	            );
	        }
	    }]);

	    return Domain;
	})(React.Component);

	var InfoMessage = (function (_React$Component8) {
	    _inherits(InfoMessage, _React$Component8);

	    function InfoMessage() {
	        _classCallCheck(this, InfoMessage);

	        _get(Object.getPrototypeOf(InfoMessage.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Sucessful registration

	    _createClass(InfoMessage, [{
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "div",
	                null,
	                this.props.text ? React.createElement(
	                    "p",
	                    { className: "message " + this.props.type },
	                    this.props.text
	                ) : ""
	            );
	        }
	    }]);

	    return InfoMessage;
	})(React.Component);

	var RegistrationMessage = (function (_React$Component9) {
	    _inherits(RegistrationMessage, _React$Component9);

	    function RegistrationMessage() {
	        _classCallCheck(this, RegistrationMessage);

	        _get(Object.getPrototypeOf(RegistrationMessage.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Change user input field depending on if its a new user or not

	    _createClass(RegistrationMessage, [{
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "div",
	                null,
	                React.createElement(
	                    "p",
	                    { className: "info" },
	                    "Följande användarkod ",
	                    React.createElement(
	                        "code",
	                        null,
	                        this.props.code
	                    ),
	                    " används för att logga in, det är därför viktigt att ni sparar denna."
	                ),
	                React.createElement(
	                    "p",
	                    { className: "share" },
	                    "Följande länk kan användas för att dela med dig av din väg ",
	                    React.createElement(
	                        "a",
	                        { href: this.props.href },
	                        this.props.href
	                    ),
	                    "."
	                )
	            );
	        }
	    }]);

	    return RegistrationMessage;
	})(React.Component);

	var UserInput = (function (_React$Component10) {
	    _inherits(UserInput, _React$Component10);

	    function UserInput() {
	        _classCallCheck(this, UserInput);

	        _get(Object.getPrototypeOf(UserInput.prototype), "constructor", this).apply(this, arguments);
	    }

	    _createClass(UserInput, [{
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "div",
	                null,
	                React.createElement(
	                    "h5",
	                    null,
	                    "Registrera din väg"
	                ),
	                React.createElement(
	                    "label",
	                    null,
	                    React.createElement("input", {
	                        key: this.props.userExists ? 1 : 2,
	                        onChange: this.props.userExists ? this.props.handleCodeChange : this.props.handleEmailChange,
	                        placeholder: this.userExists ? "Användarkod" : "Epost",
	                        type: "text" })
	                ),
	                React.createElement(
	                    "button",
	                    { type: "button", onClick: this.props.handleSubmit },
	                    "Skicka"
	                ),
	                React.createElement(
	                    "button",
	                    { type: "button", onClick: this.props.handleCancel },
	                    "Avbryt"
	                )
	            );
	        }
	    }]);

	    return UserInput;
	})(React.Component);

	var FormActions = (function (_React$Component11) {
	    _inherits(FormActions, _React$Component11);

	    function FormActions(props) {
	        _classCallCheck(this, FormActions);

	        _get(Object.getPrototypeOf(FormActions.prototype), "constructor", this).call(this, props);
	        this.state = {
	            userExists: false,
	            success: false,
	            email: "",
	            code: "",
	            message: null
	        };
	        // Re-bind all methods
	        this.handleEmailChange = this.handleEmailChange.bind(this);
	        this.handleCodeChange = this.handleCodeChange.bind(this);
	        this.handleCancel = this.handleCancel.bind(this);
	        this.handleSubmit = this.handleSubmit.bind(this);
	    }

	    // Main component

	    _createClass(FormActions, [{
	        key: "handleEmailChange",
	        value: function handleEmailChange(e) {
	            this.setState({ email: e.target.value });
	        }
	    }, {
	        key: "handleCodeChange",
	        value: function handleCodeChange(e) {
	            this.setState({ code: e.target.value });
	        }
	    }, {
	        key: "handleCancel",
	        value: function handleCancel() {
	            this.setState({
	                userExists: false,
	                email: "",
	                code: "",
	                message: null
	            });
	        }
	    }, {
	        key: "handleSubmit",
	        value: function handleSubmit() {
	            var _this5 = this;

	            // TODO: min/max amount of module choices?

	            // Already successfully submitted the form
	            if (this.state.success) {
	                return false;
	            }
	            // Incorrect user code
	            if (this.state.userExists && !this.state.code.length) {
	                this.setState({
	                    message: React.createElement(InfoMessage, { type: "info", text: MESSAGE.ERR_NO_CODE })
	                });
	                return false;
	            }
	            // Empty fields
	            if (!this.state.email.length || !this.props.choices.length) {
	                this.setState({
	                    message: React.createElement(InfoMessage, { type: "info", text: MESSAGE.ERR_NO_EMAIL })
	                });
	                return false;
	            }
	            // Loading..
	            this.setState({
	                message: React.createElement(InfoMessage, { type: "info loading", text: MESSAGE.INFO_LOADING })
	            });
	            // Data payload to server
	            var payload = {
	                email: this.state.email,
	                path: { choices: this.props.choices }
	            };
	            // If user exists send code as well
	            if (this.state.userExists) {
	                payload.code = this.state.code;
	            }
	            // Send data to server
	            Http.post(_endpointsJs2["default"].createPath, payload, { dataType: "json" }).then(function (res) {
	                return JSON.parse(res);
	            }).then(function (res) {
	                // User already exists
	                if ("exists" in res && res.exists) {
	                    _this5.setState({
	                        userExists: true,
	                        message: React.createElement(InfoMessage, { type: "info", text: MESSAGE.ERR_USER_EXISTS })
	                    });
	                    return;
	                }

	                _cacheJs2["default"].updateUser(res.user);

	                var href = _endpointsJs2["default"].addPath + "?hash=" + res.path.hash;

	                _this5.setState({
	                    userExists: false,
	                    success: true,
	                    message: React.createElement(RegistrationMessage, { code: res.user.code, href: href })
	                });
	            })["catch"](function (e) {
	                // DEBUG
	                console.log("Request failed:", e);
	                _this5.setState({
	                    userExists: false,
	                    message: React.createElement(InfoMessage, { type: "info error", text: MESSAGE.ERR_REQUEST })
	                });
	            });
	            return true;
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            if (this.state.succes) {
	                return React.createElement(
	                    "div",
	                    { className: "actions" },
	                    this.state.message,
	                    React.createElement(
	                        "a",
	                        { className: "to-profile", href: "/path/profile.html" },
	                        "Gå vidare till din profil"
	                    )
	                );
	            }

	            return React.createElement(
	                "div",
	                { className: "actions" },
	                this.state.message,
	                React.createElement(UserInput, {
	                    userExists: this.state.userExists,
	                    handleCodeChange: this.handleCodeChange,
	                    handleEmailChange: this.handleEmailChange,
	                    handleSubmit: this.handleSubmit,
	                    handleCancel: this.handleCancel })
	            );
	        }
	    }]);

	    return FormActions;
	})(React.Component);

	var CreatePath = (function (_React$Component12) {
	    _inherits(CreatePath, _React$Component12);

	    function CreatePath(props) {
	        _classCallCheck(this, CreatePath);

	        _get(Object.getPrototypeOf(CreatePath.prototype), "constructor", this).call(this, props);
	        this.state = {
	            domains: [],
	            choices: []
	        };
	        // Re-bind all methods
	        this.fetchDomains = this.fetchDomains.bind(this);
	        this.addChoice = this.addChoice.bind(this);
	        this.removeChoice = this.removeChoice.bind(this);
	        this.sortChoices = this.sortChoices.bind(this);
	        this.clearChoices = this.clearChoices.bind(this);
	    }

	    // Fetch data

	    _createClass(CreatePath, [{
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            this.fetchDomains();
	        }
	    }, {
	        key: "fetchDomains",
	        value: function fetchDomains(d) {
	            var _this6 = this;

	            // TODO: error handling?
	            _cacheJs2["default"].getDomains(function (d) {
	                return _this6.setState({ domains: d });
	            });
	        }

	        // Add one or more choices
	    }, {
	        key: "addChoice",
	        value: function addChoice(c) {
	            this.setState({ choices: this.state.choices.concat(c) });
	        }

	        // Remove one or more choices
	    }, {
	        key: "removeChoice",
	        value: function removeChoice(c) {
	            this.setState({
	                choices: this.state.choices.filter(function (m) {
	                    return "indexOf" in c ? c.indexOf(m.mid) == -1 : m.mid != c.mid;
	                })
	            });
	        }

	        // Sort choices by domain id + module id
	    }, {
	        key: "sortChoices",
	        value: function sortChoices() {
	            this.setState({
	                choices: this.state.choices.sort(function (a, b) {
	                    var A = +a.domain.substring(1) + +a.mid.substring(1),
	                        B = +b.domain.substring(1) + +b.mid.substring(1);
	                    return A - B;
	                })
	            });
	        }

	        // Clear all choices
	    }, {
	        key: "clearChoices",
	        value: function clearChoices() {
	            this.setState({ choices: [] });
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "form",
	                null,
	                React.createElement(Path, {
	                    domains: this.state.domains,
	                    choices: this.state.choices,
	                    sortChoices: this.sortChoices,
	                    clearChoices: this.clearChoices }),
	                React.createElement(Domains, {
	                    domains: this.state.domains,
	                    addChoice: this.addChoice,
	                    removeChoice: this.removeChoice }),
	                React.createElement(FormActions, { choices: this.state.choices })
	            );
	        }
	    }]);

	    return CreatePath;
	})(React.Component);

	exports["default"] = CreatePath;
	module.exports = exports["default"];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _pubsubJs = __webpack_require__(6);

	var _pubsubJs2 = _interopRequireDefault(_pubsubJs);

	var _cacheJs = __webpack_require__(1);

	var _cacheJs2 = _interopRequireDefault(_cacheJs);

	var _endpointsJs = __webpack_require__(2);

	var _endpointsJs2 = _interopRequireDefault(_endpointsJs);

	// Dependencies
	var React = window.React,
	    Http = window.qwest;

	// Message constants
	var MESSAGE = {
	    ERRCODE: "Inkorrekt användarkod"
	};

	// Helper function for returning a module
	function renderModule(m) {
	    return React.createElement(Module, { module: m });
	}

	// Login component

	var Login = (function (_React$Component) {
	    _inherits(Login, _React$Component);

	    function Login(props) {
	        _classCallCheck(this, Login);

	        _get(Object.getPrototypeOf(Login.prototype), "constructor", this).call(this, props);
	        this.state = { message: "" };
	        this.handleSubmit = this.handleSubmit.bind(this);
	    }

	    // Logout component

	    _createClass(Login, [{
	        key: "handleSubmit",
	        value: function handleSubmit(e) {
	            var _this = this;

	            e.preventDefault();
	            // Get user code from form
	            var code = React.findDOMNode(this.refs.code).value;
	            // If there is none, exit
	            if (!code) {
	                return false;
	            }
	            // Fetch user (from server or cache)
	            _cacheJs2["default"].getUser(code, function (user) {
	                if (user instanceof Error) {
	                    _this.setState({ message: MESSAGE.ERRCODE });
	                    return;
	                }

	                _this.props.loginHandler(user);
	            });
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "form",
	                { className: "login-form", onSubmit: this.handleSubmit },
	                React.createElement(
	                    "p",
	                    null,
	                    this.state.message
	                ),
	                React.createElement("input", { ref: "code", type: "text", placeholder: "Användarkod" }),
	                React.createElement(
	                    "button",
	                    { type: "submit" },
	                    "Logga in"
	                )
	            );
	        }
	    }]);

	    return Login;
	})(React.Component);

	var Logout = (function (_React$Component2) {
	    _inherits(Logout, _React$Component2);

	    function Logout(props) {
	        _classCallCheck(this, Logout);

	        _get(Object.getPrototypeOf(Logout.prototype), "constructor", this).call(this, props);
	        this.handleLogout = this.handleLogout.bind(this);
	    }

	    // Component for a module

	    // Passed down from parent

	    _createClass(Logout, [{
	        key: "handleLogout",
	        value: function handleLogout() {
	            this.props.logoutHandler();
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "button",
	                { type: "submit", className: "logout-button", onClick: this.handleLogout },
	                "Logga ut"
	            );
	        }
	    }]);

	    return Logout;
	})(React.Component);

	var Module = (function (_React$Component3) {
	    _inherits(Module, _React$Component3);

	    function Module() {
	        _classCallCheck(this, Module);

	        _get(Object.getPrototypeOf(Module.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Container component for all modules

	    _createClass(Module, [{
	        key: "render",
	        value: function render() {
	            var href = "/domains/" + this.props.module.domain + "/modules/" + this.props.module.mid + ".html";

	            return React.createElement(
	                "li",
	                { className: this.props.module.done ? "done" : "" },
	                React.createElement(
	                    "a",
	                    { href: href },
	                    this.props.module.name
	                )
	            );
	        }
	    }]);

	    return Module;
	})(React.Component);

	var Modules = (function (_React$Component4) {
	    _inherits(Modules, _React$Component4);

	    function Modules() {
	        _classCallCheck(this, Modules);

	        _get(Object.getPrototypeOf(Modules.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Main component

	    _createClass(Modules, [{
	        key: "render",
	        value: function render() {
	            return React.createElement(
	                "ol",
	                { className: "modules" },
	                this.props.path.modules.map(renderModule)
	            );
	        }
	    }]);

	    return Modules;
	})(React.Component);

	var Sidebar = (function (_React$Component5) {
	    _inherits(Sidebar, _React$Component5);

	    function Sidebar(props) {
	        _classCallCheck(this, Sidebar);

	        _get(Object.getPrototypeOf(Sidebar.prototype), "constructor", this).call(this, props);
	        this.state = {
	            user: _cacheJs2["default"].user,
	            loggedin: _cacheJs2["default"].userExists(),
	            domains: [],
	            visible: true
	        };
	        // Re-bind methods
	        this.fetchDomains = this.fetchDomains.bind(this);
	        this.loginUser = this.loginUser.bind(this);
	        this.logoutUser = this.logoutUser.bind(this);
	        this.toggleVisible = this.toggleVisible.bind(this);
	        // Fetch data
	        this.fetchDomains();
	    }

	    _createClass(Sidebar, [{
	        key: "fetchDomains",
	        value: function fetchDomains() {
	            var _this2 = this;

	            // TODO: error handling?
	            _cacheJs2["default"].getDomains(function (d) {
	                return _this2.setState({ domains: d });
	            });
	        }
	    }, {
	        key: "loginUser",
	        value: function loginUser(u) {
	            this.setState({
	                user: u,
	                loggedin: true
	            });

	            _pubsubJs2["default"].publish("user.login", u);
	        }
	    }, {
	        key: "logoutUser",
	        value: function logoutUser() {
	            this.setState({
	                user: null,
	                loggedin: false
	            });

	            // Clear user from the cache
	            _cacheJs2["default"].updateUser(null);
	            _pubsubJs2["default"].publish("user.logout", null);
	        }

	        // Toggles visibility of the sidebar
	    }, {
	        key: "toggleVisible",
	        value: function toggleVisible() {
	            this.setState({ visible: !this.state.visible });
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            // If the user is not logged in
	            if (!this.state.loggedin) {
	                return React.createElement(Login, { loginHandler: this.loginUser });
	            }

	            // TODO: if more paths can be chosen etc.
	            var path = this.state.user.paths ? this.state.user.paths[0] : {};

	            return React.createElement(
	                "div",
	                { className: this.state.visible ? "show" : "hide" },
	                React.createElement(
	                    "h5",
	                    { onClick: this.toggleVisible, className: "sidebar-links-header" },
	                    "Min Väg ",
	                    React.createElement(
	                        "span",
	                        { className: "show-hide" },
	                        this.state.visible ? "dölj" : "visa"
	                    )
	                ),
	                React.createElement(Modules, { path: path }),
	                React.createElement(Logout, { logoutHandler: this.logoutUser })
	            );
	        }
	    }]);

	    return Sidebar;
	})(React.Component);

	exports["default"] = Sidebar;
	module.exports = exports["default"];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _endpointsJs = __webpack_require__(2);

	var _endpointsJs2 = _interopRequireDefault(_endpointsJs);

	var _cacheJs = __webpack_require__(1);

	var _cacheJs2 = _interopRequireDefault(_cacheJs);

	var _pubsubJs = __webpack_require__(6);

	var _pubsubJs2 = _interopRequireDefault(_pubsubJs);

	// Global dependencies
	var React = window.React,
	    Http = window.qwest,
	    d3 = window.d3;

	// Message constants
	var MESSAGE = {
	    ERRUSER: "Ni måste logga in för att visa er profil."
	};

	var Graph = (function (_React$Component) {
	    _inherits(Graph, _React$Component);

	    function Graph(props) {
	        _classCallCheck(this, Graph);

	        _get(Object.getPrototypeOf(Graph.prototype), "constructor", this).call(this, props);
	        this.state = { mounted: false };
	        // Re-bind methods
	        this.getMaxPoints = this.getMaxPoints.bind(this);
	        this.getPoints = this.getPoints.bind(this);
	        this.getNodes = this.getNodes.bind(this);
	        this.getLinks = this.getLinks.bind(this);
	        this.getGroups = this.getGroups.bind(this);
	        this.tick = this.tick.bind(this);
	    }

	    // Returns the max points from all answers to a quiz

	    _createClass(Graph, [{
	        key: "getMaxPoints",
	        value: function getMaxPoints(module, answers) {
	            if (!module.results || !module.results.length) {
	                return 0;
	            }

	            var lastQuiz = module.results[module.results.length - 1],
	                qId = lastQuiz.quiz,
	                qAnswers = answers.filter(function (q) {
	                return q.id == qId;
	            });

	            if (!qAnswers) {
	                return 0;
	            }

	            qAnswers = qAnswers[0].answers;

	            var pts = module.results.filter(function (r) {
	                return r.quiz == qId;
	            }).map(r = this.getPoints(qAnswers, r));

	            return Math.max.apply(Math, pts) / qAnswers.length;
	        }

	        // Calculate points from the answers of a quiz
	    }, {
	        key: "getPoints",
	        value: function getPoints(qAnswers, uAnswers) {
	            return qAnswers.map(function (a, i) {
	                var uAnswer = uAnswers.answers["answer-" + i];

	                if (a.type == "radio") {
	                    return a.correct == uAnswer;
	                }

	                if (a.correct.length !== uAnswer.length) {
	                    return false;
	                }

	                uAnswer.sort();

	                return a.correct.sort().every(function (a, i) {
	                    return a == uAnswer[i];
	                });
	            }).reduce(function (a, n) {
	                return n ? a + 1 : a + 0;
	            }, 0);
	        }

	        // All the nodes
	    }, {
	        key: "getNodes",
	        value: function getNodes(modules, answers) {
	            var _this = this;

	            return modules.map(function (m) {
	                return {
	                    mid: m.mid,
	                    domain: m.domain,
	                    name: m.name,
	                    group: +m.domain.substring(1),
	                    score: _this.getMaxPoints(m, answers)
	                };
	            });
	        }

	        // Relationships between nodes (from modules)
	    }, {
	        key: "getLinks",
	        value: function getLinks(modules) {
	            return modules.map(function (m, i) {
	                return m.rel.filter(function (r) {
	                    return modules.some(function (m) {
	                        return m.mid == r;
	                    });
	                }).map(function (r) {
	                    return {
	                        source: i,
	                        target: modules.reduce(function (a, n) {
	                            return a.concat(n.mid);
	                        }, []).indexOf(r)
	                    };
	                });
	            }).reduce(function (a, n) {
	                return a.concat(n);
	            });
	        }

	        // Group nodes by domain name
	    }, {
	        key: "getGroups",
	        value: function getGroups(nodes, domains) {
	            return d3.nest().key(function (d) {
	                return d.group;
	            }).entries(nodes).map(function (g) {
	                return {
	                    group: g.key,
	                    name: domains.filter(function (d) {
	                        return d.id == g.values[0].domain;
	                    })[0].name
	                };
	            });
	        }

	        // Render tick for the nodes
	    }, {
	        key: "tick",
	        value: function tick(nodes, node, link) {
	            return function (e) {
	                var k = e.alpha * 5;

	                nodes.forEach(function (n, i) {
	                    n.x += n.group & 2 ? k : -k;
	                    n.y += n.group & 1 ? k : -k;
	                });

	                node.attr("cx", function (d) {
	                    return d.x + 40;
	                }).attr("cy", function (d) {
	                    return d.y;
	                });

	                link.attr("x1", function (d) {
	                    return d.source.x + 40;
	                }).attr("y1", function (d) {
	                    return d.source.y;
	                }).attr("x2", function (d) {
	                    return d.target.x + 40;
	                }).attr("y2", function (d) {
	                    return d.target.y;
	                });
	            };
	        }
	    }, {
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            this.setState({ mounted: true });
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            var _this2 = this;

	            // If the props are empty don't do anything
	            if (this.state.mounted && this.props.domains.length && this.props.answers.length && this.props.modules.length) {
	                (function () {
	                    var modules = _this2.props.modules,
	                        nodes = _this2.getNodes(modules, _this2.props.answers),
	                        links = _this2.getLinks(modules),
	                        groups = _this2.getGroups(nodes, _this2.props.domains);

	                    var w = _this2.props.width,
	                        h = _this2.props.height,
	                        mTop = (h - 30 * groups.length) / 2,
	                        // Margin-top
	                    color = d3.scale.category20(),
	                        tip = d3.tip().attr("class", "d3-tip").html(function (d) {
	                        return d.name;
	                    });

	                    var force = d3.layout.force().charge(-150).linkDistance(150).linkStrength(0).size([w, h]);

	                    var svg = d3.select("#graph-container").append("svg").attr("width", w).attr("height", h).call(tip);

	                    var legend = svg.selectAll(".legend").data(groups).enter().append("g").attr("class", "legend");

	                    legend.append("rect").attr("width", 15).attr("height", 15).attr("fill", function (d) {
	                        return color(d.group);
	                    }).attr("y", function (d, i) {
	                        return mTop + ((i - 1) * 15 + i * 10);
	                    });

	                    legend.append("text").attr("height", 15).attr("x", 20).attr("y", function (d, i) {
	                        return mTop + (i * 15 + i * 10 - 3);
	                    }).style("font-size", 13).text(function (d) {
	                        return d.name;
	                    });

	                    var link = svg.selectAll(".link").data(links).enter().append("line").attr("class", "link").style("stroke-width", 1);

	                    var node = svg.selectAll(".node").data(nodes).enter().append("circle").attr("class", "node").attr("cx", function (d) {
	                        return d.x;
	                    }).attr("cy", function (d) {
	                        return d.y;
	                    }).attr("r", 12).style("stroke", function (d) {
	                        return color(d.group);
	                    }).style("fill", function (d) {
	                        return color(d.group);
	                    }).style("fill-opacity", function (d) {
	                        return d.score < 0.3 ? 0.3 : d.score;
	                    }).on("mouseover", tip.show).on("mouseout", tip.hide).call(force.drag);

	                    node.append("title").text(function (d) {
	                        return d.name;
	                    });

	                    force.nodes(nodes).links(links).on("tick", _this2.tick(nodes, node, link)).start();
	                })();
	            }
	            return React.createElement("div", null);
	        }
	    }]);

	    return Graph;
	})(React.Component);

	Graph.defaultProps = { width: 700, height: 550 };

	// TODO: more user statistics + improve design

	var UserStats = (function (_React$Component2) {
	    _inherits(UserStats, _React$Component2);

	    function UserStats() {
	        _classCallCheck(this, UserStats);

	        _get(Object.getPrototypeOf(UserStats.prototype), "constructor", this).apply(this, arguments);
	    }

	    // Main component

	    _createClass(UserStats, [{
	        key: "render",
	        value: function render() {
	            var code = this.props.user.code,
	                url = _endpointsJs2["default"].addPath + "/path/add.html?hash=" + this.props.user.paths[0].hash;

	            return React.createElement(
	                "ul",
	                null,
	                React.createElement(
	                    "li",
	                    null,
	                    "Användarkod: ",
	                    code
	                ),
	                React.createElement(
	                    "li",
	                    null,
	                    "URL: ",
	                    url
	                )
	            );
	        }
	    }]);

	    return UserStats;
	})(React.Component);

	var Profile = (function (_React$Component3) {
	    _inherits(Profile, _React$Component3);

	    function Profile(props) {
	        _classCallCheck(this, Profile);

	        _get(Object.getPrototypeOf(Profile.prototype), "constructor", this).call(this, props);
	        this.state = {
	            user: _cacheJs2["default"].user,
	            domains: [],
	            answers: []
	        };
	        // Re-bind methods
	        this.loginUser = this.loginUser.bind(this);
	        this.logoutUser = this.logoutUser.bind(this);
	        this.fetchDomains = this.fetchDomains.bind(this);
	        this.fetchQuizAnswers = this.fetchQuizAnswers.bind(this);
	        // Subscribe to events
	        _pubsubJs2["default"].subscribe("user.login", this.loginUser);
	        _pubsubJs2["default"].subscribe("user.logout", this.logoutUser);
	    }

	    // Fetch data

	    _createClass(Profile, [{
	        key: "componentDidMount",
	        value: function componentDidMount() {
	            this.fetchDomains();
	            this.fetchQuizAnswers();
	        }
	    }, {
	        key: "fetchDomains",
	        value: function fetchDomains() {
	            var _this3 = this;

	            // TODO: error handling?
	            _cacheJs2["default"].getDomains(function (d) {
	                return _this3.setState({ domains: d });
	            });
	        }
	    }, {
	        key: "fetchQuizAnswers",
	        value: function fetchQuizAnswers() {
	            var _this4 = this;

	            // TODO: error handling?
	            _cacheJs2["default"].getQuizAnswers(function (a) {
	                return _this4.setState({ answers: a });
	            });
	        }
	    }, {
	        key: "loginUser",
	        value: function loginUser(msg, user) {
	            this.setState({ user: user });
	        }
	    }, {
	        key: "logoutUser",
	        value: function logoutUser() {
	            this.setState({ user: null });
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            if (!this.state.user) {
	                return React.createElement(
	                    "p",
	                    null,
	                    MESSAGE.ERRUSER
	                );
	            }

	            var modules = this.state.user.paths[0].modules;

	            return React.createElement(
	                "div",
	                { className: "user-profile" },
	                React.createElement("div", { id: "graph-container" }),
	                React.createElement(Graph, { modules: modules, domains: this.state.domains, answers: this.state.answers }),
	                React.createElement(UserStats, { user: this.state.user })
	            );
	        }
	    }]);

	    return Profile;
	})(React.Component);

	exports["default"] = Profile;
	module.exports = exports["default"];

/***/ }
/******/ ]);