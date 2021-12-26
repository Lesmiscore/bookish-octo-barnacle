const axios = require("axios");
const ivm = require("isolated-vm")

const nParamFuncName = [/\.get\("n"\)\)&&\(([a-zA-Z0-9$]+)=([a-zA-Z0-9$]{3,})\(\1\)/];
const nParamFuncBody = [/[FUNCNAME]=(function\([a-zA-Z0-9$]+\)\{.+?return [a-zA-Z0-9$]+\.join\(['"]{2}\)\};?)/ms];

class NDecryptError extends Error {
  constructor(step, msg) {
    super(msg);
    this.step = step;
  }
}

async function decryptNParam(playerJs, nValue) {
  let fName;
  for (const re of nParamFuncName) {
    const matches = re.exec(playerJs);
    if (matches !== null) {
      fName = matches[2];
      break;
    }
  }
  if (!fName) {
    throw new NDecryptError("finding_fname", "Failed to find function name");
  }

  let funcBody;
  for (const re of nParamFuncBody) {
    const matches = new RegExp(re.source.replace(/\[FUNCNAME\]/g, fName), re.flags).exec(playerJs);
    if (matches !== null) {
      funcBody = matches[1];
      break;
    }
  }
  if (!funcBody) {
    throw new NDecryptError("finding_funcbody", "Failed to find function body");
  }

  // build payload and evaluate it
  const isolate = new ivm.Isolate();
  const [context, script] = await Promise.all([
    isolate.createContext(),
    isolate.compileScript(`
      const ndecrypter=${funcBody};
      ndecrypter(${JSON.stringify(nValue)});
    `)
  ])
  try {
    return await script.run(context);
  } catch (e) {
    e.step = "eval_n";
    throw e;
  }
}

module.exports = async (req, resp) => {
  const { player, n } = req.query;
  let playerUrl = player;
  if (!playerUrl.startsWith("https://") && !playerUrl.startsWith("http://")) {
    // setting "player" parameter to js url is always recommended
    playerUrl = `https://www.youtube.com/s/player/${playerUrl}/player_ias.vflset/en_US/base.js`;
  }
  let playerResponse;
  try {
    playerResponse = await axios(playerUrl, {
      responseType: "text",
    });
  } catch (e) {
    return resp.status(503).send({
      status: "error",
      step: "downloading_js",
      data: e,
    });
  }
  try {
    const decryptedN = await decryptNParam(playerResponse.data, n);
    // resp.setHeader("Cache-Control", "stale-while-revalidate=86400");
    return resp.send({
      status: "ok",
      data: decryptedN,
    });
  } catch (e) {
    console.error(e);
    return resp.status(503).send({
      status: "error",
      step: e.step || "decrypting",
      data: e,
    });
  }
};
module.exports.decryptNParam = decryptNParam;
