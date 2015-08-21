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
        createPath: "http://178.62.76.67/api/paths",
        addPath: "http://mah-looc.github.io/path/add.html"
        // LOCAL
        // createPath: "http://localhost:3000/api/paths",
        // addPath: "http://localhost:4000/path/add.html"
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

    // Sort all modules
    var SortButton = React.createClass({displayName: "SortButton",
        sortChoices: function() {
            this.props.sortChoices();
        },
        render: function() {
            return React.createElement("button", {type: "button", onClick: this.sortChoices}, "Sortera");
        }
    });

    // Clear all chosen modules
    var ClearButton = React.createClass({displayName: "ClearButton",
        clearChoices: function() {
            this.props.clearChoices();
        },
        render: function() {
            return React.createElement("button", {type: "reset", onClick: this.clearChoices}, "Rensa");
        }
    });

    // Chosen path of modules
    var Path = React.createClass({displayName: "Path",
        getDomainById: function(id) {
            // Return domain based on id
            return this.props.domains.filter(function(d) { return d.id == id; })[0];
        },
        render: function() {
            var choices = this.props.choices.map(function(choice, i) {
                return React.createElement(ModuleChoice, {key: i, module: choice, domain: this.getDomainById(choice.domain)});
            }, this);

            if (!choices.length) {
                choices = React.createElement("li", null, "Ingen modul vald");
            }

            return (
                React.createElement("div", {className: "path"}, 
                    React.createElement("h5", null, "Din väg"), 
                    React.createElement("ol", {className: "choices"}, choices), 
                    React.createElement(SortButton, {sortChoices: this.props.sortChoices}), 
                    React.createElement(ClearButton, {clearChoices: this.props.clearChoices})
                )
            );
        }
    });

    // A module choice
    var ModuleChoice = React.createClass({displayName: "ModuleChoice",
        render: function() {
            //  <small>({this.props.domain.name})</small>
            return (
                React.createElement("li", {className: "choice"}, 
                    React.createElement("a", {href: "/domains/" + this.props.module.domain + "/modules/" + this.props.module.mid + ".html"}, 
                    this.props.module.name
                    )
                )
            );
        }
    });

    // A Domain of modules
    var Domain = React.createClass({displayName: "Domain",
        getInitialState: function() {
            return { toggle: "expand" };
        },
        // Select one module
        handleModuleSelection: function(module) {
            return function() {
                if (React.findDOMNode(this.refs[module.mid]).checked) {
                    this.props.addChoice(module);
                } else {
                    this.props.removeChoice(module);
                }
            }.bind(this);
        },
        // Select all modules from a domain
        handleDomainSelection: function() {
            // Convert all component references to an array
            var refs = Object.keys(this.refs).map(function(k) { return this.refs[k]; }, this);
            // Check if all checkboxes have been checked
            var allChecked = refs.every(function(r) { return React.findDOMNode(r).checked; });

            if (allChecked) {
                // Remove all modules choices if all is already chosen
                var ids = refs.map(function(r) {
                    React.findDOMNode(r).checked = false;
                    return r.props.module.mid;
                });

                this.props.removeChoice(ids);
            } else {
                // If all is not chosen add all the non-chosen modules
                var choices = refs.filter(function(r) {
                    return !React.findDOMNode(r).checked;
                }).map(function(r) {
                    React.findDOMNode(r).checked = true;
                    return r.props.module;
                });

                this.props.addChoice(choices);
            }
        },
        toggle: function() {
            this.setState({
                toggle: this.state.toggle ? "" : "expand"
            });
        },
        render: function() {
            var modules = this.props.domain.modules.map(function(module) {
                return (
                    React.createElement("li", {className: "module"}, 
                        React.createElement("label", null, 
                            React.createElement("input", {type: "checkbox", ref: module.mid, module: module, onChange: this.handleModuleSelection(module)}), 
                            module.name
                        )
                    )
                );
            }, this);

            var toggle = this.state.toggle ? "-" : "+";

            return (
                React.createElement("li", {className: "domain " + this.state.toggle}, 
                    React.createElement("span", {onClick: this.toggle, className: "toggle"}, toggle), 
                    React.createElement("span", {onClick: this.handleDomainSelection, className: "domain-name"}, this.props.domain.name), 
                    React.createElement("ul", {className: "modules"}, modules)
                )
            );
        }
    });

    // A list of all Domains
    var Domains = React.createClass({displayName: "Domains",
        render: function() {
            var domains = this.props.domains.map(function(domain, i) {
                return React.createElement(Domain, {
                        key: i, 
                        domain: domain, 
                        addChoice: this.props.addChoice, 
                        removeChoice: this.props.removeChoice});
            }, this);

            return (
                React.createElement("div", null, 
                    React.createElement("p", {className: "domains-info"}, "Välj moduler från listan nedan som ska ingå i din egen väg. Till vänster visas dina val och längst ner på sidan kan du registrera dig."), 
                    React.createElement("ul", {className: "domains"}, domains)
                )
            );
        }
    });

    // Info message from submitting the form
    var Message = React.createClass({displayName: "Message",
        render: function() {
            var message;

            if (this.props.msg) {
                message = React.createElement("p", {className: "message " + this.props.type, onClick: this.props.clickHandler}, this.props.msg);
            } else {
                message = "";
            }

            return React.createElement("div", null, message);
        }
    });

    // User input field
    var UserInput = React.createClass({displayName: "UserInput",
        render: function() {
            var input;

            if (this.props.verify) {
                input = React.createElement("input", {type: "text", key: "1", onChange: this.props.handleCodeChange, placeholder: "Användarkod"});
            } else {
                input = React.createElement("input", {type: "text", key: "2", onChange: this.props.handleEmailChange, placeholder: "Epost"});
            }

            return (
                React.createElement("div", null, 
                    React.createElement("h5", null, "Registrera din väg"), 
                    React.createElement("label", null, input), 
                    React.createElement("button", {type: "button", onClick: this.props.handleSubmit}, "Skicka"), 
                    React.createElement("button", {type: "button", onClick: this.props.handleCancel}, "Avbryt")
                )
            );

        }
    });

    // Information message after user registration
    var CreatePathMessage = React.createClass({displayName: "CreatePathMessage",
        render: function() {
            return (
                React.createElement("div", null, 
                    React.createElement("p", {className: "info"}, 
                        "Följande användarkod ", React.createElement("code", null, this.props.code), " används för" + ' ' +
                        "att logga in, det är därför viktigt att ni sparar denna."
                    ), 
                    React.createElement("p", {className: "share"}, 
                        "Följande länk kan användas för att dela med dig av" + ' ' +
                        "din väg ", React.createElement("a", {href: this.props.href}, this.props.href), "."
                    )
                )
            );
        }
    });

    // Form for creating a path
    var CreatePath = React.createClass({displayName: "CreatePath",
        getInitialState: function() {
            return {
                verify: false,
                done: false,
                email: "",
                code: "",
                msg: "",
                msgType: ""
            };
        },
        handleSubmit: function() {
            // TODO: should we have a minimum/maximum amount of allowed module choices?

            if (this.state.verify && !this.state.code.length) {
                // Incorrect user code
                return this.setState({
                    msg: "Fyll i en användarkod",
                    msgType: "info"
                });
            } else if (!this.state.email.length || !this.props.choices.length) {
                // Empty fields
                return this.setState({
                    msg: "Välj moduler och fyll i en email",
                    msgType: "info"
                });
            }

            // TODO: fix a proper loading animation
            this.setState({ msg: "Loading", msgType: "loading" });

            // Data sent to the server
            var payload = {
                email: this.state.email,
                path: { choices: this.props.choices }
            };

            if (this.state.verify) {
                payload.code = this.state.code;
            }

            return Http.post(Endpoints.createPath, payload, { dataType: "json" })
                .then(function(res) { return JSON.parse(res); })
                .then(function(res) {
                    // DEBUG
                    console.log("Response object:", res);

                    if ("exists" in res && res.exists) {
                        // DEBUG
                        console.log("User already exists");

                        this.setState({
                            verify: true,
                            msg: "Eposten är redan registrerad, vänligen fyll i användarkoden istället eller välj avbryt för att börja om",
                            msgType: "info"
                        });
                    } else {
                        // DEBUG
                        console.log("New user created:", res.user);;

                        Cache.user = res.user;
                        updateStorage();

                        var href = Endpoints.addPath + "?hash=" + res.path.hash;
                        var msg = React.createElement(CreatePathMessage, {code: res.user.code, href: href});

                        this.setState({
                            verify: false,
                            done: true,
                            msg: msg,
                            msgType: "success"
                        });
                    }
                }.bind(this))
                .catch(function(e, url) {
                    // DEBUG
                    console.log("Error object:", e, url);

                    this.setState({
                        verify: false,
                        msg: "An error occurred",
                        msgType: "error"
                    });
                }.bind(this));
        },
        handleEmailChange: function(e) {
            this.setState({ email: e.target.value });
        },
        handleCodeChange: function(e) {
            this.setState({ code: e.target.value });
        },
        handleCancel: function() {
            this.setState({
                verify: false,
                email: "",
                code: "",
                msg: ""
            });
        },
        clearMessage: function() {
            // this.setState({ msg: "" });
        },
        render: function() {
            var userInput;

            if (this.state.done) {
                userInput = React.createElement("a", {className: "to-profile", href: "/path/profile.html"}, "Gå vidare till din profil");
            } else {
                userInput = (
                    React.createElement(UserInput, {
                        verify: this.state.verify, 
                        handleCodeChange: this.handleCodeChange, 
                        handleEmailChange: this.handleEmailChange, 
                        handleSubmit: this.handleSubmit, 
                        handleCancel: this.handleCancel})
                );
            }

            return (
                React.createElement("div", {className: "actions"}, 
                    React.createElement(Message, {msg: this.state.msg, type: this.state.msgType, clickHandler: this.clearMessage}), 
                    userInput
                )
            );
        }
    });

    // Main component with all the data
    var PathForm = React.createClass({displayName: "PathForm",
        getInitialState: function() {
            return { domains: [], choices: [] };
        },
        fetchDomainsFromServer: function() {
            // Fetch all domains (these will be cached in localStorage)
            fetchDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
        },
        addChoice: function(choice) {
            // Add one or more choices
            this.setState({ choices: this.state.choices.concat(choice) });
        },
        removeChoice: function(choice) {
            // Remove one or more module choices
            this.setState({
                choices: this.state.choices.filter(function(m) {
                    return ("indexOf" in choice) ? (choice.indexOf(m.mid) == -1) : (m.mid != choice.mid);
                })
            });
        },
        sortChoices: function() {
            // Sort choices by domain id + module id 
            this.setState({
                choices: this.state.choices.sort(function(a, b) {
                    return (+a.domain.substr(1) + +a.mid.substr(1)) - (+b.domain.substr(1) + +b.mid.substr(1));
                })
            });
        },
        clearChoices: function(e) {
            // Clear all choices
            this.setState({ choices: [] });
        },
        render: function() {
            return (
                React.createElement("form", null, 
                    React.createElement(Path, {
                        domains: this.state.domains, 
                        choices: this.state.choices, 
                        sortChoices: this.sortChoices, 
                        clearChoices: this.clearChoices}), 
                    React.createElement(Domains, {
                        domains: this.state.domains, 
                        addChoice: this.addChoice, 
                        removeChoice: this.removeChoice}), 
                    React.createElement(CreatePath, {choices: this.state.choices})
                )
            );
        }
    });

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);
        // Render main component to DOM
        React.render(
            React.createElement(PathForm, null),
            document.getElementById("create-path-container")
        );

    }, false);
    
    // Sidebar
    // window.addEventListener("scroll", function() {
    //     var header = document.getElementById("header"),
    //         top = document.scrollTop || document.body.scrollTop;

    //     if (top > (header.offsetHeight + 90)) {
    //         if (!document.body.classList.contains("fixed-path")) {
    //             document.body.classList.add("fixed-path");
    //         }
    //     } else {
    //         document.body.classList.remove("fixed-path");
    //     }
    // }, false);
// Invoke anonymous function
})(window, document);
