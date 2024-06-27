import { decryptData, encryptData } from "./encryption"

const TOKEN_KEY = 'user-token'
const AUTH_USER = 'auth-user'

export const login = (value: string) => {
  if (value.length) return localStorage.setItem(encryptData(TOKEN_KEY), value)
  return false
}

export const token = () => decryptData(localStorage.getItem(TOKEN_KEY) ?? '')

export const logout = () => {
  localStorage.removeItem(AUTH_USER)
  localStorage.removeItem(TOKEN_KEY)
}


export const isUserLoggedIn = () => {
  if (localStorage.getItem(TOKEN_KEY) && localStorage.getItem(AUTH_USER)) {
    return true
  }

  return false
}

export const getLoggedInUser = () => {
  if (localStorage.getItem(AUTH_USER)) {
    return JSON.parse(decryptData(localStorage.getItem(AUTH_USER) ?? ''))
  }

  return false
}
