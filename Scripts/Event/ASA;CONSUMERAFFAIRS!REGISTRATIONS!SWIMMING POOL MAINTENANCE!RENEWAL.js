// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

//aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
//aa.runScript("APPLICATIONSUBMITAFTER4RENEW");




var conArray = getContactArray(capId);

if (conArray.length < 1) 
{
    var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
    aa.cap.updateAccessByACA(capId, "Y");
    /*if (publicUser)
    {
        //copying the contacts from the parent to the renewal record when beginning the renewal for ACA records only
        var capContacts = aa.people.getCapContactByCapID(parentCapId);
        if (capContacts.getSuccess())
        {
            capContacts = capContacts.getOutput();
            logDebug("capContacts: " + capContacts);
            for (var yy in capContacts)
            {
                aa.people.removeCapContact(parentCapId, capContacts[yy].getPeople().getContactSeqNumber());
            }
        }

        
    }*/
    copyContacts(parentCapId, capId);

    /*AInfo = new Array();
    loadAppSpecific(AInfo, parentCapId);
    for (asi in AInfo)
    {
        //Check list
        logDebug("ASI: " + asi + " value is:" + AInfo[asi]);
        editAppSpecificLOCAL(asi, AInfo[asi], capId);
    }

    var tableCopy = 0;
    if (tableCopy == 0)
    {
        copyASITables(parentCapId, capId);
        tableCopy = tableCopy + 1;
    }*/
    //copyAddresses(parentCapId, capId); 
    copyParcels(parentCapId, capId);
    copyParcelGisObjects();
} 

function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0)
        { logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false }


        itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    // change 2/2/2018 - update using: aa.appSpecificInfo.editAppSpecInfoValue(asiField)
    // to avoid issue when updating a blank custom form via script. It was wiping out the field alias 
    // and replacing with the field name

    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if (asiFieldResult.getSuccess())
    {
        var asiFieldArray = asiFieldResult.getOutput();
        if (asiFieldArray.length > 0)
        {
            var asiField = asiFieldArray[0];
            if (asiField)
            {
                var origAsiValue = asiField.getChecklistComment();
                asiField.setChecklistComment(itemValue);

                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if (updateFieldResult.getSuccess())
                {
                    logDebug("Successfully updated custom field on record: " + itemCap.getCustomID() + " on " + itemName + " with value: " + itemValue);
                    if (arguments.length < 3) //If no capId passed update the ASI Array
                        AInfo[itemName] = itemValue;
                }
                else
                { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
            }
            else
            { logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated."); }
        }
    }
    else
    {
        logDebug("ERROR: (editAppSpecific)" + asiFieldResult.getErrorMessage());
    }
}