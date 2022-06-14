import React, { useEffect, useRef } from 'react';
import * as d3 from "d3";
import styled from 'styled-components';
import { SamplesColors } from '../../constants/colors';

const GraphStyle = styled.div`
	.legend {
    	font-size: 16px;
    	font-weight: bold;
    	text-anchor: middle;
	}

	line.x,
	line.y {
		stroke: black;
	}

	circle.y {
		r: 6;
		stroke: black;
	}
`;

const dimensions = {
	width: 450,
	height: 300,
};

function LineGraph(props) {
	var ref = useRef();
	const [graphSize, setGraphSize] = React.useState(dimensions)

	useEffect(() => {
		const svgElement = d3.select(ref.current)
		svgElement.selectAll("*").remove();

		var formattedData = [];
		props.data.forEach((sample) => {
			formattedData.push({ "Samples": sample.name, data: sample.data, "Frequency": sample.freq, "Strain %": sample.strainPercent })
		});

		let data = { svg: svgElement, data: formattedData, xName: props.x, yName: props.y, groupName: props.group }

		if (props.graphSize !== undefined) {
			setGraphSize(props.graphSize)
		}

		createLineGraph(data, { graphSize: graphSize, graphStrokeWidth: 3, axisTextSize: 20, tickTextSize: 15, showTitle: props.showTitle, axisTitles: props.axisTitles })
	}, [props, graphSize]);

	return (
		<GraphStyle>
			<svg
				id={props.exportSvg}
				ref={ref}
				width={graphSize.width}
				height={graphSize.height}
			/>
		</GraphStyle>
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
	graphStrokeWidth: 1,
	axisStrokeWidth: 1
}
*/

/*
data = {
	svg: ,
	data: ,
	xName: ,
	yName: ,
	groupName: ,
}
*/
export function createLineGraph(data, settings) {
	const svgElement = data.svg;
	const graphSize = settings.hasOwnProperty("graphSize") ? settings.graphSize : { width: 325, height: 325 }
	const enableLegend = settings.hasOwnProperty("enableLegend") ? settings.enableLegend : true
	const graphStrokeWidth = settings.hasOwnProperty("graphStrokeWidth") ? settings.graphStrokeWidth : 1
	//axis variables
	const axisStrokeWidth = settings.hasOwnProperty("axisStrokeWidth") ? settings.axisStrokeWidth : 1
	const axisTextSize = settings.hasOwnProperty("axisTextSize") ? settings.axisTextSize : 25
	const tickTextSize = settings.hasOwnProperty("tickTextSize") ? settings.tickTextSize : 15
	const yTicks = settings.hasOwnProperty("yTicks") ? settings.yTicks : 5
	const yTickSize = settings.hasOwnProperty("yTickSize") ? settings.yTickSize : 6
	const showXTicks = settings.hasOwnProperty("showXTicks") ? settings.showXTicks : true
	var showTitle = settings.hasOwnProperty("showTitle") ? settings.showTitle : true
	var axisTitles = (settings.axisTitles !== undefined) ? settings.axisTitles : { x: data.xName, y: data.yName };
	var emptyTitlesCheck = (axisTitles.x !== "" || axisTitles.y !== "")
	axisTitles = emptyTitlesCheck ? axisTitles : { x: data.xName, y: data.yName };
	var customTitles = emptyTitlesCheck ? true : false;
	showTitle = (customTitles && showTitle) ? false : true


	var frequencies = new Set()
	var strainAmplitudes = new Set()
	var sampleNames = new Set()
	const xyData = [];
	data.data.forEach((d) => {
		if (!d.data.hasOwnProperty(data.yName)) {
			return [];
		}
		strainAmplitudes.add(d["Strain %"])
		frequencies.add(d["Frequency"])
		sampleNames.add(d["Samples"])

		xyData.push({ name: d[data.groupName], x: d[data.xName], y: d.data[data.yName] });
	});
	const axisMap = { "Frequency": frequencies, "Strain %": strainAmplitudes, "Samples": sampleNames }

	const margin = {
		right: enableLegend ? 120 : 10,
		left: showTitle ? graphSize.width / 7 + 5 : 5,
		top: 20,
		bottom: showTitle ? graphSize.height / 7 + 5 : 5,
	};
	const translation = settings.hasOwnProperty("translation") ? settings.translation : { x: margin.left, y: margin.top }
	const innerGraphSize = {
		width: graphSize.width - margin.right - margin.left,
		height: graphSize.height - margin.top - margin.bottom
	}
	// append the svg object to the body of the page
	var svg = svgElement
		.append("svg")
		.attr("width", "100%")
		.attr("height", "100%")
		.append("g")
		.attr("transform", "translate(" + translation.x + "," + translation.y + ")")

	// group the data: I want to draw one line per group
	var nestedData = d3.groups(xyData, (d => d.name))
	var groupLabels = nestedData.map(function (d) { return d[0] }) // list of group names

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Axis and scales
	///////////////////////////////////////////////////////////////////////////	
	var x = d3.scalePoint()
		.domain(axisMap[data.xName])
		.range([0, innerGraphSize.width]);

	svg.append("g")
		.attr("transform", `translate(0, ${innerGraphSize.height})`)
		.style("stroke-width", axisStrokeWidth)
		.attr("class", "axis")
		.call(d3.axisBottom(x)
			.tickSize(showXTicks ? 6 : 0)
			.tickFormat(showXTicks ? (e) => e : () => ""));

	if (showTitle || customTitles)
		//x-axis title
		svg.append("text")
			.attr("class", "x-label")
			.attr("text-anchor", "middle")
			.attr('x', innerGraphSize.width / 2)
			.attr("y", innerGraphSize.height + margin.bottom - 10)
			.style("font", axisTextSize + "px sans-serif")
			.text(axisTitles.x)

	const minY = d3.min(xyData, function (d) { return d.y; })
	const maxY = d3.max(xyData, function (d) { return d.y; })

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([(minY !== undefined && minY < 0) ? minY - 0.1 : -0.1, maxY !== undefined ? maxY + 0.1 : 1.1])
		.range([innerGraphSize.height, 0]);

	svg.append("g")
		.style("stroke-width", axisStrokeWidth)
		.attr("class", "axis")
		.call(d3.axisLeft(y)
			.tickSize(yTickSize)
			.ticks(yTicks));


	//gridlines
	svg.append("g")
		.style("stroke-width", 0.2)
		.call(d3.axisLeft(y)
			.tickSize(-innerGraphSize.width)
			.tickFormat('')
			.ticks(yTicks)
			.tickSizeOuter(0));

	svg.append("g")
		.attr("transform", `translate(0, ${innerGraphSize.height})`)
		.style("stroke-width", 0.2)
		.call(d3.axisBottom(x)
			.tickSize(-innerGraphSize.height)
			.tickFormat('')
			.ticks(yTicks));


	if (showTitle || customTitles)
		//y-axis title
		svg.append("text")
			.attr("class", "y-label")
			.attr("text-anchor", "middle")
			.attr("x", -innerGraphSize.height / 2)
			.attr("y", -margin.left + 30)
			.attr("transform", "rotate(-90)")
			.style("font", axisTextSize + "px sans-serif")
			.text(axisTitles.y);

	svg.selectAll(".axis")
		.style("font", tickTextSize + "px sans-serif")

	// color palette
	var color = d3.scaleOrdinal()
		.domain(groupLabels)
		.range(SamplesColors)

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Draw dotted line at y=0
	///////////////////////////////////////////////////////////////////////////	
	svg.append("line")
		.style("stroke-dasharray", graphStrokeWidth * 3)
		.style("stroke", "black")
		.attr("stroke-width", graphStrokeWidth)
		.style("opacity", 1)
		.attr("y1", y(0)).attr("x1", 0)
		.attr("y2", y(0)).attr("x2", innerGraphSize.width);

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Draw circles on points
	///////////////////////////////////////////////////////////////////////////	
	svg.selectAll(".circle")
		.data(xyData)
		.join("circle")
		.attr("class", function (d) {
			return "lineCircle " + d.name;
		})
		.attr("r", graphStrokeWidth * 1.5)
		.style("fill", function (d) { return d3.color(color(d.name)).brighter(2) })
		.attr("cx", d => x(d.x))
		.attr("cy", d => y(d.y));

	svg.append("rect")
		.attr("width", innerGraphSize.width)
		.attr("height", innerGraphSize.height)
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", () => {
			focus.style("display", null);
		})
		.on("mouseout", () => {
			focus.style("display", "none");
		})
		.on("touchmove mousemove", mouseMove);

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Highlight/tooltip lines and circle
	///////////////////////////////////////////////////////////////////////////	
	const focus = svg
		.append("g")
		.attr("class", "focus")
		.style("display", "none");

	focus.append("line")
		.attr("class", "x")
		.style("stroke-dasharray", "3,3")
		.style("opacity", 0.5)
		.attr("y1", 0)
		.attr("y2", innerGraphSize.height);

	focus.append("line")
		.attr("class", "y")
		.style("stroke-dasharray", "3,3")
		.style("opacity", 0.5)
		.attr("x1", innerGraphSize.width)
		.attr("x2", innerGraphSize.width);

	focus.append("circle")
		.attr("class", "y")
		.style("fill", "none")
		.attr("r", 4);

	focus.append("text").attr("class", "y1").attr("dx", 8).attr("dy", "-.3em");
	focus.append("text").attr("class", "y2").attr("dx", 8).attr("dy", "-.3em");

	focus.append("text").attr("class", "y3").attr("dx", 8).attr("dy", "1em");
	focus.append("text").attr("class", "y4").attr("dx", 8).attr("dy", "1em");

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Draw line through points
	///////////////////////////////////////////////////////////////////////////	
	svg.selectAll(".line")
		.data(nestedData)
		.enter()
		.append("path")
		.attr("id", function (d) { return d[0] })
		/*
		.on("mouseover", function (event, d) {
			mouseOver(event, { name: this.id });
		})
		.on("mouseout", function (event, d) {
			mouseOut(event, d);
		})
		*/
		.attr("class", function (d) {
			return "lineLine " + d[0];
		})
		.attr("fill", "none")
		.attr("stroke", function (d) { return d3.color(color(d[0])).brighter(2) })
		.attr("stroke-width", graphStrokeWidth)
		.attr("d", function (d) {
			return d3.line()
				.x(function (d) { return x(d.x); })
				.y(function (d) { return y(d.y); })
				(d[1])
		})

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Create legends for groups
	///////////////////////////////////////////////////////////////////////////	
	if (enableLegend) {
		svg.selectAll(".legend")
			.data(nestedData)
			.enter()
			.append("text")
			.datum(function (d) { return { name: d[0], value: d[1][d[1].length - 1] }; }) // keep only the last value of each time series
			.attr("transform", function (d) { return "translate(" + x(d.value.x) + "," + y(d.value.y) + ")"; })
			.attr("x", 25)
			.attr("class", function (d) {
				return "lineLegend " + d.name.replace(/(\s+|,+|\.+)/g, '');
			})
			.style("fill", (d) => { return d3.color(color(d.name)).brighter(2) })
			.text((d) => { return d.name })
			/*
			.on("mouseover", function (event, d) {
				mouseOver(event, d);
			})
			.on("mouseout", function (event, d) {
				mouseOut(event, d);
			});*/
	}

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Find nearest point when moving mouse
	///////////////////////////////////////////////////////////////////////////	
	const delaunay = d3.Delaunay.from(xyData, d => x(d.x), d => y(d.y));
	function mouseMove(event) {
		const pos = d3.pointer(event, this);
		const i = delaunay.find(...pos);
		var d = xyData[i];
		if (d === undefined) {
			return;
		}

		focus.select("circle.y")
			.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")");

		focus.select("text.y1")
			.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")")
			.attr("y", -10)
			.attr("x", -20)
			.text((d.y).toFixed(3));

		focus.select("text.y2")
			.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")")
			.attr("y", -10)
			.attr("x", -20)
			.text((d.y).toFixed(3));

		focus.select(".x")
			.attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")")
			.attr("y2", innerGraphSize.height - y(d.y));

		focus.select(".y")
			.attr("transform", "translate(" + innerGraphSize.width * -1 + "," + y(d.y) + ")")
			.attr("x2", innerGraphSize.width + innerGraphSize.width);
	}

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
		if (d.name !== '') {
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

export default LineGraph;