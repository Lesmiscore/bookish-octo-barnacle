const fs = require('fs');
const util = require("util");
const axios = require("axios");

const decrypt = require("../api/youtube/nparams/decrypt.js");
const assert = require('assert');

// https://github.com/yt-dlp/yt-dlp/blob/master/test/test_youtube_signature.py
const ytdlpTests = [
  [
    'https://www.youtube.com/s/player/9216d1f7/player_ias.vflset/en_US/base.js',
    'SLp9F5bwjAdhE9F-', 'gWnb9IK2DJ8Q1w',
  ],
  [
    'https://www.youtube.com/s/player/f8cb7a3b/player_ias.vflset/en_US/base.js',
    'oBo2h5euWy6osrUt', 'ivXHpm7qJjJN',
  ],
  [
    'https://www.youtube.com/s/player/2dfe380c/player_ias.vflset/en_US/base.js',
    'oBo2h5euWy6osrUt', '3DIBbn3qdQ',
  ],
  [
    'https://www.youtube.com/s/player/f1ca6900/player_ias.vflset/en_US/base.js',
    'cu3wyu6LQn2hse', 'jvxetvmlI9AN9Q',
  ],
  [
    'https://www.youtube.com/s/player/8040e515/player_ias.vflset/en_US/base.js',
    'wvOFaY-yjgDuIEg5', 'HkfBFDHmgw4rsw',
  ],
  [
    'https://www.youtube.com/s/player/e06dea74/player_ias.vflset/en_US/base.js',
    'AiuodmaDDYw8d3y4bf', 'ankd8eza2T6Qmw',
  ],
  [
    'https://www.youtube.com/s/player/5dd88d1d/player-plasma-ias-phone-en_US.vflset/base.js',
    'kSxKFLeqzv_ZyHSAt', 'n8gS8oRlHOxPFA',
  ],
  [
    'https://www.youtube.com/s/player/324f67b9/player_ias.vflset/en_US/base.js',
    'xdftNy7dh9QGnhW', '22qLGxrmX8F1rA',
  ],
  [
    'https://www.youtube.com/s/player/4c3f79c5/player_ias.vflset/en_US/base.js',
    'TDCstCG66tEAO5pR9o', 'dbxNtZ14c-yWyw',
  ],
  [
    'https://www.youtube.com/s/player/c81bbb4a/player_ias.vflset/en_US/base.js',
    'gre3EcLurNY2vqp94', 'Z9DfGxWP115WTg',
  ],
  [
    'https://www.youtube.com/s/player/1f7d5369/player_ias.vflset/en_US/base.js',
    'batNX7sYqIJdkJ', 'IhOkL_zxbkOZBw',
  ],
];

describe('decrypts n params', function () {
  // players from youtube is also available at https://archive.org/details/youtube-player-js
  for (file of fs.readdirSync('./tests/youtube_playerjs/')) {
    it(file, async function () {
      const jscode = (await util.promisify(fs.readFile)('./tests/youtube_playerjs/' + file)).toString('utf8');
      await decrypt.decryptNParam(jscode, 'iozK6raRyrJcxIfjM');
    })
  }
  for ([url, input, expected] of ytdlpTests) {
    it(url, async function () {
      const { data: jscode } = await axios(url, {
        responseType: "text",
      });
      assert.strictEqual(await decrypt.decryptNParam(jscode, input), expected);
    })
  }
});
