"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        User = {};

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

    var ModuleChoices = React.createClass({displayName: "ModuleChoices",
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

    var Module = React.createClass({displayName: "Module",
        getInitialState: function() {
            return { isChecked: false };
        },
        handleChange: function() {
            var isChecked = !this.state.isChecked;
            this.setState({ isChecked: isChecked });

            if (isChecked) {
                this.props.addChoice(this.props.module);
            } else {
                this.props.removeChoice(this.props.module);
            }
        },
        render: function() {
            var input = React.createElement("input", {type: "checkbox", checked: this.state.isChecked, onChange: this.handleChange});
            return React.createElement("li", null, React.createElement("label", null, input, this.props.module.name));
        }
    });

    var Domain = React.createClass({displayName: "Domain",
        render: function() {
            var modules = this.props.domain.modules.map(function(module, i) {
                return React.createElement(Module, {key: i, module: module, addChoice: this.props.addChoice, removeChoice: this.props.removeChoice});
            }.bind(this));

            return React.createElement("li", null, React.createElement("span", null, this.props.domain.name), React.createElement("ul", {class: "modules"}, modules));
        }
    });

    var ModuleForm = React.createClass({displayName: "ModuleForm",
        render: function() {
            var domains = this.props.domains.map(function(domain, i) {
                return React.createElement(Domain, {key: i, domain: domain, addChoice: this.props.addChoice, removeChoice: this.props.removeChoice});
            }.bind(this));

            return React.createElement("ul", {class: "domains"}, domains);
        }
    });

    var PathForm = React.createClass({displayName: "PathForm",
        fetchDomainsFromServer: function() {
            getDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        sortChoices: function(a, b) {
            return (+a.domain.substr(1) + +a.id.substr(1)) - (+b.domain.substr(1) + +b.id.substr(1));
        },
        addChoice: function(choice) {
            this.setState({
                choices: this.state.choices.concat(choice)
            });
        },
        removeChoice: function(choice) {
            this.setState({
                choices: this.state.choices.filter(function(o) { return o.id != choice.id; })
            });
        },
        handleSort: function() {
            this.setState({
                choices: this.state.choices.sort(this.sortChoices)
            });
        },
        handleClear: function() {
            this.setState({ choices: [] });
        },
        handleSubmit: function() {
            console.log("Submit", this.state.choices);
        },
        getInitialState: function() {
            return {
                domains: [],
                choices: []
            };
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
        },
        render: function() {
            return (
                React.createElement("div", {id: "path-form"}, 
                    React.createElement(ModuleForm, {domains: this.state.domains, addChoice: this.addChoice.bind(this), removeChoice: this.removeChoice.bind(this)}), 
                    React.createElement(ModuleChoices, {choices: this.state.choices}), 
                    React.createElement("button", {type: "button", onClick: this.handleSubmit}, "Submit"), 
                    React.createElement("button", {type: "button", onClick: this.handleSort}, "Sort"), 
                    React.createElement("button", {type: "button", onClick: this.handleClear}, "Clear")
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
