import axios from 'axios';


const API = axios.create({
    baseURL: 'https://assignment3-backend-419021.wl.r.appspot.com',
    headers: {
        'Content-Type': 'application/json',
    },
});


export default API;