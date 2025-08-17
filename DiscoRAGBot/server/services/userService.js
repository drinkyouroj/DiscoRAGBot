const { randomUUID } = require('crypto');

const User = require('../models/User.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list() {
    try {
      return User.find();
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email) {
    try {
      const user = await User.findOne({ email }).exec();
      console.log('getByEmail result:', { email, userFound: !!user });
      return user;
    } catch (err) {
      console.error('getByEmail error:', err);
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      return User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id) {
    try {
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      console.log('Authenticating user:', email);
      const user = await User.findOne({email}).exec();
      console.log('User found in database:', !!user);
      
      if (!user) return null;

      console.log('Validating password for user:', email);
      const passwordValid = await validatePassword(password, user.password);
      console.log('Password validation result:', passwordValid);
      
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      console.log('User login timestamp updated');
      return updatedUser;
    } catch (err) {
      console.error('Authentication error:', err);
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, name = '' }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    console.log('Creating user:', { email, passwordLength: password.length });

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) {
      console.log('User already exists:', email);
      throw new Error('User with this email already exists');
    }

    console.log('Generating password hash for:', email);
    const hash = await generatePasswordHash(password);
    console.log('Password hash generated, length:', hash.length);

    try {
      const user = new User({
        email,
        password: hash,
        name,
      });

      console.log('Saving user to database:', email);
      await user.save();
      console.log('User saved successfully:', { email, userId: user._id });
      return user;
    } catch (err) {
      console.error('User creation error:', err);
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user, password) {
    if (!password) throw new Error('Password is required');
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }
}

module.exports = UserService;