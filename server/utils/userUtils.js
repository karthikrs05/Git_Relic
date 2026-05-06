import User from '../models/User.js';

export async function populateUser(userId) {
  return await User.findById(userId).select('username email bio');
}

export async function populateUsers(ids) {
  return await User.find({ _id: { $in: ids } }).select('username email bio');
}
