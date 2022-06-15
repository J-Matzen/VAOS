import React, { useEffect } from "react";
import AreaChart from "./visualizations/AreaChart";
import LayoverPlot from "./visualizations/LayoverPlot";
import LayoverPlot3D from "./visualizations/LayoverPlot3D";
import Lissajous from "./visualizations/Lissajous";
import Lissajous3D from "./visualizations/Lissajous3D";
import Pipkin from "./visualizations/Pipkin";
import Heatmap from "./visualizations/Heatmap";
import LineGraph from "./visualizations/LineGraph";
import { StandardColors } from "../constants/colors";
import * as cons from "../constants/plotNames";
import SimilarityChart from "./visualizations/SimilarityChart";
import SimilarityHeatmap from "./visualizations/SimilarityHeatmap";
import SimilarityNetwork from "./visualizations/SimilarityNetwork";
import HarmonicsLine from "./harmonics/HarmonicsLine";

const ChartTypeSelector = (props) => {
  var data = props.hasOwnProperty("data") ? props.data : []
  var selectedChartType = props.hasOwnProperty("selectedChartType") ? props.selectedChartType : ""
  var selectedSampleData = props.hasOwnProperty("selectedSampleData") ? props.selectedSampleData : ""
  var selectedProjection = props.hasOwnProperty("selectedProjection") ? props.selectedProjection : ""
  var selectedFile = props.hasOwnProperty("selectedFile") ? props.selectedFile : ""
  var selectedColorScheme = props.hasOwnProperty("selectedColorScheme") ? props.selectedColorScheme : ""
  var graphSize = props.hasOwnProperty("graphSize") ? props.graphSize : undefined
  var proj = props.hasOwnProperty("proj") ? props.proj : ""
  var ratioValue = props.hasOwnProperty("ratioValue") ? props.ratioValue : ""
  var exportSvg = props.hasOwnProperty("exportSvg") ? props.exportSvg : ""
  var doLines = props.hasOwnProperty("doLines") ? props.doLines : true
  var showTitle = props.hasOwnProperty("showTitle") ? props.showTitle : true
  var axisTitles = props.axisTitles !== undefined ? props.axisTitles : { x: '', y: '' }
  var selectedSample = props.selectedSample !== undefined ? props.selectedSample : ""
  var oldLegends = props.hasOwnProperty("oldLegends") ? props.oldLegends : true
  var strainpct = props.hasOwnProperty("percent") ? props.percent : "100%"
  var view = props.hasOwnProperty("view") ? props.view : "Samples"

  // { selectedChartType, data, selectedSampleData, selectedProjection, selectedFile, selectedColorScheme, graphSize, proj, ratioValue = "Stiffening", exportSvg, doLines}) {
  const [selectedChart, setSelectedChart] = React.useState(null)
  if (selectedColorScheme === undefined) {
    selectedColorScheme = StandardColors;
  }

  if (doLines === undefined) {
    doLines = true
  }

  useEffect(() => {
    var viscousElasticColor = 1
    if (selectedProjection.z === "ViscousStress") {
      viscousElasticColor = 2
    }
    switch (selectedChartType) {
      case cons.TwoDLissajous:
        setSelectedChart(
          <Lissajous data={selectedSampleData} x={selectedProjection.x} y={selectedProjection.y}
            extraY={selectedProjection.z} colors={[selectedColorScheme[0], selectedColorScheme[viscousElasticColor]]}
            graphSize={graphSize} exportSvg={exportSvg} showTitle={showTitle} axisTitles={axisTitles} />
        )
        break;

      case cons.ThreeDLissajous:
        setSelectedChart(
          <Lissajous3D data={selectedSampleData} x={"Strain [-]"} y={"Strain Rate [Hz]"} z={"Stress [Pa]"} colors={selectedColorScheme} graphSize={graphSize} exportSvg={exportSvg}  ></Lissajous3D>
        )
        break;

      case cons.PipkinInSample:
        setSelectedChart(
          <Pipkin data={data} projection={selectedProjection} x={"Strain %"} y={"Frequency"} colors={[selectedColorScheme[0], selectedColorScheme[viscousElasticColor]]}
            graphSize={graphSize} exportSvg={exportSvg} doLines={doLines}
            showTitle={showTitle} axisTitles={axisTitles}
          />
        )
        break;

      case cons.PipkinOutSample:
        setSelectedChart(
          <Pipkin data={data} projection={selectedProjection} x={"Strain %"} y={"Samples"} colors={[selectedColorScheme[0], selectedColorScheme[viscousElasticColor]]} graphSize={graphSize} exportSvg={exportSvg} doLines={doLines}
            showTitle={showTitle} axisTitles={axisTitles}
          />
        )
        break;

      case cons.TwoDLayoverName:
        setSelectedChart(
          <LayoverPlot data={data} x={selectedProjection.x} y={selectedProjection.y} group={"Strain %"}
            fileName={selectedFile} graphSize={graphSize} exportSvg={exportSvg}
            showTitle={showTitle} axisTitles={axisTitles} />
        )
        break;

      case cons.TwoDLayoverNameOut:
        setSelectedChart(
          <LayoverPlot data={data} x={selectedProjection.x} y={selectedProjection.y} group={strainpct}
            fileName={selectedFile} graphSize={graphSize} exportSvg={exportSvg}
            showTitle={showTitle} axisTitles={axisTitles} />
        )
        break;

      case cons.ThreeDLayoverName:
        setSelectedChart(
          <LayoverPlot3D data={data} x={"Strain [-]"} y={"Strain Rate [Hz]"} z={"Stress [Pa]"} fileName={selectedFile} graphSize={graphSize} exportSvg={exportSvg} />
        )
        break;

      case cons.AreaLayoverNameOut:
        setSelectedChart(
          <AreaChart data={data} x={selectedProjection.x} y={selectedProjection.y} group={strainpct} fileName={selectedFile}
            exportSvg={exportSvg} showTitle={showTitle} axisTitles={axisTitles} dimensions={graphSize} />
        )
        break;

      case cons.AreaLayoverName:
        setSelectedChart(
          <AreaChart data={data} x={selectedProjection.x} y={selectedProjection.y} group={"Strain %"} fileName={selectedFile}
            exportSvg={exportSvg} showTitle={showTitle} axisTitles={axisTitles} dimensions={graphSize} />
        )
        break;

      case cons.RatioLinechart:
        setSelectedChart(<LineGraph data={data} x={"Strain %"} y={ratioValue} group={view} graphSize={graphSize}
          exportSvg={exportSvg} showTitle={showTitle} axisTitles={axisTitles} />)
        break;


      case cons.RatioHeatmap:
        setSelectedChart(
          <Heatmap data={data} x={view} y={"Strain %"} value={ratioValue} graphSize={graphSize}
            exportSvg={exportSvg} showTitle={showTitle} axisTitles={axisTitles} />
        )
        break;

      case cons.SimilarityHeatmap:
        setSelectedChart(
          <SimilarityHeatmap data={data} projection={proj} x={selectedProjection.x} y={selectedProjection.y} dimensions={graphSize} exportSvg={exportSvg} />
        )
        break;
      case cons.SimilarityChart:
        setSelectedChart(
          <SimilarityChart data={data} projection={proj} x={selectedProjection.x} y={selectedProjection.y} dimensions={graphSize} exportSvg={exportSvg} />
        )
        break;
      case cons.SimilarityNetwork:
        setSelectedChart(
          <SimilarityNetwork data={data} projection={proj} x={selectedProjection.x} y={selectedProjection.y} dimensions={graphSize} exportSvg={exportSvg} oldLegends={oldLegends} />
        )
        break;

      case cons.HarmonicsLineChart:
        if (selectedSample !== "") {
          setSelectedChart(
            <HarmonicsLine selectedSample={selectedSample} exportSvg={exportSvg} />
          )
        }
        break;
    }
  }, [props])

  return selectedChart
}

export default ChartTypeSelector;