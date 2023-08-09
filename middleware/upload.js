const util = require("util");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

var storage = new GridFsStorage({
    url: 'mongodb+srv://admin:admin123@kocin.kpybkeo.mongodb.net/doorlock',
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-images-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: 'photos',
            filename: `${Date.now()}-images-${file.originalname}`
        };
    }
});

var uploadFiles = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;