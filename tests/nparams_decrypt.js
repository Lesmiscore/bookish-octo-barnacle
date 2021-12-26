const fs = require('fs');
const util = require("util");

const decrypt = require("../api/youtube/nparams/decrypt.js");

describe('decrypts n params', function () {
  for (file of fs.readdirSync('./tests/youtube_playerjs/')) {
    it(file, async function () {
      const jscode = (await util.promisify(fs.readFile)('./tests/youtube_playerjs/' + file)).toString('utf8');
      await decrypt.decryptNParam(jscode, 'iozK6raRyrJcxIfjM');
    })
  }
});
