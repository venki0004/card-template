import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import appStoreReducer from "./appSlice"
export default combineReducers({
    auth: authReducer,
    app_central_store: appStoreReducer
});