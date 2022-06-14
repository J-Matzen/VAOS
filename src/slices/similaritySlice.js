import { createSlice } from '@reduxjs/toolkit'

export const similaritySlice = createSlice({
  name: 'similarity',
  initialState: {
    elasticLissajousLineData: [{ name: "", data: [] }],
    viscousLissajousLineData: [{ name: "", data: [] }],
    elasticSimilarities: [{ first: "", second: "", similarity: "", similarityPercent: "" }],
    viscousSimilarities: [{ first: "", second: "", similarity: "", similarityPercent: "" }],
  },
  reducers: {
    // Functions that change the state of the data
    setSimilarity: (state, action) => {
      const values = Object.values(action.payload);
      state.elasticLissajousLineData = values[0];
      state.viscousLissajousLineData = values[1];
      state.elasticSimilarities = values[2];
      state.viscousSimilarities = values[3];
    },
  },
})

// Action creators are generated for each case reducer function
export const { setSimilarity } = similaritySlice.actions

export default similaritySlice.reducer