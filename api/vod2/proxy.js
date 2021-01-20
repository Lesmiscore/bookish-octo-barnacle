const axios = require("axios");
const qs = require("qs");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res) => {
  const {
    query: { path, __guest_id, __location, __country, __cluster, __platform, __la, __pcv, __sfr, accessToken, is_lhls },
  } = req;
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
    const contentType = server_response.headers["content-type"];
    res.setHeader("Cache-Control", "no-cache");
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
          });
          return `/api/vod/${filename}?${query}`;
        });
    }
    res.send(data);
  } catch (e) {
    console.log(e.stack || e);
    res.status(500).send({ e, stack: e.stack });
  }
};
