"use strict";

// Don't clutter global namespace
(function(window, document) {
    var React = window.React,
        Http = window.qwest,
        Storage = window.localStorage;

    var User = Storage.getItem("user") ? Storage.getItem("user") : {};

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

    var Path = React.createClass({displayName: "Path",
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

    // var Module = React.createClass({
    //     getInitialState: function() {
    //         return { isChecked: false };
    //     },
    //     handleChange: function() {
    //         console.log("changed", this);
    //         // this.props.onChange(this);
    //         // var isChecked = this.refs.module.getDOMNode().checked;

    //         if (React.findDOMNode(this.refs.module).checked) {
    //             this.props.addChoice(this.props.module);
    //         } else {
    //             this.props.removeChoice(this.props.module);
    //         }
    //     },
    //     render: function() {
    //         var input = <input type="checkbox" ref="module" onChange={this.handleChange} />;
    //         return <li><label>{input}{this.props.module.name}</label></li>;
    //     }
    // });

    // var Domain = React.createClass({
    //     getInitialState: function() {
    //         return { choices: [] };
    //     },
    //     handleModuleSelection: function(m) {
    //         if (React.findDOMNode(m.refs.module).checked) {
    //             m.props.addChoice(m.props.module);
    //         } else {
    //             m.props.removeChoice(m.props.module);
    //         }
    //     },
    //     handleClick: function(modules) {
    //         return function() {
    //             console.log(modules);
    //             modules[0].props.onChange();
    //         };
    //     },
    //     render: function() {
    //         var modules = this.props.domain.modules.map(function(module, i) {
    //             return <Module key={i} module={module} addChoice={this.props.addChoice} removeChoice={this.props.removeChoice} />;
    //         }.bind(this));

    //         return <li><span onClick={this.handleClick(modules)}>{this.props.domain.name}</span><ul class="modules">{modules}</ul></li>;
    //     }
    // });

    // var Domain = React.createClass({
    //     getInitialState: function() {
    //         return {
    //             choices: []
    //         };
    //     },
    //     handleModuleSelection: function() {

    //     },
    //     render: function() {
    //         var modules = this.props.domain.modules.map(function(module, i) {
    //             return (
    //                     <li>
    //                     <label><input type="checkbox"
    //             );
    //         }.bind(this));
    //     }
    // });

    var Domain = React.createClass({displayName: "Domain",
        getModules: function() {
            var m = [];

            for (var ref in this.refs) {
                m.push(this.refs[ref]);
            }

            return m;
        },
        getModuleNode: function(id) {
            return React.findDOMNode(this.refs[id]);
        },
        handleModuleSelection: function(module) {
            return function() {
                var node = this.getModuleNode(module.id);

                if (node.checked) {
                    this.props.addChoice(module);
                } else {
                    this.props.removeChoice(module);
                }
            }.bind(this);
        },
        handleDomainSelection: function() {
            console.log(this);

            var modules = this.getModules(),
                allChecked = modules.every(function(m) {
                    return React.findDOMNode(m).checked;
                });

            console.log("all checked?", allChecked);

            if (allChecked) {
                modules.forEach(function(module) {
                    var node = React.findDOMNode(module);
                    node.checked = false;
                    this.props.removeChoice(module.props.module);
                }, this);
            } else {
                modules.forEach(function(module) {
                    console.log("all is not checked, iterating");
                    console.log(module);
                    var node = React.findDOMNode(module);

                    if (!node.checked) {
                        console.log("is not checked");
                        node.checked = true;
                        this.props.addChoice(module.props.module);
                    }
                }, this);
            }

            // for (var ref in this.refs) {
            //     var node = React.findDOMNode(this.refs[ref]);
            //     node.checked = !node.checked;
            // }
        },
        render: function() {
            var modules = this.props.domain.modules.map(function(module) {
                return React.createElement("li", null, React.createElement("label", null, React.createElement("input", {type: "checkbox", ref: module.id, module: module, onChange: this.handleModuleSelection(module)}), " ", module.name));
            }.bind(this));

            return (
                React.createElement("li", null, 
                    React.createElement("span", {onClick: this.handleDomainSelection}, this.props.domain.name), React.createElement("ul", {class: "modules"}, modules)
                )
            );
        }
    });
    
    // var Domain = React.createClass({
    //     handleModuleSelection: function(module) {
    //         return function() {
                
    //         };
    //     },
    //     handleDomainSelection: function() {

    //     },
    //     render: function() {
    //         var modules = this.props.domain.modules.map(function(module) {
    //             module.checked = false;
    //             return (
    //                 <li>
    //                     <label>
    //                         <input type="checkbox" checked={module.checked} onChange={this.handleModuleSelection(module)} /> {module.name}
    //                     </label>
    //                 </li>
    //             );
    //         }.bind(this));

    //         return (
    //             <li>
    //                 <span><input type="checkbox" onChange={this.handleDomainSelection} />{this.props.domain.name}</span>
    //                 <ul class="modules">{modules}</ul>
    //             </li>
    //         );
    //     }
    // });

    var Domains = React.createClass({displayName: "Domains",
        render: function() {
            var domains = this.props.domains.map(function(domain, i) {
                return React.createElement(Domain, {key: i, domain: domain, addChoice: this.props.addChoice, removeChoice: this.props.removeChoice});
            }.bind(this));

            return React.createElement("ul", {class: "domains"}, domains);
        }
    });

    var CreatePath = React.createClass({displayName: "CreatePath",
        getInitialState: function() {
            return {
                email: "",
                message: ""
            };
        },
        handleSubmit: function() {
            if (!this.state.email.length || !this.props.choices.length) {
                this.setState({ message: "Välj moduler och fyll i en email." });
                return;
            }

            this.setState({ message: "Loading." });

            var payload = {
                email: this.state.email,
                path: { choices: this.props.choices }
            };

            Http.post("http://0.0.0.0:3000/api/paths", payload, { dataType: "json" })
                .then(function(response) {
                    console.log("resp", response);
                    // spara användarinformation i Storage
                    // skicka vidare användaren till overview sidan
                    this.setState({ message: "" });
                }.bind(this))
                .catch(function(err, url) {
                    console.log("err", err, url);

                    this.setState({ message: "error." });
                }.bind(this));
        },
        handleChange: function(e) {
            this.setState({ email: e.target.value });
        },
        render: function() {
            return (
                React.createElement("div", {class: "create-path"}, 
                    React.createElement("p", null, "Msg: ", this.state.message), 
                    React.createElement("input", {type: "text", value: this.state.email, onChange: this.handleChange}), 
                    React.createElement("button", {type: "button", onClick: this.handleSubmit}, "Submit")
                )
            );
        }
    });

    var PathForm = React.createClass({displayName: "PathForm",
        getInitialState: function() {
            return {
                domains: [],
                choices: []
            };
        },
        fetchDomainsFromServer: function() {
            getDomains(function(domains) {
                this.setState({ domains: domains });
            }.bind(this));
        },
        componentDidMount: function() {
            this.fetchDomainsFromServer();
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
                choices: this.state.choices.sort(function(a, b) {
                    // Sort by domain ID + module ID
                    return (+a.domain.substr(1) + +a.id.substr(1)) - (+b.domain.substr(1) + +b.id.substr(1));
                })
            });
        },
        handleClear: function(e) {
            this.setState({ choices: [] });
        },
        render: function() {
            return (
                React.createElement("form", {id: "path-form"}, 
                    React.createElement(Domains, {domains: this.state.domains, addChoice: this.addChoice.bind(this), removeChoice: this.removeChoice.bind(this)}), 
                    React.createElement(Path, {choices: this.state.choices}), 
                    React.createElement(CreatePath, {choices: this.state.choices}), 
                    React.createElement("button", {type: "button", onClick: this.handleSort}, "Sort"), 
                    React.createElement("button", {type: "reset", onClick: this.handleClear}, "Clear")
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
