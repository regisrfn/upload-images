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
var s3 = new AWS.S3({region: process.env.AWS_REGION})
// // Call S3 to list the buckets
// s3.listBuckets(function(err, data) {
//     if (err) {
//       console.log("Error", err);
//     } else {
//       console.log("Success", data.Buckets);
//     }
//   });
module.exports = {s3}