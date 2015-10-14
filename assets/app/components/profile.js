import ENDPOINTS from "../endpoints.js";
import Cache from "../cache.js";
import PubSub from "pubsub-js";

// Global dependencies
let React = window.React,
    Http = window.qwest,
    d3 = window.d3;

// Message constants
const MESSAGE = {
    ERRUSER: "Ni måste logga in för att visa er profil."
};

class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = { mounted: false };
        // Re-bind methods
        this.getMaxPoints = this.getMaxPoints.bind(this);
        this.getPoints = this.getPoints.bind(this);
        this.getNodes = this.getNodes.bind(this);
        this.getLinks = this.getLinks.bind(this);
        this.getGroups = this.getGroups.bind(this);
        this.tick = this.tick.bind(this);
    }
    // Returns the max points from all answers to a quiz
    getMaxPoints(module, answers) {
        if (!module.results || !module.results.length) {
            return 0;
        }

        let lastQuiz = module.results[module.results.length - 1],
            qId = lastQuiz.quiz,
            qAnswers = answers.filter(q => q.id == qId);

        if (!qAnswers) {
            return 0;
        }

        qAnswers = qAnswers[0].answers;

        let pts = module.results
                .filter(r => r.quiz == qId)
                .map(r = this.getPoints(qAnswers, r));

        return Math.max.apply(Math, pts) / qAnswers.length;
    }
    // Calculate points from the answers of a quiz
    getPoints(qAnswers, uAnswers) {
        return qAnswers
            .map((a, i) => {
                let uAnswer = uAnswers.answers["answer-" + i];

                if (a.type == "radio") {
                    return a.correct == uAnswer;
                }

                if (a.correct.length !== uAnswer.length) {
                    return false;
                }

                uAnswer.sort();

                return a.correct
                    .sort()
                    .every((a, i) => a == uAnswer[i]);
            })
            .reduce((a, n) => n ? a + 1 : a + 0, 0);
    }
    // All the nodes
    getNodes(modules, answers) {
        return modules.map(m => {
            return {
                mid: m.mid,
                domain: m.domain,
                name: m.name,
                group: +m.domain.substring(1),
                score: this.getMaxPoints(m, answers)
            };
        });
    }
    // Relationships between nodes (from modules)
    getLinks(modules) {
        return modules
            .map((m, i) => {
                return m.rel
                    .filter(r => modules.some(m => m.mid == r))
                    .map(r => {
                        return {
                            source: i,
                            target: modules.reduce((a, n) => a.concat(n.mid), []).indexOf(r)
                        };
                    });
            })
            .reduce((a, n) => a.concat(n));
    }
    // Group nodes by domain name
    getGroups(nodes, domains) {
        return d3
            .nest()
            .key(d => d.group)
            .entries(nodes)
            .map(g => {
                return {
                    group: g.key,
                    name: domains.filter(d => d.id == g.values[0].domain)[0].name
                };
            });
    }
    // Render tick for the nodes
    tick(nodes, node, link) {
        return e => {
            let k = e.alpha * 5;

            nodes.forEach((n, i) => {
                n.x += n.group & 2 ? k : -k;
                n.y += n.group & 1 ? k : -k;
            });

            node
                .attr("cx", d => d.x + 40)
                .attr("cy", d => d.y);

            link
                .attr("x1", d => d.source.x + 40)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x + 40)
                .attr("y2", d => d.target.y);
        }
    }

    componentDidMount() {
        this.setState({ mounted: true });
    }

    render() {
        // If the props are empty don't do anything
        if (this.state.mounted && this.props.domains.length && this.props.answers.length && this.props.modules.length) {
            let modules = this.props.modules,
                nodes = this.getNodes(modules, this.props.answers),
                links = this.getLinks(modules),
                groups = this.getGroups(nodes, this.props.domains);

            let w = this.props.width,
                h = this.props.height,
                mTop = (h - (30 * groups.length)) / 2, // Margin-top
                color = d3.scale.category20(),
                tip = d3.tip().attr("class", "d3-tip").html(d => d.name);

            let force = d3.layout
                    .force()
                    .charge(-150)
                    .linkDistance(150)
                    .linkStrength(0)
                    .size([w, h]);

            let svg = d3
                    .select("#graph-container")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h)
                    .call(tip);

            let legend = svg
                    .selectAll(".legend")
                    .data(groups)
                    .enter()
                    .append("g")
                    .attr("class", "legend");

            legend
                .append("rect")
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", d => color(d.group))
                .attr("y", (d, i) => mTop + ((i - 1) * 15 + (i * 10)));

            legend
                .append("text")
                .attr("height", 15)
                .attr("x", 20)
                .attr("y", (d, i) => mTop + (i * 15 + (i * 10) - 3))
                .style("font-size", 13)
                .text(d => d.name);

            let link = svg
                    .selectAll(".link")
                    .data(links)
                    .enter()
                    .append("line")
                    .attr("class", "link")
                    .style("stroke-width", 1);

            let node = svg
                    .selectAll(".node")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("class", "node")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .attr("r", 12)
                    .style("stroke", d => color(d.group))
                    .style("fill", d => color(d.group))
                    .style("fill-opacity", d => d.score < 0.3 ? 0.3 : d.score)
                    .on("mouseover", tip.show)
                    .on("mouseout", tip.hide)
                    .call(force.drag);

            node.append("title").text(d => d.name);

            force
                .nodes(nodes)
                .links(links)
                .on("tick", this.tick(nodes, node, link))
                .start();
        }
        return <div></div>;
    }
}

Graph.defaultProps = { width: 700, height: 550 };

// TODO: more user statistics + improve design
class UserStats extends React.Component {
    render() {
        let code = this.props.user.code,
            url = ENDPOINTS.addPath + "/path/add.html?hash=" + this.props.user.paths[0].hash;

        return (
            <ul>
                <li>Användarkod: {code}</li>
                <li>URL: {url}</li>
            </ul>
        );
    }
}

// Main component
class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: Cache.user,
            domains: [],
            answers: []
        };
        // Re-bind methods
        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.fetchDomains = this.fetchDomains.bind(this);
        this.fetchQuizAnswers = this.fetchQuizAnswers.bind(this);
        // Subscribe to events
        PubSub.subscribe("user.login", this.loginUser);
        PubSub.subscribe("user.logout", this.logoutUser);
    }

    // Fetch data
    componentDidMount() {
        this.fetchDomains();
        this.fetchQuizAnswers();
    }

    fetchDomains() {
        // TODO: error handling?
        Cache.getDomains(d => this.setState({ domains: d }));
    }

    fetchQuizAnswers() {
        // TODO: error handling?
        Cache.getQuizAnswers(a => this.setState({ answers: a }));
    }

    loginUser(msg, user) {
        this.setState({ user: user });
    } 

    logoutUser() {
        this.setState({ user: null });
    }

    render() {
        if (!this.state.user) {
            return <p>{MESSAGE.ERRUSER}</p>;
        }

        let modules = this.state.user.paths[0].modules;

        return (
            <div className="user-profile">
                <div id="graph-container"></div>
                <Graph modules={modules} domains={this.state.domains} answers={this.state.answers} />
                <UserStats user={this.state.user} />
            </div>
        );
    }
}

export default Profile;
