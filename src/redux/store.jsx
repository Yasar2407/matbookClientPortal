import { configureStore } from '@reduxjs/toolkit';
import AuthSlice from "./Slice/AuthSlice";
import MessageReducer from "../utils/Message";
import ImageReducer from "./Slice/ImageSlice";

const reducer = {
    auth: AuthSlice,
    message: MessageReducer,
    image: ImageReducer
}

const store =configureStore({
    reducer:reducer,
    devTools:true,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
    })
  })
  
export default store;