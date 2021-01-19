const axios = require("axios");
const qs = require("qs");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res) => {
  const {
    query: { filename, filename2, __guest_id, __location, __country, __cluster, __platform, __la, __pcv, __sfr, accessToken, is_lhls },
  } = req;
  console.log(filename, filename2);
  const realfile = filename2 || filename;

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
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", contentType);
    let data = server_response.data;
    if (contentType == "application/vnd.apple.mpegurl") {
      data = Buffer.from(data)
        .toString("utf8")
        .replace(/([^:]+\.(ts|m3u8))$/gm, function (match, g1) {
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
          return `https://bookish-octo-barnacle.vercel.app/api/live/${g1}?${query}`;
        });
    }
    res.send(data);
  } catch (e) {
    console.log(e.stack || e);
    res.status(500).send({ e, stack: e.stack });
  }
};
