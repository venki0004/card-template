import { createSlice } from '@reduxjs/toolkit'
import { showToastMessage } from '../utils/helpers'

const initialState = {
  clientPrivateKey: '',
  clientPublicKey: '',
  serverPublicKey: '',
  access_token: '',
  csrf_token: false,
}

const appStoreSlice = createSlice({
  name: 'app-central-store',
  initialState,
  reducers: {
    setClientPrivateKey: (state, action) => {
      state.clientPrivateKey = action.payload
    },
    setClientPublicKey: (state, action) => {
      state.clientPublicKey = action.payload
    },
    setServerPublicKey: (state, action) => {
      state.serverPublicKey = action.payload
    },
  },
})
export const {
  setClientPrivateKey,
  setClientPublicKey,
  setServerPublicKey
} = appStoreSlice.actions
export default appStoreSlice.reducer
