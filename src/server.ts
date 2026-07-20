import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';

const PORT = Number(process.env.PORT) || 4000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
server.keepAliveTimeout = 75_000;   // align with proxies
server.headersTimeout = 76_000;