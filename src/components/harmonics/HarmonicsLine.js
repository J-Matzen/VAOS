import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux'
import { FTtrig } from '../data/Processing'
import * as d3 from "d3";
import styled from 'styled-components';

const Tooltips = styled.div`
  .tooltip {
    position: absolute;
    text-align: center;
    width: 90px;
    height: 30px;
    padding: 2px;
    font: 15px sans-serif;
    pointer-events: none;
    color: black;
  }
`;

const margin = { top: 20, right: 20, bottom: 50, left: 70 },
  width = 690 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

function HarmonicsLine(props) {
  var selectedSample = props.hasOwnProperty("selectedSample") ? props.selectedSample : ""
  var exportSvg = props.hasOwnProperty("exportSvg") ? props.exportSvg : ""

  var preprocessed = useSelector((state) => state.data.preprocessedData)
  let dataCut = []
  if (selectedSample !== " - 0%") {

    var enableZoom = true
    if (selectedSample !== undefined) {
      preprocessed = preprocessed.find(sample => sample.name + " - " + sample.strainPercent + "%" === selectedSample)
    }

    let sigmaFT = FTtrig(preprocessed.data.sigma);
    let In = sigmaFT.An.map(function (x, i) {
      return Math.pow(Math.pow(x, 2) + Math.pow(sigmaFT.Bn[i], 2), 0.5)
    });

    const dn = 1 / preprocessed.data.cycles;
    const n = d3.range(dn, dn * (In.length + 1), dn);
    let data = In.map(function (v, i) {
      return { x: n[i], y: Math.log10(v / In[preprocessed.data.cycles]) }
    });

    dataCut = data.slice(0, data.length);
  }

  const ref = useRef();
  useEffect(() => {
    const svgElement = d3.select(ref.current)
    svgElement.selectAll("*").remove();

    // append the svg object to the body of the page
    var svg = svgElement
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //have to create an innersvg, meaning the rect within the x and y-axis, this is needed to create clipping
    var innerSvg = svg.append("svg")
      .attr("id", "innerSVG")
      .attr("width", width)
      .attr("height", height)

    //creates a clippath so that everything outside this rect isn't drawn
    innerSvg.append('clipPath')
      .attr("id", "rect-clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0)

    //from https://www.d3-graph-gallery.com/graph/interactivity_zoom.html
    var rect = innerSvg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0)
      .style("fill", "none")
      .style("pointer-events", "all")

    if (selectedSample !== " - 0%") {
      var xExtent = d3.extent(dataCut, (d) => d.x)

      const x = d3
        .scaleLinear()
        .domain(xExtent)
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain(d3.extent(dataCut, (d) => d.y))
        .range([height, 0]);

      svg.append("g")
        .attr("id", "xAxis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      //x-axis title
      svg.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.bottom)
        .text("Harmonic order")

      svg.append("g")
        .attr("id", "yAxis")
        .call(d3.axisLeft(y));

      //y-axis title
      svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("x", -height / 2 + margin.bottom)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text("Normalized Power");

      ///////////////////////////////////////////////////////////////////////////
      //////////////////// Draw dotted line at y=0
      ///////////////////////////////////////////////////////////////////////////	
      var graphStrokeWidth = 1
      svg.append("line")
        .style("stroke-dasharray", graphStrokeWidth * 3)
        .style("stroke", "black")
        .attr("stroke-width", graphStrokeWidth)
        .style("opacity", 0.5)
        .attr("y1", y(0)).attr("x1", 0)
        .attr("y2", y(0)).attr("x2", width);

      // Creating the line
      var linePath = d3
        .line()
        .x((d) => x(d.x))
        .y((d) => y(d.y))
      // .curve(d3.curveMonotoneX)(dataCut);

      var lines = innerSvg.append("path")
        .data([dataCut])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", (d) => { return linePath(d) })
        .attr("vector-effect", "non-scaling-stroke")
        .style("fill", "none");

      // Add brushing - must be before creating circle tooltips - inspiration https://d3-graph-gallery.com/graph/interactivity_zoom.html
      var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", (event) => { onBrush(event) })

      innerSvg.append('g')
        .attr("class", "brush")
        .call(brush)

      // Create a tooltip div
      var tooltipDiv = d3.select("#tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0);

      // Adding circles on top
      var circles = innerSvg.selectAll("circle")
        .data(dataCut)
        .enter().append("circle")
        .style("fill", '#00688B')
        .attr("pointer-events", "all")
        .attr("r", 1.5)
        .attr("cx", function (d) {
          return x(d.x);
        })
        .attr("cy", function (d) {
          return y(d.y);
        })
        .on("mouseover", function (event, obj) {
          tooltipDiv.transition()
            .duration(200)
            .style("opacity", .9);
          tooltipDiv.html("y : " + d3.format(".1f")(obj.y) + "<br/>x : " + d3.format(".1f")(obj.x))
            .style("left", (event.pageX - margin.left + 30) + "px")
            .style("top", (event.pageY - margin.bottom - margin.top - 60) + "px");
        })
        .on("mouseout", function (event, obj) {
          tooltipDiv.transition()
            .duration(500)
            .style("opacity", 0);
        })

      // A function that set idleTimeOut to null
      var idleTimeout
      function idled() { idleTimeout = null; }

      function onBrush(event) {
        var extent = event.selection
        // // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
          if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
          x.domain(xExtent)
        } else {
          x.domain([x.invert(extent[0]), x.invert(extent[1])])
          innerSvg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and circle position
        svg.selectAll("#xAxis").transition().duration(1000).call(d3.axisBottom(x))
        circles
          .transition().duration(1000)
          .attr("cx", function (d) { return x(d.x); })
          .attr("cy", function (d) { return y(d.y); })

        lines
          .transition().duration(1000)
          .attr("d", (d) => { return linePath(d) })
      }
    }

  }, [dataCut, selectedSample]);

  return (
    <Tooltips>
      <svg
        id={props.exportSvg}
        ref={ref}
        width={width + margin.left + margin.right}
        height={height + margin.top + margin.bottom}
      />
      <div className={"tooltip"} id='tooltip'></div>
    </Tooltips>
  );
}

export default HarmonicsLine;