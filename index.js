import { createServer } from 'http';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const host = '0.0.0.0';
const port = 9003;

const DATABASE_FILE = 'db.json';

const readDb = () =>
  JSON.parse(readFileSync(DATABASE_FILE, { encoding: 'utf8' }));
const writeDb = (db) =>
  writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 4), {
    encoding: 'utf8',
  });

if (!existsSync(DATABASE_FILE)) {
  writeDb({});
}

const handlePing = (req, res) => {
  const hostname = req.headers['hostname'];
  const ip = req.socket.remoteAddress;

  const db = readDb();
  db[hostname] = { ip, lastPing: new Date().toISOString() };
  writeDb(db);

  res.statusCode = 202;
  res.end();
};

const handleRootGet = (req, res) => {
  const db = readDb();

  res.setHeader('Content-Type', 'text/html');
  res.end(`<pre>${JSON.stringify(db, null, 4)}</pre>`);
};

const server = createServer((req, res) => {
  console.log(new Date().toISOString(), req.method, req.url);

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
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
