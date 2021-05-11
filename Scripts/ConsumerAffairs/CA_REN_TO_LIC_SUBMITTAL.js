showDebug = true;
var vEParams = aa.util.newHashtable();
var conArray = getContactArray();
var conEmail = "";
var expDateASI = getAppSpecific("Expiration Date", parentCapId);
var parentAltID = parentCapId.getCustomID();



if (!publicUser)
{
    //checking parent record for Child Support Condition
    var condResult = aa.capCondition.getCapConditions(parentCapId);
    var condArray = [];
    if (condResult.getSuccess()) 
    {
        var capConds = condResult.getOutput();
        for (cc in capConds) 
        {
            logDebug("Condition name is: " + capConds[cc].getConditionDescription());
            if (capConds[cc].getConditionDescription() == "Child Support" && capConds[cc].getConditionStatus() != "Met(Not Applied)") 
            {
                var cDesc = capConds[cc].getConditionDescription();
                logDebug("cDesc " + cDesc);
                var cType = capConds[cc].getConditionType();
                logDebug("cType " + cType);

                //other stuff where condition exists - sending email to Matt

                addParameter(vEParams, '$$altID$$', capId.getCustomID());
                addParameter(vEParams, '$$parentCapID$$', parentAltID);

                sendNotification('', 'ryan.littlefield@scubeenterprise.com', '', 'CA_RENEWAL_WITH_CONDITIONS_SUBMITTED', vEParams, null);
            }
        }
    }
    else
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
                closeTask("Renewal Review", "Complete", "Updated by Renewal Script", "Updated by Renewal Script");

            }
        }
        var conArray = getContactArray();
        var conEmail = "";
        for (con in conArray)
        {
            if (conArray[con].contactType == "Applicant")
            {
                if (!matches(conArray[con].email, null, undefined, ""))
                {
                    addParameter(vEParams, '$$altID$$', capId.getCustomID());
                    addParameter(vEParams, "$$expDate$$", newExpDate);
                    conEmail += conArray[con].email + "; ";
                    logDebug("Email addresses: " + conEmail);
                    sendNotification("", conEmail, "", "CA_LICENSE_RENEWAL_APPLICANT_NOTICE", vEParams, null);
                }
            }
        }
        //copying back from the renewal to the parent for records where the condition has been met
        copyContacts(capId, parentCapId);
        copyASIFields(capId, parentCapId);
        copyASITables(capId, parentCapId);
    }
}

if (publicUser)
{
    //checking parent record for Child Support Condition
    var condResult = aa.capCondition.getCapConditions(parentCapId);
    var condArray = [];
    if (condResult.getSuccess()) 
    {
        var capConds = condResult.getOutput();
        for (cc in capConds) 
        {
            logDebug("Condition name is: " + capConds[cc].getConditionDescription());
            if (capConds[cc].getConditionDescription() == "Child Support" && capConds[cc].getConditionStatus() != "Met(Not Applied)") 
            {
                var cDesc = capConds[cc].getConditionDescription();
                logDebug("cDesc " + cDesc);
                var cType = capConds[cc].getConditionType();
                logDebug("cType " + cType);

                //other stuff where condition exists - sending email to Matt

                var vEParams = aa.util.newHashtable();
                addParameter(vEParams, '$$altID$$', capId.getCustomID());
                addParameter(vEParams, '$$parentCapID$$', parentAltID)


                sendNotification('', 'ryan.littlefield@scubeenterprise.com', '', 'CA_RENEWAL_WITH_CONDITIONS_SUBMITTED', vEParams, null);

            }
            else
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
                    closeTask("Renewal Review", "Complete", "Updated by Renewal Script", "Updated by Renewal Script");
                }
                //copying back from the renewal to the parent for records where the condition has been met
                copyContacts(capId, parentCapId);
                copyASIFields(capId, parentCapId);
                copyASITables(capId, parentCapId);

                var conArray = getContactArray();
                var conEmail = "";
                for (con in conArray)
                {
                    if (conArray[con].contactType == "Applicant")
                    {
                        if (!matches(conArray[con].email, null, undefined, ""))
                        {
                            addParameter(vEParams, "$$expDate$$", expDateASI);
                            conEmail += conArray[con].email + "; ";
                            logDebug("Email addresses: " + conEmail);
                            sendNotification("", conEmail, "", "CA_LICENSE_RENEWAL_APPLICANT_NOTICE", vEParams, null);
                        }
                    }
                }
            }
        }
    }
}
