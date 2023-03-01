//WTUA:DEQ/Ecology/IA/Transfer

var pin = AInfo["PIN Number"];
var iaNumber = AInfo["IA Record Number"];
var iaEmail = "";
var contractStart = getAppSpecific("Contract Start Date", capId);
var term = getAppSpecific("Term", capId);
var contractAnualCost = getAppSpecific("Contract Annual Cost", capId);
var serviceDate = getAppSpecific("Service Date", capId);
var sampleDates = [];
var maxDate;
var maxDatePlusThree;
var conUpdate = getAppSpecific("Contract Update", capId);
var serviceReport = getAppSpecific("Service Report", capId);
var sampleResults = getAppSpecific("Sample Results", capId);
var labResultFieldDataTable = loadASITable("LAB RESULTS AND FIELD DATA");
var myCap = capId;
var myCustomCap = myCap.getCustomID();



if (wfTask == "Review form and check that documents are correct" && wfStatus == "Complete") 
{
    if (sampleResults == "CHECKED")
    {
        if (labResultFieldDataTable)
        {
            if (labResultFieldDataTable.length >= 1)
            {
                for (var p in labResultFieldDataTable)
                {
                    var sampleDate = new Date(labResultFieldDataTable[p]["Sample Collection Date"]);
                    logDebug("date is: " + sampleDate);
                    sampleDates.push(sampleDate);
                    var collectionDate = labResultFieldDataTable[p]["Sample Collection Date"];
                }
            }
        }
        if (sampleDates)
        {
            logDebug("sampledates is: " + sampleDates);
            maxDate = Math.max.apply(null, sampleDates);
            maxDate = new Date(maxDate);
            maxDatePlusThree = new Date(maxDate);
            maxDate = (maxDate.getMonth() + 1) + "/" + maxDate.getDate() + "/" + maxDate.getFullYear()
            logDebug("maxdate is: " + maxDate);
            logDebug("maxdateplusthree is: " + maxDatePlusThree);
            maxDatePlusThree = (maxDatePlusThree.getMonth() + 1) + "/" + maxDatePlusThree.getDate() + "/" + (maxDatePlusThree.getFullYear() + 3);
            editAppSpecificLOCAL("Next Sample Date", maxDatePlusThree, parentCapId);
            editAppSpecificLOCAL("Most Recent MFR Sample", maxDate, parentCapId)
            var parentReturnArray = new Array();
            var parentRecursiveCheck = getParentRecursive("DEQ/General/Site/NA", capId, 0, parentReturnArray);
            for (par in parentReturnArray)
            {
                logDebug("parent in parentreturnarray is: " + parentReturnArray[par].getCustomID());
                var siteParent = parentReturnArray[par];
            }
            if (siteParent != undefined)
            {
                editAppSpecificLOCAL("O&M Contract Approved", sysDateMMDDYYYY, siteParent);
            }

            var phase = getAppSpecific("Phase", capId);
            var collector = getAppSpecific("Collector", capId);
            var fieldId = getAppSpecific("Field ID", capId);

            var tableForParent = loadASITable("LAB RESULTS AND FIELD DATA", capId);
            var labResultsTable = new Array();
            for (var l in tableForParent)
            {
                var newRow = new Array();
                newRow["Sample Date"] = tableForParent[l]["Sample Collection Date"];
                newRow["Lab ID"] = tableForParent[l]["Lab ID"];
                newRow["TN"] = tableForParent[l]["TN"];
                newRow["NO3 Nitrate"] = tableForParent[l]["NO3 Nitrate"];
                newRow["NO2 Nitrite"] = tableForParent[l]["NO2 Nitrite"];
                newRow["TKN"] = tableForParent[l]["TKN"];
                newRow["NH4 Ammonia"] = tableForParent[l]["NH4 Ammonia"];
                newRow["BOD"] = tableForParent[l]["BOD"];
                newRow["TSS"] = tableForParent[l]["TSS"];
                newRow["ALK"] = tableForParent[l]["ALK"];
                newRow["DO"] = tableForParent[l]["DO"];
                newRow["PH"] = tableForParent[l]["PH"];
                newRow["WW Temp"] = tableForParent[l]["WW Temp"];
                newRow["Air Temp"] = tableForParent[l]["Air Temp"];
                newRow["Process"] = tableForParent[l]["Process"];
                newRow["Collection"] = tableForParent[l]["Collection"];
                newRow["Lab"] = tableForParent[l]["Lab"];
                newRow["Comment"] = tableForParent[l]["Comment"]
                newRow["Status"] = wfStatus;
                newRow["Source"] = myCustomCap;
                newRow["Phase"] = phase;
                // newRow["Process"] = process;
                // newRow["Collection"] = collection;
                newRow["Collector"] = collector;
                newRow["Field ID"] = fieldId;
                // newRow["Lab"] = lab;

                labResultsTable.push(newRow);
                break;
            }

            addASITable("LAB RESULTS", labResultsTable, parentCapId);
        }

    }

    if (conUpdate == "CHECKED")
    {
        var capContacts = aa.people.getCapContactByCapID(parentCapId);
        if (capContacts.getSuccess())
        {
            capContacts = capContacts.getOutput();
            logDebug("capContacts: " + capContacts);

            for (var yy in capContacts)
            {
                //aa.people.removeCapContact(parentCapId, capContacts[yy].getPeople().getContactSeqNumber());

                if (capContacts[yy].getPeople().getAuditStatus() == "A")
                {
                    capContacts[yy].getPeople().setAuditStatus("I");
                    aa.people.editCapContact(capContacts[yy].getCapContactModel());
                    logDebug("Contact Status: " + capContacts[yy].getPeople().getAuditStatus());
                    logDebug("We Got in here");
                }
            }
        }

        copyContacts(capId, parentCapId);

        var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("IA PIN Number", pin);
        if (getCapResult.getSuccess())
        {
            var apsArray = getCapResult.getOutput();
            for (aps in apsArray)
            {
                myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
                logDebug("apsArray = " + apsArray);
                var relCap = myCap.getCapID();
                var relCapID = relCap.getCustomID();
            }
        }

        var getCapResult = aa.cap.getCapID(iaNumber);
        if (getCapResult.getSuccess() && matches(relCapID, iaNumber))
        {
            var wwmIA = getCapResult.getOutput();

            logDebug("wwmIA = " + wwmIA.getCustomID());

            //Removing Existing LPs

            iaEmail = removeAllIASPLicensedProf(wwmIA);
            logDebug("iaEmail = " + iaEmail);
            if (iaEmail != "")
            {
                var vEParams = aa.util.newHashtable();
                var addrResult = getAddressInALine(wwmIA);
                addParameter(vEParams, "$$altID$$", relCapID);
                addParameter(vEParams, "$$address$$", addrResult);
                sendNotification("", iaEmail, "", "DEQ_IA__OWTS_REMOVAL", vEParams, null);
            }

            copyLicenseProfessional(capId, wwmIA);
            logDebug("Added License Professional");

            //Gathering Contacts from IA Record
            var contactResult = aa.people.getCapContactByCapID(capId);
            var capContacts = contactResult.getOutput();
            var conEmail = "";
            for (c in capContacts)
            {
                if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Agent"))
                {
                    if (!matches(capContacts[c].email, null, undefined, ""))
                    {
                        conEmail += capContacts[c].email + ";"
                    }
                }
            }

            //Gathering LPs from IA Record
            var licProfResult = aa.licenseScript.getLicenseProf(capId);

            var capLPs = licProfResult.getOutput();
            for (l in capLPs)
            {
                if (capLPs[l].getLicenseType() == "IA Service Provider")
                {
                    var busName = capLPs[l].getBusinessName()
                }
                if (!matches(capLPs[l].email, null, undefined, ""))
                {
                    conEmail += capLPs[l].email + ";"
                }
            }

            logDebug("ConEmail = " + conEmail);

            var vEParams = aa.util.newHashtable();
            var addrResult = getAddressInALine(wwmIA);
            addParameter(vEParams, "$$altID$$", relCapID);
            addParameter(vEParams, "$$address$$", addrResult);
            addParameter(vEParams, "$$busName$$", busName);

            sendNotification("", conEmail, "", "DEQ_IA_SEPTIC_REGISTRATION", vEParams, null);
        }
    }

    if (contractStart != null)
    {
        editAppSpecificLOCAL("Contract Start Date", contractStart, parentCapId);
        editAppSpecificLOCAL("Contract Term", term, parentCapId);
        contractStart = new Date(contractStart);
        var newExpDate = (contractStart.getMonth() + 1) + "/" + (contractStart.getDate()) + "/" + (contractStart.getFullYear() + Number(term));
        editAppSpecificLOCAL("Contract Expiration Date", newExpDate, parentCapId);
        updateShortNotes("Contract Expiration: " + newExpDate, parentCapId);
    }

    if (contractAnualCost != null)
    {
        editAppSpecificLOCAL("Contract Annual Cost", contractAnualCost, parentCapId);
    }

    if (serviceReport == "CHECKED")
    {
        if (serviceDate != null)
        {
            serviceDate = new Date(serviceDate);
            var newServiceDate = (serviceDate.getMonth() + 1 + "/" + (serviceDate.getDate()) + "/" + (serviceDate.getFullYear() + 1));
            editAppSpecificLOCAL("Next Service Date", newServiceDate, parentCapId);
        }
    }

    var use = getAppSpecific("Use", capId);
    editAppSpecificLOCAL("Use", use, parentCapId);

    //EHIMS2-163
    var getAParent = getParentByCapId(capId);
    var shipRecord;
    var wwmComRecord;
    var wwmResRecord;
    logDebug("getparent is returning: " + getAParent.getCustomID());


    if (getAParent)
    {
        var getGParent = getParentByCapId(getAParent);

        if (getGParent)
        {
            logDebug("getGParent is: " + getGParent.getCustomID());

            if (appMatch("DEQ/WWM/SHIP/Application", getGParent))
            {
                shipRecord = getGParent;
                logDebug("app type is a SHIP application");
                editAppSpecificLOCAL("O&M Contract Approved", sysDateMMDDYYYY, shipRecord);
                //
                if (getAppStatus(shipRecord) == "Awaiting O&M Contract")
                {
                    var allSHIPEmail = "";
                    //grabbing contacts from SHIP record and processing them
                    var contactResult = aa.people.getCapContactByCapID(shipRecord);
                    var capContacts = contactResult.getOutput();
                    var vEParams = aa.util.newHashtable();
                    var addrResult = getAddressInALine(shipRecord);
                    addParameter(vEParams, "$$altID$$", shipRecord.getCustomID());
                    addParameter(vEParams, "$$address$$", addrResult);
                    addParameter(vEParams, "$$wfComment$$", wfComment);
                    //adding property owner and agent contacts from the SHIP record to the intended email recipients
                    for (c in capContacts)
                    {
                        if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Agent"))
                        {
                            if (!matches(capContacts[c].email, null, undefined, ""))
                            {
                                allSHIPEmail += capContacts[c].email + ";";
                            }
                        }
                    }
                    //grabbing LPs from SHIP record and processing them
                    var lpResult = aa.licenseScript.getLicenseProf(shipRecord);
                    if (lpResult.getSuccess())
                    {
                        var lpArr = lpResult.getOutput();

                        //adding LP emails to var allSHIPEmail so that they also get the email sent below
                        for (var lp in lpArr)
                        {
                            if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
                            {
                                allSHIPEmail += lpArr[lp].email + ";";
                            }
                        }
                    }
                    else 
                    {
                        logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage());
                    }
                    var rcReportParams = aa.util.newHashtable();
                    var rcReportFile = new Array();

                    addParameter(rcReportParams, "RecordId", shipRecord.getCustomID().toString());
                    rcReportFile = generateReportBatch(shipRecord, "Registration Complete Report", 'DEQ', rcReportParams)
                    logDebug("This is the rFile: " + rcReportFile);

                    if (rcReportFile)
                    {
                        var rcRFiles = new Array();
                        //need to store the current cap of the IAT record for now, since for the below code to work, we need to be running some of these functions against the SHIP's capId, and some of these functions do not allow the capid to be passed in
                        var capTemp = capId;
                        //switching to ship record id
                        capId = shipRecord;

                        var docList = getDocumentList();
                        var docDates = [];
                        var maxDate;

                        for (doc in docList)
                        {
                            if (matches(docList[doc].getDocCategory(), "Design Professional Sketch", "Preliminary Sketch"))
                            {
                                logDebug("document type is: " + docList[doc].getDocCategory() + " and upload datetime of document is: " + docList[doc].getFileUpLoadDate().getTime());
                                docDates.push(docList[doc].getFileUpLoadDate().getTime());
                                maxDate = Math.max.apply(null, docDates);
                                logDebug("maxdate is: " + maxDate);

                                if (docList[doc].getFileUpLoadDate().getTime() == maxDate)
                                {
                                    var docType = docList[doc].getDocCategory();
                                    var docFileName = docList[doc].getFileName();
                                }
                            }
                        }
                        //preparing most recent sketch document for email attachment
                        var docToSend = prepareDocumentForEmailAttachment(capId, "Preliminary Sketch", docFileName);
                        logDebug("docToSend" + docToSend);
                        docToSend = docToSend === null ? [] : [docToSend];
                        if (!matches(docToSend, null, undefined, ""))
                        {
                            rcRFiles.push(docToSend);
                        }
                        rcRFiles.push(rcReportFile);
                    }
                    if (rcRFiles != undefined)
                    {
                        sendNotification("", allSHIPEmail, "", "DEQ_SHIP_REGISTRATION_COMPLETE", vEParams, rcRFiles);
                    }
                    updateTask("Final Review", "Registration Complete", "", "");
                    deactivateAllActiveTasks(capId);
                    capId = capTemp;
                }
            }
        }
        if (appMatch("DEQ/WWM/Commercial/Application", getGParent) || appMatch("DEQ/WWM/Residence/Application", getGParent))
        {
            wwmRecord = getGParent;
            editAppSpecificLOCAL("O&M Contract Approved", sysDateMMDDYYYY, wwmRecord);

            if (getAppStatus(wwmRecord) == "Awaiting O&M Contract")
            {
                var allWWMEmail = "";
                //grabbing contacts from COM record and processing them
                var contactResult = aa.people.getCapContactByCapID(wwmRecord);
                var capContacts = contactResult.getOutput();
                var vEParams = aa.util.newHashtable();
                var addrResult = getAddressInALine(wwmRecord);
                var shortNotes = getShortNotes(wwmRecord);
                var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

                addParameter(vEParams, "$$acaURL$$", acaSite);
                addParameter(vEParams, "$$altID$$", wwmRecord.getCustomID());
                addParameter(vEParams, "$$address$$", addrResult);
                addParameter(vEParams, "$$wfComment$$", wfComment);
                addParameter(vEParams, "$$shortNotes$$", shortNotes);

                //adding property owner and agent contacts from the WWM record to the intended email recipients
                for (c in capContacts)
                {
                    if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner", "Agent", "Applicant", "Designer"))
                    {
                        if (!matches(capContacts[c].email, null, undefined, ""))
                        {
                            allWWMEmail += capContacts[c].email + ";";
                        }
                    }
                }
                var capTemp = capId;
                capId = wwmRecord;
                //this next section needs to be commented out until no more paper applications are received

                //sendNotification("", allWWMEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", vEParams, null);
                //updateTask("Final Review", "Approved", "", "");
                //updateAppStatus("O&M Contract Approved", "", capId);
                //deactivateAllActiveTasks(capId);
                capId = capTemp;
            }
        }
    }
}





