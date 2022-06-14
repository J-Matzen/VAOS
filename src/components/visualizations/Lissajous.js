import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";
import { Box, Container } from '@mui/material';

/*
TODO: Fix dynamic load of axis names - somewhat done, still need a fix for the line function
TODO: Make max/min look at all samples
TODO: MAke Legend take different graph names
TODO: Make legend interactable
TODO: Make minimap of where you are in zoom - in order to get overview
TODO: Add Chebyshev coefficients line plot
TODO: Add units to list

todos somewhere in the future:
TODO: Scale stroke when zooming so slimmer at max zoom to give more detail
*/
const dimensions = {
    width: 545,
    height: 425,
};
const { width, height } = dimensions;

const Lissajous = (props) => {
    const [graphSize, setGraphSize] = React.useState(dimensions)
    var ref = useRef()

    useEffect(() => {
        const svg = d3.select(ref.current)
        svg.selectAll("*").remove();
        const data = { data: props.data, xName: props.x, yName: props.y, extraYName: props.extraY, colors: props.colors }
        if (props.graphSize !== undefined) {
            setGraphSize(props.graphSize)
        }
        createLissajous(data, { svg: svg, graphSize: graphSize, graphStrokeWidth: 4, showTitle: props.showTitle, axisTitles: props.axisTitles })
    }, [props, graphSize])


    return (
        <svg
            id={props.exportSvg}
            ref={ref}
            width={graphSize.width}
            height={graphSize.height}
        />
    );
}

/*
settings = {
    svg: ,
    graphSize: {width: 325, height: 325},
    showAxis: true,
    showTitle: true,
    enableLegend: true,
    tickTextSize: 15,
    axisTextSize: 25,
    xAxisTicksTextYTranslation: 15,
    xTicks: 5,
    yTicks: 10,
    graphStrokeWidth: 1,
    axisStrokeWidth: 1,
    enableZoom: true
}
*/

