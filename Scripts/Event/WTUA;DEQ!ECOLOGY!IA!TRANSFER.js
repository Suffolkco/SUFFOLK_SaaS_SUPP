//WTUA:DEQ/Ecology/IA/Transfer

var pin = AInfo["PIN Number"];
var iaNumber = AInfo["IA Record Number"];
var iaEmail = "";


if (wfTask == "Review form and check that documents are correct" && wfStatus == "Complete")
{
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
        var contactResult = aa.people.getCapContactByCapID(wwmIA);
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
        var licProfResult = aa.licenseScript.getLicenseProf(wwmIA);
        var capLPs = licProfResult.getOutput();
        for (l in capLPs)
        {
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

        sendNotification("", conEmail, "", "DEQ_IA_SEPTIC_REGISTRATION", vEParams, null);
    }




    var parentTable = loadASITable("LAB RESULTS AND FIELD DATA", capId);
    var labResultTable = new Array();
    var newRow = new Array();
    for (var l in parentTable)
    {
        newRow["Lab ID"] = labResultsTable[l]["Lab ID"];
        newRow["TN"] = labResultsTable[l]["TN"];
        newRow["NO3 Nitrate"] = labResultsTable[l]["NO3 Nitrate"];
        newRow["NO2 Nitrate"] = labResultsTable[l]["NO2 Nitrate"];
        newRow["TKN"] = labResultsTable[l]["TKN"];
        newRow["NH4 Ammonia"] = labResultsTable[l]["NH4 Ammonia"];
        newRow["BOD"] = labResultsTable[l]["BOD"];
        newRow["TSS"] = labResultsTable[l]["TSS"];
        newRow["ALK"] = labResultsTable[l]["ALK"];
        newRow["DO"] = labResultsTable[l]["DO"];
        newRow["PH"] = labResultsTable[l]["PH"];
        newRow["WW Temp"] = labResultsTable[l]["WW Temp"];
        newRow["Air Temp"] = labResultsTable[l]["Air Temp"];
        labResultTable.push(newRow);
        break;
    }

    addASITable("LAB RESULTS", labResultTable, parentCapId);

}

function copyLicenseProfessional(srcCapId, targetCapId)
{
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

function getAddressInALine(capId)
{

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

function removeAllIASPLicensedProf(pCapId)
{
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

function exploreObject(objExplore)
{

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
function copyASITables(pFromCapId, pToCapId)
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

        addASITable(tn, tempArray, pToCapId);
        logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
    }
} 