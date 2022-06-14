import React, { useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react'
import { Button, ButtonGroup, Grid } from '@mui/material';
import 'echarts-gl';
import * as d3 from "d3";

const LayoverPlot3D = (props) => {
  const [currentProjection, setCurrentProjection] = useState("orthographic")
  var graphSize = props.graphSize
  if (props.graphSize === undefined) {
    graphSize = { width: 800, height: 700 }
  }

  let sheetDataArray = [];
  for (const dat of props.data) {
    if (dat.fileName === props.fileName) {
      sheetDataArray.push(dat);
    }
  }

  // Creating the color scale
  var colorScale = d3.scaleSequential()
    .interpolator(d3.interpolatePlasma)
    .domain([0, sheetDataArray.length]);

  // Reformat the data: we need an array of arrays [[x,y,z], [x,y,z]]
  const formattedData = [];
  const labelNames = [];
  let sheetNr = 0;
  sheetDataArray.forEach((d) => {
    if (!d.data.hasOwnProperty(props.x)) {
      return [];
    }

    let newData = []
    d.data[props.x].forEach((e, i) => {
      newData.push([e, d.data[props.y][i], d.data[props.z][i]])
    })

    labelNames.push(d.strainPercent + "%")
    formattedData.push({
      name: d.strainPercent + "%",
      type: 'line3D',
      data: newData,
      lineStyle: {
        width: 5,
        color: colorScale(sheetDataArray.length - sheetNr),
      },
    });

    sheetNr = sheetNr + 1;
  });

  //setting the options/values of the graph
  var option = {
    //creates tooltip showing value at each axis when hovering a point on the graph
    tooltip: {
      show: true,
      formatter: function (params) {
        return (
          props.x + ': ' +
          params.data[0] +
          '<br />' + props.y + ': ' +
          params.data[1] +
          '<br />' + props.z + ': ' +
          params.data[2]
        );
      }
    },
    // backgroundColor: '#f9f9fb',
    xAxis3D: {
      type: 'value',
      name: props.x,
      triggerEvent: "true"
    },
    yAxis3D: {
      type: 'value',
      name: props.y,
    },
    zAxis3D: {
      type: 'value',
      name: props.z,
    },
    grid3D: {
      viewControl: {
        projection: "" + currentProjection,
        rotateSensitivity: '5',
      },
    },
    legend: {
      orient: 'vertical',
      icon: 'square',
      right: 0,
      top: 100,
    },
    series: formattedData.reverse(),
  };

  //need to create ref to chart so that we can access it to rotate the graph.
  var eChartsRef = useRef()

  /*
      BUTTON FUNCTIONS AND HELPER FUNCTIONS BELOW
  */

  //rotate view to Elastic PoV
  const strainClicked = () => {
    if (eChartsRef && eChartsRef.current) {

      option.grid3D.viewControl =
      {
        projection: "" + currentProjection,
        rotateSensitivity: '5',
        //rotation placement
        alpha: 0,
        beta: 0
      }

      eChartsRef.current?.getEchartsInstance().setOption(option);
    }

  }

  //rotate view to Viscous PoV
  function strainRateClicked() {
    if (eChartsRef && eChartsRef.current) {

      option.grid3D.viewControl =
      {
        projection: "" + currentProjection,
        rotateSensitivity: '5',
        alpha: 0,
        beta: 90
      }

      eChartsRef.current?.getEchartsInstance().setOption(option);
    }

  }

  //Flip projection based on current projection - flips happen between persepctive and orthographic projection
  function perspectiveFlip() {
    if (eChartsRef && eChartsRef.current) {
      option.grid3D.viewControl = {
        projection: (currentProjection === "orthographic" ? "perspective" : "orthographic"),
      }

      setCurrentProjection(option.grid3D.viewControl.projection)
      eChartsRef.current?.getEchartsInstance().setOption(option);
    }
  }

  return (
    <Grid container columns={12} sx={{ width: graphSize.width, height: graphSize.height }} >
      <Grid key={0} item xs={11}>
        <ReactECharts option={option}
          className={props.exportSvg}
          style={{ height: graphSize.height, left: 0, top: 0, width: graphSize.width }}
          ref={eChartsRef}
        // opts={{renderer: 'svg'}} 
        />
      </Grid>
      <Grid key={1} item xs={1} >
        <ButtonGroup size="small" orientation="vertical" disableElevation variant='contained'  >
          <Button onClick={strainClicked}>E</Button>
          <Button onClick={strainRateClicked}>V</Button>
          <Button onClick={perspectiveFlip}>{option.grid3D.viewControl.projection.slice(0, 1)}</Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  )
}

export default LayoverPlot3D;