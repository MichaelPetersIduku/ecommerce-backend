/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const mongoose = require("mongoose");
const { config } = require("secreta");
// import encrypt = require("mongoose-encryption")

const { MONGODB_URL } = config;

const connectMongo = () => {
  mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    autoIndex: false,
  });
};

const { connection } = mongoose;
connection.on('error', (error) => {
  console.log(`MongoDB database connection error: ${error}`);
  throw error;
});
// const encKey = "kZpVAjBTI2FU9HlRkp+f1I/Lz7FKA2alimUk5RRPyyM=";
// const sigKey = "xQT3Udu8xkn-_1r-bW0TqFy17336j6VUPYillNFRFl6z07ckkBprYl2TxEFTT1QxTW7WqAJnmvWt3_-qzUWMWA";
// mongoose.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey, encryptedFields: ['secret'] });

connection.once('open', function hasConnected() {
  console.log('MongoDB database connection opened successfully.');
});

module.exports = {
    connectMongo
}