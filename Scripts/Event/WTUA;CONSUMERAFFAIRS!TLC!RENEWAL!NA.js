if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    var vEParams = aa.util.newHashtable();
    var parentCapId = getParentCapID4Renewal();
    var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
    
    if (b1ExpResult.getSuccess())
    {
        //Updating Expiration Date of License
        var b1Exp = b1ExpResult.getOutput();
        var todayExpDate = convertDate(b1Exp.getExpDate());
        logDebug("New Date Exp Date is: " + todayExpDate)
        var newExpDate = (todayExpDate.getMonth() + 1) + "/" + 1 + "/" + (todayExpDate.getFullYear() + 2);
        logDebug("New Exp Date is: " + newExpDate);
        b1Exp.setExpStatus("Active");
        b1Exp.setExpDate(aa.date.parseDate(newExpDate));
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
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
        exec = lookupLOCAL('REPORT_CONFIG', 'COUNTY_EXECUTIVE');
        commissioner = lookupLOCAL('REPORT_CONFIG', 'DCA_COMMISSIONER');
        dca_title_commissioner = lookupLOCAL('REPORT_CONFIG', 'COMMISSIONER_TITLE');
        logDebug(exec + ", " + commissioner);
        addParameter(vEParams, "$$exec$$", exec);
        addParameter(vEParams, "$$comm$$", commissioner);
        addParameter(vEParams, "$$title$$", dca_title_commissioner);
        conEmail += conArray.email + "; ";
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", "CA_TLC_RENEWAL_APPLICANT_NOTICE", vEParams, null);
    }
}
function lookupLOCAL(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
    }
  
    return strControl;
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