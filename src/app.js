const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
const fs = require('fs-extra')
var zipdir = require('zip-dir');
require('dotenv').config()

var http = require('http')
var server = http.createServer(app)

const cloudinary = require('./cloudinary/config.js')
const storage = require('./storage/multer.js')
const AWS = require('./services/AWS/AWS.js')
const write_table = require('./services/write_csv/write_csv.js')
const pdf = require('./services/pdf_converter/pdf_converter.js')

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

app.use(morgan('combined'))
app.use(bodyParser.json({ limit: '100mb' }))


var whitelist = ['https://handwriting-recogntion.herokuapp.com','http://localhost:8080']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
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
    const dir = `${__dirname}/temp`
    const file_zip = `${dir}/tables_ZIP/${Date.now()}.zip`
    const path_to_csv = `${dir}/tables_CSV`

    // read binary data
    var document = {}
    fs.ensureDirSync(`${dir}/tables_ZIP/`)
    fs.ensureDirSync(path_to_csv)

    if (file_type === "pdf") {
        pdf.convertFile(req.file.path)
            .then(async images => {
                await asyncForEach(images, async (image, index) => {
                    document = { file: fs.readFileSync(image) }
                    console.log(image)
                    await AWS.analyzeDocument(document)
                        .then(result => {
                            write_table.writeCSV(result, `${path_to_csv}/page${index + 1}_`)
                        })
                        .catch(error => {
                            console.log(error)
                            return res.status(500).json({
                                error: 'Internal Server Error',
                            })
                        })
                })
            })
            .then(() => {
                zipdir(path_to_csv, { saveTo: file_zip }, (error) => {
                    if (error) {
                        console.log(error)
                        return res.status(500).json({
                            error: 'Internal Server Error',
                        })
                    }
                    fs.remove(`${__dirname}/temp`)
                    return res.status(200).download(file_zip)
                })
            })
            .catch(error => {
                console.log(error)
                return res.status(200).json({
                    error: 'Internal Server Error',
                })
            })

    } else if (file_type === 'png' || file_type === 'jpeg') {

        document = { file: fs.readFileSync(req.file.path) }
        AWS.analyzeDocument(document)
            .then(result => {
                tables = write_table.writeCSV(result, `${path_to_csv}/page_`)
                zipdir(path_to_csv, { saveTo: file_zip },
                    function (error) {
                        if (error) {
                            console.log(error)
                            return res.status(500).json({
                                status: false,
                            })
                        }
                        fs.remove(`${__dirname}/temp`)
                        return res.status(200).download(file_zip)

                    })
            })
            .catch(error => {
                console.log(error)
                return res.status(500).json({
                    status: false,
                })
            })
    }

})

server.listen(process.env.PORT || 8081, function () {
    console.log('SERVER IS RUNNING');
})