import * as React from 'react';
import { Divider, Grid, Box, Typography, Button, TextField, MenuItem, ToggleButton, IconButton } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import { Visibility, Delete } from '@mui/icons-material';

const Input = styled('input')({
  display: 'none',
});

function SelectionWithText(props) {
  return (
    <TextField
      select
      color='secondary'
      value={props.value}
      onChange={props.onChange}
      id="outlined-select-currency"
      size="small"
      type="number"
      variant="outlined"
      InputProps={{
        startAdornment: <InputAdornment position="start">
          <Typography color='white' mr={1}>{props.text}</Typography>
          <Divider orientation='vertical' style={{ background: '#c0c0c6' }} sx={{ height: "30px", mr: 1 }}></Divider>
          <Typography mb="-2px" variant="subtitle2">#</Typography>
        </InputAdornment>,
      }}>
      {props.cols.map((option, i) => (
        <MenuItem key={i} value={i}>
          {i + 1}
        </MenuItem>
      ))}
    </TextField>
  );
}

function InputWithText(props) {
  return (
    <TextField
      color='secondary'
      value={props.value}
      onChange={props.onChange}
      id="outlined-select-currency"
      size="small"
      type="number"
      variant="outlined"
      InputProps={{
        startAdornment: <InputAdornment position="start">
          <Typography color='white' mr={1}>{props.text}</Typography>
          <Divider orientation='vertical' style={{ background: '#c0c0c6' }} sx={{ height: "30px", mr: 1 }}></Divider>
          <Typography mb="-2px" variant="subtitle2">#</Typography>
        </InputAdornment>,
      }}>
    </TextField>
  );
}

function FileMenu(props) {
  const uploadFile = (e) => {
    props.uploadFile(e.target.files);
  }

  const handleFileChange = (e, change) => {
    props.handleFileChange(change);
  }

  const handleFileDelete = (e) => {
    props.handleFileDelete(e);
  }

  const setFrequency = (e) => {
    props.setFrequency(e);
  }

  const setStrainColumn = (e) => {
    props.setStrainColumn(e);
  }

  const setStressColumn = (e) => {
    props.setStressColumn(e);
  }

  return (
    <Grid item xs={4}>
      <div className="file-upload">
        <label htmlFor="contained-button-file">
          <Input type="file" id="contained-button-file" onChange={uploadFile} multiple />
          <Button variant="contained" component="span" sx={{ ml: 1, mr: 2, mt: 2, mb: 2 }}>
            Upload File
          </Button>
        </label>
        {props.state.selectedFileName}
      </div>
      {
        props.state.uploadedFiles.map((file) => (
          <Grid key={file.name} container direction="row" justifyContent="space-around" alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={9}>
              <Box bgcolor="info.dark" display="flex" justifyContent="flex-start" alignItems="center" sx={{ borderRadius: 16, height: 35 }}>
                <Typography sx={{ ml: 1 }}>{file.name}</Typography>
              </Box>
            </Grid>
            <Grid item>
              <ToggleButton value={file.name} selected={file.name === props.state.selectedFileName ? true : false} onChange={handleFileChange} sx={{ border: 1, borderRadius: '50%', width: 35, height: 35 }}>
                <Visibility />
              </ToggleButton>
            </Grid>
            <Grid item>
              <IconButton
                sx={{ border: 1, borderRadius: '50%', width: 35, height: 35 }}
                onClick={() => handleFileDelete(file)}>
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        ))
      }
      <Grid container direction="column" justifyContent="space-evenly" alignContent="center" sx={{ mt: 5, '& .MuiFormControl-root': { backgroundColor: '#4f4f5f' } }}>
        <Grid item sx={{ '& .MuiTextField-root': { mr: 1, width: '37ch' } }}>
          <InputWithText value={props.state.freq} text={"FREQUENCY"} onChange={setFrequency} />
        </Grid>
        <Grid item>
          <Grid container direction="row" justifyContent="space-evenly" sx={{ mt: 2, '& .MuiTextField-root': { mr: 1, width: '18ch' } }}>
            <Grid item>
              <SelectionWithText value={props.state.stressC} text={"STRESS"} cols={props.state.cols} onChange={setStressColumn} />
            </Grid>
            <Grid item>
              <SelectionWithText value={props.state.strainC} text={"STRAIN"} cols={props.state.cols} onChange={setStrainColumn} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid >
  );
}

export default FileMenu;