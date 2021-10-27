const fs = require('fs');

const decrypt = require("../api/youtube/nparams/decrypt.js");

describe('decrypts n params', function () {
  for (file of fs.readdirSync('./tests/youtube_playerjs/')) {
    it(file, function () {
      const jscode = fs.readFileSync('./tests/youtube_playerjs/' + file);
      decrypt.decryptNParam(jscode, 'iozK6raRyrJcxIfjM');
    })
  }
});
