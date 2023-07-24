// svg
var margin = {top: 25, right: 40, bottom: 70, left: 70};

width = 960 - margin.left - margin.right;
height = 500 - margin.top - margin.bottom; 

var factors = ["Deaths by Ethnicity", "Cases by Ethnicity", "Deaths by Gender", "Deaths by Age", "Cases by Age"];

var svg = d3.select("#chartarea")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

// dropdown menu

d3.select("#dropdown")
    .selectAll("alloptions").data(factors).enter().append("option")
    .text(function (d) {return d;})
    .attr("value", function (d) {return d;})
    .style("font-family", "tahoma");

// dataset cleaning + storing
var parseTime = d3.timeParse('%m-%d%-%Y');
var formatTime = d3.timeFormat("%B %d, %Y");

d3.csv("https://gist.githubusercontent.com/ashua2/c369a7bbca9311c50632a9a9c138f30d/raw/a381a14cc3838487451cc90cb5b9476c6e4cca3d/covid_deaths_cases_by_race.csv").then(function(dataset) {
    console.log(dataset);

    function updateChart(selectedGroup) { // selectedGroup is a string of a factor (dropdown option)
        svg.selectAll("*").remove();
        if (selectedGroup == factors[0]) { // line chart by ethnicity
            var dates_deaths_race = [];
            var races = ["Black", "Asian", "Latinx", "White", "Other"];
            var colors = ["orange", "violet", "cornflowerblue", "crimson", "mediumaquamarine"];
            var attributes = ["latinx_deaths", "asian_deaths", "black_deaths", "white_deaths", "other_deaths"];

            for (let i = 0; i < 5; i++) {
                dataset.forEach(function(data) {
                    let race_deaths = {
                        "date": new Date(+(data.date.slice(6)), +(data.date.slice(0,2) - 1), +(data.date.slice(3,5))),
                        "latinx_deaths": +data.deaths_latinx,
                        "asian_deaths": +data.deaths_asian_nonlat,
                        "black_deaths": +data.deaths_black_nonlat,
                        "white_deaths": +data.deaths_white_nonlat,
                        "other_deaths": +data.deaths_other_nonlat
                    }
                    if (race_deaths.date <= new Date(2021, 2, 1) && race_deaths.date >= new Date(2020, 2, 1)) {
                        dates_deaths_race.push(race_deaths);
                    }
                });
            }

            dates_deaths_race.sort(function(o1,o2){
                return o1.date - o2.date;
            });


            console.log(dates_deaths_race);

        // axes + labels
            var dates_x_axis = d3.scaleTime()
                .domain([new Date(2020, 2, 1), new Date(2021, 2, 1)])
                .range([0, width]);

            var deaths_y_axis = d3.scaleLinear()
                .domain([0, 30])
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(deaths_y_axis));

            svg.append("g")
                .attr("transform","translate(0,"+height+")")
                .call(d3.axisBottom(dates_x_axis));

            svg.append('text')
                .attr('x', width/2).attr('y', height + 40).attr('text-anchor', 'middle')
                .style('font-family', 'tahoma').style('font-size', 15)
                .text('Month');

            svg.append('text')
                .attr('text-anchor', 'middle').attr('transform', 'translate(-35,' + height/2 + ')rotate(-90)')
                .style('font-family', 'tahoma').style('font-size', 15)
                .text('Deaths');

        // colored lines
            svg.append("path")
                .datum(dates_deaths_race)
                .attr("fill", "none")
                .attr("stroke", "cornflowerblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); })
                    .y(function(d) { return deaths_y_axis(d.latinx_deaths); }));

            svg.append("path")
                .datum(dates_deaths_race)
                .attr("fill", "none")
                .attr("stroke", "violet")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); })
                    .y(function(d) { return deaths_y_axis(d.asian_deaths); }));

            svg.append("path")
                .datum(dates_deaths_race)
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); })
                    .y(function(d) { return deaths_y_axis(d.black_deaths); }));

            svg.append("path")
                .datum(dates_deaths_race)
                .attr("fill", "none")
                .attr("stroke", "crimson")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); })
                    .y(function(d) { return deaths_y_axis(d.white_deaths); }));

            svg.append("path")
                .datum(dates_deaths_race)
                .attr("fill", "none")
                .attr("stroke", "mediumaquamarine")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); })
                    .y(function(d) { return deaths_y_axis(d.other_deaths); }));

        // legend
            svg.selectAll("legenddots")
                .data(colors).enter().append("circle")
                    .attr("cx", 795)
                    .attr("cy", function(d,i) {return 20 + i*20;})
                    .attr("r", 3)
                    .style("fill", function(d,i) {return d;});

            svg.selectAll("legendlabels")
                .data(races).enter().append("text")
                    .attr("x", 810)
                    .attr("y", function(d,i) {return 20 + i*20;})
                    .attr("alignment-baseline","middle")
                    .text(function(d) {return d;})
                    .style("font-size", "13px").style("font-family", "tahoma");

        // annotations
            //black deaths annotation
            svg.append("text")
                .attr("x", 140)
                .attr("y", 5)
                .html("Black deaths were at an all-time high on "+formatTime(dates_deaths_race[52].date)+", with a total of "+dates_deaths_race[52].black_deaths+" deaths.")
                .style("font-size", "10px").style("font-family", "verdana").style("stroke", "darkorange").style("letter-spacing", 1.5);
            svg.append('line')
                .style("stroke", "darkorange")
                .style("stroke-width", 1)
                .attr("x1", 120)
                .attr("y1", 35)
                .attr("x2", 140)
                .attr("y2", 10);

            //latinx deaths annotation
            svg.append("text")
                .attr("x", 190)
                .attr("y", 40)
                .html("Latinx deaths were at an all-time high on "+formatTime(dates_deaths_race[65].date)+", with a total of "+dates_deaths_race[65].latinx_deaths+" deaths.")
                .style("font-size", "10px").style("font-family", "verdana").style("stroke", "royalblue").style("letter-spacing", 1.5).style("font-weight", 100);
            svg.append("text")
                .attr("x", 185)
                .attr("y", 53)
                .html("This point begins the trend of Latinx deaths generally being the highest of all ethnicities.")
                .style("font-size", "10px").style("font-family", "verdana").style("stroke", "royalblue").style("letter-spacing", 1.5).style("font-weight", 100);

            svg.append('line')
                .style("stroke", "royalblue")
                .style("stroke-width", 1)
                .attr("x1", 185)
                .attr("y1", 40)
                .attr("x2", 160)
                .attr("y2", 50);

            //white deaths annotation
            svg.append("text")
                .attr("x", 225)
                .attr("y", 170)
                .html("Some of the few times when white deaths exceeded all other ethnicities.")
                .style("font-size", "10px").style("font-family", "verdana").style("stroke", "maroon").style("letter-spacing", 1.5).style("font-weight", 100);

            svg.append('line')
                .style("stroke", "maroon")
                .style("stroke-width", 1)
                .attr("x1", 570)
                .attr("y1", 293)
                .attr("x2", 450)
                .attr("y2", 185);
            svg.append('line')
                .style("stroke", "maroon")
                .style("stroke-width", 1)
                .attr("x1", 505)
                .attr("y1", 355)
                .attr("x2", 450)
                .attr("y2", 185);
        } else if (selectedGroup == factors[1]) {

        } else if (selectedGroup == factors[2]) {

        } else if (selectedGroup == factors[3]) {

        } else {

        }
    }

    d3.select("#dropdown").on("change", function(d) {
        var selectedOption = d3.select(this).property("value");
        updateChart(selectedOption);

    })
});