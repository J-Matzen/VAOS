import React, { useEffect } from 'react';
import { Grid, Typography, TextField, MenuItem, Container, Divider, Box, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { tabChartTypes } from "../../constants/tabChartTypes";
import ChartTypeSelector from '../ChartTypeSelector';
import { StandardColors } from '../../constants/colors';
import * as cons from "../../constants/plotNames";


function PipkinTab({ data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor }) {
  const [selectedPipkinChartType, setPipkinChartType] = React.useState(cons.PipkinInSample)
  const [projection, setProjection] = React.useState('Elastic')
  const [selectedProjection, setSelectedProjection] = React.useState({ x: "Strain [-]", y: "Stress [Pa]", z: "ElasticStress" })
  const [selectedFile, setFile] = React.useState(data[0].fileName);
  const [alignment, setAlignment] = React.useState('Standard');
  const [selectedColorScheme, setColorScheme] = React.useState(StandardColors)
  const [tab, setTab] = React.useState('')

  var colorSchemes = [StandardColors]

  const projections = cons.projections

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
              <Typography variant='subtitle1' align="left" mt={1} mx={"2"}>Selected Chart</Typography>
              <TextField
                select
                color='secondary'
                id="standard-select-sample"
                value={selectedPipkinChartType}
                onChange={(e) => { setPipkinChartType(e.target.value) }}
                size='small'
                variant="outlined"
                fullWidth
                sx={{ width: "100%" }}>
                {tabChartTypes[value - 1].map((option) => (
                  <MenuItem key={option} value={option}> {option}
                  </MenuItem>
                ))}
              </TextField>

              <Typography variant='subtitle1' align="left" mt={2}>Selected projection</Typography>
              <TextField
                select
                color='secondary'
                id="standard-select-sample"
                value={projection}
                onChange={(e) => { setProjection(e.target.value); setSelectedProjection(proj.get(e.target.value)) }}
                size='small'
                variant="outlined"
                sx={{ width: "100%" }}>
                {projections.map((option) => (
                  <MenuItem key={option} value={option}> {option}
                  </MenuItem>
                ))}
              </TextField>
            </Paper>
          </Grid>

          <Grid item xs={9}>
            <Paper sx={{ width: "100%", height: "100%", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, textAlign: 'end', mb: 2 }}>
            <Typography variant="h5" align="center" sx={{ mb: 4 }} >{selectedPipkinChartType + ": " + selectedProjection.y.split("[")[0] + " vs. " + selectedProjection.x.split("[")[0] }</Typography>
              <Container align="center">
                <ChartTypeSelector selectedChartType={selectedPipkinChartType} data={data} selectedProjection={selectedProjection} selectedFile={selectedFile} selectedColorScheme={selectedColorScheme} graphSize={{ width: 900, height: 700 }}> </ChartTypeSelector>
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
                  variant="contained"
                  size='small'
                  fullWidth
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
  }, [data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor, selectedPipkinChartType, selectedFile, alignment, selectedColorScheme, selectedProjection])

  return (tab);
}

export default PipkinTab