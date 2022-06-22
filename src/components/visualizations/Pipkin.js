import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";
import { createLissajous } from './Lissajous';
import { MaxStressColor, StiffeningColor, ThickeningColor } from '../../constants/colors';
import * as attr from '../../constants/plotAttributes';

function Pipkin(props) {
  var ref = useRef();
  useEffect(() => {
    const svgElement = d3.select(ref.current)
    svgElement.selectAll("*").remove();
    const data = { svg: svgElement, data: props.data, projection: props.projection, xName: props.x, yName: props.y }
    createPipkin(data, {
      graphSize: props.graphSize, colors: props.colors,
      doLines: props.hasOwnProperty("doLines") ? props.doLines : true,
      showTitle: props.showTitle,
      axisTitles: props.axisTitles,
    })
  }, [props])

  return (
    <svg
      id={props.exportSvg}
      ref={ref}
      width={props.hasOwnProperty("graphSize") ? props.graphSize.width : 1000}
      height={props.hasOwnProperty("graphSize") ? props.graphSize.height : 800}
    />
  );
}

/*
settings = {
  graphSize: {width: 325, height: 325},
  translation: {x: , y: },
  colors: ,
  doLines: true,
}
*/

/*
data = {
  svg: ,
  data: ,
  projection: ,
  xName: ,
  yName: ,
}
*/
export function createPipkin(data, settings) {
  const svgElement = data.svg;

  const doLines = settings.hasOwnProperty("doLines") ? settings.doLines : true;
  const graphSize = settings.hasOwnProperty("graphSize") ? settings.graphSize : { width: 1000, height: 800 }
  const showTitle = settings.hasOwnProperty("showTitle") ? settings.showTitle : true

  var axisTitles = (settings.axisTitles !== undefined) ? settings.axisTitles : { x: data.xName, y: data.yName };
  var emptyTitlesCheck = (axisTitles.x !== "" || axisTitles.y !== "")
  axisTitles = emptyTitlesCheck ? axisTitles : { x: data.xName, y: data.yName };
  var customTitles = emptyTitlesCheck ? true : false;

  var frequencies = new Set()
  var strainAmplitudes = new Set()
  var sampleNames = new Set()
  var formattedData = [];
  data.data.forEach((sample) => {
    const maxStress = Math.max.apply(Math, sample.data[data.projection.y]);
    // push each frequency to an array, and map samplenames to its multiple strain amplitudes
    strainAmplitudes.add(sample.strainPercent)
    frequencies.add(sample.freq)
    sampleNames.add(sample.name)
    const newData = { ...sample.data, ...{ "Max Stress": maxStress } }
    formattedData.push({ "Samples": sample.name, data: newData, "Frequency": sample.freq, "Strain %": sample.strainPercent })
  });
  const axisMap = { "Frequency": frequencies, "Strain %": strainAmplitudes, "Samples": sampleNames }

  var margin = {
    top: 20,
    right: 0,
    bottom: 75,
    left: 75
  }

  const translation = settings.hasOwnProperty("translation") ? settings.translation : { x: margin.left, y: margin.top }
  const innerGraphSize = {
    width: graphSize.width - margin.right - margin.left,
    height: graphSize.height - margin.top - margin.bottom
  }

  let widthSize = Math.floor(innerGraphSize.width / (axisMap[data.xName].size)) - 10;
  let heightSize = Math.floor(innerGraphSize.height / axisMap[data.yName].size) - 10;
  const elementSize = widthSize > heightSize ? heightSize : widthSize;
  innerGraphSize.height = (elementSize * axisMap[data.yName].size) <= innerGraphSize.height - 250 ? (elementSize * axisMap[data.yName].size) + 50 : innerGraphSize.height


  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Set up and initiate svg containers
  ///////////////////////////////////////////////////////////////////////////	
  var svg = svgElement
    .append("g")
    .attr("transform", "translate(" + translation.x + "," + translation.y + ")")


  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Axis and axis scales
  ///////////////////////////////////////////////////////////////////////////	
  const y = d3
    .scaleBand()
    .range([innerGraphSize.height, 0])
    .domain(axisMap[data.yName]);

  const x = d3
    .scaleBand()
    .domain(axisMap[data.xName])
    .range([0, innerGraphSize.width])
    .paddingInner(0.2)
    .paddingOuter(0.1)

  var xAxis = d3.axisBottom(x)
    .tickSize(attr.tickSize)

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${innerGraphSize.height})`)
    .style("stroke-width", attr.axisStrokeWidth)
    .style("font", attr.tickTextSize + "px sans-serif")
    .call(xAxis);

  var yAxis = d3.axisLeft(y)
    .tickSize(attr.tickSize)

  svg.append("g")
    .style("stroke-width", attr.axisStrokeWidth)
    .style("font", attr.tickTextSize + "px sans-serif")
    .call(yAxis);

  if (showTitle || customTitles) {
    //x-axis title
    svg.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", innerGraphSize.width / 2)
      .attr("y", innerGraphSize.height + margin.bottom - 10)
      .style("font", attr.axisTextSize + "px sans-serif")
      .text(axisTitles.x)

    //y-axis title
    svg.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("x", -innerGraphSize.height / 2)
      .attr("y", -margin.left + 20)
      .attr("transform", "rotate(-90)")
      .style("font", attr.axisTextSize + "px sans-serif")
      .text(axisTitles.y);
  }

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Add line graphs behind Lissajous
  ///////////////////////////////////////////////////////////////////////////
  const lineNames = ["Max Stress", "Stiffening", "Thickening"]
  const nameToColor = { "Max Stress": MaxStressColor, "Stiffening": StiffeningColor, "Thickening": ThickeningColor }
  const groupedData = d3.groups(formattedData, (d) => d[data.yName])

  var lissajousSize = { width: (elementSize * 0.5), height: (elementSize * 0.5) }
  if (!doLines) {
    lissajousSize = { width: (elementSize), height: (elementSize) }
  }

  var xLegendText = 10
  if (doLines) {
    const yText = -10
    lineNames.forEach((name) => {
      const maxValue = Math.max(...formattedData.map((sample) => { return sample.data[name] }))
      const minValue = Math.min(...formattedData.map((sample) => { return sample.data[name] }))

      const groupScale = d3
        .scaleLinear()
        .domain([minValue, maxValue])
        .range([0, lissajousSize.height]);

      if ((groupScale(formattedData[0].data[name])) === undefined || (groupScale(formattedData[0].data[name])) !== (groupScale(formattedData[0].data[name]))) {
        return;
      }

      svg.selectAll(".circle")
        .data(formattedData)
        .join("circle")
        .attr("r", 4)
        .style("fill", nameToColor[name])
        .attr("class", function (s) {
          return "pipkinCircle " +
            s.Samples + " " +
            name.replace(/(\s+|,+|\.+)/g, '');
        })
        .attr("opacity", "0.3")
        .attr("cx", s => x(s[data.xName]) + x.bandwidth() / 2)
        .attr("cy", s => (y(s[data.yName]) + y.bandwidth() / 2 + lissajousSize.height / 2 + elementSize / 2 / 2) - groupScale(s.data[name]));

      // Creating the line
      const linePath = d3.line()
        .x((s) => x(s[data.xName]) + x.bandwidth() / 2)
        .y((s) => (y(s[data.yName]) + y.bandwidth() / 2 + lissajousSize.height / 2 + elementSize / 2 / 2) - groupScale(s.data[name]))

      svg.selectAll(".line")
        .data(groupedData)
        .enter()
        .append("path")
        .attr("class", function (d) {
          return "pipkinLine " +
            d[1][0].Samples + " " +
            name.replace(/(\s+|,+|\.+)/g, '');
        })
        .attr("fill", "none")
        .attr("opacity", "0.5")
        .attr("stroke", nameToColor[name])
        .attr("stroke-width", 2)
        .attr("d", (d) => linePath(d[1]));

      // Add legends for line graphs
      svg.append("text")
        .attr("transform", "translate(" + (xLegendText) + "," + (yText) + ")")
        .style("font", "10px sans-serif")
        .style("font-weight", "bold")
        .style("fill", nameToColor[name])
        .text(name)
        .on("click", function (d) {
          var active = d3.select(this).style("opacity") === '0.3' ? false : true;
          if (active) {
            d3.select(this).style("opacity", 0.3);
            d3.selectAll("." + name.replace(/(\s+|,+|\.+)/g, '') + ":not(.pipkinLegend)").style('opacity', 0);
          } else {
            d3.select(this).style("opacity", 1);
            d3.selectAll("." + name.replace(/(\s+|,+|\.+)/g, '') + ":not(.pipkinLegend)").style('opacity', 0.3);
          }
        })

      xLegendText = xLegendText + 60;
    });
  }

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Add lissajous curves
  ///////////////////////////////////////////////////////////////////////////
  var lissajousSettings = {
    svg: svg,
    graphSize: lissajousSize,
    graphStrokeWidth: 1.5,
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

  var offset = elementSize / 2 / 2
  if (!doLines) {
    offset = 0
  }
  formattedData.forEach((sample) => {
    const xText = 5 + x(sample[data.xName]) + x.bandwidth() / 2 - (elementSize / 2)
    const yText = y(sample[data.yName]) + y.bandwidth() / 2 - (elementSize / 2)
    var yMove = 0;
    lineNames.forEach((name) => {
      svg.append("text")
        .attr("transform", "translate(" + (xText) + "," + (yText + yMove) + ")")
        .attr("class",
          "pipkinLegend " +
          sample.Samples + " " +
          name.replace(/(\s+|,+|\.+)/g, '') + " " +
          "pipkinNumber "
        )
        .style("font", "10px sans-serif")
        .style("font-weight", "bold")
        .style("fill", nameToColor[name])
        .text(sample.data[name] !== undefined ? sample.data[name].toFixed(2) : "");
      yMove = yMove + 15;
    })

    const lissajousData = { data: sample.data, sampleName: sample["Samples"], xName: data.projection.x, yName: data.projection.y, extraYName: data.projection.z, colors: settings.colors };
    const xTranslation = x(sample[data.xName]) + x.bandwidth() / 2 - lissajousSize.width / 2
    const yTranslation = y(sample[data.yName]) + y.bandwidth() / 2 - lissajousSize.height / 2 - offset
    lissajousSettings.translation = { x: xTranslation, y: yTranslation }
    createLissajous(lissajousData, lissajousSettings);
  })

  axisMap[data.yName].forEach((yIndex) => {
    var sampleName = "";
    formattedData.some((sample) => {
      if (sample[data.yName] === yIndex) {
        sampleName = sample["Samples"];
      }

      return (sample[data.yName] === yIndex);
    });

    svg.append("rect")
      .attr("width", innerGraphSize.width)
      .attr("height", elementSize)
      .attr("transform", `translate(0, ${y(yIndex) + y.bandwidth() / 2 - lissajousSize.height / 2 - offset})`)
      .attr("id", sampleName)
      .style("fill", "none")
      .style("opacity", 0.1)
      .style("pointer-events", "all")
    /*
    .on("mouseover", function (event, d) {
      mouseOver(event, { name: this.id });
    })
    .on("mouseout", function (event, d) {
      mouseOut(event, { name: this.id });
    });
    */
  });

  // Add legend to toggle numbers over curves
  var areNumbersInvis = false
  svg.append("text")
    .attr("transform", "translate(" + (xLegendText) + "," + (-10) + ")")
    .style("font", "10px sans-serif")
    .style("font-weight", "bold")
    .style("fill", "black")
    .text("Hide Numbers")
    .on("click", function (d) {
      if (areNumbersInvis) {
        d3.selectAll(".pipkinNumber").style('opacity', 1);
      } else {
        d3.selectAll(".pipkinNumber").style('opacity', 0);
      }
      areNumbersInvis = !areNumbersInvis
      d3.select(this).text(areNumbersInvis ? "Show Numbers" : "Hide Numbers")
    })

  ///////////////////////////////////////////////////////////////////////////
  //////////////////// Coordinated views
  ///////////////////////////////////////////////////////////////////////////	
  function mouseOver(event, d) {
    d3.selectAll(".lissajous").style('opacity', .1);
    d3.selectAll(".pipkinCircle").each(function () {
      if (d3.select(this).style('opacity') !== '0') {
        d3.select(this).style('opacity', .1);
      }
    });
    d3.selectAll(".pipkinLine").each(function () {
      if (d3.select(this).style('opacity') !== '0') {
        d3.select(this).style('opacity', .1);
      }
    });
    d3.selectAll(".pipkinLegend").each(function () {
      if (d3.select(this).style('opacity') !== '0') {
        d3.select(this).style('opacity', .1);
      }
    });
    d3.selectAll(".lineCircle").style('opacity', .1);
    d3.selectAll(".lineLine").style('opacity', .1);
    d3.selectAll(".lineLegend").style('opacity', .1);

    if (d.name !== "") {
      d3.selectAll("." + d.name).each(function () {
        if (d3.select(this).style('opacity') !== '0') {
          d3.select(this).style('opacity', 1);
        }
      });
    }
  }

  function mouseOut(event, d) {
    d3.selectAll(".lissajous").style('opacity', 1);
    d3.selectAll(".pipkinCircle").each(function () {
      if (d3.select(this).style('opacity') !== '0') {
        d3.select(this).style('opacity', 0.3);
      }
    });
    d3.selectAll(".pipkinLine").each(function () {
      if (d3.select(this).style('opacity') !== '0') {
        d3.select(this).style('opacity', 0.3);
      }
    });
    d3.selectAll(".pipkinLegend").each(function () {
      if (d3.select(this).style('opacity') !== '0') {
        d3.select(this).style('opacity', 1);
      }
    });
    d3.selectAll(".lineCircle").style('opacity', 1);
    d3.selectAll(".lineLine").style('opacity', 1);
    d3.selectAll(".lineLegend").style('opacity', 1);
  }
}

export default Pipkin;
