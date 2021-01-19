const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  const { puppeteer } = chromium;
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: (await chromium.executablePath) || process.env.CHROMIUM_PATH,
    env: process.env,
  });
  const page = await browser.newPage();
  try {
    res.setHeader("Cache-Control", "6s-maxage=86400, stale-while-revalidate");
    await page.goto("https://www.mildom.com/");
    console.log("loaded");
    /* eslint no-constant-condition: 0 */
    while (true) {
      const dc = await page.evaluate(() => localStorage.getItem("dispatcher_config"));
      try {
        res.send(JSON.parse(dc));
        break;
      } catch (e) {}
    }
  } finally {
    await page.close();
    await browser.close();
  }
};
