import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setMessage } from "../../utils/Message";
import EventBus from "../../utils/EventBus";
import SignInAPI from "../../API/SignInAPI";

const user = JSON.parse(localStorage.getItem("user"));

export const login = createAsyncThunk(
    "auth/login",
    async ({ Email, Password }, thunkAPI) => {
      try {
        const data = await SignInAPI.login(Email, Password);
        return { user: data };
  
      } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        thunkAPI.dispatch(setMessage(message))
        return thunkAPI.rejectWithValue(message)
      }
    }
);

export const getClientProfile = createAsyncThunk(
  "auth/getClientProfile",
  async ( thunkAPI) => {
    try {
      const response = await SignInAPI.getClientProfile();
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      thunkAPI.dispatch(setMessage(message));
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        EventBus.dispatch("logout");
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = user   
? { isLoggedIn: true,user,profile: null,cusprofile:null,}
: { isLoggedIn: false, user: null, profile: null,cusprofile:null,};

const authSlice = createSlice({
    name: "auth",
  initialState,
  extraReducers: (builder) => {
    builder
    .addCase(login.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.user = action.payload.user;
    })
    .addCase(getClientProfile.fulfilled, (state, action) => {
      console.log("✅ Client profile received:", action.payload);
      state.cusprofile = action.payload; 
    })
  }
})

const { reducer } = authSlice;
export default reducer;