function copyLicenseProfessional(srcCapId, targetCapId) {
    //1. Get license professionals with source CAPID.
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0)
    {
        return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses)
    {
        sourcelicProfModel = capLicenses[loopk];
        //3.1 Set target CAPID to source lic prof.
        sourcelicProfModel.setCapID(targetCapId);
        targetLicProfModel = null;
        //3.2 Check to see if sourceLicProf exist.
        if (targetLicenses != null && targetLicenses.length > 0)
        {
            for (loop2 in targetLicenses)
            {
                if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
                {
                    targetLicProfModel = targetLicenses[loop2];
                    break;
                }
            }
        }
        //3.3 It is a matched licProf model.
        if (targetLicProfModel != null)
        {
            //3.3.1 Copy information from source to target.
            aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
            //3.3.2 Edit licProf with source licProf information. 
            aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
        }
        //3.4 It is new licProf model.
        else
        {
            //3.4.1 Create new license professional.
            aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
        }
    }
}

function getAddressInALine(capId) {

    var capAddrResult = aa.address.getAddressByCapId(capId);
    var addressToUse = null;
    var strAddress = "";

    if (capAddrResult.getSuccess())
    {
        var addresses = capAddrResult.getOutput();
        if (addresses)
        {
            for (zz in addresses)
            {
                capAddress = addresses[zz];
                if (capAddress.getPrimaryFlag() && capAddress.getPrimaryFlag().equals("Y"))
                    addressToUse = capAddress;
            }
            if (addressToUse == null)
                addressToUse = addresses[0];

            if (addressToUse)
            {
                strAddress = addressToUse.getHouseNumberStart();
                var addPart = addressToUse.getStreetDirection();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetName();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getStreetSuffix();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getCity();
                if (addPart && addPart != "")
                    strAddress += " " + addPart + ",";
                var addPart = addressToUse.getState();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                var addPart = addressToUse.getZip();
                if (addPart && addPart != "")
                    strAddress += " " + addPart;
                return strAddress
            }
        }
    }
    return null;
}

