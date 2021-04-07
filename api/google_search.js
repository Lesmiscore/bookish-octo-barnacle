const chromium = require("chrome-aws-lambda");
const fs = require("fs");
const path = require("path");


function chromiumFontSetup() {
  if (process.env.HOME == null) process.env.HOME = "/tmp"
  const dest = process.env.HOME + "/.fonts"
  if (!fs.existsSync(dest)) fs.mkdirSync(dest)
  const src = __dirname + "/../fonts/mplus"
  for (const font of fs.readdirSync(src)) {
    if (!font.endsWith(".ttf")) continue
    if (fs.existsSync(path.join(dest, font))) continue
    fs.copyFileSync(path.join(src, font), path.join(dest, font))
  }
}

module.exports = async (req, res) => {
  chromiumFontSetup();
  const { q } = req.query;

  if (false) {
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.setHeader("Content-Type", "image/png");
    const screenshot = await fs.readFile(__dirname + "/../assets/ng.png");
    res.send(screenshot);
  }

  const { puppeteer } = chromium;
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: (await chromium.executablePath) || process.env.CHROMIUM_PATH,
    env: process.env,
  });
  const page = await browser.newPage();
  try {
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.setHeader("Content-Type", "image/png");
    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 2 });
    await page.goto(`https://google.com/search?q=${encodeURIComponent(q)}`);
    await new Promise(r => setTimeout(r, 4000));
    const screenshot = await page.screenshot({ type: "png" });
    res.send(screenshot);
  } finally {
    await page.close();
    await browser.close();
  }
};
