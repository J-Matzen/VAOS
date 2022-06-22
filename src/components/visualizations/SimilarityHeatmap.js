import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";
import { useSelector } from 'react-redux';
import { PerfectElastic, PerfectViscous } from '../../constants/attributes';
import * as attr from '../../constants/plotAttributes';

// set the dimensions and margins of the graph
const margin = {
  top: 20,
  right: 85,
  bottom: 60,
  left: 60
};

function SimilarityHeatmap(props) {
  const elasticSimilarity = useSelector((state) => state.similarity.elasticSimilarities)
  const viscousSimilarity = useSelector((state) => state.similarity.viscousSimilarities)

  const graphSize = props.hasOwnProperty("dimensions") ? props.dimensions : { width: 525, height: 425 }
  const width = graphSize.width - margin.left - margin.right;
  const height = graphSize.height - margin.bottom - margin.top;

  var ref = useRef();
  useEffect(() => {
    var data = viscousSimilarity;
    var stress = PerfectViscous;
    if (props.projection === "Elastic") {
      data = elasticSimilarity;
      stress = PerfectElastic;
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
      .domain(sheetNames);

    var y = d3.scaleBand()
      .range([height, 0])
      .domain(sheetNames);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .style("font", attr.tickTextSize + "px sans-serif")
      .style("stroke-width", attr.axisStrokeWidth)
      .call(d3.axisBottom(x).tickSize(attr.tickSize))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    svg.append("g")
      .style("font", attr.tickTextSize + "px sans-serif")
      .style("stroke-width", attr.axisStrokeWidth)
      .call(d3.axisLeft(y).tickSize(attr.tickSize));

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
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("text-align", "center")
      .style("font", "15px sans-serif")

    svg.append('rect')
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
      .attr("width", x.bandwidth() - 0.5)
      .attr("height", y.bandwidth() - 0.5)
      .style("fill", function (d) { return colorScale(d.similarityPercent); })
      .on("mouseover", function (event, d) {
        mouseOver(event, { name: this.id });
      })
      .on("mouseout", function (event, d) {
        mouseOut(event, { name: this.id });
      })
      .on("mousemove", function (event, obj) {
        tooltip
          .html(obj.first + " - <span style='color:red'>" + obj.second +"</span>:<br> " + obj.similarityPercent.toFixed(2))
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

    // Diagonal squares
    svg.selectAll("rectHeat2")
      .data(perfectData)
      .enter()
      .append("rect")
      .attr("class", function (d) { return "simHeat " + d.second.replace(/(\s+|,+|\.+)/g, ''); })
      .attr("x", function (d) { return x(d.first); })
      .attr("y", function (d) { return y(d.second) })
      .attr("width", x.bandwidth() - 0.5)
      .attr("height", y.bandwidth() - 0.5)
      .style("fill", function (d) { return colorScale(d.similarityPercent); })
      .on("mouseover", function (event, d) {
        mouseOver(event, { name: this.second });
      })
      .on("mouseout", function (event, d) {
        mouseOut(event, { name: this.second });
      })
      .on("mousemove", function (event, obj) {
        tooltip
          .html(obj.first + " - <span style='color:red'>"+ stress +"</span>:<br> " + obj.similarityPercent.toFixed(2))
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

    // Make black lines around samples
    var sampleCountArray = []
    var sampleCount = 0;
    let sheetNamesArray = [...sheetNames].reverse();
    var lastSample = sheetNames.size > 0 ? sheetNamesArray[0].split(" ")[0] : "";
    sheetNamesArray.forEach((sheet) => {
      let sample = sheet.split(" ")[0];
      if (sample !== lastSample) {
        lastSample = sample;
        sampleCountArray.push(sampleCount);
        sampleCount = 0;
      }
      sampleCount = sampleCount + 1;
    });

    var lastPlacementY = 0;
    var lastPlacementX = width;
    sampleCountArray.forEach((count) => {
      let currentLengthY = y.bandwidth() * count
      lastPlacementY = lastPlacementY  + currentLengthY
      svg.append("rect")
        .attr("x", 0)
        .attr("y", lastPlacementY)
        .attr("width", width)
        .attr("height", 2)
        .attr("fill", "white")
      
      let currentLengthX = x.bandwidth() * count
      lastPlacementX = lastPlacementX - currentLengthX
      svg.append("rect")
        .attr("x", lastPlacementX)
        .attr("y", 0)
        .attr("width", 2)
        .attr("height", height)
        .attr("fill", "white")
    });

    ///////////////////////////////////////////////////////////////////////////
    //////////////////// Perfect legend
    ///////////////////////////////////////////////////////////////////////////	
    svg.append("text")
      .style("font", attr.tickTextSize + "px sans-serif")
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

export default SimilarityHeatmap;