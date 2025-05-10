const API_KEY = "My API key here"; // Replace with your actual API key
const btn = document.getElementById("search-btn");
const input = document.getElementById("search-input");
const results = document.getElementById("results");

btn.addEventListener("click", () => {
  const query = input.value.trim();
  if (!query) return;

  fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}&image_type=photo`)
    .then(response => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(data => {
      results.innerHTML = "";
      if (data.hits.length === 0) {
        results.textContent = "No images found.";
        return;
      }

      data.hits.forEach(hit => {
        const img = document.createElement("img");
        img.src = hit.webformatURL;
        results.appendChild(img);
      });
    })
    .catch(error => {
      results.innerHTML = "Error loading images.";
      console.error("Fetch error:", error);
    });
});

