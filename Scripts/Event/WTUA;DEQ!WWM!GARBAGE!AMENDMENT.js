//WTUA:DEQ/WWM/GARBAGE/AMENDMENT//
var showDebug = false;
 
var parentId = getParent();
logDebug("Parent ID is: " + parentId);
var tankInfo = loadASITable("TRUCKS USED FOR WASTE HAULAGE");
var tankInfoRows = tankInfo.length;
var totalTrucks = 0;

if (wfTask == "Renewal Review" && wfStatus == "Permit Issued")
{
    if (parentId)
    {
    removeASITable("TRUCKS USED FOR WASTE HAULAGE", parentId);
    removeASITable("DISPOSAL SITES", parentId);
    copyASITables(capId, parentId);

        var parentTrucks = loadASITable("TRUCKS USED FOR WASTE HAULAGE", parentId);
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
                totalTrucks++;
                logDebug("Added 1 to total"); 
            }
        }
    editAppSpecific("Total number of trucks", parseInt(totalTrucks), parentId);
    editAppSpecific("Total number of trucks", parseInt(totalTrucks), capId);
    }
}