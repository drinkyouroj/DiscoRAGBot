const ManualEntry = require('../models/ManualEntry');

class ManualEntryService {
  static async create(entryData, userId) {
    try {
      console.log('Creating manual entry for user:', userId, 'Title:', entryData.title);

      const entry = new ManualEntry({
        ...entryData,
        userId
      });

      const savedEntry = await entry.save();
      console.log('Manual entry created successfully with ID:', savedEntry._id);
      return savedEntry;
    } catch (error) {
      console.error('Error creating manual entry:', error);
      throw new Error(`Failed to create manual entry: ${error.message}`);
    }
  }

  static async getByUserId(userId) {
    try {
      console.log('Fetching manual entries for user:', userId);

      const entries = await ManualEntry.find({ userId })
        .sort({ updatedDate: -1 })
        .lean();

      console.log(`Found ${entries.length} manual entries for user ${userId}`);
      return entries;
    } catch (error) {
      console.error('Error fetching manual entries:', error);
      throw new Error(`Failed to fetch manual entries: ${error.message}`);
    }
  }

  static async getById(entryId, userId) {
    try {
      console.log('Fetching manual entry:', entryId, 'for user:', userId);

      const entry = await ManualEntry.findOne({ _id: entryId, userId }).lean();

      if (!entry) {
        throw new Error('Manual entry not found');
      }

      console.log('Manual entry found:', entry.title);
      return entry;
    } catch (error) {
      console.error('Error fetching manual entry:', error);
      throw new Error(`Failed to fetch manual entry: ${error.message}`);
    }
  }

  static async update(entryId, updateData, userId) {
    try {
      console.log('Updating manual entry:', entryId, 'for user:', userId);

      const entry = await ManualEntry.findOneAndUpdate(
        { _id: entryId, userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!entry) {
        throw new Error('Manual entry not found');
      }

      console.log('Manual entry updated successfully:', entry.title);
      return entry;
    } catch (error) {
      console.error('Error updating manual entry:', error);
      throw new Error(`Failed to update manual entry: ${error.message}`);
    }
  }

  static async delete(entryId, userId) {
    try {
      console.log('Deleting manual entry:', entryId, 'for user:', userId);

      const result = await ManualEntry.findOneAndDelete({ _id: entryId, userId });

      if (!result) {
        throw new Error('Manual entry not found');
      }

      console.log('Manual entry deleted successfully:', result.title);
      return { success: true };
    } catch (error) {
      console.error('Error deleting manual entry:', error);
      throw new Error(`Failed to delete manual entry: ${error.message}`);
    }
  }
}

module.exports = ManualEntryService;