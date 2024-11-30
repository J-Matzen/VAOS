import React, { useEffect } from 'react';
import * as cons from "../constants/plotNames";
import { graphTypesExport } from "../constants/tabChartTypes";
import { DriveFileMove } from '@mui/icons-material';
import * as d3 from "d3";
import { Typography, TextField, MenuItem, Container, Box, Button, ToggleButton, ToggleButtonGroup, Dialog, DialogActions, DialogTitle, DialogContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux'
import { StandardColors } from '../constants/colors';

import ChartTypeSelector from './ChartTypeSelector';
import { StrainRate } from '../constants/attributes';

function ExportDialog() {
  var data = useSelector((state) => state.results.results)
  var colorSchemes = [StandardColors]

  const theme = useTheme()
  const paperThemeColor = theme.palette.info.dark

  const [projection, setProjection] = React.useState('Elastic')
  const [selectedProjection, setSelectedProjection] = React.useState({ x: "Strain [-]", y: "Stress [Pa]", z: "ElasticStress" })
  const [selectedRatio, setSelectedRatio] = React.useState('Stiffening')
  const projections = ["Elastic", "Viscous"];
  const [graphWidth, setGraphWidth] = React.useState("545")
  const [graphHeight, setGraphHeight] = React.useState("425")
  const [chart, setChart] = React.useState(null)

  //ColorScheme states
  const [alignment, setAlignment] = React.useState('Standard');
  const [exportAlignment, setExportAlignment] = React.useState('SVG');
  const [linesAlignment, setLinesAlignment] = React.useState(true);
  const [titleAlignment, settitleAlignment] = React.useState(true);

  const [axisTitles, setAxisTitles] = React.useState({ x: "", y: "" })
  const [selectedColorScheme, setColorScheme] = React.useState(StandardColors)

  //Mainly DashboardChart Settings
  const [selectedChartType, setSelectedChartType] = React.useState("")
  const [selectedSample, setSamp] = React.useState("" + data[0].name)
  const [selectedSampleData, setSelectedSampleData] = React.useState([])
  const [selectedFile, setFile] = React.useState(data[0].fileName);
  const [selectedNetworkGraphLegend, setSelectedNetworkGraphLegend] = React.useState(true)
  const [legendAlignment, setLegendAlignment] = React.useState("Strain Colors")
  const [selectedStrain, setStrain] = React.useState("0.1%")
  const [selectedView, setView] = React.useState("Frequency")

  var ratios = ["Stiffening", "Thickening"]

  var sampleNames = new Set()
  var strainPercentages = new Set()

  //Used to fill selection menu with items
  data.forEach((element) => {
    //Fill array with samplenames
    sampleNames.add(element.name + " - " + element.strainPercent + "%")
    strainPercentages.add(element.strainPercent + "%")
  })
  strainPercentages.add("All");

  //Sort sample names
  sampleNames = Array.from([...sampleNames]).sort((a, b) => {
    return a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  })

  //Find all distinct file names in data
  const files = new Set();
  data.forEach(element => {
    if (element.fileName !== '' && element.fileName !== undefined) {
      files.add(element.fileName);
    }
  });

  //setup choices of viscous or elastic projection
  var proj = new Map()
  proj.set("Viscous", { x: StrainRate, y: "Stress [Pa]", z: "ViscousStress" })
  proj.set("Elastic", { x: "Strain [-]", y: "Stress [Pa]", z: "ElasticStress" })

  //Makes sure that a sample name is shown in the bars, when data has been loaded in
  useEffect(() => {
    if (sampleNames) {
      setSamp(sampleNames[0])
    }
    if (files) {
      setFile(Array.from(files)[0])
    }
  }, [data])

  //Used to send the data of the chosen sample to the different charts, first finds data related to selected sample, then sets the selected data if something has been found
  useEffect(() => {
    var dataSample = data.find(sample => sample.name + " - " + sample.strainPercent + "%" === selectedSample)
    if (dataSample) {
      setSelectedSampleData(dataSample.data)
    }
  }, [data, selectedSample])

  function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  // Create the export function - this will just export
  // the first svg element it finds
  function svgToCanvas(name) {
    let width = 2 * graphWidth;
    let height = 2 * graphHeight;
    var source = (new XMLSerializer()).serializeToString(d3.select("#exportSvg").node());
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface + source], { type: "image/svg+xml;base64,charset=utf-8" });
    var url = window.URL.createObjectURL(svgBlob);

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');

    // Put the svg into an image tag so that the Canvas element can read it in.
    var img = new Image();
    img.src = url;
    img.onload = function () {
      // Now that the image has loaded, put the image into a canvas element.
      ctx.drawImage(img, 0, 0, width, height);
      var canvasUrl = canvas.toDataURL("image/png", 1);
      var downloadLink = document.createElement("a");
      downloadLink.download = name + ".png";
      document.body.appendChild(downloadLink);
      downloadLink.href = canvasUrl
      downloadLink.type = "image/png";
      downloadLink.click();
      downloadLink.remove();
    }
  };

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //NEED TO FIX TOGGLE TO WHAT TO SAVE AS
  const handleSaveClose = () => {
    if (exportAlignment === "PNG") {
      svgToCanvas(selectedChartType + "_" + projection)
    } else {
      saveSvg(d3.select("#exportSvg")._groups[0][0], selectedChartType + "_" + projection)
    }
    setOpen(false);
  };

  //Handles a change in ColorScheme
  const handleChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setColorScheme(colorSchemes[0])
      setAlignment(newAlignment);
    }
  };

  //Handles a change in network legend
  const handleLegendChange = (event, newAlignment) => {
    if (newAlignment !== null) {

      if (newAlignment === "Strain Colors") {
        setSelectedNetworkGraphLegend(true)
      } else if (newAlignment === "Sample Colors") {
        setSelectedNetworkGraphLegend(false)
      }
      setLegendAlignment(newAlignment);
    }
  };

  //Handles a change in export format
  const handleExportChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setExportAlignment(newAlignment);
    }
  };

  //Handles a change in lines toggle
  const handleLinesChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setLinesAlignment(newAlignment);
    }
  };

  //Handles a change in lines toggle
  const handleAxisChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      settitleAlignment(newAlignment);
      setAxisTitles({ x: '', y: '' })
    }
  };

  const handleWidthChange = e => {
    setGraphWidth(e.target.value)
  }

  const handleHeightChange = e => {
    setGraphHeight(e.target.value)
  }

  const handleYAxisTextChange = e => {
    setAxisTitles({ x: axisTitles.x, y: e.target.value })
  }
  const handleXAxisTextChange = e => {
    setAxisTitles({ x: e.target.value, y: axisTitles.y })
  }

  useEffect(() => {
    var chartselected = <ChartTypeSelector selectedChartType={selectedChartType} selectedSampleData={selectedSampleData} projection={projection}
      data={data} selectedProjection={selectedProjection} selectedFile={selectedFile} selectedColorScheme={selectedColorScheme}
      graphSize={{ width: graphWidth, height: graphHeight }} ratioValue={selectedRatio} proj={projection} exportSvg={"exportSvg"} doLines={linesAlignment}
      showTitle={titleAlignment} axisTitles={axisTitles} selectedSample={selectedSample} oldLegends={selectedNetworkGraphLegend} view={selectedView} percent={selectedStrain}
    > </ChartTypeSelector>

    setChart(
      chartselected
    )
  }, [data, selectedChartType, selectedSampleData, selectedSample, selectedProjection, selectedFile, selectedColorScheme, selectedRatio, graphWidth, graphHeight, projection, linesAlignment, titleAlignment, axisTitles, selectedNetworkGraphLegend, selectedStrain, selectedView])

  useEffect(() => {
  }, [chart])

  return (
    <Container disableGutters sx={{ height: "45%" }}>
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Button disableElevation variant="contained" onClick={handleClickOpen} endIcon={<DriveFileMove />} sx={{ mt: "auto", width: 190, height: '40px' }}>
          Export graphs
        </Button>
      </Box>
      <Dialog
        fullWidth={true}
        maxWidth={"xl"}
        onClose={handleClose}
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Graph exporting
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select Chart Type</Typography>
          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
            <TextField
              sx={{ maxWidth: "100%" }}
              fullWidth
              select
              color='secondary'
              value={selectedChartType}
              onChange={(e) => { setSelectedChartType(e.target.value) }}
              id="outlined-select-currency"
              size="small"
              variant="outlined"
            >
              {Array.from(graphTypesExport).map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          {(selectedChartType !== cons.TwoDLissajous && selectedChartType !== cons.ThreeDLissajous && selectedChartType !== '' &&
            selectedChartType !== cons.SimilarityNetwork && selectedChartType !== cons.SimilarityHeatmap && selectedChartType !== cons.SimilarityChart &&
            selectedChartType !== cons.AreaLayoverNameOut && selectedChartType !== cons.TwoDLayoverNameOut && selectedChartType !== '') &&
            <React.Fragment>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select File</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <TextField
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                  select
                  color='secondary'
                  value={selectedFile}
                  onChange={(e) => { setFile(e.target.value) }}
                  id="outlined-select-currency"
                  size="small"
                  type="number"
                  variant="outlined"
                >
                  {Array.from(files).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </React.Fragment>
          }

          {(selectedChartType === cons.TwoDLissajous || selectedChartType === cons.ThreeDLissajous || selectedChartType === cons.HarmonicsLineChart) &&
            <React.Fragment>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select Sample</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <TextField sx={{ maxWidth: "100%" }}
                  fullWidth
                  select
                  color='secondary'
                  id="standard-select-sample"
                  value={selectedSample}
                  onChange={(e) => { setSamp(e.target.value) }}
                  size='small'
                  variant="outlined">
                  {Array.from(sampleNames).map((option) => (
                    <MenuItem key={option} value={option}> {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

            </React.Fragment>
          }

          {((selectedChartType !== cons.RatioHeatmap && selectedChartType !== cons.RatioLinechart && selectedChartType !== cons.ThreeDLayoverName && selectedChartType !== cons.ThreeDLissajous) && selectedChartType !== '') &&
            <React.Fragment>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select Projection</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <TextField sx={{ maxWidth: "100%" }}
                  fullWidth
                  select
                  color='secondary'
                  id="standard-select-sample"
                  value={projection}
                  onChange={(e) => { setProjection(e.target.value); setSelectedProjection(proj.get(e.target.value)) }}
                  size='small'
                  variant="outlined">
                  {projections.map((option) => (
                    <MenuItem key={option} value={option}> {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </React.Fragment>
          }

          {(selectedChartType === cons.RatioHeatmap || selectedChartType === cons.RatioLinechart) &&
            <React.Fragment>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Choose Ratio</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <TextField
                  sx={{ maxWidth: "100%" }}
                  fullWidth
                  select
                  color='secondary'
                  value={selectedRatio}
                  onChange={(e) => { setSelectedRatio(e.target.value) }}
                  id="outlined-select-currency"
                  size="small"
                  variant="outlined"
                >
                  {Array.from(ratios).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </React.Fragment>
          }

          {(selectedChartType === cons.RatioLinechart || selectedChartType === cons.RatioHeatmap) &&
            <React.Fragment>
              <Typography variant='subtitle1' align="left" mt={1} mx={"2"}>Selected Strain</Typography>
              <TextField
                select
                color='secondary'
                value={selectedView}
                onChange={(e) => { setView(e.target.value) }}
                id="outlined-select-currency"
                size="small"
                type="number"
                variant="outlined"
                sx={{ width: "100%" }}>
                {["Frequency", "Samples"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </React.Fragment>}

          {(selectedChartType === cons.AreaLayoverNameOut || selectedChartType === cons.TwoDLayoverNameOut) &&
            <React.Fragment>
              <Typography variant='subtitle1' align="left" mt={1} mx={"2"}>Selected Strain</Typography>
              <TextField
                select
                color='secondary'
                value={selectedStrain}
                onChange={(e) => { setStrain(e.target.value) }}
                id="outlined-select-currency"
                size="small"
                type="number"
                variant="outlined"
                sx={{ width: "100%" }}>
                {Array.from(strainPercentages).map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </React.Fragment>
          }

          {((selectedChartType !== cons.RatioHeatmap && selectedChartType !== cons.RatioLinechart && selectedChartType !== cons.AreaLayoverName && selectedChartType !== cons.TwoDLayoverName && selectedChartType !== cons.ThreeDLayoverName && selectedChartType !== cons.SimilarityNetwork) && selectedChartType !== '') &&
            <React.Fragment>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Selected Colors</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  variant="contained" size='small'
                  value={alignment}
                  color="error"
                  exclusive
                  onChange={handleChange} >
                  <ToggleButton value="Standard" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}> Standard </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </React.Fragment>
          }
          {(selectedChartType !== cons.ThreeDLayoverName && selectedChartType !== cons.ThreeDLissajous && selectedChartType !== cons.SimilarityChart && selectedChartType !== cons.SimilarityHeatmap && selectedChartType !== cons.SimilarityNetwork) &&
            <React.Fragment>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Toggle Axis Titles</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  variant="contained" size='small'
                  value={titleAlignment}
                  color="error"
                  exclusive
                  onChange={handleAxisChange} >
                  <ToggleButton value={true} sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Titles ON</ToggleButton>
                  <ToggleButton value={false} sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Titles OFF</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {!titleAlignment &&
                <React.Fragment>
                  <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>X Axis Title</Typography>
                  <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                    <TextField id="standard-basic" label="X Axis Title" variant="standard" color="primary" focused
                      value={axisTitles.x}
                      onChange={handleXAxisTextChange}
                      sx={{
                        mr: 5, mb: 0, backgroundColor: theme.palette.info.light, input: { color: "black" }
                      }} />
                    <TextField id="standard-basic" label="Y Axis Title" variant="standard" color="primary" focused
                      value={axisTitles.y}
                      onChange={handleYAxisTextChange}
                      sx={{
                        mr: 0, mb: 0, backgroundColor: theme.palette.info.light, input: { color: "black" }
                      }} />
                  </Box>

                </React.Fragment>
              }
            </React.Fragment>
          }

          {(selectedChartType === cons.SimilarityNetwork) &&
            <React.Fragment>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Selected Legend Type</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  variant="contained" size='small'
                  value={legendAlignment}
                  color="error"
                  exclusive
                  onChange={handleLegendChange} >
                  <ToggleButton value="Strain Colors" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}> Strain Colors </ToggleButton>
                  <ToggleButton value="Sample Colors" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}> Sample Colors </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </React.Fragment>
          }

          {
            (selectedChartType === cons.PipkinInSample || selectedChartType === cons.PipkinOutSample) &&
            <React.Fragment>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Toggle Ratio Lines</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  variant="contained" size='small'
                  value={linesAlignment}
                  color="error"
                  exclusive
                  onChange={handleLinesChange} >
                  <ToggleButton value={true} sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>LINES ON</ToggleButton>
                  <ToggleButton value={false} sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>LINES OFF</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </React.Fragment>
          }


          <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>SVG Dimensions(Width, Height)</Typography>
          <Container align="center" >
            <TextField id="standard-basic" label="Width" variant="standard" color="primary" focused
              value={graphWidth}
              onChange={handleWidthChange}
              sx={{
                mr: 5, mb: 2, backgroundColor: theme.palette.info.light, input: { color: "black" }
              }} />

            <TextField id="standard-basic" label="Height" variant="standard" color="primary" focused
              value={graphHeight}
              onChange={handleHeightChange}
              sx={{ mr: 0, mb: 2, backgroundColor: theme.palette.info.light, input: { color: "black" } }} />
          </Container>
          <React.Fragment>
            <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select Export File Format</Typography>
            <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
              <ToggleButtonGroup
                variant="contained" size='small'
                value={exportAlignment}
                color="error"
                exclusive
                onChange={handleExportChange} >
                <ToggleButton value="SVG" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>SVG </ToggleButton>
                <ToggleButton value="PNG" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>PNG </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </React.Fragment>

          <Container align="center" >
            {chart}
          </Container>

        </DialogContent>
        <DialogActions>
          <Button variant="contained" autoFocus onClick={handleSaveClose} sx={{ ml: -1 }}>
            Save Graph
          </Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
}

export default ExportDialog;