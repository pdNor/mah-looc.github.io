"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage;

    var User = Storage.getItem("user") ? Storage.getItem("user") : {};

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
        getRefs: function() {
            var m = [];

            for (var ref in this.refs) {
                m.push(this.refs[ref]);
            }

            return m;
        },
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
            var refs = this.getRefs();
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

    var CreatePath = React.createClass({displayName: "CreatePath",
        getInitialState: function() {
            return {
                email: "",
                message: ""
            };
        },
        handleSubmit: function() {
            if (!this.state.email.length || !this.props.choices.length) {
                this.setState({ message: "Välj moduler och fyll i en email." });
                return;
            }

            this.setState({ message: "Loading." });

            var payload = {
                email: this.state.email,
                path: { choices: this.props.choices }
            };

            Http.post("http://0.0.0.0:3000/api/paths", payload, { dataType: "json" })
                .then(function(response) {
                    console.log("resp", response);
                    // spara användarinformation i Storage
                    // skicka vidare användaren till overview sidan
                    this.setState({ message: "" });
                }.bind(this))
                .catch(function(err, url) {
                    console.log("err", err, url);

                    this.setState({ message: "error." });
                }.bind(this));
        },
        handleChange: function(e) {
            this.setState({ email: e.target.value });
        },
        render: function() {
            return (
                React.createElement("div", {class: "create-path"}, 
                    React.createElement("p", null, "Msg: ", this.state.message), 
                    React.createElement("input", {type: "text", value: this.state.email, onChange: this.handleChange}), 
                    React.createElement("button", {type: "button", onClick: this.handleSubmit}, "Submit")
                )
            );
        }
    });

    var PathForm = React.createClass({displayName: "PathForm",
        getInitialState: function() {
            return {
                domains: [],
                choices: []
            };
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
            console.log("adding", choice);
            this.setState({
                choices: this.state.choices.concat(choice)
            });
        },
        removeChoice: function(choice) {
            this.setState({
                choices: this.state.choices.filter(function(o) {
                    console.log("remove choice", choice);
                    if (typeof choice == typeof []) {
                        return choice.indexOf(o.id) == -1;
                    }
                    
                    return o.id != choice.id;
                })
            });
        },
        handleSort: function() {
            this.setState({
                choices: this.state.choices.sort(function(a, b) {
                    // Sort by domain ID + module ID
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
