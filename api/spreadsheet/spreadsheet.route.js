const Router = require("express");
const { promisify } = require("util");
const GoogleSpreadsheet = require("google-spreadsheet");
const { v4: uuidv4 } = require("uuid");
const creds = require("../../@core/google-credentials/client_secret.json");
const { isAuthenticated, inputValidator } = require("../../util/middleware");
const {
  APPSHEET_BASEURL,
  WAREHOUSE_APPID,
  WAREHOUSE_ACCESSTOKEN,
  SPREADSHEET_DOC,
  SHIPMENT_API,
  SMCOREHEADERS,
} = require("../../@core/common/credentials");
const {
  getAllSpreadsheetDataSchema,
  deliveryActionSchema,
  returnSchema,
  financeRecoSchema,
  cancelReturnSchema,
} = require("./spreadsheet.validator");
const { logger } = require("firebase-functions");
const {
  apiCall,
  getRecordsAppSheet,
  updateRecordsAppSheet,
  addRecordsAppSheet,
} = require("../../@core/common/universal");

const headers = SMCOREHEADERS;
const spreadsheetRouter = Router();

spreadsheetRouter.get(
  "/",
  inputValidator({ query: getAllSpreadsheetDataSchema }),
  isAuthenticated,
  async (req, res) => {
    // res.send("Welcome to spreadsheet api v2");
    try {
      let { status, message, data } = await accessSpreadsheet(req);
      if (!status) res.status(400).send({ status: false, message, data });
      res.status(200).send({ status: true, message, data });
    } catch (error) {
      res
        .status(500)
        .send({ status: false, message: "Internal server error", data: error });
    }
  }
);

spreadsheetRouter.get("/driver", async (req, res) => {
  try {
    const selector = ``;
    logger.log(selector);
    const driverData = await getRecordsAppSheet("Driver", selector);
    return res
      .status(200)
      .json({ status: true, message: "Successful", data: driverData });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: "Internal server error", data: error });
  }
});

spreadsheetRouter.get("/das", async (req, res) => {
  try {
    const selector = ``;
    logger.log(selector);
    const dasData = await getRecordsAppSheet("Delivery Associate", selector);
    return res
      .status(200)
      .json({ status: true, message: "Successful", data: dasData });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: "Internal server error", data: error });
  }
});

spreadsheetRouter.post("/das", async (req, res) => {
  try {
    const { data } = req.body;
    let dataToPush = [];
    for (let row of data) {
      let batchNum = row["Related Delivery Batchs"].split(",")[0].trim();
      if (batchNum == "")
        batchNum = `IKJ-${new Date()
          .toISOString()
          .split("T")[0]
          .split("-")
          .join("")}-D-${row["_RowNumber"]}`;
      console.log(
        "))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))"
      );
      console.log(batchNum);
      dataToPush.push({
        _RowNumber: row["_RowNumber"],
        "Phone Number": row["Phone Number"],
        Email: row["Email"],
        "Driver Code": row["Code"],
        "First Name": row["First Name"],
        "Last Name": row["Last Name"],
        Company: row["Company"],
        "Warehouse Assignmnet Abbr": "IKJ",
        "Primary Warehouse": "ILUPEJU WAREHOUSE",
        "Alternative warehouse": "",
        "Free Pass": row["Free Pass"],
        "Given by": row["Given By"],
        "Delivery Batch Number": batchNum,
        Status: row["Status"],
        _BatchNumber: batchNum,
      });
    }
    const response = await addRecordsAppSheet("Delivery Associate", dataToPush);
    return res
      .status(200)
      .json({ status: true, message: "Successful", data: response });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: "Internal server error", data: error });
  }
});

spreadsheetRouter.post("/driver", async (req, res) => {
  try {
    const { data } = req.body;
    let dataToPush = [];
    for (let row of data) {
      let batchNum = row["Related Delivery Batchs"].split(",")[0].trim();
      if (batchNum == "")
        batchNum = `IKJ-${new Date()
          .toISOString()
          .split("T")[0]
          .split("-")
          .join("")}-D-${row["_RowNumber"]}`;
      console.log(
        "))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))"
      );
      console.log(batchNum);
      dataToPush.push({
        _RowNumber: row["_RowNumber"],
        "Phone Number": row["Phone Number"],
        Email: row["Email"],
        Code: row["Driver Code"].split("D-")[1],
        "First Name": row["First Name"],
        "Last Name": row["Last Name"],
        Company: row["Company"],
        "Warehouse Assignment Abbr": "IKJ",
        "Primary Warehouse": "ILUPEJU WAREHOUSE",
        "Free Pass": "Y",
        "Given by": row["Given By"],
        Status: row["Status"],
      });
    }
    const response = await addRecordsAppSheet("Driver", dataToPush);
    return res
      .status(200)
      .json({ status: true, message: "Successful", data: response });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: "Internal server error", data: error });
  }
});

spreadsheetRouter.get("/deliverySheet", isAuthenticated, async (req, res) => {
  try {
    let { status, message, data } = await accessDeliverySpreadsheet(req);
    if (!status) res.status(400).send({ status: false, message, data });
    res.status(200).send({ status: true, message, data });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: "Internal server error", data: error });
  }
});

spreadsheetRouter.get("/salesOrderSheet", isAuthenticated, async (req, res) => {
  try {
    let { status, message, data } = await accessSalesOrderSpreadsheetV2(req);
    if (!status) res.status(400).send({ status: false, message, data });
    res.status(200).send({ status: true, message, data });
  } catch (error) {
    res
      .status(500)
      .send({ status: false, message: "Internal server error", data: error });
  }
});

spreadsheetRouter.post(
  "/dispatchReconciliation",
  inputValidator({ body: deliveryActionSchema }),
  isAuthenticated,
  async (req, res) => {
    logger.log(req.body);
    let {
      deliveryStatus,
      deliveryBatchNumber,
      deliveries,
      deliveries2,
      deliveries3,
    } = req.body;
    if (deliveryStatus == "Fully Rejected") {
      deliveries = deliveries2;
    } else if (deliveryStatus == "Partially Delivered") {
      deliveries = deliveries3;
    }
    const { status, message, data } = await processLogReconciliation(
      deliveryStatus,
      deliveryBatchNumber,
      deliveries,
      req.body?.reason || ""
    );
    if (status) {
      res.status(200).json({ status, message, data });
    } else {
      res.status(400).json({ status, message, data });
    }
  }
);

