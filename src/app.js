const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const fs = require('fs')
require('dotenv').config()

var http = require('http')
var server = http.createServer(app)

const cloudinary = require('./cloudinary/config.js')
const storage = require('./storage/multer.js')
const s3 = require('./services/AWS/AWS.js').s3
app.use(morgan('combined'))
app.use(bodyParser.json({ limit: '100mb' }))
app.use(cors())

app.get('/', function (req, res) {

    return res.status(200).json({
        status: true,
        message: 'Hello world'
    })


})

// UPLOAD IMAGE
app.post('/uptocloudinary', storage.single('image'), function (req, res) {

    cloudinary.v2.uploader.upload(req.file.path, { folder: "handwriting_app/" })
        .then((result) => {
            return res.status(200).json({
                status: true,
                message: 'OK',
                image: result
            })
        })
        .catch(error => {
            console.log(error)
            return res.status(500).json({
                status: false,
            })
        })

})

// UPLOAD IMAGE to aws-s3
app.post('/uptos3', storage.single('image'), function (req, res) {
    var buffer = fs.readFileSync(req.file.path)
    var params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `text-recognition/test-image`,
        Body: buffer,
        ACL:'public-read',
        ContentType:req.file.mimetype
    };


    s3.upload(params, function (err, data) {
        if (err) {
            console.log(error)
            return res.status(500).json({
                status: false,
            })   
        }
        else{
            console.log(data)
            return res.status(200).json({
                status: true,
                message: 'OK',
            })
        }
    });

})


server.listen(process.env.PORT || 8081, function () {
    console.log('SERVER IS RUNNING');
})