var margin = {top: 25, right: 40, bottom: 70, left: 70};

width = 960 - margin.left - margin.right;
height = 500 - margin.top - margin.bottom; 

var all_options = ["None", "Deaths by Ethnicity", "Cases by Ethnicity*", "Deaths by Age", "Cases by Age"];
var filters = [""]

var svg = d3.select("#chartarea")
    .append("svg")
        .attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

// dropdown menu
d3.select("#dropdown")
    .selectAll("theoptions").data(all_options).enter().append("option")
    .text(function (d) {return d;})
    .attr("value", function (d) {return d;})
    .style("font-family", "tahoma");

// dataset cleaning + storing
var parseTime = d3.timeParse('%m-%d%-%Y');
var formatTime = d3.timeFormat("%B %d, %Y");
var timeSince = new Date(2020, 2, 1).getTime();
var selected = "";
var new_opacity = [1, 1, 1, 1, 1] // order of races array (black, asian, latinx, white, other)

function filterVisibility(setting) {
    d3.select("#filterheader").style("visibility", setting);
    d3.select("#boxes").style("visibility", setting);
}

function manageFilter() {
    let black = document.getElementById("black");
    let asian = document.getElementById("asian");
    let latinx = document.getElementById("latinx");
    let white = document.getElementById("white");
    let other = document.getElementById("other");
    new_opacity[0] = +black.checked;
    new_opacity[1] = +asian.checked;
    new_opacity[2] = +latinx.checked;
    new_opacity[3] = +white.checked;
    new_opacity[4] = +other.checked;
}


