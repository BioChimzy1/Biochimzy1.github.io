const API_KEY = "YOUR_PIXABAY_API_KEY"; // Replace with your actual API key
const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const resultsDiv = document.getElementById("results");

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) return;

  fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}&image_type=photo`)
    .then(res => res.json())
    .then(data => {
      resultsDiv.innerHTML = "";
      if (data.hits.length === 0) {
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
    .catch(err => {
      console.error("Error fetching from Pixabay:", err);
      resultsDiv.textContent = "Failed to fetch images.";
    });
});
