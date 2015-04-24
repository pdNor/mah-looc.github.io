"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        User = {};

    // TODO check localStorage

    // if (Storage.getItem("domains")) {
    //     Domains.items = JSON.parse(Storage.getItem("domains"));
    // } else {
    //     Http.get("/search.json")
    //         .then(function(response) {
    //             Domains.items = response.domains;
    //             Storage.setItem("domains", JSON.stringify(response.domains));
    //         });
    // }

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

    var ModuleItem = React.createClass({displayName: "ModuleItem",
        getInitialState: function() {
            return { isChecked: false };
        },
        handleChange: function() {
            this.setState({ isChecked: !this.state.isChecked });
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
            });

            return (
                React.createElement("li", null, 
                    React.createElement("span", null, this.props.domain.name), 
                    React.createElement("ul", null, modules)
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

            return React.createElement("ul", null, domains);
        }
    });

    React.render(
        React.createElement(DomainForm, null),
        document.getElementById("domains")
    );

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);

    }, false);

})(window, document);