/*
data = {
    sampleName: ,
    xName: ,
    yName: ,
    extraYName: ,
    data: ,
    colors: ,
}
*/
export function createLissajous(data, settings) {
    //graph variables
    const svg = settings.svg
    const graphSize = settings.hasOwnProperty("graphSize") ? settings.graphSize : { width: 325, height: 325 }
    const enableLegend = settings.hasOwnProperty("enableLegend") ? settings.enableLegend : true
    const graphStrokeWidth = settings.hasOwnProperty("graphStrokeWidth") ? settings.graphStrokeWidth : 1

    //axis variables
    const axisStrokeWidth = settings.hasOwnProperty("axisStrokeWidth") ? settings.axisStrokeWidth : 1
    const axisTextSize = settings.hasOwnProperty("axisTextSize") ? settings.axisTextSize : 25
    const xAxisTicksTextYTranslation = settings.hasOwnProperty("xAxisTicksTextYTranslation") ? settings.xAxisTicksTextYTranslation : 15
    const xTicks = settings.hasOwnProperty("xTicks") ? settings.xTicks : 5
    const yTicks = settings.hasOwnProperty("yTicks") ? settings.yTicks : 10
    const tickTextSize = settings.hasOwnProperty("tickTextSize") ? settings.tickTextSize : 15
    const yTickSize = settings.hasOwnProperty("yTickSize") ? settings.yTickSize : 6
    const xTickSize = settings.hasOwnProperty("xTickSize") ? settings.xTickSize : 6


    var axisTitles = (settings.axisTitles !== undefined) ? settings.axisTitles : { x: data.xName, y: data.yName };
    var emptyTitlesCheck = (axisTitles.x !== "" || axisTitles.y !== "")
    axisTitles = emptyTitlesCheck ? axisTitles : { x: data.xName, y: data.yName };
    var customTitles = emptyTitlesCheck ? true : false;

    const showAxis = settings.hasOwnProperty("showAxis") ? settings.showAxis : true
    const showTitle = settings.hasOwnProperty("showTitle") ? settings.showTitle : true
    const enableZoom = settings.hasOwnProperty("enableZoom") ? settings.enableZoom : true
    //zoom constants
    const maxZoomLevel = 100;

    const margin = {
        right: enableLegend ? 120 : 10,
        left: showAxis ? (graphSize.width / 6 + 5) : 0,
        top: 0,
        bottom: showAxis ? (graphSize.height / 6 + 5) : 0
    };
    const translation = settings.hasOwnProperty("translation") ? settings.translation : { x: margin.left, y: margin.top }

    const innerGraphSize = {
        width: graphSize.width - margin.right - margin.left,
        height: graphSize.height - margin.top - margin.bottom
    }

    //legend creation - could maybe be a parameter too, set by a legendObject
    const { legendWidth, legendHeight } = { legendWidth: margin.right, legendHeight: margin.y }
    const legendGap = 15
    const legendRectWidthHeight = graphSize.width / 30;
    const legendXPosition = graphSize.width / 20;
    const legendYPosition = graphSize.height / 26;
    const legendFontSize = 14;
    const pxTextFont = "px sans-serif";

    //legend graph name setup - might need improvement depending on data format
    var graphNames = []
    if (data.xName === "Strain [-]") {
        graphNames = [{ name: "Total Stress" }, { name: "Elastic Stress" }]
    } else {
        graphNames = [{ name: "Total Stress" }, { name: "Viscous Stress" }]
    }

    // create array of arrays with strain and stress
    // Reformat the data: we need an array of arrays of {x, y} tuples
    function formatData(sample, x, y) {
        if (!sample.hasOwnProperty(x)) {
            return [];
        }

        var xyArray = []
        sample[x].forEach((e, i) => {
            if (!isNaN(e) && !isNaN(sample[y][i])) {
                xyArray.push({ x: e, y: sample[y][i] })
            }
        });
        return xyArray;
    }

    var dataXY = formatData(data.data, data.xName, data.yName)
    var dataXLinear = formatData(data.data, data.xName, data.extraYName)

    //needs to handle all the samples
    var maxX = Math.max.apply(Math, dataXY.map(function (o) { if (o.x != null) { return o.x } else { return 0 }; }))
    var maxY = Math.max.apply(Math, dataXY.map(function (o) { if (o.y != null) { return o.y } else { return 0 }; }))

    //tror at min bare er max negeret - men er usikker på om det er en regel
    var minX = Math.min.apply(Math, dataXY.map(function (o) { if (o.x != null) { return o.x } else { return 0 }; }))
    var minY = Math.min.apply(Math, dataXY.map(function (o) { if (o.y != null) { return o.y } else { return 0 }; }))

    //add to list so that the data function of d3 can handle the dataset
    dataXY = [dataXY]
    dataXLinear = [dataXLinear]

    var svgChart = svg
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("class", data.hasOwnProperty("sampleName") ? "lissajous " + data.sampleName : "lissajous")
        .append("g")
        .attr("transform", "translate(" + translation.x + "," + translation.y + ")")

    //have to create an innersvg, meaning the rect within the x and y-axis, this is needed to create clipping
    var innerSvg = svgChart.append("svg")
        .attr("id", "innerSVG")
        .attr("width", innerGraphSize.width)
        .attr("height", innerGraphSize.height)

    //creates a clippath so that everything outside this rect isn't drawn
    innerSvg.append('clipPath')
        .attr("id", "rect-clip")
        .append("rect")
        .attr("width", innerGraphSize.width)
        .attr("height", innerGraphSize.height)
        .attr("x", 0)
        .attr("y", 0)

    //from https://www.d3-graph-gallery.com/graph/interactivity_zoom.html
    var rect = innerSvg.append("rect")
        .attr("width", innerGraphSize.width)
        .attr("height", innerGraphSize.height)
        .attr("x", 0)
        .attr("y", 0)
        .style("fill", "none")
        .style("pointer-events", "all")

    //x-axis scaling
    var x = d3.scaleLinear()
        .domain([minX - (-minX / 22), maxX + (maxX / 22)])
        .range([0, innerGraphSize.width])

    //y-axis scaling
    var y = d3.scaleLinear()
        .domain([minY - (-minY / 22), maxY + (maxY / 22)])
        .range([innerGraphSize.height, 0])

    //handle axes if they are to be show. It is possible to show axis with no titles
    if (showAxis) {
        //remove ticksize call if grid isn't wanted
        var xAxis = d3.axisBottom(x)
            .tickSize(xTickSize)
            .ticks(xTicks, "s")

        var yAxis = d3.axisLeft(y)
            .tickSize(yTickSize)
            .ticks(yTicks, "s")

        //append x-axis
        svgChart.append("g")
            .attr("transform", "translate(0," + innerGraphSize.height + ")")
            .attr("id", "xAxis")
            .attr("class", "axis")
            .style("stroke-width", axisStrokeWidth)
            .call(xAxis)

        svgChart.selectAll("#xAxis").selectAll(".tick text").attr("dy", xAxisTicksTextYTranslation)

        //append y-axis
        svgChart.append("g")
            .attr("id", "yAxis")
            .attr("class", "axis")
            .style("stroke-width", axisStrokeWidth)
            .call(yAxis)

        svgChart.selectAll("#yAxis").selectAll(".tick text").attr("dx", -2)

        // set the font-size of the tick labels
        svgChart.selectAll(".axis")
            .style("font", tickTextSize + pxTextFont)


        //gridlines
        svgChart.append("g")
            .attr("id", "yAxisGrid")
            .style("stroke-width", 0.2)
            .call(d3.axisLeft(y)
                .tickSize(-innerGraphSize.width)
                .tickFormat('')
                .ticks(yTicks, "s")
                .tickSizeOuter(0));

        svgChart.append("g")
            .attr("id", "xAxisGrid")
            .attr("transform", `translate(0, ${innerGraphSize.height})`)
            .style("stroke-width", 0.2)
            .call(d3.axisBottom(x)
                .tickSize(-innerGraphSize.height)
                .tickFormat('')
                .ticks(xTicks, "s")
                .tickSizeOuter(0));


        if (showTitle || customTitles) {
            //x-axis title
            svgChart.append("text")
                .attr("class", "x-label")
                .attr("text-anchor", "middle")
                .attr('x', innerGraphSize.width / 2)
                .attr("y", innerGraphSize.height + margin.bottom - 10)
                .style("font", axisTextSize + pxTextFont)
                .text(axisTitles.x)

            //y-axis title
            svgChart.append("text")
                .attr("class", "y-label")
                .attr("text-anchor", "middle")
                .attr("x", -innerGraphSize.height / 2)
                .attr("y", -margin.left + 20)
                .attr("transform", "rotate(-90)")
                .style("font", axisTextSize + pxTextFont)
                .text(axisTitles.y);
        }
    }

    //Plotting the dataset to line charts
    /* Find a way to fix the problem of dynamic naming for the two line functions - for now this works*/
    var line = d3.line()
        .x(function (d) { return x(+d.x) })
        .y(function (d) { return y(+d.y) })

    //just test of plotting multiple samples in one graph
    var elasticStressLine = innerSvg.selectAll("myLines2")
        .attr("id", "mylines2")
        .data(dataXLinear)
        .enter()
        .append("path")
        .attr("d", (d) => { return line(d) })
        .attr("stroke", data.colors[1])
        .attr("stroke-width", graphStrokeWidth)
        //helps size the strokes when zooming
        .attr("vector-effect", "non-scaling-stroke")
        .style("fill", "none");

    //takes the dataset and plots the line
    var strainStressLine = innerSvg.selectAll("myLines")
        .data(dataXY)
        .enter()
        .append("path")
        .attr("id", "line1path")
        .attr("d", (d) => { return line(d) })
        .attr("stroke", data.colors[0])
        .attr("stroke-width", graphStrokeWidth)
        //helps size the strokes when zooming
        .attr("vector-effect", "non-scaling-stroke")
        .style("fill", "none")


    //Legend creation - can be enabled and disabled
    //Inspiration https://stackoverflow.com/questions/41090920/how-to-position-the-legend-in-a-d3-chart
    if (enableLegend) {
        var legendGroup = svgChart.append("svg")
            .attr("x", innerGraphSize.width)
            .attr("y", 10)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .append("g")
            .attr("class", "legendGroup")
            .style("font-size", legendFontSize)


        var legend = legendGroup.selectAll(".legend")
            .data(graphNames)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(0," + i * legendGap + ")"; });

        legend.append("rect")
            .attr("x", 0)
            .attr("y", 2)
            .attr("width", legendRectWidthHeight)
            .attr("height", legendRectWidthHeight)
            .style("fill", (d, i) => { return data.colors[i] })

        legend.append("text")
            .attr("x", legendXPosition)
            .attr("y", legendYPosition)
            .style("text-anchor", "start")
            .text(function (d) { return d.name; });
    }

    if (enableZoom) {
        //Zooming section
        var zoom = d3.zoom()
            .scaleExtent([0.5, maxZoomLevel])
            .translateExtent([[0, 0], [innerGraphSize.width, innerGraphSize.height]])
            .extent([[0, 0], [innerGraphSize.width, innerGraphSize.height]])
            .on("zoom", zoomed);

        //updates our chart based on zoom, setting new x,y restraint etc.
        function zoomed(event) {
            var updatedx = event.transform.rescaleX(x);
            var updatedy = event.transform.rescaleY(y);

            //apply new axis to x and y. transition is optional - can be added.
            // .transition().duration(150)
            svgChart.selectAll("#xAxisGrid").call(d3.axisBottom(updatedx).tickSize(-innerGraphSize.height).tickFormat('').ticks(xTicks).tickSizeOuter(0));
            svgChart.selectAll("#xAxis").call(d3.axisBottom(updatedx).tickSize(xTickSize).ticks(xTicks, "s"));
            svgChart.selectAll("#yAxis").call(d3.axisLeft(updatedy).tickSize(yTickSize).ticks(yTicks, "s"));
            svgChart.selectAll("#yAxisGrid").call(d3.axisLeft(updatedy).tickSize(-innerGraphSize.width).tickFormat('').ticks(yTicks).tickSizeOuter(0));
            svgChart.selectAll("#xAxis").selectAll(".tick text").attr("dy", 20)
            if (showAxis) {
                svgChart.selectAll("#xAxis").selectAll(".tick text").attr("dy", xAxisTicksTextYTranslation);
            }
            //change line's position when zooming
            strainStressLine.attr("transform", event.transform);
            elasticStressLine.attr("transform", event.transform);
        }

        //zoom call, after lines are created
        rect.call(zoom)
    }
}

export default Lissajous;