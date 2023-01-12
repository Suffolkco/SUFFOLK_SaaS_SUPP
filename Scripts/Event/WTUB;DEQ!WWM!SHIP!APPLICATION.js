var ikGrease = AInfo["In-Kind Grease Trap Replacement"];
var stInstall = AInfo["Septic Tank Installation"];
var iaInstall = AInfo["I/A OWTS Installation"];
var lpgInstall = AInfo["Leaching Pool(s)/Galley(s) Installation"];
var psdInstall = AInfo["Pressurized Shallow Drainfield Installation"];
var gravInstall = AInfo["Gravity (Trench or Bed) Drainfield Installation"];
var other = AInfo["Other"];
var existingDecom = AInfo["Existing Sanitary System Decommissioning ONLY"];
var pumpOut = AInfo["Pump Out ONLY"]


logDebug("iaInstall = " + iaInstall); 



if ((iaInstall == "CHECKED" || ikGrease == "CHECKED" || stInstall == "CHECKED" || lpgInstall == "CHECKED" || psdInstall == "CHECKED" || gravInstall == "CHECKED") && other == "CHECKED")
{
    if (wfTask == "Final Review" && wfStatus == "Registration Complete")
    {
        cancel = true;
        showMessage = true;
        comment("Please Submit an Amendment");


    }
}
if (wfTask == "Final Review" && wfStatus == "Registration Complete")
{
    loadASITables();
    var ssd = SHIPSYSTEMDETAILS.length;

    if (typeof (SHIPSYSTEMDETAILS) == "object")
    {
        if (ssd < 1)
        {
            cancel = true;
            showMessage = true;
            comment("Complete the SHIP SYSTEM DETAILS Custom List prior to finalizing this registration.");
        }
        else
        {
            /* 11/29 Meeting this was no longer needed
            if (!matches(getAppSpecific("IA Number"), "", null, undefined))
            {
                if (matches(getAppSpecific("O&M Contract Approved"), "", null, undefined))
                {
                    cancel = true;
                    showMessage = true;
                    comment("Awaiting approvable O&M Contract/Registration in Ecology.");
                }   
            }
            var shipSystemTable = loadASITable("SHIP SYSTEM DETAILS", capId);
            for (sstrow in shipSystemTable)
            {
                var iaManufacturer = shipSystemTable[sstrow]["I/A Manufacturer"];
                if (matches(iaManufacturer, null, undefined, ""))
                {
                    cancel = true;
                    showMessage = true;
                    comment("Please fill out I/A Manufacturer");
                }
            }
*/

        }
    }
    else
    {
        cancel = true;
        showMessage = true;
        comment("Complete the SHIP SYSTEM DETAILS Custom List prior to finalizing this registration.");
    }
 




}


function getChildren(pCapType, pParentCapId) 
{
    // Returns an array of children capId objects whose cap type matches pCapType parameter
    // Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
    // Optional 3rd parameter pChildCapIdSkip: capId of child to skip

    var retArray = new Array();
    if (pParentCapId != null) //use cap in parameter 
        var vCapId = pParentCapId;
    else // use current cap
        var vCapId = capId;

    if (arguments.length > 2)
        var childCapIdSkip = arguments[2];
    else
        var childCapIdSkip = null;

    var typeArray = pCapType.split("/");
    if (typeArray.length != 4)
        logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);

    var getCapResult = aa.cap.getChildByMasterID(vCapId);
    if (!getCapResult.getSuccess())
    { logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }

    var childArray = getCapResult.getOutput();
    if (!childArray.length)
    { logDebug("**WARNING: getChildren function found no children"); return null; }

    var childCapId;
    var capTypeStr = "";
    var childTypeArray;
    var isMatch;
    for (xx in childArray)
    {
        childCapId = childArray[xx].getCapID();
        if (childCapIdSkip != null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
            continue;

        capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
        childTypeArray = capTypeStr.split("/");
        isMatch = true;
        for (yy in childTypeArray) //looking for matching cap type
        {
            if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
            {
                isMatch = false;
                continue;
            }
        }
        if (isMatch)
            retArray.push(childCapId);
    }

    logDebug("getChildren returned " + retArray.length + " capIds");
    return retArray;

}