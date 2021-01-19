const axios = require("axios");
const qs = require("qs");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res) => {
  const {
    query: { filename, __guest_id, __location, __country, __cluster, __platform, __la, __pcv, __sfr, accessToken },
  } = req;
  console.log(filename);

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
  });
  try {
    const { data: m3u8_data } = await axios(`http://do8w5ym3okkik.cloudfront.net/live/${filename}.m3u8?${query}`, {
      headers,
      responseType: "text",
    });
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(m3u8_data);
  } catch (e) {
    res.status(500).send(e);
  }
};
