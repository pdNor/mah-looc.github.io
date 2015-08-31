// Don't clutter global namespace
(function(window, document) {
    // Strict mode
    "use strict";

    // Dependencies
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        Location = window.location,
        Cache;

    // TODO: temporary solution
    var isLocal = Location.hostname == "localhost" || Location.hostname == "127.0.0.1";

    var Endpoints = {
        data: "/data.json",
        // Production
        getUserByCode: isLocal ? "http://0.0.0.0:3000/api/user" : "http://178.62.76.67/api/user"
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

    // DEBUG
    // if (Cache.user) console.log("User object:", Cache.user);
    // if (Cache.domains) console.log("Domains object:", Cache.domains);

    // Show/hide the quiz HTML container
    function showQuiz(show) {
        var quiz = document.getElementById("quiz-container");

        if (quiz) {
            quiz.style.display = show ? "block" : "none";
        }
    }

    // Fetch all domains from the server and cache them in localStorage
    function fetchDomains(cb) {
        if (Cache.domains) {
            return cb(Cache.domains);
        }

        // TODO: how long should the data be cached?
        return Http.get(Endpoints.data)
            .then(function(res) {
                // Build up dependency tree of domains -> modules and then sort them by id
                var domains = res.domains.map(function(d) {
                    d.modules = res.modules.filter(function(m) {
                        return m.domain == d.id;
                    })
                    .map(function(m) {
                        m.mid = m.id;
                        delete m.id;
                        return m;
                    });

                    return d;
                })
                .sort(function(a, b) {
                    return +a.id.substring(1) >= +b.id.substring(1) ? 1 : -1;
                });

                Cache.domains = domains;
                updateStorage();
                cb(domains);
            })
            .catch(function(e, url) {
                // TODO: better error ha
                console.log(e, url);
            });
    }

    // Login component
    var Login = React.createClass({displayName: "Login",
        getInitialState: function() {
            return { message: "" };
        },
        handleSubmit: function(e) {
            e.preventDefault();
            
            var code = React.findDOMNode(this.refs.code).value;

            if (!code) {
                return;
            }

            Http.get(Endpoints.getUserByCode, { code: code })
                .then(function(res) { return JSON.parse(res); })
                .then(function(res) {
                    this.props.loginHandler(res.user);
                }.bind(this))
                .catch(function(e, url) {
                    this.setState({ message: "Inkorrekt användarkod" });
                }.bind(this));
        },
        render: function() {
            return (
                React.createElement("form", {className: "login-form", onSubmit: this.handleSubmit}, 
                    React.createElement("p", null, this.state.message), 
                    React.createElement("input", {type: "text", placeholder: "Användarkod", ref: "code"}), 
                    React.createElement("button", {type: "submit", onClick: this.handleSubmit}, "Logga in")
                )
            );
        }
    });

    // Logout component
    var Logout = React.createClass({displayName: "Logout",
        handleLogout: function() {
            this.props.logoutHandler();
        },
        render: function() {
            return React.createElement("button", {type: "submit", className: "logout-button", onClick: this.handleLogout}, "Logga ut");
        }
    });

    // Each module in a path, a CSS class represents wether a module is finished or not
    var Module = React.createClass({displayName: "Module",
        render: function() {
            return (
                    React.createElement("li", {className: this.props.module.done ? "done" : ""}, 
                    React.createElement("a", {href: "/domains/" + this.props.module.domain + "/modules/" + this.props.module.mid + ".html"}, this.props.module.name)
                )
            );
        }
    });

    // List of modules in a path
    var Modules = React.createClass({displayName: "Modules",
        render: function() {
            var modules = this.props.path.modules.map(function(module) {
                return React.createElement(Module, {module: module});
            });

            return React.createElement("ol", {className: "modules"}, modules);
        }
    });

    // Main sidebar component
    var Sidebar = React.createClass({displayName: "Sidebar",
        getInitialState: function() {
            return {
                show: true,
                active: false,
                user: {},
                domains: []
            };
        },
        fetchDomainsFromServer: function() {
            fetchDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        fetchUserFromServer: function() {
            this.setState({
                user: Cache.user,
                active: Cache.user ? true : false
            });
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
            this.fetchUserFromServer();
        },
        loginUser: function(user) {
            this.setState({
                user: user,
                active: true
            });

            Cache.user = user;
            updateStorage();
            showQuiz(true);
        },
        logoutUser: function() {
            this.setState({
                user: null,
                active: false
            });

            Cache.user = null;
            updateStorage();
            showQuiz(false);
        },
        toggleShow: function() {
            this.setState({ show: !this.state.show });
        },
        render: function() {
            var modules;

            // TODO: make another component?
            if (this.state.active && "paths" in this.state.user) {
                modules = (
                    React.createElement("div", {className: this.state.show ? "show" : "hide"}, 
                        React.createElement("h5", {className: "sidebar-links-header", onClick: this.toggleShow}, 
                            "Min väg", 
                            React.createElement("span", {className: "show-hide"}, this.state.show ? "dölj" : "visa")
                        ), 
                        React.createElement(Modules, {path: this.state.user.paths[0]}), 
                        React.createElement(Logout, {logoutHandler: this.logoutUser})
                    )
                );
            } else {
                modules = React.createElement(Login, {loginHandler: this.loginUser});
            }

            return React.createElement("div", null, modules);
        }
    });

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);
        // Render main component to DOM
        React.render(
            React.createElement(Sidebar, null),
            document.getElementById("app-sidebar")
        );

    }, false);

// Invoke anonymous function
})(window, document);
