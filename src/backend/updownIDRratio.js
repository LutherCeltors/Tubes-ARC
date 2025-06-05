const axios = require('axios');
const BASE_CURRENCY = "IDR"; 

async function compareHistoricalPast7day(targetCurrency) {
  const today = new Date();
  const day7past = new Date();
  day7past.setDate(today.getDate() - 7);

  const year = day7past.getFullYear();
  const month = String(day7past.getMonth() + 1).padStart(2, '0');
  const day = String(day7past.getDate()).padStart(2, '0');
  console.log(year, month, day);
  console.log(today.getFullYear(), today.getMonth(), today.getDay());
  console.log(BASE_CURRENCY, targetCurrency);

  try {
    const todayRes = await axios(`https://api.frankfurter.dev/v1/latest?base=${BASE_CURRENCY}`);
    const todayRate = todayRes.data.rates[targetCurrency]
    
    if (!todayRate){
        console.log("Data today not fetched");
    }

    const pastRes = await axios(`https://api.frankfurter.dev/v1/${year}-${month}-${day}?base=${BASE_CURRENCY}&symbols=${targetCurrency}`);
    const pastRate = pastRes.data.rates[targetCurrency];

    if (!todayRate){
        console.log("Data past rate not fetched");
    }

    const diff = todayRate - pastRate;
    const percentChange = (diff / pastRate) * 100;

    console.log(`${targetCurrency} → ${BASE_CURRENCY}`);
    console.log(`Today: ${todayRate}`);
    console.log(`7 Days Ago: ${pastRate}`);
    console.log(`Change: ${diff.toFixed(4)} (${percentChange.toFixed(4)}%)`);

    return {
      todayRate,
      pastRate,
      percentChange: Number(percentChange.toFixed(5))
    };
  } catch (error) {
    console.error('❌ Failed to fetch data from Frankfurter API:', error.message);
    return null;
  }
}

module.exports = compareHistoricalPast7day;
