function updateTime() {
  const timeElement = document.getElementById("time");
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const seconds = currentTime.getSeconds().toString().padStart(2, "0");
  timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

setInterval(updateTime, 1000);
updateTime();

function AllQuotes() {}
AllQuotes.prototype = {
  constructor: AllQuotes,
  quoteText: function () {
    return document.getElementById("quote-text");
  },
  getQuoteButton: function () {
    return document.getElementById("get-quote");
  },
  getCounter: function () {
    return document.getElementById("counter");
  }
};

function Quote() {}
Quote.prototype = Object.create(AllQuotes.prototype);
Quote.prototype.constructor = Quote;

Quote.prototype.requestYourQuote = function () {
  const getQuoteButton = this.getQuoteButton();
  const quoteText = this.quoteText();
  const myCounter = this.getCounter();
  let counter = 0;

  getQuoteButton.addEventListener("click", () => {
    const apiUrl = "https://api.quotable.io/random";
    const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(apiUrl);

    fetch(proxyUrl)
      .then(response => {
        if (!response.ok) throw new Error("Network response was not ok.");
        return response.json();
      })
      .then(data => {
        const parsedData = JSON.parse(data.contents);
        quoteText.textContent = parsedData.content;
        counter++;
        myCounter.textContent = counter;
      })
      .catch(error => {
        quoteText.textContent = "Error: " + error.message;
        console.error("Error fetching quote:", error);
      });
  });
};

const q = new Quote();
q.requestYourQuote();

