import React, { useEffect } from 'react';
import { Grid, Typography, TextField, MenuItem, Tab, Container, Divider, Box, Paper, Button, IconButton, Fab, ToggleButton, ToggleButtonGroup, Dialog, DialogActions, DialogTitle, DialogContent, ListItem, List, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import ChartTypeSelector from '../ChartTypeSelector';
import * as cons from "../../constants/plotNames";

function RatioTab({ data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor, files }) {
  const [selectedRatioChartType, setRatioChartType] = React.useState(cons.RatioLinechart)
  const [projection, setProjection] = React.useState('Elastic')
  const [ratio, setRatio] = React.useState('Stiffening')
  const [selectedView, setView] = React.useState("Frequency")
  const [tab, setTab] = React.useState('')

  useEffect(() => {
    setTab(
      <React.Fragment>
        <Grid container columns={12} columnSpacing={4} sx={{ '& .MuiFormControl-root': { backgroundColor: '#4f4f5f' } }}>
          <Grid item xs={1.5}>
            <Paper sx={{ width: "100%", height: "50vh", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, textAlign: 'end', mb: 2 }}>
              <Typography variant="h6" align="center" >Sample Settings</Typography>
              <Divider />
              <Typography variant='subtitle1' align="left" mt={2} mx={"2"}>Select Ratio</Typography>
              <TextField
                select
                color='secondary'
                id="standard-select-sample"
                value={ratio}
                onChange={(e) => { setRatio(e.target.value) }}
                size='small'
                variant="outlined"
                sx={{ width: "100%" }}>
                {["Stiffening", "Thickening"].map((option) => (
                  <MenuItem key={option} value={option}> {option}
                  </MenuItem>
                ))}
              </TextField>
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
              </React.Fragment>
            </Paper>
          </Grid>

          <Grid item xs={9}>
            <Paper sx={{ width: "100%", height: "100%", bgcolor: paperThemeColor, color: paperTextColor, padding: paperPadding, textAlign: 'end', mb: 2 }}>
              <Typography variant="h5" align="center" sx={{ mb: 4 }} >{"Ratios"}</Typography>
              <Grid container align="center">
                <Grid item xs={6}>
                  <ChartTypeSelector selectedChartType={cons.RatioLinechart} data={data} selectedProjection={proj.get("Elastic")} ratioValue={ratio} graphSize={{
                    width: 545,
                    height: 425,
                  }} view={selectedView}> </ChartTypeSelector>

                </Grid >
                <Grid item xs={6}>
                  <ChartTypeSelector selectedChartType={cons.RatioHeatmap} data={data} selectedProjection={proj.get("Elastic")} ratioValue={ratio} view={selectedView}> </ChartTypeSelector>
                </Grid >
              </Grid >
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
  }, [data, sampleNames, value, proj, paperPadding, paperThemeColor, paperTextColor, files, selectedRatioChartType, ratio, selectedView])

  return (tab);
}

export default RatioTab