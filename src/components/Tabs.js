import React, { useEffect } from 'react';
import * as cons from "../constants/plotNames";
import { graphTypes } from "../constants/tabChartTypes";

import { Grid, Typography, TextField, MenuItem, Tab, Box, Button, IconButton, Fab, ToggleButton, ToggleButtonGroup, Dialog, DialogActions, DialogTitle, DialogContent, ListItem, List, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSelector } from 'react-redux'
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Clear, DashboardCustomize, Timeline, Dashboard, Settings } from '@mui/icons-material';
import DashboardCharts from './DashboardCharts';
import { StandardColors } from '../constants/colors';
import LissajousTab from './tabs/LissajousTab';
import PipkinTab from './tabs/PipkinTab';
import LayoverTab from './tabs/LayoverTab';
import RatioTab from './tabs/RatioTab';

import SimilarityTab from './tabs/SimilarityTab';
const Store = window.require('electron-store')

let storage = new Store()

function Tabs() {
  var data = useSelector((state) => state.results.results)
  const [value, setValue] = React.useState('1');
  const [projection, setProjection] = React.useState('Elastic')
  const [selectedProjection, setSelectedProjection] = React.useState({ x: "Strain [-]", y: "Stress [Pa]", z: "ElasticStress" })
  const [selectedRatio, setSelectedRatio] = React.useState('Stiffening')
  const projections = ["Elastic", "Viscous"];

  //Projection settings
  const [openProjSettings, setOpenProjSettings] = React.useState(false);
  const [projectionAlignment, setProjectionAlignment] = React.useState('Elastic');

  //Dialog states
  const [openAdd, setOpenAdd] = React.useState(false);
  const [removal, setRemoval] = React.useState(null)

  //ColorScheme states
  const [alignment, setAlignment] = React.useState('Standard');
  const [selectedColorScheme, setColorScheme] = React.useState(StandardColors)

  //Template states:
  const [templateAlignment, setTemplateAlignment] = React.useState('Similarity');

  //Mainly DashboardChart Settings
  const [dashboardCharts, setDashboardCharts] = React.useState(null)
  const [selectedChartType, setSelectedChartType] = React.useState("")
  const [selectedSample, setSamp] = React.useState("" + data[0].name)
  const [selectedSampleData, setSelectedSampleData] = React.useState([])
  const [selectedFile, setFile] = React.useState(data[0].fileName);
  const [selectedNetworkGraphLegend, setSelectedNetworkGraphLegend] = React.useState(true)
  const [legendAlignment, setLegendAlignment] = React.useState("Strain Colors")
  const [selectedStrain, setStrain] = React.useState("0.1%")
  const [selectedView, setView] = React.useState("Frequency")

  var ratios = ["Stiffening", "Thickening"]

  const [gridChartSettings, setGridChartSettings] = React.useState([])

  var strainPercentages = new Set()
  data.map(element => {
    strainPercentages.add(element.strainPercent + "%")
  })
  strainPercentages.add("All");

  var similarityGridChartTemplate = [
    {
      selectedChartType: cons.SimilarityChart, selectedSampleData: [], selectedSample: " - 0%",
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },
    {
      selectedChartType: cons.SimilarityNetwork, selectedSampleData: [], selectedSample: " - 0%",
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", oldLegends: true
    },
    {
      selectedChartType: cons.PipkinOutSample, selectedSampleData: [], selectedSample: " - 0%",
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: true
    },
    {
      selectedChartType: cons.SimilarityHeatmap, selectedSampleData: [], selectedSample: " - 0%",
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },
  ]


  var mitLaosGridChartTemplate = [
    {
      selectedChartType: cons.PipkinOutSample, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: "Elastic", selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: true
    },
    {
      selectedChartType: cons.TwoDLissajous, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: "Elastic", selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },

    {
      selectedChartType: cons.PipkinOutSample, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain Rate [Hz]', y: 'Stress [Pa]', z: 'ViscousStress' }, proj: "Viscous", selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: true
    },
    {
      selectedChartType: cons.TwoDLissajous, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain Rate [Hz]', y: 'Stress [Pa]', z: 'ViscousStress' }, proj: "Viscous", selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },
  ]


  var evolutionGridChartTemplate = [
    {
      selectedChartType: cons.PipkinOutSample, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: "Elastic", selectedFile: selectedFile, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: true
    },
    {
      selectedChartType: cons.TwoDLissajous, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: "Elastic", selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },
    {
      selectedChartType: cons.TwoDLayoverName, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: "Elastic", selectedFile: selectedFile, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: false, view: "Samples", graphSize: { width: 900, height: 900 }
    },

    {
      selectedChartType: cons.RatioLinechart, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: "Elastic", selectedFile: selectedFile, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: false, view: "Samples"
    },
    {
      selectedChartType: cons.RatioLinechart, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: "Elastic", selectedFile: selectedFile, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Thickening", template: false, view: "Samples"
    },
  ]

  //fetches the settings from storage on mount, and then will only run when a new template is chosen.
  useEffect(() => {
    switch (templateAlignment) {
      case "Similarity":
        setGridChartSettings(similarityGridChartTemplate)
        break;
      case "Evolution":
        // setGridChartSettings(pipkinGridChartTemplate)
        setGridChartSettings(evolutionGridChartTemplate)
        break;
      case "Lissajous":
        setGridChartSettings(mitLaosGridChartTemplate)
        break;
      case "Personal":
        var dashboardStore = storage.get('dashboard-settings')
        if (dashboardStore === undefined) {
          dashboardStore = []
        }
        setGridChartSettings(dashboardStore)
        break;
    }
  }, [templateAlignment])



  //handles sending settings changes to storage, in order to have a persistent dashboard on application termination
  const sendSettingsToStorage = () => {
    if (templateAlignment === "Personal") {
      storage.set('dashboard-settings', gridChartSettings)
    }
  }

  //setup choices of viscous or elastic projection
  var proj = new Map()
  proj.set("Viscous", { x: "Strain Rate [Hz]", y: "Stress [Pa]", z: "ViscousStress" })
  proj.set("Elastic", { x: "Strain [-]", y: "Stress [Pa]", z: "ElasticStress" })

  //COLORS
  var colorSchemes = [StandardColors]
  const theme = useTheme()

  const paperThemeColor = theme.palette.info.dark
  const paperPadding = theme.spacing(1)
  const paperTextColor = theme.palette.primary.dark;

  const changeTab = (event, newValue) => {
    setValue(newValue);
  };

  var sampleNames = new Set()
  //Used to fill selection menu with items
  data.forEach((element) => {
    //Fill array with samplenames
    sampleNames.add(element.name + " - " + element.strainPercent + "%")
  })

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


  const handleTemplateChange = (event, newAlignment) => {
    setTemplateAlignment(newAlignment)
  }

  //Handles opening of the ADD dialog
  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  //Handles closing of the ADD dialog
  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  //Handles opening of the Settings dialog
  const handleClickOpenProjSettings = () => {
    setOpenProjSettings(true);
  };

  //Handles closing of the Settings dialog
  const handleCloseProjSettings = () => {
    setOpenProjSettings(false);
  };
  const handleProjectionChange = (event, newAlignment) => {
    if (newAlignment !== null) {

      setProjectionAlignment(newAlignment)
      setSelectedProjection(proj.get(newAlignment))
      setProjection(newAlignment)

      var gridChartsCopy = [...gridChartSettings]
      Array.from(gridChartsCopy).forEach((chartSetting) => {
        chartSetting["proj"] = newAlignment
        chartSetting["selectedProjection"] = proj.get(newAlignment)
      })
      setGridChartSettings(gridChartsCopy)
    }
  }


  //Changes gridChartSettings by adding the settings selected in the ADD dialog as an object to the gridChartSettings array
  const addChart = () => {
    if (selectedChartType !== "") {
      setGridChartSettings(currentSettings => [...currentSettings, {
        selectedChartType: selectedChartType, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
        data: data, selectedProjection: selectedProjection, proj: projection, selectedFile: selectedFile, selectedColorScheme: selectedColorScheme
        , alignment: alignment, ratioValue: selectedRatio, oldLegends: selectedNetworkGraphLegend, view: selectedView, percent: selectedStrain
      }])
    }
  }


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
    if (dataSample != null) {
      setSelectedSampleData(dataSample.data)
    }
  }, [data, selectedSample])

  //updates the Removal dialog when settings changes, Also updates the grid, to show changes in gridChartSettings settings.
  useEffect(() => {
    setRemoval(<RemovalDialog gridChartSettings={gridChartSettings} data={data}></RemovalDialog>)
    setDashboardCharts(<DashboardCharts gridChartSettings={gridChartSettings} data={data}></DashboardCharts>)
    sendSettingsToStorage()
  }, [gridChartSettings, data])


  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={changeTab} aria-label="lab API tabs example">
          <Tab label="Dashboard" value="1" />
          <Tab label="Lissajous Curves" value="2" />
          <Tab label="Pipkin Diagrams" value="3" />
          <Tab label="Layover Plots" value="4" />
          <Tab label="Ratios" value="5" />
          <Tab label="Similarities" value="6" />
        </TabList>
      </Box>

      {/* Dashboard Tab */}
      <TabPanel value="1">
        {/* where the charts are added */}
        <Grid container columns={12}>
          {dashboardCharts}
        </Grid>

        {/* Add dialog construction */}
        <React.Fragment>
          <Fab size="small" color="primary" aria-label="add" sx={{ margin: 0, top: '20', left: 'auto', bottom: 20, right: 20, position: 'fixed' }} onClick={handleClickOpenAdd}>
            <DashboardCustomize />
          </Fab>
          <Dialog
            open={openAdd}
            onClose={handleCloseAdd}
            aria-labelledby="chart-dialog-title"
            aria-describedby="chart-dialog-description"
          >
            <DialogTitle id="chart-dialog-title">
              {"Chart Settings"}
            </DialogTitle>
            <DialogContent sx={{ '& .MuiFormControl-root': { backgroundColor: '#4f4f5f' } }}>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select Template</Typography>
              <ToggleButtonGroup
                sx={{ maxWidth: "100%" }}
                color="primary"
                variant="contained"
                value={templateAlignment}
                exclusive
                onChange={handleTemplateChange}
                size="small"
              >
                <ToggleButton value="Similarity" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Similarity</ToggleButton>
                <ToggleButton value="Evolution" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Evolution</ToggleButton>
                <ToggleButton value="Lissajous" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Lissajous</ToggleButton>
                <ToggleButton value="Personal" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Personal</ToggleButton>

              </ToggleButtonGroup>

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
                  {Array.from(graphTypes).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {(selectedChartType !== cons.TwoDLissajous && selectedChartType !== cons.ThreeDLissajous && selectedChartType !== '' &&
                selectedChartType != cons.SimilarityNetwork && selectedChartType != cons.SimilarityHeatmap && selectedChartType != cons.SimilarityChart &&
                selectedChartType !== cons.AreaLayoverNameOut && selectedChartType !== cons.TwoDLayoverNameOut && selectedChartType !== cons.RatioLinechart) &&
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

              {(selectedChartType === cons.TwoDLissajous || selectedChartType === cons.ThreeDLissajous) &&
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

              {((selectedChartType !== cons.RatioHeatmap && selectedChartType !== cons.RatioLinechart && selectedChartType !== cons.AreaLayoverName && selectedChartType !== cons.TwoDLayoverName && selectedChartType !== cons.ThreeDLayoverName) && selectedChartType !== '') &&
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

            </DialogContent>
            <DialogActions>
              <Box display="flex" justifyContent="center" alignItems="center" width="100%">
                <Button
                  sx={{ backgroundColor: "primary", color: paperThemeColor }}
                  onClick={() => { addChart(); handleCloseAdd() }}
                  size="large"
                >
                  Add Chart
                </Button>
              </Box>
            </DialogActions>
          </Dialog>
          <Fab size="small" color="primary" aria-label="add" sx={{ margin: 0, top: '20', left: 'auto', bottom: 70, right: 20, position: 'fixed' }} onClick={handleClickOpenProjSettings}>
            <Settings />
          </Fab>
          <Dialog
            open={openProjSettings}
            onClose={handleCloseProjSettings}
            aria-labelledby="chart-dialog-title"
            aria-describedby="chart-dialog-description"
          >
            <DialogTitle id="chart-dialog-title">
              {"Set Projection"}
            </DialogTitle>
            <DialogContent>
              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Toggle Projection</Typography>
              <ToggleButtonGroup
                sx={{ maxWidth: "100%" }}
                color="primary"
                variant="contained"
                value={projectionAlignment}
                exclusive
                onChange={handleProjectionChange}
                size="small"
              >
                <ToggleButton value="Elastic" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Elastic</ToggleButton>
                <ToggleButton value="Viscous" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Viscous</ToggleButton>
              </ToggleButtonGroup>

              {/* <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Toggle Pipkin-Type</Typography>
                            <ToggleButtonGroup
                                sx={{ maxWidth: "100%" }}
                                color="primary"
                                variant="contained"
                                value={pipkinAlignment}
                                exclusive
                                onChange={handlePipkinChange}
                                size="small"
                            >
                                <ToggleButton value={cons.PipkinInSample} sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>InSample</ToggleButton>
                                <ToggleButton value={cons.PipkinOutSample} sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>OutSample</ToggleButton>
                            </ToggleButtonGroup> */}
            </DialogContent>
          </Dialog>

        </React.Fragment>
        {/* removal dialog */}
        {removal}

      </TabPanel >
      {/* Second Tab */}
      <TabPanel value="2">
        <LissajousTab data={data} sampleNames={sampleNames} value={value} proj={proj}
          paperPadding={paperPadding} paperThemeColor={paperThemeColor} paperTextColor={paperTextColor} />
      </TabPanel >

      {/* Third TAB */}
      < TabPanel value="3" >
        <PipkinTab data={data} sampleNames={sampleNames} value={value} proj={proj}
          paperPadding={paperPadding} paperThemeColor={paperThemeColor} paperTextColor={paperTextColor} />
      </TabPanel >

      {/* Fourth TAB */}
      <TabPanel value="4" >
        <LayoverTab data={data} sampleNames={sampleNames} value={value} proj={proj}
          paperPadding={paperPadding} paperThemeColor={paperThemeColor} paperTextColor={paperTextColor} files={files} />
      </TabPanel>

      <TabPanel value="5">
        <RatioTab data={data} sampleNames={sampleNames} value={value} proj={proj}
          paperPadding={paperPadding} paperThemeColor={paperThemeColor} paperTextColor={paperTextColor} files={files} />
      </TabPanel>

      <TabPanel value="6">
        <SimilarityTab data={data} sampleNames={sampleNames} value={value} proj={proj}
          paperPadding={paperPadding} paperThemeColor={paperThemeColor} paperTextColor={paperTextColor} files={files} />
      </TabPanel>
    </TabContext >
  );




  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////
  ////////////////////////////REMOVAL DIALOG///////////////////////////////
  ////////////////////////////REMOVAL DIALOG///////////////////////////////
  ////////////////////////////REMOVAL DIALOG///////////////////////////////
  ////////////////////////////REMOVAL DIALOG///////////////////////////////
  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////


  function RemovalDialog({ gridChartSettings, data }) {
    const [openRemoval, setOpenRemoval] = React.useState(false);
    const [dialogValue, setDialogValue] = React.useState('0');
    const [selectedSettingsFile, setSettingsFile] = React.useState("");
    const [selectedSettingsChartType, setSelectedSettingsChartType] = React.useState("")
    const [selectedSettingsSample, setSettingsSamp] = React.useState("")
    const [projectionSettings, setSettingsProjection] = React.useState("")
    const [selectedSettingsProjection, setSelectedSettingsProjection] = React.useState("")
    const [selectedSettingsSampleData, setSelectedSettingsSampleData] = React.useState([])
    const [settingsColorScheme, setSettingsColorScheme] = React.useState([])
    const [alignmentSettings, setAlignmentSettings] = React.useState('Standard');
    const [selectedSettingsRatio, setSelectedSettingsRatio] = React.useState("")
    const [selectedChartIndex, setSelectedChartIndex] = React.useState(0)
    const [selectedSettingsNetworkGraphLegend, setSelectedSettingsNetworkGraphLegend] = React.useState(true)
    const [legendSettingsAlignment, setLegendSettingsAlignment] = React.useState("Strain Colors")
    const [selectedSettingsStrain, setSettingsStrain] = React.useState("0.1%")
    const [selectedSettingsView, setSettingsView] = React.useState("Frequency")


    var strainSettingsPercentages = new Set()
    data.map(element => {
      strainSettingsPercentages.add(element.strainPercent + "%")
    })



    var chartIndexes = Array.from(Array(gridChartSettings.length).keys())
    //Used to send the data of the chosen sample to the different charts, first finds data related to selected sample, then sets the selected data if something has been found
    useEffect(() => {
      if (data !== null) {
        var dataSample = data.find(sample => sample.name === selectedSettingsSample)
      }
      if (dataSample != null) {
        setSelectedSettingsSampleData(dataSample.data)
      }
    }, [data, selectedSettingsSample, sampleNames, selectedSettingsFile])

    const changeDialogTab = (event, newDialogValue) => {
      setDialogValue(newDialogValue);
    };
    const handleClickOpenRemoval = () => {
      setOpenRemoval(true);
    };

    const handleCloseRemoval = () => {
      setOpenRemoval(false);
    };

    //Handles a change in ColorScheme
    const handleColorChange = (event, newAlignment) => {
      setSettingsColorScheme(colorSchemes[0])
      setAlignmentSettings(newAlignment);
    };

    //Handles a change in network legend
    const handleLegendSettingsChange = (event, newAlignment) => {
      if (newAlignment !== null) {

        if (newAlignment === "Strain Colors") {
          setSelectedSettingsNetworkGraphLegend(true)
        } else if (newAlignment === "Sample Colors") {
          setSelectedSettingsNetworkGraphLegend(false)
        }
        setLegendSettingsAlignment(newAlignment);
      }
    };

    //Clears the clicked item in the list, removing it from the grid - Do copy or else the useffects requiring gridChartSettings to change won't fire.
    function onClear(event, index, gridChartSettings) {
      var gridChartSettingsCopy = [...gridChartSettings]
      gridChartSettingsCopy.splice(index, 1)
      setGridChartSettings(gridChartSettingsCopy)
      sendSettingsToStorage()

    }

    function gridMove(settings, fromIndex, toIndex) {
      var setting = settings[fromIndex]
      settings.splice(fromIndex, 1)
      settings.splice(toIndex, 0, setting)
    }

    //adjusts chart settings to currently chosen values when save changes is clicked
    const adjustChart = (e, index, selectedChartIndex) => {
      var gridChartSettingsCopy = [...gridChartSettings]
      gridMove(gridChartSettingsCopy, index, selectedChartIndex)

      gridChartSettingsCopy[selectedChartIndex] = {
        selectedChartType: selectedSettingsChartType, selectedSampleData: selectedSettingsSampleData, selectedSample: selectedSettingsSample,
        data: data, selectedProjection: selectedSettingsProjection, proj: projectionSettings, selectedFile: selectedSettingsFile, selectedColorScheme: settingsColorScheme, alignment: alignmentSettings, ratioValue: selectedSettingsRatio
        , template: gridChartSettings[dialogValue].template, oldLegends: selectedSettingsNetworkGraphLegend, view: selectedSettingsView, percent: selectedSettingsStrain
      }

      setGridChartSettings(gridChartSettingsCopy)
      sendSettingsToStorage()
    }

    useEffect(() => {
      setSelectedChartIndex(dialogValue)
    }, [])

    //Sets initial values of the selection field for each tab
    useEffect(() => {
      if (gridChartSettings[dialogValue] !== undefined) {
        setSelectedSettingsChartType(gridChartSettings[dialogValue].selectedChartType)
        setSettingsFile(gridChartSettings[dialogValue].selectedFile)
        setSettingsSamp(gridChartSettings[dialogValue].selectedSample)
        setSettingsProjection(gridChartSettings[dialogValue].proj)
        setSelectedSettingsProjection(gridChartSettings[dialogValue].selectedProjection)
        setSelectedSettingsSampleData(gridChartSettings[dialogValue].selectedSampleData)
        setSettingsColorScheme(gridChartSettings[dialogValue].selectedColorScheme)
        setAlignmentSettings(gridChartSettings[dialogValue].alignment)
        setSelectedSettingsRatio(gridChartSettings[dialogValue].ratioValue)
        setLegendSettingsAlignment(gridChartSettings[dialogValue].oldLegends === true ? "Strain Colors" : "Sample Colors")
        setSettingsView(gridChartSettings[dialogValue].view)
        setSettingsStrain(gridChartSettings[dialogValue].percent)
      }
      setSelectedChartIndex(dialogValue)

    }, [dialogValue, gridChartSettings])



    return (
      <React.Fragment>
        <Fab size="small" color="primary" aria-label="remove" sx={{ margin: 0, top: '20', left: 'auto', bottom: 20, right: 70, position: 'fixed' }} onClick={handleClickOpenRemoval}>
          <Dashboard />
        </Fab>
        <Dialog
          open={openRemoval}
          onClose={handleCloseRemoval}
          aria-labelledby="chartremoval-dialog-title"
          aria-describedby="chartremoval-dialog-description"
        >
          <DialogTitle id="chartremoval-dialog-title">
            {"Chart Settings"}
          </DialogTitle>
          <DialogContent sx={{ '& .MuiFormControl-root': { backgroundColor: '#4f4f5f' } }}>
            <Grid container>
              <Grid item xs={12}>
                <TabContext value={dialogValue} >
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={changeDialogTab} aria-label="tabs dialog" variant="scrollable"
                      scrollButtons="auto">
                      <Tab label="Remove Charts" value={(gridChartSettings.size + 1) + ""} />

                      {Array.from(gridChartSettings).map((element, index) => (
                        <Tab key={element.selectedChartType} label={element.selectedChartType + ": " + element.proj + index} value={index + ""} />
                      ))}
                    </TabList>
                  </Box>



                  {Array.from(gridChartSettings).map((element, index) => (
                    <TabPanel key={index} value={index + ""}>
                      <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Selected Chart Type</Typography>
                      <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                        <TextField
                          sx={{ maxWidth: "100%" }} fullWidth
                          select
                          color='secondary'
                          value={selectedSettingsChartType}
                          onChange={(e) => { setSelectedSettingsChartType(e.target.value) }}
                          id="outlined-select-currency"
                          size="small"
                          type="number"
                          variant="outlined"
                        >
                          {Array.from(graphTypes).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                      {(selectedSettingsChartType !== cons.TwoDLissajous && selectedSettingsChartType !== cons.ThreeDLissajous &&
                        selectedSettingsChartType !== '' && selectedSettingsChartType != cons.SimilarityNetwork &&
                        selectedSettingsChartType != cons.SimilarityHeatmap && selectedSettingsChartType != cons.SimilarityChart &&
                        selectedSettingsChartType !== cons.AreaLayoverNameOut && selectedSettingsChartType !== cons.TwoDLayoverNameOut && selectedSettingsChartType !== cons.RatioLinechart) &&
                        <React.Fragment>
                          <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select File</Typography>
                          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                            <TextField
                              sx={{ maxWidth: "100%" }} fullWidth
                              select
                              color='secondary'
                              defaultValue={selectedSettingsFile}
                              onChange={(e) => { setSettingsFile(e.target.value) }}
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
                      {(selectedSettingsChartType === cons.TwoDLissajous || selectedSettingsChartType === cons.ThreeDLissajous) &&
                        <React.Fragment>
                          <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select Sample</Typography>
                          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                            <TextField
                              sx={{ maxWidth: "100%" }} fullWidth
                              select
                              color='secondary'
                              id="standard-select-sample"
                              value={selectedSettingsSample}
                              onChange={(e) => { setSettingsSamp(e.target.value) }}
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
                      {((selectedSettingsChartType !== cons.RatioHeatmap && selectedSettingsChartType !== cons.RatioLinechart && selectedSettingsChartType !== cons.ThreeDLayoverName && selectedSettingsChartType !== cons.ThreeDLissajous) && selectedSettingsChartType !== '') &&
                        <React.Fragment>
                          <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Select Projection</Typography>
                          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                            <TextField
                              sx={{ maxWidth: "100%" }} fullWidth
                              select
                              color='secondary'
                              id="standard-select-sample"
                              value={projectionSettings}
                              onChange={(e) => { setSettingsProjection(e.target.value); setSelectedSettingsProjection(proj.get(e.target.value)) }}
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
                      {(selectedSettingsChartType === cons.RatioHeatmap || selectedSettingsChartType === cons.RatioLinechart) &&
                        <React.Fragment>
                          <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Choose Ratio</Typography>
                          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                            <TextField
                              sx={{ maxWidth: "100%" }} fullWidth
                              select
                              color='secondary'
                              value={selectedSettingsRatio}
                              onChange={(e) => { setSelectedSettingsRatio(e.target.value) }}
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


                      <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Choose Chart Placement</Typography>
                      <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                        <TextField
                          sx={{ maxWidth: "100%" }} fullWidth
                          select
                          color='secondary'
                          value={selectedChartIndex}
                          onChange={(e) => { setSelectedChartIndex(e.target.value) }}
                          id="outlined-select-currency"
                          size="small"
                          variant="outlined"
                        >
                          {Array.from(chartIndexes).map((option) => (
                            <MenuItem key={option} value={option}>
                              {option + 1}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>

                      {(selectedSettingsChartType === cons.RatioLinechart || selectedSettingsChartType === cons.RatioHeatmap) &&
                        <React.Fragment>
                          <Typography variant='subtitle1' align="left" mt={1} mx={"2"}>Selected Strain</Typography>
                          <TextField
                            select
                            color='secondary'
                            value={selectedSettingsView}
                            onChange={(e) => { setSettingsView(e.target.value) }}
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

                      {(selectedSettingsChartType === cons.AreaLayoverNameOut || selectedSettingsChartType === cons.TwoDLayoverNameOut) &&
                        <React.Fragment>
                          <Typography variant='subtitle1' align="left" mt={1} mx={"2"}>Selected Strain</Typography>
                          <TextField
                            select
                            color='secondary'
                            value={selectedSettingsStrain}
                            onChange={(e) => { setSettingsStrain(e.target.value) }}
                            id="outlined-select-currency"
                            size="small"
                            type="number"
                            variant="outlined"
                            sx={{ width: "100%" }}>
                            {Array.from(strainSettingsPercentages).map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </React.Fragment>
                      }


                      {((selectedSettingsChartType !== cons.RatioHeatmap && selectedSettingsChartType !== cons.RatioLinechart && selectedSettingsChartType !== cons.AreaLayoverName && selectedSettingsChartType !== cons.TwoDLayoverName && selectedSettingsChartType !== cons.ThreeDLayoverName) && selectedSettingsChartType !== '') &&
                        <React.Fragment>
                          <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Selected Colors</Typography>
                          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                            <ToggleButtonGroup
                              variant="contained" size='small'
                              value={alignmentSettings}
                              exclusive
                              onChange={handleColorChange} >
                              <ToggleButton value="Standard" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}> Standard </ToggleButton>
                            </ToggleButtonGroup>
                          </Box>
                        </React.Fragment>
                      }



                      {(selectedSettingsChartType === cons.SimilarityNetwork) &&
                        <React.Fragment>
                          <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Selected Legend Type</Typography>
                          <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                            <ToggleButtonGroup
                              variant="contained" size='small'
                              value={legendSettingsAlignment}
                              color="error"
                              exclusive
                              onChange={handleLegendSettingsChange} >
                              <ToggleButton value="Strain Colors" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Strain Colors</ToggleButton>
                              <ToggleButton value="Sample Colors" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Sample Colors</ToggleButton>
                            </ToggleButtonGroup>
                          </Box>
                        </React.Fragment>
                      }
                      <Box sx={{ mt: 2 }}>
                        <Grid container>
                          <Grid item xs={6}>
                            <Button variant="contained" size="small" onClick={(e) => { onClear(e, index, gridChartSettings) }}>Remove Chart
                              <Clear /> </Button>
                          </Grid>

                          <Grid item xs={6} align="end">
                            <Button variant="contained" size="small" onClick={(e) => { adjustChart(e, index, selectedChartIndex); handleCloseAdd() }}>Save changes</Button>
                          </Grid>
                        </Grid>
                      </Box>
                    </TabPanel>
                  ))}
                  {/* adds tab where you can see all charts, and remove one chart */}
                  <TabPanel value={(gridChartSettings.size + 1) + ""}>
                    <Grid container>
                      <Grid item xs={12}>
                        <List>
                          {Array.from(gridChartSettings).map((element, index) =>
                            <ListItem
                              key={element.selectedChartType}
                              secondaryAction={
                                <IconButton edge="end" aria-label="clear" onClick={(e) => { onClear(e, index, gridChartSettings) }}>
                                  <Clear />
                                </IconButton>
                              }
                            >
                              <ListItemAvatar>
                                <Avatar>
                                  <Timeline />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={element.selectedChartType}
                                secondary={<Box ml={1} ><body> {"SelectedFile: " + element.selectedFile} <br />  {"SelectedSample: " + element.selectedSample} <br /> {"Projection: " + element.proj}</body></Box>}
                              />
                            </ListItem>
                          )}
                        </List>
                      </Grid>
                    </Grid>
                  </TabPanel>
                </TabContext>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </React.Fragment >
    );
  }
}

export default Tabs;