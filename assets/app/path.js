"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage;

    var Endpoints = {
        createPath: "http://0.0.0.0:3000/api/paths"
    };

    // If a user doesnt exist it will be set to "null"
    var User = JSON.parse(Storage.getItem("user"));

    // DEBUG
    if (User) console.log("User object: ", User);

    // TODO: check if localStorage exists

    // Fetches all domains from the server and caches them
    // TODO: how long should these be cached?
    function getDomains(cb) {
        if (Storage.getItem("domains")) {
            cb(JSON.parse(Storage.getItem("domains")));
        } else {
            Http.get("/search.json")
                .then(function(response) {
                    Storage.setItem("domains", JSON.stringify(response.domains));
                    cb(response.domains);
                });
        }
    }

    // Sort all modules
    var SortButton = React.createClass({
        sortChoices: function() {
            this.props.sortChoices();
        },
        render: function() {
            return <button type="button" onClick={this.sortChoices}>Sortera</button>;
        }
    });

    // Clear all chosen modules
    var ClearButton = React.createClass({
        clearChoices: function() {
            this.props.clearChoices();
        },
        render: function() {
            return <button type="reset" onClick={this.clearChoices}>Rensa</button>;
        }
    });

    // Chosen path of modules
    var Path = React.createClass({
        render: function() {
            var choices = this.props.choices.map(function(choice, i) {
                return <ModuleChoice
                        key={i}
                        module={choice}
                        removeChoice={this.props.removeChoice} />;
            }, this);

            return (
                <div>
                    <ol class="choices">{choices}</ol>
                    <SortButton sortChoices={this.props.sortChoices} />
                    <ClearButton clearChoices={this.props.clearChoices} />
                </div>
            );
        }
    });

    // A module choice
    var ModuleChoice = React.createClass({
        removeChoice: function() {
            this.props.removeChoice(this.props.module);
        },
        render: function() {
            return <li onClick={this.removeChoice}>{this.props.module.domain}: {this.props.module.name}</li>;
        }
    });

    // A Domain of modules
    var Domain = React.createClass({
        // Select one module
        handleModuleSelection: function(module) {
            return function() {
                if (React.findDOMNode(this.refs[module.id]).checked) {
                    this.props.addChoice(module);
                } else {
                    this.props.removeChoice(module);
                }
            }.bind(this);
        },
        // Select all modules from a domain
        handleDomainSelection: function() {
            // Convert all component references to an array
            var refs = Object.keys(this.refs).map(function(k) { return this.refs[k]; }, this);
            // Check if all checkboxes have been checked
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
                    <li>
                        <label>
                            <input type="checkbox" ref={module.id} module={module} onChange={this.handleModuleSelection(module)} />
                            {module.name}
                        </label>
                    </li>
                );
            }, this);

            return (
                <li>
                    <span onClick={this.handleDomainSelection}>{this.props.domain.name}</span>
                    <ul class="modules">{modules}</ul>
                </li>
            );
        }
    });
    
    // A list of all Domains
    var Domains = React.createClass({
        render: function() {
            var domains = this.props.domains.map(function(domain, i) {
                return <Domain
                        key={i}
                        domain={domain}
                        addChoice={this.props.addChoice}
                        removeChoice={this.props.removeChoice} />;
            }, this);

            return <ul class="domains">{domains}</ul>;
        }
    });

    // Info message from submitting the form
    var Message = React.createClass({
        render: function() {
            return <p className={"message " + this.props.msg.type} onClick={this.props.clickHandler}>{this.props.msg.text}</p>;
        }
    });

    // User input field
    var Input = React.createClass({
        render: function() {
            var input;

            if (this.props.verify) {
                input = (
                    <div>
                        <label>Code <input type="text" onChange={this.props.handleCodeChange} /></label>
                        <button type="button" onClick={this.props.handleCancel}>Avbryt</button>
                    </div>
                );
            } else {
                input = <label>Email <input type="text" onChange={this.props.handleEmailChange} /></label>;
            }

            return input;
        }
    });

    // Form for creating a path
    var CreatePath = React.createClass({
        getInitialState: function() {
            return {
                verify: false,
                email: "",
                code: "",
                msg: {
                    text: "",
                    type: "",
                    show: false
                }
            };
        },
        handleSubmit: function() {
            // "minimum" tillåtna antal val?
            if (this.state.verify && !this.state.code.length) {
                this.setState({
                    msg: {
                        text: "Fyll i en användarkod",
                        type: "info",
                        show: true
                    }
                });
                return;
            } else if (!this.state.email.length || !this.props.choices.length) {
                this.setState({
                    msg: {
                        text: "Välj moduler och fyll i en email.",
                        type: "info",
                        show: true
                    }
                });
                return;
            }

            this.setState({
                msg: {
                    text: "Loading",
                    type: "info",
                    show: true
                }
            });

            // Data sent to the server
            var payload = {
                email: this.state.email,
                path: { choices: this.props.choices }
            };

            // Send user code if a user is already active
            if (User) {
                payload.code = User.code;
            // Otherwise get it from the input field
            } else if (this.state.verify) {
                payload.code = this.state.code;
            }

            var self = this;

            Http.post(Endpoints.createPath, payload, { dataType: "json" })
                .then(function(res) { return JSON.parse(res); })
                .then(function(res) {
                    console.log("Response", res);
                    
                    if ("exists" in res && res.exists) {
                        console.log("User exists");

                        self.setState({
                            verify: true,
                            msg: {
                                text: "User exists - authenticate with code",
                                type: "info",
                                show: true
                            }
                        });
                    } else {
                        console.log("Success", res);

                        Storage.setItem("user", JSON.stringify(res.user));
                        // redirect
                        // location.pathname = "/domains/overview.html";
                        
                        self.setState({
                            verify: false,
                            msg: {
                                text: "Path and successfully created!",
                                type: "success",
                                show: true
                            }
                        });

                        // Visa länken som är delbar?
                        // Visa en "Nästa/Overview" knapp?
                    }
                })
                .catch(function(err, url) {
                    console.log("Error", err, url);
                    // this.responseText

                    self.setState({
                        verify: false,
                        msg: {
                            text: "An error occurred :(",
                            type: "error",
                            show: true
                        }
                    });
                });
        },
        handleEmailChange: function(e) {
            this.setState({ email: e.target.value });
        },
        handleCodeChange: function(e) {
            this.setState({ code: e.target.value });
        },
        handleCancel: function(e) {
            this.setState({
                verify: false,
                email: "",
                code: "",
                msg: { show: false }
            });
        },
        hideMessage: function() {
            this.setState({ msg: { show: false }});
        },
        render: function() {
            var message = this.state.msg.show ? <Message msg={this.state.msg} clickHandler={this.hideMessage} /> : "";

            return (
                <div>
                    {message}
                    <Input verify={this.state.verify} handleCodeChange={this.handleCodeChange} handleEmailChange={this.handleEmailChange} handleCancel={this.handleCancel} />
                    <button type="button" onClick={this.handleSubmit}>Submit</button>
                </div>
            );
        }
    });

    // Main component with all the data
    var PathForm = React.createClass({
        getInitialState: function() {
            return { domains: [], choices: [] };
        },
        fetchDomainsFromServer: function() {
            // Fetch all domains (these will be cached in localStorage)
            getDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
        },
        addChoice: function(choice) {
            // Add one or more choices
            this.setState({ choices: this.state.choices.concat(choice) });
        },
        removeChoice: function(choice) {
            // Remove one or more module choices
            this.setState({
                choices: this.state.choices.filter(function(o) {
                    return ("indexOf" in choice) ? (choice.indexOf(o.id) == -1) : (o.id != choice.id);
                })
            });
        },
        sortChoices: function() {
            // Sort choices by domain id + module id 
            this.setState({
                choices: this.state.choices.sort(function(a, b) {
                    return (+a.domain.substr(1) + +a.id.substr(1)) - (+b.domain.substr(1) + +b.id.substr(1));
                })
            });
        },
        clearChoices: function(e) {
            // Clear all choices
            this.setState({ choices: [] });
        },
        render: function() {
            return (
                <form>
                    <Domains
                        domains={this.state.domains}
                        addChoice={this.addChoice}
                        removeChoice={this.removeChoice} />

                    <Path
                        choices={this.state.choices}
                        removeChoice={this.removeChoice}
                        sortChoices={this.sortChoices}
                        clearChoices={this.clearChoices} />

                    <CreatePath choices={this.state.choices} />
                </form>
            );
        }
    });


    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);

        React.render(
            <PathForm />,
            document.getElementById("path-container")
        );

    }, false);

})(window, document);
