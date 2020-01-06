const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
require('dotenv').config()

var http = require('http')
var server = http.createServer(app)

const cloudinary = require('./cloudinary/config.js')
const storage = require('./storage/multer.js')
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
app.post('/uptocloudinary', storage.single('image'), function(req,res){
    
    cloudinary.v2.uploader.upload(req.file.path)
    .then( (result) => {
        return res.status(200).json({
            status: true,
            message: 'OK',
            image: result
        })
    })
    .catch( error => {
        console.log(error)
        return res.status(500).json({
            status: false,
        })
    })
    
})



server.listen(process.env.PORT || 8081, function () {
    console.log('SERVER IS RUNNING');
})