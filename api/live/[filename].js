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
    let m3u8_data;
    try {
      m3u8_data = await axios(`http://do8w5ym3okkik.cloudfront.net/live/${realfile}?${query}`, {
        headers,
        responseType: "text",
      });
    } catch (e) {
      m3u8_data = await axios(`http://do8w5ym3okkik.cloudfront.net/live/${realfile}?${query}`, {
        headers,
        responseType: "text",
      });
    }
    const contentType = m3u8_data.headers["Content-Type"] || m3u8_data.headers["content-type"] || "application/vnd.apple.mpegurl";
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", contentType);
    res.send(m3u8_data.data);
  } catch (e) {
    res.status(500).send(e);
  }
};
