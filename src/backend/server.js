const express = require('express');
const bodyParser = require('body-parser'); 
const app = express();
const cors = require('cors');
const path = require('path');
const PORT = 5000; 
const currencyConverter = require('./currencyConverter'); 

app.use(cors());
app.use(bodyParser.json()); 
app.use('/', express.static(path.join(__dirname, "../frontend")))
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(logger);

app.get("/", (req, res) =>{
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Anda sudah punya ini

// Tambahkan dua route handler ini:
app.get('/api/convert-from-idr', async (req, res) => {
  const { amount, to } = req.query;

  if (!amount || !to) {
    return res.status(400).json({ error: 'Parameter "amount" dan "to" diperlukan.' });
  }
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Parameter "amount" harus berupa angka positif.' });
  }

  try {
    // Menggunakan fungsi yang diimpor dari currencyConverter.js
    const convertedAmount = await currencyConverter.convertFromRupiah(numericAmount, to.toUpperCase());
    if (convertedAmount !== null) {
      res.json({
        originalAmount: numericAmount,
        fromCurrency: 'IDR',
        toCurrency: to.toUpperCase(),
        convertedAmount: convertedAmount.toFixed(2) // Format ke 2 angka desimal
      });
    } else {
      res.status(500).json({ error: 'Gagal melakukan konversi mata uang.' });
    }
  } catch (error) {
    console.error('Error di endpoint /api/convert-from-idr:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal server.' });
  }
});

app.get('/api/convert-to-idr', async (req, res) => {
    const { amount, from } = req.query;

    if (!amount || !from) {
        return res.status(400).json({ error: 'Parameter "amount" dan "from" diperlukan.' });
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Parameter "amount" harus berupa angka positif.' });
    }

    try {
        // Menggunakan fungsi yang diimpor dari currencyConverter.js
        const convertedAmount = await currencyConverter.convertToRupiah(numericAmount, from.toUpperCase());
        if (convertedAmount !== null) {
        res.json({
            originalAmount: numericAmount,
            fromCurrency: from.toUpperCase(),
            toCurrency: 'IDR',
            convertedAmount: convertedAmount.toFixed(2) // Format ke 2 angka desimal
        });
        } else {
        res.status(500).json({ error: 'Gagal melakukan konversi mata uang.' });
        }
    } catch (error) {
        console.error('Error di endpoint /api/convert-to-idr:', error);
        res.status(500).json({ error: 'Terjadi kesalahan internal server.' });
    }
});

app.get('/api/convert', async (req, res) => {
  const { amount, from, to } = req.query;

  if (!amount || !from || !to) {
    return res.status(400).json({ error: 'Parameter "amount", "from", dan "to" diperlukan.' });
  }
  const numericAmount = parseFloat(amount);
  // Izinkan amount 0 jika hanya ingin mendapatkan rate 1 unit
  if (isNaN(numericAmount) || numericAmount < 0) {
    return res.status(400).json({ error: 'Parameter "amount" harus berupa angka non-negatif.' });
  }

  const fromCurrency = from.toUpperCase();
  const toCurrency = to.toUpperCase();

  if (fromCurrency === toCurrency) {
    return res.json({
        originalAmount: numericAmount,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        convertedAmount: numericAmount.toFixed(2)
    });
  }

  try {
    const rates = await currencyConverter.getExchangeRates(fromCurrency); // Dapatkan semua rate dari mata uang SUMBER
    if (rates && rates[toCurrency] !== undefined) {
      const exchangeRate = rates[toCurrency];
      const convertedValue = numericAmount * exchangeRate;
      res.json({
        originalAmount: numericAmount,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        convertedAmount: convertedValue.toFixed(2)
      });
    } else {
      // Fallback atau error jika rate langsung tidak ada
      // Logika fallback via IDR yang lebih kompleks bisa ditambahkan di sini jika diperlukan,
      // seperti yang ada di contoh server.js saya sebelumnya, atau lempar error jika rate tidak ditemukan.
      console.warn(`Rate langsung ${fromCurrency} -> ${toCurrency} tidak ditemukan di API rates untuk basis ${fromCurrency}.`);
      // Mencoba via IDR sebagai perantara jika API provider lebih optimal dengan IDR
      if (fromCurrency !== 'IDR' && toCurrency !== 'IDR') { // Kasus A -> B (keduanya bukan IDR)
        console.log(`Mencoba konversi ${fromCurrency} -> IDR -> ${toCurrency}`);
        const ratesFromA = await currencyConverter.getExchangeRates(fromCurrency);
        if (!ratesFromA || ratesFromA['IDR'] === undefined) {
          throw new Error(`Tidak bisa mendapatkan rate konversi dari ${fromCurrency} ke IDR.`);
        }
        const amountInIDR = numericAmount * ratesFromA['IDR'];

        const ratesFromIDR = await currencyConverter.getExchangeRates('IDR');
        if (!ratesFromIDR || ratesFromIDR[toCurrency] === undefined) {
            throw new Error(`Tidak bisa mendapatkan rate konversi dari IDR ke ${toCurrency}.`);
        }
        const finalAmount = amountInIDR * ratesFromIDR[toCurrency];
        res.json({ originalAmount: numericAmount, fromCurrency, toCurrency, convertedAmount: finalAmount.toFixed(2) });
      } else { // Salah satu adalah IDR, atau kasus lain yang belum ditangani fallbacknya
        throw new Error(`Rate untuk ${fromCurrency} ke ${toCurrency} tidak ditemukan.`);
      }
    }
  } catch (error) {
    console.error(`Error di endpoint /api/convert (${fromCurrency} ke ${toCurrency}):`, error);
    res.status(500).json({ error: error.message || 'Terjadi kesalahan server saat konversi.' });
  }
});
