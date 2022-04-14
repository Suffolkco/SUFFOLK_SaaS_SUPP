var parent = parentCapId.getCustomID();
var useAppSpecificGroupName = true;
var startDate = getAppSpecificLOCAL("OPERATIONS CONTRACT.Contract Start Date");
logDebug("startDate = " + startDate);
var term = getAppSpecificLOCAL("OPERATIONS CONTRACT.Contract Term");
var annualCost = getAppSpecificLOCAL("OPERATIONS CONTRACT.Contract Annual Cost");
var installDate = getAppSpecificLOCAL("INSTALLATION DATE.Date of Installation");
var make = getAppSpecificLOCAL("I/A OWTS.Make");
var model = getAppSpecificLOCAL("I/A OWTS.Model");
var leachType = getAppSpecificLOCAL("LEACHING POOLS/GALLEYS.Type");
var leachProduct = getAppSpecificLOCAL("OTHER LEACHING STRUCTURES.Leaching Product");
var effluentPump = getAppSpecificLOCAL("LEACHING POOLS/GALLEYS.Effluent Pump Manufacturer");
var propertyUse = getAppSpecificLOCAL("OPERATIONS CONTRACT.Property Usage")
var contactResult = aa.people.getCapContactByCapID(capId);
var capContacts = contactResult.getOutput();
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

logDebug("Parent = " + parent);

