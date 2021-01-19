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
    await page.goto("https://www.mildom.com/");
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
