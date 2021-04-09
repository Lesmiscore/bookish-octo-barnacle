const chromium = require("chrome-aws-lambda");
const fs = require("fs");
const path = require("path");
const { performance } = require('perf_hooks');


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

async function measureTime(func) {
  let t0, t1, ret;
  try {
    t0 = performance.now();
    ret = await func();
  } finally {
    t1 = performance.now();
  }
  return [ret, t1 - t0];
}

const negative = [
  /nao20010128nao/
];

module.exports = async (req, res) => {
  chromiumFontSetup();
  const { q } = req.query;

  if (negative.some(v => v.test(q))) {
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.setHeader("Content-Type", "image/png");
    const screenshot = fs.readFileSync(__dirname + "/../assets/ng.png");
    res.send(screenshot);
    return;
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
    await page.setViewport({ width: 1024, height: 768, deviceScaleFactor: 4 });
    const [_, time] = measureTime(async () => {
      await page.goto(`https://google.com/search?q=${encodeURIComponent(q)}`);
    });
    if (time < 2000) {
      await new Promise(r => setTimeout(r, 500));
    }
    const screenshot = await page.screenshot({ type: "png" });
    res.send(screenshot);
  } finally {
    await page.close();
    await browser.close();
  }
};
