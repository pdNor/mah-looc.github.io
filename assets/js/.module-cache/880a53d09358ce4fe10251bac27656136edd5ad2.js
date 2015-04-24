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
            return {
                module: this.props.data,
                isChecked: false
            };
        },
        handleChange: function(event) {
            console.log(event, this.state);
            this.setState({ isChecked: !this.state.isChecked });
        },
        render: function() {
            return React.createElement("li", null, React.createElement("input", {type: "checkbox", checked: this.state.isChecked, value: this.state.module.id, onChange: this.handleChange}), this.state.module.name);
        }
    });

    var DomainItem = React.createClass({displayName: "DomainItem",
        render: function() {
            var modules = this.props.data.modules.map(function(module) {
                return React.createElement(ModuleItem, {key: module.id, data: module});
            });

            return (
                React.createElement("li", null, 
                    React.createElement("span", null, this.props.data.name), 
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
                return React.createElement(DomainItem, {key: domain.id, data: domain});
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
