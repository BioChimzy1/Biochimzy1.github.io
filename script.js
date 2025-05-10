document.addEventListener("DOMContentLoaded", function () {
  const quoteText = document.getElementById("quote-text");
  const getQuoteButton = document.getElementById("get-quote");
  const counterElement = document.getElementById("counter");
  let counter = 0;

  getQuoteButton.addEventListener("click", () => {
    const proxy = "https://corsproxy.io/?";
    const api = "https://api.quotable.io/random";

    fetch(proxy + encodeURIComponent(api))
      .then(response => {
        if (!response.ok) throw new Error("Network error: " + response.status);
        return response.json();
      })
      .then(data => {
        quoteText.textContent = data.content;
        counter++;
        counterElement.textContent = counter;
      })
      .catch(error => {
        quoteText.textContent = "Error: " + error.message;
      });
  });
});

