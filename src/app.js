const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

var http = require('http')
var server = http.createServer(app)

app.use(morgan('combined'))
app.use(bodyParser.json({ limit: '100mb' }))
app.use(cors())

app.get('/', function (req, res) {

    return res.status(200).json({
        status: true,
        message: 'Hello world'
    })


})

server.listen(process.env.PORT || 8081, function () {
    console.log('SERVER IS RUNNING');
})