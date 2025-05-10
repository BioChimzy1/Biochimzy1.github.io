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
    fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://api.quotable.io/random'))
      .then(response => response.json())
      .then(data => {
        const randomQuote = JSON.parse(data.contents).content;
        quoteText.textContent = randomQuote;
        counter++;
        myCounter.textContent = counter;
      })
      .catch(error => {
        quoteText.textContent = "Error: " + error.message;
        console.error("Fetch Error:", error);
      });
  });
};

const q = new Quote();
q.requestYourQuote();
