const express = require("express")
const app = express ()
const path = require('path')
const PORT = 3000


/* Middleware function that serves static files from the 'public' folder
   for any incoming request. It makes all files in the 'public' folder
   accessible without needing to define specific routes for them.
*/
app.use(express.static(path.join(__dirname, '../dist')))

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname,"../dist","index.html"));
  });

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });