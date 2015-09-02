// Don't clutter global namespace
(function(window, document) {
    // Strict mode
    "use strict";

    // Dependencies
    var React = window.React,
        Http = window.qwest,
        Storage = window.sessionStorage,
        Location = window.location,
        d3 = window.d3,
        Cache;

    // TODO: temporary solution
    var isLocal = Location.hostname == "localhost" || Location.hostname == "127.0.0.1";

    var Endpoints = {
        data: "/data.json",
        // Production
        addPath: isLocal ? "http://localhost:4000/path/add.html" : "http://mah-looc.github.io/path/add.html"
    };

    // TODO: check if localStorage exists
    // Setup cache
    if (Storage.getItem("_mah-looc-data")) {
        Cache = JSON.parse(Storage.getItem("_mah-looc-data"));
    } else {
        Cache = { user: null, domains: null, quizAnswers: null, lastUpdated: null };
    }

    function updateStorage() {
        Storage.setItem("_mah-looc-data", JSON.stringify(Cache));
    }

    // DEBUG
    // if (Cache.user) console.log("User object:", Cache.user);
    // if (Cache.domains) console.log("Domains object:", Cache.domains);

    function fetchDomainsAndQuizAnswers(cb) {
        if (Cache.domains && Cache.quizAnswers) {
            return cb(Cache.domains, Cache.quizAnswers);
        }

        return Http.get(Endpoints.data)
            .then(function(res){
                // Build up dependency tree of domains -> modules and then sort them by id
                var domains = res.domains.map(function(d) {
                    d.modules = res.modules.filter(function(m) {
                        return m.domain == d.id;
                    })
                    .map(function(m) {
                        m.mid = m.id;
                        delete m.id;
                        return m;
                    });

                    return d;
                })
                .sort(function(a, b) {
                    return +a.id.substring(1) >= +b.id.substring(1) ? 1 : -1;
                });

                Cache.domains = domains;
                Cache.quizAnswers = res.answers;
                updateStorage();

                cb(Cache.domains, Cache.quizAnswers);
            })
            .catch(function(e, url) {
                console.log(e, url);
            });
    }

    fetchDomainsAndQuizAnswers(function(domains, answers) {
        if (!Cache.user) {
            return;
        }

        // Returns the max points from all answers to a quiz
        function getMaxPoints(module, answers) {
            if (!module.results || !module.results.length) {
                return 0;
            }

            // Calculate points from the answers of a quiz
            function getPoints(quizAnswers, userAnswers) {
                return quizAnswers
                    .map(function(a, i) {
                        var userAnswer = userAnswers.answers["answer-" + i];

                        if (a.type == "radio") {
                            return a.correct == userAnswer;
                        }

                        if (a.correct.length !== userAnswer.length) {
                            return false;
                        }

                        userAnswer.sort();

                        return a.correct.sort()
                            .every(function(a, i) { return a == userAnswer[i]; });
                    })
                    .reduce(function(a, n) {
                        return n ? a + 1 : a + 0;
                    }, 0);
            }

            var quizID = module.results[module.results.length - 1].quiz;
            var quizAnswers = answers.filter(function(q) { return q.id == quizID; });

            if (!quizAnswers) {
                return 0;
            }

            quizAnswers = quizAnswers[0].answers;

            var points = module.results
                    .filter(function(r) {
                        return r.quiz == quizID;
                    })
                    .map(function(r) {
                        return getPoints(quizAnswers, r);
                    });

            // Get points in %
            return Math.max.apply(Math, points) / quizAnswers.length;
        }

        var modules = Cache.user.paths[0].modules;

        // All graph nodes
        var nodes = modules.map(function(m) {
            return {
                mid: m.mid,
                domain: m.domain,
                name: m.name,
                group: +m.domain.substring(1),
                score: getMaxPoints(m, answers)
            };
        });

        // Relations between nodes (modules)
        var links = modules
                .map(function(m, i) {
                    return m.rel
                        .filter(function(r) {
                            return modules.some(function(m) { return m.mid == r; });
                        })
                        .map(function(r) {
                            var t = modules.reduce(function(a, n) { return a.concat(n.mid); }, []).indexOf(r);

                            return { source: i, target: t };
                        });
                })
                .reduce(function(a, n) { return a.concat(n); });

        // d3 graph
        var width = 700,
            height = 550;

        // TODO: poor solution.. :p
        var color = d3.scale.category20();

        var tip = d3.tip()
                .attr("class", "d3-tip")
                .html(function(d) { return d.name; });

        // Group nodes by domain
        var groups = d3.nest()
                .key(function(d) { return d.group; })
                .entries(nodes)
                .map(function(g) {
                    return {
                        group: g.key,
                        name: domains.filter(function(d) { return d.id == g.values[0].domain; })[0].name
                    };
                });

        var marginTop = (height - (30 * groups.length)) / 2;

        var force = d3.layout.force()
                .charge(-150)
                .linkDistance(150)
                .linkStrength(0)
                .size([width, height]);

        var svg = d3.select("#graph-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(tip);

        var legend = svg.selectAll(".legend")
                .data(groups)
                .enter()
                .append("g")
                .attr("class", "legend");

        legend.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", function(d) { return color(d.group); })
            .attr("y", function(d, i) {
                return marginTop + ((i - 1) * 15 + (i * 10));
            });

        legend.append("text")
            .attr("height", 15)
            .attr("x", 20)
            .attr("y", function(d, i) {
                return marginTop + (i * 15 + (i * 10) - 3);
            })
            .style("font-size", 13)
            .text(function(d) { return d.name; });

        force
            .nodes(nodes)
            .links(links)
            .on("tick", tick)
            .start();

        var link = svg.selectAll(".link")
                .data(links)
                .enter()
                .append("line")
                .attr("class", "link")
                .style("stroke-width", 1);

        var node = svg.selectAll(".node")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("class", "node")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", 12)
                .style("stroke", function(d) { return color(d.group); })
                .style("fill", function(d) { return color(d.group); })
                .style("fill-opacity", function(d) {
                    return d.score < 0.3 ? 0.3 : d.score;
                })
                .on("mouseover", tip.show)
                .on("mouseout", tip.hide)
                .call(force.drag);

        node.append("title")
            .text(function(d) { return d.name; });
        
        function tick(e) {
            var k = e.alpha * 5;

            nodes.forEach(function(n, i) {
                n.x += n.group & 2 ? k : -k;
                n.y += n.group & 1 ? k : -k;
            });

            node.attr("cx", function(d) { return d.x + 40; })
                .attr("cy", function(d) { return d.y; });

            link.attr("x1", function(d) { return d.source.x + 40; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x + 40; })
                .attr("y2", function(d) { return d.target.y; });
        }
    });

    var Profile = React.createClass({displayName: "Profile",
        render: function() {
            var code = this.props.user.code;
            var hash = this.props.user.paths[0].hash;

            return (
                React.createElement("ul", null, 
                    React.createElement("li", null, "Användarkod: ", code), 
                    React.createElement("li", null, Endpoints.addPath + "/path/add.html?hash=" + hash)
                )
            );
        }
    });

    // On page load
    window.addEventListener("load", function load() {
        // Only run event listener once
        window.removeEventListener("load", load, false);
        // Render main component to DOM
        React.render(
            React.createElement(Profile, {user: Cache.user}),
            document.getElementById("profile-container")
        );

    }, false);

// Invoke anonymous function
})(window, document);
