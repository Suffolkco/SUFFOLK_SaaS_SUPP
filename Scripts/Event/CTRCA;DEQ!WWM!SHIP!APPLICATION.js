var myCapId = "22TMP-001125";
var myUserId = "RLITTLEFIELD";



/* ASA  */  //var eventName = "ApplicationSubmitAfter";
/* WTUA */  //var eventName = "WorkflowTaskUpdateAfter"; wfTask = "Application Review"; wfStatus = "Conventional - OK to Proceed"; wfDateMMDDYYYY = "01/27/2015"; var wfComment = ''; wfDate = "12/08/2021"; wfStaffUserID = "XRLITT1"; wfHours = "1"; wfDue = "12/09/2021";
/* IRSA */  //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Fail"; inspResultComment = "Comment";  inspType = "Roofing"; inspId = "37361"; inspSchedDate = "12/15/2021";
/* ISA  */  //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
/* PRA  */  //var eventName = "PaymentReceiveAfter";
var eventName = "ConvertToRealCapAfter";
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.  

/* master script code don't touch */ aa.env.setValue("EventName", eventName); var vEventName = eventName; var controlString = eventName; var tmpID = aa.cap.getCapID(myCapId).getOutput(); if (tmpID != null) {aa.env.setValue("PermitId1", tmpID.getID1()); aa.env.setValue("PermitId2", tmpID.getID2()); aa.env.setValue("PermitId3", tmpID.getID3());} aa.env.setValue("CurrentUserID", myUserId); var preExecute = "PreExecuteForAfterEvents"; var documentOnly = false; var SCRIPT_VERSION = 3.0; var useSA = false; var SA = null; var SAScript = null; var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {useSA = true; SA = bzr.getOutput().getDescription(); bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT"); if (bzr.getSuccess()) {SAScript = bzr.getOutput().getDescription();} } if (SA) {eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS", SA, useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript, SA, useProductScript));} else {eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, useProductScript));} eval(getScriptText("INCLUDES_CUSTOM", null, useProductScript)); if (documentOnly) {doStandardChoiceActions2(controlString, false, 0); aa.env.setValue("ScriptReturnCode", "0"); aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed."); aa.abortScript();} var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX", vEventName); var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS"; var doStdChoices = true; var doScripts = false; var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice).getOutput().size() > 0; if (bzr) {var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "STD_CHOICE"); doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I"; var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice, "SCRIPT"); doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";} function getScriptText(vScriptName, servProvCode, useProductScripts) {if (!servProvCode) servProvCode = aa.getServiceProviderCode(); vScriptName = vScriptName.toUpperCase(); var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput(); try {if (useProductScripts) {var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);} else {var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");} return emseScript.getScriptText() + "";} catch (err) {return "";} } logGlobals(AInfo); if (runEvent && typeof (doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString, true, 0);} catch (err) {aa.print(err.message)} if (runEvent && typeof (doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g, "\r"); aa.print(z);

try
{
    var contactResult = aa.people.getCapContactByCapID(capId);
    var capContacts = contactResult.getOutput();
    var emailParams = aa.util.newHashtable();
    var conEmail = "";
    for (c in capContacts)
    {
        if (matches(capContacts[c].getCapContactModel().getContactType(), "Property Owner"))
        {
            if (!matches(capContacts[c].email, null, undefined, ""))
            {
                conEmail += capContacts[c].email + ";"
            }
        }
    }
    
    var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
    if (capParcelResult.getSuccess())
    {
        var Parcels = capParcelResult.getOutput().toArray();
        for (zz in Parcels)
        {
            var parcelNumber = Parcels[zz].getParcelNumber();
            logDebug("parcelNumber = " + parcelNumber);
        }
    }
    
    var addrResult = getAddressInALine(capId);
    
    var vEParams = aa.util.newHashtable();
    var addrResult = getAddressInALine(capId);
    addParameter(vEParams, "$$altID$$", capId.getCustomID());
    addParameter(vEParams, "$$address$$", addrResult);
    addParameter(vEParams, "$$Parcel$$", parcelNumber);
    addParameter(vEParams, "$$FullNameBusName$$", capContacts[c].getCapContactModel().getContactName());
    
    sendNotification("", conEmail, "", "DEQ_SHIP_HOMEOWNER", vEParams, null);
    
    //EHIMS2-35 - WWM Liquid Waste LP check
    
    var greaseTrap = getAppSpecific("In-Kind Grease Trap Replacement");
    var septicInstall = getAppSpecific("Septic Tank Installation");
    var iaOwts = getAppSpecific("I/A OWTS Installation");
    var leachingPool = getAppSpecific("Leaching Pool(s)/Galley(s) Installation");
    var shallowDrainfield = getAppSpecific("Pressurized Shallow Drainfield Installation");
    var gravity = getAppSpecific("Gravity (Trench or Bed) Drainfield Installation");
    var other = getAppSpecific("Other");
    var saniDecommission = getAppSpecific("Existing Sanitary System Decommissioning ONLY");
    var pumpOutOnly = getAppSpecific("Pump Out ONLY");
    var lw9Req = false;
    var lw9Found = false;
    var lw10Req = false;
    var lw10Found = false;
    var lw127Req = false;
    var lw127Found = false;
    var conditionAddAndEmail = false;
    var endorsementArray = new Array();
    var lpList = aa.licenseScript.getLicenseProf(capId);
    logDebug("lplist is: " + lpList);
    
    if (greaseTrap == "CHECKED" || septicInstall == "CHECKED" || leachingPool == "CHECKED" || gravity == "CHECKED")
    {
        lw9Req = true;
    }
    if (iaOwts == "CHECKED" || shallowDrainfield == "CHECKED")
    {
        lw10Req = true;
    }
    if (pumpOutOnly == "CHECKED")
    {
        lw127Req = true;
    }
    if (lpList && lpList != null)
    {
        var lpArray = lpList.getOutput();
        logDebug("lparray is: " + lpArray);
    
        for (i in lpArray)
        {
            if (!matches(lpArray[i].getLicenseNbr(), "", null) && !matches(lpArray[i].getLicenseType(), "", null))
            {
                if (lpArray[i].getLicenseType() == "WWM Liquid Waste")
                {
                    logDebug("license number is: " + lpArray[i].getLicenseNbr());
                    var licNo = lpArray[i].getLicenseNbr();
                    logDebug("licno is: " + licNo);
                    logDebug("license type is: " + lpArray[i].getLicenseType());
                    logDebug("Professional types are: " + lpArray[i].getAddress3());
                    endorsementArray = lpArray[i].getAddress3().split(", ");
                    //logDebug("endorsementArray is: " + endorsementArray);
                    var lpRecord = aa.cap.getCapID(lpArray[i].getLicenseNbr()).getOutput();
                    if (!matches(lpRecord, "", null, undefined))
                    {
                        logDebug("lpRecord is: " + lpRecord);
                        logDebug("lpRecord AltID is: " + lpRecord.getCustomID());
                        addParameter(emailParams, "$$lpRecord$$", lpRecord.getCustomID());
                    }
                    else
                    {
                        var licNoText = "Professional number: " + licNo + " (not linked to a record.)";
                        addParameter(emailParams, "$$lpRecord$$", licNoText);
                    }
                    for (endors in endorsementArray)
                    {
                        logDebug("endorsement array entry is: " + endorsementArray[endors]);
                        if (endorsementArray[endors] == "LW9")
                        {
                            lw9Found = true;
                        }
                        if (endorsementArray[endors] == "LW10")
                        {
                            lw10Found = true;
                        }
                        if (matches(endorsementArray[endors], "LW1", "LW2", "LW7"))
                        {
                            lw127Found = true;
                        }
                    }
                }
            }
        }
        if ((lw9Req && !lw9Found) || (lw10Req && !lw10Found) || (lw127Req && !lw127Found))
        {
            conditionAddAndEmail = true;
        }
    }
    
    if (conditionAddAndEmail)
    {
        addStdCondition("DEQ", "Check WWM Liquid Waste LP Endorsement", capId);
        addParameter(emailParams, "$$altID$$", capId.getCustomID());
        sendNotification("", "ryan.littlefield@scubeenterprise.com", "", "DEQ_WWM_LIQUID_WASTE_LP_NOTIFICATION", emailParams, null);
    }
    
}

catch (err)
{
    aa.print("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
}
// end user code
aa.env.setValue("ScriptReturnCode", "0"); aa.env.setValue("ScriptReturnMessage", debug);

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

function capIdsGetByAddrNullCheckLocal(ats) {
    //Gets CAPs with the same address as the current CAP, as capId (CapIDModel) object array (array includes current capId)
    //07SSP-00034/SP5015
    //CSG Modified Accela function capIdsGetByAddr() to not crash when an empty address is inserted when submitted via ACA
    //Get address(es) on current CAP
    var addrResult = aa.address.getAddressByCapId(capId);
    if (!addrResult.getSuccess())
    {
        logDebug("**ERROR: getting CAP addresses: " + addrResult.getErrorMessage());
        return false;
    }

    var addrArray = new Array();
    var addrArray = addrResult.getOutput();
    if (addrArray.length == 0 || addrArray == undefined)
    {
        logDebug("The current CAP has no address.  Unable to get CAPs with the same address.")
        return false;
    }

    //use 1st address for comparison
    var streetName = addrArray[0].getStreetName();
    var hseNum = addrArray[0].getHouseNumberStart();
    var streetSuffix = addrArray[0].getStreetSuffix();
    var zip = addrArray[0].getZip();
    var streetDir = addrArray[0].getStreetDirection();

    if (streetDir == "")
        streetDir = null;
    if (streetSuffix == "")
        streetSuffix = null;
    if (zip == "")
        zip = null;

    if (hseNum && !isNaN(hseNum))
    {
        hseNum = parseInt(hseNum);
    } else
    {
        hseNum = null;
    }

    // get caps with same address, includig null check
    if (streetName != null || hseNum != null || streetSuffix != null || zip != null || streetDir != null)
    {
        var capAddResult = aa.cap.getCapListByDetailAddress(streetName, hseNum, streetSuffix, zip, streetDir, null);
        if (capAddResult.getSuccess())
            var capArray = capAddResult.getOutput();
        else
        {
            logDebug("**ERROR: getting similar addresses: " + capAddResult.getErrorMessage());
            return false;
        }
    }
    else
    {
        logDebug("All address search field are null, skipping address");
    }

    //convert CapIDScriptModel objects to CapIDModel objects
    var capIdArray = new Array();

    for (cappy in capArray)
    {
        // skip if current cap
        if (capId.getCustomID().equals(capArray[cappy].getCustomID()))
            continue;

        // get cap id
        var relcap = aa.cap.getCap(capArray[cappy].getCapID()).getOutput();


        // get cap type

        var reltypeArray = relcap.getCapType().toString().split("/");

        var isMatch = true;
        var ata = ats.split("/");
        if (ata.length != 4)
            logDebug("**ERROR: The following Application Type String is incorrectly formatted: " + ats);
        else
            for (xx in ata)
                if (!ata[xx].equals(reltypeArray[xx]) && !ata[xx].equals("*"))
                    isMatch = false;

        if (isMatch)
            capIdArray.push(capArray[cappy].getCapID());

    }

    //for (i in capArray)
    //capIdArray.push(capArray[i].getCapID());

    if (capIdArray)
        return (capIdArray);
    else
        return false;
}
function editAppSpecificLOCAL(itemName, itemValue)  // optional: itemCap
{
    var updated = false;
    var i = 0;
    itemCap = capId;
    if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0)
        {logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false}
        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess())
    {
        var appspecObj = appSpecInfoResult.getOutput();
        if (itemName != "")
        {
            while (i < appspecObj.length && !updated)
            {
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup))
                {
                    appspecObj[i].setChecklistComment(itemValue);
                    var actionResult = aa.appSpecificInfo.editAppSpecInfos(appspecObj);
                    if (actionResult.getSuccess()) 
                    {
                        logDebug("app spec info item " + itemName + " has been given a value of " + itemValue);
                    }
                    else 
                    {
                        logDebug("**ERROR: Setting the app spec info item " + itemName + " to " + itemValue + " .\nReason is: " + actionResult.getErrorType() + ":" + actionResult.getErrorMessage());
                    }
                    updated = true;
                    AInfo[itemName] = itemValue;  // Update array used by this script
                }
                i++;
            } // while loop
        } // item name blank
    } // got app specific object    
    else
    {
        logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage());
    }
}//End Function
function logDebugLocal(dstr) {
    if (showDebug)
    {
        aa.print(dstr)
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}

function getNewestRelatedChildByType(pCapType, pParentCapId) {
    var getCapResult = aa.cap.getChildByMasterID(pParentCapId);
    var childArray = getCapResult.getOutput();
    var childCapId;
    var capTypeStr = "";
    var newChildArray = new Array();
    var childArrayByDate = new Array();
    var maxDate;
    var childDate;
    for (yy in childArray)
    {
        childCapId = childArray[yy].getCapID();
        capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")

        if (capTypeStr == pCapType)
        {
            newChildArray.push(childCapId);
        }
    }

    for (child in newChildArray)
    {
        childDate = aa.cap.getCap(newChildArray[child]).getOutput().getFileDate();
        logDebug("child record is: " + newChildArray[child].getCustomID() + " and the file date is: " + convertDate(childDate));

        childArrayByDate.push(convertDate(childDate));
    }
    logDebug("childarraybydate is: " + childArrayByDate);
    maxDate = Math.max.apply(null, childArrayByDate);
    maxDate = new Date(maxDate);
    maxDate = (maxDate.getMonth() + 1) + "/" + maxDate.getDate() + "/" + maxDate.getFullYear();
    logDebug("maxdate is: " + maxDate);

    for (child in newChildArray)
    {
        childDate = convertDate(aa.cap.getCap(newChildArray[child]).getOutput().getFileDate());
        childDate = (childDate.getMonth() + 1) + "/" + childDate.getDate() + "/" + childDate.getFullYear();
        logDebug("maxdate is: " + maxDate + " and child submit date is " + childDate);
        if (maxDate == childDate)
        {
            var newestChild = newChildArray[child];
            logDebug("newest child is: " + newestChild.getCustomID());
        }
    }
    return newestChild
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
function getContactName(vConObj) {
    if (vConObj.people.getContactTypeFlag() == "organization")
    {
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
    else
    {
        if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "")
        {
            return vConObj.people.getFullName();
        }
        if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null)
        {
            return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
        }
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
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
function getContactName(vConObj) {
    if (vConObj.people.getContactTypeFlag() == "organization")
    {
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
    else
    {
        if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "")
        {
            return vConObj.people.getFullName();
        }
        if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null)
        {
            return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
        }
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
}