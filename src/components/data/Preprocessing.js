import React from 'react';
import { Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux'
import { setPreprocessedData } from '../../slices/dataSlice'

/*
Special thanks to MITlaos for providing the base to these calculations.
https://web.mit.edu/nnf/research/phenomena/mit_laos.html
*/


// Tests if the data file is one cycle?
// returns gamma also strain, sigma also stress, cycles
const preprocessData = (data, strainColumn, stressColumn) => {
  //let gam = data.map(a => a[strainColumn] / 100)
  let gam = [];
  data.forEach(a => {
    gam.push(a[strainColumn] / 100);
  });

  //let sig = data.map(a => a[stressColumn])
  let sig = [];
  data.forEach(a => {
    sig.push(a[stressColumn]);
  });

  // Now counting cycles by number of times gam/strain changes sign
  let signChangesIndexes = [];
  //let gammaSigns = gam.map(a => Math.sign(a));
  let gamSigns = [];
  gam.forEach(a => {
    gamSigns.push(Math.sign(a));
  });
  for (var i = 0; i < gamSigns.length - 1; i++) {
    if (gamSigns[i] !== gamSigns[i + 1]) {
      signChangesIndexes.push(i + 1);
    }
  }

  let length = signChangesIndexes.length;
  if (length === 0) {
    return { gamma: 0, sigma: 0, cycles: 0 }
  } else if (length === 1) {
    return { gamma: gam, sigma: sig, cycles: 1 }
  } else if (length === 2) {
    // Must do cycle trimming
    let numberOfPointsPrCycle = (signChangesIndexes[1] - signChangesIndexes[0]) * 2;
    if (gam.length < 0.95 * numberOfPointsPrCycle) {
      // not enough points
      return { gamma: gam, sigma: sig, cycles: 1 }
    } else if (gam.length > 1.05 * numberOfPointsPrCycle) {
      // excess points beyond one cycle, trim excess
      return { gamma: gam.slice(gam.length - numberOfPointsPrCycle + 1), sigma: sig.slice(sig.length - numberOfPointsPrCycle + 1), cycles: 1 }
    } else {
      return { gamma: gam, sigma: sig, cycles: 1 }
    }
  } else {
    // perform normal cycle trimming
    if (length % 2 === 0) {
      return { gamma: gam.slice(signChangesIndexes[0], signChangesIndexes[length - 2] - 1), sigma: sig.slice(signChangesIndexes[0], signChangesIndexes[length - 2] - 1), cycles: (length - 2) / 2 }
    } else {
      return { gamma: gam.slice(signChangesIndexes[0], signChangesIndexes[signChangesIndexes.length - 1]), sigma: sig.slice(signChangesIndexes[0], signChangesIndexes[signChangesIndexes.length - 1]), cycles: (length - 1) / 2 }
    }
  }
}

function Preprocessing() {
  const data = useSelector((state) => state.data.data)
  const dispatch = useDispatch();

  if ((data[0] !== undefined) && (Object.keys(data[0].data).length === 1 || data[0].data.length === 0)) {
    return (<Box sx={{ width: 0 }} />);
  }

  let results = []
  for (const entry of data) {
    const result = preprocessData(entry.data, entry.strainC, entry.stressC);

    let curHarmonic = 1000;
    if (result !== undefined && result.cycles !== 0) {
      curHarmonic = Math.floor((result.gamma).length / (2 * result.cycles));
      curHarmonic = curHarmonic % 2 === 0 ? curHarmonic - 1 : curHarmonic;
    }

    const newEntry = { fileName: entry.fileName, name: entry.name, data: result, freq: entry.freq, strainPercent: entry.strainPercent, maxHarmonic: curHarmonic }
    results = [...results, newEntry];
  }

  let maxHarmonic = 1000;
  for (const result of results) {
    let curHarmonic = 1000;
    if (result.data.cycles !== 0) {
      curHarmonic = Math.floor((result.data.gamma).length / (2 * result.data.cycles));
      curHarmonic = curHarmonic % 2 === 0 ? curHarmonic - 1 : curHarmonic;
      maxHarmonic = curHarmonic < maxHarmonic ? curHarmonic : maxHarmonic;
    }
  }

  dispatch(setPreprocessedData({ data: results, maxHarmonic: maxHarmonic === 1000 ? 0 : maxHarmonic }));
  return (<Box sx={{ width: 0 }} />);
}

export default Preprocessing;