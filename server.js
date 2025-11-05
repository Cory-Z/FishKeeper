const express = require('express');
const app = express();

// Route for the homepage
app.get('/', (req, res) => {
  res.send('Hello from Express!!');
});

// Start the server
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});