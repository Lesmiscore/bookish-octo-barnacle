const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  const { puppeteer } = chromium;
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: (await chromium.executablePath) || process.env.CHROMIUM_PATH,
    env: process.env,
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "X-Forwarded-For": req.headers["x-forwarded-for"],
  });
  try {
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    await page.goto("https://www.mildom.com/");
    console.log("loaded");
    /* eslint no-constant-condition: 0 */
    while (true) {
      const dc = await page.evaluate(() => localStorage.getItem("dispacher_config"));
      if (dc) {
        res.send(JSON.parse(dc));
        break;
      }
    }
  } finally {
    await page.close();
    await browser.close();
  }
};
