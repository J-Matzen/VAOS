import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";
import { useSelector } from 'react-redux';
import { ElasticStress, ViscousStress } from '../../constants/attributes';

// set the dimensions and margins of the graph
const margin = {
  top: 10,
  right: 85,
  bottom: 60,
  left: 60
};

function SimilarityHeatmap(props) {
  const elasticSimilarity = useSelector((state) => state.similarity.elasticSimilarities)
  const viscousSimilarity = useSelector((state) => state.similarity.viscousSimilarities)
  var data
  var stress


  const graphSize = props.hasOwnProperty("dimensions") ? props.dimensions : { width: 525, height: 425 }
  const width = graphSize.width - margin.left - margin.right;
  const height = graphSize.height - margin.bottom - margin.top;

  var ref = useRef();

  useEffect(() => {
    if (props.projection === "Elastic") {
      data = elasticSimilarity
      stress = ElasticStress
    } else {
      data = viscousSimilarity
      stress = ViscousStress
    }

    let perfectData = data.filter(sheet => ((sheet.first === stress) || (sheet.second === stress)) &&
      !((sheet.first === stress) && (sheet.second === stress)));
    perfectData = perfectData.map((sheet) => {
      let first = (sheet.first === stress) ? sheet.second : sheet.first;
      let second = (sheet.second === stress) ? sheet.first : sheet.second;

      return { first: first, second: second, similarity: sheet.similarity, similarityPercent: sheet.similarityPercent };
    })

    let noPerfectData = data.filter(sheet => ((sheet.first !== stress) && (sheet.second !== stress)) &&
      !(sheet.first === sheet.second));

    let sheetNames = new Set();
    noPerfectData.forEach(sheet => {
      sheetNames.add(sheet.first);
    });

    const svgElement = d3.select(ref.current)
    svgElement.selectAll("*").remove();

    // append the svg object to the body of the page
    var svg = svgElement
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var x = d3.scaleBand()
      .range([0, width])
      .domain(sheetNames)
      .padding(0.01);

    var y = d3.scaleBand()
      .range([height, 0])
      .domain(sheetNames)
      .padding(0.01);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    svg.append("g")
      .call(d3.axisLeft(y));

    var colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateOranges)
      .domain([0, 100]);

    ///////////////////////////////////////////////////////////////////////////
    //////////////////// Color scale legend
    ///////////////////////////////////////////////////////////////////////////	
    var countScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);

    var numStops = 10;
    var countRange = countScale.domain();
    countRange[2] = countRange[1] - countRange[0];
    var countPoint = [];
    for (var i = 0; i < numStops; i++) {
      countPoint.push(i * countRange[2] / (numStops - 1) + countRange[0]);
    }

    svg.append("defs")
      .append("linearGradient")
      .attr("id", "linear-gradient2")
      .attr("x1", "0%").attr("y1", "100%")
      .attr("x2", "0%").attr("y2", "0%")
      .selectAll("stop")
      .data(d3.range(numStops))
      .enter().append("stop")
      .attr("offset", function (d, i) {
        return countScale(countPoint[i]) / width;
      })
      .attr("stop-color", function (d, i) {
        return colorScale(countPoint[i]);
      });

    svg.append("rect")
      .attr("x", width + 20)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", height)
      .style("fill", "url(#linear-gradient2)");

    var legendScale = d3.scaleLinear()
      .domain([100, 0])
      .range([0, height]);

    svg.append("g")
      .attr("transform", "translate(" + (width + 20 + 15) + ", 0)")
      .call(d3.axisRight(legendScale)
        .ticks(5));

    ///////////////////////////////////////////////////////////////////////////
    //////////////////// Heatmap
    ///////////////////////////////////////////////////////////////////////////	
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

    var highlight = svg.append('rect')
      .attr("id", "highlight")
      .attr("width", width)
      .attr("height", y.bandwidth())
      .attr("x", 0)
      .attr("y", 0)
      .attr("opacity", 0)
      .attr("fill", "none")
      .attr("stroke", '#000000')
      .attr("stroke-width", 5)

    var lineOpacityToggle = false
    var previousClickedSample = ""
    svg.selectAll("rectHeat")
      .data(noPerfectData)
      .enter()
      .append("rect")
      .attr("class", function (d) { return "simHeat " + d.second.replace(/(\s+|,+|\.+)/g, ''); })
      .attr("x", function (d) { return x(d.first); })
      .attr("y", function (d) { return y(d.second) })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) { return colorScale(d.similarityPercent); })
      .on("mouseover", function (event, d) {
        mouseOver(event, { name: this.id });
      })
      .on("mouseout", function (event, d) {
        mouseOut(event, { name: this.id });
      })
      .on("mousemove", function (event, obj) {
        tooltip
          .html("Value:<br> " + obj.similarityPercent)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY) + "px")
      })
      .on("mouseleave", function (event, obj) {
        tooltip.style("opacity", 0)
      })
      .on("click", (event, obj) => {
        var result = click(event, obj, previousClickedSample, lineOpacityToggle);
        previousClickedSample = result.newPreviousClickedSample;
        lineOpacityToggle = result.newLineOpacityToggle;
      });

    svg.selectAll("rectHeat2")
      .data(perfectData)
      .enter()
      .append("rect")
      .attr("class", function (d) { return "simHeat " + d.second.replace(/(\s+|,+|\.+)/g, ''); })
      .attr("x", function (d) { return x(d.first); })
      .attr("y", function (d) { return y(d.second) })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) { return colorScale(d.similarityPercent); })
      .on("mouseover", function (event, d) {
        mouseOver(event, { name: this.second });
      })
      .on("mouseout", function (event, d) {
        mouseOut(event, { name: this.second });
      })
      .on("mousemove", function (event, obj) {
        tooltip
          .html("Compared to Perfect:<br> " + obj.similarityPercent)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY) + "px")
      })
      .on("mouseleave", function (event, obj) {
        tooltip.style("opacity", 0)
      })
      .on("click", (event, obj) => {
        var result = click(event, obj, previousClickedSample, lineOpacityToggle);
        previousClickedSample = result.newPreviousClickedSample;
        lineOpacityToggle = result.newLineOpacityToggle;
      });

    ///////////////////////////////////////////////////////////////////////////
    //////////////////// Perfect legend
    ///////////////////////////////////////////////////////////////////////////	
    svg.append("text")
      .style("text-anchor", "end")
      .attr("transform", "translate(0," + height + ") rotate(-45)")
      .attr("dx", "-.8em")
      .text("Perfect");

    ///////////////////////////////////////////////////////////////////////////
    //////////////////// Coordinated views
    ///////////////////////////////////////////////////////////////////////////	
    function mouseOver(event, d) {
      tooltip.style("opacity", 1)
    }

    function mouseOut(event, d) {
    }

    function click(event, obj, previousClickedSample, lineOpacityToggle) {
      var newLineOpacityToggle = false
      var newPreviousClickedSample = ""
      var clickedSample = "#" + obj.second.replace(/(\s+|,+|\.+)/g, '')
      if (!lineOpacityToggle || clickedSample !== previousClickedSample) {
        if (previousClickedSample !== "") {
        }
        newPreviousClickedSample = clickedSample;
        newLineOpacityToggle = true
        //highlight.style("opacity", 1)
        //highlight.raise()
        d3.selectAll(".simNet").style('opacity', .2);
        d3.selectAll(".simLine").style('opacity', .2);
        d3.selectAll(".simLineLabel").style('opacity', .2);
        d3.selectAll(".simHeat").style('opacity', .2);
        d3.selectAll(".netLine").style("opacity", 0)
        d3.selectAll("." + obj.second.replace(/(\s+|,+|\.+)/g, '')).style('opacity', 1);
      } else {
        newLineOpacityToggle = false
        //highlight.style("opacity", 0)
        d3.selectAll(".simNet").style('opacity', 1);
        d3.selectAll(".simLine").style('opacity', 1);
        d3.selectAll(".simHeat").style('opacity', 1);
        d3.selectAll(".simLineLabel").style('opacity', 1);
      }
      //highlight.attr("y", y(obj.second))
      return { newPreviousClickedSample, newLineOpacityToggle }
    }

  }, [props, data]);

  return (
    <svg
      id={props.exportSvg}
      ref={ref}
      width={graphSize.width}
      height={graphSize.height}
    />
  );
}

export default SimilarityHeatmap;