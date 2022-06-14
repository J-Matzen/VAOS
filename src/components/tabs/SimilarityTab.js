import React, { useEffect } from 'react';
import { Grid, Typography, TextField, MenuItem, Tab, Container, Divider, Box, Paper, Button, IconButton, Fab, ToggleButton, ToggleButtonGroup, Dialog, DialogActions, DialogTitle, DialogContent, ListItem, List, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import ChartTypeSelector from '../ChartTypeSelector';
import { StandardColors } from '../../constants/colors';
import * as cons from "../../constants/plotNames";
import SimilarityChart from '../visualizations/SimilarityChart';
import SimilarityHeatmap from '../visualizations/SimilarityHeatmap';
import SimilarityNetwork from '../visualizations/SimilarityNetwork';
import { DashboardCustomize, Settings } from '@mui/icons-material';

function SimilarityTab({ data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor, files }) {
  // const [selectedLissajousChartType, setLissajousChartType] = React.useState(cons.TwoDLissajous)
  const [selectedSample, setSamp] = React.useState(sampleNames[0])
  const [selectedSampleData, setSelectedSampleData] = React.useState([])
  const [alignment, setAlignment] = React.useState('Standard');
  const [projection, setProjection] = React.useState('Elastic')
  const [selectedColorScheme, setColorScheme] = React.useState(StandardColors)
  const [selectedPipkinChartType, setPipkinChartType] = React.useState(cons.PipkinOutSample)

  const [tab, setTab] = React.useState('')
  const projections = cons.projections
  const [selectedProjection, setSelectedProjection] = React.useState(proj.get(projection))
  //Dialog states
  const [openProjSettings, setOpenProjSettings] = React.useState(false);
  const [removal, setRemoval] = React.useState(null)
  const [projectionAlignment, setProjectionAlignment] = React.useState('Elastic');
  const [pipkinAlignment, setPipkinAlignment] = React.useState(cons.PipkinOutSample);

  //Handles opening of the ADD dialog
  const handleClickOpenProjSettings = () => {
    setOpenProjSettings(true);
  };

  //Handles closing of the ADD dialog
  const handleCloseProjSettings = () => {
    setOpenProjSettings(false);
  };
  const handleProjectionChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setProjectionAlignment(newAlignment)
      setSelectedProjection(proj.get(newAlignment))
      setProjection(newAlignment)
    }
  }

  const handlePipkinChange = (event, newAlignment) => {
    if (newAlignment !== null) {
      setPipkinAlignment(newAlignment)
      setPipkinChartType(newAlignment)
    }
  }

  useEffect(() => {
    setTab(
      <React.Fragment>
        <Grid container direction="row" columns={12} columnSpacing={2} sx={{ '& .MuiFormControl-root': { backgroundColor: '#4f4f5f' } }}>
          <Fab size="small" color="primary" aria-label="add" sx={{ margin: 0, top: '20', left: 'auto', bottom: 20, right: 20, position: 'fixed' }} onClick={handleClickOpenProjSettings}>
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

              <Typography variant='subtitle2' align="left" mt={1} mx={"2"}>Toggle Pipkin-Type</Typography>
              <ToggleButtonGroup
                sx={{ maxWidth: "100%" }}
                color="primary"
                variant="contained"
                value={pipkinAlignment}
                exclusive
                onChange={handlePipkinChange}
                size="small"
              >
                <ToggleButton value={cons.PipkinInSample} sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Within Sample</ToggleButton>
                <ToggleButton value={cons.PipkinOutSample} sx={{ backgroundColor: "warning.main", color: paperThemeColor }}>Across Sample</ToggleButton>
              </ToggleButtonGroup>
            </DialogContent>
          </Dialog>

          <Grid item sx={{ mb: 0, mt: 0, mr: 3, ml: 0, height: "100%", width: "40vw" }}>
            <Paper sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", width: `40vw`, height: "90.5vh", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, mb: 2, mr: 0, ml: 0
            }}>
              <Typography variant="h5" align="center" >{selectedPipkinChartType}</Typography>
              <ChartTypeSelector selectedChartType={selectedPipkinChartType} data={data} selectedProjection={selectedProjection} selectedColorScheme={selectedColorScheme} graphSize={{ width: 730, height: 840 }}> </ChartTypeSelector>
            </Paper>

          </Grid>
          <Grid item sx={{ mb: 0, mt: 0, mr: 0, ml: 0, height: "100%", width: "38vw" }}>
            <Grid container direction="row" columns={12} columnSpacing={2} sx={{ '& .MuiFormControl-root': { backgroundColor: '#4f4f5f' } }}>
              <Grid item sx={{ mb: 0, mt: 0, mr: 0, ml: 0, height: "50%", width: `73%` }}>
                <Paper sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center", width: `26.6vw`, height: "45vh", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, mb: 0, ml: 0, mr: 0
                }}>
                  <Typography variant="h5" align="center" >{cons.SimilarityChart}</Typography>
                  <SimilarityChart data={data} projection={projection} x={selectedProjection.x} y={selectedProjection.y} value={value} />
                </Paper>
              </Grid>

              <Grid item sx={{ mb: 0, mt: 0, mr: 0, ml: 0, height: "50%", width: `4%` }}>
                <Paper sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center", width: `26.7vw`, height: "45vh", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, mb: 0, ml: 0
                }}>
                  <Typography variant="h5" align="center" >{cons.SimilarityHeatmap}</Typography>
                  <SimilarityHeatmap data={data} projection={projection} x={selectedProjection.x} y={selectedProjection.y} value={value} />
                </Paper>
              </Grid>

              <Grid item sx={{ mb: 0, mt: 1, mr: 0, ml: 0, height: "50%", width: `54vw` }}>
                <Paper sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center", width: `54.5vw`, height: "43vh", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, mb: 0
                }}>
                  <Container align="center">
                    <Typography variant="h5" align="center" >{cons.SimilarityNetwork}</Typography>
                    <SimilarityNetwork data={data} projection={projection} value={value} dimensions={{ width: 1000, height: 380 }} />
                  </Container>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </React.Fragment >
    )
  }, [data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor, files, selectedProjection, projection, selectedPipkinChartType, openProjSettings])

  return (tab);
}

export default SimilarityTab