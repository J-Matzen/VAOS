"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fft = fft;
exports.ifft = ifft;

var _transform = require("./transform.js");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * 
 * @param {*} inputReal An array of real values to be passed to the function
 * @param {*} inputImag Optional: An array of imaginary values to be passed to the function
 * @returns a vector [realValues,imaginaryValues] that contains the coefficents of Fourier transform.
 */
function fft(inputReal) {
  var inputImag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var XImag = null;
  var XReal = null;
  var imagLength = null;
  var realLength = null;

  if (!Array.isArray(inputReal)) {
    throw "Real input of fft is not Array";
  }

  var chkNumberRealElements = inputReal.every(function (element) {
    return typeof element === 'number';
  });

  if (!chkNumberRealElements) {
    throw "Real input array of fft must be numeric";
  }

  realLength = inputReal.length;
  XReal = inputReal;

  if (inputImag !== null) {
    if (!Array.isArray(inputImag)) {
      throw "Imaginary input of fft is not Array";
    }

    var chkNumberImagElements = inputImag.every(function (element) {
      return typeof element === 'number';
    });

    if (!chkNumberImagElements) {
      throw "Imaginary input array of fft must be numeric";
    }

    imagLength = inputImag.length;
    XImag = inputImag;

    if (realLength !== imagLength) {
      throw "Length of real and imaginary parts of fft must be same";
    }
  } else {
    XImag = new Array(realLength).fill(0);
    imagLength = realLength;
  }

  var real = XReal.slice();
  var imag = XImag.slice();
  (0, _transform.transform)(real, imag);
  return [real, imag];
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

  var chkNumberRealElements = inputReal.every(function (element) {
    return typeof element === 'number';
  });

  if (!chkNumberRealElements) {
    throw "Real input array of ifft must be numeric";
  }

  var chkNumberImagElements = inputImag.every(function (element) {
    return typeof element === 'number';
  });

  if (!chkNumberImagElements) {
    throw "Imaginary input array of ifft must be numeric";
  }

  var _fft = fft(inputImag, inputReal),
      _fft2 = _slicedToArray(_fft, 2),
      real = _fft2[0],
      imag = _fft2[1];

  real = real.map(function (x) {
    return x / real.length;
  });
  imag = imag.map(function (x) {
    return x / imag.length;
  });
  return [imag, real];
}