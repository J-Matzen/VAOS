# Signal Processing

Transforms module is designed for extracting useful information from signals.
## Install

```bash
npm install @signalprocessing/transforms --save
```
## Usage
`@signalprocessing/transforms` module can be both imported as commonJS or ES module.
- ## Fast Fourier Transform ( fft )
This function implements fast Fourier transform  of any given real or complex signal. 

For the real signal, input parameter should be real array: ```let [realFFTCoeffcients, imaginaryFFTCoeffcients] = fft(realInputArray)``` .

For the complex signal, input parameters should be splitted into the real and imaginary arrays: ```let [realFFTCoeffcients, imaginaryFFTCoeffcients] = fft(realInputArray,imaginaryInputArray)```.

```node
//import fft as commonJS module
let fft=require("@signalprocessing/transforms").fft

//Sampling Rate
let Fs = 1000;

//Sampling Period
let T = 1 / Fs;

//Length of signal
let L = 1500;

//Time array
let t = Array.from({ length: L }, (x, i) => i * T);

//A signal containing a 30 Hz sinusoid of amplitude 0.5 and a 100 Hz sinusoid of amplitude 1.
let S = Array.from(t, (x, i) => 0.5 * Math.sin(2 * Math.PI * 30 * x) + Math.sin(2 * Math.PI * 100 * x));

//Compute the Fourier transform of the signal.
let [realFFTCoeffcients, imaginaryFFTCoeffcients] = fft(S);
```

- ## Inverse Fast Fourier Transform ( ifft )
This function implements inverse fast Fourier transform  of the given signal. 

Input parameters should be splitted into the real and imaginary arrays as ```let [realArray,imaginaryArray] =ifft(realInputArray,imaginaryInputArray)```.

If you have the signal ```A``` then you should get ```ifff(fft(A)) == A``` with some numerical difference.

```node
//import ifft as commonJS module
let ifft=require("@signalprocessing/transforms").ifft

//Sampling Rate
let Fs = 1000;

//Sampling Period
let T = 1 / Fs;

//Length of signal
let L = 1500;

//Time array
let t = Array.from({ length: L }, (x, i) => i * T);

//A signal containing a 30 Hz sinusoid of amplitude 0.5 and a 100 Hz sinusoid of amplitude 1.
let S = Array.from(t, (x, i) => 0.5 * Math.sin(2 * Math.PI * 30 * x) + Math.sin(2 * Math.PI * 100 * x));

//Compute the Fourier transform of the signal.
let [realFFTCoeffcients,imaginaryFFTCoeffcients] = fft(S);

//Compute the inverse Fourier transform of the signal.
let [realArray,imaginaryArray] = ifft(realFFTCoeffcients,imaginaryFFTCoeffcients)

//Note: If imaginaryCoeffcients is not present, you should artifically create imaginaryCoeffcients array of all zeros with the same size of realCoeffcients array.

//In this example realArray should be equal to input signal S, 
//imaginaryArray should be zero because the input signal S has only real part.
```

# ToDo List #
This module is under active maintenance. I am planning to add some new features under ```@signalprocessing``` scope as listed below in the next few weeks.
* Short Time Fourier Transform (completed (testing phase)),
* Hilbert Transform (completed (testing phase)),
* Z-transform,
* Wavelet Transform
* Cepstrum,
* Envelope,
* Empirical mode decomposition,

I am also planning to add some other modules in this year.

* Windowing functions module (completed (published)),
* Filters module, 
* Correlation module, 
* Some pre-ready signals module that includes chirp, sine sweep, pulse signals etc., 
* Modal analysis that will help to extract modal parameters from measured signals such as natural frequency, damping, mode shapes etc.(in progress (natural frequency and damping estimation is completed, working on mode shape extraction algorithm)), 
* User interface module that will add interactivity on browser. 


## License
[MIT](https://choosealicense.com/licenses/mit/)