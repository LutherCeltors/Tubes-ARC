const express = require('express');
const axios = require('axios');
const path = require('path')
const app = express();
const PORT = 5000;

app.use(logger);
app.use('/', express.static(path.join(__dirname, '../frontend'))); //conecting to frontend

app.get('/', async (req, res) => {

});

app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, 'frontend'))
    console.log("Home Page")
});

app.get("/grafik", async (req, res) =>{
    res.send("Grafik!")
    console.log("Kirim data")
    try {
        const response = await axios.get('https://api.example.com/data');
        const externalData = response.data;

        res.json({
            labels: externalData.labels,
            values: externalData.values
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch external chart data' });
    }
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

