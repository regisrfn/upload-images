const PDF2Pic = require("pdf2pic");

var convertFile = (file, save_dir) => {
    const pdf2pic = new PDF2Pic({
        density: 100,           // output pixels per inch
        savename: Date.now(),   // output file name
        savedir: save_dir || '/tmp',    // output file location
        format: "png",          // output file format
        size: "600x600"         // output size in pixels
    })

    return new Promise((resolve, reject) => {
        pdf2pic.convertBulk(file, -1)
            .then((result) => {
                console.log("image converter successfully!");
                resolve(result)
            })
            .catch(error => {
                reject(error)
            })
    })
}

module.exports = { convertFile }