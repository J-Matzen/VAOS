import React, { useEffect } from 'react';
import { Grid, Typography, TextField, MenuItem, Container, Divider, Box, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { tabChartTypes, graphTypes } from "../../constants/tabChartTypes";
import ChartTypeSelector from '../ChartTypeSelector';
import { StandardColors } from '../../constants/colors';
import * as cons from "../../constants/plotNames";


function LissajousTab({ data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor }) {
  const [selectedLissajousChartType, setLissajousChartType] = React.useState(cons.TwoDLissajous)
  const [selectedSample, setSamp] = React.useState(sampleNames[0])
  const [selectedSampleData, setSelectedSampleData] = React.useState([])
  const [alignment, setAlignment] = React.useState('Standard');
  const [selectedColorScheme, setColorScheme] = React.useState(StandardColors)
  const [tab, setTab] = React.useState('')

  var colorSchemes = [StandardColors]
  //Used to send the data of the chosen sample to the different charts, first finds data related to selected sample, then sets the selected data if something has been found
  useEffect(() => {
    var dataSample = data.find(sample => sample.name + " - " + sample.strainPercent + "%" === selectedSample)
    if (dataSample) {
      setSelectedSampleData(dataSample.data)
    }
  }, [data, selectedSample])

  //Handles a change in ColorScheme
  const handleChange = (event, newAlignment) => {
    setColorScheme(colorSchemes[0])
    setAlignment(newAlignment);
  };

  useEffect(() => {

    setTab(
      <React.Fragment>
        <Grid container columns={12} columnSpacing={4} sx={{ '& .MuiFormControl-root': { backgroundColor: '#4f4f5f' } }}>
          <Grid item xs={1.5}>
            <Paper sx={{ width: "100%", height: "50vh", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, textAlign: 'end', mb: 2 }}>
              <Typography variant="h6" align="center" >Sample Settings</Typography>
              <Divider />
              <Typography variant='subtitle1' align="left" mt={1} mx={"2"}>Selected Sample</Typography>
              <TextField
                select
                color="secondary"
                id="standard-select-sample"
                value={selectedSample}
                onChange={(e) => {
                  setSamp(e.target.value);;
                }}
                size='small'
                variant="outlined"
                sx={{ width: "100%" }}>
                {Array.from(sampleNames).map((option) => (
                  <MenuItem key={option} value={option}> {option}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant='subtitle1' align="left" mt={2} mx={"2"}>Selected Chart</Typography>
              <TextField
                select
                color='secondary'
                id="standard-select-sample"
                value={selectedLissajousChartType}
                onChange={(e) => { setLissajousChartType(e.target.value) }}
                size='small'
                variant="outlined"
                sx={{ width: "100%" }}>
                {tabChartTypes[value - 1].map((option) => (
                  <MenuItem key={option} value={option}> {option}
                  </MenuItem>
                ))}
              </TextField>
            </Paper>
          </Grid>

          <Grid item xs={9}>
            <Paper sx={{ width: "100%", height: "100%", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, textAlign: 'end', mb: 2 }}>
              <Typography variant="h5" align="center" sx={{ mb: 4 }} >{selectedLissajousChartType + ": " + selectedSample}</Typography>
              <Container align="center">
                <ChartTypeSelector selectedChartType={selectedLissajousChartType} selectedSampleData={selectedSampleData} data={data} selectedProjection={proj.get("Elastic")} selectedColorScheme={selectedColorScheme}> </ChartTypeSelector>
                {selectedLissajousChartType === graphTypes[0] &&
                  <ChartTypeSelector selectedChartType={selectedLissajousChartType} selectedSampleData={selectedSampleData} data={data} selectedProjection={proj.get("Viscous")} selectedColorScheme={selectedColorScheme}></ChartTypeSelector>
                }
              </Container>
            </Paper>
          </Grid>
          <Grid item xs={1.5}>
            <Paper sx={{ width: "100%", height: "50vh", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, textAlign: 'end', mb: 2 }}>
              <Typography variant="h6" align="center" >Chart Settings</Typography>
              <Divider />
              <Typography variant='subtitle1' align="left" mt={1} mx={"2"}>Selected Colors</Typography>
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  fullWidth
                  variant="contained"
                  size='small'
                  value={alignment}
                  color="error"
                  exclusive
                  onChange={handleChange} >
                  <ToggleButton value="Standard" sx={{ backgroundColor: "warning.main", color: paperThemeColor }}> Standard </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    )
  }, [data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor, selectedLissajousChartType, selectedSample, selectedSampleData, alignment, selectedColorScheme])

  return (tab);
}

export default LissajousTab