spreadsheetRouter.post(
  "/financeReconciliation",
  inputValidator({ body: financeRecoSchema }),
  isAuthenticated,
  async (req, res) => {
    try {
      logger.log("FIN RECO FIN RECO");
      logger.log(JSON.stringify(req.body));
      let {
        deliveryBatchNumber,
        deliveryStatus,
        paymentType,
        deliveries,
        deliveries2,
        deliveries3,
        // amountPaid,
        // paymentMethod,
        // comments,
      } = req.body;
      const paymentMethod = req.body.paymentMethod || "";
      const paymentId = req.body.paymentId || "";
      const accountId = req.body.accountId || "";
      const accountName = req.body.accountName || "";
      const referenceNo = req.body.referenceNo || "";
      const comments = req.body.comments || "";
      const paymentDate = req.body.paymentDate || "";
      const createdAt = req.body.createdAt || "";
      const createdBy = req.body.createdBy || "";
      let response;
      if (paymentType == "Mixed") {
        deliveries = deliveries2;
      }
      switch (deliveryStatus) {
        case "Fully Delivered":
          response = await performFinanceRecoAction(
            deliveryBatchNumber,
            deliveryStatus,
            paymentType,
            deliveries,
            paymentMethod,
            paymentId,
            accountId,
            accountName,
            referenceNo,
            comments,
            paymentDate,
            createdAt,
            createdBy
          );
          break;
        case "Partially Delivered":
          if (paymentType == "Mixed" || paymentType == "Full") {
            deliveries = deliveries3;
          }
          response = await performFinanceRecoAction(
            deliveryBatchNumber,
            deliveryStatus,
            paymentType,
            deliveries,
            paymentMethod,
            paymentId,
            accountId,
            accountName,
            referenceNo,
            comments,
            paymentDate,
            createdAt,
            createdBy
          );
          break;
      }
      const { status, message, data } = response;
      if (status) {
        res.status(200).json({ status, message, data });
      } else {
        logger.error(response);
        res.status(400).json({ status, message, data });
      }
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json({ status: false, message: "Internal server error", data: error });
    }
  }
);

spreadsheetRouter.post(
  "/cancelReturn",
  inputValidator({ body: cancelReturnSchema }),
  isAuthenticated,
  async (req, res) => {
    logger.log(req.body);
    const {
      packageNo,
      packageId,
      deliveryBatchNumber,
      status,
      deliveryStatus,
    } = req.body;

    try {
      let { status: stat, message, data } = await processCancelReturnAction(
        packageNo,
        packageId,
        deliveryBatchNumber,
        status,
        deliveryStatus
      );
      if (stat) {
        res.status(200).json({ status: stat, message, data });
      } else {
        res.status(400).json({ status: stat, message, data });
      }
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: "Internal Server Error", data: error });
    }
  }
);

spreadsheetRouter.post(
  "/return",
  inputValidator({ body: returnSchema }),
  isAuthenticated,
  async (req, res) => {
    try {
      const {
        deliveryBatchNumber,
        returnCount,
        returnValue,
        packageNo,
        reason,
        deliveryStatus,
      } = req.body;
      let data;
      if (returnCount == "Complete") {
        data = await performCompleteReturnCountAction(
          deliveryBatchNumber,
          returnCount,
          returnValue,
          packageNo,
          reason,
          deliveryStatus
        );
      } else if (returnCount == "Incomplete") {
        data = await performIncompleteReturnCountAction(
          deliveryBatchNumber,
          returnCount,
          returnValue,
          packageNo,
          reason,
          deliveryStatus
        );
      }
      res.status(200).json({ status: true, message: "Successful", data });
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: "Internal Server Error", data: error });
    }
  }
);

spreadsheetRouter.post("/customer", async (req, res) => {
  res.json({ message: "successful" });
});

const processCancelReturnAction = async (
  packageNo,
  packageId,
  deliveryBatchNumber,
  status,
  deliveryStatus
) => {
  try {
  // const deliverySheetNo = 4;
  // const query = `packageno = ${packageNo}`;
  // const offset = 1;
  // const sheetData = await getSpreadSheetData(deliverySheetNo, query, offset);
  const selector = `Filter(Delivery, [PackageNo] = '${packageNo}')`;
  logger.log(selector);
  const deliveryRows = await getRecordsAppSheet("Delivery", selector);
  // deliveryRows.forEach((row) => {
  let deliveryRowsToUpdate = [];
  for (let row of deliveryRows) {
    if (deliveryStatus == "Fully Rejected") {
      row["Last Attempt Driver"] = row["Current Driver"];
      row["Last Batch Number"] = row["Delivery Batch"];
      row["Last Ship Date"] = row["Tag date"];
      row.status = "Fully Rejected";
      row["Log Reco Status"] = "Log Reco Closed";
      row["Last Batch Number"] = row["Delivery Batch"];
      row["Delivery Batch"] = "";
      row["Current Driver"] = "";
    } else {
      row.status = "Log Reco Closed";
      row["Log Reco Status"] = "Log Reco Closed";
    }
    delete row["SMId"];
    delete row["Delivery Batch"];
    delete row["PackageDate"];
    deliveryRowsToUpdate.push(row);
  }

  const rsp = await updateRecordsAppSheet("Delivery", deliveryRowsToUpdate);
  logger.log("UPDATE RESPONSE", rsp);

  const slctr = `Filter(Delivery Batch, [Delivery Batch Number] = '${deliveryBatchNumber}')`;
  logger.log(slctr);
  const rows = await getRecordsAppSheet("Delivery Batch", slctr);
  let deliveryBatchRowsToUpdate = [];
  // rows.forEach(async (row) => {
  for (let row of rows) {
    const selector = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
    logger.log(selector);
    const sdata = await getRecordsAppSheet("Delivery", selector);
    logger.log(
      ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
    );
    let dRows = sdata;
    let drows = [];
    dRows.forEach((row) => {
      if (row.status != "Fully Rejected") {
        drows.push(row.status);
      }
    });
    logger.log(drows);
    logger.log(
      ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
    );
    row["Log Reco Status"] = hasSameStatus(drows, "Log Reco Closed")
      ? "Log Reco Closed"
      : "Log Reco Ongoing";
    row.Status = hasSameStatus(drows, "Log Reco Closed")
      ? "Log Reco Closed"
      : "Log Reco Ongoing";
    delete row["SMId"];
    delete row["Id"];
    deliveryBatchRowsToUpdate.push(row);
  }
  const rspnse = await updateRecordsAppSheet(
    "Delivery Batch",
    deliveryBatchRowsToUpdate
  );
  logger.log("Delivery Batch UPDATE RESPONSE", rspnse);
  const returnRowsToUpdate = [
    {
      PackageNo: packageNo,
      Status: status,
    },
  ];
  const returnResp = await updateRecordsAppSheet("Returns", returnRowsToUpdate);
  logger.log("UPDATED RETURN ROWS", returnResp);
  return { status: true, message: "Successful", data: rspnse };
} catch(error) {
  logger.error(error);
  return {status: false, message: error.message, data: error};
}
};

