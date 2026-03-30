
import axios from "axios";
import { toast } from "react-toastify";

const ApiCall = async (url, method, navigate, setUser, data) => {
  try {
    const config = {
      method,
      url: `${import.meta.env.VITE_SERVER_URL}${url}`,
      data,
      withCredentials: true
    };

    const response = await axios(config);
    return response.data;

  } catch (error) {
    console.error("API Error:", error);

    if (error?.response?.status === 401) {
      setUser(null);
      navigate("/login");
    } 
    else if (error?.response?.status === 404) {
      toast.error("Resource not found");
      navigate("/");
    } 
    else if (error?.response?.status === 500) {
      toast.error("Server error");
      navigate("/");
    } 
    else {
      toast.error("Something went wrong");
    }
  }
};

export default ApiCall;