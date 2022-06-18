import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";
import { useSelector } from 'react-redux';
import { PerfectElasticColor, PerfectViscousColor, SamplesColors } from '../../constants/colors';
import { ElasticStress, PerfectElastic, PerfectViscous, ViscousStress } from '../../constants/attributes';

// set the dimensions and margins of the graph
const margin = { top: 40, right: 100, bottom: 40, left: 40 }

function SimilarityChart(props) {
  const elasticSimilarity = useSelector((state) => state.similarity.elasticLissajousLineData)
  const viscousSimilarity = useSelector((state) => state.similarity.viscousLissajousLineData)

  const graphSize = props.hasOwnProperty("dimensions") ? props.dimensions : { width: 525, height: 425 }
  const width = graphSize.width - margin.left - margin.right;
  const height = graphSize.height - margin.bottom - margin.top;

  const ref = useRef()
  useEffect(() => {
    var data = viscousSimilarity;
    var perfectName = PerfectViscous;
    var perfectColor = PerfectViscousColor;
    if (props.projection === "Elastic") {
      data = elasticSimilarity
      perfectName = PerfectElastic;
      perfectColor = PerfectElasticColor;
    }

    let sampleNames = new Set();
    let amplitudeNames = new Set();
    data.forEach(sheet => {
      if (sheet.name === perfectName) {
        return;
      }

      let split = sheet.name.split(" ");
      sampleNames.add(split[0])
      amplitudeNames.add(parseFloat(split[1]))
    });
    sampleNames = [...sampleNames];
    amplitudeNames = [...amplitudeNames];
    amplitudeNames.sort((a, b) => b - a);

    const yMax = Math.max(...data.map((sheet) => { return Math.max(...sheet.data.map((point) => { return point.dist })) }));
    const xLength = data.length > 1 ? data[0].data.length : 1

    //x-axis scaling
    var x = d3.scaleLinear()
      //.domain([xMin + (xMin / 22), xMax + (xMax / 22)])
      .domain([0, xLength])
      .range([0, width])

    //y-axis scaling
    var y = d3.scaleLinear()
      //.domain([yMin + (yMin / 22), yMax + (yMax / 22)])
      .domain([0, yMax + (yMax / 22)])
      .range([height, 0])

    // color palette
    var color = d3.scaleOrdinal()
      .domain(sampleNames)
      .range(SamplesColors)

    const svgElement = d3.select(ref.current)
    svgElement.selectAll("*").remove();

    // append the svg object to the body of the page
    var svg = svgElement
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    const brightConstant = 0.9

    data.forEach((sheet) => {
      let split = sheet.name.split(" ");
      let brightness = split[1] === undefined ? 0 : amplitudeNames.indexOf(parseFloat(split[1]));

      svg.append("path")
        .data([sheet.data])
        .attr("class", "simLine " + sheet.name.replace(/(\s+|,+|\.+)/g, ''))
        .attr("fill", "none")
        .style("stroke", sheet.name === perfectName ? perfectColor : d3.color(color(split[0])).brighter(brightness * brightConstant))
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function (d) { return x(d.x); })
          .y(function (d) { return y(d.dist); })
        )
    })

    var lineOpacityToggle = false
    var previousClickedSample = ""
    let yshift = 0;
    data.forEach((sheet) => {
      let split = sheet.name.split(" ");
      let brightness = split[1] == undefined ? 0 : amplitudeNames.indexOf(parseFloat(split[1]));

      svg.append("text")
        .attr("x", width)
        .attr("y", 0 + yshift)
        .attr("class", "simLineLabel " + sheet.name.replace(/(\s+|,+|\.+)/g, ''))
        .datum({ name: sheet.name })
        .style("fill", sheet.name === perfectName ? perfectColor : d3.color(color(split[0])).brighter(brightness * brightConstant))
        .style("stroke", sheet.name === perfectName ? perfectColor : d3.color(color(split[0])).brighter(2))
        .style("stroke-width", "0.5px")
        .style("pointer-events", "stroke")
        .text(sheet.name)
        .on("click", (event, obj) => {
          var result = click(event, obj, previousClickedSample, lineOpacityToggle);
          previousClickedSample = result.newPreviousClickedSample;
          lineOpacityToggle = result.newLineOpacityToggle;
        })

      yshift += 15;
    })

    function click(event, obj, previousClickedSample, lineOpacityToggle) {
      var newLineOpacityToggle = false
      var newPreviousClickedSample = ""
      var clickedSample = obj.name.replace(/(\s+|,+|\.+)/g, '')
      if (!lineOpacityToggle || clickedSample !== previousClickedSample) {
        if (previousClickedSample !== "") {
        }
        newPreviousClickedSample = clickedSample;
        newLineOpacityToggle = true
        d3.selectAll(".simNet").style('opacity', .2);
        d3.selectAll(".simLine").style('opacity', .2);
        d3.selectAll(".simLineLabel").style('opacity', .2);
        d3.selectAll(".simHeat").style('opacity', .2);
        d3.selectAll(".netLine").style("opacity", 0)
        d3.selectAll("." + clickedSample).style('opacity', 1);
      } else {
        newLineOpacityToggle = false
        d3.selectAll(".simNet").style('opacity', 1);
        d3.selectAll(".simLine").style('opacity', 1);
        d3.selectAll(".simHeat").style('opacity', 1);
        d3.selectAll(".simLineLabel").style('opacity', 1);
      }
      return { newPreviousClickedSample, newLineOpacityToggle }
    }

  }, [props, elasticSimilarity]);

  return (
    <svg
      id={props.exportSvg}
      ref={ref}
      width={graphSize.width}
      height={graphSize.height}
    />
  );
}

export default SimilarityChart;