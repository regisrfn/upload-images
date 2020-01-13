const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const fs = require('fs')
var path = require('path')
var zipdir = require('zip-dir');
require('dotenv').config()

var http = require('http')
var server = http.createServer(app)

const cloudinary = require('./cloudinary/config.js')
const storage = require('./storage/multer.js')
const AWS = require('./services/AWS/AWS.js')
const write_table = require('./services/write_csv/write_csv.js')


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
    var document = {
        // read binary data
        file: fs.readFileSync(req.file.path),
        content: req.file.mimetype
    }
    AWS.uploadDocument(document)
        .then(result => {
            console.log(result)
            return res.status(200).json({
                status: true,
                message: 'OK'
            })
        })
        .catch(error => {
            console.log(error)
            return res.status(500).json({
                status: false,
            })
        })
})

app.post('/aws/textract', storage.single('image'), function (req, res) {

    const file_type = req.file.mimetype.split('/').pop()
    const dir = `${__dirname}/temp/`
    const file = `${dir}/tables_ZIP/table.zip`
    const path = `${dir}/tables_CSV/`
    var document = {
        // read binary data
        file: fs.readFileSync(req.file.path)
    }

    fs.mkdirSync(dir)
    fs.mkdirSync(path)
    fs.mkdirSync(`${dir}/tables_ZIP/`)

    AWS.analyzeDocument(document)
        .then(result => {
            tables = write_table.writeCSV(result, path)
            zipdir(path, { saveTo: file },
                function (error) {
                    if (error) {
                        console.log(error)
                        return res.status(500).json({
                            status: false,
                        })
                    }
                    res.status(200).download(file)
                })
        })
        .catch(error => {
            console.log(error)
            return res.status(500).json({
                status: false,
            })
        })

})
server.listen(process.env.PORT || 8081, function () {
    console.log('SERVER IS RUNNING');
})