import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.2.2:3333', // on android emulator
});

export default api;
