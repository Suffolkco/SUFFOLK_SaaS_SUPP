// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

aa.runScriptInNewTransaction("APPLICATIONSUBMITAFTER4RENEW");
aa.runScript("APPLICATIONSUBMITAFTER4RENEW");


var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);

aa.cap.updateAccessByACA(capId, "N");
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
}
copyContacts(parentCapId, capId); 
copyASIFields(parentCapId, capId);
copyASITables(parentCapId, capId);

parentCapId = getParentCapID4Renewal();
logDebug("parent cap id is: " + parentCapId);

showDebug = true;

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
        editAppSpecific("Expiration Date", newExpDate, parentCapId);
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
                updateTask("Issuance", "Issued", "", "", parentCapId);
            }
        }

        if (isTaskActive("Renewal Review"))
        {
            logDebug("Task is closing");
            closeTask("Renewal Review", "Complete", "Updated by Renewal Script", "Updated by Renewal Script");
        }
        //copying back from the renewal to the parent for records where the condition has been met
        copyContacts(capId, parentCapId);
        copyASIFields(capId, parentCapId);
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

