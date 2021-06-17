module.exports = (req, res) => {
  res.send({
    // update setion
    "update": {
      // slug for repository
      "slug": "ytdl-patched/ytdl-patched",
      // mode, unused for now
      "mode": "github",
    },
  })
};
