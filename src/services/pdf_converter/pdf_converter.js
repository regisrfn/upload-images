var PDFImage = require("pdf-image").PDFImage;
 
const convertFile = (file) => {
    var pdfImage = new PDFImage(file);
    return pdfImage.convertFile()
}

module.exports = {convertFile}
