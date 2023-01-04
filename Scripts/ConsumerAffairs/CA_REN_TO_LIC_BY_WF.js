if ((appTypeArray[2] != "Polygraph Examiner" && wfTask == "Issuance" && wfStatus == "Renewed") ||
(appTypeArray[2] != "Polygraph Examiner" && wfTask == "Issuance" && wfStatus == "Shelved") 
|| (appTypeArray[2] == "Polygraph Examiner" && wfTask == "Renewal Review" && wfStatus == "Complete"))
{
    var vEParams = aa.util.newHashtable();
    var parentCapId = getParentCapID4Renewal();
    var expDateASI = getAppSpecific("Expiration Date", parentCapId);



    //Updating Expiration Date of License
    if (expDateASI != null)
    {
        logDebug("ASI Expdate is: " + expDateASI);
        expDateASI = new Date(expDateASI);
        logDebug("New ASI Exp Date is: " + expDateASI)
        var newExpDate = (expDateASI.getMonth() + 1) + 1 + (expDateASI.getFullYear() + 2);
        logDebug("New Exp Date is: " + newExpDate);

        var DDMMYYYY = jsDateToMMDDYYYY(newExpDate);        
        newExpirationDate = aa.date.parseDate(DDMMYYYY);
              
        logDebug("New Expiration Date is: " + newExpirationDate);
        
        editAppSpecific("Expiration Date", newExpirationDate, parentCapId);
        var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
        if (b1ExpResult.getSuccess())
        {
            var b1Exp = b1ExpResult.getOutput();
            b1Exp.setExpStatus("Active");
            b1Exp.setExpDate(aa.date.parseDate(newExpirationDate));
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            updateAppStatus("Active", "", parentCapId);
            updateTask("Issuance", "Renewed", "", "", "", parentCapId);
        }

        var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");

        if (projIncomplete.getSuccess())
        {
            var projInc = projIncomplete.getOutput();
            for (var pi in projInc)
            {
                parentCapId = projInc[pi].getProjectID();
                projInc[pi].setStatus("Complete");
                var updateresult = aa.cap.updateProject(projInc[pi]);
                logDebug("Renewal " + capId.getCustomID() + " has been set to " + projInc[pi].getStatus());
            }
        }
    }

    else
    {
        var today = new Date();
        logDebug("today's date is " + today);
        // 2 years for licenses
        var nullExpDate = (today.getMonth() + 1) + 1 + (today.getFullYear() + 2);
        newExpirationDate = nullExpDate.toString("MM/dd/yyyy");

        if (appTypeArray[1] == "TLC") // 1 year for TLC
        {
            nullExpDate = (today.getMonth() + 1) + 1 + (today.getFullYear() + 1);
            // DAP-558
            newExpirationDate = nullExpDate.toString("MM/dd/yyyy");
        }
        else
        {
            editAppSpecific("Expiration Date", newExpirationDate, parentCapId);
        }     
        logDebug("null date is " + nullExpDate);
       
        var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
        if (b1ExpResult.getSuccess())
        {
            var b1Exp = b1ExpResult.getOutput();
            b1Exp.setExpStatus("Active");
            b1Exp.setExpDate(aa.date.parseDate(newExpirationDate));
            aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
            updateAppStatus("Active", "", parentCapId);
            updateTask("Issuance", "Pending Renewal", "", "", "", parentCapId);
            activateTask("Issuance");
        } 

        var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");

        if (projIncomplete.getSuccess())
        {
            var projInc = projIncomplete.getOutput();
            for (var pi in projInc)
            {
                parentCapId = projInc[pi].getProjectID();
                projInc[pi].setStatus("Complete");
                var updateresult = aa.cap.updateProject(projInc[pi]);
                logDebug("Renewal " + capId.getCustomID() + " has been set to " + projInc[pi].getStatus());
            }
        }
    }


    /*var capContacts = aa.people.getCapContactByCapID(parentCapId);
    if (capContacts.getSuccess())
    {
        capContacts = capContacts.getOutput();
        logDebug("capContacts: " + capContacts);
        for (var yy in capContacts)
        {
            aa.people.removeCapContact(parentCapId, capContacts[yy].getPeople().getContactSeqNumber());
        }
    }*/
    copyDocuments(capId, parentCapId);
    //copyContacts(capId, parentCapId);
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
    var emailTemplate = "";
    if (!matches(conArray.email, null, undefined, "")) 
    {
        if (appTypeArray[1] != "TLC")
        {
            addParameter(vEParams, "$$expDate$$", newExpirationDate);
        }
        if (appTypeArray[1] == "TLC")
        {
            var curExp = b1Exp.getExpDate();
            if (curExp)
            {
                var tlcExpDate = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
            }
            addParameter(vEParams, "$$expDate$$", tlcExpDate);

        }
        emailTemplate = "CA_LICENSE_RENEWAL_APPLICANT_NOTICE";

        logDebug(parentCapId.getCustomID());
       
        addParameter(vEParams, '$$altID$$', parentCapId.getCustomID());
        conEmail += conArray.email + "; ";
        logDebug("Email addresses: " + conEmail);
        sendNotification("", conEmail, "", emailTemplate, vEParams, null);
    }
}

function jsDateToMMDDYYYY(pJavaScriptDate) {
    //converts javascript date to string in MM/DD/YYYY format
    if (pJavaScriptDate != null)
    {
        if (Date.prototype.isPrototypeOf(pJavaScriptDate))
        {
            return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
        } else
        {
            logDebug("Parameter is not a javascript date");
            return ("INVALID JAVASCRIPT DATE");
        }
    } else
    {
        logDebug("Parameter is null");
        return ("NULL PARAMETER VALUE");
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

function copyASITablesWithRemove(pFromCapId, pToCapId)
{
    // Function dependencies on addASITable()
    // par3 is optional 0 based string array of table to ignore
    var itemCap = pFromCapId;

    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();
    var tableArr = new Array();
    var ignoreArr = new Array();
    var limitCopy = false;
    if (arguments.length > 2)
    {
        ignoreArr = arguments[2];
        limitCopy = true;
    }
    while (tai.hasNext())
    {
        var tsm = tai.next();

        var tempObject = new Array();
        var tempArray = new Array();
        var tn = tsm.getTableName() + "";
        var numrows = 0;

        //Check list
        if (limitCopy)
        {
            var ignore = false;
            for (var i = 0; i < ignoreArr.length; i++)
                if (ignoreArr[i] == tn)
                {
                    ignore = true;
                    break;
                }
            if (ignore)
                continue;
        }
        if (!tsm.rowIndex.isEmpty())
        {
            var tsmfldi = tsm.getTableField().iterator();
            var tsmcoli = tsm.getColumns().iterator();
            var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
            var numrows = 1;
            while (tsmfldi.hasNext()) // cycle through fields
            {
                if (!tsmcoli.hasNext()) // cycle through columns
                {
                    var tsmcoli = tsm.getColumns().iterator();
                    tempArray.push(tempObject); // end of record
                    var tempObject = new Array(); // clear the temp obj
                    numrows++;
                }
                var tcol = tsmcoli.next();
                var tval = tsmfldi.next();

                var readOnly = 'N';
                if (readOnlyi.hasNext())
                {
                    readOnly = readOnlyi.next();
                }

                var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
                tempObject[tcol.getColumnName()] = fieldInfo;
                //tempObject[tcol.getColumnName()] = tval;
            }

            tempArray.push(tempObject); // end of record
        }
        removeASITable(tn, pToCapId)
        addASITable(tn, tempArray, pToCapId);
        logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
    }
}