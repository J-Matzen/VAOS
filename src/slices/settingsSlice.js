import { createSlice } from '@reduxjs/toolkit'

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    highestHarmonic: 0,
    pointPrQuarter: 0,
  },
  reducers: {
    // Maybe create one big set function where all below are grouped
    setSettings: (state, action) => {
      const values = Object.values(action.payload)
      state.highestHarmonic = parseFloat(values[0]);
      state.pointPrQuarter = parseFloat(values[1]);
    },
    setHighestHarmonic: (state, action) => {
      state.highestHarmonic = action.payload
    },
    setPointPrQuarter: (state, action) => {
      state.pointPrQuarter = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setSettings, setFrequency, setHighestHarmonic, setPointPrQuarter } = settingsSlice.actions

export default settingsSlice.reducer