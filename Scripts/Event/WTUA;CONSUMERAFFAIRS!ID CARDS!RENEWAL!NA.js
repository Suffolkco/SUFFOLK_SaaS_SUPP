/*if (wfTask == "Issuance" && wfStatus == "Renewed")
{
    var vEParams = aa.util.newHashtable();
    var parentCapId = getParentCapID4Renewal();
    var expDateASI = getAppSpecific("Expiration Date", parentCapId);

    //Updating Expiration Date of License
    logDebug("ASI Expdate is: " + expDateASI);
    expDateASI = new Date(expDateASI);
    logDebug("New Date Exp Date is: " + expDateASI)
    var newExpDate = (expDateASI.getMonth() + 1) + "/" + 1 + "/" + (expDateASI.getFullYear() + 2);
    logDebug("New Exp Date is: " + newExpDate);
    editAppSpecific("Expiration Date", newExpDate, capId);
    if (expDateASI != null)
    {
        var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
        if (b1ExpResult.getSuccess())
        {
            var b1Exp = b1ExpResult.getOutput();
            b1Exp.setExpStatus("Active");
            b1Exp.setExpDate(aa.date.parseDate(newExpDate));
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            updateAppStatus("Active", "", parentCapId);
            activateTask("Issuance", "", parentCapId);
            updateTask("Issuance", "Issued", "", "", "", parentCapId);
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
    copyContacts(capId, parentCapId);
    AInfo = new Array();
    loadAppSpecific(AInfo, capId);
    for (asi in AInfo)
    {
        //Check list
        logDebug("ASI: " + asi + " value is:" + AInfo[asi]);
        editAppSpecificLOCAL(asi, AInfo[asi], parentCapId);
    }    copyASITables(capId, parentCapId);

    var conArray = getContactByType("Applicant", capId);
    var conEmail = "";

    if (!matches(conArray.email, null, undefined, ""))
    {
        addParameter(vEParams, '$$altID$$', parentCapId.getCustomID());
        addParameter(vEParams, "$$expDate$$", newExpDate);
        conEmail += conArray.email + "; ";
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", "CA_LICENSE_RENEWAL_APPLICANT_NOTICE", vEParams, null);
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
} */

include("CA_REN_TO_LIC_BY_WF");