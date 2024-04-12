// const multer = require("multer");

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, '/home/aman/Desktop/profileImages');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname + Date.now());
//     }
// });

// // const upload = multer({ storage: storage })

// function MulterMiddleware(fieldNames) {
//     return multer({ storage: storage }).single(fieldNames);
// }

  
// module.exports = MulterMiddleware;

//3333
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/home/aman/Desktop/profileImages');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + Date.now());
    }
});

const upload = multer({ storage: storage }).single('profileImage');

module.exports = upload





// const bodyParser = require('body-parser')

// router.use(bodyParser.json())
// router.use(bodyParser.urlencoded({extended:true}))
// router.use(express.static('public'))