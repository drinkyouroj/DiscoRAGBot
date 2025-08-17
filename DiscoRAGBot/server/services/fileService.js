const File = require('../models/File');
const fs = require('fs');
const path = require('path');

class FileService {
  static async create(fileData, userId) {
    try {
      console.log(`Creating file record for user ${userId}:`, fileData.originalname);
      
      const file = new File({
        name: fileData.filename,
        originalName: fileData.originalname,
        size: fileData.size,
        type: path.extname(fileData.originalname).toLowerCase().substring(1),
        mimetype: fileData.mimetype,
        path: fileData.path,
        userId: userId,
        status: 'ready' // For now, mark as ready immediately
      });

      const savedFile = await file.save();
      console.log(`File record created successfully with ID: ${savedFile._id}`);
      return savedFile;
    } catch (error) {
      console.error('Error creating file record:', error);
      throw new Error('Failed to create file record');
    }
  }

  static async getByUserId(userId) {
    try {
      console.log(`Fetching files for user: ${userId}`);
      const files = await File.find({ userId }).sort({ uploadDate: -1 });
      console.log(`Found ${files.length} files for user ${userId}`);
      return files;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw new Error('Failed to fetch files');
    }
  }

  static async getById(fileId, userId) {
    try {
      console.log(`Fetching file ${fileId} for user ${userId}`);
      const file = await File.findOne({ _id: fileId, userId });
      if (!file) {
        throw new Error('File not found');
      }
      return file;
    } catch (error) {
      console.error('Error fetching file:', error);
      throw new Error('File not found');
    }
  }

  static async delete(fileId, userId) {
    try {
      console.log(`Deleting file ${fileId} for user ${userId}`);
      
      const file = await File.findOne({ _id: fileId, userId });
      if (!file) {
        throw new Error('File not found');
      }

      // Delete physical file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`Physical file deleted: ${file.path}`);
      }

      // Delete database record
      await File.findByIdAndDelete(fileId);
      console.log(`File record deleted: ${fileId}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  static async updateStatus(fileId, status) {
    try {
      console.log(`Updating file ${fileId} status to: ${status}`);
      const file = await File.findByIdAndUpdate(
        fileId,
        { status },
        { new: true }
      );
      return file;
    } catch (error) {
      console.error('Error updating file status:', error);
      throw new Error('Failed to update file status');
    }
  }
}

module.exports = FileService;