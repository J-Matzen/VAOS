import * as React from 'react';
import { Grid, Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';

function OutputWindow(props) {
  const handleActiveSheets = (e, change) => {
    props.handleActiveSheets(change);
  }

  const handleSheets = (e, change) => {
    props.handleSheets(change);
  }

  const activeSelectedCheck = (sheet) => {
    return (props.state.selectedActiveSheets.find(element => element === "All") !== undefined) || (props.state.selectedActiveSheets.find(element => element === sheet) !== undefined);
  }

  return (
    <Grid item xs={7}>
      <Typography>Active</Typography>
      <Box display="flex">
        <ToggleButtonGroup value={""} color='secondary' exclusive onChange={handleActiveSheets}
        >
          {props.state.sheetNames.map(sheet => (
            <ToggleButton key={sheet} selected={activeSelectedCheck(sheet)} value={sheet}>
              {sheet}
            </ToggleButton>
          ))}
          <ToggleButton key={"All"} selected={activeSelectedCheck("All")} value={"All"}>
            All
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Typography sx={{ mt: 2 }}>Viewing (first 20 rows)</Typography>
      <Box display="flex">
        <ToggleButtonGroup value={props.state.selectedSheet} color='secondary' exclusive onChange={handleSheets}
        >
          {props.state.sheetNames.map(sheet => (
            <ToggleButton key={sheet} value={sheet}>
              {sheet}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ mt: 2 }}>
        <div>
          <table className={"excel-table"}  >
            <tbody>
              <tr>
                {props.state.cols.map((c) => <th key={c}>{c}</th>)}
              </tr>
              {
                props.state.rows.map((r, i) => <tr key={i}><td key={i}>{i}</td>
                  {props.state.cols.map((c, i) => <td key={c}>{r[i]}</td>)}
                </tr>)
              }
            </tbody>
          </table>
        </div>
      </Box>
    </Grid>
  );
}

export default OutputWindow;