if (wfTask == "Submission Review" && wfStatus == "SHIP Record Complete") 
{
    var desc = "Automated via:" + capIDString;
    var wwmIA = createChild('DEQ', 'Ecology', 'IA', 'Application', desc, parentCapId);
    editAppSpecificLOCAL("WWM APPLICATION NUMBER.WWM Application Number", parent, wwmIA);
    editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Start Date", startDate, wwmIA);
    editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Term", term, wwmIA);
    editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Annual Cost", annualCost, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Installation Date", installDate, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Leaching", leachType, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Leaching Manufacturer", leachProduct, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Effluent Pump", effluentPump, wwmIA);
    editAppSpecificLOCAL("PROPERTY INFORMATION.Use", propertyUse, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Manufacturer", make, wwmIA)
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Model", model, wwmIA)
    copyAddress(capId, wwmIA);
    copyContactsByType(capId, wwmIA, "Property Owner");
    //copyContactsByType(capId, wwmIA, "Agent");
    copyParcel(capId, wwmIA);
    copyLicensedProfByType(capId, wwmIA, ["IA Installer"]);
    //copyLicensedProfByType(capId, wwmIA, ["IA Service Provider"]);
    //copyLicensedProfByType(capId, wwmIA, ["IA Designer"]);
    copyDocuments(capId, wwmIA, "Final Site Sketch");
    //updateTask("Final Review", "Registration Complete", "", "", "", parentCapId);
    closeTaskByCap("Final Review", parentCapId, "Registration Complete", "", "");
    logDebug("Parent = " + parentCapId)

    if (startDate != null)
    {

        contractStart = new Date(startDate);
        var newExpDate = (contractStart.getMonth() + 1) + "/" + (contractStart.getDate()) + "/" + (contractStart.getFullYear() + Number(term));
        editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Expiration Date", newExpDate, wwmIA);
    }

    if (installDate != null)
    {
        installDate = new Date(installDate);
        var newServiceDate = (installDate.getMonth() + 1 + "/" + (installDate.getDate()) + "/" + (installDate.getFullYear() + 1));
        editAppSpecificLOCAL("CONTRACT INFORMATION.Next Service Date", newServiceDate, wwmIA);
        var newSampleDate = (installDate.getMonth() + 1 + "/" + (installDate.getDate()) + "/" + (installDate.getFullYear() + 3));
        editAppSpecificLOCAL("CONTRACT INFORMATION.Next Sample Date", newSampleDate, wwmIA);
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

    ;
    var vEParams = aa.util.newHashtable();
    var addrResult = getAddressInALine(capId);
    addParameter(vEParams, "$$altID$$", capId.getCustomID());
    addParameter(vEParams, "$$address$$", addrResult);
    addParameter(vEParams, "$$Parcel$$", parcelNumber);
    addParameter(vEParams, "$$FullNameBusName$$", capContacts[c].getCapContactModel().getContactName());
    sendNotification("", conEmail, "", "DEQ_SANITARY_REPLACEMENT", vEParams, null);



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

// function copyDocuments(pFromCapId, pToCapId) {
// 	//Copies all attachments (documents) from pFromCapId to pToCapId
// 	var categoryArray = new Array();

// 	// third optional parameter is comma delimited list of categories to copy.
// 	if (arguments.length > 2) {
// 		categoryList = arguments[2];
// 		categoryArray = categoryList.split(",");
// 	}

// 	var capDocResult = aa.document.getDocumentListByEntity(pFromCapId,"CAP");
// 	if(capDocResult.getSuccess()) {
// 		if(capDocResult.getOutput().size() > 0) {
// 	    	for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
// 	    		var documentObject = capDocResult.getOutput().get(docInx);
// 	    		currDocCat = "" + documentObject.getDocCategory();
// 	    		if (categoryArray.length == 0 || exists(currDocCat, categoryArray)) {
// 	    			// download the document content
// 					var useDefaultUserPassword = true;
// 					//If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
// 					var EMDSUsername = null;
// 					var EMDSPassword = null;
// 					var path = null;
// 					var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
// 					if(downloadResult.getSuccess()) {
// 						path = downloadResult.getOutput();
// 					}
// 					var tmpEntId = pToCapId.getID1() + "-" + pToCapId.getID2() + "-" + pToCapId.getID3();
// 					documentObject.setDocumentNo(null);
// 					documentObject.setCapID(pToCapId)
// 					documentObject.setEntityID(tmpEntId);

// 					// Open and process file
// 					try {
// 						if (path != null && path != "") {
// 						// put together the document content - use java.io.FileInputStream
// 							var newContentModel = aa.document.newDocumentContentModel().getOutput();
// 							inputstream = new java.io.FileInputStream(path);
// 							newContentModel.setDocInputStream(inputstream);
// 							documentObject.setDocumentContent(newContentModel);
// 							var newDocResult = aa.document.createDocument(documentObject);
// 							if (newDocResult.getSuccess()) {
// 								newDocResult.getOutput();
// 								logDebug("Successfully copied document: " + documentObject.getFileName() + " From: " + pFromCapId.getCustomID() + " To: " + pToCapId.getCustomID());
// 							}
// 							else {
// 								logDebug("Failed to copy document: " + documentObject.getFileName());
// 								logDebug(newDocResult.getErrorMessage());
// 							}
// 						}
// 					}
// 					catch (err) {
// 						logDebug("Error copying document: " + err.message);
// 						return false;
// 					}
// 				}
// 	    	} // end for loop
// 		}
//     }
// }

function copyContactsByType(pFromCapId, pToCapId, pContactType)
{
    //Copies all contacts from pFromCapId to pToCapId
    //where type == pContactType
    if (pToCapId == null)
        var vToCapId = capId;
    else
        var vToCapId = pToCapId;

    var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
    var copied = 0;
    if (capContactResult.getSuccess())
    {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts)
        {
            if (Contacts[yy].getCapContactModel().getContactType() == pContactType)
            {
                var newContact = Contacts[yy].getCapContactModel();
                newContact.setCapID(vToCapId);
                aa.people.createCapContact(newContact);
                copied++;
                logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
            }

        }
    }
    else
    {
        logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
        return false;
    }
    return copied;
}

function copyLicensedProfByType(capIdFrom, capIdTo, typesArray)
{
    var n = aa.licenseProfessional.getLicensedProfessionalsByCapID(capIdFrom).getOutput();
    var isByType = typesArray != null && typesArray.length > 0;
    if (n != null)
        for (x in n)
        {
            if (isByType && !arrayContainsValue(typesArray, n[x].getLicenseType()))
            {
                continue;
            }//isByType
            n[x].setCapID(capIdTo);
            aa.licenseProfessional.createLicensedProfessional(n[x]);
        }//for all LPs
    else
        logDebug("No licensed professional on source");
    return true;
}
function arrayContainsValue(ary, value)
{
    if (ary != null)
    {
        //if not array, convert to array
        if (!Array.isArray(ary))
        {
            ary = [ary];
        }
        for (t in ary)
        {
            if (ary[t] == value)
            {
                return true;
            }
        }//for all types
    }
    return false;
}

function updateTask(wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
    var useProcess = false;
    var processName = "";
    if (arguments.length > 4) 
    {
        if (arguments[4] != "") 
        {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }
    var itemCap = capId;
    if (arguments.length == 6)
    {
        itemCap = arguments[5]; // use cap ID specified in args
    }
    var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
    {
        var wfObj = workflowResult.getOutput();
    }
    else 
    {
        logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }
    if (!wfstat)
    {
        wfstat = "NA";
    }
    for (i in wfObj)
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) 
        {
            var dispositionDate = aa.date.getCurrentDate();
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            if (useProcess)
            {
                aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
                logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
            }
            else
            {
                aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
                logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
            }
        }
    }
}
function closeTaskByCap(wfstr, capId, wfstat, wfcomment, wfnote) 
{
    var currentUserID = aa.env.getValue("CurrentUserID");
    var systemUserObj = aa.person.getUser(currentUserID).getOutput();
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess()) 
    {
        var wfObj = workflowResult.getOutput();
    }
    else
    {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
    if (!wfstat)
        wfstat = "NA";
    for (var i in wfObj) 
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) 
        {
            var dispositionDate = aa.date.getCurrentDate();
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            //PARAMETERS ARE: Cap ID, StepNumber, Task Status, Status Date, Status Note, Comment, System User, Flag
            aa.workflow.handleDisposition(capId, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "Y");
            logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat);
        }
    }
}

function getAppSpecificLOCAL(itemName)  // optional: itemCap
{
    var updated = false;
    var i = 0;
    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0)
        { logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false }


        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess())
    {
        var appspecObj = appSpecInfoResult.getOutput();

        if (itemName != "")
        {
            for (i in appspecObj)
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup))
                {
                    return appspecObj[i].getChecklistComment();
                    break;
                }
        } // item name blank
    }
    else
    { logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
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