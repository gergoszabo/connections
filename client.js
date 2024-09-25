import {
  SERVER_IP,
  SERVER_PORT,
  SECRET_HEADER_NAME,
  SECRET_HEADER_VALUE,
} from './config.js';
import { hostname } from 'os';

fetch(`http://${SERVER_IP}:${SERVER_PORT}/ping`, {
  method: 'POST',
  headers: {
    [SECRET_HEADER_NAME]: SECRET_HEADER_VALUE,
    hostname: hostname(),
  },
}).then((res) => console.log(res.status, res.statusText));
