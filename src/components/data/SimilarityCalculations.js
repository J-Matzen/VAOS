import React from 'react';
import { Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setSimilarity } from '../../slices/similaritySlice';
import { ElasticStress, Strain, StrainRate, Stress, ViscousStress } from '../../constants/attributes';
import DynamicTimeWarping from 'dynamic-time-warping-2'
import * as d3 from "d3";

const calculationDistAndSim = (lineData) => {
  let cutData = [];
  lineData.forEach((sheet) => {
    let data = sheet.data;

    //const yMax = Math.max(...data.map((point) => { return point.y }));
    //const yMin = Math.min(...data.map((point) => { return point.y }));
    //const xMax = Math.max(...data.map((point) => { return point.x }));
    //const xMin = Math.min(...data.map((point) => { return point.x }));

    let yMax = 0;
    let yMin = 100000;
    let xMax = 0;
    let xMin = 100000;
    data.forEach(point => {
      if (point.y > yMax) {
        yMax = point.y;
      }

      if (point.y < yMin) {
        yMin = point.y;
      }

      if (point.x > xMax) {
        xMax = point.x;
      }

      if (point.x < xMin) {
        xMin = point.x;
      }
    });

    // Min-max normalization + calculate center point
    var centerX = 0;
    var centerY = 0;
    let newData = []
    data.forEach((i) => {
      let x = (i.x - xMin) / (xMax - xMin);
      let y = (i.y - yMin) / (yMax - yMin);

      centerX += x;
      centerY += y;

      newData.push({
        x: x,
        y: y
      });
    });
    data = newData;

    centerX = centerX / data.length;
    centerY = centerY / data.length;

    // Calculate distance from center to points
    newData = [];
    data.forEach((e, i) => {
      let y = Math.sqrt(Math.pow(e.x - centerX, 2) + Math.pow(e.y - centerY, 2));
      newData.push({
        dist: y,
        x: i,
      });
    });
    data = newData;

    // Find all maximas
    let maximas = []
    // First point is maxima
    if (data[0].dist > data[1].dist) {
      maximas.push({ y: data[0].dist, index: 0 })
    }

    data.forEach((e, i) => {
      if (i !== 0 && i !== data.length - 1) {
        if (data[i - 1].dist < e.dist && e.dist > data[i + 1].dist) {
          maximas.push({ y: e.dist, index: i })
        }
      }
    });

    // Last point is maxima
    if (data[data.length - 1].dist > data[data.length - 2].dist) {
      maximas.push({ y: data[data.length - 1].dist, index: data.length - 1 })
    }

    const firstMaximaValue = Math.max(...maximas.map((point) => { return point.y }));
    const firstMaxima = maximas.splice(maximas.map((point) => { return point.y }).indexOf(firstMaximaValue), 1)[0]
    const secondMaximaValue = Math.max(...maximas.map((point) => { return point.y }));
    const secondMaxima = maximas.splice(maximas.map((point) => { return point.y }).indexOf(secondMaximaValue), 1)[0]

    // Trim data down to from first maxima to second maxima
    data = firstMaxima.index > secondMaxima.index ? data.splice(secondMaxima.index, firstMaxima.index - secondMaxima.index) : data.splice(firstMaxima.index, secondMaxima.index - firstMaxima.index);

    newData = [];
    data.forEach((e, i) => {
      newData.push({
        dist: e.dist,
        x: i,
      });
    });
    data = newData;

    cutData.push({ name: sheet.name, data: data })
  })

  let similarityData = [];
  let alreadyDone = new Set();
  cutData.forEach((sheet) => {
    cutData.forEach((secondSheet) => {
      if (sheet.name === secondSheet.name || alreadyDone.has(sheet.name + secondSheet.name)) {
        return;
      }
      const distFunc = (a, b) => Math.abs(a.dist - b.dist);
      const dtw = new DynamicTimeWarping([...sheet.data], [...secondSheet.data], distFunc);

      let similarity = dtw.getDistance();

      // The average distance from center is 0.5, there are sheet.data.length amount of points,
      // So worst-case average the difference between each two points is 0.5 and times that up for all points, 
      const longestDataSet = sheet.data.length > secondSheet.data.length ? sheet.data.length : secondSheet.data.length
      similarity = Math.abs(similarity / (longestDataSet * 0.5 * 0.5))
      let similarityPercent = 100 - (similarity * 100)

      alreadyDone.add(sheet.name + secondSheet.name);
      alreadyDone.add(secondSheet.name + sheet.name);
      similarityData.push({ first: sheet.name, second: secondSheet.name, similarity: similarity, similarityPercent: similarityPercent });
      similarityData.push({ first: secondSheet.name, second: sheet.name, similarity: similarity, similarityPercent: similarityPercent });
    })
  })

  return [similarityData, cutData];
}

const calculateSimilarities = (data) => {
  let elasticLissajousLineData = [];
  let viscousLissajousLineData = [];
  let elasticSimilarities = [];
  let viscousSimilarities = [];

  data.forEach((d) => {
    if (!d.data.hasOwnProperty(Stress)) {
      return { 0: elasticLissajousLineData, 1: viscousLissajousLineData, 2: elasticSimilarities, 3: viscousSimilarities };
    }

    let elasticData = []
    let viscousData = []
    d.data[Stress].forEach((e, i) => {
      elasticData.push({ x: d.data[Strain][i], y: e });
      viscousData.push({ x: d.data[StrainRate][i], y: e });
    });

    elasticLissajousLineData.push({ name: d.name + " " + d.strainPercent, data: elasticData });
    viscousLissajousLineData.push({ name: d.name + " " + d.strainPercent, data: viscousData });
  });

  if (data[0].data.length !== 0 && (data[0].data.hasOwnProperty(Stress))) {
    let dataLength = data[0].data[Stress].length;
    let perfectScale = d3.scaleLinear()
      .domain([0, dataLength - 1])
      .range([0, 1]);

    let elasticPerfectData = []
    let viscousPerfectData = []
    for (let i = 0; i < Math.round(data[0].data[Stress].length / 2); i++) {
      let p = perfectScale(i);
      viscousPerfectData.push({ x: p, y: p });
      elasticPerfectData.push({ x: p, y: p });
    };

    elasticLissajousLineData.push({ name: ElasticStress, data: elasticPerfectData });
    viscousLissajousLineData.push({ name: ViscousStress, data: viscousPerfectData });
  }

  let tempElastic = calculationDistAndSim(elasticLissajousLineData)
  elasticSimilarities = tempElastic[0]
  elasticLissajousLineData = tempElastic[1]
  let tempViscous = calculationDistAndSim(viscousLissajousLineData)
  viscousSimilarities = tempViscous[0]
  viscousLissajousLineData = tempViscous[1]

  return { 0: elasticLissajousLineData, 1: viscousLissajousLineData, 2: elasticSimilarities, 3: viscousSimilarities };
}

function SimilarityCalculations() {
  const data = useSelector((state) => state.results.results)
  const dispatch = useDispatch();

  if ((data[0] !== undefined) && Object.keys(data[0].data).length === 1) {
    return (<Box sx={{ width: 0 }} />);
  }

  const results = calculateSimilarities(data);

  dispatch(setSimilarity(results));
  return (<Box sx={{ width: 0 }} />);
}

export default SimilarityCalculations;