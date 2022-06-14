import { createSlice } from '@reduxjs/toolkit'

export const dataSlice = createSlice({
  name: 'data',
  initialState: {
    data: [{ fileName: "", name: "", data: [], strainC: 0, stressC: 0, freq: 0, strainPercent: 0 }],
    preprocessedData: [{ fileName: "", name: "", data: [], freq: 0, strainPercent: 0, maxHarmonic: 1000 }],
    fileNames: [""],
    maxHarmonic: 0,
    strainColumn: 0,
    stressColumn: 0,
  },
  reducers: {
    // Functions that change the state of the data
    setData: (state, action) => {
      const values = Object.values(action.payload);
      state.data = values[0];
      state.fileNames = values[1];
    },
    setPreprocessedData: (state, action) => {
      const values = Object.values(action.payload);
      state.preprocessedData = values[0];
      state.maxHarmonic = values[1];
    },
  },
})

// Action creators are generated for each case reducer function
export const { setData, setPreprocessedData } = dataSlice.actions

export default dataSlice.reducer