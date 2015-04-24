"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        Domains = { items: [] },
        User = {};

    // TODO check localStorage

    if (Storage.getItem("domains")) {
        Domains.items = JSON.parse(Storage.getItem("domains"));
    } else {
        Http.get("/search.json")
            .then(function(response) {
                Domains.items = response;
                Storage.setItem("domains", JSON.stringify(response));
            });
    }

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
        getInitialState: function() {
            return { domains: Domains.items };
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
