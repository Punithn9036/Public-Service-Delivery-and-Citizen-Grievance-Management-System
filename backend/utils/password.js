// backend/utils/password.js
// Simple wrapper around bcryptjs for hashing and comparing passwords

const bcrypt = require('bcryptjs');
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

module.exports = {
  /**
   * Hash a plain-text password
   * @param {string} password
   * @returns {Promise<string>} hashed password
   */
  hashPassword: async password => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  },

  /**
   * Compare a plain-text password with a hash
   * @param {string} password
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  comparePassword: async (password, hash) => {
    return bcrypt.compare(password, hash);
  }
};
