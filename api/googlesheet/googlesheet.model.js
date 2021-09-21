const { Schema, model } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new Schema(
  {
    productName: String,
    size: String,
    price: String,
    condition: String,
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

const BuyRequest = model("BuyRequests", productSchema);
const SellRequest = model("SellRequests", productSchema);


module.exports = {
  BuyRequest,
  SellRequest
};
