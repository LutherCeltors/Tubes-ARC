// === FRONTEND ===
document.addEventListener("DOMContentLoaded", function () {
  // Grafik hover effect
  const grafik = document.querySelector(".grafik");
  const konversi = document.querySelector(".konversi");

  if (grafik && konversi) {
    grafik.addEventListener("mouseover", () => {
      konversi.style.color = "rgb(112, 112, 112)";
      konversi.style.fontWeight = "lighter";
    });

    grafik.addEventListener("mouseout", () => {
      konversi.style.color = "";
      konversi.style.fontWeight = "";
    });
  }

  // === .countrycontainer (untuk .activecountry)
  const countryButton = document.querySelector(".countrybut");
  const countryContainer = document.querySelector(".countrycontainer");
  const indicator = document.querySelector(".indicator");

  if (countryButton && countryContainer && indicator) {
    countryContainer.style.display = "none";

    const selectedDisplay = document.createElement("div");
    selectedDisplay.className = "selected-display";
    indicator.appendChild(selectedDisplay);

    countryButton.addEventListener("click", function (e) {
      e.stopPropagation();
      countryContainer.style.display =
        countryContainer.style.display === "flex" ? "none" : "flex";
    });

    // Menangani klik pada button dalam .countrycontainer
    const activeCountry = document.querySelector(".activecountry");
    const activeText = activeCountry.querySelector("h5");
    const activeFlag = activeCountry.querySelector("div");

    const buttons = countryContainer.querySelectorAll("button");
    buttons.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.stopPropagation(); // ⛔ Prevent document click
        const currency = button.querySelector("p").textContent;
        const flagClass = button.querySelector("div").className;

        activeText.textContent = currency;
        activeFlag.className = flagClass;
        countryContainer.style.display = "none";

        fetchConversionRate();//menambahkan otomasi setiap kali terjadi pergantian mata uang.
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !countryContainer.contains(e.target) &&
        !countryButton.contains(e.target)
      ) {
        countryContainer.style.display = "none";
      }
    });
  }

  // === Setup fungsi umum untuk .bar & .bar2
  function setupCountrySelector(barSelector, containerSelector) {
    const bar = document.querySelector(barSelector);
    const container = document.querySelector(containerSelector);

    if (!bar || !container) return;

    const button = bar.querySelector(".countrybut");
    const h5 = bar.querySelector("h5");
    const flag = bar.querySelector("div[class$='flag']");

    container.style.display = "none";

    button.addEventListener("click", function (e) {
      e.stopPropagation();
      container.style.display =
        container.style.display === "flex" ? "none" : "flex";
    });

    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation(); // ⛔ Prevent closing instantly
        const currency = btn.querySelector("p").textContent;
        const flagClass = btn.querySelector("div").className;

        h5.textContent = currency;
        flag.className = flagClass;
        container.style.display = "none";
      });
    });

    // Close only this container when clicking outside
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target) && !bar.contains(e.target)) {
        container.style.display = "none";
      }
    });
  }

  // Apply to both selectors
  setupCountrySelector(".bar", ".countrycontainer2");
  setupCountrySelector(".bar2", ".countrycontainer3");

  // === Swap currencies between jumlah and dikonversi
  const swapButton = document.querySelector(".arrow");

  if (swapButton) {
    swapButton.addEventListener("click", () => {
      const leftCountry = document.querySelector(".jumlah .changecountry");
      const rightCountry = document.querySelector(".dikonversi .changecountry");

      const leftH5 = leftCountry.querySelector("h5");
      const rightH5 = rightCountry.querySelector("h5");

      const leftFlag = leftCountry.querySelector("div");
      const rightFlag = rightCountry.querySelector("div");

      // Swap currency text
      const tempText = leftH5.textContent;
      leftH5.textContent = rightH5.textContent;
      rightH5.textContent = tempText;

      // Swap flag class
      const tempClass = leftFlag.className;
      leftFlag.className = rightFlag.className;
      rightFlag.className = tempClass;

      //Swap input konversi dengan output
      const outputText = document.querySelector('.outputval');
      const outputAmount = parseFloat(outputText.split(" ")[0]);
      if (!isNan(outputAmount)){
        document.querySelector('.input').textContent = outputAmount;
      }


      fetchConversionRate(); //otomasi konversi setiap kali terjadi swap
    });
  }

  //Listener untuk input dan output terkhusus konversi mata uang.
  const inputField = document.querySelector('.inputval');
  if (inputField) {
    inputField.addEventListener('input', fetchConversionRate);
  }

  function fetchConversionRate() {
    const amount = parseFloat(document.querySelector('.inputval').value);
    const from = document.querySelector('.jumlah .changecountry h5').textContent;
    const to = document.querySelector('.dikonversi .changecountry h5').textContent;

    if (isNaN(amount) || amount <= 0) {
      document.querySelector('.outputval').textContent = '';
      return;
    }

    fetch(`/api/conversion?fromCurr=${from}&toCurr=${to}`)
      .then(res => res.json())
      .then(data => {
        const rate = data.rate;
        const converted = amount * rate;
        document.querySelector('.outputval').textContent = `${converted.toFixed(2)} ${to}`;
      })
      .catch(err => {
        console.error('Conversion failed:', err);
        document.querySelector('.outputval').textContent = 'Error';
      });
  }
});