const performFinanceRecoAction = async (
  deliveryBatchNumber,
  deliveryStatus,
  paymentType,
  deliveries,
  paymentMethod,
  paymentId,
  accountId,
  accountName,
  referenceNo,
  description,
  paymentDate,
  createdAt,
  createdBy
) => {
  try {
    const selector = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
    const deliveryRows = await getRecordsAppSheet("Delivery", selector);
    logger.log("Deliveries", deliveries);
    let ordersx = deliveries.trim().split(",");
    logger.log("ORDERS", ordersx);
    let orders = [];
    let amountToPay = [];
    ordersx.forEach((order) => {
      let amount = order.split(" |")[3].trim();
      order = order.split(" |")[0].trim();
      logger.log(order);
      orders.push(order);
      amountToPay.push({
        packageNo: order,
        amount,
      });
    });
    logger.log("ORDERS", orders);
    // deliveryRows.forEach(async (row) => {
    let deliveryRowsToUpdate = [];
    for (let row of deliveryRows) {
      logger.log("-)_)_)_)_)_)_)_)_)_)_)_)_)_)_)_)");
      logger.log(orders, row.PackageNo);
      if (orders.includes(row.PackageNo)) {
        const selector = `Filter(Payments, [Package No] = '${row.PackageNo}')`;
        const paymentRows = await getRecordsAppSheet("Payments", selector);
        logger.log("ALL PAYMENTS");
        logger.log(JSON.stringify(paymentRows));
        let totalPaymentMade = 0;
        let paymentMethods = "";
        let comments = "";
        let customerPayments = [];
        paymentRows.forEach((payment) => {
          totalPaymentMade = totalPaymentMade + Number(payment["Amount Paid"]);
          paymentMethods = paymentMethods.concat(
            `${payment["Payment Method"]}(${payment["Amount Paid"]}), `
          );
          comments = comments.concat(` ${payment.Comments}, `);
          customerPayments.push({
            PackageID: row.PackageId,
            PackageNo: row.PackageNo,
            PaymentMode: payment["Payment Method"]
              .toString()
              .toLowerCase()
              .replace(/\s/g, ""),
            PaymentID: payment["Payment Id"],
            Amount: Number(payment["Amount Paid"]),
            PaymentDate: new Date(payment["Payment Date"]).toISOString().split('T')[0],
            ReferenceNo: payment["Reference Number"],
            Description: payment["Comments"],
            AccountId: accountId,
            AccountName: accountName,
            AccountType:
              paymentMethod == "CASH"
                ? paymentMethod.toLowerCase()
                : "bank transfer",
          });
        });

        let totalAmountToPay = amountToPay.find(
          (order) => order.packageNo == row.PackageNo
        ).amount;
        logger.log("PAYMENT DATA");
        logger.log(totalPaymentMade, paymentMethods, totalAmountToPay);
        const amountDifference = totalAmountToPay - totalPaymentMade;
        logger.log("AMOUNT DIFFERENCE", row.PackageNo);
        logger.log(amountDifference);
        row["Amount Difference"] = paymentType == "Full" ? 0 : amountDifference;
        row["Total Amount Paid"] =
          paymentType == "Full" ? totalAmountToPay : totalPaymentMade;
        row["Payment Method"] =
          paymentType == "Full"
            ? `${row["Payment Method"]} (${totalAmountToPay}),`
            : `${row["Payment Method"]} ${paymentMethods}`;
        logger.log("PAYMENT METHOD", row["Payment Method"]);
        row.Comment = comments;
        if (paymentType == "Full") {
          row.status = "Fin Reco Closed";
          row["Fin Reco Status"] = row.status;
        } else {
          row.status =
            amountDifference == 0 ? "Fin Reco Closed" : "Log Reco Closed";
          row["Fin Reco Status"] =
            amountDifference == 0 ? row.status : "Fin Reco Ongoing";
        }
        let uniquePaymentId = uuidv4();
        if (customerPayments.length == 0 && paymentType == "Full") {
          customerPayments.push({
            PackageID: row.PackageId,
            PackageNo: row.PackageNo,
            PaymentMode: paymentMethod
              .toString()
              .toLowerCase()
              .replace(/\s/g, ""),
            PaymentID: uniquePaymentId,
            Amount: Number(totalAmountToPay),
            PaymentDate: new Date(paymentDate).toISOString().split('T')[0],
            ReferenceNo: referenceNo,
            Description: description,
            AccountId: accountId,
            AccountName: accountName,
            AccountType:
              paymentMethod == "CASH" ? paymentMethod.toLowerCase() : "bank",
          });
        }

        //Call SMCore to make payment only if paymentType is Full
        logger.log("CUSTOMER PAYMENTS", customerPayments);
        if (paymentType == "Full") {
          if (paymentMethod == "CASH" || paymentMethod == "BANK TRANSFER") {
            makePaymentSMCore(customerPayments);
          }
          const rowsToAdd = [
            {
              Id: new Date()
                .toISOString()
                .split("T")
                .join("")
                .split("-")
                .join("")
                .split(":")
                .join("")
                .split(".")
                .join(""),
              "Payment Method": paymentMethod,
              "Amount Paid": totalAmountToPay,
              Comments: description + ".",
              "Delivery Batch Number": deliveryBatchNumber,
              "Package No": row.PackageNo,
              Key: new Date().toISOString(),
              Ref_Id: new Date().toISOString(),
              "Reference Number": referenceNo,
              "Payment Date": new Date(paymentDate).toISOString().split('T')[0],
              "Payment Id": uniquePaymentId,
              "Account Id": accountId,
              "Account Name": accountName,
              "Reference No": referenceNo,
              "Payment Type": paymentType,
              "created_at": createdAt,
              "created_by": createdBy
            },
          ];
          
          //check if payment already exists for this package
          if (paymentRows.length == 0) {
            const response = await addRecordsAppSheet("Payments", rowsToAdd);
            console.log(response);
            }
            
        }

        logger.log("///////////////////////////////////////////");
        logger.log(
          row["Total Amount Paid"],
          row["Amount Difference"],
          row.status,
          totalAmountToPay
        );
        logger.log("////////////////////////////////////////////");
        row["Payment Method"] = paymentMethod;
        row["Payment Type"] = paymentType;
        delete row["SMId"];
        delete row["Delivery Batch"];
        delete row["PackageDate"];
        deliveryRowsToUpdate.push(row);
      } else {
        logger.log("+______+______+_______+");
      }
    }
    const rsp = await updateRecordsAppSheet("Delivery", deliveryRowsToUpdate);
    logger.log("UPDATE RESPONSE", rsp);

    const slctr = `Filter(Delivery Batch, [Delivery Batch Number] = '${deliveryBatchNumber}')`;
    const rows = await getRecordsAppSheet("Delivery Batch", slctr);
    // rows.forEach(async (row) => {
    let deliveryBatchRowsToUpdate = [];
    // rows.forEach(async (row) => {
    for (let row of rows) {
      const selectr = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
      const sdata = await getRecordsAppSheet("Delivery", selectr);
      logger.log(
        ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
      );
      let dRows = sdata;
      let drows = [];
      dRows.forEach((row) => {
        if (row.status != "Fully Rejected") {
          drows.push(row.status);
        }
      });
      logger.log(drows);
      logger.log(
        ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
      );
      row["Fin Reco Status"] = hasSameStatus(drows, "Fin Reco Closed")
        ? "Fin Reco Closed"
        : "Fin Reco Ongoing";
      logger.log("Delivery Rows Length", dRows.length);
      logger.log("Order Rows Length", orders.length);
      row.Status = hasSameStatus(drows, "Fin Reco Closed")
        ? "Fin Reco Closed"
        : "Fin Reco Ongoing";
      delete row["SMId"];
      delete row["Id"];
      deliveryBatchRowsToUpdate.push(row);
      // row.save();
    }
    const rspnse = await updateRecordsAppSheet(
      "Delivery Batch",
      deliveryBatchRowsToUpdate
    );
    logger.log("Delivery Batch UPDATE RESPONSE", rspnse);
    return {
      status: true,
      message: "Successful",
      data: { deliveryRows, deliveryBatchRows: rows },
    };
  } catch (error) {
    logger.error(error);
    return { status: false, message: "Failed to execute", data: error };
  }
};

