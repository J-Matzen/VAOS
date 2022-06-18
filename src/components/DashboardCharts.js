import React, { useEffect } from 'react';
import { Grid, Typography, Paper, Box, Container, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ChartTypeSelector from './ChartTypeSelector';
import * as cons from "../constants/plotNames";

function DashboardCharts({ gridChartSettings, data }) {
  const [gridItems, setGridItems] = React.useState([])

  const theme = useTheme()

  const paperThemeColor = theme.palette.info.dark
  const paperPadding = theme.spacing(1.25)

  const paperTextColor = theme.palette.primary.dark;

  var twoDLissSize = 2.865
  var threeDLissSize = 3.22
  var pipkinSize = 3.22
  var networkSize = 4.8
  var pipkinTemplateWidth = 4.8

  var twoDlissTemplate = 2.1
  var ratioTemplate = 2

  const [gridSizes, setGridSize] = React.useState({
    [cons.TwoDLissajous]: twoDLissSize,
    [cons.ThreeDLissajous]: threeDLissSize,
    [cons.PipkinInSample]: pipkinSize,
    [cons.PipkinOutSample]: pipkinSize,
    [cons.PipkinInSample]: pipkinSize,
    [cons.PipkinOutSample]: pipkinSize,
    [cons.TwoDLayoverName]: twoDLissSize,
    [cons.TwoDLayoverNameOut]: twoDLissSize,
    [cons.ThreeDLayoverName]: threeDLissSize,
    [cons.AreaLayoverName]: twoDLissSize,
    [cons.AreaLayoverNameOut]: twoDLissSize,
    [cons.RatioLinechart]: twoDLissSize,
    [cons.RatioHeatmap]: twoDLissSize,
    [cons.SimilarityChart]: twoDLissSize,
    [cons.SimilarityHeatmap]: twoDLissSize,
    [cons.SimilarityNetwork]: networkSize,
    [cons.PipkinTemplate]: pipkinTemplateWidth,
    [cons.LayoverTemplate]: twoDlissTemplate,
    ["RatioTemplate"]: ratioTemplate
  })

  var graphSize1 = { width: 545, height: 375 }
  var graphSize2 = { width: 600, height: 400 }
  var graphSize3 = { width: 600, height: 400 }
  var graphSize4 = { width: 900, height: 400 }

  var layoverTemplateGraphSize = { width: 400, height: 300 }
  var RatioTemplateGraphSize = { width: 450, height: 300 }


  var pipkinTemplateGraphSize = { width: 900, height: 400 }

  const [graphSizes, setGraphSizes] = React.useState({
    [cons.TwoDLissajous]: graphSize1,
    [cons.ThreeDLissajous]: graphSize2,
    [cons.PipkinInSample]: graphSize3,
    [cons.PipkinOutSample]: graphSize3,
    [cons.PipkinTemplate]: graphSize3,
    [cons.TwoDLayoverName]: graphSize1,
    [cons.TwoDLayoverNameOut]: graphSize1,
    [cons.ThreeDLayoverName]: graphSize2,
    [cons.AreaLayoverName]: graphSize1,
    [cons.AreaLayoverNameOut]: graphSize1,
    [cons.RatioLinechart]: graphSize1,
    [cons.RatioHeatmap]: graphSize1,
    [cons.SimilarityChart]: graphSize1,
    [cons.SimilarityHeatmap]: graphSize1,
    [cons.SimilarityNetwork]: graphSize4,
  })


  if (data === undefined) {
    data = { fileName: "Load your data", name: "Load your data", data: [], freq: "Load your data", strainPercent: "Load your data" }
  }

  function checkSelectedSampleData(element) {
    var selectedSampleData
    var findSampleData = data.find(sample => sample.name + " - " + sample.strainPercent + "%" === element.selectedSample)
    if (findSampleData !== undefined) {
      selectedSampleData = data.find(sample => sample.name + " - " + sample.strainPercent + "%" === element.selectedSample).data
    } else {
      selectedSampleData = []
    }
    return selectedSampleData
  }

  //Re-renders the charts in the dashboard grid, whenever the settings or data changes.
  useEffect(() => {
    setGridItems([])
    Array.from(gridChartSettings).map((element, index) => {
      var elementGridSize
      var elementGraphSize
      if (element.template !== undefined && element.template !== false) {
        if (element.selectedChartType === cons.RatioLinechart || element.selectedChartType === cons.RatioHeatmap) {
          elementGridSize = gridSizes["RatioTemplate"] * 10
          elementGraphSize = RatioTemplateGraphSize
        } else if (element.selectedChartType === cons.TwoDLayoverName) {
          elementGridSize = gridSizes[cons.LayoverTemplate] * 10
          elementGraphSize = layoverTemplateGraphSize
        } else {
          elementGridSize = gridSizes[cons.PipkinTemplate] * 10
          elementGraphSize = pipkinTemplateGraphSize
        }
      } else {
        elementGridSize = gridSizes[element.selectedChartType] * 10
        elementGraphSize = graphSizes[element.selectedChartType]
      }

      setGridItems((currentGridItems) => [...currentGridItems,
      <Grid item key={index} number={index} sx={{ mb: 4, mt: 0, mr: 5, height: "430px", width: `${elementGridSize * 19}px` }} >
        <Paper sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center", width: `${elementGridSize * 19 + 10}px`, height: "100%", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, mb: 0
        }} key={index} >
          <Container >
          {(element.selectedChartType === cons.SimilarityHeatmap || element.selectedChartType === cons.SimilarityNetwork || element.selectedChartType === cons.SimilarityChart || element.selectedChartType === cons.PipkinInSample || element.selectedChartType === cons.PipkinOutSample) ?
              <Typography variant="h5" align="center" >{element.selectedChartType + ": " + element.selectedProjection.y.split("[")[0] + " vs. " + element.selectedProjection.x.split("[")[0]}</Typography>
              :
              ((element.selectedChartType === cons.RatioHeatmap) ?
              <Typography variant="h5" align="center" >{element.selectedChartType+ ": "+ element.ratioValue}</Typography>
              :
              <Typography variant="h5" align="center" >{element.selectedChartType}</Typography>
              )
            }
            <ChartTypeSelector selectedChartType={element.selectedChartType} selectedSampleData={checkSelectedSampleData(element)}
              data={data} selectedProjection={element.selectedProjection} selectedFile={element.selectedFile} selectedColorScheme={element.selectedColorScheme}
              graphSize={elementGraphSize} ratioValue={element.ratioValue} proj={element.proj} oldLegends={element.oldLegends} view={element.view} percent={element.percent}
            > </ChartTypeSelector>
          </Container >
        </Paper>
      </Grid >])
    })

  }, [gridChartSettings, data])

  return (
    <React.Fragment>
      {gridItems}
    </React.Fragment>
  )
};

export default DashboardCharts;