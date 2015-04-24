"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage;

    var Endpoints = {
        createPath: "http://0.0.0.0:3000/api/paths"
    };

    var User = Storage.getItem("user") ? JSON.parse(Storage.getItem("user")) : {};

    if (User) console.log("User object: ", User);

    // TODO check localStorage

    function getDomains(callback) {
        if (Storage.getItem("domains")) {
            callback(JSON.parse(Storage.getItem("domains")));
        } else {
            Http.get("/search.json")
                .then(function(response) {
                    Storage.setItem("domains", JSON.stringify(response.domains));
                    callback(response.domains);
                });
        }
    }

    var Path = React.createClass({displayName: "Path",
        render: function() {
            var choices = this.props.choices.map(function(choice, i) {
                return React.createElement(ModuleChoice, {key: i, module: choice});
            });

            return React.createElement("ul", {class: "choices"}, choices);
        }
    });

    var ModuleChoice = React.createClass({displayName: "ModuleChoice",
        render: function() {
            return React.createElement("li", null, this.props.module.domain, ": ", this.props.module.name);
        }
    });

    var Domain = React.createClass({displayName: "Domain",
        handleModuleSelection: function(module) {
            return function() {
                if (React.findDOMNode(this.refs[module.id]).checked) {
                    this.props.addChoice(module);
                } else {
                    this.props.removeChoice(module);
                }
            }.bind(this);
        },
        handleDomainSelection: function() {
            // Convert all component references to an array
            var refs = Object.keys(this.refs).map(function(k) { return this.refs[k]; }, this);
            // Check if all checkboxes have been checked
            var allChecked = refs.every(function(r) { return React.findDOMNode(r).checked; });

            if (allChecked) {
                // Remove all modules choices if all is already chosen
                var ids = refs.map(function(r) {
                    React.findDOMNode(r).checked = false;
                    return r.props.module.id;
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
        render: function() {
            var modules = this.props.domain.modules.map(function(module) {
                return (
                    React.createElement("li", null, 
                        React.createElement("label", null, 
                            React.createElement("input", {type: "checkbox", ref: module.id, module: module, onChange: this.handleModuleSelection(module)}), 
                            module.name
                        )
                    )
                );
            }.bind(this));

            return (
                React.createElement("li", null, 
                    React.createElement("span", {onClick: this.handleDomainSelection}, this.props.domain.name), 
                    React.createElement("ul", {class: "modules"}, modules)
                )
            );
        }
    });
    
    var Domains = React.createClass({displayName: "Domains",
        render: function() {
            var domains = this.props.domains.map(function(domain, i) {
                return React.createElement(Domain, {key: i, domain: domain, addChoice: this.props.addChoice, removeChoice: this.props.removeChoice});
            }.bind(this));

            return React.createElement("ul", {class: "domains"}, domains);
        }
    });

    var Message = React.createClass({displayName: "Message",
        render: function() {
            return React.createElement("p", {className: "message " + this.props.msg.type, onClick: this.props.clickHandler}, this.props.msg.text);
        }
    });

    // när de skickat första gången
    // - hur kollar vi om de skickar code och hur gör vi med detta?

    var CreatePath = React.createClass({displayName: "CreatePath",
        getInitialState: function() {
            return {
                verify: false,
                email: "",
                code: "",
                msg: {
                    text: "",
                    type: "",
                    show: false
                }
            };
        },
        handleSubmit: function() {
            // "minimum" tillåtna antal val?
            if ((!this.state.email.length && !this.state.code.length) || !this.props.choices.length) {
                this.setState({
                    msg: {
                        text: "Välj moduler och fyll i en email.",
                        type: "info",
                        show: true
                    }
                });
                return;
            }

            this.setState({
                msg: {
                    text: "Loading",
                    type: "info",
                    show: true
                }
            });

            var payload = {
                email: this.state.email,
                path: { choices: this.props.choices }
            };

            if (User) {
                payload.code = User.code;
            }

            var self = this;

            Http.post(Endpoints.createPath, payload, { dataType: "json" })
                .then(function(res) { return JSON.parse(res); })
                .then(function(res) {
                    console.log("Response", res);
                    
                    if ("exists" in res && res.exists) {
                        console.log("User exists");

                        self.setState({
                            verify: true,
                            msg: {
                                text: "User exists - authenticate with code",
                                type: "info",
                                show: true
                            }
                        });
                    } else {
                        console.log("Success", res);

                        Storage.setItem("user", JSON.stringify(res.user));
                        // redirect
                        // location.pathname = "/domains/overview.html";
                        
                        self.setState({
                            verify: false,
                            msg: {
                                text: "Path and user successfully created!",
                                type: "success",
                                show: true
                            }
                        });
                    }
                })
                .catch(function(err, url) {
                    console.log("Error", err, url);
                    // this.responseText

                    self.setState({
                        verify: false,
                        msg: {
                            text: "An error occurred :(",
                            type: "error",
                            show: true
                        }
                    });
                });
        },
        handleEmailChange: function(e) {
            this.setState({ email: e.target.value });
        },
        handleCodeChange: function(e) {
            this.setState({ code: e.target.value });
        },
        hideMessage: function() {
            this.setState({ msg: { show: false }});
        },
        render: function() {
            var message = this.state.msg.show ? React.createElement(Message, {msg: this.state.msg, clickHandler: this.hideMessage}) : "";
            
            return (
                React.createElement("div", {class: "create-path"}, 
                    message, 
                    React.createElement("input", {type: "text", value: this.state.input, onChange: this.handleChange}), 
                    React.createElement("button", {type: "button", onClick: this.handleSubmit}, "Submit")
                )
            );
        }
    });

    var PathForm = React.createClass({displayName: "PathForm",
        getInitialState: function() {
            return { domains: [], choices: [] };
        },
        fetchDomainsFromServer: function() {
            getDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
        },
        addChoice: function(choice) {
            this.setState({
                choices: this.state.choices.concat(choice)
            });
        },
        removeChoice: function(choice) {
            this.setState({
                choices: this.state.choices.filter(function(o) {
                    // Check for index if "choice" is an array
                    return ("indexOf" in choice) ? (choice.indexOf(o.id) == -1) : (o.id != choice.id);
                })
            });
        },
        handleSort: function() {
            this.setState({
                choices: this.state.choices.sort(function(a, b) {
                    // Sort by domain id + module id 
                    return (+a.domain.substr(1) + +a.id.substr(1)) - (+b.domain.substr(1) + +b.id.substr(1));
                })
            });
        },
        handleClear: function(e) {
            this.setState({ choices: [] });
        },
        render: function() {
            return (
                React.createElement("form", {id: "path-form"}, 
                    React.createElement(Domains, {domains: this.state.domains, addChoice: this.addChoice.bind(this), removeChoice: this.removeChoice.bind(this)}), 
                    React.createElement(Path, {choices: this.state.choices}), 
                    React.createElement(CreatePath, {choices: this.state.choices}), 
                    React.createElement("button", {type: "button", onClick: this.handleSort}, "Sort"), 
                    React.createElement("button", {type: "reset", onClick: this.handleClear}, "Clear")
                )
            );
        }
    });


    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);

        React.render(
            React.createElement(PathForm, null),
            document.getElementById("path-container")
        );

    }, false);

})(window, document);
