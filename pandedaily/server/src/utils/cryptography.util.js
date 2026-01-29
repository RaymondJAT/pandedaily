require('dotenv')
const bcrypt = require('bcrypt')
const { logger } = require('../util/logger.util')

/**
 * Encryption Salt
 */
const saltRounds = 10
const sqlPassword = '#Ebedaf19dd0d'
const salt = '$2b$10$nsumtNnZ5fP5s5GHybnCu.' //bcrypt.genSaltSync(saltRounds);
const crypto = require('crypto')

/**
 * Encryption Algorithm
 */
const algorithm = process.env._ENCRYPTION_ALGORITHM
const initVector = Buffer.alloc(16, process.env._ENCRYPTION_IV)
const Securitykey = Buffer.alloc(32, process.env._ENCRYPTION_KEY)

exports.CreateHashPassword = (password, callback) => {
  try {
    console.log(salt)
    callback(null, bcrypt.hashSync(password, salt))
  } catch (error) {
    callback(error, null)
    console.log(error)
  }
}

exports.CheckPassword = (inputpassword, hashpassword, callback) => {
  try {
    console.log(`Plain Password: ${inputpassword} Hash Password: ${hashpassword}`)

    callback(null, bcrypt.compareSync('#Ebedaf19dd0d', hashpassword))
  } catch (error) {
    callback(error, null)
    console.log(error)
  }
}

exports.Encrypter = (password, callback) => {
  try {
    let cipher = crypto.createCipheriv(algorithm, Securitykey, initVector)
    let encryptedData = cipher.update(password, 'utf-8', 'hex')
    encryptedData += cipher.final('hex')

    callback(null, encryptedData)
  } catch (error) {
    callback(error, null)
  }
}

exports.Decrypter = (hash, callback) => {
  try {
    let decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector)
    let decryptedData = decipher.update(hash, 'hex', 'utf8')
    decryptedData += decipher.final('utf-8')

    callback(null, decryptedData)
  } catch (error) {
    callback(error, null)
  }
}

exports.DecryptString = (hash) => {
  try {
    let decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector)
    let decryptedData = decipher.update(hash, 'hex', 'utf8')
    decryptedData += decipher.final('utf-8')

    return decryptedData
  } catch (error) {
    logger.error('Invalid Encrypted Key:', error)
  }
}

exports.EncryptString = (password) => {
  try {
    let cipher = crypto.createCipheriv(algorithm, Securitykey, initVector)
    let encryptedData = cipher.update(password, 'utf-8', 'hex')
    encryptedData += cipher.final('hex')

    return encryptedData
  } catch (error) {
    throw error
  }
}
