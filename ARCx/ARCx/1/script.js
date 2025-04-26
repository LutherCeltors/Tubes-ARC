// Variabel global untuk chart dan data
let exchangeRateChart;
const apiKey = "YOUR_API_KEY"; // Ganti dengan API key Anda
const baseCurrency = "USD";
const targetCurrency = "IDR";

// Inisialisasi tanggal
document.addEventListener("DOMContentLoaded", function () {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  document.getElementById("endDate").valueAsDate = endDate;
  document.getElementById("startDate").valueAsDate = startDate;

  // Load data awal
  fetchExchangeRateData(startDate, endDate);

  // Event listeners
  document.getElementById("period").addEventListener("change", function () {
    const days = parseInt(this.value);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    document.getElementById("startDate").valueAsDate = startDate;
    document.getElementById("endDate").valueAsDate = endDate;

    fetchExchangeRateData(startDate, endDate);
  });

  document.getElementById("updateChart").addEventListener("click", function () {
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    if (startDate > endDate) {
      alert("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
      return;
    }

    fetchExchangeRateData(startDate, endDate);
  });
});

// Fungsi untuk mengambil data dari API
async function fetchExchangeRateData(startDate, endDate) {
  document.getElementById("loading").style.display = "block";

  try {
    // Format tanggal untuk API
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);

    // Untuk demo, kita akan menggunakan API gratis dengan batasan tertentu
    // Catatan: API gratis mungkin tidak mendukung historical data dalam jumlah besar
    // Alternatif: Gunakan API berbayar atau mock data untuk demo

    // Contoh URL untuk API berbayar (ganti dengan API key Anda):
    // const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}?api_key=${apiKey}`;

    // Untuk demo, kita akan menggunakan mock data atau API terbatas
    const mockData = generateMockData(startDate, endDate);
    updateChart(mockData);

    // Jika menggunakan API nyata:
    // const response = await fetch(url);
    // const data = await response.json();
    // processAPIData(data, startDate, endDate);

    document.getElementById(
      "lastUpdate"
    ).textContent = `Terakhir diperbarui: ${new Date().toLocaleString()}`;
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Gagal mengambil data. Silakan coba lagi.");
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

// Fungsi untuk memproses data dari API (jika menggunakan API nyata)
function processAPIData(apiData, startDate, endDate) {
  // Proses data API sesuai kebutuhan
  // Ini akan tergantung pada format respons API yang digunakan
  // Contoh:
  const rates = apiData.rates || {};
  const historicalData = [];

  // Loop melalui setiap hari dalam rentang tanggal
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = formatDate(date);
    if (rates[dateStr] && rates[dateStr][targetCurrency]) {
      historicalData.push({
        date: new Date(date),
        rate: rates[dateStr][targetCurrency],
      });
    }
  }

  updateChart(historicalData);
}

// Fungsi untuk membuat data dummy (digunakan jika tidak ada API nyata)
function generateMockData(startDate, endDate) {
  const mockData = [];
  const baseRate = 14000; // Nilai dasar IDR/USD
  const fluctuation = 500; // Fluktuasi acak

  // Loop melalui setiap hari dalam rentang tanggal
  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    // Buat nilai tukar dengan fluktuasi acak
    const randomChange = (Math.random() - 0.5) * 2 * fluctuation;
    const rate = baseRate + randomChange;

    mockData.push({
      date: new Date(date),
      rate: parseFloat(rate.toFixed(2)),
    });
  }

  return mockData;
}

// Fungsi untuk memperbarui chart dengan data baru
function updateChart(data) {
  const ctx = document.getElementById("exchangeRateChart").getContext("2d");

  // Siapkan data untuk Chart.js
  const labels = data.map((item) => item.date);
  const rates = data.map((item) => item.rate);

  // Hitung min dan max untuk menentukan batas grafik
  const minRate = Math.min(...rates) * 0.99;
  const maxRate = Math.max(...rates) * 1.01;

  // Jika chart sudah ada, perbarui data
  if (exchangeRateChart) {
    exchangeRateChart.data.labels = labels;
    exchangeRateChart.data.datasets[0].data = rates;
    exchangeRateChart.options.scales.y.min = minRate;
    exchangeRateChart.options.scales.y.max = maxRate;
    exchangeRateChart.update();
    return;
  }

  // Jika chart belum ada, buat baru
  exchangeRateChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Nilai Tukar ${baseCurrency} ke ${targetCurrency}`,
          data: rates,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "white", // Warna legenda
          },
        },
        tooltip: {
          bodyColor: "white", // Warna teks tooltip
          titleColor: "#ccc", // Warna judul tooltip
          backgroundColor: "rgba(0,0,0,0.7)", // Background tooltip
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
            tooltipFormat: "dd MMM yyyy",
            displayFormats: {
              day: "dd MMM",
            },
          },
          ticks: {
            color: "white", // Label tanggal putih
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        y: {
          ticks: {
            color: "white", // Label nilai putih
            callback: function (value) {
              return value.toLocaleString("id-ID");
            },
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    },
  });
}

// Fungsi pembantu untuk memformat tanggal
function formatDate(date) {
  return date.toISOString().split("T")[0];
}
