const express = require('express');
const axios = require('axios');
const path = require('path')
const app = express();
const PORT = 5000;

app.use(logger);
app.use('/', express.static(path.join(__dirname, '../frontend'))); //conecting to frontend
app.use(express.json());

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

app.get("/api/conversion", async (req, res) =>{
    console.log("konversi")
    const {fromCurr = 'IDR', toCurr = 'EUR'} = req.query;
    try {
        const response = await axios.get(`https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_fd18nyAhD1Xsl9y0jhqsGWM4CwMCr7tDnDZcnHyG&currencies=${toCurr}&base_currency=${fromCurr}`);
    
        const externalData = response.data.data;
    
        console.log("Ambil data dari API");

        const rate = externalData[toCurr];
        
        if (!rate) {
        return res.status(400).json({ error: "Invalid currency code" });
        }

        res.json({
            from: fromCurr ,
            to: toCurr,
            rate
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch external chart data' });
    }
});

app.listen(PORT, () =>{
    console.log(`Server is running at http://localhost:${PORT}`)
});

function logger(req, res, next){
    console.log(req.originalUrl)
    next()
};

