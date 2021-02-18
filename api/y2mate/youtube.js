const axios = require("axios");
const qs = require("qs");

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3551.3 Safari/537.36";

// https://github.com/nao20010128nao/ytdl-patched/blob/master/youtube_dl/extractor/y2mate.py
module.exports = async (req, res) => {
  const { id, retry } = req.query;

  await axios(`https://www.y2mate.com/youtube/${id}`, {
    headers: {
      "User-Agent": userAgent,
    },
  });

  const commonHeaders = {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": userAgent,
  };

  let { data: sizeSpecs } = await axios("https://www.y2mate.com/mates/analyze/ajax", {
    method: "POST",
    headers: commonHeaders,
    data: qs.stringify({
      url: `https://www.youtube.com/watch?v=${id}`,
      q_auto: "1",
      ajax: "1",
    }),
    responseType: "json",
  });

  if (sizeSpecs["status"] != "success") {
    return res.status(404).send(`Server responded with status ${sizeSpecs["status"]}`);
  }

  sizeSpecs = sizeSpecs["result"];

  const title = /<b>(.+?)<\/b>/.exec(sizeSpecs)[1].trim();

  const requestId = /var k__id\s*=\s*(["'])(.+?)\1/.exec(sizeSpecs)[2];

  const tableRegex = /<table\s*.+?>(.+?)<\/table>/g;
  const videoTable = tableRegex.exec(sizeSpecs)[1];
  tableRegex.exec(sizeSpecs);
  const audioTable = tableRegex.exec(sizeSpecs)[1];

  const videoTableRegex = new RegExp(
    `<tr>\\s*
      <td>.+?(\\d+p).+?</td>\\s*
      <td>(.*?\\s*[kMG]?B)</td>\\s*
      <td\\s*.+?>.+?(?:data-ftype="(.+?)".+?)?(?:data-fquality="(.+?)".+?)?</td>\\s*
  </tr>`.replace(/\s+/g, ""),
    "g"
  );
  // console.log(videoTableRegex,videoTable);

  const promises = [];
  let rows;
  while ((rows = videoTableRegex.exec(videoTable))) {
    const [_, formatName, estimateSize, formatExt, requestFormat] = rows;
    // console.log(formatName);
    const qsData = qs.stringify({
      type: "youtube",
      _id: requestId,
      v_id: id,
      ajax: "1",
      token: "",
      ftype: formatExt,
      fquality: requestFormat,
    });

    promises.push(
      (async () => {
        for (let i = 0; ; i++) {
          const { data: urlData } = await axios("https://www.y2mate.com/mates/convert", {
            method: "POST",
            headers: commonHeaders,
            data: qsData,
            responseType: "json",
          });
          if (urlData["status"] != "success") {
            console.log(`Server responded with status ${urlData["status"]}`);
            continue;
          }

          const videoUrl = new RegExp('<a\\s+(?:[a-zA-Z-_]+=".+?"\\s+)*href="(https?://.+?)"(?:\\s+[a-zA-Z-_]+=".+?")*').exec(urlData["result"]);
          if (videoUrl) {
            return {
              format_id: `${formatName}-${formatExt}`,
              resolution: formatName,
              filesize_str: estimateSize,
              ext: formatExt,
              url: videoUrl[1],
              vcodec: "unknown",
              acodec: "unknown",
              retry: i,
            };
          }
        }
      })()
    );
  }

  const audioTableRegex = new RegExp(
    `<tr>\\s*
        <td>.+?(\\d+[kMG]?bps).+?</td>\\s*
        <td>(.*?\\s*[kMG]?B)</td>\\s*
        <td\\s*.+?>.+?(?:data-ftype="(.+?)".+?)?(?:data-fquality="(.+?)".+?)?</td>\\s*
    </tr>`.replace(/\s+/g, ""),
    "g"
  );

  while ((rows = audioTableRegex.exec(audioTable))) {
    const [_, formatName, estimateSize, formatExt, requestFormat] = rows;
    const qsData = qs.stringify({
      type: "youtube",
      _id: requestId,
      v_id: id,
      ajax: "1",
      token: "",
      ftype: formatExt,
      fquality: requestFormat,
    });

    promises.push(
      (async () => {
        for (let i = 0; ; i++) {
          const { data: urlData } = await axios("https://www.y2mate.com/mates/convert", {
            method: "POST",
            headers: commonHeaders,
            data: qsData,
            responseType: "json",
          });
          if (urlData["status"] != "success") {
            console.log(`Server responded with status ${urlData["status"]}`);
            continue;
          }

          const videoUrl = new RegExp('<a\\s+(?:[a-zA-Z-_]+=".+?"\\s+)*href="(https?://.+?)"(?:\\s+[a-zA-Z-_]+=".+?")*').exec(urlData["result"]);
          if (videoUrl) {
            return {
              format_id: `${formatName}-${formatExt}`,
              resolution: formatName,
              filesize_str: estimateSize,
              ext: formatExt,
              url: videoUrl[1],
              vcodec: "none",
              acodec: "unknown",
              retry: i,
            };
          }
        }
      })()
    );
  }

  setTimeout(() => {
    res.redirect(`/api/y2mate/youtube?id=${id}&retry=${(retry || 0) + 1}`);
  }, 6000);
  const formats = await Promise.all(promises);

  res.send({
    id: id,
    title: title,
    formats: formats,
  });
};

// module.exports({ query: { id: "HErAYIS2G7o" } }, {
//   status: () => ({
//     send: a => console.log(JSON.stringify(a)),
//   }),
//   send: a => console.log(JSON.stringify(a)),
// }).catch(console.log);
