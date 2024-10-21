const multer = require("multer");
const path = require("path");

const imageStore = multer.diskStorage({
	destination: function (req, file, cb){
		
		let folder = "";

		if(req.baseUrl.includes("users")){
			folder = "users";
		} else if(req.baseUrl.includes("posts")){
			folder = "posts";
		}

		cb(null, `public/images/${folder}`);
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + String(Math.floor(Math.random() * 1000)) + path.extname(file.originalname))	// Ex.: -> 213121003123.jpeg
	}
})

const imageUpload = multer({
	storage: imageStore,	// A var criada lá em cima
	fileFilter(req, file, cb){
		if(!file.originalname.match(/\.(png|jpg)$/)){
			return cb(new Error('Por favor, apenas jpg ou png!'))
		}
		cb(undefined, true);
	}
})


module.exports = imageUpload;