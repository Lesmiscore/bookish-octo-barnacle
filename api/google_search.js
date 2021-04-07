const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  const { q } = req.query;

  const { puppeteer } = chromium;
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: (await chromium.executablePath) || process.env.CHROMIUM_PATH,
    env: process.env,
  });
  const page = await browser.newPage();
  try {
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.setHeader('Content-Type', 'image/png');
    await page.goto(`https://google.com/search?q=${encodeURIComponent(q)}`);
    console.log("loaded");
    await new Promise(r => setTimeout(r, 5000));
    const screenshot = await page.screenshot({ type: "png" });
    res.send(screenshot);
  } finally {
    await page.close();
    await browser.close();
  }
};
