const CryptoJS = require('crypto-js');
const axios = require('axios');

const config = {
  AccessKey: "*********",
  SecurityKey: "***********",
  AppKey: "***********",
  AppSecret: "***********",
  host: 'https://ai-global.ctapi.ctyun.cn/v1/aiop/api/2z0yhhrzgv0g/tts/predict'
};

//简单使用时间戳做reqId，不知道可不可以
function getEopId() {
  const id = Date.now();
  return id;
}

function getEopDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

const body = {
  Action: "TTS",
  TextData: "你好啊啊",
  VoiceType: 1
};

const eopID = getEopId();
const eopDate = getEopDate();

const headerSignatureStr = `ctyun-eop-request-id:${eopID}\neop-date:${eopDate}\nhost:${config.host}`;//根据文档header排序后组合，先手动写死
const querySignatureStr = `appkey=${config.AppKey}&Content-Type=application/json`;//根据文档排序的query，也是手动先写死
const bodySignatureSha = CryptoJS.SHA256(body).toString(CryptoJS.enc.Hex);//也是根据文档，对body取sha256再16进制，不清楚这里需不需要对body.toString
const resultSignatureStr = `${headerSignatureStr}\n${querySignatureStr}\n${bodySignatureSha}`;//得到最终待签名字符串

const kTime = CryptoJS.HmacSHA256(eopDate, config.SecurityKey);//动态秘钥kTime
const kAk = CryptoJS.HmacSHA256(kTime, config.AccessKey);//动态秘钥kAk
const kDate = CryptoJS.HmacSHA256(eopDate, kAk);//动态秘钥kDate

const signature = CryptoJS.HmacSHA256(resultSignatureStr, kDate).toString(CryptoJS.enc.Base64);//得到最终签名signature
const eopAuthorization = `${config.AccessKey} Headers=${eopID};${eopDate};${config.host} Signature=${signature}`;//得到Eop-Authorization

const headers = {
  'Eop-Authorization': eopAuthorization,
  'eop-date': eopDate,
  'ctyun-eop-request-id': eopID
};


axios.post(config.host, body, { headers })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });
