import React from 'react';
import FileDialog from './FileDialog';
import HarmonicsDialog from './HarmonicsDialog';
import { Divider, Box, Typography, Button, TextField, Grid } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux'
import { setSettings } from '../slices/settingsSlice'
import { Check } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import ExportDialog from './ExportDialog';
import ExportData from './ExportData';

function SideMenu() {
  const dispatch = useDispatch();
  const fileNames = useSelector((state) => state.data.fileNames)
  const maxHarmonic = useSelector((state) => state.data.maxHarmonic)

  const [harmonic, setHarmonic] = React.useState(0);
  const [points, setPoints] = React.useState(0);

  const doApply = () => {
    const settings = { harmonic, points };
    dispatch(setSettings(settings));
  };

  return (
    <Box sx={{ height: "100%", padding: 3, boxSizing: 'border-box' }}>
      <Grid container direction="column" justifyContent="space-between" sx={{ height: "100%", overflowY: "hidden" }}>
        <Grid item sx={{ width: "100%" }}>
          <Box border={1} borderColor="primary.light" boxShadow={1} bgcolor="primary.dark" sx={{ mt: 2 }}>
            <Typography variant="h4" align="center" sx={{ mt: 0.5, mb: 0.1 }}>VΛOS</Typography>
          </Box>
          <Divider sx={{ mb: 1, mt: 1, borderBottomWidth: 4 }}></Divider>
          <Box sx={{ mb: 2, mt: 2 }}>
            <FileDialog />
            <Typography variant='h6' align="left" sx={{ mt: 2 }}>Input</Typography>
            <Typography variant='subtitle2' align="left" sx={{ mt: 1 }}>Selected file(s)</Typography>{fileNames.map((name) => (<Typography key={name}>{name}</Typography>))}
          </Box>
          <Box textAlign="center" sx={{ height: "100%" }}>
            <Typography variant='h6' align="left" mt={3}>Stress Filtering</Typography>
            <Typography variant='subtitle2' align="left" mt={1}>Highest Harmonic to consider</Typography>
            <TextField color='secondary' value={harmonic} onChange={(e) => { setHarmonic(e.target.value) }} size="small" id="outlined-basic" variant="outlined" type="number" InputProps={{
              endAdornment: <InputAdornment position="end"><Typography variant="subtitle2">1-{maxHarmonic}</Typography></InputAdornment>,
            }} />
            <HarmonicsDialog />
            <Typography variant='subtitle2' align="left" mt={2}>Points pr. Quarter Cycle in FT</Typography>
            <TextField color='secondary' value={points} onChange={(e) => { setPoints(e.target.value) }} size="small" id="outlined-start-adornment" type="number" InputProps={{
              endAdornment: <InputAdornment position="end"><Typography variant="subtitle2">20-500</Typography></InputAdornment>,
            }} />
            <Button disableElevation onClick={() => doApply()} variant="contained" endIcon={<Check />} sx={{ mt: 3 }}>Apply</Button>
          </Box>
        </Grid>
        <Grid item sx={{ width: "100%" }}>
          <ExportDialog />
          <ExportData />
        </Grid>
      </Grid>
    </Box>
  );
}

export default SideMenu;