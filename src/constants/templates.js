import * as cons from "../constants/plotNames";
import { StandardColors } from '../constants/colors';
import { StrainRate } from "./attributes";

var selectedSample = " - 0%"
var projection = "Elastic"
var data = []
var selectedSampleData = []
var selectedFile = undefined

export const similarityGridChartTemplate = () => [
    {
        selectedChartType: cons.PipkinOutSample, selectedSampleData: [], selectedSample: " - 0%",
        data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
        , alignment: "Standard", ratioValue: "Stiffening", template: true
      },
    {
      selectedChartType: cons.SimilarityChart, selectedSampleData: [], selectedSample: " - 0%",
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },
    {
      selectedChartType: cons.SimilarityNetwork, selectedSampleData: [], selectedSample: " - 0%",
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", oldLegends: true
    },
    {
      selectedChartType: cons.SimilarityHeatmap, selectedSampleData: [], selectedSample: " - 0%",
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },
  ]


  export const mitLaosGridChartTemplate = (selectedSample) => [
    {
      selectedChartType: cons.PipkinOutSample, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: true
    },
    {
      selectedChartType: cons.TwoDLissajous, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },

    {
      selectedChartType: cons.PipkinOutSample, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: StrainRate, y: 'Stress [Pa]', z: 'ViscousStress' }, proj: "Viscous", selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: true
    },
    {
      selectedChartType: cons.TwoDLissajous, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: StrainRate, y: 'Stress [Pa]', z: 'ViscousStress' }, proj: "Viscous", selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },
  ]


  export const evolutionGridChartTemplate = (selectedSample, selectedFile) => [
    {
      selectedChartType: cons.PipkinOutSample, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: selectedFile, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: true
    },
    {
      selectedChartType: cons.TwoDLissajous, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: undefined, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening"
    },
    {
      selectedChartType: cons.TwoDLayoverName, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: selectedFile, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: false, view: "Samples", graphSize: { width: 900, height: 900 }
    },

    {
      selectedChartType: cons.RatioLinechart, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: selectedFile, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Stiffening", template: false, view: "Samples"
    },
    {
      selectedChartType: cons.RatioLinechart, selectedSampleData: selectedSampleData, selectedSample: selectedSample,
      data: data, selectedProjection: { x: 'Strain [-]', y: 'Stress [Pa]', z: 'ElasticStress' }, proj: projection, selectedFile: selectedFile, selectedColorScheme: StandardColors
      , alignment: "Standard", ratioValue: "Thickening", template: false, view: "Samples"
    },
  ]