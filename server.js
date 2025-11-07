const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

//server keeps names and sizes in inches
let fishData = [
  { id: 1, name: "Amberjack, Greater", minSizeInInches: 34 },
  { id: 2, name: "Barracuda, Great", minSizeInInches: 0 },
  { id: 3, name: "Black Drum", minSizeInInches: 14 },
  { id: 4, name: "Black Sea Bass", minSizeInInches: 13 },
  { id: 5, name: "Bluefish", minSizeInInches: 12 },
  { id: 6, name: "Bonito, Little Tunny", minSizeInInches: 0 },
  { id: 7, name: "Cobia", minSizeInInches: 36 },
  { id: 8, name: "Croaker, Atlantic", minSizeInInches: 0 },
  { id: 9, name: "Dolphin (Mahi Mahi)", minSizeInInches: 20 },
  { id: 10, name: "Drum, Red (Redfish)", minSizeInInches: 18 },
  { id: 11, name: "Flounder, Gulf", minSizeInInches: 14 },
  { id: 12, name: "Flounder, Southern", minSizeInInches: 14 },
  { id: 13, name: "Gag Grouper", minSizeInInches: 24 },
  { id: 14, name: "Grouper, Black", minSizeInInches: 24 },
  { id: 15, name: "Grouper, Red", minSizeInInches: 20 },
  { id: 16, name: "Grouper, Scamp", minSizeInInches: 16 },
  { id: 17, name: "Grouper, Snowy", minSizeInInches: 0 },
  { id: 18, name: "Grouper, Warsaw", minSizeInInches: 0 },
  { id: 19, name: "Grouper, Yellowfin", minSizeInInches: 20 },
  { id: 20, name: "Grouper, Yellowmouth", minSizeInInches: 20 },
  { id: 21, name: "Grunt, White", minSizeInInches: 8 },
  { id: 22, name: "Hogfish", minSizeInInches: 14 },
  { id: 23, name: "Jack, Almaco", minSizeInInches: 0 },
  { id: 24, name: "Jack, Crevalle", minSizeInInches: 0 },
  { id: 25, name: "Jack, Horse-eye", minSizeInInches: 0 },
  { id: 26, name: "King Mackerel", minSizeInInches: 24 },
  { id: 27, name: "Ladyfish", minSizeInInches: 0 },
  { id: 28, name: "Lane Snapper", minSizeInInches: 8 },
  { id: 29, name: "Mangrove (Gray) Snapper", minSizeInInches: 10 },
  { id: 30, name: "Mullet, Striped (Black)", minSizeInInches: 0 },
  { id: 31, name: "Mullet, Silver", minSizeInInches: 0 },
  { id: 32, name: "Pompano, Florida", minSizeInInches: 11 },
  { id: 33, name: "Porgy, Jolthead", minSizeInInches: 0 },
  { id: 34, name: "Porgy, Red", minSizeInInches: 0 },
  { id: 35, name: "Red Snapper", minSizeInInches: 16 },
  { id: 36, name: "Sheepshead", minSizeInInches: 12 },
  { id: 37, name: "Snook", minSizeInInches: 28 },
  { id: 38, name: "Spanish Mackerel", minSizeInInches: 12 },
  { id: 39, name: "Spotted Seatrout", minSizeInInches: 15 },
  { id: 40, name: "Tarpon", minSizeInInches: 0 },
  { id: 41, name: "Tilefish, Blueline", minSizeInInches: 0 },
  { id: 42, name: "Tilefish, Golden", minSizeInInches: 3 },
  { id: 43, name: "Triggerfish, Gray", minSizeInInches: 12 },
  { id: 44, name: "Tripletail", minSizeInInches: 18 },
  { id: 45, name: "Vermilion Snapper", minSizeInInches: 10 },
  { id: 46, name: "Wahoo", minSizeInInches: 0 },
  { id: 47, name: "Yellowtail Snapper", minSizeInInches: 12 },
  { id: 48, name: "Bull Shark", minSizeInInches: 54 },
  { id: 49, name: "Great Hammerhead Shark", minSizeInInches: 78 },
  { id: 50, name: "Lemon Shark", minSizeInInches: 54 },
  { id: 51, name: "Nurse Shark", minSizeInInches: 54 }
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

  //list all fish
  if (path === '/fish' && method === 'GET') {
    return sendJSON(res, fishData);
  }

  //search suggestions
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
    const newFish = { id: Date.now(), name: name + "*", minSizeInInches: size };
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

  // Fallback
  res.setHeader('Content-type', 'text/plain');
  res.write(`I don't recognize that request.`);
  res.end();
});

server.listen(port, hostname, () => {
  console.log(`Server running at ${hostname}:${port}.`);
});