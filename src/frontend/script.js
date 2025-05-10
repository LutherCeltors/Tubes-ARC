document.querySelector(".grafik").addEventListener("mouseover", () => {
  document.querySelector(".konversi").style.color = "rgb(112, 112, 112)";
  document.querySelector(".konversi").style.fontWeight = "lighter";
});

document.querySelector(".grafik").addEventListener("mouseout", () => {
  document.querySelector(".konversi").style.color = "";
  document.querySelector(".konversi").style.fontWeight = "";
});

// Get references to the country container and the button that toggles visibility
const countryButton = document.querySelector(".countrybut");
const countryContainer = document.querySelector(".countrycontainer");

// Initially hide the country container
countryContainer.style.display = "none";

// Function to toggle the visibility of the .countrycontainer
const toggleCountryContainer = () => {
  // If the container is hidden, show it; otherwise, hide it
  if (countryContainer.style.display === "none") {
    countryContainer.style.display = "block"; // Show the container
  } else {
    countryContainer.style.display = "none"; // Hide the container
  }
};

// Add event listener to the button that toggles visibility
countryButton.addEventListener("click", toggleCountryContainer);

// Add event listener to all buttons inside .countrycontainer to hide it
const countryButtons = countryContainer.querySelectorAll("button");
countryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    countryContainer.style.display = "none"; // Hide the container when any button inside is clicked
  });
});
