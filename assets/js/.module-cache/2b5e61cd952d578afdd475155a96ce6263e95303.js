"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        Domains = { items: [] },
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


    console.log(Domains);

    var ModuleItem = React.createClass({displayName: "ModuleItem",
        render: function() {
            return (
                React.createElement("li", null, 
                    React.createElement("input", {type: "checkbox"}), this.props.data.name
                )
            )
        }
    });

    var DomainList = React.createClass({displayName: "DomainList",
        render: function() {
            return (
                React.createElement("li", null, 
                    React.createElement("span", null, this.props.data.name), 
                    React.createElement("ul", null, 
                    this.props.data.modules.map(function(module) {
                        return React.createElement(ModuleItem, {key: module.id, data: module});
                    })
                    )
                )
            );
        }
    });

    var DomainForm = React.createClass({displayName: "DomainForm",
        fetchDomainsFromServer: function() {
            if (Storage.getItem("domains")) {
                Domains.items = JSON.parse(Storage.getItem("domains"));
                this.setState({ domains: Domains.items });
            } else {
                Http.get("/search.json")
                    .then(function(response) {
                        Domains.items = response.domains;
                        Storage.setItem("domains", JSON.stringify(response.domains));
                        this.setState({ domains: Domains.items });
                    }.bind(this));
            }
        },
        getInitialState: function() {
            return { domains: [] };
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
        },
        render: function() {
            return (
                React.createElement("ul", null, 
                this.state.domains.map(function(domain) {
                    return React.createElement(DomainList, {key: domain.id, data: domain});
                })
                )
            );
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
