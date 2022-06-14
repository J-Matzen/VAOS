import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux'
import { setResults } from '../../slices/resultsSlice'
import { fft } from '@signalprocessing/transforms';

/*
Special thanks to MITlaos for providing the base to these calculations.
https://web.mit.edu/nnf/research/phenomena/mit_laos.html
*/

const checkBadSettings = (settings) => {
  if (settings.highestHarmonic <= 0) {
    return true;
  }

  if (settings.pointPrQuarter <= 0) {
    return true;
  }

  return false;
}

export const analyseData = (preprocessed, frequency, settings, overwrites) => {
  let highestHarmonic = 1
  if (overwrites === null || overwrites.highestHarmonic === null) {
    highestHarmonic = settings.highestHarmonic
  } else {
    highestHarmonic = overwrites.highestHarmonic
  }

  let pointPrQuarter = 1
  if (overwrites === null || overwrites.pointPrQuarter === null) {
    pointPrQuarter = settings.pointPrQuarter
  } else {
    pointPrQuarter = overwrites.pointPrQuarter
  }

  // Change frequenzy from Hz to rad/sec
  frequency = frequency * 2 * Math.PI;

  //
  // START FT Decomposition and Reconstruction
  //
  // gamma, sigma, cycles

  let gammaFT = FTtrig(preprocessed.gamma)
  let sigmaFT = FTtrig(preprocessed.sigma)

  let gammaZero = Math.sqrt(Math.pow(gammaFT.Bn[preprocessed.cycles - 1], 2) + Math.pow(gammaFT.An[preprocessed.cycles - 1], 2))
  let delta = Math.atan(gammaFT.An[preprocessed.cycles - 1] / gammaFT.Bn[preprocessed.cycles - 1])

  let An = new Array(sigmaFT.An.length);
  let Bn = new Array(sigmaFT.An.length);
  for (var i = 0; i < sigmaFT.An.length; i++) {
    An[i] = sigmaFT.An[i] * Math.cos((i + 1) * delta / preprocessed.cycles) - sigmaFT.Bn[i] * Math.sin((i + 1) * delta / preprocessed.cycles)
    Bn[i] = sigmaFT.Bn[i] * Math.cos((i + 1) * delta / preprocessed.cycles) + sigmaFT.An[i] * Math.sin((i + 1) * delta / preprocessed.cycles)
  }

  if (Math.abs(An[preprocessed.cycles - 1]) > Math.abs(Bn[preprocessed.cycles - 1])) {
    if (An[preprocessed.cycles - 1] < 0) {
      //An = An.map(x => x * -1);
      //Bn = Bn.map(x => x * -1);
      let newAn = [];
      let newBn = [];
      An.forEach((x, i) => {
        newAn.push(x * -1);
        newBn.push(Bn[i] * -1);
      });
      An = newAn;
      Bn = newBn;
    }
  } else {
    if (Bn[preprocessed.cycles - 1] < 0) {
      //An = An.map(x => x * -1);
      //Bn = Bn.map(x => x * -1);
      let newAn = [];
      let newBn = [];
      An.forEach((x, i) => {
        newAn.push(x * -1);
        newBn.push(Bn[i] * -1);
      });
      An = newAn;
      Bn = newBn;
    }
  }

  // Points pr cycle
  const PPC = 4 * pointPrQuarter;
  // Total points
  const TP = 6 * pointPrQuarter + 1;

  let gammaReconstructed = new Array(PPC);
  for (i = 1; i <= gammaReconstructed.length; i++) {
    gammaReconstructed[i - 1] = gammaZero * Math.sin(2 * Math.PI * (i - 1) / PPC);
  }
  gammaReconstructed.push(...gammaReconstructed.slice(0, 2 * pointPrQuarter + 1));

  // Strain rate is equal to omega/frequency * strain-shifted-1/4-cycle
  //let gammaDotReconstructed = gammaReconstructed.slice(pointPrQuarter+1, pointPrQuarter+PPC+1).map(x => x * frequency);
  let gammaDotReconstructed = [];
  const gamSlice = gammaReconstructed.slice(pointPrQuarter, pointPrQuarter + PPC)
  gamSlice.forEach(x => {
    gammaDotReconstructed.push(x * frequency);
  });
  gammaDotReconstructed.push(...gammaDotReconstructed.slice(0, 2 * pointPrQuarter + 1));

  // m harmonics
  let sigmaReconstructed = new Array(PPC).fill(0);
  let sigmaElastic = new Array(PPC).fill(0);
  let sigmaViscous = new Array(PPC).fill(0);

  for (i = 0; i < PPC; i++) {
    // Odd harmonics only up to highest
    for (var p = 1; p <= highestHarmonic; p = p + 2) {
      sigmaReconstructed[i] = sigmaReconstructed[i] + Bn[(preprocessed.cycles * p) - 1] * Math.sin(p * 2 * Math.PI * (i) / PPC) + An[(preprocessed.cycles * p) - 1] * Math.cos(p * 2 * Math.PI * (i) / PPC);
      sigmaElastic[i] = sigmaElastic[i] + Bn[(preprocessed.cycles * p) - 1] * Math.sin(p * 2 * Math.PI * (i) / PPC)
      sigmaViscous[i] = sigmaViscous[i] + An[(preprocessed.cycles * p) - 1] * Math.cos(p * 2 * Math.PI * (i) / PPC);
    }
  }

  sigmaElastic.push(...sigmaElastic.slice(0, 1));
  sigmaViscous.push(...sigmaViscous.slice(0, 1));
  sigmaReconstructed.push(...sigmaReconstructed.slice(0, 2 * pointPrQuarter + 1))
  //
  // END FT Decomposition and Reconstruction
  //

  //
  // START Calculate Moduli Gn', Gn'', M, L, S S2
  //
  let StorageG = [];
  if (Bn[preprocessed.cycles - 1] > 0) {
    //StorageG = Bn.map(x => x / gammaZero);
    Bn.forEach(x => {
      StorageG.push(x / gammaZero);
    });
  } else {
    //StorageG = Bn.map(x => -1* (x / gammaZero));
    Bn.forEach(x => {
      StorageG.push(-1 * (x / gammaZero));
    });
  }

  let LossG = [];
  if (An[preprocessed.cycles - 1] > 0) {
    //LossG = An.map(x => x / gammaZero);
    An.forEach(x => {
      LossG.push(x / gammaZero);
    });
  } else {
    //LossG = An.map(x => -1* (x / gammaZero));
    An.forEach(x => {
      LossG.push(-1 * (x / gammaZero));
    });
  }

  let GM = 0;
  let GL = 0;
  let EtaM = 0;
  let EtaL = 0;
  for (i = 1; i <= highestHarmonic; i = i + 2) {
    GM = GM + i * StorageG[((preprocessed.cycles) * i) - 1];
    GL = GL + StorageG[(preprocessed.cycles * i) - 1] * (-1) ** ((i - 1) / 2);

    EtaM = EtaM + (1 / frequency) * i * LossG[(preprocessed.cycles * i) - 1] * (-1) ** ((i - 1) / 2);
    EtaL = EtaL + (1 / frequency) * LossG[(preprocessed.cycles * i) - 1]
  }

  let S = (GL - GM) / GL;
  let T = (EtaL - EtaM) / EtaL;

  gammaReconstructed = gammaReconstructed.slice(0, PPC + 1)
  gammaDotReconstructed = gammaDotReconstructed.slice(0, PPC + 1)
  sigmaReconstructed = sigmaReconstructed.slice(0, PPC + 1)
  sigmaElastic = sigmaElastic.slice(0, PPC + 1)
  sigmaViscous = sigmaViscous.slice(0, PPC + 1)

  let result = {
    "Strain [-]": gammaReconstructed,
    "Strain Rate [Hz]": gammaDotReconstructed,
    "Stress [Pa]": sigmaReconstructed,
    ElasticStress: sigmaElastic,
    ViscousStress: sigmaViscous,
    "Stiffening": S,
    "Thickening": T,
    "GM": GM,
    "GL": GL,
    "EtaL": EtaL,
    "EtaM": EtaM,
  }

  return result;
}

