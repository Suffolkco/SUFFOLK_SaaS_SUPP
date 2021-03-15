//ASA:DEQ/WWM/GARBAGE/PERMIT
 
var showDebug = false;
var todaysDate = new Date();
var feeEx = AInfo["Fee Exempt"];
var truckInfo = loadASITable("TRUCKS USED FOR WASTE HAULAGE");
var truckInfoRows = truckInfo.length;
var dateString = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + todaysDate.getFullYear();
editAppSpecific("Total number of trucks", parseInt(truckInfoRows));


editASITableRow(capId, "TRUCKS USED FOR WASTE HAULAGE", "Start Date", dateString);
editASITableRow(capId, "TRUCKS USED FOR WASTE HAULAGE", "Approved Date", dateString);

if (feeEx == "No" || feeEx == null)
{
	if (truckInfoRows >= 1)
	{
		updateFee("GARB-TRUCK", "WWM_GARB", "FINAL", parseInt(truckInfoRows), "Y");
	}
}