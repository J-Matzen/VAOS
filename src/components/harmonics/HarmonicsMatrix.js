import React, { useEffect, useRef } from 'react';
import { analyseData } from '../data/Processing'
import * as d3 from "d3";
import { useSelector } from 'react-redux';
import { createLissajous } from '../visualizations/Lissajous';

// set the dimensions and margins of the graph
const dimensions = {
  width: 1000,
  height: 800
}

var width = dimensions.width
var height = dimensions.height

function HarmonicsMatrix(props) {
  const preprocessed = useSelector((state) => state.data.preprocessedData)
  var harmonics = ["1", "3", "5", "7", "9", "15", "27", "29"]
  const ref = useRef();
  useEffect(() => {
    const svgElement = d3.select(ref.current)
    svgElement.selectAll("*").remove();
    const graphSize = props.hasOwnProperty("graphSize") ? props.graphSize : dimensions
    const data = { svg: svgElement, projection: props.projection, xName: props.x, yName: props.y, preprocessed: preprocessed }
    createHarmonicsMatrix(data, { graphSize: graphSize, colors: props.colors, harmonics: harmonics })
  }, [props])

  return (
    <svg
      ref={ref}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
}


export function createHarmonicsMatrix(data, settings) {
  var margin = {
    top: 20,
    right: 0,
    bottom: 50,
    left: 75
  }

  const translation = settings.hasOwnProperty("translation") ? settings.translation : { x: margin.left, y: margin.top }
  const graphSize = settings.hasOwnProperty("graphSize") ? settings.graphSize : { width: 325, height: 325 }
  const innerGraphSize = {
    width: graphSize.width - margin.right - margin.left,
    height: graphSize.height - margin.top - margin.bottom
  }

  var preprocessed = data.preprocessed
  var sampleNames = []
  var defaultSettings = { "highestHarmonic": 0, "pointPrQuarter": 300 }

  //preprocesses the data, does lissajous calculations for each chosen file/sheet and for each chosenHarmonic.
  function createArrayOfHarmonicsAnalysedData(harmonics, preprocessedData, nrOfColumns) {
    var analysedData = [];
    preprocessedData.forEach((preprocesseddata) => {
      sampleNames.push(preprocesseddata.name + " - " + preprocesseddata.strainPercent + "%")
      //for each sample, analyse the data for each harmonic.
      analysedData.push(analyseDataForAllHarmonics(harmonics, preprocesseddata.data, nrOfColumns, preprocesseddata.freq));
    })

    return analysedData
  }

  //analyses data based on default settings and harmonics.
  function analyseDataForAllHarmonics(harmonics, preprocessedData, nrOfColumns, frequency) {
    var analysedData = [];
    for (let i = 0; i < nrOfColumns; i++) {
      defaultSettings.highestHarmonic = harmonics[i];
      analysedData.push(analyseData(preprocessedData, frequency, defaultSettings, null));
    }
    return analysedData;
  }

  // //sorting of preprocessed data before doing pipkin preprocessing
  preprocessed = [...preprocessed].sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  })

  //preprocess data
  var nrOfColumns = settings.harmonics.length
  var harmonicsData = createArrayOfHarmonicsAnalysedData(settings.harmonics, preprocessed, nrOfColumns)

  const elementSize = ((settings.harmonics.length) > sampleNames.length) ? Math.floor(innerGraphSize.width / (settings.harmonics.length)) - 10 : Math.floor(innerGraphSize.height / sampleNames.length);
  //everything matrix related
  // append the svg object to the body of the page

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Set up and initiate svg containers
  ///////////////////////////////////////////////////////////////////////////	
  const svgElement = data.svg
  var svg = svgElement
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .append("g")
    .attr("transform", "translate(" + translation.x + "," + translation.y + ")")

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Axis and axis scales
  ///////////////////////////////////////////////////////////////////////////	
  const y = d3
    .scaleBand()
    .range([innerGraphSize.height, 0])
    .domain(sampleNames.map((d) => { return d }));

  const x = d3
    .scaleBand()
    .domain(settings.harmonics)
    .range([0, innerGraphSize.width])
    .paddingInner(0.2)
    .paddingOuter(0.1)

  var xAxis = d3.axisBottom(x)

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${innerGraphSize.height})`)
    .call(xAxis);

  //x-axis title
  svg.append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "end")
    .attr("x", (innerGraphSize.width + margin.left) / 2)
    .attr("y", innerGraphSize.height + margin.bottom / 1.2)
    .text("Harmonics")

  svg.append("g")
    .call(d3.axisLeft(y));

  //y-axis title
  svg.append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "end")
    .attr("x", -(innerGraphSize.height - margin.top) / 2)
    .attr("y", -64)
    .attr("transform", "rotate(-90)")
    .text(data.yName);

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Add lissajous curves
  ///////////////////////////////////////////////////////////////////////////
  const lissajousSize = { width: (elementSize * 0.9), height: (elementSize * 0.9) }

  var lissajousSettings = {
    svg: svg,
    graphSize: lissajousSize,
    translation: { x: 0, y: 0 },
    showAxis: false,
    showTitle: false,
    enableLegend: false,
    tickTextSize: 7.5,
    axisTextSize: 15,
    yTicks: 2,
    yTickSize: 2,
    showXTicks: false,
    xAxisTicksTextYTranslation: 7.5,
    enableZoom: false
  }

  //for each sample, create lissajous curve for each harmonic
  harmonicsData.forEach((sample, j) => {
    for (let i = 0; i < nrOfColumns; i++) {
      const maxStress = Math.max.apply(Math, sample[i]["Stress [Pa]"]);
      createPascalText(svg, x, settings.harmonics[i], y, sampleNames[j], maxStress, elementSize);

      const lissajousData = { data: sample[i], xName: data.projection.x, yName: data.projection.y, extraYName: data.projection.z, colors: ["#004873", "#A20059", "#33cc66"] };
      const xTranslation = x(settings.harmonics[i]) + x.bandwidth() / 2 - lissajousSize.width / 2
      const yTranslation = y(sampleNames[j]) + y.bandwidth() / 2 - lissajousSize.height / 2
      lissajousSettings.translation = { x: xTranslation, y: yTranslation }
      createLissajous(lissajousData, lissajousSettings);
    }
  })
}

//create small text label showing max stress in Pa:
function createPascalText(svg, x, xvalue, y, yvalue, maxStress, size) {
  if (maxStress !== -Infinity) {
    svg.append("text")
      .attr("transform", "translate(" + (x(xvalue) + x.bandwidth() / 2 - (size / 2)) + "," + (y(yvalue) + y.bandwidth() / 2 - (size / 2)) + ")")
      .style("font", "10px sans-serif")
      .text(maxStress.toFixed(1) + " Pa");
  }
}

export default HarmonicsMatrix;