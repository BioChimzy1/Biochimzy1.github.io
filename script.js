// Clock
function updateTime() {
  const timeElement = document.getElementById("time");
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
  timeElement.textContent = timeStr;
}
setInterval(updateTime, 1000);
updateTime();

// Local Bible verses (KJV)
const kjvVerses = [
  "John 3:16 - For God so loved the world, that he gave his only begotten Son...",
  "Psalm 23:1 - The Lord is my shepherd; I shall not want.",
  "Romans 8:28 - And we know that all things work together for good to them that love God...",
  "Philippians 4:13 - I can do all things through Christ which strengtheneth me.",
  "Genesis 1:1 - In the beginning God created the heaven and the earth.",
  "Proverbs 3:5 - Trust in the Lord with all thine heart; and lean not unto thine own understanding.",
  "Isaiah 41:10 - Fear thou not; for I am with thee...",
  "Matthew 11:28 - Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
  "2 Timothy 1:7 - For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
  "Jeremiah 29:11 - For I know the thoughts that I think toward you, saith the Lord..."
];

let counter = 0;

document.addEventListener("DOMContentLoaded", function () {
  const quoteText = document.getElementById("quote-text");
  const getQuoteButton = document.getElementById("get-quote");
  const counterElement = document.getElementById("counter");

  getQuoteButton.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * kjvVerses.length);
    quoteText.textContent = kjvVerses[randomIndex];
    counter++;
    counterElement.textContent = counter;
  });
});
