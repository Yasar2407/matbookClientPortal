

import axios from "axios";
import { authHeader } from "./authHeader";

const API_URL = import.meta.env.VITE_API_URL;

const login = async (Email,Password) => {
    const response = await axios.post(API_URL + "/api/user/service/cp/682702065cc78a4ecc22d2fd",{
       Email,
       Password,
      });
      console.log("RESPONSE:",response.data.data);
      
    if (response.data.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
      }
    return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
};


const getClientProfile= async () => {
  const response = await axios.get(API_URL +'/api/user/service/682702065cc78a4ecc22d2fd', { 
      headers: authHeader() });
  return response;
};



const SignInAPI = {login,logout,getClientProfile};

export default SignInAPI;