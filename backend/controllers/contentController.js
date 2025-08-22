// import Content from '../models/contentModel.js'

// const getContent = async (req, res) => {
//   try {
//     let query = { user: req.user.id };

//     if (req.query.type && req.query.type !== 'all') {
//       query.type = req.query.type;
//     }
//     if (req.query.tag) {
//       query.tags = req.query.tag;
//     }

//     // Server-side text search
//     if (req.query.search) {
//       query.$text = { $search: req.query.search };
//     }

//     // Pagination
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // Get total count for pagination
//     const total = await Content.countDocuments(query);
    
//     // Get content with pagination
//     const contents = await Content.find(query)
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     res.status(200).json({
//       contents,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(total / limit),
//         totalItems: total,
//         itemsPerPage: limit
//       }
//     });
//   } catch (error) {
//     console.error('Get content error:', error);
//     res.status(500).json({ message: 'Error fetching content', error: error.message });
//   }
// };

// const createContent = async (req, res) => {
//   try {
   
//     const { type } = req.body;
//     if (!type) {
//       return res.status(400).json({ message: 'Content type is required' });
//     }

 
//     const validTypes = ['tweaks', 'playlists', 'notes', 'important-links', 'pdfs', 'images'];
//     if (!validTypes.includes(type)) {
//       return res.status(400).json({ message: 'Invalid content type' });
//     }
//     const newContent = await Content.create({
//       ...req.body,
//       user: req.user.id,
//     });
    
//     res.status(201).json(newContent);
//   } catch (error) {
//     console.error('Create content error:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ 
//         message: 'Validation error', 
//         errors: Object.values(error.errors).map(e => e.message)
//       });
//     }
//     res.status(400).json({ message: 'Error creating content', error: error.message });
//   }
// };

// const updateContent = async (req, res) => {
//   try {
//     const content = await Content.findById(req.params.id);
    
//     if (!content) {
//       return res.status(404).json({ message: 'Content not found' });
//     }
    
//     // Check if user owns the content
//     if (content.user.toString() !== req.user.id) {
//       return res.status(401).json({ message: 'User not authorized' });
//     }

//     const updatedContent = await Content.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     res.status(200).json(updatedContent);
//   } catch (error) {
//     console.error('Update content error:', error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ 
//         message: 'Validation error', 
//         errors: Object.values(error.errors).map(e => e.message)
//       });
//     }
//     res.status(500).json({ message: 'Error updating content', error: error.message });
//   }
// };

// const deleteContent = async (req, res) => {
//   try {
//     const content = await Content.findById(req.params.id);
    
//     if (!content) {
//       return res.status(404).json({ message: 'Content not found' });
//     }
    
//     if (content.user.toString() !== req.user.id) {
//       return res.status(401).json({ message: 'User not authorized' });
//     }
    
//     await Content.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: 'Content deleted successfully', id: req.params.id });
//   } catch (error) {
//     console.error('Delete content error:', error);
//     res.status(500).json({ message: 'Error deleting content', error: error.message });
//   }
// };

// const bulkDeleteContent = async (req, res) => {
//   try {
//     const { ids } = req.body;
    
//     if (!ids || !Array.isArray(ids) || ids.length === 0) {
//       return res.status(400).json({ message: 'Please provide an array of content IDs' });
//     }

//     const result = await Content.deleteMany({
//       _id: { $in: ids },
//       user: req.user.id
//     });

//     res.status(200).json({
//       message: `Deleted ${result.deletedCount} items`,
//       deletedCount: result.deletedCount
//     });
//   } catch (error) {
//     console.error('Bulk delete error:', error);
//     res.status(500).json({ message: 'Error deleting content', error: error.message });
//   }
// };

// export { getContent, createContent, updateContent, deleteContent, bulkDeleteContent }


import Content from '../models/contentModel.js'
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store in memory for processing

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and WebP files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

const getContent = async (req, res) => {
  try {
    let query = { user: req.user.id };

    if (req.query.type && req.query.type !== 'all') {
      query.type = req.query.type;
    }
    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // Server-side text search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Content.countDocuments(query);
    
    // Get content with pagination (excluding fileData by default)
    const contents = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      contents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Error fetching content', error: error.message });
  }
};

const createContent = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'Content type is required' });
    }

    const validTypes = ['tweaks', 'playlists', 'notes', 'important-links', 'pdfs', 'images'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    // Handle file upload for pdfs and images
    let fileData = null;
    if (req.file && (type === 'pdfs' || type === 'images')) {
      fileData = {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileData: req.file.buffer.toString('base64'), // Store as base64
      };
    }

    const newContent = await Content.create({
      ...req.body,
      ...fileData,
      user: req.user.id,
    });
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Create content error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(400).json({ message: 'Error creating content', error: error.message });
  }
};

const updateContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user owns the content
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Handle file update if new file is uploaded
    let updateData = { ...req.body };
    if (req.file && (content.type === 'pdfs' || content.type === 'images')) {
      updateData = {
        ...updateData,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        fileData: req.file.buffer.toString('base64'),
      };
    }

    const updatedContent = await Content.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedContent);
  } catch (error) {
    console.error('Update content error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Error updating content', error: error.message });
  }
};

const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await Content.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Content deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Error deleting content', error: error.message });
  }
};

const bulkDeleteContent = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of content IDs' });
    }

    const result = await Content.deleteMany({
      _id: { $in: ids },
      user: req.user.id
    });

    res.status(200).json({
      message: `Deleted ${result.deletedCount} items`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'Error deleting content', error: error.message });
  }
};

// New endpoint to serve files for preview
const getFilePreview = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id).select('+fileData');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user owns the content
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (!content.fileData) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Convert base64 back to buffer
    const fileBuffer = Buffer.from(content.fileData, 'base64');
    
    // Set appropriate headers
    res.setHeader('Content-Type', content.fileType);
    res.setHeader('Content-Length', fileBuffer.length);
    
    // For PDFs, set headers to display inline in browser
    if (content.fileType === 'application/pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${content.fileName}"`);
    } else {
      // For images, also inline
      res.setHeader('Content-Disposition', `inline; filename="${content.fileName}"`);
    }
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('File preview error:', error);
    res.status(500).json({ message: 'Error retrieving file', error: error.message });
  }
};

// Get file metadata without the actual file data
const getFileMetadata = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const metadata = {
      id: content._id,
      fileName: content.fileName,
      fileSize: content.fileSize,
      fileType: content.fileType,
      type: content.type,
      tags: content.tags,
      about: content.about,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt
    };

    res.status(200).json(metadata);
  } catch (error) {
    console.error('File metadata error:', error);
    res.status(500).json({ message: 'Error retrieving file metadata', error: error.message });
  }
};

export { 
  getContent, 
  createContent, 
  updateContent, 
  deleteContent, 
  bulkDeleteContent,
  getFilePreview,
  getFileMetadata,
  upload
};