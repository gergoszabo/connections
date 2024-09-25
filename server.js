import { createServer } from 'http';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import {
  SECRET_HEADER_NAME,
  SECRET_HEADER_VALUE,
  SERVER_PORT,
} from './config.js';

const host = '0.0.0.0';

const DATABASE_FILE = 'db.json';

const readDb = (hostname) => {
  const dbFileName = `${hostname}.${DATABASE_FILE}`;

  if (!existsSync(dbFileName)) {
    writeDb(hostname, { ip: '', lastPing: '', pings: [] });
  }

  return JSON.parse(readFileSync(dbFileName, { encoding: 'utf8' }));
};

const writeDb = (hostname, db) =>
  writeFileSync(`${hostname}.${DATABASE_FILE}`, JSON.stringify(db, null, 4), {
    encoding: 'utf8',
  });

const handlePing = (req, res) => {
  const hostname = req.headers['hostname'];
  const ip = req.socket.remoteAddress;

  const lastPing = new Date().toISOString();

  const pings = readDb(hostname).pings.slice(0, 1000);
  pings.unshift(lastPing);

  const db = {
    ip,
    lastPing,
    pings,
  };
  writeDb(hostname, db);

  res.statusCode = 202;
  res.end();
};

const handleRootGet = (req, res) => {
  const db = readDb();

  res.setHeader('Content-Type', 'text/html');
  res.end(`:)`);
};

const server = createServer((req, res) => {
  console.log(new Date().toISOString(), req.method, req.url);
  if (req.headers[SECRET_HEADER_NAME] !== SECRET_HEADER_VALUE) {
    res.statusCode = 400;
    res.end();
  }

  const hostname = req.headers['hostname'];
  const isPost = req.method === 'POST';
  const isGet = req.method === 'GET';
  const isPing = req.url === '/ping';
  const isRoot = req.url === '/';

  if (!!hostname && isPost && isPing) {
    return handlePing(req, res);
  }

  if (isGet && isRoot) {
    return handleRootGet(req, res);
  }

  res.statusCode = 400;
  res.end();
});

server.listen(SERVER_PORT, host, () => {
  console.log(`Server is running on http://${host}:${SERVER_PORT}`);
});
