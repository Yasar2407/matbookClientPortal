import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";  
import { setMessage } from "../../utils/Message";
import ImageApi from "../../API/ImageApi";

export const uploadImage = createAsyncThunk(
  'image/uploadImage',
  async (formData, thunkAPI) => {
    try {
      const response = await ImageApi.uploadImage(formData);
      console.log("res:",response) 
      const message=(response.message)
    thunkAPI.dispatch(setMessage(message))
    return response.imageUrl; 
    } catch (error) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
      thunkAPI.dispatch(setMessage(message))
      return thunkAPI.rejectWithValue(message)    }
  }
);

const imageSlice = createSlice({
    name: 'image',
    initialState: { imageUrl: '',  error: null,success:false },
    extraReducers: (builder) => {
      builder
      
        .addCase(uploadImage.fulfilled, (state, action) => {
          state.imageUrl = action.payload;
          state.success=true;
        })
        .addCase(uploadImage.rejected, (state, action) => {
          state.error = action.payload;
          state.success=false;
        })
    },
  });
  
  export default imageSlice.reducer;