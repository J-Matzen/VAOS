import { transform } from './transform.js'
/**
 * 
 * @param {*} inputReal An array of real values to be passed to the function
 * @param {*} inputImag Optional: An array of imaginary values to be passed to the function
 * @returns a vector [realValues,imaginaryValues] that contains the coefficents of Fourier transform.
 */
function fft(inputReal, inputImag = null) {
  let XImag = null;
  let XReal = null;
  let imagLength = null;
  let realLength = null;
  if (!Array.isArray(inputReal)) {
    throw "Real input of fft is not Array";
  }
  let chkNumberRealElements = inputReal.every(function (element) { return typeof element === 'number'; });
  if (!chkNumberRealElements) {
    throw "Real input array of fft must be numeric";
  }
  realLength = inputReal.length;
  XReal = inputReal;
  if (inputImag !== null) {
    if (!Array.isArray(inputImag)) {
      throw "Imaginary input of fft is not Array";
    }
    let chkNumberImagElements = inputImag.every(function (element) { return typeof element === 'number'; });
    if (!chkNumberImagElements) {
      throw "Imaginary input array of fft must be numeric";
    }
    imagLength = inputImag.length;
    XImag = inputImag;
    if (realLength !== imagLength) {
      throw "Length of real and imaginary parts of fft must be same"
    }
  } else {
    XImag = new Array(realLength).fill(0);
    imagLength = realLength;
  }
  let real = XReal.slice();
  let imag = XImag.slice();
  transform(real, imag);
  return [real, imag]
}
/**
 * 
 * @param {*} inputReal An array of real values to be passed to the function
 * @param {*} inputImag An array of imaginary values to be passed to the function
 * @returns A array [realValues,imaginaryValues] that contains the coefficents of Inverse Fourier transform.
 */
function ifft(inputReal, inputImag) {

  if (!Array.isArray(inputReal)) {
    throw "Real input of ifft is not Array";
  }
  if (!Array.isArray(inputImag)) {
    throw "Imaginary input of ifft is not Array";
  }
  let chkNumberRealElements = inputReal.every(function (element) { return typeof element === 'number'; });
  if (!chkNumberRealElements) {
    throw "Real input array of ifft must be numeric";
  }

  let chkNumberImagElements = inputImag.every(function (element) { return typeof element === 'number'; });
  if (!chkNumberImagElements) {
    throw "Imaginary input array of ifft must be numeric";
  }

  let [real, imag] = fft(inputImag, inputReal);
  real = real.map(function (x) { return x / real.length; });
  imag = imag.map(function (x) { return x / imag.length; });
  return [imag, real]
}

export { fft, ifft };




