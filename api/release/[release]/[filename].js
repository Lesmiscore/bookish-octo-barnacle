const axios = require("axios");

const { feed } = require("../../feed");

module.exports = async (req, res) => {
  const {
    query: { release, filename, prerelease },
  } = req;
  if (release == "latest") {
    let latest = null;
    if (prerelease === "true") {
      // ported from ytdl-patched's update.py
      for (let i = 1; i < 4; i++) {
        const releases = (await axios(`https://api.github.com/repos/${feed.update.slug}/releases?page=${i}`)).data;
        for (const release of releases) {
          if (release.prerelease) {
            latest = release.id;
            // exit outer loop too
            i = 10;
            break
          }
        }
      }
    } else {
      const { data: releases } = await axios(`https://api.github.com/repos/${feed.update.slug}/releases`);
      latest = releases[0].id;
    }

    return res.redirect(`/api/release/${latest}/${filename}`);
  }
  let releaseData;
  try {
    // release name
    releaseData = (await axios(`https://api.github.com/repos/${feed.update.slug}/releases/${release}`)).data;
  } catch (e) {
    // release tag
    releaseData = (await axios(`https://api.github.com/repos/${feed.update.slug}/releases/tags/${release}`)).data;
  }
  const assets = releaseData.assets;
  for (const asset of assets) {
    if (asset.name == filename) {
      return res.redirect(asset.browser_download_url);
    }
  }
  res.status(404);
};
