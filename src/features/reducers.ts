import { combineReducers } from "@reduxjs/toolkit";
import appStoreReducer from "./appSlice"
export default combineReducers({
    app_central_store: appStoreReducer
});