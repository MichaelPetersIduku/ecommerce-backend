const { load } = require('secreta');
const env = process.argv[2] || 'production';
module.exports = load({ key: '1234567', environment: env });