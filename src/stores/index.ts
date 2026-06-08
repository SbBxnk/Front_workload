import { configureStore } from '@reduxjs/toolkit'
import utilityReducer from './features/utility'
import sidebarReducer from './features/sidebar'

export const store = configureStore({
  reducer: {
    utility: utilityReducer,
    sidebar: sidebarReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
