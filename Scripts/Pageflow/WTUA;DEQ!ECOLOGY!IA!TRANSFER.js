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
            editAppSpecific("Next Sample Date", maxDatePlusThree, parentCapId);
            editAppSpecific("Most Recent MFR Sample", maxDate, parentCapId)
            var parentReturnArray = new Array();
            var parentRecursiveCheck = getParentRecursive("DEQ/General/Site/NA", capId, 0, parentReturnArray);
            for (par in parentReturnArray)
            {
                logDebug("parent in parentreturnarray is: " + parentReturnArray[par].getCustomID());
                var siteParent = parentReturnArray[par];
            }
            editAppSpecific("O&M Contract Approved", sysDateMMDDYYYY, siteParent);

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

            var myCap = capId;
            var myCustomCap = myCap.getCustomID();

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
                logDebug("Added License Profoessinal");

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
            editAppSpecific("Contract Start Date", contractStart, parentCapId);
            editAppSpecific("Contract Term", term, parentCapId);
            contractStart = new Date(contractStart);
            var newExpDate = (contractStart.getMonth() + 1) + "/" + (contractStart.getDate()) + "/" + (contractStart.getFullYear() + Number(term));
            editAppSpecific("Contract Expiration Date", newExpDate, parentCapId);
            updateShortNotes("Contract Expiration: " + newExpDate, parentCapId);
        }

        if (contractAnualCost != null)
        {
            editAppSpecific("Contract Annual Cost", contractAnualCost, parentCapId);
        }

        if (serviceReport == "CHECKED")
        {
            if (serviceDate != null)
            {
                serviceDate = new Date(serviceDate);
                var newServiceDate = (serviceDate.getMonth() + 1 + "/" + (serviceDate.getDate()) + "/" + (serviceDate.getFullYear() + 1));
                editAppSpecific("Next Service Date", newServiceDate, parentCapId);
            }
        }

        var use = getAppSpecific("Use", capId);
        editAppSpecific("Use", use, parentCapId);

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