const axios = require("axios");
const qs = require("qs");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res) => {
  let extendedQuery = {};
  try {
    extendedQuery = JSON.parse(res.headers["x-mildom-query"]) || {};
  } catch (e) {}
  const { filename, filename2, __guest_id, __location, __country, __cluster, __platform, __la, __pcv, __sfr, accessToken, is_lhls } = Object.assign({}, req.query, req.params || {}, extendedQuery);
  console.log(filename, filename2);
  const realfile = filename2 || filename;

  const headers = {
    Referer: "https://www.mildom.com/",
    Origin: "https://www.mildom.com",
    "User-Agent": req.headers["user-agent"],
    "X-Forwarded-For": req.headers["x-forwarded-for"] || "",
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
      server_response = await axios(`http://do8w5ym3okkik.cloudfront.net/live/${realfile}?${query}`, {
        headers,
        responseType: "arraybuffer",
      });
    } catch (e) {
      server_response = await axios(`https://do8w5ym3okkik.cloudfront.net/live/${realfile}?${query}`, {
        headers,
        responseType: "arraybuffer",
      });
    }
    const contentType = server_response.headers["content-type"];
    if (realfile.endsWith(".ts")) {
      // cache segments
      res.setHeader("Cache-Control", "public, max-age=31536000");
    } else {
      // ...while not for m3u8 files
      res.setHeader("Cache-Control", "no-cache");
    }
    res.setHeader("Content-Type", contentType);
    let data = server_response.data;
    if (realfile.endsWith(".m3u8")) {
      let hadPrefetch = false;
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
          });
          hadPrefetch = hadPrefetch || prefetch;
          return `/api/mildom/live/${filename}?${query}`;
        });
      if (!hadPrefetch) {
        data += "\n#EXT-X-ENDLIST\n";
      }
    }
    res.send(data);
  } catch (e) {
    console.log(e.stack || e);
    res.status(500).send({ e, stack: e.stack });
  }
};