const hasSameStatus = (deliveryRows, status) => {
  // Put all array elements in a HashSet
  let s = new Set(deliveryRows);
  // If all elements are same, size of
  // HashSet should be 1. As HashSet contains only distinct values.
  logger.log("SIZE: ", s.size);
  return (s.size == 1 && deliveryRows[0] == status) || s.size == 0;
};

const performCompleteReturnCountAction = async (
  deliveryBatchNumber,
  returnCount,
  returnValue,
  packageNo,
  reason,
  dStatus
) => {
  try {
    logger.log("::::::::'''''::::::");
    logger.log(
      packageNo,
      deliveryBatchNumber,
      returnCount,
      returnValue,
      dStatus
    );
    // const deliverySheetNo = 4;
    // const query = `deliverybatch = ${deliveryBatchNumber}`;
    // const offset = 1;
    // const sheetData = await getSpreadSheetData(deliverySheetNo, query, offset);
    const selector = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
    logger.log(selector);
    const deliveryRows = await getRecordsAppSheet("Delivery", selector);
    let tagDate = "";
    let data = [];
    let orders = packageNo.trim().split(",");
    orders = orders.filter((order) => {
      order.trim();
      return true;
    });
    let packageId;
    let deliveryStatus = dStatus;
    // deliveryRows.forEach(async (row) => {
    let deliveryRowsToUpdate = [];
    for (let row of deliveryRows) {
      logger.log("{{{{{{{{{{{}}}}}}}}}}}}}");
      logger.log(orders, row.PackageNo);
      if (orders.includes(row.PackageNo)) {
        logger.log("+++++++++++_+++++++++++_+++++++++++");
        row["Last Attempt Driver"] = row["Current Driver"];
        row["Last Batch Number"] = row["Delivery Batch"];
        row["Last Ship Date"] = row["Tag date"];
        row["Attempt Count"] =
          row["Attempt Count"] == "" ? 1 : Number(row["Attempt Count"]) + 1;
        if (deliveryStatus != "Fully Rejected") {
          row.status = "Log Reco Closed";
        } else {
          row.status = "Fully Rejected";
          row["Delivery Batch"] = "";
        }
        row["Log Reco Status"] = "Log Reco Closed";
        tagDate = row["Tag date"];
        packageId = row.Id;
        delete row["SMId"];
        delete row["Delivery Batch"];
        delete row["PackageDate"];
        deliveryRowsToUpdate.push(row);
        data.push(row);
      } else {
        logger.log("______+_______+______+______");
      }
    }
    const rsp = await updateRecordsAppSheet("Delivery", deliveryRowsToUpdate);
    logger.log("UPDATE RESPONSE", rsp);
    const slctr = `Filter(Delivery Batch, [Delivery Batch Number] = '${deliveryBatchNumber}')`;
    logger.log(slctr);
    const rows = await getRecordsAppSheet("Delivery Batch", slctr);
    // rows.forEach(async (row) => {
    let deliveryBatchRowsToUpdate = [];
    for (let row of rows) {
      row["Last Attempt Driver"] = row["Driver"];
      row["Last Attempt DAS"] = row["DAS"];
      row["Last Batch Number"] = row["Delivery Batch Number"];
      row["Last Ship Date"] = tagDate;
      const selectr = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
      logger.log(selectr);
      const sdata = await getRecordsAppSheet("Delivery", selectr);
      logger.log(
        ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
      );
      let dRows = sdata;
      let drows = [];
      dRows.forEach((row) => {
        if (row.status != "Fully Rejected") {
          drows.push(row.status);
        }
      });
      logger.log(drows);
      logger.log(
        ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
      );
      row["Log Reco Status"] = hasSameStatus(drows, "Log Reco Closed")
        ? "Log Reco Closed"
        : "Log Reco Ongoing";
      row.Status = hasSameStatus(drows, "Log Reco Closed")
        ? "Log Reco Closed"
        : "Log Reco Ongoing";
      delete row["SMId"];
      delete row["Id"];
      deliveryBatchRowsToUpdate.push(row);
    }

    const rspnse = await updateRecordsAppSheet(
      "Delivery Batch",
      deliveryBatchRowsToUpdate
    );
    logger.log("Delivery Batch UPDATE RESPONSE", rspnse);

    const Id = Math.floor(100000 + Math.random() * 900000);
    await addReturn(
      Id,
      packageNo,
      packageId,
      "Closed",
      returnCount,
      returnValue,
      reason,
      deliveryBatchNumber,
      deliveryStatus
    );
    const response =
      deliveryStatus == "Partially Delivered"
        ? await returnItemsSMCore(packageId, packageNo, reason)
        // : await rejectItemsSMCore(deliveryBatchNumber, orders);
        : logger.log("ALREADY REJECTED");
    logger.log(response);
    return response;
  } catch (error) {
    return error;
  }
};

