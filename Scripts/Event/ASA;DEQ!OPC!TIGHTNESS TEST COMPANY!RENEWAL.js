//ASA:DEQ/OPC/Tightness Test Company/Renewal

var conArray = getContactArray(capId);
var feeCount = 0;
var methArray = [];

//Without this check in place, ASA is running twice.  Once when the renewal is first generated and again when the application has been submitted
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
    var testMethods = loadASITable("TEST METHODS", capId);
    if (testMethods.length >= 1)
    {
        for(var x = 0; x < testMethods.length; x++)
        { 
            var testMeth = testMethods[x]["Test Method"]; 
            var methArrayStr = methArray.toString();
            var index = methArrayStr.indexOf(testMeth.toString());
            if (index == -1)
            {
                methArray.push(testMeth);
                logDebug("Adding 1 to feeCount");
                feeCount++;
            }   
        }
        if (feeCount >= 1)
        {
            logDebug("TEST METHODS has " + feeCount + " unique test methods");
            updateFee("DEQ_TTC_TTI", "DEQ_TTC_TTI", "FINAL", feeCount, "Y");
        }
    }
}
