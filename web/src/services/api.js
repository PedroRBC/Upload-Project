import axios from "axios";

import { ApiUploadURL } from './services-url'

const api = axios.create({
  baseURL: ApiUploadURL+"/api"
});

export default api;