const performIncompleteReturnCountAction = async (
  deliveryBatchNumber,
  returnCount,
  returnValue,
  packageNo,
  reason,
  dStatus
) => {
  try {
  // const deliverySheetNo = 4;
  // const query = `deliverybatch = ${deliveryBatchNumber}`;
  // const offset = 1;
  // const sheetData = await getSpreadSheetData(deliverySheetNo, query, offset);
  const selector = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
  logger.log(selector);
  const deliveryRows = await getRecordsAppSheet("Delivery", selector);
  let tagDate = "";
  let data = [];
  let orders = packageNo.trim().split(",");
  orders = orders.filter((order) => {
    order.trim();
    return true;
  });
  let packageId;
  let deliveryStatus = dStatus;
  // deliveryRows.forEach(async (row) => {
  let deliveryRowsToUpdate = [];
  for (let row of deliveryRows) {
    if (orders.includes(row.PackageNo)) {
      row["Last Attempt Driver"] = row["Current Driver"];
      row["Last Batch Number"] = row["Delivery Batch"];
      row["Last Ship Date"] = row["Tag date"];
      row["Attempt Count"] =
        row["Attempt Count"] == "" ? 1 : Number(row["Attempt Count"]) + 1;
      row.status = "Log Reco Ongoing";
      row["Log Reco Status"] = "Log Reco Ongoing";
      tagDate = row["Tag date"];
      packageId = row.Id;
      // row.save();
      delete row["SMId"];
      delete row["Delivery Batch"];
      delete row["PackageDate"];
      deliveryRowsToUpdate.push(row);
      data.push(row);
    } else {
      logger.log("______+_______+______+______");
    }
  }
  const rsp = await updateRecordsAppSheet("Delivery", deliveryRowsToUpdate);
  logger.log("UPDATE RESPONSE", rsp);
  const slctr = `Filter(Delivery Batch, [Delivery Batch Number] = '${deliveryBatchNumber}')`;
  logger.log(slctr);
  const rows = await getRecordsAppSheet("Delivery Batch", slctr);
  // rows.forEach(async (row) => {
  let deliveryBatchRowsToUpdate = [];
  for (let row of rows) {
    row["Last Attempt Driver"] = row["Driver"];
    row["Last Attempt DAS"] = row["DAS"];
    row["Last Batch Number"] = row["Delivery Batch Number"];
    row["Last Ship Date"] = tagDate;
    const selectr = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
    const sdata = await getRecordsAppSheet("Delivery", selectr);
    logger.log(
      ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
    );
    let dRows = sdata;
    let drows = [];
    dRows.forEach((row) => {
      if (row.status != "Fully Rejected") {
        drows.push(row.status);
      }
    });
    logger.log(drows);
    logger.log(
      ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
    );
    row["Log Reco Status"] = hasSameStatus(drows, "Log Reco Closed")
      ? "Log Reco Closed"
      : "Log Reco Ongoing";
    logger.log("Delivery Rows Length", dRows.length);
    logger.log("Order Rows Length", orders.length);
    row.Status = hasSameStatus(drows, "Log Reco Closed")
      ? "Log Reco Closed"
      : "Log Reco Ongoing";
    delete row["SMId"];
    delete row["Id"];
    deliveryBatchRowsToUpdate.push(row);
    // row.save();
  }
  const rspnse = await updateRecordsAppSheet(
    "Delivery Batch",
    deliveryBatchRowsToUpdate
  );
  logger.log("Delivery Batch UPDATE RESPONSE", rspnse);
  const Id = Math.floor(100000 + Math.random() * 900000);
  await addReturn(
    Id,
    packageNo,
    packageId,
    "Open",
    returnCount,
    returnValue,
    reason,
    deliveryBatchNumber,
    deliveryStatus
  );
  // const response = await returnItemsSMCore(packageId, reason);
  return rspnse;
  } catch(error) {
    logger.error(error);
    return error;
  }
};

