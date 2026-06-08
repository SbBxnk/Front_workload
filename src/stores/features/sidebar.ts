import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import UserServices from '@/services/userServices'
import type { SidebarMenuGroup } from '@/Types'

interface SidebarState {
  menus: SidebarMenuGroup[]
  isAdmin: boolean
  loaded: boolean
  sidebarMode: 'workload' | 'landing'
}

const initialState: SidebarState = {
  menus: [],
  isAdmin: false,
  loaded: false,
  sidebarMode: 'workload',
}

export const fetchSidebar = createAsyncThunk('sidebar/fetch', async () => {
  const res = await UserServices.getSidebar()
  return res.payload
})

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarMode: (state, action: PayloadAction<'workload' | 'landing'>) => {
      state.sidebarMode = action.payload
    },
    clearSidebar: (state) => {
      state.menus = []
      state.isAdmin = false
      state.loaded = false
      state.sidebarMode = 'workload'
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSidebar.fulfilled, (state, action) => {
      state.menus = action.payload.menus
      state.isAdmin = action.payload.isAdmin
      state.loaded = true
    })
  },
})

export const { setSidebarMode, clearSidebar } = sidebarSlice.actions
export default sidebarSlice.reducer
