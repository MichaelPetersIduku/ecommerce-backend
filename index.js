const express = require("express");
const app = express();
const { connectMongo } = require("./@core/database/database.mongo");
const { googlesheetRouter } = require("./api/googlesheet/googlesheet.route");

connectMongo();

app.set('port', process.env.PORT || 4321);

app.use("/api/v1/googlesheet", googlesheetRouter);

app.get("/", (req, res) => {
  res.send({ message: "Welcome to Eze Warehouse API" });
});

const server = app.listen(app.get('port'), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env'),
  );
  console.log('  Press CTRL-C to stop\n');
}).on('error', (err) => {
  console.log(err);

})
