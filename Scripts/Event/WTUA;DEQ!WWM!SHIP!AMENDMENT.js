var parent = parentCapId.getCustomID();
var useAppSpecificGroupName = true;
var startDate = getAppSpecific("OPERATIONS CONTRACT.Contract Start Date", capId);
var term = getAppSpecific("OPERATIONS CONTRACT.Contract Term");
var annualCost = getAppSpecific("OPERATIONS CONTRACT.Contract Annual Cost");
var installDate = getAppSpecific("INSTALLATION DATE.Date of Installation");
var make = getAppSpecific("I/A OWTS.Make");
var model = getAppSpecific("I/A OWTS.Model");
var leachType = getAppSpecific("LEACHING POOLS/GALLEYS.Type");
var leachProduct = getAppSpecific("OTHER LEACHING STRUCTURES.Leaching Product");
var effluentPump = getAppSpecific("LEACHING POOLS/GALLEYS.Effluent Pump Manufacturer");
var propertyUse = getAppSpecific("OPERATIONS CONTRACT.Property Usage")

logDebug("Parent = " + parent);

if (wfTask == "Submission Review" && wfStatus == "SHIP Record Complete") 
{ 
    var desc = "Automated via:" + capIDString; 
    var wwmIA = createChild('DEQ', 'Ecology', 'IA', 'Application', desc, parentCapId);
    editAppSpecificLOCAL("WWM APPLICATION NUMBER.WWM Application Number", parent, wwmIA);
    editAppSpecificLOCAL("CONTRACT INFORMATION.Contract Start Date", startDate, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Installation Date", installDate, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Leaching", leachType, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Leaching Manufacturer", leachProduct, wwmIA);
    editAppSpecificLOCAL("IA DEVICE INFORMATION.Effluent Pump", effluentPump, wwmIA);
    editAppSpecificLOCAL("PROPERTY INFORMATION.Use", propertyUse, wwmIA);
    copyAddress(capId, wwmIA);
    copyContactsByType(capId, wwmIA, ["Property Owner"]);
    copyContactsByType(capId, wwmIA, ["Agent"]);
    copyParcel(capId, wwmIA);
    copyLicensedProfByType(capId, wwmIA, "IA Installer");
    //copyLicensedProfByType(capId, wwmIA, ["IA Service Provider"]);
    //copyLicensedProfByType(capId, wwmIA, ["IA Designer"]);
    copyDocuments(capId, wwmIA, "Final Site Sketch");
    updateTask("Final Review", "Registration Complete", "", "", parentCapId);
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

function copyDocuments(pFromCapId, pToCapId) {
	//Copies all attachments (documents) from pFromCapId to pToCapId
	var categoryArray = new Array();
	
	// third optional parameter is comma delimited list of categories to copy.
	if (arguments.length > 2) {
		categoryList = arguments[2];
		categoryArray = categoryList.split(",");
	}

	var capDocResult = aa.document.getDocumentListByEntity(pFromCapId,"CAP");
	if(capDocResult.getSuccess()) {
		if(capDocResult.getOutput().size() > 0) {
	    	for(docInx = 0; docInx < capDocResult.getOutput().size(); docInx++) {
	    		var documentObject = capDocResult.getOutput().get(docInx);
	    		currDocCat = "" + documentObject.getDocCategory();
	    		if (categoryArray.length == 0 || exists(currDocCat, categoryArray)) {
	    			// download the document content
					var useDefaultUserPassword = true;
					//If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
					var EMDSUsername = null;
					var EMDSPassword = null;
					var path = null;
					var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
					if(downloadResult.getSuccess()) {
						path = downloadResult.getOutput();
					}
					var tmpEntId = pToCapId.getID1() + "-" + pToCapId.getID2() + "-" + pToCapId.getID3();
					documentObject.setDocumentNo(null);
					documentObject.setCapID(pToCapId)
					documentObject.setEntityID(tmpEntId);
	
					// Open and process file
					try {
						if (path != null && path != "") {
						// put together the document content - use java.io.FileInputStream
							var newContentModel = aa.document.newDocumentContentModel().getOutput();
							inputstream = new java.io.FileInputStream(path);
							newContentModel.setDocInputStream(inputstream);
							documentObject.setDocumentContent(newContentModel);
							var newDocResult = aa.document.createDocument(documentObject);
							if (newDocResult.getSuccess()) {
								newDocResult.getOutput();
								logDebug("Successfully copied document: " + documentObject.getFileName() + " From: " + pFromCapId.getCustomID() + " To: " + pToCapId.getCustomID());
							}
							else {
								logDebug("Failed to copy document: " + documentObject.getFileName());
								logDebug(newDocResult.getErrorMessage());
							}
						}
					}
					catch (err) {
						logDebug("Error copying document: " + err.message);
						return false;
					}
				}
	    	} // end for loop
		}
    }
}

function copyContactsByType(srcCapId, targetCapId, ContactTypeArr)
{
    //1. Get people with source CAPID.
    var capPeoples = getPeople3_0(srcCapId);
    if (capPeoples == null || capPeoples.length == 0)
    {
        return;
    }
    //2. Get people with target CAPID.
    var targetPeople = getPeople3_0(targetCapId);
    //3. Check to see which people is matched in both source and target.
    for (loopk in capPeoples)
    {
        sourcePeopleModel = capPeoples[loopk];
        //Check if contact type should be ignored
        doCopy = false;
        for (kk in ContactTypeArr)
        {
            if (ContactTypeArr[kk] == sourcePeopleModel.getCapContactModel().getContactType())
                doCopy = true;
        }
        if (doCopy)
        {
            //3.1 Set target CAPID to source people.
            sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
            targetPeopleModel = null;
            //3.2 Check to see if sourcePeople exist.
            if (targetPeople != null && targetPeople.length > 0)
            {
                for (loop2 in targetPeople)
                {
                    if (isMatchPeople3_0(sourcePeopleModel, targetPeople[loop2]))
                    {
                        targetPeopleModel = targetPeople[loop2];
                        break;
                    }
                }
            }
            //3.3 It is a matched people model.
            if (targetPeopleModel != null)
            {
                //3.3.1 Copy information from source to target.
                aa.people.copyCapContactModel(sourcePeopleModel.getCapContactModel(), targetPeopleModel.getCapContactModel());
                //3.3.2 Copy contact address from source to target.
                if (targetPeopleModel.getCapContactModel().getPeople() != null && sourcePeopleModel.getCapContactModel().getPeople())
                {
                    targetPeopleModel.getCapContactModel().getPeople().setContactAddressList(sourcePeopleModel.getCapContactModel().getPeople().getContactAddressList());
                }
                //3.3.3 Edit People with source People information.
                aa.people.editCapContactWithAttribute(targetPeopleModel.getCapContactModel());
            }
            //3.4 It is new People model.
            else
            {
                //3.4.1 Create new people.
                aa.people.createCapContactWithAttribute(sourcePeopleModel.getCapContactModel());
            }
        }
    }
}
function getPeople3_0(capId)
{
    capPeopleArr = null;
    var s_result = aa.people.getCapContactByCapID(capId);
    if (s_result.getSuccess())
    {
        capPeopleArr = s_result.getOutput();
        if (capPeopleArr != null || capPeopleArr.length > 0)
        {
            for (loopk in capPeopleArr)
            {
                var capContactScriptModel = capPeopleArr[loopk];
                var capContactModel = capContactScriptModel.getCapContactModel();
                var peopleModel = capContactScriptModel.getPeople();
                var contactAddressrs = aa.address.getContactAddressListByCapContact(capContactModel);
                if (contactAddressrs.getSuccess())
                {
                    var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                    peopleModel.setContactAddressList(contactAddressModelArr);
                }
            }
        }
        else
        {
            logDebug("WARNING: no People on this CAP:" + capId);
            capPeopleArr = null;
        }
    }
    else
    {
        logDebug("ERROR: Failed to People: " + s_result.getErrorMessage());
        capPeopleArr = null;
    }
    return capPeopleArr;
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
