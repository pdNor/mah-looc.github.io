import ENDPOINTS from "../endpoints.js";
import Cache from "../cache.js";
import PubSub from "pubsub-js";
import { toArray } from "../helpers.js";

// Global dependencies
let React = window.React,
    Http = window.qwest;

// Message constants
const MESSAGE = {
    INFO_NO_MODULE: "Ingen modul vald",
    INFO_REG_DOMAIN: "Välj moduler från listan nedan som ska ingå i din egen väg. Till vänster visas dina val och längst ner på sidan kan du registrera dig.",
    INFO_LOADING: "Vänligen vänta...",
    ERR_NO_CODE: "Fyll i en användarkod",
    ERR_NO_EMAIL: "Välj moduler och fyll i en email",
    ERR_USER_EXISTS: "Eposten är redan registrerad, vänligen fyll i användarkoden istället eller välj avbryt för att börja om",
    ERR_REQUEST: "Ett fel uppstod, vänligen försök igen"
};

// Button for sorting all the choices
class SortButton extends React.Component {
    render() {
        return <button type="button" onClick={this.props.sortChoices}>Sortera</button>;
    }
}

// Button for clearing all choices
class ClearButton extends React.Component {
    render() {
        return <button type="reset" onClick={this.props.clearChoices}>Rensa</button>;
    }
}

// Helper function for rendering a module choice
function renderModuleChoice(k, m, d) {
    return <ModuleChoice key={k} module={m} domain={d} />;
}

// Path (list) of modules (choices)
class Path extends React.Component {
    constructor(props) {
        super(props);
        // Re-bind methods
        this.getDomainById = this.getDomainById.bind(this);
    }
    // Return domain based on id
    getDomainById(id) {
        return this.props.domains.filter(d => d.id == id)[0];
    }

    render() {
        return (
            <div className="path">
                <h5>Din väg</h5>
                <ol className="choices">
                    {this.props.choices.length
                     ? this.props.choices.map((c, i) => renderModuleChoice(i, c, this.getDomainById(c.domain)))
                     : <li>{MESSAGE.INFO_NO_MODULE}</li>}
                </ol>
                <SortButton sortChoices={this.props.sortChoices} />
                <ClearButton clearChoices={this.props.clearChoices} />
            </div>
        );
    }
}

// A module choice from a user
class ModuleChoice extends React.Component {
    render() {
        let href = "/domains/" + this.props.module.domain + "/modules/" + this.props.module.mid + ".html";

        return (
            <li className="choice">
                <a href={href}>{this.props.module.name}</a>
            </li>
        );
    }
}

// Helper function for rendering a domain
function renderDomain(k, d, add, remove) {
    return <Domain key={k} domain={d} addChoice={add} removeChoice={remove} />;
}

// List of available modules from domains
class Domains extends React.Component {
    render() {
        return (
            <div>
                <p className="domains-info">{MESSAGE.INFO_REG_DOMAIN}</p>
                <ul className="domains">
                    {this.props.domains.map((d, i) => renderDomain(i, d, this.props.addChoice, this.props.removeChoice))}
                </ul>
            </div>
        );
    }
}

// Helper function for rendering a module
function renderModule(m, add, remove) {
    return <Module module={m} addChoice={add} removeChoice={remove} />;
}

// A module within a domain
class Module extends React.Component {
    constructor(props) {
        super(props);
        // Re-bind methods
        this.handleChange = this.handleChange.bind(this);
    }
    // Listen to events for toggling all module choices
    componentDidMount() {
        let node = React.findDOMNode(this.refs.input);
        
        PubSub.subscribe("domain.toggle.add", (msg, data) => {
            if (!node.checked && this.props.module.domain == data.domain) {
                node.checked = true;
                this.props.addChoice(this.props.module);
            }
        });

        PubSub.subscribe("domain.toggle.remove", (msg, data) => {
            if (node.checked && this.props.module.domain == data.domain) {
                node.checked = false;
                this.props.removeChoice(this.props.module)
            }
        });
    }