d3.csv("https://gist.githubusercontent.com/ashua2/c369a7bbca9311c50632a9a9c138f30d/raw/a381a14cc3838487451cc90cb5b9476c6e4cca3d/covid_deaths_cases_by_race.csv").then(function(dataset) {
    function updateChart(selectedGroup) { // selectedGroup is a string of a factor (dropdown option)
        svg.selectAll("*").remove();
        var ethn_array = [];
        var ages_text = ["0-17 Years", "18-29 Years", "30-39 Years", "40-49 Years", "50-59 Years", "60-69 Years", "70-79 Years", "80+ Years"];
        var ages_array = [
         {"group": ages_text[0], "total_deaths": 0, "total_cases": 0},
         {"group": ages_text[1], "total_deaths": 0, "total_cases": 0},
         {"group": ages_text[2], "total_deaths": 0, "total_cases": 0},
         {"group": ages_text[3], "total_deaths": 0, "total_cases": 0},
         {"group": ages_text[4], "total_deaths": 0, "total_cases": 0},
         {"group": ages_text[5], "total_deaths": 0, "total_cases": 0},
         {"group": ages_text[6],"total_deaths": 0, "total_cases": 0},
         {"group": ages_text[7], "total_deaths": 0, "total_cases": 0}]
        var races = ["Black", "Asian", "Latinx", "White", "Other"];
        var colors = ["orange", "violet", "cornflowerblue", "crimson", "mediumaquamarine"];

        dataset.forEach(function(data) {
            let info = {
                "date": new Date(+(data.date.slice(6)), +(data.date.slice(0,2) - 1), +(data.date.slice(3,5))),
                "asian_cases": +data.cases_asian_nonlat, "asian_deaths": +data.deaths_asian_nonlat,
                "black_cases": +data.case_black_nonlat, "black_deaths": +data.deaths_black_nonlat,
                "latinx_cases": +data.cases_latinx, "latinx_deaths": +data.deaths_latinx,
                "white_cases": +data.cases_white_nonlat, "white_deaths": +data.deaths_white_nonlat,
                "other_cases": +data.cases_other_nonlat, "other_deaths": +data.deaths_other_nonlat
            }
            if (info.date <= new Date(2021, 2, 1) && info.date >= new Date(2020, 2, 1)) {
                ethn_array.push(info);
                ages_array[0].total_deaths += +data.deaths_0_17;
                ages_array[1].total_deaths += +data.deaths_18_29;
                ages_array[2].total_deaths += +data.deaths_30_39;
                ages_array[3].total_deaths += +data.deaths_40_49;
                ages_array[4].total_deaths += +data.deaths_50_59;
                ages_array[5].total_deaths += +data.deaths_60_69;
                ages_array[6].total_deaths += +data.deaths_70_79;
                ages_array[7].total_deaths += +data.deaths_80;
                ages_array[0].total_cases += +data.cases_0_17;
                ages_array[1].total_cases += +data.cases_18_29;
                ages_array[2].total_cases += +data.cases_30_39;
                ages_array[3].total_cases += +data.cases_40_49;
                ages_array[4].total_cases += +data.cases_50_59;
                ages_array[5].total_cases += +data.cases_60_69;
                ages_array[6].total_cases += +data.cases_70_79;
                ages_array[7].total_cases += +data.cases_80;
            }
        });
        ethn_array.sort(function(o1,o2){ return o1.date - o2.date; });
        // tooltips
        var tooltip = d3.select("#chartarea").append("div")
                .style("position", "absolute").style("z-index", 10).style("visibility", "hidden")
                .style("background-color", "linen").style("padding", "4px").style("font-family", "verdana")
                .style("border", "solid").style("border-width", "1px").style("border-radius", "5px")
                .style("font-size", "15px").style("stroke", "black").text("");

        const mouseover = (event, d) => {
                if (selectedGroup == all_options[3] || selectedGroup == all_options[4]) {
                    tooltip.html("<b>Deaths: </b>"+d.total_deaths+"<br><b>Cases:</b> "+d.total_cases+"<br><b>Death Rate: </b>"+(Math.round(1000*(d.total_deaths / d.total_cases))/1000));
                    return tooltip.style("visibility", "visible");
                }
                const [x, y] = d3.pointer(event, document.body);
                var hovered_date = dates_x_axis.invert(x - margin.left);
                var index = Math.round((hovered_date - timeSince) / 86400000);
                var a = ethn_array[index];
                if (selectedGroup == all_options[1]) {tooltip.html("<b>Date:</b> "+formatTime(hovered_date)+"<br><b>Black Deaths:</b> "+a.black_deaths+"<br><b>Asian Deaths:</b> "+a.asian_deaths+"<br><b>Latinx Deaths:</b> "+a.latinx_deaths+"<br><b>White Deaths:</b> "+a.white_deaths+"<br><b>Other Deaths:</b> "+a.other_deaths);}
                else {tooltip.html("<b>Date:</b> "+formatTime(hovered_date)+"<br><b>Black Cases:</b> "+a.black_cases+"<br><b>Asian Cases:</b> "+a.asian_cases+"<br><b>Latinx Cases:</b> "+a.latinx_cases+"<br><b>White Cases:</b> "+a.white_cases+"<br><b>Other Cases:</b> "+a.other_cases);}
            return tooltip.style("visibility", "visible");
        };
        const mousemove = (event, d) => {
            const [x, y] = d3.pointer(event, document.body);
            return tooltip.style("top", (y) + "px").style("left", (x + 20) + "px");
        };
        const mouseleave = (event, d) => { return tooltip.style("visibility", "hidden"); };
        
        if (selectedGroup == all_options[0]) { filterVisibility("hidden"); } 
        else if (selectedGroup == all_options[1] || selectedGroup == all_options[2]) { // line charts by ethnicity
        // axes + labels
            filterVisibility("visible");
            var dates_x_axis = d3.scaleTime().domain([new Date(2020, 2, 1), new Date(2021, 2, 1)]).range([0, width]);

            if (selectedGroup == all_options[1]) { // deaths
                var y_axis = d3.scaleLinear().domain([0, 30]).range([height, 0]);

                svg.append('text')
                    .attr('text-anchor', 'middle').attr('transform', 'translate(-35,' + height/2 + ')rotate(-90)')
                    .style('font-family', 'tahoma').style('font-size', 15)
                    .text('Deaths');

            } else {                              // cases
                var y_axis = d3.scaleLinear().domain([0, 1500]).range([height, 0]).nice();

                svg.append('text')
                    .attr('text-anchor', 'middle').attr('transform', 'translate(-40,' + height/2 + ')rotate(-90)')
                    .style('font-family', 'tahoma').style('font-size', 15)
                    .text('Cases');
            }

            svg.append("g").call(d3.axisLeft(y_axis));
            svg.append("g").attr("transform","translate(0,"+height+")").call(d3.axisBottom(dates_x_axis));

            svg.append('text')
                .attr('x', width/2).attr('y', height + 40).attr('text-anchor', 'middle')
                .style('font-family', 'tahoma').style('font-size', 15)
                .text('Month');

        // colored lines
            svg.append("path").datum(ethn_array)
                .attr("fill", "none").attr("stroke", "cornflowerblue").attr("stroke-width", 1.5).style("opacity", new_opacity[2] + 0.15)
                .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); }).y(function(d) {
                        if (selectedGroup == all_options[1]) { return y_axis(d.latinx_deaths); }
                        return y_axis(d.latinx_cases); 
                    }));

            svg.append("path").datum(ethn_array)
                .attr("fill", "none").attr("stroke", "violet").attr("stroke-width", 1.5).style("opacity", new_opacity[1] + 0.15)
                .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); }).y(function(d) {
                        if (selectedGroup == all_options[1]) { return y_axis(d.asian_deaths); }
                        return y_axis(d.asian_cases); 
                    }));

            svg.append("path").datum(ethn_array)
                .attr("fill", "none").attr("stroke", "orange").attr("stroke-width", 1.5).style("opacity", new_opacity[0] + 0.15)
                .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); }).y(function(d) {
                        if (selectedGroup == all_options[1]) { return y_axis(d.black_deaths); }
                        return y_axis(d.black_cases); 
                    }));

            svg.append("path").datum(ethn_array)
                .attr("fill", "none").attr("stroke", "crimson").attr("stroke-width", 1.5).style("opacity", new_opacity[3] + 0.15)
                .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); }).y(function(d) {
                        if (selectedGroup == all_options[1]) { return y_axis(d.white_deaths); }
                        return y_axis(d.white_cases); 
                    }));

            svg.append("path").datum(ethn_array)
                .attr("fill", "none").attr("stroke", "mediumaquamarine").attr("stroke-width", 1.5).style("opacity", new_opacity[4] + 0.15)
                .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave)
                .attr("d", d3.line()
                    .x(function(d) { return dates_x_axis(d.date); }).y(function(d) {
                        if (selectedGroup == all_options[1]) { return y_axis(d.other_deaths); }
                        return y_axis(d.other_cases); 
                    }));

        // legend
            svg.selectAll("legenddots")
                .data(colors).enter().append("circle")
                    .attr("cx", 795).attr("cy", function(d,i) {return i*20;}).attr("r", 3)
                    .style("fill", function(d,i) {return d;});

            svg.selectAll("legendlabels")
                .data(races).enter().append("text")
                    .attr("x", 810).attr("y", function(d,i) {return i*20;}).attr("alignment-baseline","middle")
                    .text(function(d) {return d;})
                    .style("font-size", "13px").style("font-family", "tahoma");

        // annotations
            if (selectedGroup == all_options[1]) {
                svg.append("text")                  //black deaths annotation
                    .attr("x", 140).attr("y", 5)
                    .html("Black deaths were at an all-time high on "+formatTime(ethn_array[52].date)+", with a total of "+ethn_array[52].black_deaths+" deaths.")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "darkorange").style("letter-spacing", 1.5).style("opacity", new_opacity[0]);
                svg.append('line')
                    .style("stroke", "darkorange").style("stroke-width", 1).style("opacity", new_opacity[0])
                    .attr("x1", 120).attr("y1", 35).attr("x2", 140).attr("y2", 10);

                svg.append("text")                  //latinx deaths annotation
                    .attr("x", 190).attr("y", 40)
                    .html("Latinx deaths were at an all-time high on "+formatTime(ethn_array[69].date)+", with a total of "+ethn_array[69].latinx_deaths+" deaths.")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "royalblue").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", new_opacity[2]);
                svg.append("text")
                    .attr("x", 185).attr("y", 53)
                    .html("This point begins the trend of Latinx deaths generally being the highest of all ethnicities.")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "royalblue").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", new_opacity[2]);

                svg.append('line')
                    .style("stroke", "royalblue").style("stroke-width", 1).style("opacity", new_opacity[2])
                    .attr("x1", 185).attr("y1", 40).attr("x2", 160).attr("y2", 50);

                svg.append("text")                  //white deaths annotation
                    .attr("x", 225).attr("y", 170)
                    .html("Some of the few times when white deaths exceeded all other ethnicities.")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "maroon").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", new_opacity[3]);

                svg.append('line')
                    .style("stroke", "maroon").style("stroke-width", 1).style("opacity", new_opacity[3])
                    .attr("x1", 570).attr("y1", 293).attr("x2", 450).attr("y2", 185);
                svg.append('line')
                    .style("stroke", "maroon").style("stroke-width", 1).style("opacity", new_opacity[3])
                    .attr("x1", 505).attr("y1", 355).attr("x2", 450).attr("y2", 185);
            
                svg.append("text")                  // other + asian deaths annotation
                    .attr("x", 180).attr("y", 150)
                    .html("Asian and other ethnicities also had the highest number of deaths in spring (hover over data for more info)")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "olive").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", function(d) {return +((!!new_opacity[1]) || (!!new_opacity[4])); });

                svg.append('line')
                    .style("stroke", "olive").style("stroke-width", 1).style("opacity", function(d) {return +((!!new_opacity[1]) || (!!new_opacity[4])); })
                    .attr("x1", 200).attr("y1", 160).attr("x2", 155).attr("y2", 325);

            } else { // annotations
                svg.append("text")
                    .attr("x", 0).attr("y", 470)
                    .html("*Large dips in cases throughout data is due to many testing facilities being closed on weekends.")
                    .style("font-size", "8px").style("font-family", "verdana").style("stroke", "gray").style("letter-spacing", 1.5).style("font-weight", 100);

                svg.append("text")                  //all cases annotation
                    .attr("x", 200).attr("y", 0)
                    .html("All ethnicities had an all-time high of cases on "+formatTime(ethn_array[254].date)+" (hover for more info)")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "olive").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", function(d) {
                        return +((!!new_opacity[0]) || (!!new_opacity[1]) || (!!new_opacity[2]) || (!!new_opacity[3]) || (!!new_opacity[4])); 
                    });

                svg.append('line')
                    .style("stroke", "olive").style("stroke-width", 1).style("opacity", function(d) {
                        return +((!!new_opacity[0]) || (!!new_opacity[1]) || (!!new_opacity[2]) || (!!new_opacity[3]) || (!!new_opacity[1])); 
                    }).attr("x1", 575).attr("y1", 10).attr("x2", 590).attr("y2", 50);

                svg.append("text")                  //black cases annotation
                    .attr("x", 20).attr("y", 190)
                    .html("Black cases were the highest of all ethnicities during the beginning of the pandemic")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "darkorange").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", new_opacity[0]);

                svg.append('line')
                    .style("stroke", "darkorange").style("stroke-width", 1).style("opacity", new_opacity[0])
                    .attr("x1", 79).attr("y1", 330).attr("x2", 90).attr("y2", 200);

                svg.append("text")                  //white cases annotation
                    .attr("x", 70).attr("y", 150)
                    .html("Although white cases were consistently higher than black cases in fall")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "crimson").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", new_opacity[3]);
                svg.append("text")
                    .attr("x", 70).attr("y", 160)
                    .html("and winter, black deaths were generally higher than white deaths")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "crimson").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", new_opacity[3]);

                svg.append('line')
                    .style("stroke", "crimson").style("stroke-width", 1).style("opacity", new_opacity[3])
                    .attr("x1", 530).attr("y1", 150).attr("x2", 590).attr("y2", 190);

                svg.append("text")                  //latinx cases annotations
                    .attr("x", 160).attr("y", 250)
                    .html("Latinx cases were consistently the highest of all ethnicities")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "royalblue").style("letter-spacing", 1.5).style("font-weight", 100).style("opacity", new_opacity[2]);

                svg.append('line')
                    .style("stroke", "royalblue").style("stroke-width", 1).style("opacity", new_opacity[2])
                    .attr("x1", 220).attr("y1", 320).attr("x2", 250).attr("y2", 260);
                svg.append('line')
                    .style("stroke", "royalblue").style("stroke-width", 1).style("opacity", new_opacity[2])
                    .attr("x1", 510).attr("y1", 320).attr("x2", 450).attr("y2", 260);

            }
        } else { // cases + deaths by age (bar charts)
        // axes + labels
            filterVisibility("hidden");
            var ages_colors = ["#F374AE", "#0B4F6C", "#E3D26F", "#8D6A9F", "#A9E5BB", "#F7BFB4", "#32533D", "#FF8552"];
            var ages_x_axis = d3.scaleBand().domain(ages_text).range([0, width]).padding(0.4);

            if (selectedGroup == all_options[3]) { // deaths
                var y_axis = d3.scaleLinear().domain([0, 2000]).range([height, 0]).nice();

                svg.append('text')
                .attr('text-anchor', 'middle').attr('transform', 'translate(-55,' + height/2 + ')rotate(-90)')
                .style('font-family', 'tahoma').style('font-size', 15)
                .text('Deaths');

            } else { // cases
                var y_axis = d3.scaleLinear().domain([0, 70000]).range([height, 0]).nice();

                svg.append('text')
                .attr('text-anchor', 'middle').attr('transform', 'translate(-55,' + height/2 + ')rotate(-90)')
                .style('font-family', 'tahoma').style('font-size', 15)
                .text('Cases');
            }

            svg.append('text')
                .attr('x', width/2).attr('y', height + 40).attr('text-anchor', 'middle')
                .style('font-family', 'tahoma').style('font-size', 15)
                .text('Ages');

            svg.append("g").call(d3.axisLeft(y_axis));
            svg.append("g").attr("transform","translate(0,"+height+")").call(d3.axisBottom(ages_x_axis));

        // bars
            svg.selectAll("bars")
                .data(ages_array).enter().append('rect')
                .attr("x", function(d) { return ages_x_axis(d.group); }).attr("y", function(d) { 
                    if (selectedGroup == all_options[3]) { return y_axis(d.total_deaths); }
                    return y_axis(d.total_cases);
                })
                .attr("width", ages_x_axis.bandwidth()).attr("height", function(d) { 
                    if (selectedGroup == all_options[3]) { return height - y_axis(d.total_deaths); }
                    return height - y_axis(d.total_cases)
                })
                .attr("fill", function(d, i) { return ages_colors[i]; })
                .on("mouseover", mouseover).on("mousemove", mousemove).on("mouseleave", mouseleave);

        // annotations
            if (selectedGroup == all_options[3]) {
                svg.append("text")                  // the elderly
                    .attr("x", 140).attr("y", 5)
                    .html("Elderly people had the most deaths, with the number of deaths increasing with age")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "#BA623C").style("letter-spacing", 1.5);
                svg.append('line')
                    .style("stroke", "#BA623C").style("stroke-width", 1)
                    .attr("x1", 750).attr("y1", 35).attr("x2", 700).attr("y2", 10);
            } else {
                svg.append("text")                  // 80+
                    .attr("x", 250).attr("y", 100)
                    .html("Although cases are the lowest for people 80 and over, they had the highest number of deaths")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "#BA623C").style("letter-spacing", 1.5);
                svg.append('line')
                    .style("stroke", "#BA623C").style("stroke-width", 1)
                    .attr("x1", 770).attr("y1", 350).attr("x2", 700).attr("y2", 110);
                
                svg.append("text")                  // 18-29
                    .attr("x", 100).attr("y", 10)
                    .html("Young people had the most cases but had the second least number of deaths")
                    .style("font-size", "10px").style("font-family", "verdana").style("stroke", "#062A39").style("letter-spacing", 1.5);
                svg.append('line')
                    .style("stroke", "#062A39").style("stroke-width", 1)
                    .attr("x1", 200).attr("y1", 50).attr("x2", 250).attr("y2", 20);
            }
        }
    }
    d3.select("#dropdown").on("change", function(d) {
        var selectedOption = d3.select(this).property("value");
        selected = selectedOption;
        updateChart(selectedOption);
    })
    d3.select("#boxes").on("change", function(d) {
        updateChart(selected);
    })
});