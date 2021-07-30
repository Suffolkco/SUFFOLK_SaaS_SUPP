parentCapId = getParentCapID4Renewal();
logDebug("parent cap id is: " + parentCapId);

var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID == "XRLITT1")
{
    showDebug = true;
}
var vEParams = aa.util.newHashtable();
var expDateASI = getAppSpecific("Expiration Date", parentCapId);
if (!publicUser)
{
    addFee("LIC_REN_01", "CA_LIC_REN", "FINAL", 1, "Y");
}
if (publicUser)
{
    logDebug("we're a public user");
    //checking parent record for Child Support Condition
    var condResult = aa.capCondition.getCapConditions(parentCapId);
    var condArray = [];
    var capConds = condResult.getOutput();

    var foundCondition = false;

    if (capConds) 
    {
        for (cc in capConds) 
        {
            logDebug("Condition name is: " + capConds[cc].getConditionDescription());
            if (capConds[cc].getConditionDescription() == "Child Support" && capConds[cc].getConditionStatus() != "Met(Not Applied)") 
            {
                foundCondition = true;
                var cDesc = capConds[cc].getConditionDescription();
                logDebug("cDesc " + cDesc);
                var cType = capConds[cc].getConditionType();
                logDebug("cType " + cType);

                //other stuff where condition exists - sending email to Matt

                var parentAltID = parentCapId.getCustomID();

                addParameter(vEParams, '$$altID$$', capId.getCustomID());
                addParameter(vEParams, '$$parentCapID$$', parentAltID)


                sendNotification('', 'ryan.littlefield@scubeenterprise.com', '', 'CA_RENEWAL_WITH_CONDITIONS_SUBMITTED', vEParams, null);

            }
        }
    }
    if (!foundCondition)
    {
        //Updating Expiration Date of License
        logDebug("ASI Expdate is: " + expDateASI);
        expDateASI = new Date(expDateASI);
        logDebug("New Date Exp Date is: " + expDateASI)
        var newExpDate = (expDateASI.getMonth() + 1) + "/" + 1 + "/" + (expDateASI.getFullYear() + 2);
        logDebug("New Exp Date is: " + newExpDate);
        editAppSpecificLOCAL("Expiration Date", newExpDate, parentCapId);
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
                updateTask("Issuance", "Issued", "", "", "", parentCapId);
            }
        }

        if (isTaskActive("Issuance"))
        {
            logDebug("Task is closing");
            closeTask("Issuance", "Renewed", "Updated by Renewal Script", "Updated by Renewal Script");
        }
        if (isTaskActive("Renewal Review"))
        {
            logDebug("Task is closing");
            closeTask("Renewal Review", "Complete", "Updated by Renewal Script", "Updated by Renewal Script");
        }
        //copying back from the renewal to the parent for records where the condition has been met
        copyContacts(capId, parentCapId);
        AInfo = new Array();
        loadAppSpecific(AInfo, capId);
        for (asi in AInfo)
        {
            //Check list
            logDebug("ASI: " + asi + " value is:" + AInfo[asi]);
            editAppSpecificLOCAL(asi, AInfo[asi], parentCapId);
        }        
        copyASITables(capId, parentCapId);

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