function removeAllIASPLicensedProf(pCapId) {
    //Function will remove all licensed professionals from the pCapId record.
    var iaServProvEmail = "";
    var capLicenseResult = aa.licenseScript.getLicenseProf(pCapId);
    if (capLicenseResult.getSuccess())
    {
        var capLicenseArr = capLicenseResult.getOutput();
        for (var currLic in capLicenseArr)
        {
            var thisLP = capLicenseArr[currLic];
            logDebug("This LP is " + thisLP);
            if (thisLP.getLicenseType() == "IA Service Provider")
            {
                iaServProvEmail = thisLP.getEmail();
                logDebug("iaServProvEmail = " + iaServProvEmail)
                var remCapResult = aa.licenseProfessional.removeLicensedProfessional(thisLP);
                logDebug("Removed " + thisLP.getLicenseNbr());
            }
        }
    }
    else 
    {
        logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage());
        return false;
    }
    if (!matches(iaServProvEmail, "", null, " ", undefined))
    {
        return iaServProvEmail;
    }
    else 
    {
        logDebug("no IA Service Provider email was returned");
    }
}

function exploreObject(objExplore) {

    logDebug("Methods:")
    for (x in objExplore)
    {
        if (typeof (objExplore[x]) == "function")
        {
            logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
            logDebug("   " + objExplore[x] + "<br>");
        }
    }

    logDebug("");
    logDebug("Properties:")
    for (x in objExplore)
    {
        if (typeof (objExplore[x]) != "function")
            logDebug("  <b> " + x + ": </b> " + objExplore[x]);
    }

}
function copyASITables(pFromCapId, pToCapId) {
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

        addASITable(tn, tempArray, pToCapId);
        logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
    }
}
function getParentRecursive(pCapType, itemCap, depth, retArray) {
    var i = 1;
    while (true)
    {
        if (!(aa.cap.getProjectParents(capId, i).getSuccess()))
            break;

        i += 1;
    }
    i -= 1;

    if (depth > 9)
    {
        return retArray;
    }
    logDebug("Inside depth: " + depth + " current CapID: " + itemCap.getCustomID());
    var depthCount = depth + 1;
    var typeArray = pCapType.split("/");
    var getCapResult = aa.cap.getProjectParents(itemCap, i);
    var parentArray = getCapResult.getOutput();
    var vParentCapId;
    var capTypeStr = "";
    var childTypeArray;
    var isMatch;
    var newParentArray = new Array();
    for (xx in parentArray)
    {
        vParentCapId = parentArray[xx].getCapID();
        capTypeStr = aa.cap.getCap(vParentCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
        childTypeArray = capTypeStr.split("/");
        isMatch = true;
        for (yy in childTypeArray) //looking for matching cap type
        {
            if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
            {
                isMatch = false;
                continue;
            }
        }
        if (isMatch)
        {
            newParentArray.push(vParentCapId);
            retArray.push(vParentCapId);
            logDebug("It was a match: " + vParentCapId.getCustomID());

        }
    }
    for (grand in newParentArray)
    {
        getParentRecursive(pCapType, newParentArray[grand], depthCount, retArray)
    }
    return retArray;
}

function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0) {logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true"); return false}


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
                else {logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");}
            }
            else {logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");}
        }
    }
    else
    {
        logDebug("ERROR: (editAppSpecific)" + asiFieldResult.getErrorMessage());
    }
}
function generateReportBatch(itemCap, reportName, module, parameters) {
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    if (!report.getSuccess() || report.getOutput() == null)
    {
        logDebug("**WARN report generation failed, missing report or incorrect name: " + reportName);
        return false;
    }
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap); //CSG Updated from itemCap.getCustomID() to just itemCap so the file would save to Record
    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName, user);

    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            return reportFile;
        } else
        {
            logDebug("**WARN System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else
    {
        logDebug("You have no permission.");
        return false;
    }
}