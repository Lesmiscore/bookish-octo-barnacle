const axios = require("axios");
const { URL } = require("url");

const lastNumber = /(\d+)\.ts$/gm;

module.exports = async (req, res) => {
  const { url } = req.query;
  const { data: m3u8 } = await axios(url);
};
