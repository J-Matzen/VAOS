import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "d3";
import { useSelector } from 'react-redux';
import { PerfectElasticColor, PerfectViscousColor, SamplesColors } from '../../constants/colors';
import { ElasticStress, PerfectElastic, PerfectViscous, ViscousStress } from '../../constants/attributes';

// set the dimensions and margins of the graph
const margin = { top: 20, right: 20, bottom: 50, left: 20 }

function SimilarityNetwork(props) {
  const graphSize = props.hasOwnProperty("dimensions") ? props.dimensions : { width: 525, height: 425 }
  const width = graphSize.width - margin.left - margin.right;
  const height = graphSize.height - margin.bottom - margin.top;
  const elasticSimilarity = useSelector((state) => state.similarity.elasticSimilarities)
  const viscousSimilarity = useSelector((state) => state.similarity.viscousSimilarities)

  const oldLegends = props.hasOwnProperty("oldLegends") ? props.oldLegends : true

  // const oldLegends = true;

  var similarityData = viscousSimilarity;
  var stress = PerfectViscous;
  if (props.projection === "Elastic") {
    similarityData = elasticSimilarity;
    stress = PerfectElastic;
  }

  var ref = useRef()
  useEffect(() => {
    let sampleNames = new Set();
    let amplitudeNames = new Set();
    similarityData.forEach(sheet => {
      if (sheet.first === stress) {
        return;
      }
      let split = sheet.first.split(" ");

      if(isNaN(split[1])) {
        sampleNames.add(sheet.first)
      } else {
        sampleNames.add(split[0])
        amplitudeNames.add(parseFloat(split[1]))
      }
    });
    sampleNames = [...sampleNames];
    amplitudeNames = [...amplitudeNames];
    amplitudeNames.sort((a, b) => b - a);

    /////////////////////////////////////////////
    ////////Preprocessing to fit library////////
    ///////////////////////////////////////////
    var nodeNames = new Set();
    var incrementID = 0;
    var nodes = []
    similarityData.forEach((sheet) => {
      if (nodeNames.has(sheet.first.replace(/(\s+|,+|\.+)/g, ''))) {
        return;
      }


      if (sheet.first === stress) {
        nodes.push({ "id": incrementID, "name": sheet.first, type: d3.symbolsFill[0], size: 50 })
      } else {
        let sample = sheet.first.split(" ")[0];
        let symbolID = sampleNames.indexOf(sample);
        nodes.push({ "id": incrementID, "name": sheet.first, type: (symbolID+1 <= 6) ? d3.symbolsFill[symbolID + 1] : d3.symbolsFill[1]  , size: 50 })
      }
      nodeNames.add(sheet.first.replace(/(\s+|,+|\.+)/g, ''))
      incrementID = incrementID + 1;
    })
    nodeNames = [...nodeNames];

    var similaritiesArray = []
    var edges = []
    similarityData.forEach((edge, index) => {
      similaritiesArray.push(Math.sqrt(1 - (edge.similarityPercent / 100) ** 2))
    })

    var distance = d3.scaleLinear()
      .domain(d3.extent(similaritiesArray))
      .range([10, 350])

    similarityData.forEach((edge, index) => {
      if (edge.first !== edge.second) {
        let first = nodeNames.indexOf(edge.first.replace(/(\s+|,+|\.+)/g, ''));
        let second = nodeNames.indexOf(edge.second.replace(/(\s+|,+|\.+)/g, ''));
        edges.push({ "source": first, "target": second, similarity: Math.max(0, edge.similarityPercent), distance: distance(Math.sqrt(1 - (edge.similarityPercent / 100) ** 2)) })
      }
    })

    ///////////////////////////////////////////////////////////////////////////
    //////////////////// Graph Creation
    ///////////////////////////////////////////////////////////////////////////	
    const svgElement = d3.select(ref.current)
    svgElement.selectAll("*").remove();

    svgElement.append("rect")
      .attr("width", graphSize.width)
      .attr("height", graphSize.height)
      .attr("x", 0)
      .attr("y", 0)
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .style("fill", "none")

    // append the svg object to the body of the page
    var svg = svgElement
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")

    var rect = svg.append("rect")
      .attr("width", graphSize.width)
      .attr("height", graphSize.height)
      .attr("x", 0)
      .attr("y", 0)
      .style("fill", "none")
      .style("pointer-events", "all")

    var simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(5))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", d3.forceLink(edges).id(d => d.id).distance(d => (d.distance)))
      .force("collide", d3.forceCollide(7))
      .on("tick", tick)

    //changes speed of simulation
    simulation.velocityDecay(0.8)
    simulation.alphaDecay(0.001)

    // color palette
    var color = d3.scaleOrdinal()
      .domain(sampleNames)
      .range(SamplesColors)

    if (oldLegends) {
      color.domain(amplitudeNames)
    }

    // Initialize the links
    var link = svg
      .selectAll("line")
      .data(edges)
      .enter()
      .append("line")
      .attr("id", d => { return d.source.name.replace(/(\s+|,+|\.+)/g, '') })
      .attr("class", "netLine")
      .style("stroke", "#aaa")
      .style("stroke-width", 2)
      .attr("opacity", 0)
      //helps size the strokes when zooming
      .attr("vector-effect", "non-scaling-stroke")
      .style("fill", "none")
      .on("mouseover", () => {
        tooltip.style("opacity", 1)
      })
      .on("mousemove", function (event, obj) {
        //only display tooltip if opacity is 1
        if (d3.select(this).style("opacity") != 0) {
          tooltip
            .html("Similarity:<br> " + obj.similarity + "<br> Source:" + obj.source.name + "<br> Target:" + obj.target.name)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
        }
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0)
      });

    var perfectColor = PerfectViscousColor;
    if (props.projection === "Elastic") {
      perfectColor = PerfectElasticColor;
    }

    const brightConstant = 0.9

    var lineOpacityToggle = false
    var previousClickedSample = ""
    var node = svg.selectAll("path")
      .data(nodes)
      .enter().append("path")
      .attr("class", function (d) { return "simNet " + d.name.replace(/(\s+|,+|\.+)/g, ''); })
      .attr("d", d3.symbol()
        .size(function (d) { return d.size; })
        .type(function (d) { return d.type; }))
      .style("fill", (d) => {
        let split = d.name.split(" ");
        var colorName = split[1];
        var brightness = 2 / 0.9;
        if (!oldLegends) {
          colorName = split[0];
          brightness = amplitudeNames.indexOf(parseFloat(split[1]));
        }
        return (d.name === stress) ? perfectColor : d3.color(color(colorName)).brighter(brightness * brightConstant)
      })
      .style("stroke", (d) => {
        let split = d.name.split(" ");
        var colorName = split[1];
        if (!oldLegends) {
          colorName = split[0];
        }
        return (d.name === stress) ? perfectColor : d3.color(color(colorName)).brighter(2)
      })
      .style("stroke-width", "1px")
      // .attr("vector-effect", "non-scaling-stroke")
      .on("mouseover", (event, obj) => {
        tooltip.style("opacity", 1)
      })
      .on("mousemove", function (event, obj) {
        tooltip
          .html("Sample:<br> " + obj.name)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY) + "px")
      })
      .on("mouseleave", (event, obj) => {
        tooltip.style("opacity", 0)
      })
      .on("click", (event, obj) => {
        var result = click(event, obj, previousClickedSample, lineOpacityToggle, svg);
        previousClickedSample = result.newPreviousClickedSample;
        lineOpacityToggle = result.newLineOpacityToggle;
      });

    //LEGEND
    let yshift = 0;
    let yshiftStrain = 16;
    var previousName = ""
    var strains = new Set();
    nodes.forEach((sheet) => {
      // Create sample symbols + coloring
      let sheetNameSplit = sheet.name.split(" ")
      if (isNaN(sheetNameSplit[1])) {
        sheetNameSplit = [sheet.name, undefined]
      }
      
      if (sheetNameSplit[0] != previousName) {
        previousName = sheetNameSplit[0]

        let colorName = "#2b2b2b";
        if (!oldLegends) {
          colorName = color(sheetNameSplit[0]);
        }

        svgElement.append("text")
          .attr("x", graphSize.width - 95)
          .attr("y", 16 + yshift)
          .text(sheetNameSplit[0])

        svgElement.append("path")
          .attr("d", d3.symbol()
            .size(function (d) { return sheet.size; })
            .type(function (d) { return sheet.type; }))
          .style("fill", (sheet.name === stress) ? perfectColor : d3.color(colorName).brighter(2))
          .style("stroke", (sheet.name === stress) ? perfectColor : d3.color(colorName).brighter(2))
          .style("stroke-width", "1.5px")
          .attr("transform", (d, i) => { return 'translate(' + (graphSize.width - 105) + ',' + (11 + yshift) + ')' })
        yshift += 15;
      }

      // Create amplitude labels and coloring
      if (!strains.has(sheetNameSplit[1]) && sheetNameSplit[1] != undefined) {
        strains.add(sheetNameSplit[1])

        let colorName = color(sheetNameSplit[1]);
        let brightness = 2 / 0.9;
        if (!oldLegends) {
          colorName = "#2b2b2b";
          brightness = amplitudeNames.indexOf(parseFloat(sheetNameSplit[1]));
        }

        svgElement.append("text")
          .attr("x", graphSize.width - 145)
          .attr("y", yshiftStrain)
          .style("fill", d3.color(colorName).brighter(brightness * brightConstant))
          .text(sheetNameSplit[1])

        svgElement.append("text")
          .attr("x", graphSize.width - 160)
          .attr("y", yshiftStrain)
          .style("fill", d3.color(colorName).brighter(brightness * brightConstant))
          .text("%")

        svgElement.append("rect")
          .attr("x", graphSize.width - 175)
          .attr("y", yshiftStrain - 9)
          .attr('width', 8)
          .attr('height', 8)
          .style("fill", d3.color(colorName).brighter(brightness * brightConstant))
        yshiftStrain += 16
      }
    })

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function tick() {
      link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });
      node
        .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }

    //add zoom capabilities 
    var zoom = d3.zoom()
      .scaleExtent([1, 25])
      .extent([[0, 0], [graphSize.width, graphSize.height]])
      .on("zoom", zoomed);

    //Zoom functions 
    function zoomed(event) {
      svg.attr("transform", event.transform)
    }

    //zoom call, after lines are created
    zoom(rect)

    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("text-align", "center")
      .style("font", "15px sans-serif")

  }, [props.projection, props.dimensions, props.data, props.oldLegends])

  function click(event, obj, previousClickedSample, lineOpacityToggle, svg) {
    var newLineOpacityToggle = false
    var newPreviousClickedSample = ""
    var clickedSample = "#" + obj.name.replace(/(\s+|,+|\.+)/g, '')
    if (!lineOpacityToggle && clickedSample === previousClickedSample) {
      var unclickedElsewhere = false;
      svg.selectAll(previousClickedSample).each(function () {
        if (d3.select(this).style('opacity') === '1') {
          unclickedElsewhere = true;
        }
      });

      if (unclickedElsewhere) {
        lineOpacityToggle = false;
      }
    }

    if (!lineOpacityToggle || clickedSample !== previousClickedSample) {
      if (previousClickedSample !== "") {
        svg.selectAll(previousClickedSample).style("opacity", 0)
      }
      newPreviousClickedSample = clickedSample;
      newLineOpacityToggle = true
      d3.selectAll(".simNet").style('opacity', .2);
      d3.selectAll(".simLine").style('opacity', .2);
      d3.selectAll(".simLineLabel").style('opacity', .2);
      d3.selectAll(".simHeat").style('opacity', .2);
      d3.selectAll("." + obj.name.replace(/(\s+|,+|\.+)/g, '')).style('opacity', 1);
      // svg.selectAll(newPreviousClickedSample).style("opacity", 1)
      // svg.selectAll("line").attr("pointer-events", "none")
    } else {
      newLineOpacityToggle = false
      d3.selectAll(".simNet").style('opacity', 1);
      d3.selectAll(".simLine").style('opacity', 1);
      d3.selectAll(".simHeat").style('opacity', 1);
      d3.selectAll(".simLineLabel").style('opacity', 1);
      // svg.selectAll("line").style("opacity", 0).attr("pointer-events", "all")
    }

    return { newPreviousClickedSample, newLineOpacityToggle }
  }

  return (
    <svg
      id={props.exportSvg}
      ref={ref}
      width={graphSize.width}
      height={graphSize.height}
    />
  );
}
export default SimilarityNetwork