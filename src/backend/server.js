const express = require('express');
const app = express();
const PORT = 5000;

app.use(logger);

app.get("/", (req, res) =>{
    res.send("Hello This is your first page!")
    console.log("First Page")
});

app.get("/grafik", (req, res) =>{
    res.send("Grafik!")
    console.log("Kirim data")
});

app.get("/konversi", (req, res) =>{
    res.send("konversi")
    console.log("konversi")
});

app.listen(PORT, () =>{
    console.log(`Server is running at http://localhost:${PORT}`)
});

function logger(req, res, next){
    console.log(req.originalUrl)
    next()
};

