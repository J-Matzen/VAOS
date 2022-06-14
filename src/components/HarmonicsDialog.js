import React, { useEffect } from 'react';
import { useSelector } from 'react-redux'
import { Grid, Box, Container, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider, TextField, MenuItem, Alert } from '@mui/material';
import HarmonicsMatrix from './harmonics/HarmonicsMatrix';
import HarmonicsLine from './harmonics/HarmonicsLine';
import SearchIcon from '@mui/icons-material/Search';
import HarmonicHeatMap from './harmonics/HarmonicHeatmap';

function HarmonicsDialog() {
  const [open, setOpen] = React.useState(false);
  const [selectedSample, setSamp] = React.useState("")
  const [selectedFile, setFile] = React.useState("");
  const [projection, setProjection] = React.useState('Elastic')
  const [alert, setAlert] = React.useState(<div></div>)
  const [selectedProjection, setSelectedProjection] = React.useState({ x: "Strain [-]", y: "Stress [Pa]", z: "ElasticStress" })
  var preprocessed = useSelector((state) => state.data.preprocessedData)
  const projections = ["Elastic", "Viscous"];
  //setup choices of viscous or elastic projection
  var proj = new Map()
  proj.set("Viscous", { x: "Strain Rate [Hz]", y: "Stress [Pa]", z: "ViscousStress" })
  proj.set("Elastic", { x: "Strain [-]", y: "Stress [Pa]", z: "ElasticStress" })

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const castAlert = () => {
    setAlert(
      <React.Fragment>
        <Alert variant="filled" severity="warning" sx={{ width: "85%", mt: 2 }} color="error">Load Data Before Exploring Harmonics
        </Alert>
      </React.Fragment>
    )
  };
  const files = new Set();
  preprocessed.forEach(element => {
    if (element.fileName !== '' && element.fileName !== undefined) {
      files.add(element.fileName);
    }
  });

  var sampleNames = new Set()
  //Used to fill selection menu with items
  preprocessed.forEach((element) => {
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

  //Makes sure that a sample name is shown in the bars, when data has been loaded in
  useEffect(() => {
    if (sampleNames) {
      setSamp(sampleNames[0])
    }
    if (files) {
      setFile(Array.from(files)[0])
    }
  }, [preprocessed])

  return (
    <React.Fragment>
      {(preprocessed[0].fileName !== '') ?
        <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: "100%" }}>
          <Button disableElevation variant="contained" size="medium" endIcon={<SearchIcon />} onClick={handleClickOpen} sx={{ mx: -1, mt: 2, width: '100%', height: '40px' }}>
            Explore harmonics
          </Button>
          <Dialog
            fullWidth={true}
            maxWidth={false}
            onClose={handleClose}
            open={open}
          >
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container direction="column" justifyContent="center" alignItems="center">
                <Grid container>
                  <Grid item xs={4}>
                    <Box display="flex" sx={{ mb: 2, mr: 5 }}>
                      <TextField
                        sx={{ maxWidth: "45%" }}
                        fullWidth
                        select
                        color='secondary'
                        value={projection}
                        onChange={(e) => { setProjection(e.target.value); setSelectedProjection(proj.get(e.target.value)) }}
                        id="outlined-select-currency"
                        size="small"
                        type="number"
                        variant="outlined"
                      >
                        {projections.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid item xs={8} mb={4} >
                    {(preprocessed[0].fileName !== '') && <HarmonicsMatrix projection={selectedProjection} x={"Strain [-]"} y={"Samples"} colors={[["#004873", "#A20059", "#33cc66"][0], ["#004873", "#A20059", "#33cc66"][1]]} graphSize={{ width: 1000, height: 800 }} />}
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={4}>
                    <Box display="flex" sx={{ mb: 2, mr: 5 }}>
                      <TextField
                        sx={{ maxWidth: "45%" }} fullWidth
                        select
                        color='secondary'
                        value={selectedSample}
                        onChange={(e) => { setSamp(e.target.value) }}
                        id="outlined-select-currency"
                        size="small"
                        type="number"
                        variant="outlined"
                      >
                        {Array.from(sampleNames).map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Grid>
                  <Grid item xs={8} mb={4} >

                    {(preprocessed[0].fileName !== '') && <HarmonicsLine selectedSample={selectedSample} />}
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={2} sx={{ mb: 2, mr: 0 }}>
                    <Box display="flex" sx={{ mb: 2, mr: 0 }}>
                      <TextField
                        sx={{ maxWidth: "85%" }} fullWidth
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
                  </Grid>
                  <Grid item xs={10} mb={4} sx={{ ml: 0 }}>
                    {(preprocessed[0].fileName !== '') && <HarmonicHeatMap selectedFile={selectedFile} />}
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" autoFocus onClick={handleClose} sx={{ ml: -1 }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        :
        <React.Fragment>
          <Box display="flex" alignItems="center" justifyContent="center" sx={{ width: "100%" }}>
            <Button disableElevation variant="contained" size="medium" endIcon={<SearchIcon />} onClick={(e) => castAlert()} sx={{ mx: -1, mt: 2, width: '100%', height: '40px' }}>
              Explore harmonics
            </Button>
          </Box>
          {alert}
        </React.Fragment>
      }
    </React.Fragment >
  );
}

export default HarmonicsDialog;