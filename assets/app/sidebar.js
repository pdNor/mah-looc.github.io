"use strict";

// Don't clutter global namespace
(function(window, document) {
    // Dependencies
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage;

    var Endpoints = {};

    // TODO: check if localStorage exists
    
    // If a user doesnt exist it will be set to "null"
    var User = JSON.parse(Storage.getItem("user"));

    // DEBUG
    if (User) console.log("User object: ", User);

    // Fetches all domains from the server and caches them
    // TODO: how long should these be cached?
    function getDomains(cb) {
        if (Storage.getItem("domains")) {
            cb(JSON.parse(Storage.getItem("domains")));
        } else {
            Http.get(Endpoints.domains)
                .then(function(response) {
                    Storage.setItem("domains", JSON.stringify(response.domains));
                    cb(response.domains);
                });
        }
    }

    var Module = React.createClass({
        render: function() {
            var done = this.props.module.done ? "done" : "";
            
            // TODO: get the module id, needs to be stored on the server aswell?
            return (
                <li className={done}>
                    <a href={"/domains/" + this.props.module.domain + "/modules/M1.html"}>{this.props.module.name}</a>
                </li>
            );
        }
    });

    var Modules = React.createClass({
        render: function() {
            var modules = this.props.path.modules.map(function(module) {
                return <Module module={module} />;
            });

            return <ul className="modules">{modules}</ul>;
        }
    });

    var Sidebar = React.createClass({
        getInitialState: function() {
            return {
                active: false,
                user: {},
                domains: []
            };
        },
        fetchDomainsFromServer: function() {
            // Fetch all domains (these will be cached in localStorage)
            getDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        fetchUserFromServer: function() {
            this.setState({ user: User });
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
            this.fetchUserFromServer();
        },
        render: function() {
            var modules = "paths" in this.state.user ? <Modules path={this.state.user.paths[0]} /> : "Log in";

            return <div>{modules}</div>;
        }
    });


    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);
        // Render main component to DOM
        React.render(
            <Sidebar />,
            document.getElementById("app-sidebar")
        );

    }, false);

// Invoke anonymous function
})(window, document);
