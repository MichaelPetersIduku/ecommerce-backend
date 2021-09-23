/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const cors = require("cors");

const { connectMongo } = require("./@core/database/database.mongo");
const { googlesheetRouter } = require("./api/googlesheet/googlesheet.route");
const { productsRouter } = require("./api/products/products.route");

const app = express();

connectMongo();

app.set('port', process.env.PORT || 4321);

app.use(cors());

app.use("/api/v1/googlesheet", googlesheetRouter);

app.use("/api/v1/products", productsRouter);

app.get("/", (req, res) => {
  res.send({ message: "Welcome to Eze Warehouse API" });
});

app.listen(app.get('port'), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env'),
  );
  console.log('  Press CTRL-C to stop\n');
}).on('error', (err) => {
  console.log(err);

})
