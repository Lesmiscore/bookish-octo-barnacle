const feed={
  // update setion
  "update": {
    // slug for repository
    "slug": "ytdl-patched/ytdl-patched",
    // mode, unused for now
    "mode": "github",
  },
};

module.exports = (req, res) => {
  res.send(feed)
};
module.exports.feed=feed;
