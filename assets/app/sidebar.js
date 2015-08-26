// Don't clutter global namespace
(function(window, document) {
    // Strict mode
    "use strict";

    // Dependencies
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        Cache;

    var Endpoints = {
        data: "/data.json",
        // Production
        getUserByCode: "http://178.62.76.67/api/user"
        // LOCAL
        // getUserByCode: "http://0.0.0.0:3000/api/user"
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
    if (Cache.user) console.log("User object:", Cache.user);
    if (Cache.domains) console.log("Domains object:", Cache.domains);

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
    var Login = React.createClass({
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
                <form className="login-form" onSubmit={this.handleSubmit}>
                    <p>{this.state.message}</p>
                    <input type="text" placeholder="Användarkod" ref="code" />
                    <button type="submit" onClick={this.handleSubmit}>Logga in</button>
                </form>
            );
        }
    });

    // Logout component
    var Logout = React.createClass({
        handleLogout: function() {
            this.props.logoutHandler();
        },
        render: function() {
            return <button type="submit" className="logout-button" onClick={this.handleLogout}>Logga ut</button>;
        }
    });

    // Each module in a path, a CSS class represents wether a module is finished or not
    var Module = React.createClass({
        render: function() {
            return (
                    <li className={this.props.module.done ? "done" : ""}>
                    <a href={"/domains/" + this.props.module.domain + "/modules/" + this.props.module.mid + ".html"}>{this.props.module.name}</a>
                </li>
            );
        }
    });

    // List of modules in a path
    var Modules = React.createClass({
        render: function() {
            var modules = this.props.path.modules.map(function(module) {
                return <Module module={module} />;
            });

            return <ol className="modules">{modules}</ol>;
        }
    });

    // Main sidebar component
    var Sidebar = React.createClass({
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
                    <div className={this.state.show ? "show" : "hide"}>
                        <h5 className="sidebar-links-header" onClick={this.toggleShow}>
                            Min väg
                            <span className="show-hide">{this.state.show ? "dölj" : "visa"}</span>
                        </h5>
                        <Modules path={this.state.user.paths[0]} />
                        <Logout logoutHandler={this.logoutUser} />
                    </div>
                );
            } else {
                modules = <Login loginHandler={this.loginUser} />;
            }

            return <div>{modules}</div>;
        }
    });

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);
        // Render main component to DOM
        React.render(
            <Sidebar />,
            document.getElementById("app-sidebar")
        );

    }, false);

// Invoke anonymous function
})(window, document);
