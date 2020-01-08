// import entire SDK
var AWS = require('aws-sdk')
// test credentials
// add to .env AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
// AWS.config.getCredentials(function(err) {
//     if (err) console.log(err.stack);
//     // credentials not loaded
//     else {
//       console.log("Access key:", AWS.config.credentials.accessKeyId);
//       console.log("Secret access key:", AWS.config.credentials.secretAccessKey);
//     }
//   });
const uploadDocument = async (document) => {
    const s3 = new AWS.S3({region: process.env.AWS_REGION})
    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `text-recognition/test-image`,
        Body: document.file,
        ACL:'public-read',
        ContentType:document.content
    }
  
    return s3.upload(params).promise()
  }
module.exports = {uploadDocument}