import puppeteer from "puppeteer";
import connectDB from "./db/index.db.js";
import Speech from "./models/Speech.model.js";

const url = "https://www.rbi.org.in/Scripts/BS_ViewSpeeches.aspx";

const getSpeeches = async () => {
  // Connect to MongoDB
  await connectDB();
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    userDataDir: "./temp",
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  // Initialize an array to store all speeches
  const allSpeeches = [];

  // Loop through the years from 2024 to 1990
  for (let year = 2024; year >= 1990; year--) {
    console.log(`Scraping year: ${year}`);

    // Click the element for the specific year
    await page.evaluate((year) => {
      const yearEl = document.getElementById(`${year}0`);
      if (yearEl) {
        yearEl.click();
      }
    }, year);

    // Wait for the table to be present
    await page.waitForSelector("table");

    // Extract speeches for the current year
    const speeches = await page.evaluate(() => {
      let speeches = [];
      const speechList = document.querySelectorAll("table tr");

      for (let i = 0; i < speechList.length - 1; i++) {
        const dataEl = speechList[i].querySelector(".tableheader>b");
        const valueEl = speechList[i + 1].querySelector("td .link2");
        const linkEl = speechList[i + 1].querySelector("td .link2");
        const pdfEl = speechList[i + 1].querySelector("tr> td+td a");

        if (dataEl && valueEl && linkEl && pdfEl) {
          const date = dataEl.innerText.trim();
          const value = valueEl.innerText.trim();
          const link = linkEl.href;
          const pdf = pdfEl.href;

          speeches.push({ date, value, link, pdf });
        }
      }

      return speeches;
    });

    // Add the speeches of the current year to the allSpeeches array
    allSpeeches.push(...speeches);

    // Save each speech to MongoDB
    for (let speech of speeches) {
      const exists = await Speech.findOne({ date: speech.date, value: speech.value });
      if (!exists) {
        await Speech.create(speech);
      }
    }
  }

  // Log the combined array of speeches
  console.log(allSpeeches);
  console.log("Scraping completed and data stored in MongoDB.");
  await browser.close();
};

getSpeeches();
