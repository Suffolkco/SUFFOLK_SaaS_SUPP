//ASA:DEQ/WWM/GARBAGE/AMENDMENT//
var showDebug = false;
 
var parentId = getParent();
var todaysDate = new Date();
var totalTrucks = AInfo["Total number of trucks"];
var feeEx = AInfo["Fee Exempt"];
var parentTrucks = loadASITable("TRUCKS USED FOR WASTE HAULAGE", parentId);
var parentTruckCount = parseInt(parentTrucks.length);
var amendTrucks = loadASITable("TRUCKS USED FOR WASTE HAULAGE", capId);
var truckCount = parseInt(amendTrucks.length);
var truckDiff = parseInt(truckCount - parentTruckCount);
var dateString = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + todaysDate.getFullYear(); 

editASITableRowNull(capId, "TRUCKS USED FOR WASTE HAULAGE", "Start Date", dateString);
editASITableRowNull(capId, "TRUCKS USED FOR WASTE HAULAGE", "Approved Date", dateString);

if (feeEx == "No" || feeEx == null)
{
    if (truckCount > parentTruckCount)
    {
        logDebug("Trucks have been added with this amendment, assessing a fee")
        if (isOdd(todaysDate.getYear()))
        {
        updateFee("GARB-TRUCK", "WWM_GARB", "FINAL", truckDiff/2, "Y");
        }
        if (isEven(todaysDate.getYear()))
        {
        updateFee("GARB-TRUCK", "WWM_GARB", "FINAL", truckDiff, "Y");
        }
    }
    if (truckCount == parentTruckCount)
    {
        logDebug("The number of trucks in this amendment has not changed")
    }
    if (truckCount < parentTruckCount)
    {
        logDebug("Trucks are being removed with this amendment, no fee will be assessed")
    }
}

function isEven(n) 
{
    return n % 2 == 0;
}
function isOdd(n) 
{
   return Math.abs(n % 2) == 1;
}