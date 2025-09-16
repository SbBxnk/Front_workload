import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Breadcrumb } from '@/Types/breadcrumb'

interface UtilityState {
  breadcrumbs: Breadcrumb[]
}

const initialState: UtilityState = {
  breadcrumbs: [],
}

const utilitySlice = createSlice({
  name: 'utility',
  initialState,
  reducers: {
    setBreadcrumbs: (state: UtilityState, action: PayloadAction<Breadcrumb[]>) => {
      state.breadcrumbs = action.payload
    },
  },
})

export const { setBreadcrumbs } = utilitySlice.actions
export default utilitySlice.reducer
