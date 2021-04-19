const axios = require("axios");
const qs = require("qs");
const { v4: uuidv4 } = require("uuid");
const { mildomProxyHost } = require('../utils');

module.exports = async (req, res) => {
  if (process.env.VERCEL) {
    res.status(418).send("stopped temprary due to limit");
    return;
  }
  let extendedQuery = {};
  try {
    extendedQuery = JSON.parse(res.headers["x-mildom-query"]) || {};
  } catch (e) { }
  const { path, __guest_id, __location, __country, __cluster, __platform, __la, __pcv, __sfr, accessToken, is_lhls } = Object.assign({}, req.query, extendedQuery);
  console.log(path);

  const headers = {
    Referer: "https://www.mildom.com/",
    Origin: "https://www.mildom.com",
    "User-Agent": req.headers["user-agent"],
    "X-Forwarded-For": req.headers["x-forwarded-for"],
  };
  const query = qs.stringify({
    timestamp: new Date().toISOString(),
    __guest_id,
    __location,
    __country,
    __cluster,
    __platform,
    __la,
    __pcv,
    __sfr,
    accessToken,
    streamReqId: uuidv4(),
    is_lhls,
  });
  try {
    let server_response;
    try {
      server_response = await axios(`http://d3ooprpqd2179o.cloudfront.net/vod/${path}?${query}`, {
        headers,
        responseType: "arraybuffer",
      });
    } catch (e) {
      server_response = await axios(`https://d3ooprpqd2179o.cloudfront.net/vod/${path}?${query}`, {
        headers,
        responseType: "arraybuffer",
      });
    }
    let contentType = "application/octet-stream";
    if (path.endsWith(".m3u8")) {
      contentType = "application/mpegurl";
    } else if (path.endsWith(".ts")) {
      // this is not TypeScript one!
      // contentType = "application/vnd.typescript";
      contentType = "video/mp2t";
    }
    // everything will not change
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.setHeader("Content-Type", contentType);
    let data = server_response.data;
    if (path.endsWith(".m3u8")) {
      data = Buffer.from(data)
        .toString("utf8")
        .replace(/^(#EXT-X-PREFETCH:)?([^:\r\n]+\.(?:ts|m3u8))$/gm, function (match, prefetch, filename) {
          const query = qs.stringify({
            __guest_id,
            __location,
            __country,
            __cluster,
            __platform,
            __la,
            __pcv,
            __sfr,
            accessToken,
            is_lhls,
            path: new URL(filename, `https://d3ooprpqd2179o.cloudfront.net/vod/${path}`).pathname.substring(5),
          });
          return `https://${mildomProxyHost(filename)}/api/mildom/vod2/proxy?${query}`;
        });
      data += "\n#EXT-X-ENDLIST\n";
    }
    res.send(data);
  } catch (e) {
    console.log(e.stack || e);
    res.status(500).send({ e, stack: e.stack });
  }
};
