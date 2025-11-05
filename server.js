const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

//In-memory data (server keeps sizes in inches) ---
let fishData = [
  { id: 1, name: 'Goldfish',  minSizeInInches: 4 },
  { id: 2, name: 'Betta',     minSizeInInches: 2.5 },
  { id: 3, name: 'Clownfish', minSizeInInches: 3 }
];

function sendJSON(res, obj) {
  
  res.setHeader('Content-type', 'application/json');
  res.write(JSON.stringify(obj));
  res.end();
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.end();
  }

  const { method, url } = req;

  const parsed = new URL(url, `http://${hostname}:${port}`);
  const path = parsed.pathname;
  const qs = parsed.searchParams;

  //READ: list all fish
  if (path === '/fish' && method === 'GET') {
    return sendJSON(res, fishData);
  }

  //READ: search suggestions
  if (path === '/fish/search' && method === 'GET') {
    const q = (qs.get('query') || '').trim().toLowerCase();
    const matches = q
      ? fishData.filter(f => f.name.toLowerCase().includes(q))
      : [];
    return sendJSON(res, matches);
  }

  //READ: by exact name
  if (path === '/fish/by-name' && method === 'GET') {
    const name = (qs.get('name') || '').toLowerCase();
    const found = fishData.find(f => f.name.toLowerCase() === name);
    if (!found) return sendJSON(res, { message: 'Not found' });
    return sendJSON(res, found);
  }

  //CREATE: add new
  if (path === '/fish/add' && method === 'POST') {
    const name = (qs.get('name') || '').trim();
    const size = parseFloat(qs.get('size'));
    if (!name || isNaN(size)) return sendJSON(res, { message: 'name and size required' });

    const existing = fishData.find(f => f.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.minSizeInInches = size;
      return sendJSON(res, { message: 'Existing fish updated', fish: existing });
    }
    const newFish = { id: Date.now(), name: name, minSizeInInches: size };
    fishData.push(newFish);
    return sendJSON(res, { message: 'New fish added', fish: newFish });
  }

//UPDATE: by id 
  if (path === '/fish/update' && method === 'PUT') {
    const id = qs.get('id');
    const size = parseFloat(qs.get('size'));
    const idx = fishData.findIndex(f => String(f.id) === String(id));
    if (idx === -1 || isNaN(size)) return sendJSON(res, { message: 'Fish not found or bad size' });
    fishData[idx].minSizeInInches = size;
    return sendJSON(res, { message: 'Fish updated', fish: fishData[idx] });
  }

  //DELETE: by id
  if (path === '/fish/delete' && method === 'DELETE') {
    const id = qs.get('id');
    const before = fishData.length;
    fishData = fishData.filter(f => String(f.id) !== String(id));
    if (fishData.length === before) return sendJSON(res, { message: 'Fish not found' });
    return sendJSON(res, { message: 'Fish deleted' });
  }

  // Fallback (in example style)
  res.setHeader('Content-type', 'text/plain');
  res.write(`I don't recognize that request.`);
  res.end();
});

server.listen(port, hostname, () => {
  console.log(`Server running at ${hostname}:${port}.`);
});