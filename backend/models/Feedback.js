const db = require('../db');

class Feedback {
  static async create({ userId, email, message, type = 'general' }) {
    const [id] = await db('feedback').insert({
      user_id: userId || null,
      email: email || null,
      message,
      type
    });
    return this.findById(id);
  }

  static async findById(id) {
    return db('feedback').where({ id }).first();
  }

  static async getAll(limit = 100) {
    return db('feedback').orderBy('created_at', 'desc').limit(limit);
  }
}

module.exports = Feedback;