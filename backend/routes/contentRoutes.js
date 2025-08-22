// import express from 'express';
// import {
//     getContent,
//     createContent,
//     updateContent,
//     deleteContent,
//     bulkDeleteContent
// } from '../controllers/contentController.js'

// import {protect} from '../middleware/authMiddleware.js'

// const router=express.Router();

// router.use(protect);

// router.route('/')
//      .get(getContent)
//      .post(createContent);

// router.post('/bulk-delete',bulkDeleteContent);

// router.route('/:id')
//    .put(updateContent)
//    .delete(deleteContent);

// export default router;   
import express from 'express';
import {
    getContent,
    createContent,
    updateContent,
    deleteContent,
    bulkDeleteContent,
    getFilePreview,
    getFileMetadata,
    upload
} from '../controllers/contentController.js'

import { protect } from '../middleware/authMiddleware.js'

const router = express.Router();

router.use(protect);

// Regular content routes
router.route('/')
    .get(getContent)
    .post(upload.single('file'), createContent); // Add file upload middleware

// Bulk delete route
router.post('/bulk-delete', bulkDeleteContent);

// File-specific routes
router.get('/:id/preview', getFilePreview); // New route for file preview
router.get('/:id/metadata', getFileMetadata); // New route for file metadata

// Content CRUD routes
router.route('/:id')
    .put(upload.single('file'), updateContent) // Add file upload middleware for updates
    .delete(deleteContent);

export default router;