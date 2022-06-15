import React, { useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { Button, ButtonGroup, Grid, Box, Container } from '@mui/material';
import 'echarts-gl';

const dimensions = {
    width: 800, height: 700
};
const { width, height } = dimensions;

const Lissajous3D = ({ data, x, y, z, colors, graphSize, exportSvg }) => {
    const [currentProjection, setCurrentProjection] = useState("orthographic")
    // const [graphSize3D, setGraphSize] = React.useState(dimensions)
    if (graphSize === undefined) {
        graphSize = dimensions
    }


    // NOTICE
    // Generic names for the variables better, in case we want to reuse this thing with other variables
    var strainSRateStress = createStrainStressArray(data, x, y, z, null)
    var elasticStress = createStrainStressArray(data, x, y, "ElasticStress", null)
    var viscousStress = createStrainStressArray(data, x, y, "ViscousStress", null)

    //Enable if bottom projection is wanted
    // var minz = Math.min.apply(Math, strainSRateStress.map(function (o) { if (o[2] != null) { return o[2] } else { return 0 }; }))
    // var strainStressArr2 = createStrainStressArray(data, x, y, z, minz)

    // //Determine axis unit Strings
    // var xAxisUnit = " [-]"
    // var yAxisUnit = " [s\u207B\u00B9]"
    // var zAxisUnit = " [Pa]"

    //setting the options/values of the graph
    var option = {
        //creates tooltip showing value at each axis when hovering a point on the graph
        tooltip: {
            show: true,
            formatter: function (params) {
                return (
                    x + ': ' +
                    params.data[0] +
                    '<br />' + y + ': ' +
                    params.data[1] +
                    '<br />' + z + ': ' +
                    params.data[2]
                );
            }
        },
        // backgroundColor: '#f9f9fb',
        xAxis3D: {
            type: 'value',
            name: x,
            triggerEvent: "true"
        },
        yAxis3D: {
            type: 'value',
            name: y,
        },
        zAxis3D: {
            type: 'value',
            name: z,
        },
        grid3D: {
            viewControl: {
                projection: "" + currentProjection,
                rotateSensitivity: '5',
            },
        },
        legend: {
            orient: 'vertical',
            icon: 'circle',
            right: 0,
            top: 100,
        },
        series: [
            {
                name: "Total Stress",
                type: 'line3D',
                data: strainSRateStress,
                lineStyle: {
                    width: 5,
                    color: colors[0]
                },
            },
            {
                name: "Elastic Stress",
                type: 'line3D',
                data: elasticStress,
                lineStyle: {
                    width: 5,
                    color: colors[1]
                },
            },
            {
                name: "Viscous Stress",
                type: 'line3D',
                data: viscousStress,
                lineStyle: {
                    width: 5,
                    color: colors[2]
                },
            },
        ]
    };

    //need to create ref to chart so that we can access it to rotate the graph.
    var eChartsRef = useRef()

    var chart = <ReactECharts option={option}
        className={exportSvg}
        style={{ height: graphSize.height, left: 0, top: 0, width: graphSize.width }}
        ref={eChartsRef}
    />

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


    //Helper-function to reformat the data,
    // Reformat the data: we need an array of arrays [[x,y,z], [x,y,z]]
    function createStrainStressArray(lisssample, x, y, z, zAxisMin) {
        if (!lisssample.hasOwnProperty(x)) {
            return [];
        }

        var strainStressArr = []
        lisssample[x].forEach((e, i) => {
            if (!isNaN(e) && !isNaN(lisssample[y][i]) && !isNaN(lisssample[z][i]) && zAxisMin === null) {
                strainStressArr.push([e, lisssample[y][i], lisssample[z][i]])
            }
            else if (!isNaN(e) && !isNaN(lisssample[y][i]) && !isNaN(lisssample[z][i]) && zAxisMin !== null) {
                strainStressArr.push([e, lisssample[y][i], zAxisMin])
            }
        });
        return strainStressArr
    }

    return (
        <Grid container columns={12} sx={{ width: graphSize.width, height: graphSize.height }}>
            <Grid key={0} item xs={11}>
                {chart}
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

export default Lissajous3D;