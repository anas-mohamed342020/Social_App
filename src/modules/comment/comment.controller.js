import { Router } from "express";
import { auth } from "../../middleware/auth.middleware.js";
import { fileTypes, uploadFile } from '../../utils/multer/multer.js'
import * as commentServices from './comment.services.js'
import { asyncHandler } from "../../utils/errorHandel/asyncHandler.js";
const router = Router({ mergeParams: true });

// localhost:3000/post/123/comment
router.get('/', asyncHandler(commentServices.getPostComments))
router.get('/get-all-posts', asyncHandler(commentServices.getAllPosts))

router.post('/',
    auth(),
    uploadFile(fileTypes.image).single('image'),
    asyncHandler(commentServices.createComment)
);

router.patch('/:commentId',
    auth(),
    uploadFile(fileTypes.image).single('image'),
    asyncHandler(commentServices.updateComment)
)
router.patch('/soft-delete/:commentId',
    auth(),
    asyncHandler(commentServices.softDeleteComment)
)

router.get('/:commentId', asyncHandler(commentServices.getComment))


router.patch('/like-unlike/:commentId', auth(), asyncHandler(commentServices.like_unlike))

router.delete('/hard-delete/:commentId', asyncHandler(commentServices.hardDelete))




router.post('/add-replay/:commentId', auth(), uploadFile(fileTypes.image).single('image'), asyncHandler(commentServices.addReplay))














export default router
