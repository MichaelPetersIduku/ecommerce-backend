const express = require("express");
const app = express();
const { spreadsheetRouter } = require("./api/spreadsheet/spreadsheet.route");
const { dispatchRouter } = require("./api/dispatch/dispatch.route");
const { automatedEventRouter } = require("./api/AutomatedEvent/AutomatedEvent.route");
const { connectMongo } = require("./@core/database/database.mongo");

connectMongo();

app.set('port', process.env.PORT || 4321);

app.use("/api/v1/spreadsheet", spreadsheetRouter);

app.use("/api/v1/dispatch", dispatchRouter);

app.use("/api/v1/AutomatedEvent", automatedEventRouter);

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
