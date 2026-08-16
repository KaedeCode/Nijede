const db = require('../db');
const bcrypt = require('bcrypt');

class User {
  static async create({ username, password }) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const [id] = await db('users').insert({
      username,
      password_hash: passwordHash
    });
    return this.findById(id);
  }

  static async findByUsername(username) {
    return db('users').where({ username }).first();
  }

  static async findById(id) {
    return db('users').where({ id }).first();
  }

  static async update(id, data) {
    return db('users').where({ id }).update(data);
  }

  static async comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}

module.exports = User;