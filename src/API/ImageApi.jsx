import axios from "axios";
import { authHeader } from "./authHeader";

const API_URL = import.meta.env.VITE_API_URL;

const uploadImage = async (formData) => {
  const response = await axios.post(API_URL + "/api/images/uploadImage", formData, {
    headers: {
      ...authHeader(),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const ImageApi = {uploadImage};
  
export default ImageApi;