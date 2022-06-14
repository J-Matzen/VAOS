import * as React from 'react';
import { Divider, Grid, Box, Container, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import { useDispatch } from 'react-redux'
import { setData } from '../slices/dataSlice'
import FileMenu from './fileDialog/FileMenu';
import OutputWindow from './fileDialog/OutputWindow';
import excel from 'fast-xlsx-reader';

const frequencyRegex = /((_f\d{1,}))+/g
const sampleNameRegex = /@([^;]*)_/g

function FileDialog() {
  const dispatch = useDispatch();
  const [state, setState] = React.useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      // Uploaded files
      // Should contain {name, sheets, workbook, activeSheets, strainC, stressC, freq, sampleName}
      uploadedFiles: [],

      // Current table viewed
      cols: [],
      rows: [],

      // Current file
      workbook: null,
      selectedFileName: "No file chosen...",
      selectedSheet: "",
      selectedActiveSheets: ["All"],
      sheetNames: [],
      strainC: 0,
      stressC: 0,
      freq: 0,
    }
  )

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSaveClose = () => {
    // Save activates sheets first
    let filesCopy = [...state.uploadedFiles];
    const oldFile = filesCopy.find(element => element.name === state.selectedFileName)
    oldFile.activeSheets = state.selectedActiveSheets;

    let fileNames = [];
    let data = [];
    for (const file of filesCopy) {
      fileNames.push(file.name);

      // Check if All in activeSheets
      let sheetsToSave = file.activeSheets;
      if (file.activeSheets.find(element => element === "All") !== undefined) {
        sheetsToSave = file.sheets;
      }

      for (const sheet of sheetsToSave) {
        if (sheet === '') {
          continue
        }

        file.workbook.loadSheet(sheet)
        var rows = [];
        file.workbook.readAll(false, (row, index) => {
          rows.push(row);
        });
        rows.splice(0, 2);

        const entry = { fileName: file.name, name: file.sampleName, data: rows, strainC: file.strainC, stressC: file.stressC, freq: file.freq, strainPercent: parseFloat(sheet.replace(',', '.')) }
        data = [...data, entry];
      }
    }

    if (data.length !== 0) {
      dispatch(setData({ data, fileNames }));
    }
    setOpen(false);
  };

  const uploadFile = async (fileList) => {
    let filesCopy = [...state.uploadedFiles];
    const oldFile = filesCopy.find(element => element.name === state.selectedFileName)
    if (oldFile !== undefined) {
      oldFile.activeSheets = state.selectedActiveSheets;
    }

    const files = [...fileList].map(async (f) => {
      const reader = excel.createReader({
        input: f.path
      });

      const sheetnames = reader.sheetNames;

      let strain = 0;
      let stress = 0;
      const rows = reader.readMany(0, 2);
      rows.forEach(element => {
        element.forEach((column, i) => {
          if (column.includes("Strain")) {
            strain = i;
          }

          if (column.includes("Stress")) {
            stress = i;
          }
        })
      });

      let frequency = f.name.match(frequencyRegex);
      if (frequency != null) {
        frequency = frequency[0].slice(2)
      }

      let sampleName = f.name.match(sampleNameRegex);
      if (sampleName != null) {
        sampleName = sampleName[0].slice(1, -1);
      }

      return { name: f.name, sheets: sheetnames, workbook: reader, activeSheets: sheetnames, strainC: strain, stressC: stress, freq: frequency, sampleName: sampleName }
    })
    const filesDone = await Promise.all(files);

    setState({
      uploadedFiles: filesCopy.concat(filesDone),

      workbook: filesDone[0].workbook,
      sheetNames: filesDone[0].sheets,
      selectedFileName: filesDone[0].name,
      selectedActiveSheets: filesDone[0].sheets,
      selectedSheet: filesDone[0].sheets[0],
      strainC: filesDone[0].strainC,
      stressC: filesDone[0].stressC,
      freq: filesDone[0].freq
    });
  };

  const handleFileChange = (nextFile) => {
    // Save old selected active sheets first
    let filesCopy = [...state.uploadedFiles];
    const oldFile = filesCopy.find(element => element.name === state.selectedFileName)
    if (oldFile !== undefined) {
      oldFile.activeSheets = state.selectedActiveSheets;
    }

    // Change to new file
    const file = filesCopy.find(element => element.name === nextFile)
    if (file === undefined) {
      return
    }

    setState({
      uploadedFiles: filesCopy,

      selectedFileName: nextFile,
      workbook: file.workbook,
      sheetNames: file.sheets,
      selectedActiveSheets: file.activeSheets,
      selectedSheet: file.sheets[0],
      strainC: file.strainC,
      stressC: file.stressC,
      freq: file.freq
    });
  };

  const handleFileDelete = (file) => {
    let filteredArray = state.uploadedFiles.filter(item => item !== file)
    // The file we're deleting is selected
    if (state.selectedFileName === file.name) {
      setState({
        uploadedFiles: filteredArray,

        workbook: null,
        selectedFileName: "No file chosen...",
        selectedSheet: "",
        selectedActiveSheets: [""],
        sheetNames: [],
      });
    } else {
      setState({
        uploadedFiles: filteredArray
      });
    }
  }

  const handleActiveSheets = (newSheet) => {
    let activeCopy = [...state.selectedActiveSheets];
    // Is it already in the active sheets?
    if (activeCopy.find(element => element === newSheet) !== undefined) {
      // Remove the sheet from active sheets
      activeCopy = activeCopy.filter(item => item !== newSheet)

      if (newSheet === "All") {
        activeCopy = [];
      }
    } else {
      // Add the sheet to active sheets
      activeCopy = [...activeCopy, newSheet];
    }
    setState({ selectedActiveSheets: activeCopy });
  };

  const handleSheets = (newSheet) => {
    if (newSheet !== null && newSheet !== state.selectedSheet) {
      setState({ selectedSheet: newSheet });
    }
  };

  const setStrainColumn = (e) => {
    let filesCopy = [...state.uploadedFiles];
    const oldFile = filesCopy.find(element => element.name === state.selectedFileName)
    if (oldFile !== undefined) {
      oldFile.strainC = e.target.value;
    }

    setState({
      uploadedFiles: filesCopy,
      strainC: e.target.value
    });
  }

  const setStressColumn = (e) => {
    let filesCopy = [...state.uploadedFiles];
    const oldFile = filesCopy.find(element => element.name === state.selectedFileName)
    if (oldFile !== undefined) {
      oldFile.stressC = e.target.value;
    }

    setState({
      uploadedFiles: filesCopy,
      stressC: e.target.value
    });
  }

  const setFrequency = (e) => {
    let filesCopy = [...state.uploadedFiles];
    const oldFile = filesCopy.find(element => element.name === state.selectedFileName)
    if (oldFile !== undefined) {
      oldFile.freq = e.target.value;
    }

    setState({
      uploadedFiles: filesCopy,
      freq: e.target.value
    });
  }

  React.useEffect(() => {
    const updateData = async () => {
      if (state.workbook === null || state.selectedSheet === "") {
        return;
      }

      state.workbook.loadSheet(state.selectedSheet)
      const rows = state.workbook.readMany(0, 22);
      rows.splice(1, 1)
      const cols = state.workbook.readMany(0, 1)[0];
      setState(
        {
          rows: rows,
          cols: cols,
        });
    }

    updateData();
  }, [state.selectedSheet, state.workbook]);

  return (
    <Container>
      <Box display="flex" alignItems="center" justifyContent="center">
        <Button disableElevation variant="contained" onClick={handleClickOpen} endIcon={<UploadFile />} sx={{ width: 180 }}>
          Load data
        </Button>
      </Box>
      <Dialog
        fullWidth={true}
        maxWidth={"xl"}
        onClose={handleClose}
        open={open}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          File loading
        </DialogTitle>
        <DialogContent dividers>
          <Grid container direction="row" justifyContent="space-between">
            <FileMenu state={state} uploadFile={uploadFile} handleFileChange={handleFileChange} handleFileDelete={handleFileDelete} setFrequency={setFrequency} setStressColumn={setStressColumn} setStrainColumn={setStrainColumn} />
            <Grid item>
              <Divider orientation='vertical' sx={{ borderRightWidth: 3 }} />
            </Grid>
            <OutputWindow state={state} handleActiveSheets={handleActiveSheets} handleSheets={handleSheets} />
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" autoFocus onClick={handleSaveClose} sx={{ ml: -1 }}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
}

export default FileDialog;