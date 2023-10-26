/*const quoteText = document.getElementById("quote-text");
const getQuoteButton = document.getElementById("get-quote");

const requestQuote = function (){
    getQuoteButton.addEventListener("click", () => {
    fetch('https://api.quotable.io/random')
      .then(response => response.json())
      .then(data => {
        const randomQuote = data.content;
        quoteText.textContent = randomQuote;
      })
      .catch(error => {
        console.error('Error:', error);
      });
});
}

requestQuote();
*/

//time demo
function updateTime() {
    const timeElement = document.getElementById("time");
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, "0");
    const minutes = currentTime.getMinutes().toString().padStart(2, "0");
    const seconds = currentTime.getSeconds().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}:${seconds}`;
    timeElement.textContent = timeString;
}

// Update the time every second
setInterval(updateTime, 1000);

// Initial call to display time immediately
updateTime();


function AllQuotes(){}
AllQuotes.prototype = {
constructor:AllQuotes,
quoteText :function (){
    return document.getElementById("quote-text");
    },
getQuoteButton : function (){
return document.getElementById("get-quote");    
  },
  getCounter : function (){
return document.getElementById("counter");    
  }
};

function Quote(){}
Quote.prototype = Object.create(AllQuotes.prototype);

Quote.prototype.constructor = Quote;

Quote.prototype.requestYourQuote = function (){
  const getQuoteButton =this.getQuoteButton();
  const quoteText = this.quoteText();
  const myCounter = this.getCounter();
  let counter = 0;
  
  getQuoteButton.addEventListener("click", () => {
    
    fetch('https://api.quotable.io/random')
      .then(response => response.json())
      .then(data => {
        const randomQuote = data.content;
        quoteText.textContent = randomQuote;
        counter++;
        myCounter.textContent = counter;
      })
      .catch(error => {
        //console.error('Error:', error);
        quoteText.textContent = error;
      });
});  
}
const q = new Quote();
q.requestYourQuote();

console.log("hello boyd");

/*class Quote{
    constructor()
    this.quoteText = document.getElementById("quote-text");
this.getQuoteButton = document.getElementById("get-quote");
this.getQuoteButton.addEventListener("click", () => {
    fetch('https://api.quotable.io/random')
      .then(response => response.json())
      .then(data => {
        const randomQuote = data.content;
        this.textContent = randomQuote;
      })
      .catch(error => {
        //console.error('Error:', error);
        this.textContent = error;
      });
});  
}
*/