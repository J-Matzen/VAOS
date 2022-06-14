import { createSlice } from '@reduxjs/toolkit'

export const resultsSlice = createSlice({
  name: 'results',
  initialState: {
    //[{name: sheetName, data: []}, {name: sheetName2, data: []}}
    results: [{
      fileName: "",
      name: "",
      data: [],
      freq: 0,
      strainPercent: 0
    }],
  },
  reducers: {
    // Functions that change the state of the data
    setResults: (state, action) => {
      state.results = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setResults } = resultsSlice.actions

export default resultsSlice.reducer