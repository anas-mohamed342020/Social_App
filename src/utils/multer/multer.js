import multer, { diskStorage } from "multer";
import { nanoid } from 'nanoid'
import path from 'path'
import fs from 'fs'
// fileName x
// destination E://

export const fileTypes = {
    image:['image/apng','image/jpeg','image/png'],
    video:[]
}
export const uploadFile = (types,folder) => {
    const storage = diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (types.includes(file.mimetype)) {
            return cb(null, true)
        }
        return cb(new Error('invalid format', false))
    }
    const upload = multer({ storage, fileFilter })
    return upload
}



