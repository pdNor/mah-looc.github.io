"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage;

    var Endpoints = {
        createPath: "http://0.0.0.0:3000/api/paths"
    };

    var User = JSON.parse(Storage.getItem("user"));

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

    var SortButton = React.createClass({displayName: "SortButton",
        sortChoices: function() {
            this.props.sortChoices();
        },
        render: function() {
            return React.createElement("button", {type: "button", onClick: this.sortChoices}, "Sortera");
        }
    });

    var ClearButton = React.createClass({displayName: "ClearButton",
        clearChoices: function() {
            this.props.clearChoices();
        },
        render: function() {
            return React.createElement("button", {type: "reset", onClick: this.clearChoices}, "Rensa");
        }
    });

    var Path = React.createClass({displayName: "Path",
        render: function() {
            var choices = this.props.choices.map(function(choice, i) {
                return React.createElement(ModuleChoice, {key: i, module: choice, removeChoice: this.props.removeChoice});
            }, this);

            return (
                React.createElement("div", null, 
                    React.createElement("ol", {class: "choices"}, choices), 
                    React.createElement(SortButton, {sortChoices: this.props.sortChoices}), 
                    React.createElement(ClearButton, {clearChoices: this.props.clearChoices})
                )
            );
        }
    });

    var ModuleChoice = React.createClass({displayName: "ModuleChoice",
        removeChoice: function() {
            this.props.removeChoice(this.props.module);
        },
        render: function() {
            return React.createElement("li", {onClick: this.removeChoice}, this.props.module.domain, ": ", this.props.module.name);
        }
    });

    var Domain = React.createClass({displayName: "Domain",
        // Select one module
        handleModuleSelection: function(module) {
            return function() {
                if (React.findDOMNode(this.refs[module.id]).checked) {
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
                return React.createElement(Domain, {
                        key: i, 
                        domain: domain, 
                        addChoice: this.props.addChoice, 
                        removeChoice: this.props.removeChoice});
            }, this);

            return React.createElement("ul", {class: "domains"}, domains);
        }
    });

    var Message = React.createClass({displayName: "Message",
        render: function() {
            return React.createElement("p", {className: "message " + this.props.msg.type, onClick: this.props.clickHandler}, this.props.msg.text);
        }
    });

    var Input = React.createClass({displayName: "Input",
        render: function() {
            var input;

            if (this.props.verify) {
                input = (
                    React.createElement("div", null, 
                        React.createElement("label", null, "Code ", React.createElement("input", {type: "text", onChange: this.props.handleCodeChange})), 
                        React.createElement("button", {type: "button", onClick: this.props.handleCancel}, "Avbryt")
                    )
                );
            } else {
                input = React.createElement("label", null, "Email ", React.createElement("input", {type: "text", onChange: this.props.handleEmailChange}));
            }

            return input;
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
            if (this.state.verify && !this.state.code.length) {
                this.setState({
                    msg: {
                        text: "Fyll i en användarkod",
                        type: "info",
                        show: true
                    }
                });
                return;
            } else if (!this.state.email.length || !this.props.choices.length) {
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

            // Data sent to the server
            var payload = {
                email: this.state.email,
                path: { choices: this.props.choices }
            };

            // Send user code if a user is already active
            if (User) {
                payload.code = User.code;
            // Otherwise get it from the input field
            } else if (this.state.verify) {
                payload.code = this.state.code;
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
                                text: "Path and successfully created!",
                                type: "success",
                                show: true
                            }
                        });

                        // Visa länken som är delbar?
                        // Visa en "Nästa/Overview" knapp?
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
        handleCancel: function(e) {
            this.setState({
                verify: false,
                email: "",
                code: "",
                msg: { show: false }
            });
        },
        hideMessage: function() {
            this.setState({ msg: { show: false }});
        },
        render: function() {
            var message = this.state.msg.show ? React.createElement(Message, {msg: this.state.msg, clickHandler: this.hideMessage}) : "";

            return (
                React.createElement("div", null, 
                    message, 
                    React.createElement(Input, {verify: this.state.verify, handleCodeChange: this.handleCodeChange, handleEmailChange: this.handleEmailChange, handleCancel: this.handleCancel}), 
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
            // Fetch all domains (these will be cached in localStorage)
            getDomains(function(domains) {
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
                choices: this.state.choices.filter(function(o) {
                    return ("indexOf" in choice) ? (choice.indexOf(o.id) == -1) : (o.id != choice.id);
                })
            });
        },
        sortChoices: function() {
            // Sort choices by domain id + module id 
            this.setState({
                choices: this.state.choices.sort(function(a, b) {
                    return (+a.domain.substr(1) + +a.id.substr(1)) - (+b.domain.substr(1) + +b.id.substr(1));
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
                    React.createElement(Domains, {
                        domains: this.state.domains, 
                        addChoice: this.addChoice, 
                        removeChoice: this.removeChoice}), 

                    React.createElement(Path, {
                        choices: this.state.choices, 
                        removeChoice: this.removeChoice, 
                        sortChoices: this.sortChoices, 
                        clearChoices: this.clearChoices}), 

                    React.createElement(CreatePath, {choices: this.state.choices})
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
