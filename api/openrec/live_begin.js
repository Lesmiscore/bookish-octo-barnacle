const axios = require("axios");

const lastNumber = /(\d+)\.ts$/gm;
const segmentLine = /^.+\.ts$/gm;
const preamble = /^#EXTM3U\n(?:#EXT-X-.+?\n)*/;
const extinf = /#EXTINF:(\d+(?:\.\d+)?)/;

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!new URL(url).hostname.endsWith(".openrec.tv")) {
    return req.send(403);
  }
  if (!url.endsWith(".m3u8")) {
    return req.send(403);
  }
  try {
    const m3u8 = (await axios(url)).data.replace(/\r\n/g, "\n");
    console.log(m3u8);
    const preambleText = m3u8.match(preamble);
    console.log(preambleText);
    const extinfData = m3u8.match(extinf)[1];
    const segments = m3u8.match(segmentLine);
    const lastSegment = segments[segments.length - 1];
    const lastSegmentNumber = parseInt(lastSegment.match(lastNumber));
    console.log(lastSegmentNumber);

    let result = preambleText;

    for (let num = 0; num <= lastSegmentNumber; num++) {
      const segName = lastSegment.replace(lastNumber, `${num}.ts`);
      const segURL = new URL(segName, url).toString();

      result += `#EXTINF:${extinfData},\n`;
      result += segURL;
      result += "\n";
    }
    res.setHeader("Content-Type", "application/mpegurl");
    res.setHeader("Cache-Control", "no-cache");
    res.send(result);
  } catch (e) {
    console.log(e.stack || e);
    res.status(500).send({ e, stack: e.stack });
  }
};