    handleChange() {
        let node = React.findDOMNode(this.refs.input);

        if (node.checked) {
            this.props.addChoice(this.props.module);
        } else {
            this.props.removeChoice(this.props.module);
        }
    }

    render() {
        return (
            <li className="module">
                <label>
                    <input type="checkbox" ref="input" onChange={this.handleChange} />
                    {this.props.module.name}
                </label>
            </li>
        );
    }
}

// A single domain
class Domain extends React.Component {
    constructor(props) {
        super(props);
        this.state = { toggle: "expand" };
        // Re-bind methods
        this.handleDomainSelection = this.handleDomainSelection.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    handleDomainSelection() {
        // React DOM reference
        let ul = React.findDOMNode(this.refs.modules);
        // Go through all and see if they're checked
        let allChecked = toArray(ul.children)
                .every(li => li.firstChild.firstChild.checked);

        // Publish events for toggling all module choices
        if (allChecked) {
            PubSub.publish("domain.toggle.remove", { domain: this.props.domain.id });
        } else {
            PubSub.publish("domain.toggle.add", { domain: this.props.domain.id });
        }
    }

    toggle() {
        this.setState({ toggle: this.state.toggle ? "" : "expand" });
    }

    render() {
        return (
            <li className={"domain " + this.state.toggle}>
                <span onClick={this.toggle} className="toggle">
                    {this.state.toggle ? "-" : "+"}
                </span>
                <span onClick={this.handleDomainSelection} className="domain-name">
                    {this.props.domain.name}
                </span>
                <ul className="modules" ref="modules">
                    {this.props.domain.modules.map(m => renderModule(m, this.props.addChoice, this.props.removeChoice))}
                </ul>
            </li>
        );
    }
}

// Messages from submitting the form
class InfoMessage extends React.Component {
    render() {
        return <div>{this.props.text ? <p className={"message " + this.props.type}>{this.props.text}</p> : ""}</div>;
    }
}

// Sucessful registration
class RegistrationMessage extends React.Component {
    render() {
        return (
            <div>
                <p className="info">
                    Följande användarkod <code>{this.props.code}</code> används för
                    att logga in, det är därför viktigt att ni sparar denna.
                </p>
                <p className="share">
                    Följande länk kan användas för att dela med dig av
                    din väg <a href={this.props.href}>{this.props.href}</a>.
                </p>
            </div>
        );
    }
}

// Change user input field depending on if its a new user or not
class UserInput extends React.Component {
    render() {
        return (
            <div>
                <h5>Registrera din väg</h5>
                <label>
                    <input
                        key={this.props.userExists ? 1 : 2}
                        onChange={this.props.userExists ? this.props.handleCodeChange : this.props.handleEmailChange}
                        placeholder={this.props.userExists ? "Användarkod" : "Epost"}
                        type="text" />
                </label>
                <button type="button" onClick={this.props.handleSubmit}>Skicka</button>
                <button type="button" onClick={this.props.handleCancel}>Avbryt</button>
            </div>
        );
    }
}

class FormActions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userExists: false,
            success: false,
            email: "",
            code: "",
            message: null
        };
        // Re-bind all methods
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleCodeChange = this.handleCodeChange.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleEmailChange(e) {
        this.setState({ email: e.target.value });
    }

    handleCodeChange(e) {
        this.setState({ code: e.target.value });
    }

    handleCancel() {
        this.setState({
            userExists: false,
            email: "",
            code: "",
            message: null
        });
    }

    handleSubmit() {
        // TODO: min/max amount of module choices?

        // Already successfully submitted the form
        if (this.state.success) {
            return false;
        }
        // Incorrect user code
        if (this.state.userExists && !this.state.code.length) {
            this.setState({
                message: <InfoMessage type="info" text={MESSAGE.ERR_NO_CODE} />
            });
            return false;
        }
        // Empty fields
        if (!this.state.email.length || !this.props.choices.length) {
            this.setState({
                message: <InfoMessage type="info" text={MESSAGE.ERR_NO_EMAIL} />
            });
            return false;
        }
        // Loading..
        this.setState({
            message: <InfoMessage type="info loading" text={MESSAGE.INFO_LOADING} />
        });
        // Data payload to server
        let payload = {
            email: this.state.email,
            path: { choices: this.props.choices }
        };
        // If user exists send code as well
        if (this.state.userExists) {
            payload.code = this.state.code;
        }
        // Send data to server
        Http.post(ENDPOINTS.createPath, payload, { dataType: "json" })
            .then(res => JSON.parse(res))
            .then(res => {
                // User already exists
                if ("exists" in res && res.exists) {
                    this.setState({
                        userExists: true,
                        message: <InfoMessage type="info" text={MESSAGE.ERR_USER_EXISTS} />
                    });
                    return;
                }

                Cache.updateUser(res.user);

                let href = ENDPOINTS.mahLoocAddPath + "?hash=" + res.path.hash;

                this.setState({
                    userExists: false,
                    success: true,
                    message: <RegistrationMessage code={res.user.code} href={href} />
                });
            })
            .catch(e => {
                // DEBUG
                console.log("Request failed:", e);
                this.setState({
                    userExists: false,
                    message: <InfoMessage type="info error" text={MESSAGE.ERR_REQUEST} />
                });
            });
        return true;
    }

    render() {
        if (this.state.succes) {
            return (
                <div className="actions">
                    {this.state.message}
                    <a className="to-profile" href="/path/profile.html">Gå vidare till din profil</a>
                </div>
            );
        }

        return (
            <div className="actions">
                {this.state.message}
                <UserInput
                    userExists={this.state.userExists}
                    handleCodeChange={this.handleCodeChange}
                    handleEmailChange={this.handleEmailChange}
                    handleSubmit={this.handleSubmit}
                    handleCancel={this.handleCancel} />
            </div>
        );
    }
}

