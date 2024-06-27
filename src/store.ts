import { configureStore } from '@reduxjs/toolkit'

import reducer from './features/reducers'
import api from './features/middleware/api'

export const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => [...getDefaultMiddleware(), api],
})