// f is vector to be transformed
// returns A0 mean(f), An cosine terms, Bn sine terms
//
// force input to have EVEN number of data points (reqd for fft.m)
// take FFT > complex vector results
// extract trigonometric terms from complex vector
export const FTtrig = (data) => {
  if (data.length % 2 !== 0) {
    data.slice(0, data.length)
  }

  let n = data.length;
  let N = n / 2;

  let [realFFT, imaginaryFFT] = fft(data);

  const realFirstHalf = realFFT.slice(0, N + 1);
  const realSecondHalf = realFFT.slice(-(N));
  let realFn_new = [];
  realFn_new.push(...realSecondHalf);
  realFn_new.push(...realFirstHalf);
  //const An = realFn_new.slice(-(N)).map(x => (x/n) * 2);
  let An = [];
  const slicedReal = realFn_new.slice(-(N));
  slicedReal.forEach(x => {
    An.push((x / n) * 2);
  });

  const imaginaryFirstHalf = imaginaryFFT.slice(0, N + 1);
  const imaginarySecondHalf = imaginaryFFT.slice(-(N));
  let imaginaryFn_new = [];
  imaginaryFn_new.push(...imaginarySecondHalf);
  imaginaryFn_new.push(...imaginaryFirstHalf);
  //const Bn = imaginaryFn_new.slice(-(N)).map(x => (x/n) * -2);
  let Bn = [];
  const slicedIm = imaginaryFn_new.slice(-(N));
  slicedIm.forEach(x => {
    Bn.push((x / n) * -2);
  });

  return { An: An, Bn: Bn }
}

function Processing() {
  const preprocessed = useSelector((state) => state.data.preprocessedData)
  const settings = useSelector((state) => state.settings)
  const dispatch = useDispatch();

  if (checkBadSettings(settings)) {
    return (<Box sx={{ width: 0 }} />);
  }

  if ((preprocessed[0] !== undefined) && (Object.keys(preprocessed[0].data).length === 1 || preprocessed[0].data.length === 0)) {
    return (<Box sx={{ width: 0 }} />);
  }

  for (const entry of preprocessed) {
    if (entry.maxHarmonic < settings.highestHarmonic || entry.maxHarmonic === undefined) {
      return (<Box sx={{ height: "100%", zIndex: "100", left: "50%", top: "50%", position: "absolute" }}>
        <Alert severity="error" sx={{ border: 1, borderColor: 'primary.main', boxShadow: 1 }}>
          <AlertTitle>Harmonics are out of bounds</AlertTitle>
          <strong>Please lower it in the side menu</strong>
        </Alert>
      </Box>);
    }
  }

  let results = []
  for (const entry of preprocessed) {
    const result = analyseData(entry.data, entry.freq, settings, null);
    const newEntry = { fileName: entry.fileName, name: entry.name, data: result, freq: entry.freq, strainPercent: entry.strainPercent }
    results = [...results, newEntry];
  }

  dispatch(setResults(results));
  return (<Box sx={{ width: 0 }} />);
}

export default Processing;