// Main component
class CreatePath extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            domains: [],
            choices: []
        }
        // Re-bind all methods
        this.fetchDomains = this.fetchDomains.bind(this);
        this.addChoice = this.addChoice.bind(this);
        this.removeChoice = this.removeChoice.bind(this);
        this.sortChoices = this.sortChoices.bind(this);
        this.clearChoices = this.clearChoices.bind(this);
    }
    // Fetch data
    componentDidMount() {
        this.fetchDomains();
    }
    fetchDomains(d) {
        // TODO: error handling?
        Cache.getDomains(d => this.setState({ domains: d }));
    }
    // Add one or more choices
    addChoice(c) {
        this.setState({ choices: this.state.choices.concat(c) });
    }
    // Remove one or more choices
    removeChoice(c) {
        this.setState({
            choices: this.state.choices.filter(m => {
                return ("indexOf" in c) ? (c.indexOf(m.mid) == -1) : (m.mid != c.mid);
            })
        });
    }
    // Sort choices by domain id + module id
    sortChoices() {
        this.setState({
            choices: this.state.choices.sort((a, b) => {
                let A = +a.domain.substring(1) + +a.mid.substring(1),
                    B = +b.domain.substring(1) + +b.mid.substring(1);
                return A - B;
            })
        });
    }
    // Clear all choices
    clearChoices() {
        this.setState({ choices: [] });
    }

    render() {
        return (
            <form>
                <Path
                    domains={this.state.domains}
                    choices={this.state.choices}
                    sortChoices={this.sortChoices}
                    clearChoices={this.clearChoices} />
                <Domains
                    domains={this.state.domains}
                    addChoice={this.addChoice}
                    removeChoice={this.removeChoice} />
                <FormActions choices={this.state.choices} />
            </form>
        );
    }
}

export default CreatePath;
