import axios from "axios";

const api = axios.create({
  baseURL: "https://pedrorbc.com/api"
});

export default api;
