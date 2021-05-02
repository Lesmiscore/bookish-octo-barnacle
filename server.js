// converts Vercel-flavored code into Express app

const express = require('express');
const app = express();

app.get('/', require("./api/index.js"));
app.get('/api/', require("./api/index.js"));
app.get('/api/google_search', require("./api/google_search.js"));

app.get('/api/openrec/live_begin', require("./api/openrec/live_begin.js"));

app.get('/api/y2mate/youtube', require("./api/y2mate/youtube.js"));

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
