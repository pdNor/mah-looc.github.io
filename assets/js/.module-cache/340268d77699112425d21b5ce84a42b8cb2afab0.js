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

    // arr.map(function(o) { return o.attr; }).indexOf("value");

    var PathForm = React.createClass({displayName: "PathForm",
        fetchDomainsFromServer: function() {
            getDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        addChoice: function(choice) {
        },
        removeChoice: function(choice) {

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
                    React.createElement(ModuleChoices, {choices: this.state.choices})
                )
            );
        }
    });

    var ModuleForm = React.createClass({displayName: "ModuleForm",
        render: function() {
        }
    });

    var Domain = React.createClass({displayName: "Domain",
        render: function() {
        }
    });

    var Module = React.createClass({displayName: "Module",
        render: function() {
        }
    });

    var ModuleChoices = React.createClass({displayName: "ModuleChoices",
        render: function() {
        }
    });

    var ModuleChoice = React.createClass({displayName: "ModuleChoice",
        render: function() {
        }
    });

    
    
    var DomainChoices = React.createClass({displayName: "DomainChoices",
        getInitialState: function() {
            return { choices: [] };
        },
        addModule: function(module) {
            console.log(module);
        },
        removeModule: function(module) {
            console.log(module);
        },
        render: function() {
            var modules = this.state.choices.map(function(module) {
                return React.createElement("li", null, module.name);
            });

            return React.createElement("ul", null, modules);
        }
    });

    var ModuleItem = React.createClass({displayName: "ModuleItem",
        getInitialState: function() {
            return { isChecked: false };
        },
        handleChange: function() {
            var isChecked = !this.state.isChecked;
            this.setState({ isChecked: isChecked });

            if (isChecked) {
                DomainChoices.addModule(this.props.module);
            } else {
                DomainChoices.removeModule(this.props.module);
            }
            
        },
        render: function() {
            var label = React.createElement("input", {type: "checkbox", checked: this.state.isChecked, onChange: this.handleChange});

            return React.createElement("li", null, React.createElement("label", null, label, this.props.module.name));
        }
    });

    var DomainItem = React.createClass({displayName: "DomainItem",
        render: function() {
            var modules = this.props.domain.modules.map(function(module) {
                return React.createElement(ModuleItem, {key: module.id, domain: this.props.domain, module: module});
            }.bind(this));

            return (
                React.createElement("li", null, 
                    React.createElement("span", null, this.props.domain.name), 
                    React.createElement("ul", {class: "module-list"}, modules)
                )
            );
        }
    });

    var DomainForm = React.createClass({displayName: "DomainForm",
        fetchDomainsFromServer: function() {
            getDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        getInitialState: function() {
            return { domains: [] };
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
        },
        render: function() {
            var domains = this.state.domains.map(function(domain) {
                return React.createElement(DomainItem, {key: domain.id, domain: domain});
            });

            return React.createElement("ul", {class: "domain-list"}, domains);
        }
    });


    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);

        React.render(
            React.createElement(DomainForm, null),
            document.getElementById("domains")
        );

        React.render(
            React.createElement(DomainChoices, null),
            document.getElementById("domain-choices")
        );

    }, false);

})(window, document);
