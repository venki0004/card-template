import { createSlice } from '@reduxjs/toolkit'
import { showToastMessage } from '../../utils/helpers'
import { encryptData } from '../../utils/encryption'

const initialState = {
  user: {},
  isLoading: false,
  apiSuccess: false,
  access_token: '',
  resetSuccess: false,
  updateSuccess: false,
  loggedOut: false,
  verify_otp: false,
  login_success: false,
  errors: {
    login: {},
    forgotPassword: {},
    resetPassword: {},
    updatePassword: '',
  },
}

const counterSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    isLoading: (state, action) => {
      state.isLoading = true
    },
    loginSuccessful: (state, action) => {
      state.isLoading = false
      if (action.payload && typeof window !== 'undefined') {
          const data = action.payload.data.data
          localStorage.setItem('auth_user', encryptData(JSON.stringify(data)))
          localStorage.setItem('user-token', encryptData(data.token.token))
          state.verify_otp = data.enabled_2fa
          state.user = data
          if (data.enabled_2fa) {
            showToastMessage('Please Verify OTP', 'success')
          } else {
            showToastMessage('USER LOGGED IN SUCCESSFULLY', 'success')
          }
      }
    },
    onUserVerificationSuccessful: (state, action) => {
      if (action.payload) {
        state.isLoading = false
        state.login_success = true
        state.verify_otp = false
        showToastMessage('USER LOGGED IN SUCCESSFULLY', 'success')
      }
    },
    onResendOtpSuccessful: (state, action) => {
      if (action.payload) {
        state.isLoading = false
        showToastMessage('VERIFICATION CODE RESEND SUCCESSFULLY', 'success')
      }
    },
    authenticationSuccessful: (state, action) => {
      if (action.payload.email) {
        state.user = {
          email: action.payload.email,
        }
      }
    },
    loginFailure: (state, action) => {
      state.isLoading = false
      showToastMessage(action.payload.message, 'error')
    },
    forgotPasswordSuccessful: (state, action) => {
      state.isLoading = false
      state.apiSuccess = true

      showToastMessage(action.payload.message, 'success')
    },

    forgotPasswordFailure: (state, action) => {
      state.isLoading = false
      showToastMessage(action.payload.message, 'error')
    },
    resetPasswordSuccessful: (state, action) => {
      if (action.payload.status) {
        state.isLoading = false
        state.apiSuccess = true
        showToastMessage(action.payload.message, 'success')
      }
    },
    resetPasswordFailure: (state, action) => {
      state.errors.forgotPassword = action.payload
      state.isLoading = false
      showToastMessage(action.payload.message, 'error')
    },

    loggedOut: (state, action) => {
      state.user = {}
      localStorage.removeItem('remember_me_token')
      // user.logout()
      showToastMessage(action.payload.message, 'success')
    },

    clearAccessToken: (state) => {
      state.access_token = ''
    },

    updatedPasswordSuccessful: (state, action) => {
      if (action.payload) {
        state.user = action.payload.data
        state.isLoading = false
        state.access_token = ''
        // user.login(action.payload.data.token.token)
        state.updateSuccess = true
        showToastMessage(action.payload.message, 'success')
      }
    },

    updatePasswordFailure: (state, action) => {
      state.errors.updatePassword = action.payload
      state.isLoading = false
      showToastMessage(action.payload.message, 'error')
    },
  },
})
export const {
  loginSuccessful,
  onUserVerificationSuccessful,
  onResendOtpSuccessful,
  authenticationSuccessful,
  loginFailure,
  forgotPasswordSuccessful,
  forgotPasswordFailure,
  resetPasswordSuccessful,
  resetPasswordFailure,
  loggedOut,
  clearAccessToken,
  updatedPasswordSuccessful,
  updatePasswordFailure,
  isLoading,
} = counterSlice.actions
export default counterSlice.reducer
