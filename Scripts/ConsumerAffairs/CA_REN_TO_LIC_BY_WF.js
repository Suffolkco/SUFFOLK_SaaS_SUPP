if ((appTypeArray[2] != "Polygraph Examiner" && wfTask == "Issuance" && wfStatus == "Renewed") || (appTypeArray[2] == "Polygraph Examiner" && wfTask == "Renewal Review" && wfStatus == "Complete"))
{
    var vEParams = aa.util.newHashtable();
    var parentCapId = getParentCapID4Renewal();
    var expDateASI = getAppSpecific("Expiration Date", parentCapId);

    //Updating Expiration Date of License


    if (expDateASI != null)
    {
        logDebug("ASI Expdate is: " + expDateASI);
        expDateASI = new Date(expDateASI);
        logDebug("New Date Exp Date is: " + expDateASI)
        var newExpDate = (expDateASI.getMonth() + 1) + "/" + 1 + "/" + (expDateASI.getFullYear() + 2);
        logDebug("New Exp Date is: " + newExpDate);
        editAppSpecific("Expiration Date", newExpDate, parentCapId);
        var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
        if (b1ExpResult.getSuccess())
        {
            var b1Exp = b1ExpResult.getOutput();
            b1Exp.setExpStatus("Active");
            b1Exp.setExpDate(aa.date.parseDate(newExpDate));
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            updateAppStatus("Active", "", parentCapId);
            updateTask("Issuance", "Renewed", "", "", "", parentCapId);
        }
    }

    else
    {
        var today = new Date();
        logDebug("today's date is " + today);
        var nullExpDate = (today.getMonth() + 1) + "/" + 1 + "/" + (today.getFullYear() + 2);
        logDebug("null date is " + nullExpDate);
        editAppSpecific("Expiration Date", nullExpDate, parentCapId);
        var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
        if (b1ExpResult.getSuccess())
        {
            var b1Exp = b1ExpResult.getOutput();
            b1Exp.setExpStatus("Active");
            b1Exp.setExpDate(aa.date.parseDate(nullExpDate));
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            updateAppStatus("Active", "", parentCapId);
            updateTask("Issuance", "Pending Renewal", "", "", "", parentCapId);
            activateTask("Issuance");
        }
    }


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
    copyDocuments(capId, parentCapId);
    copyContacts(capId, parentCapId);
    AInfo = new Array();
    loadAppSpecific(AInfo, capId);
    for (asi in AInfo)
    {
        //Check list
        logDebug("ASI: " + asi + " value is:" + AInfo[asi]);
        editAppSpecificLOCAL(asi, AInfo[asi], parentCapId);
    }
    copyASITablesWithRemove(capId, parentCapId);

    var conArray = getContactByType("Applicant", capId);
    var conEmail = "";

    if (!matches(conArray.email, null, undefined, "") && appTypeArray[1] != "TLC")
    {
        addParameter(vEParams, '$$altID$$', parentCapId.getCustomID());
        addParameter(vEParams, "$$expDate$$", newExpDate);
        conEmail += conArray.email + "; ";
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", "CA_LICENSE_RENEWAL_APPLICANT_NOTICE", vEParams, null);
    }
    if (!matches(conArray.email, null, undefined, "") && appTypeArray[1] == "TLC")
    {
        var curExp = b1Exp.getExpDate();
        addParameter(vEParams, '$$altID$$', parentCapId.getCustomID());
        addParameter(vEParams, "$$expDateTlc$$", curExp);
        conEmail += conArray.email + "; ";
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", "CA_LICENSE_RENEWAL_APPLICANT_NOTICE_TLC", vEParams, null);
    }

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