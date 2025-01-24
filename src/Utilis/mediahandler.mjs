import multer from "multer";
import path from "path"


const imageStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'static/image')
    },
    filename:(req,file,cb)=>{
        const uniquesuffix = Date.now() + path.extname(file.originalname) 
        cb(null, path.basename(file.originalname, path.extname(file.originalname)).replace(/ /g, "") + "_" + uniquesuffix);
    }
})

export const uploadImage = multer({
    storage : imageStorage
})

export const singleImagePath = (req, res, next) => {
    const imageFile = req.file;
    if (imageFile) {
       
        req.body.imagelink = `${req.protocol}://${req.get('host')}/image/${imageFile.filename}`;
    }
    next();
};
