// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

//aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
//aa.runScript("APPLICATIONSUBMITAFTER4RENEW");

var conArray = getContactArray(capId);
var partialCapId = getIncompleteCapId();
var parentCapId = aa.env.getValue("ParentCapID");

if (conArray.length < 1)
{
    var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
    aa.cap.updateAccessByACA(capId, "Y");

}
if (isRenewProcess(parentCapId, partialCapId))
{
    if (publicUser)
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
        aa.print("CAPID(" + parentCapId + ") is ready for renew. PartialCap (" + partialCapId + ")");
        //2. Associate partial cap with parent CAP.
        var result = aa.cap.createRenewalCap(parentCapId, partialCapId, true);
        if (result.getSuccess())

            copyContacts(parentCapId, capId);

        AInfo = new Array();
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
        }

        //4. Set B1PERMIT.B1_ACCESS_BY_ACA to "N" for partial CAP to not allow that it is searched by ACA user.
        aa.cap.updateAccessByACA(partialCapId, "N");
    }
    else
    {
        aa.print("ERROR: Associate partial cap with parent CAP. " + result.getErrorMessage());
    }
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", "ApplicationSubmitAfter4Renew perform renewal process.");
}

function isRenewProcess(parentCapID, partialCapID)
{
    //1. Check to see parent CAP ID is null.
    if (parentCapID == null || partialCapID == null
        || aa.util.instanceOfString(parentCapID))
    {
        return false;
    }
    //2. Get CAPModel by PK for partialCAP.
    var result = aa.cap.getCap(partialCapID);
    if (result.getSuccess())
    {
        capScriptModel = result.getOutput();
        //2.1. Check to see if it is partial CAP.	
        if (capScriptModel.isCompleteCap())
        {
            aa.print("ERROR: It is not partial CAP(" + capScriptModel.getCapID() + ")");
            return false;
        }
    }
    else
    {
        aa.print("ERROR: Fail to get CAPModel (" + partialCapID + "): " + result.getErrorMessage());
        return false;
    }
    //3.  Check to see if the renewal was initiated before. 
    result = aa.cap.getProjectByMasterID(parentCapID, "Renewal", "Incomplete");
    if (result.getSuccess())
    {
        partialProjects = result.getOutput();
        if (partialProjects != null && partialProjects.length > 0)
        {
            //Avoid to initiate renewal process multiple times.
            aa.print("Warning: Renewal process was initiated before. ( " + parentCapID + ")");
            return false;
        }

    }
    //4 . Check to see if parent CAP is ready for renew.
    return isReadyRenew(parentCapID);
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
function getIncompleteCapId()  
{
    var s_id1 = aa.env.getValue("PermitId1");
    var s_id2 = aa.env.getValue("PermitId2");
    var s_id3 = aa.env.getValue("PermitId3");

    var result = aa.cap.getCapIDModel(s_id1, s_id2, s_id3);
    if(result.getSuccess())
	{
      return result.getOutput();
	}  
    else 
    {
      aa.print("ERROR: Failed to get capId: " + result.getErrorMessage());
      return null;
    }
}
