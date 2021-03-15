//ASA:DEQ/WWM/GARBAGE/RENEWAL

logDebug("ASA Start");
var conArray = getContactArray(capId);
if (conArray.length < 1)
{
    var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
    aa.cap.updateAccessByACA(capId, "N");
    copyContacts(parentCapId, capId);
    copyASIFields(parentCapId, capId);
    copyASITables(parentCapId, capId);
    copyAddresses(parentCapId, capId);
    copyOwner(parentCapId, capId);
    copyParcels(parentCapId, capId);
    copyParcelGisObjects();
}
else
{
    var parentCap = getParentCapID4Renewal();
    var totalTrucks = AInfo["Total number of trucks"];
    var feeEx = AInfo["Fee Exempt"];
    var todaysDate = new Date();
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
                if (trucksForRen >= 1)
                {
                    updateFee("GARB-TRUCK", "WWM_GARB", "FINAL", trucksForRen, "Y");
                }
            }
            if (dateDiff < 0)
            {
                if (trucksForRen >= 1)
                {
                    updateFee("GARB-TRUCK", "WWM_GARB", "FINAL", trucksForRen, "Y");
                    updateFee("GARB-TRUCK-L", "WWM_GARB", "FINAL", trucksForRen, "Y");
                }
            }
        }
    }
}
function dateDiff(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}