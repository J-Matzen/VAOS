import React from 'react';
import { DriveFileMove } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useSelector } from 'react-redux'
import ObjectsToCsv from 'objects-to-csv';

function ExportData() {
  var data = useSelector((state) => state.results.results)

  const handleClickOpen = () => {
    JSONToCSVFile(data, "dataCSV.csv")
  };

  function JSONToCSVFile(data, name) {
    var dataForCSVConversion = JSON.parse(JSON.stringify(data));
    Array.from(dataForCSVConversion).forEach(sheet => {
      sheet.strainPercent = sheet.strainPercent + "%"
      Object.entries(sheet.data).forEach((entry) => {
        sheet[entry[0]] = entry[1]
      })
      delete sheet.data
    })
    var csv
    var csvFile = '';

    (async () => {
      csv = new ObjectsToCsv(dataForCSVConversion)
      csvFile = await csv.toString()
      var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
      var downloadLink = document.createElement("a");
      var url = URL.createObjectURL(blob)
      downloadLink.href = url;
      downloadLink.download = name;
      downloadLink.style.visibility = 'hidden';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    })();
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center" height="100%" >
      <Button disableElevation variant="contained" onClick={handleClickOpen} endIcon={<DriveFileMove />} sx={{ mb: 10, width: 190, height: '40px' }} >
        Export Data
      </Button>
    </Box>
  );
}

export default ExportData;