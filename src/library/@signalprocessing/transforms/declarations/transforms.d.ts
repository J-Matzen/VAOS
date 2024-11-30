/// <reference types="node" />
/**
 * ToDo: DEfinitions will be added.
 */
declare module "@signalprocessing/transforms" {
    /**
     * 
     * @param inputReal 
     * @param inputImag 
     */
    export function fft(inputReal:number[],inputImag?:number[]):number[][]
    /**
     * 
     * @param realCoeff 
     * @param imagCoeff 
     */
    export function ifft(realCoeff:number[],imagCoeff:number[]):number[][]

}
