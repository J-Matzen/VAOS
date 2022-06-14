import { configureStore } from '@reduxjs/toolkit'
import dataReducer from '../slices/dataSlice'
import settingsReducer from '../slices/settingsSlice'
import resultsReducer from '../slices/resultsSlice'
import similarityReducer from '../slices/similaritySlice'

export default configureStore({
  reducer: {
    data: dataReducer,
    settings: settingsReducer,
    results: resultsReducer,
    similarity: similarityReducer
  },
})