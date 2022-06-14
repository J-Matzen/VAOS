import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";
import { SamplesColors } from '../../constants/colors';
import { InfoSharp } from '@mui/icons-material';

// set the dimensions and margins of the graph
const margin = {
  right: 110,
  left: 90,
  top: 10,
  bottom: 70
};

//axis variables
const xTickamount = 4
const yTickamount = 5
const tickTextSize = 15
const axisStrokeWidth = 1
const axisTextSize = 20

//zoom constants
const maxZoomLevel = 100;

//legend creation
const legendFontSize = 14;
const pxTextFont = "px sans-serif";

function findAngle(A, B, C) {
  var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
}

function AreaChart(props) {
  var graphSize = { width: 525, height: 425 }
  if (props.dimensions !== undefined) {
    graphSize = props.dimensions
  }

  const width = graphSize.width - margin.left - margin.right;
  const height = graphSize.height - margin.bottom - margin.top;

  var axisTitles = (props.axisTitles !== undefined) ? props.axisTitles : { x: props.x, y: props.y };
  var emptyTitlesCheck = (axisTitles.x !== "" || axisTitles.y !== "")
  axisTitles = emptyTitlesCheck ? axisTitles : { x: props.x, y: props.y };
  var customTitles = emptyTitlesCheck ? true : false;
  const showTitle = props.hasOwnProperty("showTitle") ? props.showTitle : true

  const group = props.hasOwnProperty("group") ? props.group : "Strain %"

  var ref = useRef();
  useEffect(() => {
    let formattedData = [];
    let sampleNames = new Set();
    let amplitudeNames = new Set();
    props.data.forEach((d) => {
      if (d.fileName !== props.fileName && group === ("Strain %" || "All")) {
        return [];
      }

      if (!d.data.hasOwnProperty(props.x)) {
        return [];
      }

      let newData = []
      let dataCut = d.data;
      dataCut[props.x].forEach((e, i) => {
        newData.push({ x: e, y: dataCut[props.y][i] });
      });

      sampleNames.add(d.name)
      amplitudeNames.add(parseFloat(d.strainPercent))
      if (group !== "Strain %" && group !== "All") {
        if ((d.strainPercent + "%") === group) {
          formattedData.push({ name: d.name, amplitude: d.strainPercent, data: newData });
        }
      } else {
        formattedData.push({ name: d.name, amplitude: d.strainPercent, data: newData });
      }
    });
    sampleNames = [...sampleNames];
    amplitudeNames = [...amplitudeNames];
    amplitudeNames.sort((a, b) => b - a);

    let cutData = [];
    formattedData.forEach((sheet) => {
      let data = sheet.data;

      let sortedData = [...data];
      // Sort by x-values
      sortedData.sort((a, b) => {
        return a.x - b.x;
      });

      // Calculate needed angle to get a nice graph
      let angleRad = 0
      if (data.length > 2) {
        const index = Math.round(data.length / 2)

        var prefix = 1;
        if (sortedData[index].y < 0) {
          prefix = -1;
        }

        angleRad = findAngle(sortedData[index], { x: 0, y: 0 }, { x: 0, y: prefix * sortedData[index].y });
      }

      // Calculate new point after rotation
      data = data.map((i) => {
        return {
          x: 0 + (i.x - 0) * Math.cos(angleRad) - (i.y - 0) * Math.sin(angleRad),
          y: 0 + (i.y - 0) * Math.cos(angleRad) + (i.x - 0) * Math.sin(angleRad)
        }
      });

      // Filter all negative values out
      data = data.filter(i => i.y >= 0);

      // Sort by x-values
      /*
      data.sort((a, b) => {
        return a.x - b.x;
      });
      */

      cutData.push({ name: sheet.name, amplitude: sheet.amplitude, data: data })
    })

    const xMax = Math.max(...cutData.map((sheet) => { return Math.max(...sheet.data.map((point) => { return point.x })) }));
    const yMax = Math.max(...cutData.map((sheet) => { return Math.max(...sheet.data.map((point) => { return point.y })) }));

    const xMin = Math.min(...cutData.map((sheet) => { return Math.min(...sheet.data.map((point) => { return point.x })) }));
    const yMin = Math.min(...cutData.map((sheet) => { return Math.min(...sheet.data.map((point) => { return point.y })) }));

    //x-axis scaling
    var x = d3.scaleLinear()
      .domain([xMin - (-xMin / 22), xMax + (xMax / 22)])
      .range([0, width])

    //y-axis scaling
    var y = d3.scaleLinear()
      .domain([yMin - (-yMin / 22), yMax + (yMax / 22)])
      .range([height, 0])

    const svgElement = d3.select(ref.current)
    svgElement.selectAll("*").remove();

    // append the svg object to the body of the page
    var svg = svgElement
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var innerSvg = svg.append("svg")
      .attr("id", "innerSVG")
      .attr("width", width)
      .attr("height", height)

    innerSvg.append('clipPath')
      .attr("id", "rect-clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0)
      .style("fill", "green")

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("id", "xAxis")
      .attr("class", "axis")
      .style("stroke-width", axisStrokeWidth)
      .style("font", tickTextSize + pxTextFont)
      .call(d3.axisBottom(x).tickSize(6).ticks(xTickamount, "s"));

    svg.append("g")
      .attr("id", "yAxis")
      .attr("class", "axis")
      .style("stroke-width", axisStrokeWidth)
      .style("font", tickTextSize + pxTextFont)
      .call(d3.axisLeft(y).tickSize(6).ticks(yTickamount, "s"));

    if (showTitle || customTitles) {
      //x-axis title
      svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .style("font", axisTextSize + pxTextFont)
        .text(axisTitles.x)

      //y-axis title
      svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("transform", "rotate(-90)")
        .style("font", axisTextSize + pxTextFont)
        .text(axisTitles.y);
    }

    // Creating the color scale
    var colorScaleStrain = d3.scaleSequential()
      .interpolator(d3.interpolatePlasma)
      .domain([0, amplitudeNames.length]);

    // Color palette
    var colorScale = d3.scaleOrdinal()
      .domain(sampleNames)
      .range(SamplesColors)

    const brightConstant = 7 / amplitudeNames.length;

    // Creating the area
    const areaPath = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x((d) => x(d.x))
      .y0(y(0))
      .y1((d) => y(d.y));

    var drawnPaths = []
    cutData.sort((a, b) => b.amplitude - a.amplitude);
    cutData.forEach((sheet) => {
      let brightness = 2 / brightConstant;
      if (group === "All") {
        brightness = amplitudeNames.indexOf(parseFloat(sheet.amplitude));
      }

      var drawnPath = innerSvg.append("path")
        .data([sheet.data])
        .attr("class", "line")
        .attr("fill", group === "Strain %" ? colorScaleStrain(amplitudeNames.indexOf(parseFloat(sheet.amplitude))) : d3.color(colorScale(sheet.name)).brighter(brightness * brightConstant))
        .attr("fill-opacity", group === "All" ? ".8" : ".6")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("vector-effect", "non-scaling-stroke")
        .attr("d", areaPath);
      drawnPaths.push(drawnPath);
    })

    //LEGEND
    let yshift = 0;
    if (group !== "Strain %") {
      sampleNames.forEach((s) => {
        let colorName = colorScale(s);
        svgElement.append("text")
          .attr("x", graphSize.width - 40)
          .attr("y", 16 + yshift)
          .text(s)

        svgElement.append("rect")
          .attr("x", graphSize.width - 50)
          .attr("y", 7 + yshift)
          .attr('width', 8)
          .attr('height', 8)
          .style("fill", d3.color(colorName).brighter(2))
          .style("stroke", d3.color(colorName).brighter(2))
          .style("stroke-width", "1.5px")
        yshift += 20;
      });
    }

    let yshiftStrain = 16;
    if (group === "All" || group === "Strain %") {
      amplitudeNames.forEach((a) => {
        let colorName = "#2b2b2b";
        let brightness = amplitudeNames.indexOf(parseFloat(a));
        svgElement.append("text")
          .attr("x", graphSize.width - 85)
          .attr("y", yshiftStrain)
          .text(a)

        svgElement.append("text")
          .attr("x", graphSize.width - 100)
          .attr("y", yshiftStrain)
          .text("%")

        svgElement.append("rect")
          .attr("x", graphSize.width - 110)
          .attr("y", yshiftStrain - 9)
          .attr('width', 8)
          .attr('height', 8)
          .style("fill", group === "Strain %" ? colorScaleStrain(amplitudeNames.indexOf(parseFloat(a))) : d3.color(colorName).brighter(brightness * brightConstant))
        yshiftStrain += 16
      });
    }

    var rect = innerSvg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0)
      .style("fill", "none")
      .style("pointer-events", "all")

    //Zooming section
    var zoom = d3.zoom()
      .scaleExtent([0.5, maxZoomLevel])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    //updates our chart based on zoom, setting new x,y restraint etc.
    function zoomed(event) {
      var updatedx = event.transform.rescaleX(x);
      var updatedy = event.transform.rescaleY(y);

      //apply new axis to x and y. transition is optional - can be added.
      svg.selectAll("#xAxisGrid").call(d3.axisBottom(updatedx).tickSize(-height).tickFormat('').ticks(xTickamount, "s").tickSizeOuter(0));
      svg.selectAll("#xAxis").call(d3.axisBottom(updatedx).tickSize(6).ticks(xTickamount, "s"));
      svg.selectAll("#yAxis").call(d3.axisLeft(updatedy).tickSize(6).ticks(yTickamount, "s"));
      svg.selectAll("#yAxisGrid").call(d3.axisLeft(updatedy).tickSize(-width).tickFormat('').ticks(yTickamount, "s").tickSizeOuter(0));
      svg.selectAll("#xAxis").selectAll(".tick text").attr("dy", 20)
      //change line's position when zooming
      drawnPaths.forEach((path) => {
        path.attr("transform", event.transform);
      })
    }

    //zoom call, after lines are created
    rect.call(zoom)
  }, [props]);

  return (
    <svg
      id={props.exportSvg}
      ref={ref}
      width={graphSize.width}
      height={graphSize.height}
    />
  );
}

export default AreaChart;