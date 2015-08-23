// Don't clutter global namespace
(function(window, document) {
    // Strict mode
    "use strict";

    // Dependencies
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage,
        Location = window.location,
        Cache;

    var Endpoints = {
        // Production
        addPath: "http://178.62.76.67/api/add"
        // LOCAL
        // addPath: "http://0.0.0.0:3000/api/add"
    };

    // TODO: check if localStorage exists
    // Setup cache
    if (Storage.getItem("_mah-looc-data")) {
        Cache = JSON.parse(Storage.getItem("_mah-looc-data"));
    } else {
        Cache = { user: null, domains: null, quizAnswers: null, lastUpdated: null };
    }

    function updateStorage(c) {
        Storage.setItem("_mah-looc-data", JSON.stringify(c));
    }

    // DEBUG
    if (Cache.user) console.log("User object:", Cache.user);

    // Source: http://stackoverflow.com/a/2880929
    function getParams(query) {
        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            urlParams = {};

        while ((match = search.exec(query))) {
            urlParams[decode(match[1])] = decode(match[2]);
        }

        return urlParams;
    }
    
    // Hash generated form path of modules from the URL
    var hash = getParams(Location.search.substring(1)).hash || "";

    // Component for information messages
    var Message = React.createClass({displayName: "Message",
        render: function() {
            return React.createElement("p", {className: this.props.message ? "info" : ""}, this.props.message);
        }
    });

    var Form = React.createClass({displayName: "Form",
        getInitialState: function() {
            return { input: "", done: false };
        },
        handleInputChange: function(e) {
            this.setState({ input: e.target.value });
        },
        handleSubmit: function() {
            // Cancel form submissions when done
            if (this.state.done) {
                return;
            }

            // No code or email was submitted
            if (!this.state.input) {
                this.props.setMessage("Vänligen fyll i en användarkod eller en epost.");
                return;
            }

            var payload = { hash: this.props.hash };

            // Basic check if it contains 6 numbers
            if (this.state.input.length == 6 && !isNaN(+this.state.input)) {
                payload.code = this.state.input;
            // Otherwise just check for an @ sign
            } else if (this.state.input.indexOf("@") !== -1) {
                payload.email = this.state.input;
            }

            // Send request for adding path to the user (or new user)
            Http.post(Endpoints.addPath, payload, { dataType: "json" })
                .then(function(res) { return JSON.parse(res); })
                .then(function(res) {
                    Cache.user = res.user;
                    updateStorage(Cache);
                    this.setState({ done: true });
                    this.props.setMessage(
                        React.createElement("span", null, 
                            "Vägen är nu tillagd till din användare! Använd koden ", React.createElement("code", null, res.user.code), " för" + ' ' +
                            "att logga in. Du kan nu gå vidare till din ", React.createElement("a", {href: "/path/profile.html"}, "profil"), " för" + ' ' +
                            "att påbörja din väg."
                        )
                    );
                }.bind(this))
                .catch(function() {
                    this.setState({ done: false });
                    this.props.setMessage("Ett fel uppstod! Vänligen kontrollera användarkod, epost eller den länkadress du använt.");
                }.bind(this));

            return;
        },
        render: function() {
            return (
                React.createElement("form", null, 
                    React.createElement("input", {type: "text", onChange: this.handleInputChange, placeholder: "Användarkod eller Epost"}), 
                    React.createElement("button", {type: "button", onClick: this.handleSubmit}, "Skicka")
                )
            );
        }
    });

    // Main component with all the data
    var AddPathForm = React.createClass({displayName: "AddPathForm",
        getInitialState: function() {
            return { message: "" };
        },
        setMessage: function(msg) {
            this.setState({ message: msg });
        },
        render: function() {
            // No hash was found in the URL
            if (!this.props.hash) {
                return React.createElement(Message, {message: "Den länkadress som används till denna sidan är inkorrekt."});
            }

            return (
                React.createElement("div", null, 
                    React.createElement("h3", null, "Registrera en befintlig väg"), 
                    React.createElement("p", {className: "intro"}, 
                        "Nedan kan du fylla i din användarkod för att registrera vägen" + ' ' +
                        "till din användare. Om du är en ny användare kan du fylla i" + ' ' +
                        "din epost istället för att registrera dig."
                    ), 
                    React.createElement(Message, {message: this.state.message}), 
                    React.createElement(Form, {hash: this.props.hash, setMessage: this.setMessage})
                )
            );
        }
    });

    // TODO: prefetch the path (from the hash) and show it? so the user can confirm

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);
        // Render main component to DOM
        React.render(
            React.createElement(AddPathForm, {hash: hash}),
            document.getElementById("add-path-container")
        );

    }, false);
// Invoke anonymous function
})(window, document);