const returnItemsSMCore = async (packageId, packageNo, reason) => {
  logger.log("RETURNING ITEMS", packageId);
  try {
    const slctr = `Filter(Delivery Item, [PackageID] = '${packageId}')`;
    const itemRows = await getRecordsAppSheet("Delivery Item", slctr);
    let packageItems = [];
    itemRows.forEach((row) => {
      packageItems.push({
        ItemID: row.ItemID,
        Sku: row.Sku,
        Name: row.Name,
        Price: Number(row.Price),
        QuantityReturned: Number(row.temp),
        QuantityPacked: Number(row.Quantity),
      });
    });

    //call SMCore API to return shipment
    const shipments = {
      Reason: reason,
      ShipmentsToReturn: [
        {
          PackageID: packageId,
          PackageNo: packageNo,
          PackageItems: packageItems,
        },
      ],
    };
    let url = `${SHIPMENT_API}/ReturnShipment`;
    const response = await apiCall(url, shipments, headers, "POST");
    logger.log(response);
    // const responseJson = await response.json();
    // logger.log(responseJson);
    return response;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const rejectItemsSMCore = async (deliveryBatchNumber, orders) => {
  logger.log("REJECTING ITEMS", orders);
  const selector = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
  logger.log(selector);
  const deliveryRows = await getRecordsAppSheet("Delivery", selector);
  let data = [];
  let shipmentsToReject = [];
  // deliveryRows.forEach(async (row) => {
  for (let row of deliveryRows) {
    logger.log(row.PackageNo, orders);
    if (orders.includes(row.PackageNo)) {
      shipmentsToReject.push({
        PackageID: row.Id,
        PackageNo: row.PackageNo,
      });
      data.push(row);
    } else {
      logger.log("______+_______+______+______");
    }
  }
  logger.log("SHIPMENTSTOREJECT", shipmentsToReject);

  // Call SMCore API to Reject package
  const shipments = {
    ShipmentsToReject: shipmentsToReject,
  };
  logger.log(shipments);
  let url = `${SHIPMENT_API}/RejectShipment`;
  const response = await apiCall(url, shipments, headers, "POST");
  logger.log(response);
  // const responseJson = await response.json();
  // logger.log(responseJson);
  return data;
};

const makePaymentSMCore = async (customerPayments) => {
  // Call SMCore API to Reject package
  const payment = {
    CustomerPayments: customerPayments,
  };
  logger.log(payment);
  let url = `${SHIPMENT_API}/MakePayment`;
  const response = await apiCall(url, payment, headers, "POST");
  logger.log(response);
};

const processLogReconciliation = async (
  deliveryStatus,
  deliveryBatchNumber,
  deliveries,
  reason
) => {
  try {
    const selector = `Filter(Delivery Batch, [Delivery Batch Number] = '${deliveryBatchNumber}')`;
    logger.log(selector);
    const records = await getRecordsAppSheet("Delivery Batch", selector);
    const rows = records;

    logger.log("///////////////////////////", rows);

    logger.log("Deliveries", deliveries);
    let ordersx = deliveries.trim().split(",");
    logger.log("ORDERS", ordersx);
    let orders = [];
    let package_ids = [];
    ordersx.forEach((order) => {
      let id = order.split(" |")[4].trim();
      order = order.split(" |")[0].trim();
      logger.log(order);
      orders.push(order);
      package_ids.push(id);
    });
    logger.log(orders);
    if (deliveryStatus == "Reschedule") {
      data = await performRescheduleAction(rows, deliveryBatchNumber, orders);
    } else if (deliveryStatus == "Fully Delivered") {
      data = await performFullyDeliveredAction(
        rows,
        deliveryBatchNumber,
        orders
      );
    } else if (
      deliveryStatus == "Fully Rejected" ||
      deliveryStatus == "Partially Delivered"
    ) {
      data = await performReturnAction(
        rows,
        deliveryBatchNumber,
        orders,
        package_ids,
        reason,
        deliveryStatus
      );
    }
    return { status: true, message: "Query Successful", data };
  } catch (error) {
    logger.error(error);
    return { status: false, message: "Internal server error", data: error };
  }
};

const performReturnAction = async (
  rows,
  deliveryBatchNumber,
  orders,
  package_ids,
  reason,
  deliveryStatus
) => {
  try {
  let tagDate = "";
  let data = [];
  let shipmentsToReject = [];

  const selector = ``;
  logger.log(selector);
  const records = await getRecordsAppSheet("Delivery", selector);
  const deliveryRows = [];

  for (record of records) {
    if (record["Delivery Batch"] == deliveryBatchNumber) {
      deliveryRows.push(record);
    }
  }

  let rowsToUpdate = [];
  for (let row of deliveryRows) {
    logger.log(row.PackageNo, orders);
    if (orders.includes(row.PackageNo)) {
      tagDate = row["Tag date"];
      rowsToUpdate.push({
        "Last Attempt Driver": row["Current Driver"],
        "Last Batch Number": row["Delivery Batch"],
        "Last Ship Date": row["Tag date"],
        status: "Log Reco Ongoing",
        "Log Reco Status": "Log Reco Ongoing",
        Id: row["Id"],
        "Delivery Status": deliveryStatus,
      });

      const Id = Math.floor(100000 + Math.random() * 900000);
      shipmentsToReject.push({
        PackageID: row["Id"],
        PackageNo: row["PackageNo"],
      });

      await addReturn(
        Id,
        row["PackageNo"],
        row["Id"],
        "Open",
        "",
        "",
        reason,
        row["Delivery Batch"],
        deliveryStatus
      );
    } else {
      logger.log("______+_______+______+______");
    }
  }
  const updatedRecords = await updateRecordsAppSheet("Delivery", rowsToUpdate);
  data = updatedRecords;
  const deliveryBatchRowsToUpdate = [];
  for (let row of rows) {
    row["Last Attempt Driver"] = row["Driver"];
    row["Last Attempt DAS"] = row["DAS"];
    row["Last Batch Number"] = row["Delivery Batch Number"];
    row["Last Ship Date"] = tagDate;
    logger.log("Delivery Rows Length", deliveryRows.length);
    logger.log("Order Rows Length", orders.length);

    const selctr = ``;
    logger.log(selctr);
    const updatedRecords = await getRecordsAppSheet("Delivery", selctr);
    const dlvryRows = [];

    for (let record of updatedRecords) {
      if (record["Delivery Batch"] == deliveryBatchNumber) {
        dlvryRows.push(record);
      }
    }
    logger.log(
      ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
    );
    let dRows = dlvryRows;
    let drows = [];
    dRows.forEach((row) => {
      if (row.status != "Fully Rejected") {
        drows.push(row.status);
      }
    });
    logger.log(drows);
    logger.log(
      ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
    );
    row.Status = hasSameStatus(drows, "Log Reco Closed")
      ? "Log Reco Closed"
      : "Log Reco Ongoing";
    row["Log Reco Status"] = row.Status;
    delete row["SMId"];
    delete row["Id"];
    deliveryBatchRowsToUpdate.push(row);
  }

  const rsp = await updateRecordsAppSheet(
    "Delivery Batch",
    deliveryBatchRowsToUpdate
  );
  logger.log(
    "********************Update Delivery Batch********************************"
  );
  logger.log(rsp);

  if (deliveryStatus == "Fully Rejected") {
    //Automatically add items returned for fully rejected orders
    let packageId = shipmentsToReject[0].PackageID;
    logger.log("PACKAGEID: ", packageId);
    const filter = `Filter('Delivery Item', [PackageID] = '${packageId}')`;
    const rows = await getRecordsAppSheet("Delivery Item", filter);
    const itemRows = rows;

    // Update items returned
    let itemRowsToUpdate = [];
    for (let item of itemRows) {
      item.temp = item.Quantity;
      logger.log(item.Name, item.Quantity, item.Temp);
      delete item["SMId"];
      itemRowsToUpdate.push(item);
    }
    const rsp = await updateRecordsAppSheet("Delivery Item", itemRowsToUpdate);
    logger.log("*******************Fully Rejected*************************");
    logger.log(rsp);
  
    // Call SMCore API to Reject package
    const shipments = {
      ShipmentsToReject: shipmentsToReject,
    };
    logger.log(shipments);
    let url = `${SHIPMENT_API}/RejectShipment`;
    const response = await apiCall(url, shipments, headers, "POST");
    logger.log(response);
    // const responseJson = await response.json();
    // logger.log(responseJson);
  }
  return data;
  } catch (error) {
    logger.error(error);
    return error;
  }
};

const addReturn = async (
  Id,
  PackageNo,
  PackageId,
  Status,
  ReturnCount,
  ReturnValue,
  Reason,
  DeliveryBatchNumber,
  DeliveryStatus
) => {
  logger.log(
    "{}|||||||||||||||||||||||||||||||||||||||}}",
    PackageId,
    ReturnCount,
    ReturnValue
  );
  const selector = `Filter(Returns, [PackageNo] = '${PackageNo}')`;
  const rows = await getRecordsAppSheet("Returns", selector);
  logger.log(
    "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%"
  );
  logger.log(rows);
  if (rows.length > 0) {
    //Update Return package
    const rowsToUpdate = [
      {
        Id,
        PackageNo,
        PackageId,
        Status,
        "Return Count": ReturnCount,
        "Return Value": ReturnValue,
        Reason,
        "Delivery Batch Number": DeliveryBatchNumber,
        "Delivery Status": DeliveryStatus,
      },
    ];
    const response = await updateRecordsAppSheet("Returns", rowsToUpdate);
    logger.log("********************Update********************************");
    logger.log(response);
  } else {
    //Add new Return Package
    const rowsToAdd = [
      {
        Id,
        PackageNo,
        PackageId,
        Status,
        "Return Count": ReturnCount,
        "Return Value": ReturnValue,
        Reason,
        "Delivery Batch Number": DeliveryBatchNumber,
        "Delivery Status": DeliveryStatus,
      },
    ];
    const response = await addRecordsAppSheet("Returns", rowsToAdd);
    logger.log("*****************************************************");
    logger.log(response);
  }
};

const performFullyDeliveredAction = async (
  rows,
  deliveryBatchNumber,
  orders
) => {
  try {
  let tagDate = "";
  let data = [];
  let shipmentsToDeliver = [];
  const selector = `Filter(Delivery, AND([Delivery Batch] = '${deliveryBatchNumber}', [status] = 'Shipped'))`;
  let deliveryRows = await getRecordsAppSheet("Delivery", selector);
  logger.log(
    "FULLYDELIVEREDFULLYDELIVEREDFULLYDELIVEREDFULLYDELIVEREDFULLYDELIVEREDFULLYDELIVEREDFULLYDELIVERED"
  );

  let deliveryRowsToUpdate = [];
  for (let row of deliveryRows) {
    logger.log(row.PackageNo, orders);
    if (orders.includes(row.PackageNo)) {
      row["Last Attempt Driver"] = row["Current Driver"];
      // row.lastattemptdas = row.das;
      row["Last Batch Number"] = row["Delivery Batch"];
      row["Last Ship Date"] = row["Tag date"];
      row.status = "Log Reco Closed";
      row["Log Reco Status"] = "Log Reco Closed";
      row["Delivery Status"] = "Fully Delivered";
      tagDate = row.tagdate;
      shipmentsToDeliver.push({
        PackageID: row.Id,
        PackageNo: row.PackageNo,
      });
      delete row["SMId"];
      delete row["Delivery Batch"];
      delete row["PackageDate"];
      deliveryRowsToUpdate.push(row);
      data.push(row);
    } else {
      logger.log("______+_______+______+______");
    }
  }
  const response = await updateRecordsAppSheet(
    "Delivery",
    deliveryRowsToUpdate
  );
  logger.log(
    "*****************Fully Delivered Update****************************"
  );
  logger.log(response);
  // rows.forEach(async (row) => {
  let deliveryBatchRowsToUpdate = [];
  for (let row of rows) {
    row["Last Attempt Driver"] = row["Driver"];
    row["Last Attempt DAS"] = row["DAS"];
    row["Last Batch Number"] = row["Delivery Batch Number"];
    row["Last Ship Date"] = tagDate;
    logger.log("Delivery Rows Length", deliveryRows.length);
    logger.log("Order Rows Length", orders.length);
    const slctr = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
    logger.log(slctr);
    let sData = await getRecordsAppSheet("Delivery", slctr);
    logger.log(
      ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
    );
    let dRows = sData;
    let drows = [];
    dRows.forEach((row) => {
      if (row.status != "Fully Rejected") {
        drows.push(row.status);
      }
    });
    logger.log(drows);
    logger.log(
      ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
    );
    row["Status"] = hasSameStatus(drows, "Log Reco Closed")
      ? "Log Reco Closed"
      : "Log Reco Ongoing";
    row["Log Reco Status"] = row["Status"];
    delete row["SMId"];
    delete row["Id"];
    deliveryBatchRowsToUpdate.push(row);
  }
  const resp = await updateRecordsAppSheet(
    "Delivery Batch",
    deliveryBatchRowsToUpdate
  );
  logger.log(
    "*****************Delivery Batch Update****************************"
  );
  logger.log(resp);

  //call SMCore API to deliver shipment
  const shipments = {
    ShipmentsToDeliver: shipmentsToDeliver,
  };
  logger.log(shipments);
  let url = `${SHIPMENT_API}/DeliverShipment`;
  const SMCORERESPONSE = await apiCall(url, shipments, headers, "POST");
  logger.log(SMCORERESPONSE);
  // const responseJson = await response.json();
  // logger.log(responseJson);
  return SMCORERESPONSE;
} catch (error) {
  logger.error(error);
  return error;
}
};

const performRescheduleAction = async (rows, deliveryBatchNumber, orders) => {
  try {
    let tagDate = "";
    let data = [];
    let shipmentsToDelete = [];

    const selector = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
    const deliveryRows = await getRecordsAppSheet("Delivery", selector);
    logger.log(
      "RESCHEDULERESCHEDULERESCHEDULERESCHEDULERESCHEDULERESCHEDULERESCHEDULERESCHEDULERESCHEDULERESCHEDULERESCHEDULE"
    );
    // deliveryRows.forEach((row) => {
    let deliveryRowsToUpdate = [];
    for (let row of deliveryRows) {
      logger.log("ORDERS", orders);
      if (orders.includes(row.PackageNo)) {
        row["Last Attempt Driver"] = row["Current Driver"];
        row["First Attempt Driver"] =
          row["First Attempt Driver"] == ""
            ? row["Current Driver"]
            : row["First Attempt Driver"];
        row["First Attempt Date"] =
          row["First Attempt Date"] == ""
            ? new Date(new Date().setHours(new Date().getHours() + 1))
            : row["First Attempt Date"];
        // row.lastattemptdas = row.das;
        row["Last Batch Number"] = row["Delivery Batch"];
        row["Last Ship Date"] = row["Tag date"];
        row["Log Reco Status"] = "Rescheduled";
        row["Attempt Count"] =
          row["Attempt Count"] == "" ? 1 : Number(row["Attempt Count"]) + 1;
        tagDate = row["Tag date"];
        row["status"] = "Ready for Loading";
        row["Current Driver"] = "";
        row["Tag date"] = "";
        row["Delivery Batch"] = "";
        row["Delivery Status"] = "Reschedule";
        shipmentsToDelete.push({
          PackageID: row.Id,
          PackageNo: row.PackageNo,
        });
        delete row["SMId"];
        delete row["PackageDate"];
        deliveryRowsToUpdate.push(row);
        data.push(row);
      } else {
        logger.log("______+_______+______+______");
      }
    }
    const resp = await updateRecordsAppSheet("Delivery", deliveryRowsToUpdate);
    logger.log(
      "*****************Reschedule Update****************************"
    );
    logger.log(resp);
    let deliveryBatchRowsToUpdate = [];
    for (let row of rows) {
      const slctr = `Filter(Delivery, [Delivery Batch] = '${deliveryBatchNumber}')`;
      logger.log(slctr);
      const dRows = await getRecordsAppSheet("Delivery", slctr);
      let drows = [];
      dRows.forEach((row) => {
        if (row.status != "Fully Rejected") {
          drows.push(row.status);
        }
      });
      logger.log(drows);
      logger.log(
        ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;"
      );
      row.Status = hasSameStatus(drows, "Log Reco Closed")
        ? "Log Reco Closed"
        : "Log Reco Ongoing";
      row["Last Attempt Driver"] = row["Driver"];
      row["Last Attempt DAS"] = row["DAS"];
      row["Last Batch Number"] = row["Delivery Batch Number"];
      row["Last Ship Date"] = tagDate;
      row["Log Reco Status"] = row["Status"];
      logger.log("Delivery Rows Length", deliveryRows.length);
      logger.log("Order Rows Length", orders.length);
      // row.status = deliveryRows.length > orders.length ? row.status : "Open";
      row["Attempt Count"] =
        row["Attempt Count"] == "" ? 1 : Number(row["Attempt Count"]) + 1;
      delete row["SMId"];
      delete row["Id"];
      deliveryBatchRowsToUpdate.push(row);
    }
    const res = await updateRecordsAppSheet(
      "Delivery Batch",
      deliveryBatchRowsToUpdate
    );
    logger.log("***********************Delivery Batch***********************");
    logger.log(res);

    //call SMCore API to delete shipment
    const shipments = {
      ShipmentsToDelete: shipmentsToDelete,
    };
    logger.log(shipments);
    let url = `${SHIPMENT_API}/DeleteShipment`;
    logger.log(url);
    const response = await apiCall(url, shipments, headers, "POST");
    // const responseJson = await response.json();
    logger.log("{}{}{}{}{}{}{}{}{{}}", response);
    return response;
  } catch (error) {
    return error;
  }
};

const accessSpreadsheet = async (request) => {
  let query;
  let lastItem;
  if (request.query.status && request.query.status != "")
    query = `status = ${request.query.status}`;
  // if (request.query.homeState && request.query.homeState != "") query.concat(`, homestate = ${request.query.homeState}`);
  if (request.query.lastItem && request.query.lastItem != "")
    lastItem = request.query.lastItem;
  try {
    const doc = new GoogleSpreadsheet(SPREADSHEET_DOC);
    await promisify(doc.useServiceAccountAuth)(creds);
    const info = await promisify(doc.getInfo)();
    const sheet = info.worksheets[0];
    logger.log(`Title: ${sheet.title} | Row count: ${sheet.rowCount}`);
    const rows = await promisify(sheet.getRows)({
      offset: lastItem || 1,
    });
    const data = [];
    let i = 1;
    rows.forEach((row) => {
      row["rowNumber"] = i++;
      let rn = {
        salesorderid: row.salesorderid,
        invoicedstatus: row.invoicedstatus,
        shippedstatus: row.shippedstatus,
        deliverymethod: row.deliverymethod,
        date: row.date,
        salesordernumber: row.salesordernumber,
        referencenumber: row.referencenumber,
        orderstatus: row.orderstatus,
        city: row.city,
        numberofitems: row.numberofitems,
        total: row.total,
        customername: row.customername,
        customerphonenumber: row.customerphonenumber,
        status: row.status,
        istreated: row.istreated,
        rowNumber: row.rowNumber,
      };
      if (request.query.status && request.query.status != "") {
        if (request.query.status == row.status)
          row.istreated == "TRUE" ? logger.log(data) : data.push(rn);
      } else {
        data.push(rn);
      }

      if (request.query.status) {
        if (row.status == request.query.status) {
          row.istreated = "TRUE";
          row.save();
        }
      }
    });
    return { status: true, message: "Query Successful", data };
  } catch (error) {
    return { status: false, message: "Query Failed", error };
  }
};

const accessDeliverySpreadsheet = async (request) => {
  let query;
  if (request.query.status && request.query.status != "")
    query = `status = ${request.query.status}`;
  try {
    let selector = "";

    if (query)
      selector = `Filter(Delivery, [Status] = ${request.query.status})`;
    logger.log(selector);

    const rows = await getRecordsAppSheet("Delivery", selector);
    const data = rows;
    return {
      status: true,
      message: "Query Successful",
      data: { deliveries: data, count: data.length },
    };
  } catch (error) {
    logger.log(error);
    return { status: false, message: "Query Failed", error };
  }
};

const accessSalesOrderSpreadsheetV2 = async (request) => {
  let query;
  if (request.query.status && request.query.status != "")
    query = `status = ${request.query.status}`;
  try {
    let selector = "";

    if (query)
      selector = `Filter(SalesOrder, [Status] = ${request.query.status})`;
    logger.log(selector);

    const rows = await getRecordsAppSheet("SalesOrder", selector);
    const data = rows;

    return {
      status: true,
      message: "Query Successful",
      data: { salesOrders: data, count: data.length },
    };
  } catch (error) {
    logger.log(error);
    return { status: false, message: "Query Failed", error };
  }
};

exports.spreadsheetRouter = spreadsheetRouter;
