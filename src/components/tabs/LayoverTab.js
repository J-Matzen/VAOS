import React, { useEffect } from 'react';
import { Grid, Typography, TextField, MenuItem, Container, Divider, Paper } from '@mui/material';
import { tabChartTypes, graphTypes } from "../../constants/tabChartTypes";
import ChartTypeSelector from '../ChartTypeSelector';
import * as cons from "../../constants/plotNames";
import { StandardColors } from '../../constants/colors';


function LayoverTab({ data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor, files }) {
  const [selectedLayoverChartType, setLayoverChartType] = React.useState(cons.TwoDLayoverName)
  const [selectedFile, setFile] = React.useState(data[0].fileName);
  const [selectedColorScheme, setColorScheme] = React.useState(StandardColors)
  const [tab, setTab] = React.useState('')
  const [selectedStrain, setStrain] = React.useState("0.1%")

  var strainPercentages = new Set()
  data.map(element => {
    strainPercentages.add(element.strainPercent + "%")
  })
  strainPercentages.add("All");

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
                value={selectedLayoverChartType}
                onChange={(e) => { setLayoverChartType(e.target.value) }}
                size='small'
                variant="outlined"
                sx={{ width: "100%" }}>
                {tabChartTypes[value - 1].map((option) => (
                  <MenuItem key={option} value={option}> {option}
                  </MenuItem>
                ))}
              </TextField>
              {(selectedLayoverChartType !== graphTypes[12] && selectedLayoverChartType !== graphTypes[13]) &&
                <React.Fragment>
                  <Typography variant='subtitle1' align="left" mt={2}>Selected File</Typography>
                  <TextField
                    select
                    color='secondary'
                    value={selectedFile}
                    onChange={(e) => { setFile(e.target.value) }}
                    id="outlined-select-currency"
                    size="small"
                    type="number"
                    variant="outlined"
                    sx={{ width: "100%" }}>
                    {Array.from(files).map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </React.Fragment>
              }

              {(selectedLayoverChartType === graphTypes[12] || selectedLayoverChartType === graphTypes[13]) &&
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
            </Paper>
          </Grid>

          <Grid item xs={9}>
            <Paper sx={{ width: "100%", height: "100%", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, textAlign: 'end', mb: 2 }}>
              <Typography variant="h5" align="center" sx={{ mb: 4 }} >{selectedLayoverChartType}</Typography>
              <Container align="center" >
                <ChartTypeSelector selectedChartType={selectedLayoverChartType} data={data} selectedProjection={proj.get("Elastic")} selectedFile={selectedFile} selectedColorScheme={selectedColorScheme} percent={selectedStrain}> </ChartTypeSelector>
                {(selectedLayoverChartType === graphTypes[4] || selectedLayoverChartType === graphTypes[6] || selectedLayoverChartType === graphTypes[12] || selectedLayoverChartType === graphTypes[13]) &&
                  <ChartTypeSelector selectedChartType={selectedLayoverChartType} data={data} selectedProjection={proj.get("Viscous")} selectedFile={selectedFile} selectedColorScheme={selectedColorScheme} percent={selectedStrain}> </ChartTypeSelector>
                }
              </Container>
            </Paper>
          </Grid>

          <Grid item xs={1.5}>
            <Paper sx={{ width: "100%", height: "50vh", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, textAlign: 'end', mb: 2 }}>
              <Typography variant="h6" align="center" >Chart Settings</Typography>
              <Divider />
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    )
  }, [data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor, files, selectedLayoverChartType, selectedFile, selectedColorScheme, selectedStrain])

  return (tab);
}

export default LayoverTab