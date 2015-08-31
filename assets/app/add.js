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

    // TODO: temporary solution
    var isLocal = Location.hostname == "localhost" || Location.hostname == "127.0.0.1";

    var Endpoints = {
        // Production
        addPath: isLocal ? "http://0.0.0.0:3000/api/add" : "http://178.62.76.67/api/add"
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
    // if (Cache.user) console.log("User object:", Cache.user);

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
    var Message = React.createClass({
        render: function() {
            return <p className={this.props.message ? "info" : ""}>{this.props.message}</p>;
        }
    });

    var Form = React.createClass({
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
                        <span>
                            Vägen är nu tillagd till din användare! Använd koden <code>{res.user.code}</code> för
                            att logga in. Du kan nu gå vidare till din <a href="/path/profile.html">profil</a> för
                            att påbörja din väg.
                        </span>
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
                <form>
                    <input type="text" onChange={this.handleInputChange} placeholder="Användarkod eller Epost" />
                    <button type="button" onClick={this.handleSubmit}>Skicka</button>
                </form>
            );
        }
    });

    // Main component with all the data
    var AddPathForm = React.createClass({
        getInitialState: function() {
            return { message: "" };
        },
        setMessage: function(msg) {
            this.setState({ message: msg });
        },
        render: function() {
            // No hash was found in the URL
            if (!this.props.hash) {
                return <Message message="Den länkadress som används till denna sidan är inkorrekt." />;
            }

            return (
                <div>
                    <h3>Registrera en befintlig väg</h3>
                    <p className="intro">
                        Nedan kan du fylla i din användarkod för att registrera vägen
                        till din användare. Om du är en ny användare kan du fylla i
                        din epost istället för att registrera dig.
                    </p>
                    <Message message={this.state.message} />
                    <Form hash={this.props.hash} setMessage={this.setMessage} />
                </div>
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
            <AddPathForm hash={hash}/>,
            document.getElementById("add-path-container")
        );

    }, false);

// Invoke anonymous function
})(window, document);
