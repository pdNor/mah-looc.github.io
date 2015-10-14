import PubSub from "pubsub-js";
import Cache from "../cache.js";
import ENDPOINTS from "../endpoints.js";

// Dependencies
let React = window.React,
    Http = window.qwest;

// Message constants
const MESSAGE = {
    ERRCODE: "Inkorrekt användarkod"
};

// Helper function for returning a module
function renderModule(m) {
    return <Module module={m} />;
}

// Login component
class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { message : "" };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        // Get user code from form
        let code = React.findDOMNode(this.refs.code).value;
        // If there is none, exit
        if (!code) {
            return false;
        }
        // Fetch user (from server or cache)
        Cache.getUser(code, user => {
            if (user instanceof Error) {
                this.setState({ message: MESSAGE.ERRCODE });
                return;
            }

            this.props.loginHandler(user);
        })
    }

    render() {
        return (
            <form className="login-form" onSubmit={this.handleSubmit}>
                <p>{this.state.message}</p>
                <input ref="code" type="text" placeholder="Användarkod" />
                <button type="submit">Logga in</button>
            </form>
        );
    }
}

// Logout component
class Logout extends React.Component {
    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }
    // Passed down from parent
    handleLogout() {
        this.props.logoutHandler();
    }

    render() {
        return <button type="submit" className="logout-button" onClick={this.handleLogout}>Logga ut</button>;
    }
}

// Component for a module
class Module extends React.Component {
    render() {
        let href = "/domains/" + this.props.module.domain + "/modules/" + this.props.module.mid + ".html";

        return (
            <li className={this.props.module.done ? "done" : ""}>
                <a href={href}>{this.props.module.name}</a>
            </li>
        );
    }
}

// Container component for all modules
class Modules extends React.Component {
    render() {
        return <ol className="modules">{this.props.path.modules.map(renderModule)}</ol>;
    }
}

// Main component
class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: Cache.user,
            loggedin: Cache.userExists(),
            domains: [],
            visible: true
        };
        // Re-bind methods
        this.fetchDomains = this.fetchDomains.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.toggleVisible = this.toggleVisible.bind(this);
        // Fetch data
        this.fetchDomains();
    }

    fetchDomains() {
        // TODO: error handling?
        Cache.getDomains(d => this.setState({ domains: d }));
    }

    loginUser(u) {
        this.setState({
            user: u,
            loggedin: true
        });

        PubSub.publish("user.login", u);
    }

    logoutUser() {
        this.setState({
            user: null,
            loggedin: false
        });

        // Clear user from the cache
        Cache.updateUser(null);
        PubSub.publish("user.logout", null);
    }
    // Toggles visibility of the sidebar
    toggleVisible() {
        this.setState({ visible: !this.state.visible });
    }

    render() {
        // If the user is not logged in
        if (!this.state.loggedin) {
            return <Login loginHandler={this.loginUser} />;
        }

        // TODO: if more paths can be chosen etc.
        let path = this.state.user.paths ? this.state.user.paths[0] : {};

        return (
            <div className={this.state.visible ? "show" : "hide"}>
                <h5 onClick={this.toggleVisible} className="sidebar-links-header">
                    Min Väg <span className="show-hide">{this.state.visible ? "dölj" : "visa"}</span>
                </h5>
                <Modules path={path} />
                <Logout logoutHandler={this.logoutUser} />
            </div>
        );
    }
}

export default Sidebar;
