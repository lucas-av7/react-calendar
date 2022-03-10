import axios from "axios";

// Metaweather is complaning about CORS

const api = axios.create({
  baseURL: "https://cors-proxy-lucas.herokuapp.com/https://www.metaweather.com/api/location"
});

export default api;
