import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST
const server = http.createServer(app);

server.listen(PORT,HOST,  () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
server.keepAliveTimeout = 75_000;   // align with proxies
server.headersTimeout = 76_000;