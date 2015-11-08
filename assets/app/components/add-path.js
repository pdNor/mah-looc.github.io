import Cache from "../cache.js";
import ENDPOINTS from "../endpoints.js";

// Dependencies
let React = window.React,
    Http = window.qwest;

// Message constants
const MESSAGE = {
    ERRINPUT: "Vänligen fyll i en användarkod eller en epost.",
    ERRHTTP: "Ett fel uppstod! Vänligen kontrollera användarkod, epost eller den länkadress du använt.",
    ERRHASH: "Den länkadress som används till denna sidan är inkorrekt.",
    REGINFO: "Nedan kan du fylla i din användarkod för att registrera vägen till din användare. Om du är en ny användare kan du fylla i din epost istället för att registrera dig."
};

// Success message if the HTTP request was successful
class SuccessMessage extends React.Component {
    render() {
        return (
            <p className="info">
                Vägen är nu tillagd till din användare! Använd koden
                <code>{this.props.code}</code> för att logga in. Du
                kan nu gå vidare till din <a href="/path/profile.html">profil</a> för att påbörja din väg.
            </p>
        );
    }
}

// Information messages
class InfoMessage extends React.Component {
    render() {
        return <p className="info">{this.props.text}</p>;
    }
}

// Form for appending a path to a user (or a new one)
class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",
            submitted: false
        };
        // Re-bind methods
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(e) {
        this.setState({ inputValue: e.target.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        // Form has already been submitted
        if (this.state.submitted) {
            return false;
        }
        // Empty input value
        if (!this.state.inputValue) {
            this.props.setMessage(<InfoMessage text={MESSAGE.ERRINPUT} />);
            return false;
        }
        
        let value = this.state.inputValue,
            payload = { hash: this.props.hash };

        // Basic check if it contains 6 numbers
        if (value.length == 6 && !isNaN(+value)) {
            payload.code = value;
        // Otherwise just check for an @ sign
        } else if (value.indexOf("@") !== -1) {
            payload.email = value;
        } else {
            // No point in continuing?
            return false;
        }

        // TODO: Show some kind of loader?

        // Send request for appending the path to the current user (or a new user)
        Http.post(ENDPOINTS.addPath, payload, { dataType: "json" })
            .then(res => {
                Cache.updateUser(res.user);
                this.setState({ submitted: true });
                this.props.setMessage(<SuccessMessage code={res.user.code}/>);
            })
            .catch(() => {
                this.setState({ submitted: false });
                this.props.setMessage(<InfoMessage text={MESSAGE.ERRHTTP} />);
            })
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="text" onChange={this.handleInputChange} placeholder="Användarkod eller Epost" />
                <button type="submit">Skicka</button>
            </form>
        );
    }
}

// Main component
class AddPath extends React.Component {
    constructor(props) {
        super(props);
        this.state = { message: "" };
        this.setMessage = this.setMessage.bind(this);
    }

    setMessage(m) {
        this.setState({ message: m });
    }
    
    render() {
        // No hash was found in the URL
        if (!this.props.hash) {
            return <InfoMessage text={MESSAGE.ERRHASH} />;
        }

        return (
            <div>
                <h3>Registrera en befintlig väg</h3>
                <p className="intro">{MESSAGE.REGINFO}</p>
                {this.state.message ? this.state.message : ""}
                <Form hash={this.props.hash} setMessage={this.setMessage} />
            </div>
        );
    }
}

// Export the component
export default AddPath;
