const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

let filename
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../housiy2/uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    filename = uuidv4();
    cb(null, `${filename}.${ext}`);
  },
});

var multerFilter = function(req, file, cb) {
  // Accept images only
  if (!file.originalname.match(/\.(pdf|doc|txt|jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webm|WEBM)$/)) {
      req.fileValidationError = 'Only pdf|doc|txt|jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF file type are allowed!';
      return cb(new Error('Only pdf|doc|txt|jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF file type  are allowed!'), false);
  }
  cb(null, true);
}


var fileUpload = multer({ storage: storage, fileFilter: multerFilter });

module.exports = fileUpload;