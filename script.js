const API_KEY = "50204986-67477f644c1d8bbc1b6cc8633"; // Replace with your actual API key
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");

function fetchImages(query) {
  resultsDiv.innerHTML = "Loading...";

  fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}&image_type=photo`)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      console.log(data); // Debug output

      resultsDiv.innerHTML = "";

      if (!data.hits || data.hits.length === 0) {
        resultsDiv.textContent = "No images found.";
        return;
      }

      data.hits.forEach(hit => {
        const img = document.createElement("img");
        img.src = hit.webformatURL;
        img.alt = hit.tags;
        resultsDiv.appendChild(img);
      });
    })
    .catch(error => {
      console.error("Fetch error:", error);
      resultsDiv.textContent = "Error loading images. Please try again.";
    });
}

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query) fetchImages(query);
});

// Auto-run with default query when page loads
window.addEventListener("load", () => {
  fetchImages("nature");
});

