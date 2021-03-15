//CTRCA:DEQ/WWM/GARBAGE/RENEWAL

var showDebug = false;
var todaysDate = new Date();
var curYear = todaysDate.getFullYear();
var curYearPlus;
var parentCapId = getParentCapID4Renewal();
 
updateAppStatus("Renewal Submitted", "Updated via WTUA script", parentCapId);


if (isOdd(curYear))
{
    var curYearPlus = parseInt(curYear) + 1;
}
else if (isEven(curYear))
{
    var curYearPlus = parseInt(curYear) + 2;
}

var dateStringPlus = "01/01" + "/" + curYearPlus;
var dateString = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + todaysDate.getFullYear();

editASITableRowEndDate(capId, "TRUCKS USED FOR WASTE HAULAGE", dateString, dateStringPlus);

var parentCap = getParentCapID4Renewal();
var totalTrucks = AInfo["Total number of trucks"];
var feeEx = AInfo["Fee Exempt"];
var trucksForRen = 0;
logDebug("Today's Date: " + todaysDate);
var parentTrucks = loadASITable("TRUCKS USED FOR WASTE HAULAGE", capId);
var parentTruckCount = parseInt(parentTrucks.length);
    for (c in parentTrucks)
    {
        firstRow = parentTrucks[c]; 
        endDate = firstRow["End Date"];
        year = firstRow["Year"];
        logDebug("End Date is: " + endDate);
        logDebug("Year is: " + year);
        if ((endDate.toString()).length < 1)
        {
            trucksForRen++;
            logDebug("Added 1 to count"); 
        }
    }

logDebug("Total trucksForRen is: " + trucksForRen); 
logDebug("Parent Cap ID is: " + parentCap);
b1ExpResult = aa.expiration.getLicensesByCapID(parentCap)
if (b1ExpResult.getSuccess())
{
    b1Exp = b1ExpResult.getOutput();
    var curExp = b1Exp.getExpDate();
    var curExpCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
    var dateDiff = dateDiff(todaysDate, curExpCon);
    logDebug("Current Expiration converted is: " + curExpCon);
    logDebug("Date difference is: " + dateDiff);

    if (feeEx == "No" || feeEx == null)
    {
        if (dateDiff >= 0)
        {
            if (totalTrucks != null)
            {
                updateFee("GARB-TRUCK", "WWM_GARB", "FINAL", trucksForRen, "Y");
            }
        }
        if (dateDiff < 0)
        {
            if (totalTrucks != null)
            {
                updateFee("GARB-TRUCK", "WWM_GARB", "FINAL", trucksForRen, "Y");
                updateFee("GARB-TRUCK-L", "WWM_GARB", "FINAL", trucksForRen, "Y");
            }
        }
    }
}
function dateDiff(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

function isOdd(n) 
{
   return Math.abs(n % 2) == 1;
}
function isEven(n) 
{
    return n % 2 == 0;
}