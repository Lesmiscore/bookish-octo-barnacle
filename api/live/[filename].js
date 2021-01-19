const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res) => {
  const {
    query: { filename, __guest_id, __location, __country, __cluster, __platform, __la, __pcv, __sfr, accessToken },
  } = req;
  console.log(filename);

  try {
    const { data: m3u8_data } = await axios(`https://do8w5ym3okkik.cloudfront.net/live/${filename}.m3u8`, {
      params: { timestamp: new Date().toISOString(), __guest_id, __location, __country, __cluster, __platform, __la, __pcv, __sfr, accessToken, streamReqId: uuidv4() },
      headers: {
        Referer: "https://www.mildom.com/",
        Origin: "https://www.mildom.com",
      },
      responseType: "text",
    });
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(m3u8_data);
  } catch (e) {
    res.status(500).send(e);
  }
};
