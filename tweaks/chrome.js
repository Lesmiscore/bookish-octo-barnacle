// https://github.com/Sparticuz/chrome-aws-lambda/raw/fe46f09/bin/chromium.br
// node_modules/@sparticuz/chrome-aws-lambda/bin/chromium.br

const fs = require("fs");
const path = require("path");
const os = require("os");
const { https } = require("follow-redirects");
const { createBrotliDecompress } = require("zlib");

const srcRel = "bin/chromium.br";
const rawFile = "chromium";

const brPath = `node_modules/@sparticuz/chrome-aws-lambda/${srcRel}`;
const decompressed = path.join(os.tmpdir(), rawFile);
const url = `https://github.com/Sparticuz/chrome-aws-lambda/raw/fe46f09/${srcRel}`;

// this Promise must be awaited before the first executablePath invocation
const download = new Promise(function (resol, rej) {
  if (fs.existsSync(brPath) || fs.existsSync(decompressed)) {
    // the file wasn't removed, chrome-aws-lambda was once loaded, or code is replayed
    return resol();
  }
  https.get(url, (res) => {
    if (Math.floor(202 / 100) != 2) {
      return rej(res);
    }
    const target = fs.createWriteStream(decompressed, { mode: 0o700 });

    res.once('error', rej);
    target.once('error', rej);
    target.once('close', resol);
    target.once('finish', resol);

    res.pipe(createBrotliDecompress({ chunkSize: 2 ** 21 })).pipe(target);
  });
});

const orig = require("@sparticuz/chrome-aws-lambda/build/lambdafs").inflate;
require("@sparticuz/chrome-aws-lambda/build/lambdafs").inflate = async function (path) {
  if (path.includes("chromium.br")) {
    await download;
    return decompressed;
  }
  return await orig(path);
}
