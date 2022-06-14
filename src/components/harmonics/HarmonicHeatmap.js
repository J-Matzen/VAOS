import React from 'react';
import { useSelector } from 'react-redux'
import { FTtrig } from '../data/Processing'
import * as d3 from "d3";
import Heatmap from '../visualizations/Heatmap';
import { Container } from '@mui/material';

function HarmonicHeatMap({ selectedFile }) {
  var preprocessed = useSelector((state) => state.data.preprocessedData)
  if (selectedFile === undefined) {
    selectedFile = preprocessed[0].fileName
  }
  var preprocessedCopy = [];

  preprocessed.forEach(sample => {
    if (sample.fileName === selectedFile) {
      var sampleCopy = { ...sample }

      let sigmaFT = FTtrig(sampleCopy.data.sigma);
      let In = sigmaFT.An.map(function (x, i) {
        return Math.pow(Math.pow(x, 2) + Math.pow(sigmaFT.Bn[i], 2), 0.5)
      });

      const dn = 1 / sample.data.cycles;
      const n = d3.range(dn, dn * (In.length + 1), dn);
      var data = []
      In.forEach(function (v, i) {
        if (n[i] % 1 === 0 && n[i] !== undefined) {
          data.push({ "Harmonics": n[i], "Power": Math.log10(v / In[sample.data.cycles]) })
        }
      });
      let dataCut = data.slice(0, 30);
      sampleCopy.data = dataCut
      preprocessedCopy.push(sampleCopy)
    }
  });

  return (
    <Container align="center">
      <Heatmap data={preprocessedCopy} x={"Harmonics"} y={"Strain %"} value={"Power"} harmonics={true} graphSize={{ height: 400, width: 1750 }} />
    </Container>
  )
}

export default HarmonicHeatMap