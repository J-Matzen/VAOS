import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";
import * as attr from '../../constants/plotAttributes';

const dimensions = {
  width: 545,
  height: 425,
};

function Heatmap(props) {
  const [graphSize, setGraphSize] = React.useState(dimensions)
  var ref = useRef()

  useEffect(() => {
    const svgElement = d3.select(ref.current)
    svgElement.selectAll("*").remove();
    const data = { svg: svgElement, data: props.data, xName: props.x, yName: props.y, valueName: props.value }
    if (props.graphSize !== undefined) {
      setGraphSize(props.graphSize)
    }
    createHeatmap(data, { graphSize: graphSize, harmonics: props.harmonics, showTitle: props.showTitle, axisTitles: props.axisTitles })

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
  graphSize: {width: 325, height: 325},
  translation: {x: , y: },
  xAxis: "Samples"
}
*/

/*
data = {
  svg: ,
  data: ,
  xName: ,
  yName: ,
  valueName: ,
}
*/
export function createHeatmap(data, settings) {
  const svgElement = data.svg;
  const graphSize = settings.hasOwnProperty("graphSize") ? settings.graphSize : { width: 325, height: 325 }

  var showTitle = settings.hasOwnProperty("showTitle") ? settings.showTitle : true
  var axisTitles = (settings.axisTitles !== undefined) ? settings.axisTitles : { x: data.xName, y: data.yName };
  var emptyTitlesCheck = (axisTitles.x !== "" || axisTitles.y !== "")
  axisTitles = emptyTitlesCheck ? axisTitles : { x: data.xName, y: data.yName };
  var customTitles = emptyTitlesCheck ? true : false;

  var frequencies = new Set()
  var strainAmplitudes = new Set()
  var sampleNames = new Set()
  var formattedData = [];
  var axisMap = {}
  var maxValue = -999999999999
  var minValue = 99999999999999
  if (settings.harmonics === undefined) {
    data.data.forEach((sample) => {
      // push each frequency to an array, and map samplenames to its multiple strain amplitudes
      strainAmplitudes.add(sample.strainPercent)
      frequencies.add(sample.freq)
      sampleNames.add(sample.name)
      formattedData.push({ "Samples": sample.name, data: sample.data, "Frequency": sample.freq, "Strain %": sample.strainPercent })
    });
    formattedData = formattedData.map((e) => { return { x: e[data.xName], y: e[data.yName], value: e.data[data.valueName] } })
    axisMap = { "Frequency": Array.from(frequencies), "Strain %": Array.from(strainAmplitudes), "Samples": Array.from(sampleNames) }
    var tempMaxValue = Math.max.apply(Math, formattedData.map(function (o) { return o.value }))
    var tempMinValue = Math.min.apply(Math, formattedData.map(function (o) { return o.value }))
    if (tempMaxValue > maxValue) {
      maxValue = tempMaxValue
    }
    if (tempMinValue < minValue) {
      minValue = tempMinValue
    }
  } else {
    data.data.forEach((sample) => {
      sample.data.forEach((harmonic) => {
        // push each frequency to an array, and map samplenames to its multiple strain amplitudes
        frequencies.add(sample.strainPercent)

        strainAmplitudes.add(harmonic["Harmonics"])
        sampleNames.add(sample.name)
        formattedData.push({ "Samples": sample.name, data: harmonic, "Strain %": sample.strainPercent, "Harmonics": harmonic["Harmonics"] })
      }
      )
      var tempMaxValue = Math.max.apply(Math, sample.data.map(function (o) { return o.Power }))
      var tempMinValue = Math.min.apply(Math, sample.data.map(function (o) { return o.Power }))
      if (tempMaxValue > maxValue) {
        maxValue = tempMaxValue
      }
      if (tempMinValue < minValue) {
        minValue = tempMinValue
      }
    });
    formattedData = formattedData.map((e) => { return { x: e[data.xName], y: e[data.yName], value: e.data[data.valueName] } })
    axisMap = { "Strain %": Array.from(frequencies), "Harmonics": Array.from(strainAmplitudes), "Samples": Array.from(sampleNames) }
  }

  const margin = {
    top: 20,
    right: 65,
    bottom: 75,
    left: 75
  };
  const translation = settings.hasOwnProperty("translation") ? settings.translation : { x: margin.left, y: margin.top }
  const innerGraphSize = {
    width: graphSize.width - margin.right - margin.left,
    height: graphSize.height - margin.top - margin.bottom
  }

  const gridSize = (axisMap[data.xName].length > axisMap[data.yName].length) ? Math.floor(innerGraphSize.width / axisMap[data.xName].length) : Math.floor(innerGraphSize.height / axisMap[data.yName].length);
  const gridHeight = gridSize * axisMap[data.yName].length;
  const gridWidth = gridSize * axisMap[data.xName].length;


  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Set up and initiate svg containers
  ///////////////////////////////////////////////////////////////////////////	
  var svg = svgElement
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(" + translation.x + "," + translation.y + ")")

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Axis and axis scales
  ///////////////////////////////////////////////////////////////////////////	
  var x = d3.scaleBand()
    .range([0, gridWidth])
    .domain(axisMap[data.xName])
    .padding(0.01);

  svg.append("g")
    .attr("transform", "translate(0," + gridHeight + ")")
    .style("font", attr.tickTextSize + "px sans-serif")
    .style("stroke-width", attr.axisStrokeWidth)
    .call(d3.axisBottom(x).tickSize(attr.tickSize))

  // Build y scale and axis:
  var y = d3.scaleBand()
    .range([gridHeight, 0])
    .domain(axisMap[data.yName])
    .padding(0.01);

  svg.append("g")
    .style("font", attr.tickTextSize + "px sans-serif")
    .style("stroke-width", attr.axisStrokeWidth)
    .call(d3.axisLeft(y).tickSize(attr.tickSize));

  if (showTitle || customTitles) {
    svg.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr('x', gridWidth / 2)
      .attr("y", gridHeight + margin.bottom - 20)
      .style("font", attr.axisTextSize + "px sans-serif")
      .text(axisTitles.x)

    svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("x", -gridHeight / 2)
      .attr("y", -margin.left + 20)
      .attr("transform", "rotate(-90)")
      .style("font", attr.axisTextSize + "px sans-serif")
      .text(axisTitles.y);
  }

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Color scale
  ///////////////////////////////////////////////////////////////////////////	
  var colorScale = d3.scaleDiverging()
    .interpolator(d3.interpolatePuOr)
    .domain([minValue, 0, maxValue]);

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Color scale legend
  ///////////////////////////////////////////////////////////////////////////	
  var countScale = d3.scaleLinear()
    .domain([minValue, maxValue])
    .range([0, gridWidth]);

  var numStops = 10;
  var countRange = countScale.domain();
  countRange[2] = countRange[1] - countRange[0];
  var countPoint = [];
  for (var i = 0; i < numStops; i++) {
    countPoint.push(i * countRange[2] / (numStops - 1) + countRange[0]);
  }

  svg.append("defs")
    .append("linearGradient")
    .attr("id", "linear-gradient")
    .attr("x1", "0%").attr("y1", "100%")
    .attr("x2", "0%").attr("y2", "0%")
    .selectAll("stop")
    .data(d3.range(numStops))
    .enter().append("stop")
    .attr("offset", function (d, i) {
      return countScale(countPoint[i]) / gridWidth;
    })
    .attr("stop-color", function (d, i) {
      return colorScale(countPoint[i]);
    });

  svg.append("rect")
    .attr("x", gridWidth + 20)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", gridHeight)
    .style("fill", "url(#linear-gradient)");

  var legendScale = d3.scaleLinear()
    .domain([maxValue, minValue])
    .range([0, gridHeight]);

  svg.append("g")
    .attr("transform", "translate(" + (gridWidth + 20 + 15) + ", 0)")
    .call(d3.axisRight(legendScale)
      .ticks(5));

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Tooltip on hover
  ///////////////////////////////////////////////////////////////////////////	
  if (settings.harmonics === undefined) {
    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("text-align", "center")
      .style("font", "15px sans-serif")
      .style("padding", "2px")
  }


  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Draw heatmap
  ///////////////////////////////////////////////////////////////////////////	
  svg.selectAll("rectHeato")
    .data(formattedData)
    .enter()
    .append("rect")
    .attr("x", function (d) { return x(d.x) })
    .attr("y", function (d) { return y(d.y) })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", function (d) { return colorScale(d.value) })
    // Three function that change the tooltip when user hover / move / leave a cell
    .on("mouseover", function (event, obj) {
      if (settings.harmonics === undefined) {
        tooltip.style("opacity", 1)
      }
    })

    .on("mousemove", function (event, obj) {
      if (settings.harmonics === undefined) {
        tooltip
          .html("Value:<br> " + obj.value)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY) + "px")
      }
    })
    .on("mouseleave", function (event, obj) {
      if (settings.harmonics === undefined) {
        tooltip.style("opacity", 0)
      }
    });

  svg.selectAll("rectText")
    .data(formattedData)
    .enter()
    .append("text")
    .attr("x", function (d) { return x(d.x) + (gridSize / 2) })
    .attr("y", function (d) { return y(d.y) + (gridSize / 2) + 5 })
    .attr("text-anchor", "middle")
    .style("font", "16px sans-serif")
    .style("fill", function (d) { return (d.value > ((maxValue) / 2)) || (d.value < ((minValue) / 2)) ? "#FFFFFF" : "#000000" })
    .text(function (d) { return d.value !== undefined ? d.value.toFixed(3) : "" });
}

export default Heatmap;