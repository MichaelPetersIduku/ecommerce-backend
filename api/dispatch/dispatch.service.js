const { logger } = require("firebase-functions");
const { SHIPMENT_API, SMCOREHEADERS } = require("../../@core/common/credentials");
const { successResponse, serverErrorResponse, failureResponse } = require("../../@core/common/response");
const { getRecordsAppSheet, addRecordsAppSheet, apiCall, updateRecordsAppSheet } = require("../../@core/common/universal");

const createDeliveryBatchService = async (req) => {
    try {
      const { date } = req.body;
      const deliveryAssociatePhone = req.body.deliveryAssociatePhone || "";
      let batches = [];
      if (deliveryAssociatePhone != "") {
        //Create batches only for selected Delivery Associates
        const DANumbers = deliveryAssociatePhone.split(",");
        for (let phoneNumber of DANumbers) {
        const selector = `Filter(Delivery Associate, [Phone Number] = '${phoneNumber}')`;
        const DA = await getRecordsAppSheet("Delivery Associate", selector);
        const shouldGenerateBatch = await preDABatchGenerationCheck(DA[0]);
        DA[0].shouldGenerateBatch = shouldGenerateBatch;
        if (shouldGenerateBatch) {
          const BatchNumber = await generateBatchNumber(DA[0], date);
          let deliveryAssociate = DA[0];
          batches.push({
            "Date": date,
            "Delivery Batch Number": BatchNumber,
            "Driver": deliveryAssociate["Phone Number"],
            "Status": "Open"
          });
        }
        }
        const response = await addRecordsAppSheet("Delivery Batch", batches);
        if (response) return successResponse("Successful", batches);
        return failureResponse(req, "Failed to generate batches", response);
      } else {
        //Create batches for all Delivery Associates using date provided
        const selector = ``;
        const DAs = await getRecordsAppSheet("Delivery Associate", selector);
        for (let deliveryAssociate of DAs) {
          const shouldGenerateBatch = await preDABatchGenerationCheck(deliveryAssociate);
        if (shouldGenerateBatch) {
          const BatchNumber = await generateBatchNumber(deliveryAssociate, date);
          batches.push({
            "Date": date,
            "Delivery Batch Number": BatchNumber,
            "Driver": deliveryAssociate["Phone Number"],
            "Status": "Open"
          });
        }
        }
        const response = await addRecordsAppSheet("Delivery Batch", batches);
        if (response) return successResponse("Successful all", batches);
        return failureResponse(req, "Failed to generate batches", response);
      }
    } catch (error) {
      return serverErrorResponse(req, error);
    }
  };


  const createShipmentService = async (req) => {
    try {
      const {packageId, packageNo, carrier, daCode, driverCode} = req.body;
      const model = {
        PackagesToShip: [{
          PackageID: packageId,
          PackageNo: packageNo,
          Carrier: carrier,
          DACode: daCode,
          DriverCode: driverCode,
          ShipmentDate: new Date().toISOString().split("T")[0],
        }]
      };
      const url = `${SHIPMENT_API}/CreateShipment`;
      const response = await apiCall(url, model, SMCOREHEADERS, "POST");
      logger.log("SHIPMENT CREATION");
      logger.log(response);
      return successResponse("Successful", response);
    } catch (error) {
      return serverErrorResponse(req, error);
    }
  };

  const deliveryBatchAssignmentService = async (req) => {
    try {
      const {deliveryAssociate, driver, tagDate, deliveryBatchNumber, packages} = req.body;
      const packagesArray = packages.split('!-!');
      const deliveryRowsToUpdate = [];
      for (let package of packagesArray) {
        deliveryRowsToUpdate.push({
          "Id": package.split("-ID: ")[1],
          "Current Driver": deliveryAssociate,
          "Tag date": tagDate,
          "status": "Assigned",
          "Delivery Batch": deliveryBatchNumber
        })
      }
      const deliveryBatchRowToUpdate = [{
        "Delivery Batch Number": deliveryBatchNumber,
        "DAS": driver
      }];
      const deliveryBatchResponse = await updateRecordsAppSheet("Delivery Batch", deliveryBatchRowToUpdate);
      logger.debug(deliveryBatchResponse);
      const deliveryResponse = await updateRecordsAppSheet("Delivery", deliveryRowsToUpdate);
      logger.debug(deliveryResponse);
      return successResponse("Successful", {deliveryBatchResponse, deliveryResponse});
    } catch (error) {
      return serverErrorResponse(req, error);
    }
  };

const preDABatchGenerationCheck = async (deliveryAssociateData) => {
  let deliveryAssociate = deliveryAssociateData;
  return deliveryAssociate["Status"] == "Active" && deliveryAssociate["Delivery Batch #"] == "OPEN";
}

const generateBatchNumber = async (deliveryAssociateData, date) => {
  const WarehouseAbbr = deliveryAssociateData["Warehouse Assignment Abbr"];
  const BatchDate = new Date(date).toISOString().split("T")[0].split("-").join("");
  const DACode = deliveryAssociateData["Driver Code"];
  const NumOfBatch = deliveryAssociateData["Number of Batches"];
  const Num = Number(NumOfBatch).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false
  });
  return `${WarehouseAbbr}-${BatchDate}-${DACode}-${Num}`;
}

module.exports = {
    createDeliveryBatchService,
    createShipmentService,
    deliveryBatchAssignmentService
}
  