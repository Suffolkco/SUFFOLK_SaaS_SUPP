function activateTaskByCap(wfstr, capId) 
{
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess()) 
    {
        var wfObj = workflowResult.getOutput();
    } else 
    {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
  
    for (var i in wfObj)
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) 
        {
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            //PARAMETERS ARE: Cap ID, StepNumber, ActiveFlag, CompleteFlag, Assignment Date, Due Date
            aa.workflow.adjustTask(capId, stepnumber, "Y", "N", null, null);
            logDebug("Activating Workflow Task: " + wfstr);
        }
    }
}
function addACAUrlsVarToEmail(vEParams) {
	//Get base ACA site from standard choices
	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

	//Save Base ACA URL
	addParameter(vEParams,"$$acaURL$$",acaSite);

	//Save Record Direct URL
	addParameter(vEParams,"$$acaRecordURL$$",acaSite + getACAUrl());
	var paymentUrl = vEParams.get("$$acaRecordURL$$");
	paymentUrl = paymentUrl.replace("type=1000", "type=1009");
	addParameter(vEParams, "$$acaPaymentUrl$$", paymentUrl);
}
function addRefContactToRecord(refNum, cType) {
	itemCap = capId;
	if (arguments.length > 2)
		itemCap = arguments[2];

	var refConResult = aa.people.getPeople(refNum);
	if (refConResult.getSuccess()) {
		var refPeopleModel = refConResult.getOutput();
		if (refPeopleModel != null) {
			pm = refPeopleModel;
			pm.setContactType(cType);
			pm.setFlag("N");
			//pm.setContactAddressList(getRefAddContactList(refNum));
			
			var result = aa.people.createCapContactWithRefPeopleModel(itemCap, pm);
			if (result.getSuccess()) {
				logDebug("Successfully added the contact");
			}	
			else {
				logDebug("Error creating the applicant " + result.getErrorMessage());
			}
		}
	}
}



function addToSet(addToSetCapId, setPrefix, setType) {

    var sysDate = todayDate;
	var sDateMMDDYYYY =     (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear()    ;
    var sysDateArray = sDateMMDDYYYY.split("/");
	if(sysDateArray[1].length>2){
		var dayOfMonth = sysDateArray[1].substr(1,2);	
	}else {
		var dayOfMonth = sysDateArray[1];
	}
	
	if(sysDateArray[0].length>2){
		var month = sysDateArray[0].substr(1,2);
	}else{
		var month = sysDateArray[0];
	}


    var setExists = false;

	var sDateMMDDYYYY =     (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear()    ;
	var sysDateArray = sDateMMDDYYYY.split("/");
    var setName = setPrefix + " " +  (startDate.getMonth() + 1) + "/" + sysDateArray[2];
    logDebug("Set Name: " + setName);
	setGetResult = aa.set.getSetByPK(setName);
	if(setGetResult.getSuccess()) setExists = true;

    if (!setExists && setPrefix != undefined) {
        setDescription = setName;
        setStatus = "Pending";
        setExists = createSet(setName,setDescription,setType,setStatus);
    }

    if (setExists) {
        var setObj = new capSet(setName);
        var memberExists = false;
        for (var i in setObj.members) {
            var mCapId = aa.cap.getCapID(setObj.members[i].ID1,setObj.members[i].ID2,setObj.members[i].ID3).getOutput();
            if (mCapId.getCustomID() == addToSetCapId.getCustomID()) {
                memberExists = true;
                break;
            }

        }
        if (!memberExists)
            aa.set.add(setName,addToSetCapId);
    }
}



function ammendARecord(capId, parentCapId)
{
//PUSh
   // copyAppSpecific(parentCapId);
	copyPeopleForLic(capId, parentCapId);
	copyLicenseProfessionalForLic(capId, parentCapId);
	copyOwnerForLic(capId, parentCapId);
   // /copyAppSpecificTableForLic(capId, parentCapId);
    copyAddressForLic(capId, parentCapId);
    copyParcelForLic(capId, parentCapId);
}

function applicationSubmittedDEQ()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray;
	try
	{
		conArray= getContactArrayLocal();
	}
	catch (ex)
	{
		logDebug("**ERROR** runtime error " + ex.message);
	}
	var conEmail = "";
    var fromEmail = "";
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	if (conArray != null)
	{
		for (con in conArray)
		{
			if (!matches(conArray[con].email, null, undefined, ""))
			{
				conEmail += conArray[con].email + "; ";
			}
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    //getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
		///sendNotification("", conEmail, "", "DEQ_APPLICATION_SUBMITTAL", emailParams, reportFile);
	}
}
//push

function getContactArrayLocal()
{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];
	var cArray = new Array();
	if (arguments.length == 0 && !cap.isCompleteCap() && !matches(controlString, "ApplicationSubmitAfter", "ConvertToRealCapAfter")) // we are in a page flow script so use the capModel to get contacts
	{
	capContactArray = cap.getContactsGroup().toArray() ;
	}
	else
	{
	var capContactResult = aa.people.getCapContactByCapID(thisCap);
	if (capContactResult.getSuccess())
		{
		var capContactArray = capContactResult.getOutput();
		}
	}

	if (capContactArray)
	{
	for (yy in capContactArray)
		{
		var aArray = new Array();
		aArray["lastName"] = capContactArray[yy].getPeople().lastName;
		aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
		aArray["firstName"] = capContactArray[yy].getPeople().firstName;
		aArray["middleName"] = capContactArray[yy].getPeople().middleName;
		aArray["businessName"] = capContactArray[yy].getPeople().businessName;
		aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
		aArray["contactType"] =capContactArray[yy].getPeople().contactType;
		aArray["relation"] = capContactArray[yy].getPeople().relation;
		aArray["phone1"] = capContactArray[yy].getPeople().phone1;
		aArray["phone2"] = capContactArray[yy].getPeople().phone2;
		aArray["email"] = capContactArray[yy].getPeople().email;
		aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
		aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
		aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
		aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
		aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
		aArray["fax"] = capContactArray[yy].getPeople().fax;
		aArray["notes"] = capContactArray[yy].getPeople().notes;
		aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
		aArray["fullName"] = capContactArray[yy].getPeople().fullName;
		aArray["peopleModel"] = capContactArray[yy].getPeople();

		var pa = new Array();

		if (arguments.length == 0 && !cap.isCompleteCap()) {
			var paR = capContactArray[yy].getPeople().getAttributes();
			if (paR) pa = paR.toArray();
			}
		else
			var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
				for (xx1 in pa)
					aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

		cArray.push(aArray);
		}
	}
	return cArray;
}
function applicationSubmittedOPCTankClosure()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
    }
    
    getRecordParams4Notification(emailParams);
    addParameter(emailParams, "$$altID$$", capId.getCustomID());

	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
            conEmail = lpArr[lp].email;
			sendNotification("", conEmail, "", "DEQ_OPC_TANK_CLOSURE_APPLICATION_SUBMITTAL", emailParams, reportFile);
		}
	}
	

}
function applicationSubmittedWWM() {
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray;
	var conEmail = "";
	var fromEmail = "";
	try
	{
		conArray = getContactArrayLocal();
	}
	catch (ex)
	{
		logDebug("**ERROR** runtime error " + ex.message);
	}
	if (matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	if (conArray != null)
	{
		for (con in conArray)
		{
			if (!matches(conArray[con].email, null, undefined, ""))
			{
				conEmail += conArray[con].email + "; ";
			}
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{
		var lpArr = lpResult.getOutput();
	}
	else 
	{
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage());
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
	//getWorkflowParams4Notification(emailParams);

	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_APPLICATION SUBMITTAL", emailParams, reportFile);
	}
}

function getContactArrayLocal()
{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];
	var cArray = new Array();
	if (arguments.length == 0 && !cap.isCompleteCap() && !matches(controlString, "ApplicationSubmitAfter", "ConvertToRealCapAfter")) // we are in a page flow script so use the capModel to get contacts
	{
	capContactArray = cap.getContactsGroup().toArray() ;
	}
	else
	{
	var capContactResult = aa.people.getCapContactByCapID(thisCap);
	if (capContactResult.getSuccess())
		{
		var capContactArray = capContactResult.getOutput();
		}
	}

	if (capContactArray)
	{
	for (yy in capContactArray)
		{
		var aArray = new Array();
		aArray["lastName"] = capContactArray[yy].getPeople().lastName;
		aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
		aArray["firstName"] = capContactArray[yy].getPeople().firstName;
		aArray["middleName"] = capContactArray[yy].getPeople().middleName;
		aArray["businessName"] = capContactArray[yy].getPeople().businessName;
		aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
		aArray["contactType"] =capContactArray[yy].getPeople().contactType;
		aArray["relation"] = capContactArray[yy].getPeople().relation;
		aArray["phone1"] = capContactArray[yy].getPeople().phone1;
		aArray["phone2"] = capContactArray[yy].getPeople().phone2;
		aArray["email"] = capContactArray[yy].getPeople().email;
		aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
		aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
		aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
		aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
		aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
		aArray["fax"] = capContactArray[yy].getPeople().fax;
		aArray["notes"] = capContactArray[yy].getPeople().notes;
		aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
		aArray["fullName"] = capContactArray[yy].getPeople().fullName;
		aArray["peopleModel"] = capContactArray[yy].getPeople();

		var pa = new Array();

		if (arguments.length == 0 && !cap.isCompleteCap()) {
			var paR = capContactArray[yy].getPeople().getAttributes();
			if (paR) pa = paR.toArray();
			}
		else
			var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
				for (xx1 in pa)
					aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

		cArray.push(aArray);
		}
	}
	return cArray;
}
function checkForRelatedSITERecord(parcelNumber) {
    var foundSite = false;
    var siteCap;
    var listOfRelatedRecorsdFromParcel = capIdsGetByParcel(parcelNumber);


    for (record in listOfRelatedRecorsdFromParcel) {
        //Here we will pull out the cap. 
        //We are looking for a related SITE record for this particular Parcel Number
        var itemCap = listOfRelatedRecorsdFromParcel[record];
        var itemCapType = aa.cap.getCap(itemCap).getOutput().getCapType().toString();
        logDebug("We found this record: " + itemCap.getCustomID() + " which is a: " + itemCapType);
        if (itemCapType == "DEQ/General/Site/NA") {
            //Set globally true if there's a site.
            foundSite = true;
            siteCap = itemCap;
        }
    }

    //No Site Found: we need to create one and copy everything over. 
    //We should also create a new site record
    if (!foundSite) {

         // Copy project/app name from the child to site when it's created from OPC records.
         var capType = aa.cap.getCap(capId).getOutput().getCapType().toString();
         logDebug("Cap Type is: " + capType);
         if(matches(capType, "DEQ/OPC/Global Containment/Application", "DEQ/OPC/Hazardous Tank/Application", "DEQ/OPC/Hazardous Tank Closure/Application", "DEQ/OPC/Swimming Pool/Application", "DEQ/OPC/Swimming Pool/Permit","DEQ/OPC/Site Assessment/Application")) 
         {
              // Short Note is a project name.
              var shortNotes = getShortNotes(capId);
              logDebug("Record short notes : " + shortNotes); 
              // Special Text is application name.
              cap = aa.cap.getCap(capId).getOutput();
              var appName = cap.getSpecialText();
                          
             var updateToName;
             if (publicUser) {	      
                 
                 updateToName = appName;                
             }
             else
             {
                 updateToName = shortNotes;               
             }
             var myParent = createParent("DEQ", "General", "Site", "NA", "Created from " + updateToName);
 
             copyParcels(capId, myParent);
             copyOwner(capId, myParent);
             copyParcelGisObjectsParent(capId, myParent);
             updateShortNotes(updateToName, myParent);        
             editAppName(updateToName, myParent);
             
             var parentShortNotes = getShortNotes(myParent);
            
             var parentCap =aa.cap.getCap(myParent).getOutput();
             parentAppName = parentCap.getSpecialText();
             logDebug("Updating Site record project and app name fields to:  " + updateToName);
             var siteCapType = aa.cap.getCap(myParent).getOutput().getCapType().toString();
            
             //msg = "Parcel No" + parcelNumber + ".Length: " + parcelNumber.length() + "My parent: " + myParent + ". Parent Cap Type is: " + siteCapType + ".Short note: " + parentShortNotes + ".App Name: " + parentAppName;            
         }
         else
         {
            var myParent = createParent("DEQ", "General", "Site", "NA", "Created from " + capId.getCustomID());
            copyParcels(capId, myParent);
            copyOwner(capId, myParent);
            copyParcelGisObjectsParent(capId, myParent);

            //copyParcelGisObjects() needs to be placed here to copy the Gis object from the child to the new site parent
            logDebug("Site was not found, creating a new one. " + "Created from " + capId.getCustomID());
         }
    }
    else if (foundSite) {
        logDebug("We found a matching SITE record: " + siteCap.getCustomID());
        var appStatus;        
        sca = String(siteCap).split("-");
        logDebug("Site Cap Id is: " + siteCap);
        logDebug("Site sca is: " + sca);
        
		siteCapId = aa.cap.getCapID(sca[0],sca[1],sca[2]).getOutput()
        var siteResult = aa.cap.getCap(siteCapId);
        logDebug("Success? " + siteResult.getSuccess());
        if (siteResult.getSuccess()) {
           licCap = siteResult.getOutput();
           if (licCap != null) {
              appStatus = "" + licCap.getCapStatus();  
              logDebug("App Status is:" + appStatus);            
           }        
        if (appStatus != "Retired")
        {
            ammendARecord(capId, siteCap);
            addParent(siteCap);
            copyConditions(siteCap);
        }
        else
        {
            logDebug("Not to relate to parent Site: " + siteCap.getCustomID() + "App Status is:" + appStatus);   
        }
    }

}
}
	
function copyParcelGisObjectsParent(childId, parentId) {
    var capParcelResult = aa.parcel.getParcelandAttribute(childId, null);
    if (capParcelResult.getSuccess()) {
        var Parcels = capParcelResult.getOutput().toArray();
        for (zz in Parcels) {
            var ParcelValidatedNumber = Parcels[zz].getParcelNumber();
            logDebug("Looking at parcel " + ParcelValidatedNumber);
            var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
            if (gisObjResult.getSuccess())
                var fGisObj = gisObjResult.getOutput();
            else { logDebug("**WARNING: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()); return false }

            for (a1 in fGisObj) // for each GIS object on the Cap
            {
                var gisTypeScriptModel = fGisObj[a1];
                var gisObjArray = gisTypeScriptModel.getGISObjects()
                for (b1 in gisObjArray) {
                    var gisObjScriptModel = gisObjArray[b1];
                    var gisObjModel = gisObjScriptModel.getGisObjectModel();

                    var retval = aa.gis.addCapGISObject(parentId, gisObjModel.getServiceID(), gisObjModel.getLayerId(), gisObjModel.getGisId());

                    if (retval.getSuccess()) { logDebug("Successfully added Cap GIS object: " + gisObjModel.getGisId() + " to: " + parentId.getCustomID()) }
                    
                    else { logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()); return false }
                }
            }
        }
    }
    else { logDebug("**ERROR: Getting Parcels from Cap.  Reason is: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()); return false }
}

function copyConditions(fromCapId) // optional toCapID
{

	var itemCap = capId;
	if (arguments.length == 2)
		itemCap = arguments[1]; // use cap ID specified in args

	var getFromCondResult = aa.capCondition.getCapConditions(fromCapId);
	if (getFromCondResult.getSuccess())
		var condA = getFromCondResult.getOutput();
	else {
		logDebug("**ERROR: getting cap conditions: " + getFromCondResult.getErrorMessage());
		return false
	}

	for (cc in condA) {
		var thisC = condA[cc];

		var addCapCondResult = aa.capCondition.addCapCondition(itemCap, thisC.getConditionType(), thisC.getConditionDescription(), thisC.getConditionComment(), thisC.getEffectDate(), thisC.getExpireDate(), sysDate, thisC.getRefNumber1(), thisC.getRefNumber2(), thisC.getImpactCode(), thisC.getIssuedByUser(), thisC.getStatusByUser(), thisC.getConditionStatus(), currentUserID, String("A"), null, thisC.getDisplayConditionNotice(), thisC.getIncludeInConditionName(), thisC.getIncludeInShortDescription(), thisC.getInheritable(), thisC.getLongDescripton(), thisC.getPublicDisplayMessage(), thisC.getResolutionAction(), null, null, thisC.getReferenceConditionNumber(), thisC.getConditionGroup(), thisC.getDisplayNoticeOnACA(), thisC.getDisplayNoticeOnACAFee(), thisC.getPriority(), thisC.getConditionOfApproval());
		if (addCapCondResult.getSuccess())
			logDebug("Successfully added condition (" + thisC.getImpactCode() + ") " + thisC.getConditionDescription());
		else
			logDebug("**ERROR: adding condition (" + cImpact + "): " + addCapCondResult.getErrorMessage());
	}
} 

/**
 * Uses the close match criteria configured in Agency Profile > Standard Choices stored in the 
 * INDIVIDUAL_CONTACT_MATCH_CRITERIA and ORGANIZATION_CONTACT_MATCH_CRITERIA to check the reference 
 * contact library for potential duplicates. Takes a single peopleModel as a parameter, 
 * and will return an array of people models (peopResult) returns null if there are no matches.
 * 
 * This is used in conjuction with the createRefContactsFromCapContactsAndLink function as shown in the example.
 * 
 * @requires 
 * @example createRefContactsFromCapContactsAndLink(itemCapId, ["Applicant"], null, null, true, comparePeopleMatchCriteria)
 * @memberof INCLUDES_ACCELA_FUNCTIONS
 * @param {peopleModel}
 * @return {ContactSeqNumber}
 *   
 */

function comparePeopleMatchCriteria(ipPeop)
{
	var fvContType = ipPeop.getContactType();

	var fvCriteriaStdChoice = "INDIVIDUAL_CONTACT_MATCH_CRITERIA";
	// default to individual unless flag is Org
	if (fvContType == "Organization")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}
	if (lookup("REF_CONTACT_CREATION_RULES",fvContType) == "O")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}

	//Add agency specific logic here if needed
	var fvBizDomainSR = aa.bizDomain.getBizDomain(fvCriteriaStdChoice);
	if (!fvBizDomainSR || !fvBizDomainSR.getSuccess())
	{
		logDebug("Standard Choice '" + fvCriteriaStdChoice + "' not defined.");
		return null;
	}
	var fvBizDomain = fvBizDomainSR.getOutput();
	if (!fvBizDomain || fvBizDomain.size() == 0)
	{
			logDebug("No criteria defined in Standard Choice '" + fvCriteriaStdChoice + "'.");
			return null;
	}

	for(var fvCounter1 = 0; fvCounter1 < fvBizDomain.size(); fvCounter1++)
	{
        var fvCloseMatchCriteriaObj = fvBizDomain.get(fvCounter1);
        var fvCriteriaStr = fvCloseMatchCriteriaObj.getDispBizdomainValue();
        logDebug("Criteria : " + fvCriteriaStr);
		if (!fvCriteriaStr || fvCriteriaStr == "")
			continue;

		var fvPeop = aa.people.createPeopleModel().getOutput().getPeopleModel();
		//make sure we are retrieving only active contacts
        fvPeop.setAuditStatus("A");
		
		var fvCriteriaArr = fvCriteriaStr.split(";");
        var fvSkipThisCriteria = false;
		for (var fvCounter2 in fvCriteriaArr)
		{
		   var fvCriteriaFld = fvCriteriaArr[fvCounter2];
		   if (ipPeop[fvCriteriaFld] == null)
		   {
			   fvSkipThisCriteria = true;
			   logDebug("Value for " + fvCriteriaFld + " is null.");
			   break;
		   }
		   fvPeop[fvCriteriaFld] = ipPeop[fvCriteriaFld];
		   logDebug("Search for " + fvCriteriaFld + " " + fvPeop[fvCriteriaFld]);
		}
		if (fvSkipThisCriteria)
		{
			logDebug("WARNING: One or more Values for the Fields defined in this Criteria are null. Skipping this criteria.");
			continue;
		}

		var fvResult = aa.people.getPeopleByPeopleModel(fvPeop);
		if ( !fvResult.getSuccess())
		{
			logDebug("WARNING: Error searching for duplicate contacts : " + fvResult.getErrorMessage());
			continue;
		}

		var fvPeopResult = fvResult.getOutput();
		if (fvPeopResult.length == 0)
		{
			logDebug("Searched for REF contact, no matches found.");
			continue;
		}

		if (fvPeopResult.length > 0)
		{
			logDebug("Searched for a REF Contact, " + fvPeopResult.length + " matches found! returning the first match : " + fvPeopResult[0].getContactSeqNumber());
			return fvPeopResult[0].getContactSeqNumber();
		}
	}
	logDebug("No matches found. Returning Null.");
	return null;
} 
 

function copyAdditionalInfoForLic(srcCapId, targetCapId)
{
	//1. Get Additional Information with source CAPID.  (BValuatnScriptModel)
	var  additionalInfo = getAdditionalInfoForLic(srcCapId);
	if (additionalInfo == null)
	{
		return;
	}
	//2. Get CAP detail with source CAPID.
	var  capDetail = getCapDetailByID(srcCapId);
	//3. Set target CAP ID to additional info.
	additionalInfo.setCapID(targetCapId);
	if (capDetail != null)
	{
		capDetail.setCapID(targetCapId);
	}
	//4. Edit or create additional infor for target CAP.
	aa.cap.editAddtInfo(capDetail, additionalInfo);
}
function copyAddress(srcCapId, targetCapId)
{
    //1. Get address with source CAPID.
    var capAddresses = getAddress(srcCapId);
    if (capAddresses == null || capAddresses.length == 0)
    {
      return;
    }
    //2. Get addresses with target CAPID.
    var targetAddresses = getAddress(targetCapId);
    //3. Check to see which address is matched in both source and target.
    for (loopk in capAddresses)
    {
      sourceAddressfModel = capAddresses[loopk];
      //3.1 Set target CAPID to source address.
      sourceAddressfModel.setCapID(targetCapId);
      targetAddressfModel = null;
      //3.2 Check to see if sourceAddress exist.
      if (targetAddresses != null && targetAddresses.length > 0)
      {
        for (loop2 in targetAddresses)
        {
          if (isMatchAddress(sourceAddressfModel, targetAddresses[loop2]))
          {
            targetAddressfModel = targetAddresses[loop2];
            break;
          }
        }
      }
      //3.3 It is a matched address model.
      if (targetAddressfModel != null)
      {
        //3.3.1 Copy information from source to target.
        aa.address.copyAddressModel(sourceAddressfModel, targetAddressfModel);
        //3.3.2 Edit address with source address information. 
        aa.address.editAddressWithAPOAttribute(targetCapId, targetAddressfModel);
      }
      //3.4 It is new address model.
      else
      { 
        //3.4.1 Create new address.
        aa.address.createAddressWithAPOAttribute(targetCapId, sourceAddressfModel);
      }
    }
}


function copyAddressForLic(srcCapId, targetCapId)
{
	//1. Get address with source CAPID.
	var capAddresses = getAddressForLic(srcCapId);
	if (capAddresses == null || capAddresses.length == 0)
	{
		return;
	}
	//2. Get addresses with target CAPID.
	var targetAddresses = getAddressForLic(targetCapId);
	//3. Check to see which address is matched in both source and target.
	for (loopk in capAddresses)
	{
		sourceAddressfModel = capAddresses[loopk];
		//3.1 Set target CAPID to source address.
		sourceAddressfModel.setCapID(targetCapId);
		targetAddressfModel = null;
		//3.2 Check to see if sourceAddress exist.
		if (targetAddresses != null && targetAddresses.length > 0)
		{
			for (loop2 in targetAddresses)
			{
				if (isMatchAddress(sourceAddressfModel, targetAddresses[loop2]))
				{
					targetAddressfModel = targetAddresses[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched address model.
		if (targetAddressfModel != null)
		{
		
			//3.3.1 Copy information from source to target.
			aa.address.copyAddressModel(sourceAddressfModel, targetAddressfModel);
			//3.3.2 Edit address with source address information. 
			aa.address.editAddressWithAPOAttribute(targetCapId, targetAddressfModel);
		}
		//3.4 It is new address model.
		else
		{	
			//3.4.1 Create new address.
			aa.address.createAddressWithAPOAttribute(targetCapId, sourceAddressfModel);
		}
	}
}
function copyAppSpecificTableForLic(srcCapId, targetCapId)
{
	var tableNameArray = getTableName(srcCapId);
	var targetTableNameArray = getTableName(targetCapId);
	if (tableNameArray == null)
	{
		logDebug("tableNameArray is null, returning");
		return;
	}
	for (loopk in tableNameArray)
	{
		var tableName = tableNameArray[loopk];
		if (IsStrInArry(tableName,targetTableNameArray)) { 
			//1. Get appSpecificTableModel with source CAPID
			var sourceAppSpecificTable = getAppSpecificTableForLic(srcCapId,tableName);
			//2. Edit AppSpecificTableInfos with target CAPID
			var srcTableModel = null;
			if(sourceAppSpecificTable == null) {
				logDebug("sourceAppSpecificTable is null");
				return;
			}
			else {
			    srcTableModel = sourceAppSpecificTable.getAppSpecificTableModel();

			    tgtTableModelResult = aa.appSpecificTableScript.getAppSpecificTableModel(targetCapId, tableName);
			    if (tgtTableModelResult.getSuccess()) {
			    	tgtTableModel = tgtTableModelResult.getOutput();
			   	if (tgtTableModel == null) {
			   	 	logDebug("target table model is null");
			 	}
				else {
			    	tgtGroupName = tgtTableModel.getGroupName();
					srcTableModel.setGroupName(tgtGroupName);
			   	 }
			    }
			    else { logDebug("Error getting target table model " + tgtTableModelResult.getErrorMessage()); }
			}
			editResult = aa.appSpecificTableScript.editAppSpecificTableInfos(srcTableModel,
								targetCapId,
								null);
			if (editResult.getSuccess()) {
				logDebug("Successfully editing appSpecificTableInfos");
			}
			else {
				logDebug("Error editing appSpecificTableInfos " + editResult.getErrorMessage());
			}
		}
		else { 
			logDebug("Table " + tableName + " is not defined on target");
		}
	}
	
}
function copyASITablesWithRemove(pFromCapId, pToCapId) {
	// Function dependencies on addASITable()
	// par3 is optional 0 based string array of table to ignore
	var itemCap = pFromCapId;

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
		var tai = ta.iterator();
	var tableArr = new Array();
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		ignoreArr = arguments[2]; 
		limitCopy = true;
	}
	while (tai.hasNext()) {
		var tsm = tai.next();

		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName() + "";
		var numrows = 0;

		//Check list
		if (limitCopy) {
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++)
				if (ignoreArr[i] == tn) {
					ignore = true;
					break;
				}
			if (ignore)
				continue;
		}
		if (!tsm.rowIndex.isEmpty()) {
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
				if (readOnlyi.hasNext()) {
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
function copyContactsForAssociatedForms(pFromCapId, pToCapId)
	{
	//Copies all contacts from pFromCapId to pToCapId
	//where type == pContactType
	if (pToCapId==null)
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

			    var newContact = Contacts[yy].getCapContactModel();
			    newContact.setCapID(vToCapId);
			    aa.people.createCapContact(newContact);
			    copied++;
			    logDebug("Copied contact from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
			    
		
			}
		}
	else
		{
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage()); 
		return false; 
		}
	return copied;
	} 
function copyDocuments(pFromCapId, pToCapId)
{
    //Copies all attachments (documents) from pFromCapId to pToCapId
    var categoryArray = new Array();

    // third optional parameter is comma delimited list of categories to copy.
    if (arguments.length > 2)
    {
        categoryList = arguments[2];
        categoryArray = categoryList.split(",");
    }

    var capDocResult = aa.document.getDocumentListByEntity(pFromCapId, "CAP");
    if (capDocResult.getSuccess())
    {
        if (capDocResult.getOutput().size() > 0)
        {
            for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
            {
                var documentObject = capDocResult.getOutput().get(docInx);
                currDocCat = "" + documentObject.getDocCategory();
                if (categoryArray.length == 0 || exists(currDocCat, categoryArray))
                {
                    // download the document content
                    var useDefaultUserPassword = true;
                    //If useDefaultUserPassword = true, there is no need to set user name & password, but if useDefaultUserPassword = false, we need define EDMS user name & password.
                    var EMDSUsername = null;
                    var EMDSPassword = null;
                    var path = null;
                    var downloadResult = aa.document.downloadFile2Disk(documentObject, documentObject.getModuleName(), EMDSUsername, EMDSPassword, useDefaultUserPassword);
                    if (downloadResult.getSuccess())
                    {
                        path = downloadResult.getOutput();
                    }
                    var tmpEntId = pToCapId.getID1() + "-" + pToCapId.getID2() + "-" + pToCapId.getID3();
                    documentObject.setDocumentNo(null);
                    documentObject.setCapID(pToCapId)
                    documentObject.setEntityID(tmpEntId);

                    // Open and process file
                    try
                    {
                        if (path != null && path != "")
                        {
                            // put together the document content - use java.io.FileInputStream
                            var newContentModel = aa.document.newDocumentContentModel().getOutput();
                            inputstream = aa.io.FileInputStream(path);
                            newContentModel.setDocInputStream(inputstream);
                            documentObject.setDocumentContent(newContentModel);
                            var newDocResult = aa.document.createDocument(documentObject);
                            if (newDocResult.getSuccess())
                            {
                                newDocResult.getOutput();
                                logDebug("Successfully copied document: " + documentObject.getFileName() + " From: " + pFromCapId.getCustomID() + " To: " + pToCapId.getCustomID());
                            }
                            else
                            {
                                logDebug("Failed to copy document: " + documentObject.getFileName());
                                logDebug(newDocResult.getErrorMessage());
                            }
                        }
                    }
                    catch (err)
                    {
                        logDebug("Error copying document: " + err.message);
                        return false;
                    }
                }
            } // end for loop
        }
    }
}
function copyLicenseProfessionalForLic(srcCapId, targetCapId) {
	//1. Get license professionals with source CAPID.
	var capLicenses = getLicenseProfessionalForLic(srcCapId);
	if (capLicenses == null || capLicenses.length == 0) {
		return;
	}
	//2. Get license professionals with target CAPID.
	var targetLicenses = getLicenseProfessionalForLic(targetCapId);
	//3. Check to see which licProf is matched in both source and target.
	for (loopk in capLicenses) {
		sourcelicProfModel = capLicenses[loopk];
		//3.1 Set target CAPID to source lic prof.
		sourcelicProfModel.setCapID(targetCapId);
		targetLicProfModel = null;
		//3.2 Check to see if sourceLicProf exist.
		if (targetLicenses != null && targetLicenses.length > 0) {
			for (loop2 in targetLicenses) {
				if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2])) {
					targetLicProfModel = targetLicenses[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched licProf model.
		if (targetLicProfModel != null) {
			//3.3.1 Copy information from source to target.
			aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
			//3.3.2 Edit licProf with source licProf information. 
			aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
		}
		//3.4 It is new licProf model.
		else {
			//3.4.1 Create new license professional.
			aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
		}
	}
}
function copyOwnerForLic(srcCapId, targetCapId)
{
	//1. Get Owners with source CAPID.
	var capOwners = getOwnerForLic(srcCapId);
	if (capOwners == null || capOwners.length == 0)
	{
		return;
	}
	//2. Get Owners with target CAPID.
	var targetOwners = getOwnerForLic(targetCapId);
	//3. Check to see which owner is matched in both source and target.
	for (loopk in capOwners)
	{
		sourceOwnerModel = capOwners[loopk];
		//3.1 Set target CAPID to source Owner.
		sourceOwnerModel.setCapID(targetCapId);
		targetOwnerModel = null;
		//3.2 Check to see if sourceOwner exist.
		if (targetOwners != null && targetOwners.length > 0)
		{
			for (loop2 in targetOwners)
			{
				if (isMatchOwner(sourceOwnerModel, targetOwners[loop2]))
				{
					targetOwnerModel = targetOwners[loop2];
					break;
				}
			}
		}
		//3.3 It is a matched owner model.
		if (targetOwnerModel != null)
		{
			//3.3.1 Copy information from source to target.
			aa.owner.copyCapOwnerModel(sourceOwnerModel, targetOwnerModel);
			//3.3.2 Edit owner with source owner information. 
			aa.owner.updateDailyOwnerWithAPOAttribute(targetOwnerModel);
		}
		//3.4 It is new owner model.
		else
		{
			//3.4.1 Create new Owner.
			aa.owner.createCapOwnerWithAPOAttribute(sourceOwnerModel);
		}
	}
}
function copyParcel(srcCapId, targetCapId)
{
  //1. Get parcels with source CAPID.
  var copyParcels = getParcel(srcCapId);
  if (copyParcels == null || copyParcels.length == 0)
  {
    return;
  }
  //2. Get parcel with target CAPID.
  var targetParcels = getParcel(targetCapId);
  //3. Check to see which parcel is matched in both source and target.
  for (i = 0; i < copyParcels.size(); i++)
  {
    sourceParcelModel = copyParcels.get(i);
    //3.1 Set target CAPID to source parcel.
    sourceParcelModel.setCapID(targetCapId);
    targetParcelModel = null;
    //3.2 Check to see if sourceParcel exist.
    if (targetParcels != null && targetParcels.size() > 0)
    {
      for (j = 0; j < targetParcels.size(); j++)
      {
        if (isMatchParcel(sourceParcelModel, targetParcels.get(j)))
        {
          targetParcelModel = targetParcels.get(j);
          break;
        }
      }
    }
    //3.3 It is a matched parcel model.
    if (targetParcelModel != null)
    {
      //3.3.1 Copy information from source to target.
      var tempCapSourceParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, 

      sourceParcelModel).getOutput();
      var tempCapTargetParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, 

      targetParcelModel).getOutput();
      aa.parcel.copyCapParcelModel(tempCapSourceParcel, tempCapTargetParcel);
      //3.3.2 Edit parcel with sourceparcel. 
      aa.parcel.updateDailyParcelWithAPOAttribute(tempCapTargetParcel);
    }
    //3.4 It is new parcel model.
    else
    {
      //3.4.1 Create new parcel.
      aa.parcel.createCapParcelWithAPOAttribute(aa.parcel.warpCapIdParcelModel2CapParcelModel

      (targetCapId, sourceParcelModel).getOutput());
    }
  }
}


function copyParcelForLic(srcCapId, targetCapId)
{
	//1. Get parcels with source CAPID.
	var copyParcels = getParcelForLic(srcCapId);
	if (copyParcels == null || copyParcels.length == 0)
	{
		return;
	}
	//2. Get parcel with target CAPID.
	var targetParcels = getParcelForLic(targetCapId);
	//3. Check to see which parcel is matched in both source and target.
	for (i = 0; i < copyParcels.size(); i++)
	{
		sourceParcelModel = copyParcels.get(i);
		//3.1 Set target CAPID to source parcel.
		sourceParcelModel.setCapID(targetCapId);
		targetParcelModel = null;
		//3.2 Check to see if sourceParcel exist.
		if (targetParcels != null && targetParcels.size() > 0)
		{
			for (j = 0; j < targetParcels.size(); j++)
			{
				if (isMatchParcel(sourceParcelModel, targetParcels.get(j)))
				{
					targetParcelModel = targetParcels.get(j);
					break;
				}
			}
		}
		//3.3 It is a matched parcel model.
		if (targetParcelModel != null)
		{
			//3.3.1 Copy information from source to target.
			var tempCapSourceParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, sourceParcelModel).getOutput();
			var tempCapTargetParcel = aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, targetParcelModel).getOutput();
			aa.parcel.copyCapParcelModel(tempCapSourceParcel, tempCapTargetParcel);
			//3.3.2 Edit parcel with sourceparcel. 
			aa.parcel.updateDailyParcelWithAPOAttribute(tempCapTargetParcel);
		}
		//3.4 It is new parcel model.
		else
		{
			//3.4.1 Create new parcel.
			aa.parcel.createCapParcelWithAPOAttribute(aa.parcel.warpCapIdParcelModel2CapParcelModel(targetCapId, sourceParcelModel).getOutput());
		}
	}
}

function copyPeopleForLic(srcCapId, targetCapId)
{
	//1. Get people with source CAPID.
	var capPeoples = getPeopleForLic(srcCapId);
	if (capPeoples == null || capPeoples.length == 0)
	{
		return;
	}
	//2. Get people with target CAPID.
	var targetPeople = getPeopleForLic(targetCapId);
	//3. Check to see which people is matched in both source and target.
	for (loopk in capPeoples)
	{
		sourcePeopleModel = capPeoples[loopk];
		//3.1 Set target CAPID to source people.
		sourcePeopleModel.getCapContactModel().setCapID(targetCapId);
		targetPeopleModel = null;
		//3.2 Check to see if sourcePeople exist.
		if (targetPeople != null && targetPeople.length > 0)
		{
			for (loop2 in targetPeople)
			{
				if (isMatchPeople(sourcePeopleModel, targetPeople[loop2]))
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
			if(targetPeopleModel.getCapContactModel().getPeople() != null && sourcePeopleModel.getCapContactModel().getPeople())
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
function copyPublicUserToSpecificRecord(contactType,useCapId) {
	if (publicUser) {
		try {
			// get the public user account
			var getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);

			if (getUserResult.getSuccess() && getUserResult.getOutput()) {
				userModel = getUserResult.getOutput();
				userSeqNum = userModel.getUserSeqNum();
				refContact = getRefContactForPublicUser(userSeqNum)
					if (refContact != null) {
						refContactNum = refContact.getContactSeqNumber();
						addRefContactToRecord(refContactNum, contactType, useCapId);
					} //if (refContact != null)

			} //if (getUserResult.getSuccess() && getUserResult.getOutput())

		} //try
		catch (err) {
			aa.print("A JavaScript Error occurred: " + err.message);
		}
	}
}

function createChildTempRecord(cTypeArray) // optional groups to ignore
{
	var childId = null;
	if (arguments.length > 0) 
	{
		groupsIgnoreArray = arguments[1];
	}
	
	var cRecordArray = getChildren(cTypeArray[0] + "/" + cTypeArray[1] + "/" + cTypeArray[2] + "/" + cTypeArray[3],capId);
	if (isEmpty(cRecordArray)){
		try{	
			ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
			ctm.setGroup(cTypeArray[0]);
			ctm.setType(cTypeArray[1]);
			ctm.setSubType(cTypeArray[2]);
			ctm.setCategory(cTypeArray[3]);
			childId = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE TMP").getOutput();
			aa.cap.createAssociatedFormsHierarchy(capId, childId);
			copyAdditionalInfo(capId, childId);
			copyAddresses(capId, childId);
			copyParcels(capId, childId);
			//copyOwner(capId, childId);
			//copyContactsForAssociatedForms(capId, childId);
            copyLicensedProf(capId, childId);
            //copyAddresses(capId, childId);
           var childCap = aa.cap.getCap(childId).getOutput();
            aa.print("Parent Cap: " + parentCapId);
            if (parentCapId) {
                parentCap =aa.cap.getCap(capId).getOutput();
            }
        if (parentCap) {
                contactList = parentCap.getContactsGroup();
                for (i = 0; i < contactList.size(); i++) {
                    contactList.get(i).getPeople().setContactSeqNumber(null);
                    contactList.get(i).setComponentName(contactList.get(i).getContactType());
                }
                childCap.setContactsGroup(contactList); 
            }
        if (parentCap) {
            childCap.setContactsGroup(contactList);
            }
                        //Copy Applicant
        if (parentCap) {
                        var vApplicantModel = parentCap.getApplicantModel();
                        childCap.setApplicantModel(vApplicantModel);
        }


        
        copyAddress(parentCapId, capId);
        copyParcel(parentCapId, capId);
        copyOwner(parentCapId, capId);	
  
   if (parentCap) {
		aa.env.setValue("CapModel",childCap);
	}



		}
		catch (err) {
			logDebug("createChildTempRecord Error occured: " + err.message);
		}		
	}
	return childId;
}
function createLicProfAndRelate(rlpType, pContactType, licExpDate, licIssDate, capId)
{
    //Creates/updates a reference licensed prof from a Contact
    var capContResult = aa.people.getCapContactByCapID(capId);
    var altId = capId.getCustomID();
    if (capContResult.getSuccess())
    {
        conArr = capContResult.getOutput();
    }
    else
    {
        logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
        return false;
    }
    if (!conArr.length)
    {
        logDebug ("**WARNING: No contact available");
        return false;
    }

    var newLic = aa.licenseScript.createLicenseScriptModel();

    if (pContactType == null)
    {
        var cont = conArr[0]; //if no contact type specified, use first contact
    }
    else
    {
        var contFound = false;
        for (yy in conArr)
        {
            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
            {
                compCont = conArr[yy];
                cont = conArr[yy];
                contFound = true;
            }
        }
        if (!contFound)
        {
            logDebug ("**WARNING: No Contact found of type: "+pContactType);
            return false;
        }
    }
    logDebug("=========We are now handling the Reference Contact Information=========");
    peop = cont.getPeople();
    compPeop = compCont.getPeople();
    addr = peop.getCompactAddress();
    compAddr = compPeop.getCompactAddress();
    newLic.setContactFirstName(cont.getFirstName());
    newLic.setContactLastName(cont.getLastName());
    newLic.setBusinessName(compPeop.getBusinessName());
    logDebug("Company Name: " +compPeop.getBusinessName() + " Pulled from: " + capId.getCustomID() );
    newLic.setAddress1(compAddr.getAddressLine1());
    newLic.setAddress2(compAddr.getAddressLine2());
    newLic.setAddress3(compAddr.getAddressLine3());
    newLic.setCity(compAddr.getCity());
    newLic.setState(compAddr.getState());
    newLic.setZip(compAddr.getZip());
    newLic.setPhone1(compPeop.getPhone3());
    newLic.setPhone2(peop.getPhone2());
    newLic.setEMailAddress(peop.getEmail());
    newLic.setFax(compPeop.getFax());
    newLic.setAgencyCode(aa.getServiceProviderCode());
    newLic.setAuditDate(sysDate);
    newLic.setAuditID(currentUserID);
    newLic.setAuditStatus("A");
    newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
    newLic.setLicenseType(rlpType);
    newLic.setStateLicense(altId);
    newLic.setContLicBusName(compPeop.getEmail());
    newLic.setLicState("NY");
    newLic.setLicenseIssueDate(aa.date.parseDate(licIssDate));
    
    myResult = aa.licenseScript.createRefLicenseProf(newLic);
    
    if (myResult.getSuccess())
    {
        assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
        return true;
    }
    else
    {
        logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
        return false;
    }
}
function createNewAddress(address){
	var newAddr1 = address[0];
	var newCity = address[1];
	var newState = address[2];
	var newZip = address[3];
	
	var newAddressModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.AddressModel").getOutput();
	newAddressModel.setCapID(capId);
	newAddressModel.setServiceProviderCode(aa.getServiceProviderCode());
	newAddressModel.setAuditID("ADMIN");
	newAddressModel.setPrimaryFlag("Y"); 

// per customer - add address to BOTH AddressLine1 and StreetName
	newAddressModel.setAddressLine1(newAddr1);
	newAddressModel.setStreetName(newAddr1);
	newAddressModel.setCity(newCity);
	newAddressModel.setState(newState);
	newAddressModel.setZip(newZip);

	aa.address.createAddress(newAddressModel);
	//logDebug("Added record address " + newAddr1 + ", " + newCity + ", " + newState + ", " + newZip + " successfully!");
}
function createSet(setName,setDescription) {

    //optional 3rd parameter is setType
    //optional 4th parameter is setStatus
    //optional 5th paramater is setStatusComment
    servProvCode = "SUFFOLKCO";
    var setType = "";
    var setStatus = "";
    var setStatusComment = "";

    if (arguments.length > 2) {
        setType = arguments[2]
    }

    if (arguments.length > 3) {
        setStatus = arguments[3]
    }

    if (arguments.length > 4) {
        setStatusComment = arguments[4];
    }

    var setScript = aa.set.getSetHeaderScriptModel().getOutput();
    setScript.setSetID(setName);
    setScript.setSetTitle(setDescription);
    setScript.setSetStatusComment(setStatusComment);
    setScript.setSetStatus(setStatus);
    setScript.setRecordSetType(setType);
    setScript.setServiceProviderCode(servProvCode);
    setScript.setAuditDate(aa.date.getCurrentDate());
    //setScript.setAuditID(currentUserID);

    var setCreateResult = aa.set.createSetHeader(setScript);

    return setCreateResult.getSuccess();
}

function createUpdateRefLicProfDCA(capId, relate) {
	if (capId == null) {
		logDebug("createUpdateReFLicProfDCA : capId object is null");
		return;
	}
	if (relate == null) relate = true;
    thisCapIDString = capId.getCustomID();
	thisCap = aa.cap.getCap(capId).getOutput();
	thisAppTypeResult = thisCap.getCapType();
	thisAppTypeString = thisAppTypeResult.toString();
    thisAppTypeArray = thisAppTypeString.split("/");
    
    pContactType = "Business Owner";
    rlpType = thisAppTypeArray[2];
    licNum = thisCapIDString;
    licExpDate = getAppSpecific("Expiration Date", capId);

    // 20210628 - jcrussell - begin
    // Moved to within Ref LP Loop
    // var updating = false;
    // var newLic = getRefLicenseProf(licNum, rlpType);
	// if (newLic) {
    //     updating = true;
    // }
    // else {
    //     var newLic = aa.licenseScript.createLicenseScriptModel();
    // }
    // 20210628 - jcrussell - end

    //Creates/updates a reference licensed prof from a Contact
    var capContResult = aa.people.getCapContactByCapID(capId);
    var altId = capId.getCustomID();
    if (capContResult.getSuccess()) {
        conArr = capContResult.getOutput();
    }
    else {
        logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
        return false;
    }
    if (!conArr.length) {
        logDebug ("**WARNING: No contact available");
        return false;
    }

    if (pContactType == null) {
        var cont = conArr[0]; //if no contact type specified, use first contact
    }
    else
    {
        var contFound = false;
        for (yy in conArr) {
            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()) || "Vendor".equals(conArr[yy].getCapContactModel().getPeople().getContactType()) ) {
                compCont = conArr[yy];
                cont = conArr[yy];
                contFound = true;
            }
        }
        if (!contFound) {
            logDebug ("**WARNING: No Contact found of type: "+pContactType);
            return false;
        }
    }
    // 20210628 - jcrussell - begin
    // If we are here we have either 'pContactType' or "Vendor" contact.
    // we need to, also, create a DBA Ref LP if DBA Cont Ty exists.
    var allContDoRefLp = [];
    allContDoRefLp['prim'] = [];
    allContDoRefLp['prim']['compCont'] = compCont;
    allContDoRefLp['prim']['cont'] = cont;
    for(var zz in conArr){
        if("DBA".equals(conArr[zz].getCapContactModel().getPeople().getContactType())){
            allContDoRefLp['dba'] = [];
            allContDoRefLp['dba']['compCont'] = conArr[zz];
            allContDoRefLp['dba']['cont'] = conArr[zz];
            break;
        }
    }
    for(var idxa in allContDoRefLp){
        compCont = allContDoRefLp[idxa]['compCont'];
        cont = allContDoRefLp[idxa]['cont'];

        peop = cont.getPeople();
        compPeop = compCont.getPeople();
        addr = peop.getCompactAddress();
        compAddr = compPeop.getCompactAddress();

        // Set Ref LP State Lic correctly for primary or DBA Ref LP
        var licNumber = "";
        if(idxa == 'prim'){
            licNumber = thisCapIDString;
        } else if(idxa == 'dba'){
            licNumber = "DBA_" + thisCapIDString;
        }


        // This was moved from outside the loop, since we may now
        // be acting on multiple ref LPs.
        var updating = false;
        var newLic = getRefLicenseProf(licNumber, rlpType);
        if (newLic) {
            updating = true;
        }
        else {
            var newLic = aa.licenseScript.createLicenseScriptModel();
        }

        newLic.setContactFirstName(cont.getFirstName());
        newLic.setContactLastName(cont.getLastName());
        newLic.setBusinessName(compPeop.getBusinessName());
        newLic.setAddress1(compAddr.getAddressLine1());
        newLic.setAddress2(compAddr.getAddressLine2());
        newLic.setAddress3(compAddr.getAddressLine3());
        newLic.setCity(compAddr.getCity());
        newLic.setState(compAddr.getState());
        newLic.setZip(compAddr.getZip());
        newLic.setPhone1(compPeop.getPhone1());
        newLic.setPhone2(peop.getPhone2());
        newLic.setPhone3(peop.getPhone3());
        newLic.setEMailAddress(peop.getEmail());
        newLic.setFax(compPeop.getFax());
        newLic.setAgencyCode(aa.getServiceProviderCode());
        newLic.setAuditDate(sysDate);
        newLic.setAuditID(currentUserID);
        newLic.setAuditStatus("A");
        if (licExpDate && licExpDate != "")
            newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
        newLic.setLicenseType(rlpType);
        //newLic.setStateLicense(thisCapIDString);
        newLic.setStateLicense(licNumber);
        newLic.setLicState("NY");
        newLic.setMaskedSsn(compPeop.getSocialSecurityNumber());
        newLic.setSocialSecurityNumber(compPeop.getSocialSecurityNumber());
        bDate = compCont.getCapContactModel().getBirthDate();
        issueDate = getAppSpecific("Issued Date");
        if (issueDate && issueDate != "") newLic.setLicenseIssueDate(aa.date.parseDate(issueDate));
        insCo = getAppSpecific("Insurance Agent", capId)
        if (insCo && insCo != "") newLic.setInsuranceCo(insCo);
        insPolicy = getAppSpecific("Insurance Policy", capId);
        if (insPolicy && insPolicy != "") newLic.setPolicy(insPolicy);
        insExpDate = getAppSpecific("Policy Expiration Date", capId);
        if (insExpDate && insExpDate != "") newLic.setInsuranceExpDate(aa.date.parseDate(insExpDate));
        wcInsPolicy = getAppSpecific("Workers Comp #", capId);
        if (wcInsPolicy && wcInsPolicy != "") newLic.setWcPolicyNo(wcInsPolicy);
        wcExpDate = getAppSpecific("Workers Comp Expiration Date", capId);
        if (wcExpDate && wcExpDate != "") newLic.setWcExpDate(aa.date.parseDate(wcExpDate));
        fein = getAppSpecific("Federal Tax ID #", capId);
        if (fein && fein != "") newLic.setFein(fein);
        if (bDate) {
            var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
        }
        
        if (updating) {
            var myResult = aa.licenseScript.editRefLicenseProf(newLic);
            if (myResult.getSuccess()) {
                //logDebug("Successfully updated LP " + thisCapIDString);
                logDebug("Successfully updated LP " + licNumber);
            }
            else {
                logDebug("**ERROR: can't update ref lic prof: " + myResult.getErrorMessage());
                return false;
            }
        }
        else {
            myResult = aa.licenseScript.createRefLicenseProf(newLic);
            if (myResult.getSuccess()) {
                bWebSite = getAppSpecific("Business Website", capId);
                if (bWebSite && bWebSite != "")
                    editRefLicProfAttribute(licNumber,"BUSINESS WEBSITE",bWebSite);
                cArrears = getAppSpecific("Child Support Arrears", capId);
                if (cArrears == "CHECKED")
                    editRefLicProfAttribute(licNumber, "CHILD SUPPORT ARREARS", "Yes");
                nysID = getAppSpecific("NYS Sales Tax ID #", capId);
                if (nysID && nysID != "") 
                    editRefLicProfAttribute(licNumber, "NYS SALES TAX ID #", nysID);
                dli = getAppSpecific("Driver License Info", capId);
                if (dli && dli != "")
                    editRefLicProfAttribute(licNumber, "DRIVER LICENSE INFO", dli);
                coNum = getAppSpecific("Company Affiliation License Number", capId);
                if (coNum && coNum != "")
                    editRefLicProfAttribute(licNumber, "LICENSE NUMBER",coNum);	
                if (bDate) {
                    var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                    editRefLicProfAttribute(licNumber, "BIRTH DATE", sdtBirthDate);	
                }
                if (relate)
                    assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
                //logDebug("Successfully created LP " + thisCapIDString);
                logDebug("Successfully created LP " + licNumber);
            }
            else {
                logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
                logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
                return false;
            }
        }
    }
    // 20210628 - jcrussell - end

	return true;
}


function createUpdateRefLicProfIA(capId) {

    if (capId == null) {
        logDebug("createUpdateReFLicProfIA : capId object is null");
        return;
    }
 
    capIDString = capId.getCustomID();
    cap = aa.cap.getCap(capId).getOutput();
    thisAppTypeResult = cap.getCapType();
    thisAppTypeString = thisAppTypeResult.toString();
    thisAppTypeArray = thisAppTypeString.split("/");    
    licNum = capIDString;
    licExpDate = getAppSpecific("Expiration Date", capId);

    if (cap)
    {      
        if (licExpDate && licExpDate != "")
        {
            var restrictionTable = loadASITable("RESTRICTIONS");                            
            for (var p in restrictionTable)
            {
                var type = restrictionTable[p]["Type"];
                var category = restrictionTable[p]["Category"];                                
                var cat = category.toString();
                cat = cat.substr(0,4);                              
            
                if (cat == "LW11" || cat == "LW10")
                {          
                    var capContResult = aa.people.getCapContactByCapID(capId);

                    if (capContResult.getSuccess()) 
                    {
                        conArray = capContResult.getOutput();
                        for (con in conArray)
                        {
                            contactType = conArray[con].getCapContactModel().getPeople().getContactType();
                            
                            if (contactType == "Vendor")
                            {                                           
                                var licenType;                                            
                                if (cat == "LW11")
                                {
                                    licenType = "IA Service Provider";
                                                          
                                }                                         
                                else if (cat == "LW10")
                                {
                                    licenType = "IA Installer";                                    
                                }
                                
                                // Find existing LP with the same first and last name first
                                logDebug("<b>*** Look for: ***" + capIDString+ ". License Type: " + licenType + "</b>");

                                var newLic = getRefLicenseProf(licNum, licenType);

                                if (newLic) 
                                {
                                    logDebug ("**Found lic Prof: " + licNum + " Skip**");
                                }
                                else
                                {
                                    logDebug ("**Cannot find lic Prof: " + licNum + ". Going to create one.**");
                                    newLic = aa.licenseScript.createLicenseScriptModel();
                                
                                    //Create a reference licensed prof from a Contact
                                    var capContResult = aa.people.getCapContactByCapID(capId);
                                    var altId = capId.getCustomID();
                                    if (capContResult.getSuccess()) {
                                        conArr = capContResult.getOutput();
                                    }
                                    else {
                                        logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
                                        return false;
                                    }
                                    if (!conArr.length) {
                                        logDebug ("**WARNING: No contact available");
                                        return false;
                                    }

                                    if (pContactType == null) {
                                        var cont = conArr[0]; //if no contact type specified, use first contact
                                    }
                                    else
                                    {
                                        var contFound = false;
                                        for (yy in conArr) {
                                            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()) || "Vendor".equals(conArr[yy].getCapContactModel().getPeople().getContactType()) ) {
                                                compCont = conArr[yy];
                                                cont = conArr[yy];
                                                contFound = true;
                                            }
                                        }
                                        if (!contFound) {
                                            logDebug ("**WARNING: No Contact found of type: "+pContactType);
                                            return false;
                                        }
                                    }
                                    peop = cont.getPeople();
                                    compPeop = compCont.getPeople();
                                    addr = peop.getCompactAddress();
                                    compAddr = compPeop.getCompactAddress();
                                    newLic.setContactFirstName(cont.getFirstName());
                                    newLic.setContactLastName(cont.getLastName());
                                    newLic.setBusinessName(compPeop.getBusinessName());
                                    newLic.setAddress1(compAddr.getAddressLine1());
                                    newLic.setAddress2(compAddr.getAddressLine2());
                                    newLic.setAddress3(compAddr.getAddressLine3());
                                    newLic.setCity(compAddr.getCity());
                                    newLic.setState(compAddr.getState());
                                    newLic.setZip(compAddr.getZip());
                                    newLic.setPhone1(compPeop.getPhone1());
                                    newLic.setPhone2(peop.getPhone2());
                                    newLic.setPhone3(peop.getPhone3());
                                    newLic.setEMailAddress(peop.getEmail());
                                    newLic.setFax(compPeop.getFax());
                                    newLic.setAgencyCode(aa.getServiceProviderCode());
                                    newLic.setAuditDate(sysDate);
                                    newLic.setAuditID(currentUserID);
                                    newLic.setAuditStatus("A");
                                    if (licExpDate && licExpDate != "")
                                        newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
                                    newLic.setLicenseType(rlpType);
                                    newLic.setStateLicense(thisCapIDString);
                                    newLic.setLicState("NY");
                                    newLic.setMaskedSsn(compPeop.getSocialSecurityNumber());
                                    newLic.setSocialSecurityNumber(compPeop.getSocialSecurityNumber());
                                    bDate = compCont.getCapContactModel().getBirthDate();
                                    issueDate = getAppSpecific("Issued Date");
                                    if (issueDate && issueDate != "") newLic.setLicenseIssueDate(aa.date.parseDate(issueDate));
                                    insCo = getAppSpecific("Insurance Agent", capId)
                                    if (insCo && insCo != "") newLic.setInsuranceCo(insCo);
                                    insPolicy = getAppSpecific("Insurance Policy", capId);
                                    if (insPolicy && insPolicy != "") newLic.setPolicy(insPolicy);
                                    insExpDate = getAppSpecific("Policy Expiration Date", capId);
                                    if (insExpDate && insExpDate != "") newLic.setInsuranceExpDate(aa.date.parseDate(insExpDate));
                                    wcInsPolicy = getAppSpecific("Workers Comp #", capId);
                                    if (wcInsPolicy && wcInsPolicy != "") newLic.setWcPolicyNo(wcInsPolicy);
                                    wcExpDate = getAppSpecific("Workers Comp Expiration Date", capId);
                                    if (wcExpDate && wcExpDate != "") newLic.setWcExpDate(aa.date.parseDate(wcExpDate));
                                    fein = getAppSpecific("Federal Tax ID #", capId);
                                    if (fein && fein != "") newLic.setFein(fein);
                                    if (bDate) {
                                        var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                                    }
                                    
                                    
                                    myResult = aa.licenseScript.createRefLicenseProf(newLic);
                                    if (myResult.getSuccess()) {
                                        bWebSite = getAppSpecific("Business Website", capId);
                                        if (bWebSite && bWebSite != "")
                                            editRefLicProfAttribute(licNum,"BUSINESS WEBSITE",bWebSite);
                                        cArrears = getAppSpecific("Child Support Arrears", capId);
                                        if (cArrears == "CHECKED")
                                            editRefLicProfAttribute(licNum, "CHILD SUPPORT ARREARS", "Yes");
                                        nysID = getAppSpecific("NYS Sales Tax ID #", capId);
                                        if (nysID && nysID != "") 
                                            editRefLicProfAttribute(licNum, "NYS SALES TAX ID #", nysID);
                                        dli = getAppSpecific("Driver License Info", capId);
                                        if (dli && dli != "")
                                            editRefLicProfAttribute(licNum, "DRIVER LICENSE INFO", dli);
                                        coNum = getAppSpecific("Company Affiliation License Number", capId);
                                        if (coNum && coNum != "")
                                            editRefLicProfAttribute(licNum, "LICENSE NUMBER",coNum);	
                                        if (bDate) {
                                            var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
                                            editRefLicProfAttribute(licNum, "BIRTH DATE", sdtBirthDate);	
                                        }
                                        if (relate)
                                            assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
                                        logDebug("Successfully created LP " + thisCapIDString);
                                    }
                                    else {
                                        logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
                                        logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
                                        return false;
                                    }
                            }
                                
                            }
                        }
                    }
	                
                }
            }
        }
    }

    return true;
}


function createupdateRefLPFromRecordLP(capId) {
	itemCap = capId;
	if (arguments.length > 0)
		itemCap = arguments[0];
	if (!itemCap) {
		logDebug("capId object is null")
		return;
	}
	relate = true;
	var capLicenseResult = aa.licenseProfessional.getLicenseProf(itemCap);
    var capLicenseArr = new Array();
    if (capLicenseResult.getSuccess()) {
        capLicenseArr = capLicenseResult.getOutput();
    } else {
        retVal = false;
    }
    for (capLic in capLicenseArr) {
        licProfScriptModel = capLicenseArr[capLic];
        licNumber = licProfScriptModel.getLicenseNbr();
		licType = licProfScriptModel.getLicenseType();
		aa.print(licNumber + ":" + licType);
        var updating = false;
        var newLic = getRefLicenseProf(licNumber, licType);
        if (newLic) {
            updating = true;
        }
        else {
            var newLic = aa.licenseScript.createLicenseScriptModel();
		}
		if (!updating) {
			newLic.setLicenseType(licType);
			newLic.setStateLicense(licNumber);
		}
        newLic.setAddress1(licProfScriptModel.getAddress1());
        newLic.setAddress2(licProfScriptModel.getAddress2());
        newLic.setAddress3(licProfScriptModel.getAddress3());
        newLic.setAgencyCode(licProfScriptModel.getAgencyCode());
        newLic.setAuditDate(licProfScriptModel.getAuditDate());
        newLic.setAuditID(licProfScriptModel.getAuditID());
        newLic.setAuditStatus(licProfScriptModel.getAuditStatus());
		newLic.setBusinessLicense(licProfScriptModel.getBusinessLicense());
        newLic.setBusinessName(licProfScriptModel.getBusinessName());
        newLic.setCity(licProfScriptModel.getCity());
        newLic.setCityCode(licProfScriptModel.getCityCode());
        newLic.setContactFirstName(licProfScriptModel.getContactFirstName());
        newLic.setContactLastName(licProfScriptModel.getContactLastName());
        newLic.setContactMiddleName(licProfScriptModel.getContactMiddleName());
        newLic.setContryCode(licProfScriptModel.getCountryCode());
        newLic.setCountry(licProfScriptModel.getCountry());
        newLic.setEinSs(licProfScriptModel.getEinSs());
        newLic.setEMailAddress(licProfScriptModel.getEmail());
		newLic.setFax(licProfScriptModel.getFax());
		issueDate = licProfScriptModel.getLastUpdateDate();  // yes- really, the original issue date is stored in this field.
		if (issueDate) {
			newLic.setLicenseIssueDate(issueDate);
		}
        newLic.setPhone1(licProfScriptModel.getPhone1());
        newLic.setPhone2(licProfScriptModel.getPhone2());
        //newLic.setSelfIns(licProfScriptModel.getSelfIns());
        newLic.setState(licProfScriptModel.getState());
		newLic.setLicState('NY');
        newLic.setSuffixName(licProfScriptModel.getSuffixName());
        newLic.setWcExempt(licProfScriptModel.getWorkCompExempt());
        newLic.setZip(licProfScriptModel.getZip());
        newLic.setFein(licProfScriptModel.getFein());
		newLic.setPhone3(licProfScriptModel.getPhone3());
		casm = licProfScriptModel.getAttributes();
        if (updating) {
            var myResult = aa.licenseScript.editRefLicenseProf(newLic);
            if (myResult.getSuccess()) {
                logDebug("Successfully updated LP " + licNumber);
            }
            else {
                logDebug("**ERROR: can't update ref lic prof: " + myResult.getErrorMessage());
            }
        }
        else {
			aa.print("creating a lic prof");
            myResult = aa.licenseScript.createRefLicenseProf(newLic);
            if (myResult.getSuccess()) {
                if (relate)
                    assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
				logDebug("Successfully create LP " + licNumber);
            }
            else {
                aa.print("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
            }
		}
		for (var i in casm) {
			attrObj = casm[i];
			attrVal = attrObj.getAttributeValue();
			if (attrVal && attrVal != "") {
				editRefLicProfAttribute(licNumber, attrObj.getAttributeName(), attrVal);
			}
		}
    }
}

function deactivateTaskByCap(wfstr, capId) 
{
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess()) 
    {
        var wfObj = workflowResult.getOutput();
    } else 
    {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
  
    for (var i in wfObj) 
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) 
        {
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            //PARAMETERS ARE: Cap ID, StepNumber, ActiveFlag, CompleteFlag, Assignment Date, Due Date
            aa.workflow.adjustTask(capId, stepnumber, "N", "N", null, null);
            logDebug("Activating Workflow Task: " + wfstr);
        }
    }
}
/**  
* 	@param docType 
* 	used to halt progress of an ACA Pageflow by reviewing documents currently attached to it. 
*/
function determineACADocumentAttached(docType) {
	var docList = aa.document.getDocumentListByEntity(capId, "TMP_CAP");
	if (docList.getSuccess()) {
		docsOut = docList.getOutput();
		if (docsOut.isEmpty()) {
			return false;
		}
		else {
			attach = false;
			docsOuti = docsOut.iterator();
			while (docsOuti.hasNext()) {
				doc = docsOuti.next();
				docCat = doc.getDocCategory();
				logDebug("Document Category: " + docCat);
				if (docCat == (docType)) {
					attach = true;
				}
			}
			if (attach) {
				return true;
			}
			else {
				return false;
			}
		}
	}
	else {
		return false;
	}
}


function doConfigurableScriptActions() {
	var module = "";

	if (appTypeArray && appTypeArray[0] != undefined) {
		module = appTypeArray[0];
	}

	if (typeof capId !== 'undefined' && capId) {
		if (module == "") {
			var itemCap = aa.cap.getCap(capId).getOutput();
			var itemCapModel = itemCap.getCapModel();
			module = itemCapModel.getModuleName();
		}
	}

	if (module != "") {
		rulesetName = "CONFIGURABLE_RULESET_" + module;
		rulesetName = rulesetName.toUpperCase();
		logDebug("rulesetName: " + rulesetName);

		try {
			var configRuleset = getScriptText(rulesetName);
			if (configRuleset == "") {
				logDebug("No JSON file exists for this module.");
			} else {
				var configJSON = JSON.parse(configRuleset);

				// match event, run appropriate configurable scripts
				settingsArray = [];
				if (configJSON[controlString]) {
					var ruleSetArray = configJSON[controlString];
					var scriptsToRun = ruleSetArray.StandardScripts;
					var customScriptsToRun = ruleSetArray.CustomScripts;
					var script;
					var validScript;

					for (var s in scriptsToRun) {

						if (exists(scriptsToRun[s], customScriptsToRun)) {
							logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s] + " Overridden in CustomScripts, Skipped.");
							continue;
						}

						logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s]);
						script = scriptsToRun[s];
						validScript = getScriptText(script);
						if (validScript != "") {
							logDebug("Script " + script + " exist and executed from Non-Master scripts");
							eval(validScript);
						} else {
							eval(getScriptText(script, null, true)); // now calling this section from master scripts
						}
					}
					for (var cs in customScriptsToRun) {
						logDebug("doConfigurableScriptActions customScriptsToRun[cs]: " + customScriptsToRun[cs]);
						script = customScriptsToRun[cs];
						validScript = getScriptText(script);
						if (validScript == "") {
							logDebug("Configurable custom script " + script + " does not exist.");
						} else {
							eval(validScript);
						}
					}
				}
			}
		} catch (err) {
			logDebug("ERROR: doConfigurableScriptActions " + rulesetName + " Error Message:" + err.message);
			handleError(err, "doConfigurableScriptActions " + rulesetName);
		}
	}
}
function editASITableRow(tableCapId, tableName, editName, editValue) {
	logDebug("In editASITableRow with parameters:" + "|" + tableCapId + "|" + tableName + "|" + editName + "|" + editValue);
	var tableArr = loadASITable(tableName, tableCapId);
	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
	if (tableArr) {
		for (var r in tableArr) {
			logDebug("In row " + r);
			var rowArr=new Array();
			var tempArr=new Array();
			for (var col in tableArr[r]) {
				if (tableArr[r][col].columnName.toString() == editName) {
					logDebug("Editing column: " + editName + " to " + editValue);
					var tVal = tableArr[r][col];
					tVal.fieldValue = editValue;
				}else {
					var tVal = tableArr[r][col];
				}
				logDebug("colName:" + tableArr[r][col].columnName.toString() + "|row:" + tableArr[r][col])
				//bizarre string conversion - just go with it
				var colName = new String(tableArr[r][col].columnName.toString());
				colName=colName.toString();
				tempArr[colName] = tVal;
			}

			rowArr.push(tempArr); 
			//for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
			addASITable(tableName,rowArr,tableCapId);
		}
	}
}
function editASITableRowEndDate(tableCapId, tableName, editValue1, editValue2) 
{
    var tableArr = loadASITable(tableName, tableCapId);
    var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
    var k = 0;
    showDebug = false; 
    if (tableArr) 
    {
        logDebug("tableArr.length is: " + tableArr.length);
        for (var r in tableArr) 
        {
			logDebug("In row " + r + " in editASITableRowEndDate");
			var rowArr=new Array();
            var tempArr=new Array();
            var endCheck = false;
            endCheck = checkEndDate(k, tableArr);
            for (var col in tableArr[r]) 
            {
                var tVal = tableArr[r][col];
                if (!endCheck)
                {
                    logDebug("column name is: " + tableArr[r][col].columnName.toString());
                    logDebug("field's value is: " + tVal);
                    if (tableArr[r][col].columnName.toString() == "Approved Date") 
                    {
                        //Updating current rows "Approved date to 01/01/current year + 1 only if "End Date" is null
                        ;
                        tVal.fieldValue = editValue2;      
                    }
                    if (tableArr[r][col].columnName.toString() == "Start Date") 
                    {
                        ;
                        tVal.fieldValue = editValue1;      
                    }
                }
                else 
                {
                    var tVal = tableArr[r][col];
                }
                logDebug("colName:" + tableArr[r][col].columnName.toString() + "|row:" + tableArr[r][col])
                //bizarre string conversion - just go with it
                var colName = new String(tableArr[r][col].columnName.toString());
                colName=colName.toString();
                tempArr[colName] = tVal;
                
			}
			rowArr.push(tempArr); 
			//for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
            k++;
		}
	}
}

function checkEndDate(k,tableArr)
{
    if (tableArr) 
    {
        for (j in tableArr) 
        {
            var j = k;
            aa.print("In row " + j + " in checkEndDate");
            for (c in tableArr[j])
            {
                var tVal = tableArr[j][c];
                if (tableArr[j][c].columnName.toString() == "End Date")
                {
                    if (tVal.toString().length == 0)
                    {
                        aa.print("Setting endCheck to false");
                        return false;       
                    }
                    else
                    {
                        aa.print("Setting endCheck to true");
                        return true;
                    }
                }
            }
        }
    }
}
function editASITableRowNull(tableCapId, tableName, editName, editValue) {
	logDebug("In editASITableRow with parameters:" + "|" + tableCapId + "|" + tableName + "|" + editName + "|" + editValue);
	var tableArr = loadASITable(tableName, tableCapId);
	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
	if (tableArr) {
		for (var r in tableArr) {
			logDebug("In row " + r);
			var rowArr=new Array();
			var tempArr=new Array();
            for (var col in tableArr[r]) 
            {
                var tVal = tableArr[r][col];
                logDebug("column name is: " + tableArr[r][col].columnName.toString());
                logDebug("field's value is: " + tVal);
                if (tableArr[r][col].columnName.toString() == editName) 
                {
                    if (tVal.toString().length == 0)
                    {
                        logDebug("Editing column: " + editName + " to " + editValue);
                        ;
                        tVal.fieldValue = editValue;
                    }
                }
                else 
                {
                    var tVal = tableArr[r][col];
                }
                logDebug("colName:" + tableArr[r][col].columnName.toString() + "|row:" + tableArr[r][col])
                //bizarre string conversion - just go with it
                var colName = new String(tableArr[r][col].columnName.toString());
                colName=colName.toString();
                tempArr[colName] = tVal;
                
			}
			rowArr.push(tempArr); 
			//for (var val in rowArr) for (var c in rowArr[val]) logDebug("Value " + c + ": " + rowArr[val][c]);
			addASITable(tableName,rowArr,tableCapId);
		}
	}
}
function editASITableRowViaRowIdentifer(tableCapId, tableName, editName, editValue, rowValue, rowIdentifier) {
    logDebug("In editASITableRow with parameters:" + "|" + tableCapId + "|" + tableName + "|" + editName + "|" + editValue + "|" + rowValue + "|" + rowIdentifier);
    //[push]
    var tableArr = loadASITable(tableName, tableCapId);
    var returnStatus = false;
	var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
	if (tableArr) {
		for (var r in tableArr) {
			logDebug("In row " + r);
			var rowArr=new Array();
			var tempArr=new Array();
			for (var col in tableArr[r]) {
                if(tableArr[r][rowIdentifier] != undefined)
                {

               
              //  logDebug("This is value of col: " + col);
             // logDebug("Comparing: " + tableArr[r][rowIdentifier].toString()   + " with: " + rowValue.toString());
                if (tableArr[r][rowIdentifier].toString()  == rowValue.toString()) 
                {  // logDebug("Comparing: " + tableArr[r][col].columnName.toString() + " with: " + editName);
                   
                    if(tableArr[r][col].columnName.toString()==editName)
                    {
                        logDebug("We are looking for tank number: " + rowValue + " this is our current value: " + tableArr[r][col]);
                    
					var tVal = tableArr[r][editName];
                    tVal.fieldValue = editValue;
                    logDebug("Set value of " + tableArr[r][editName].columnName.toString() + " to be: " + editValue);
                    returnStatus = true;
                    
                }
                else {
                    var tVal = tableArr[r][col];
                   // logDebug("Else statement: " + tVal);
				}
				}else {
                    var tVal = tableArr[r][col];
                   // logDebug("Else statement: " + tVal);
				}
			//	logDebug("colName:" + tableArr[r][col].columnName.toString() + "|row:" + tableArr[r][col])
				//bizarre string conversion - just go with it
				var colName = new String(tableArr[r][col].columnName.toString());
				colName=colName.toString();
				tempArr[colName] = tVal;
            }

        }
			rowArr.push(tempArr); 
			//for (var val in rowArr) for (var c in rowArr[val]) logDebug("Value " + c + ": " + rowArr[val][c]);
			addASITable(tableName,rowArr,tableCapId);
		}
    }
    return returnStatus;
}
function editContactToSpecifcRecord(pin, contactID, publicEmailAddress) 
{        
	try
	{
		var capPeoples = getPeople(pin)
		
		if (capPeoples == null || capPeoples.length == 0)
		{            
			logDebug("No contact has been found.");   
		}
		else
		{
			for (loopk in capPeoples)
			{
				foundId = capPeoples[loopk].getCapContactModel().getPeople().getContactSeqNumber();				
			
				if (contactID == foundId)
				{
					logDebug("Contact sequence Number :" + foundId);   
										
					var refContact;												
					var getUserResult;

					// Get public user with ID if it's from ACA
					if (publicUser || publicEmailAddress == null) {	
						getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);
					}
					else // if it's backoffice, use entered ASI public email address
					{
						getUserResult = aa.publicUser.getPublicUserByEmail(publicEmailAddress);
					}

					if (getUserResult.getSuccess() && getUserResult.getOutput()) {
						userModel = getUserResult.getOutput();	                            
						userSeqNum = userModel.getUserSeqNum();
						refContact = getRefContactForPublicUser(userSeqNum) 					

						logDebug("Success:" + userModel.getEmail());  

						if (publicUser)
						{
							editAppSpecific("Public User Email Address", userModel.getEmail(), capId);
							logDebug("Update App Specific:" + userModel.getEmail());  
						}
					}

					if (refContact) 
					{      
						// Get Global Contact Number on the record
						var refContactNum = capPeoples[loopk].getCapContactModel().getRefContactNumber();
						logDebug("Global reference id found in record: " + refContactNum); 
						contactType = capPeoples[loopk].getCapContactModel().getPeople().getContactType();

						// There is a global reference contact in the contact
						if (refContactNum != null)                                    
						{                                                                              
							logDebug("Public contact info: " + refContact);   
							//debugObject ("aa people:" + aa.people);
							//debugObject ("aa.licenseScript:" + aa.licenseScript);
							logDebug("Public user email address:" + userModel.getEmail());   

							//var newEmailAddress = refContact.getEmail();                                        
							var currentContactEmail = capPeoples[loopk].getCapContactModel().getPeople().getEmail();                                       
							
							// Update Reference contact with public user email address
							logDebug("Get reference contact id: " + refContactNum + "," + contactType); 
							
							var refConResult = aa.people.getPeople(refContactNum);
							if (refConResult.getSuccess()) {
								var refPeopleModel = refConResult.getOutput();
								if (refPeopleModel != null) {
									pm = refPeopleModel;
									pm.setEmail(userModel.getEmail());
																			
									var result = aa.people.editPeopleWithAttribute(pm, pm.getAttributes());
		
									if (result.getSuccess()) {
										logDebug("Successfully update the contact with email address");
									}	
									else{
										logDebug("Unable to update the reference contact");
									}
								}
							}
							// Update first name, last name if they are missing in the record contact.
							if (capPeoples[loopk].getCapContactModel().getPeople().getFirstName() == null &&
							capPeoples[loopk].getCapContactModel().getPeople().getLastName() == null)
							{
								capPeoples[loopk].getCapContactModel().getPeople().setFirstName(userModel.getFirstName());
								capPeoples[loopk].getCapContactModel().getPeople().setLastName(userModel.getLastName());
							}
							if (capPeoples[loopk].getCapContactModel().getPeople().getEmail() == null)
							{
								capPeoples[loopk].getCapContactModel().getPeople().setEmail(userModel.getEmail());
							}

							logDebug("Set email:" + userModel.getEmail());                                                                                           ;
							aa.people.editCapContactWithAttribute(capPeoples[loopk].getCapContactModel());
							logDebug("Email set:" + capPeoples[loopk].getCapContactModel().getPeople().getEmail());                                             
																
							logDebug("Associate contact with public user : " + refContactNum);                                                  
							aa.licenseScript.associateContactWithPublicUser(userSeqNum, refContactNum);                                                 


						}
						else // No reference contact has been found in the record
						{
							logDebug("No reference contact has been found for contact:" + contactID);   
							var contractTypeArray = [];
							
							contractTypeArray.push(contactType);
							logDebug("Push");
							createRefContactsFromCapContactsAndLinkPublic(pin, contractTypeArray, null, null, true, comparePeopleMatchCriteria, userModel);
							
							
							// Set missing reference contact number to be the ACA reference contact number
							//capPeoples[loopk].getCapContactModel().setRefContactNumber(refContactNum)
							//logDebug("Set:" +  refContactNum);
							
							//addRefContactToRecord(refContactNum, contactType, pin);
						
							// }
						}												
					}		
					
				}
			}  
			
		}      
	}    	        
	catch (err) {
		aa.print("A JavaScript Error occurred: " + err.message);
	}
    
}
function createRefContactsFromCapContactsAndLinkPublic(pCapId, contactTypeArray, ignoreAttributeArray, replaceCapContact, overwriteRefContact, refContactExists, userModel)
	{

	// contactTypeArray is either null (all), or an array or contact types to process
	//
	// ignoreAttributeArray is either null (none), or an array of attributes to ignore when creating a REF contact
	//
	// replaceCapContact not implemented yet
	//
	// overwriteRefContact -- if true, will refresh linked ref contact with CAP contact data
	//
	// refContactExists is a function for REF contact comparisons.
	//
	// Version 2.0 Update:   This function will now check for the presence of a standard choice "REF_CONTACT_CREATION_RULES".
	// This setting will determine if the reference contact will be created, as well as the contact type that the reference contact will
	// be created with.  If this setting is configured, the contactTypeArray parameter will be ignored.   The "Default" in this standard
	// choice determines the default action of all contact types.   Other types can be configured separately.
	// Each contact type can be set to "I" (create ref as individual), "O" (create ref as organization),
	// "F" (follow the indiv/org flag on the cap contact), "D" (Do not create a ref contact), and "U" (create ref using transaction contact type).

	var standardChoiceForBusinessRules = "REF_CONTACT_CREATION_RULES";


	var ingoreArray = new Array();
	if (arguments.length > 1) ignoreArray = arguments[1];

	var defaultContactFlag = lookup(standardChoiceForBusinessRules,"Default");

	var c = aa.people.getCapContactByCapID(pCapId).getOutput()
	var cCopy = aa.people.getCapContactByCapID(pCapId).getOutput()  // must have two working datasets

	for (var i in c)
	   {
	   var ruleForRefContactType = "U"; // default behavior is create the ref contact using transaction contact type
	   var con = c[i];

	   var p = con.getPeople();

	   var contactFlagForType = lookup(standardChoiceForBusinessRules,p.getContactType());

	  // if (!defaultContactFlag && !contactFlagForType) // standard choice not used for rules, check the array passed
	   //	{
            if (contactTypeArray && !exists(p.getContactType(),contactTypeArray))
			continue;  // not in the contact type list.  Move along.
	//	}

	   if (!contactFlagForType && defaultContactFlag) // explicit contact type not used, use the default
	   	{
	   	ruleForRefContactType = defaultContactFlag;
	   	}

	   if (contactFlagForType) // explicit contact type is indicated
	   	{
	   	ruleForRefContactType = contactFlagForType;
	   	}

	   if (ruleForRefContactType.equals("D"))
	   	continue;

	   var refContactType = "";

	   switch(ruleForRefContactType)
	   	{
		   case "U":
		     refContactType = p.getContactType();
		     break;
		   case "I":
		     refContactType = "Individual";
		     break;
		   case "O":
		     refContactType = "Organization";
		     break;
		   case "F":
		     if (p.getContactTypeFlag() && p.getContactTypeFlag().equals("organization"))
		     	refContactType = "Organization";
		     else
		     	refContactType = "Individual";
		     break;
		}

	   var refContactNum = con.getCapContactModel().getRefContactNumber();

	   if (refContactNum)  // This is a reference contact.   Let's refresh or overwrite as requested in parms.
	   	{
	   	if (overwriteRefContact)
	   		{
	   		p.setContactSeqNumber(refContactNum);  // set the ref seq# to refresh
	   		p.setContactType(refContactType);

	   						var a = p.getAttributes();

							if (a)
								{
								var ai = a.iterator();
								while (ai.hasNext())
									{
									var xx = ai.next();
									xx.setContactNo(refContactNum);
									}
					}

	   		var r = aa.people.editPeopleWithAttribute(p,p.getAttributes());

			if (!r.getSuccess())
				logDebug("WARNING: couldn't refresh reference people : " + r.getErrorMessage());
			else
				logDebug("Successfully refreshed ref contact #" + refContactNum + " with CAP contact data");
			}

	   	if (replaceCapContact)
	   		{
				// To Be Implemented later.   Is there a use case?
			}

	   	}
	   	else  // user entered the contact freehand.   Let's create or link to ref contact.
	   	{
			var ccmSeq = p.getContactSeqNumber();

			var existingContact = refContactExists(p);  // Call the custom function to see if the REF contact exists

			var p = cCopy[i].getPeople();  // get a fresh version, had to mangle the first for the search

			if (existingContact)  // we found a match with our custom function.  Use this one.
				{
					refPeopleId = existingContact;
				}
			else  // did not find a match, let's create one
				{

				var a = p.getAttributes();

				if (a)
					{
					//
					// Clear unwanted attributes
					var ai = a.iterator();
					while (ai.hasNext())
						{
						var xx = ai.next();
						if (ignoreAttributeArray && exists(xx.getAttributeName().toUpperCase(),ignoreAttributeArray))
							ai.remove();
						}
					}

                p.setContactType(refContactType);
                p.setEmail(userModel.getEmail());
             
                
                logDebug("Success:" + p.getEmail());  

				var r = aa.people.createPeopleWithAttribute(p,a);

				if (!r.getSuccess())
					{logDebug("WARNING: couldn't create reference people : " + r.getErrorMessage()); continue; }

				//
				// createPeople is nice and updates the sequence number to the ref seq
				//

				var p = cCopy[i].getPeople();
				var refPeopleId = p.getContactSeqNumber();
                logDebug("Successfully created reference contact #" + refPeopleId);            
            }
            
               
            publicUserSeqNum = userModel.getUserSeqNum();
            logDebug("publicUserSeqNum: " + publicUserSeqNum);
            // Need to link to an existing public user.
            if (publicUserSeqNum != null)
            {
                logDebug("createRefContactsFromCapContactsAndLink: Linking this public user with new reference contact : " + refPeopleId);                        
                aa.licenseScript.associateContactWithPublicUser(publicUserSeqNum, refPeopleId);
            }


			//
			// now that we have the reference Id, we can link back to reference
			//

		    var ccm = aa.people.getCapContactByPK(pCapId,ccmSeq).getOutput().getCapContactModel();

            ccm.setRefContactNumber(refPeopleId);
            // Only if it's null, we overwrote the email.
            if (ccm.getEmail() == null)
            {
                ccm.setEmail(userModel.getEmail());
            }

		    r = aa.people.editCapContact(ccm);

		    if (!r.getSuccess())
				{ logDebug("WARNING: error updating cap contact model : " + r.getErrorMessage()); }
			else
				{ logDebug("Successfully linked ref contact " + refPeopleId + " to cap contact " + ccmSeq);}


	    }  // end if user hand entered contact
	}  // end for each CAP contact
} 
/*
emailWithReportAttachASync
Required Params:
	pSendToEmailAddresses = comma-separated list of email addresses to send to, no spaces.
	pEmailTemplate = notification template name
Optional Params:
	pEParams = parameters to be filled in notification template
	pReportTemplate = if provided, will run report and attach (per report manager settings) and include a link to it in the email
	pRParams  = report parameters
	pChangeReportName = if using reportTemplate, will change the title of the document produced by the report from its default

Sample: 
	emailWithReportAttachASync('ryan.littlefield@scubeenterprise.com', 'DPD_WAITING_FOR_PAYMENT'); //minimal
	emailWithReportAttachASync('ryan.littlefield@scubeenterprise.com, jacob.greene@scubeenterprise.com', 'DPD_PERMIT_ISSUED', eParamHashtable, 'Construction Permit', rParamHashtable, 'New Report Name'); //full
*/
function emailWithReportAttachASync(pSendToEmailAddresses, pEmailTemplate, pEParams, pReportTemplate, pRParams, pAddAdHocTask, pChangeReportDescription) {
	var x = 0;
	var vAsyncScript = "SEND_EMAIL_ATTACH_ASYNC";
	var envParameters = aa.util.newHashMap();
		
	//Initialize optional parameters	
	var vEParams = aa.util.newHashtable();
	var vReportTemplate = "";
	var vRParams = aa.util.newHashtable();
	var vAddAdHocTask = true;
	var vChangeReportDescription = "";	

	if (pEParams != undefined && pEParams != null && pEParams != "") {
		logDebug("pEParams is defined");
		vEParams = pEParams;
	}
	
	if (pReportTemplate != undefined && pReportTemplate != null && pReportTemplate != "") {
		logDebug("pReportTemplate is defined");
		vReportTemplate = pReportTemplate;
	}

	if (pRParams != undefined && pRParams != null && pRParams != "") {
		logDebug("pRParams is defined");
		vRParams = pRParams;
	}
	
	if (pAddAdHocTask != undefined && pAddAdHocTask != null && pAddAdHocTask != "") {
		logDebug("pAddAdHocTask is defined");
		if (pAddAdHocTask == "N") {
			vAddAdHocTask = false;
		} else if (pAddAdHocTask == false) {
			vAddAdHocTask = false;
		}
	}
	
	if (pChangeReportDescription != undefined && pChangeReportDescription != null && pChangeReportDescription != "") {
		logDebug("pChangeReportDescription is defined");
		vChangeReportDescription = pChangeReportDescription;
	}

	//Save variables to the hash table and call sendEmailASync script. This allows for the email to contain an ACA deep link for the document
	envParameters.put("sendToEmailAddresses", pSendToEmailAddresses);
	envParameters.put("emailTemplate", pEmailTemplate);
	envParameters.put("vEParams", vEParams);
	envParameters.put("reportTemplate", vReportTemplate);
	envParameters.put("vRParams", vRParams);
	envParameters.put("vChangeReportDescription", vChangeReportDescription);
	envParameters.put("CapId", capId);

	//Start modification to support batch script
	var vEvntTyp = aa.env.getValue("eventType");
	if (vEvntTyp == "Batch Process") {
		aa.env.setValue("sendToEmailAddresses", pSendToEmailAddresses);
		aa.env.setValue("emailTemplate", pEmailTemplate);
		aa.env.setValue("vEParams", vEParams);
		aa.env.setValue("reportTemplate", vReportTemplate);
		aa.env.setValue("vRParams", vRParams);
		aa.env.setValue("vChangeReportDescription", vChangeReportDescription);
		aa.env.setValue("CapId", capId);
		//call sendEmailASync script
		logDebug("Attempting to run Non-Async: " + vAsyncScript);
		aa.includeScript(vAsyncScript);
	} else {
		//call sendEmailASync script
		logDebug("Attempting to run Async: " + vAsyncScript);
		aa.runAsyncScript(vAsyncScript, envParameters);
	}
	//End modification to support batch script

	return true;
}

function exploreObject(objExplore) {
    logDebug("Methods:");
    for (var x in objExplore) {
        if (typeof (objExplore[x]) === "function") {
            logDebug("<font color=blue><u><b>" + x + "</b></u></font> ");
            logDebug("   " + objExplore[x] + "<br>");
        }
        var counter = objExplore.length;
    }

    logDebug("");
    logDebug("Properties:");
    for (var y in objExplore) {
        if (typeof (objExplore[y]) !== "function") {
            logDebug("  <b> " + y + ": </b> " + objExplore[y]);
        }
    }
}

function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}
function getAdditionalInfoForLic(capId)
{
	bvaluatnScriptModel = null;
	var s_result = aa.cap.getBValuatn4AddtInfo(capId);
	if(s_result.getSuccess())
	{
		bvaluatnScriptModel = s_result.getOutput();
		if (bvaluatnScriptModel == null)
		{
			logDebug("WARNING: no additional info on this CAP:" + capId);
			bvaluatnScriptModel = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to get additional info: " + s_result.getErrorMessage());
		bvaluatnScriptModel = null;	
	}
	// Return bvaluatnScriptModel
	return bvaluatnScriptModel;
}


function getAddress(capId)
{
  capAddresses = null;
  var s_result = aa.address.getAddressByCapId(capId);
  if(s_result.getSuccess())
  {
    capAddresses = s_result.getOutput();
    if (capAddresses == null || capAddresses.length == 0)
    {
      aa.print("WARNING: no addresses on this CAP:" + capId);
      capAddresses = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to address: " + s_result.getErrorMessage());
    capAddresses = null;  
  }
  return capAddresses;
}
function getAddressForLic(capId)
{
	capAddresses = null;
	var s_result = aa.address.getAddressByCapId(capId);
	if(s_result.getSuccess())
	{
		capAddresses = s_result.getOutput();
		if (capAddresses == null || capAddresses.length == 0)
		{
			logDebug("WARNING: no addresses on this CAP:" + capId);
			capAddresses = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to address: " + s_result.getErrorMessage());
		capAddresses = null;	
	}
	return capAddresses;
}
function getAppSpecificTableForLic(capId,tableName)
{
	appSpecificTable = null;
	var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId,tableName);
	if(s_result.getSuccess())
	{
		appSpecificTable = s_result.getOutput();
		if (appSpecificTable == null || appSpecificTable.length == 0)
		{
			logDebug("WARNING: no appSpecificTable on this CAP:" + capId);
			appSpecificTable = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to appSpecificTable: " + s_result.getErrorMessage());
		appSpecificTable = null;	
	}
	return appSpecificTable;
}
function getAppStatus() {
	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

	var appStatus = null;
   var capResult = aa.cap.getCap(itemCap);
   if (capResult.getSuccess()) {
      licCap = capResult.getOutput();
      if (licCap != null) {
         appStatus = "" + licCap.getCapStatus();
      }
   } else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;
}
function getCapDetailByID(capId) {
	capDetailScriptModel = null;
	var s_result = aa.cap.getCapDetail(capId);
	if(s_result.getSuccess()) {
		capDetailScriptModel = s_result.getOutput();
		if (capDetailScriptModel == null) {
			logDebug("WARNING: no cap detail on this CAP:" + capId);
			capDetailScriptModel = null;
		}
	}
	else {
		logDebug("ERROR: Failed to get cap detail: " + s_result.getErrorMessage());
		capDetailScriptModel = null;	
	}
	// Return capDetailScriptModel
	return capDetailScriptModel;
}

function getCapIdByChecklistID(checklistID)
{
var returnedCapID;
var servProvCode=aa.getServiceProviderCode();
var conn = aa.db.getConnection();
//var selectString = "select DISTINCT B1_PER_ID1, B1_PER_ID2, B1_PER_ID3 from B3CONTACT WHERE SERV_PROV_CODE= ? AND G1_CONTACT_NBR = ? AND B1_CONTACT_TYPE = ?";
var selectString = "select DISTINCT B1_PER_ID1, B1_PER_ID2, B1_PER_ID3 from GGUIDESHEET where serv_prov_code= ? and GUIDESHEET_ID = ?"
var sStmt = conn.prepareStatement(selectString);
sStmt.setString(1, servProvCode);
sStmt.setString(2, checklistID);
var rSet = sStmt.executeQuery();

while (rSet.next()) {
    var id1= rSet.getString("B1_PER_ID1");
    var id2= rSet.getString("B1_PER_ID2");
    var id3= rSet.getString("B1_PER_ID3");
    aa.print("id1: " + id1 + " id2: " + id2 + " id3: " + id3);
    var resCapID = aa.cap.getCapID(id1,id2,id3);
    aa.print("resCapID: " + resCapID);
    if (resCapID.getSuccess()) {
        returnedCapID = resCapID.getOutput();
            aa.print("Alt Id: " + returnedCapID.getCustomID());
    }
}

rSet.close();
sStmt.close();
conn.close();
//return resArr;

return returnedCapID;
}
function getCapIdByInspID(inspID){
	var returnedCapID;
	var servProvCode=aa.getServiceProviderCode();
	var conn = aa.db.getConnection();
    //var selectString = "select DISTINCT B1_PER_ID1, B1_PER_ID2, B1_PER_ID3 from B3CONTACT WHERE SERV_PROV_CODE= ? AND G1_CONTACT_NBR = ? AND B1_CONTACT_TYPE = ?";
    var selectString = "select DISTINCT B1_PER_ID1, B1_PER_ID2, B1_PER_ID3 from G6ACTION where serv_prov_code= ? and g6_act_num = ?"
	var sStmt = conn.prepareStatement(selectString);
	sStmt.setString(1, servProvCode);
	sStmt.setString(2, inspID);
	var rSet = sStmt.executeQuery();

	while (rSet.next()) {
		var id1= rSet.getString("B1_PER_ID1");
		var id2= rSet.getString("B1_PER_ID2");
        var id3= rSet.getString("B1_PER_ID3");
        aa.print("id1: " + id1 + " id2: " + id2 + " id3: " + id3);
        var resCapID = aa.cap.getCapID(id1,id2,id3);
        aa.print("resCapID: " + resCapID);
		if (resCapID.getSuccess()) {
            returnedCapID = resCapID.getOutput();
            aa.print("inside if: " + returnedCapID);
            aa.print("Alt Id: " + returnedCapID.getCustomID());
		}
	}

	rSet.close();
	sStmt.close();
	conn.close();
	//return resArr;

return returnedCapID;
}
function getCompletedInspectionID(insp2Check, capId)
	{
	// warning, returns only the first scheduled occurrence
	var inspResultObj = aa.inspection.getInspections(capId);
	if (inspResultObj.getSuccess())
		{
		var inspList = inspResultObj.getOutput();
    for (xx in inspList)
    logDebug("type: " + inspList[xx].getInspectionType() + " status: " + inspList[xx].getInspectionStatus().toUpperCase());
			if (String(insp2Check).equals(inspList[xx].getInspectionType()) && inspList[xx].getInspectionStatus().toUpperCase().equals("COMPLETE"))
				return inspList[xx].getIdNumber();
		}
	return false;
	}
function getLicenseProfessionalForLic(capId)
{
	capLicenseArr = null;
	var s_result = aa.licenseProfessional.getLicenseProf(capId);
	if(s_result.getSuccess())
	{
		capLicenseArr = s_result.getOutput();
		if (capLicenseArr == null || capLicenseArr.length == 0)
		{
			logDebug("WARNING: no licensed professionals on this CAP:" + capId);
			capLicenseArr = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to license professional: " + s_result.getErrorMessage());
		capLicenseArr = null;	
	}
	return capLicenseArr;
}
function getOwnerForLic(capId)
{
	capOwnerArr = null;
	var s_result = aa.owner.getOwnerByCapId(capId);
	if(s_result.getSuccess())
	{
		capOwnerArr = s_result.getOutput();
		if (capOwnerArr == null || capOwnerArr.length == 0)
		{
			logDebug("WARNING: no Owner on this CAP:" + capId);
			capOwnerArr = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to Owner: " + s_result.getErrorMessage());
		capOwnerArr = null;	
	}
	return capOwnerArr;
}
function getParcel(capId)
{
  capParcelArr = null;
  var s_result = aa.parcel.getParcelandAttribute(capId, null);
  if(s_result.getSuccess())
  {
    capParcelArr = s_result.getOutput();
    if (capParcelArr == null || capParcelArr.length == 0)
    {
      aa.print("WARNING: no parcel on this CAP:" + capId);
      capParcelArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to parcel: " + s_result.getErrorMessage());
    capParcelArr = null;  
  }
  return capParcelArr;
}

function getParcelForLic(capId)
{
	capParcelArr = null;
	var s_result = aa.parcel.getParcelandAttribute(capId, null);
	if(s_result.getSuccess())
	{
		capParcelArr = s_result.getOutput();
		if (capParcelArr == null || capParcelArr.length == 0)
		{
			logDebug("WARNING: no parcel on this CAP:" + capId);
			capParcelArr = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to parcel: " + s_result.getErrorMessage());
		capParcelArr = null;	
	}
	return capParcelArr;
}

function getParentByCapId(itemCap) 
	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(itemCap,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
    }
function getPeopleForLic(capId)
{
	capPeopleArr = null;
	var s_result = aa.people.getCapContactByCapID(capId);
	if(s_result.getSuccess())
	{
		capPeopleArr = s_result.getOutput();
		if(capPeopleArr != null || capPeopleArr.length > 0)
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

function getRefContactForPublicUser(userSeqNum) {
	contractorPeopleBiz = aa.proxyInvoker.newInstance("com.accela.pa.people.ContractorPeopleBusiness").getOutput();
	userList = aa.util.newArrayList();
	userList.add(userSeqNum);
	peopleList = contractorPeopleBiz.getContractorPeopleListByUserSeqNBR(aa.getServiceProviderCode(), userList); 
	if (peopleList != null) {
		peopleArray = peopleList.toArray();
		if (peopleArray.length > 0)
			return peopleArray[0];
	}
	return null;
}

function getTableName(capId)
{
	var tableName = null;
	var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
	if(result.getSuccess())
	{
		tableName = result.getOutput();
		if(tableName!=null)
		{
			return tableName;
		}
	}
	return tableName;
}
function getTankAppStatus(capId) {
	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

	var appStatus = null;
   var capResult = aa.cap.getCap(itemCap);
   if (capResult.getSuccess()) {
      licCap = capResult.getOutput();
      if (licCap != null) {
         appStatus = "" + licCap.getCapStatus();
      }
   } else {
		logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
	}
	return appStatus;
}
function getVendorInfo(cType, capId) {
	var returnArray = new Array();
	var haveCType = false;
	
	var contModel = null; 
	var consResult = aa.people.getCapContactByCapID(capId);	
	if (consResult.getSuccess()) {
		var cons = consResult.getOutput();
		for (thisCon in cons) {
			var capContactType = cons[thisCon].getCapContactModel().getPeople().getContactType();
			if (capContactType == cType) {				
				var contModel = cons[thisCon].getCapContactModel(); 
				
				var firstName = contModel.getFirstName();
				var lastName = contModel.getLastName();
				var business = contModel.getBusinessName();
				var phone = contModel.getPhone1();
				var addr1 = contModel.getAddressLine1();
				var city = contModel.getCity();
				var state = contModel.getState();
				var zip = contModel.getZip();
				
				// build returnArray
				returnArray.push(addr1);
				returnArray.push(city);
				returnArray.push(state);
				returnArray.push(zip);
				returnArray.push(firstName);
				returnArray.push(lastName);
				returnArray.push(business);
				returnArray.push(phone);
				return returnArray;
				haveCType = true;
			}
		}
	}
	if (haveCType == false){
		return false;
	}
}
function getWorkflowParams4Notification(emailParams) 
{
	// pass in a hashtable and it will add the additional parameters to the table
	addParameter(emailParams, "$$wfStatus$$", wfStatus);
	addParameter(emailParams, "$$wfTask$$", wfTask);
	addParameter(emailParams, "$$wfComment$$", wfComment);
	return emailParams;
}
function isMatchAddress(addressScriptModel1, addressScriptModel2)
{
	if (addressScriptModel1 == null || addressScriptModel2 == null)
	{
		return false;
	}
	var streetName1 = addressScriptModel1.getStreetName();
	var streetName2 = addressScriptModel2.getStreetName();
	if ((streetName1 == null && streetName2 != null) 
		|| (streetName1 != null && streetName2 == null))
	{
		return false;
	}
	if (streetName1 != null && !streetName1.equals(streetName2))
	{
		return false;
	}
	return true;
}

function isMatchLicenseProfessional(licProfScriptModel1, licProfScriptModel2)
{
    if (licProfScriptModel1 == null || licProfScriptModel2 == null)
    {
      return false;
    }
    if (licProfScriptModel1.getLicenseType().equals(licProfScriptModel2.getLicenseType())
      && licProfScriptModel1.getLicenseNbr().equals(licProfScriptModel2.getLicenseNbr()))
    {
      return true;
    }
    return  false;
}
function isMatchOwner(ownerScriptModel1, ownerScriptModel2)
{
	if (ownerScriptModel1 == null || ownerScriptModel2 == null)
	{
		return false;
	}
	var fullName1 = ownerScriptModel1.getOwnerFullName();
	var fullName2 = ownerScriptModel2.getOwnerFullName();
	if ((fullName1 == null && fullName2 != null) 
		|| (fullName1 != null && fullName2 == null))
	{
		return false;
	}
	if (fullName1 != null && !fullName1.equals(fullName2))
	{
		return false;
	}
	return	true;
}

function isMatchParcel(parcelScriptModel1, parcelScriptModel2)
{
	if (parcelScriptModel1 == null || parcelScriptModel2 == null)
	{
		return false;
	}
	if (parcelScriptModel1.getParcelNumber().equals(parcelScriptModel2.getParcelNumber()))
	{
		return true;
	}
	return	false;
}

function isMatchPeople(capContactScriptModel, capContactScriptModel2)
{
	if (capContactScriptModel == null || capContactScriptModel2 == null)
	{
		return false;
	}
	var contactType1 = capContactScriptModel.getCapContactModel().getPeople().getContactType();
	var contactType2 = capContactScriptModel2.getCapContactModel().getPeople().getContactType();
	var firstName1 = capContactScriptModel.getCapContactModel().getPeople().getFirstName();
	var firstName2 = capContactScriptModel2.getCapContactModel().getPeople().getFirstName();
	var lastName1 = capContactScriptModel.getCapContactModel().getPeople().getLastName();
	var lastName2 = capContactScriptModel2.getCapContactModel().getPeople().getLastName();
	var fullName1 = capContactScriptModel.getCapContactModel().getPeople().getFullName();
	var fullName2 = capContactScriptModel2.getCapContactModel().getPeople().getFullName();
	if ((contactType1 == null && contactType2 != null) 
		|| (contactType1 != null && contactType2 == null))
	{
		return false;
	}
	if (contactType1 != null && !contactType1.equals(contactType2))
	{
		return false;
	}
	if ((firstName1 == null && firstName2 != null) 
		|| (firstName1 != null && firstName2 == null))
	{
		return false;
	}
	if (firstName1 != null && !firstName1.equals(firstName2))
	{
		return false;
	}
	if ((lastName1 == null && lastName2 != null) 
		|| (lastName1 != null && lastName2 == null))
	{
		return false;
	}
	if (lastName1 != null && !lastName1.equals(lastName2))
	{
		return false;
	}
	if ((fullName1 == null && fullName2 != null) 
		|| (fullName1 != null && fullName2 == null))
	{
		return false;
	}
	if (fullName1 != null && !fullName1.equals(fullName2))
	{
		return false;
	}
	return	true;
}

function IsStrInArry(eVal,argArr) {
    for (x in argArr){
        if (eVal == argArr[x]){
            return true;
        }
    }	
 return false;
} 

function licenseProfObjectDCA(licnumber, lictype) {
	//Populate the License Model
	this.refLicModel = null; //Reference LP Model
	this.infoTableGroupCodeObj = null;
	this.infoTableSubGroupCodesObj = null;
	this.infoTables = new Array(); //Table Array ex infoTables[name][row][column].getValue()
	this.attribs = new Array(); //Array of LP Attributes ex attribs[name]
	this.valid = false; //true if LP is valid
	this.validTables = false; //true if LP has infoTables
	this.validAttrs = false; //true if LP has attributes

	var result = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), licnumber);
	if (result.getSuccess()) {
		var tmp = result.getOutput();
		if (lictype == null)
			lictype = "";
		if (tmp != null)
			for (lic in tmp)
				if (tmp[lic].getLicenseType().toUpperCase() == lictype.toUpperCase() || lictype == "") {
					this.refLicModel = tmp[lic];
					if (lictype == "") {
						lictype = this.refLicModel.getLicenseType();
					}
					break;
				}
	}



	//Set flags that can be used for validation
	this.validTables = false;
	this.valid = (this.refLicModel != null);

	
	//Get the Attributes for LP
	if (this.valid) {
		var tmpAttrs = this.refLicModel.getAttributes();
		if (tmpAttrs != null) {
			var tmpAttrsList = tmpAttrs.values()
				var tmpIterator = tmpAttrsList.iterator();
			if (tmpIterator.hasNext()) {
				var tmpAttribs = tmpIterator.next().toArray();
				for (x in tmpAttribs) {
					this.attribs[tmpAttribs[x].getAttributeLabel().toUpperCase()] = tmpAttribs[x];
				}
				this.validAttrs = true;
			}
		}
	}

	//get method for Attributes
	this.getAttribute = function (vAttributeName) {
		var retVal = null;
		if (this.validAttrs) {
			var tmpVal = this.attribs[vAttributeName.toString().toUpperCase()];
			if (tmpVal != null)
				retVal = tmpVal.getAttributeValue();
		}
		return retVal;
	}

	//Set method for Attributes
	this.setAttribute = function (vAttributeName, vAttributeValue) {
		var retVal = false;
		if (this.validAttrs) {
			var tmpVal = this.attribs[vAttributeName.toString().toUpperCase()];
			if (tmpVal != null) {
				tmpVal.setAttributeValue(vAttributeValue);
				retVal = true;
			}
		}
		return retVal;
	}

	//Update From Record Contact by Contact Type
	//Uses first contact of type found
	//If contactType == "" then uses primary
	this.updateFromRecordContactByType = function (vCapId, vContactType, vUpdateAddress, vUpdatePhoneEmail) {
		this.retVal = false;
		if (this.valid) {
			var conArr = new Array();
			var capContResult = aa.people.getCapContactByCapID(vCapId);

			if (capContResult.getSuccess()) {
				conArr = capContResult.getOutput();
			} else {
				retVal = false;
			}

			for (contact in conArr) {
				if (vContactType.toString().toUpperCase() ==
					conArr[contact].getPeople().getContactType().toString().toUpperCase()
					 || (vContactType.toString() == "" && conArr[contact].getPeople().getFlag() == "Y")) {

					cont = conArr[contact];
					peop = cont.getPeople();
					addr = peop.getCompactAddress();

					this.refLicModel.setContactFirstName(cont.getFirstName());
					this.refLicModel.setContactMiddleName(peop.getMiddleName()); //get mid from peop
					this.refLicModel.setContactLastName(cont.getLastName());
					this.refLicModel.setBusinessName(peop.getBusinessName());
					if (vUpdateAddress) {
						this.refLicModel.setAddress1(addr.getAddressLine1());
						this.refLicModel.setAddress2(addr.getAddressLine2());
						this.refLicModel.setAddress3(addr.getAddressLine3());
						this.refLicModel.setCity(addr.getCity());
						this.refLicModel.setState(addr.getState());
						this.refLicModel.setZip(addr.getZip());
					}
					if (vUpdatePhoneEmail) {
						this.refLicModel.setPhone1(peop.getPhone1());
						this.refLicModel.setPhone2(peop.getPhone2());
						this.refLicModel.setPhone3(peop.getPhone3());
						this.refLicModel.setEMailAddress(peop.getEmail());
						this.refLicModel.setFax(peop.getFax());
					}
					//Audit Fields
					this.refLicModel.setAgencyCode(aa.getServiceProviderCode());
					this.refLicModel.setAuditDate(sysDate);
					this.refLicModel.setAuditID(currentUserID);
					this.refLicModel.setAuditStatus("A");

					retVal = true;
					break;
				}
			}
		}
		return retVal;
	}



	//Update From Record Licensed Prof
	//License Number and Type must match that of the Record License Prof
	this.updateFromRecordLicensedProf = function (vCapId) {
		var retVal = false;
		if (this.valid) {

			var capLicenseResult = aa.licenseProfessional.getLicenseProf(capId);
			var capLicenseArr = new Array();
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			} else {
				retVal = false;
			}

			for (capLic in capLicenseArr) {
				if (capLicenseArr[capLic].getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
					 && capLicenseArr[capLic].getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {

					licProfScriptModel = capLicenseArr[capLic];

					this.refLicModel.setAddress1(licProfScriptModel.getAddress1());
					this.refLicModel.setAddress2(licProfScriptModel.getAddress2());
					this.refLicModel.setAddress3(licProfScriptModel.getAddress3());
					this.refLicModel.setAgencyCode(licProfScriptModel.getAgencyCode());
					this.refLicModel.setAuditDate(licProfScriptModel.getAuditDate());
					this.refLicModel.setAuditID(licProfScriptModel.getAuditID());
					this.refLicModel.setAuditStatus(licProfScriptModel.getAuditStatus());
					this.refLicModel.setBusinessLicense(licProfScriptModel.getBusinessLicense());
					this.refLicModel.setBusinessName(licProfScriptModel.getBusinessName());
					this.refLicModel.setCity(licProfScriptModel.getCity());
					this.refLicModel.setCityCode(licProfScriptModel.getCityCode());
					this.refLicModel.setContactFirstName(licProfScriptModel.getContactFirstName());
					this.refLicModel.setContactLastName(licProfScriptModel.getContactLastName());
					this.refLicModel.setContactMiddleName(licProfScriptModel.getContactMiddleName());
					this.refLicModel.setContryCode(licProfScriptModel.getCountryCode());
					this.refLicModel.setCountry(licProfScriptModel.getCountry());
					this.refLicModel.setEinSs(licProfScriptModel.getEinSs());
					this.refLicModel.setEMailAddress(licProfScriptModel.getEmail());
					this.refLicModel.setFax(licProfScriptModel.getFax());
					this.refLicModel.setLicOrigIssDate(licProfScriptModel.getLicesnseOrigIssueDate());
					this.refLicModel.setPhone1(licProfScriptModel.getPhone1());
					this.refLicModel.setPhone2(licProfScriptModel.getPhone2());
					this.refLicModel.setSelfIns(licProfScriptModel.getSelfIns());
					this.refLicModel.setState(licProfScriptModel.getState());
					this.refLicModel.setLicState(licProfScriptModel.getState());
					this.refLicModel.setSuffixName(licProfScriptModel.getSuffixName());
					this.refLicModel.setWcExempt(licProfScriptModel.getWorkCompExempt());
					this.refLicModel.setZip(licProfScriptModel.getZip());

					//new
					this.refLicModel.setFein(licProfScriptModel.getFein());
					//licProfScriptModel.getBirthDate()
					//licProfScriptModel.getTitle()
					this.refLicModel.setPhone3(licProfScriptModel.getPhone3());
					this.refLicModel.setBusinessName2(licProfScriptModel.getBusName2());

					retVal = true;
				}
			}
		}
		return retVal;
	}

	//Copy Reference Licensed Professional to a Record
	//If replace is true will remove and readd lic_prof
	//Currently wont copy infoTables...
	this.copyToRecord = function (vCapId, vReplace) {
		var retVal = false;
		if (this.valid) {
			var capLicenseResult = aa.licenseProfessional.getLicenseProf(vCapId);
			var capLicenseArr = new Array();
			var existing = false;
			if (capLicenseResult.getSuccess()) {
				capLicenseArr = capLicenseResult.getOutput();
			}

			if (capLicenseArr != null) {
				for (capLic in capLicenseArr) {
					if (capLicenseArr[capLic].getLicenseNbr() + "" == this.refLicModel.getStateLicense() + ""
						 && capLicenseArr[capLic].getLicenseType() + "" == this.refLicModel.getLicenseType() + "") {
						if (vReplace) {
							aa.licenseProfessional.removeLicensedProfessional(capLicenseArr[capLic]);
							break;
						} else {
							existing = true;
						}
					}
				}
			}

			if (!existing) {
				capListResult = aa.licenseScript.associateLpWithCap(vCapId, this.refLicModel);
				retVal = capListResult.getSuccess();
			}
		}
		return retVal;
	}

	this.enable = function () {
		this.refLicModel.setAuditStatus("A");
	}
	this.disable = function () {
		this.refLicModel.setAuditStatus("I");
	}

	//get records associated to license
	this.getAssociatedRecords = function () {
        var retVal = new Array();
		if (this.valid) {
			var resObj = aa.licenseScript.getCapIDsByLicenseModel(this.refLicModel);
			if (resObj.getSuccess()) {
                var tmp = resObj.getOutput();
				if (tmp != null) //make sure your not setting to null otherwise will not work like array
					retVal = tmp;
			}
        }
        aa.print(retVal.length);
		return retVal;
	}

	this.updateAssociatedTransLPs = function() {
        capIdArr = this.getAssociatedRecords();
        if (capIdArr && capIdArr.length > 0) {
            logDebug("Found " + capIdArr.length + " associated records");
            for (var ci in capIdArr) {
                thisCapIdModel = capIdArr[ci];
                this.copyToRecord(thisCapIdModel.getCapID(), true);
            }
        }
        else {
            logDebug("No associated records for license professional");
        }

	}

	//Save Changes to this object to Ref Licensed Professional
	this.updateRecord = function () {
		var retVal = false
			if (this.valid) {
				this.refreshTables(); //Must ensure row#s are good or wont show in ACA
				var res = aa.licenseScript.editRefLicenseProf(this.refLicModel);
				retVal = res.getSuccess();
			}
			return retVal;
	}

	return this
} 

function reportRunSave(reportName, view, edmsSave, storeToDisk, reportModule, reportParams) 
{
	var name = "";
	var rFile = new Array();
	var error = "";
	var reportModel = aa.reportManager.getReportModelByName(reportName); //get detail of report to drive logic
	if (reportModel.getSuccess()) 
	{
		reportDetail = reportModel.getOutput();
		name = reportDetail.getReportDescription();
		if (name == null || name == "") 
		{
			name = reportDetail.getReportName();
		}
		var reportInfoModel = aa.reportManager.getReportInfoModelByName(reportName);  //get report info to change the way report runs
		if (reportInfoModel.getSuccess()) 
		{ 
			report = reportInfoModel.getOutput();
			report.setModule(reportModule); 
			report.setCapId(capId);
			reportInfo = report.getReportInfoModel();
			report.setReportParameters(reportParams);
			//process parameter selection and EDMS save
			if (edmsSave == true && view == true ) 
			{
				reportRun = aa.reportManager.runReport(reportParams, reportDetail);
				showMessage = true;
				comment(reportRun.getOutput()); //attaches report
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(false);
					reportResult = aa.reportManager.getReportResult(report); //attaches report
					if (reportResult.getSuccess()) 
					{
						reportOut = reportResult.getOutput();
						reportOut.setName(changeNameofAttachment(reportOut.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportOut);
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug reportFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message, line 52";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			} 
			else if (edmsSave == true && view == false) 
			{
				reportInfo.setNotSaveToEDMS(false);
				reportResult = aa.reportManager.getReportResult(report); //attaches report
				if (reportResult.getSuccess()) 
				{
					reportOut = reportResult.getOutput();
					reportOut.setName(changeNameofAttachment(reportOut.getName()));
					if (storeToDisk == true) 
					{
						rFile = aa.reportManager.storeReportToDisk(reportOut);
						if (rFile.getSuccess()) 
						{
							logDebug("Storing to disk");
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
					}
				} 
				else 
				{
					rFile = new Array();
					error = "Report failed to run and store to disk.  Debug reportResult for error message, line 93";
					logDebug(error);
				}
			} 
			else if (edmsSave == false && view == true) 
			{
				reportRun = aa.reportManager.runReport(reportParams, reportDetail);
				showMessage = true;
				comment(reportRun.getOutput());
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(true);
					reportResult = aa.reportManager.getReportResult(report);
					if (reportResult.getSuccess()) 
					{
						reportResult = reportResult.getOutput();
						reportResult.setName(changeNameofAttachment(reportResult.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportResult);
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					} 
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message, line 125";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			} 
			else if (edmsSave == false && view == false) 
			{
				if (storeToDisk == true) 
				{
					reportInfo.setNotSaveToEDMS(true);
					reportResult = aa.reportManager.getReportResult(report);
					if (reportResult.getSuccess()) 
					{
						reportResult = reportResult.getOutput();
						reportResult.setName(changeNameofAttachment(reportResult.getName()));
						rFile = aa.reportManager.storeReportToDisk(reportResult);
						logDebug("Report File: " + rFile.getSuccess());
						if (rFile.getSuccess()) 
						{
							rFile = rFile.getOutput();
							logDebug("Actual Report: " + rFile);
						} 
						else 
						{
							rFile = new Array();
							error = "Report failed to store to disk.  Debug rFile for error message.";
							logDebug(error);
						}
					}
					else 
					{
						rFile = new Array();
						error = "Report failed to run and store to disk.  Debug reportResult for error message, line 163";
						logDebug(error);
					}
				} 
				else 
				{
					rFile = new Array();
				}
			}
		} 
		else 
		{
			rFile = new Array();
			error = "Failed to get report information.  Check report name matches name in Report Manager.";
			logDebug(error);
		}
	} 
	else 
	{
		rFile = new Array();
		error = "Failed to get report detail.  Check report name matches name in Report Manager.";
		logDebug(error);
	}
	function changeNameofAttachment(attachmentName) 
	{
		rptExtLoc = attachmentName.indexOf(".");
		rptLen = attachmentName.length();
		ext = attachmentName.substr(rptExtLoc, rptLen);
		attachName = name + ext;
		return attachName
	}	
	return rFile;
}
function sendEmailsOnSIPRecord(templateName)
{

		var sipPO = loadASITable("DEQ_SIP_PROPERTY_OWNER");
		var emailParams = aa.util.newHashtable();
			var reportParams = aa.util.newHashtable();
			var reportFile = new Array();
			var conArray = getContactArray(capId);
			 var dubCheckemails = "";
			var conEmail = "";
			var lpEmail= "";
			var fromEmail = "autosend@suffolkcountyny.gov";   
			varcapAddresses = null;  
			
			var emailAddressArray = new Array();  
  

			if(matches(fromEmail, null, "", undefined))
			{
			  fromEmail = "";
			}
			
			//Contact Emails
			for (con in conArray)
			{
			  if (!matches(conArray[con].email, null, undefined, ""))
			  {
				logDebug("Contact email: " + conArray[con].email);
				conEmail = conArray[con].email;
				 if (conEmail && dubCheckemails.indexOf(conEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + "||" + conEmail;
					 else
						dubCheckemails = "" + conEmail;
				}
			  }
			}
			//Lp emails
			
			var lpResult = aa.licenseScript.getLicenseProf(capId);
			if (lpResult.getSuccess())
			{ 
			  var lpArr = lpResult.getOutput();  
			} 
			else 
			{ 
			  logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
			}
			for (var lp in lpArr)
			{
			  if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
			  {
				logDebug("LP email: " + lpArr[lp].email);
				lpEmail = lpArr[lp].getEmail();
				 if (lpEmail && dubCheckemails.indexOf(lpEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + ";" + lpEmail;
					 else
						dubCheckemails = "" + lpEmail;
				}
			  }
			}
			
			//Email from ASIT table
			
						for (var k = 0; k < sipPO.length; k++)
			{
					  var poEmail = sipPO[k]["Email Address"];
					  if (!matches(poEmail, null, undefined, ""))
					 {
						  if (poEmail && dubCheckemails.indexOf(poEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + ";" + poEmail;
					 else
						dubCheckemails = "" + poEmail;
				}
					 }
		   }
			  //getRecordParams4Notification(emailParams);
				  
			 //addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
			  //addParameter(emailParams, "$$shortNotes$$", shortNotes); 
			  //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
			  //addParameter(emailParams, "$$altID$$", capId.getCustomID());
			  //addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 
			  /*if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }*/

			if (dubCheckemails != null)
			{
				 
				  sendNotification("", dubCheckemails, "", templateName, emailParams, reportFile);
			}
		 

}
function sendEmailsOnSIPRecordOnlyContacts(templateName)
{

		var sipPO = loadASITable("DEQ_SIP_PROPERTY_OWNER");
		var emailParams = aa.util.newHashtable();
			var reportParams = aa.util.newHashtable();
			var reportFile = new Array();
			var conArray = getContactArray(capId);
			 var dubCheckemails = "";
			var conEmail = "";
			var lpEmail= "";
			var fromEmail = "autosend@suffolkcountyny.gov";   
			varcapAddresses = null;  
			
			var emailAddressArray = new Array();  
  

			if(matches(fromEmail, null, "", undefined))
			{
			  fromEmail = "";
			}
			
			//Contact Emails
			for (con in conArray)
			{
			  if (!matches(conArray[con].email, null, undefined, ""))
			  {
				logDebug("Contact email: " + conArray[con].email);
				conEmail = conArray[con].email;
				 if (conEmail && dubCheckemails.indexOf(conEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + "||" + conEmail;
					 else
						dubCheckemails = "" + conEmail;
				}
			  }
			}
		
		
		//getRecordParams4Notification(emailParams);
				  
			 //addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
			  //addParameter(emailParams, "$$shortNotes$$", shortNotes); 
			  //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
			  //addParameter(emailParams, "$$altID$$", capId.getCustomID());
			  //addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 
			  /*if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }*/

			if (dubCheckemails != null)
			{
				 
				  sendNotification("", dubCheckemails, "", templateName, emailParams, reportFile);
			}
		 

}
function sendEmailsOnSIPRecordOnlyLPs(templateName)
{

		var sipPO = loadASITable("DEQ_SIP_PROPERTY_OWNER");
		var emailParams = aa.util.newHashtable();
			var reportParams = aa.util.newHashtable();
			var reportFile = new Array();
			var conArray = getContactArray(capId);
			 var dubCheckemails = "";
			var conEmail = "";
			var lpEmail= "";
			var fromEmail = "autosend@suffolkcountyny.gov";   
			varcapAddresses = null;  
			
			var emailAddressArray = new Array();  
  

			if(matches(fromEmail, null, "", undefined))
			{
			  fromEmail = "";
			}
			
			
			//Lp emails
			
			var lpResult = aa.licenseScript.getLicenseProf(capId);
			if (lpResult.getSuccess())
			{ 
			  var lpArr = lpResult.getOutput();  
			} 
			else 
			{ 
			  logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
			}
			for (var lp in lpArr)
			{
			  if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
			  {
				logDebug("LP email: " + lpArr[lp].email);
				lpEmail = lpArr[lp].getEmail();
				 if (lpEmail && dubCheckemails.indexOf(lpEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + ";" + lpEmail;
					 else
						dubCheckemails = "" + lpEmail;
				}
			  }
			}
			
			
			  //getRecordParams4Notification(emailParams);
				  
			 //addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
			  //addParameter(emailParams, "$$shortNotes$$", shortNotes); 
			  //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
			  //addParameter(emailParams, "$$altID$$", capId.getCustomID());
			  //addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 
			  /*if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }*/
			  
			  

			if (dubCheckemails != null)
			{
				 
				  sendNotification("", dubCheckemails, "", templateName, emailParams, reportFile);
			}
		 

}
function sendEmailsOnSIPRecordOnlyWWMLP(templateName)
{

		var sipPO = loadASITable("DEQ_SIP_PROPERTY_OWNER");
		var emailParams = aa.util.newHashtable();
			var reportParams = aa.util.newHashtable();
			var reportFile = new Array();
			var conArray = getContactArray(capId);
			 var dubCheckemails = "";
			var conEmail = "";
			var lpEmail= "";
			var fromEmail = "autosend@suffolkcountyny.gov";   
			varcapAddresses = null;  
			
			var emailAddressArray = new Array();  
  

			if(matches(fromEmail, null, "", undefined))
			{
			  fromEmail = "";
			}
			
			
			//Lp emails
			
			var lpResult = aa.licenseScript.getLicenseProf(capId);
			if (lpResult.getSuccess())
			{ 
			  var lpArr = lpResult.getOutput();  
			} 
			else 
			{ 
			  logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
			}
			for (var lp in lpArr)
			{
				
				 if(lpArr[lp].getLicenseType() == "WWM Liquid Waste")
					  
					 {
						  if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
						  {
							  
							 
								logDebug("LP email: " + lpArr[lp].email);
								lpEmail = lpArr[lp].getEmail();
								 if (lpEmail && dubCheckemails.indexOf(lpEmail) == -1) {
									if(dubCheckemails)
										dubCheckemails = dubCheckemails + ";" + lpEmail;
									 else
										dubCheckemails = "" + lpEmail;
								}
				
							}
					}
			}
			
			
			  //getRecordParams4Notification(emailParams);
				  
			 //addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
			  //addParameter(emailParams, "$$shortNotes$$", shortNotes); 
			  //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
			  //addParameter(emailParams, "$$altID$$", capId.getCustomID());
			  //addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 
			  /*if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }*/
			  
			  

			if (dubCheckemails != null)
			{
				 
				  sendNotification("", dubCheckemails, "", templateName, emailParams, reportFile);
			}
		 

}
function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile) {
    var itemCap = capId;
    if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
    var id1 = itemCap.ID1;
    var id2 = itemCap.ID2;
    var id3 = itemCap.ID3;
    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
    var result = null;
    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
    if (result.getSuccess())
    {
        aa.print("Sent email successfully!");
        return true;
    }
    else
    {
        aa.print("Failed to send mail. - " + result.getErrorType());
        return false;
    }
}

function splitByDashes(ASI_Name, label, code, capId)
{
    var variable = getAppSpecific(ASI_Name, capId);
    if (variable != null)
    {
        var varSplit = variable.split("-");
        var secondvalue = "";
        for(counter = 1; counter < varSplit.length; counter++)
        {
            var firstValue = varSplit[0];
            //logDebug("The first value is: " + firstValue + " counter is: " + counter);
            if (counter < (varSplit.length -1))
            {
                secondvalue +=  varSplit[counter]  + "-";
                //logDebug("Second Value: " + secondvalue + " counter is: " + counter);
            }
            else
            {
                secondvalue +=  varSplit[counter];
                //logDebug("Second Value in Final: " + secondvalue + " counter is: " + counter);
            }
        }
        firstValue = String(firstValue);
        editAppSpecific(label, secondvalue, capId);
        editAppSpecific(code, firstValue, capId);
    }
}

function stringSearch(littleString)
{
    var bigString = this.toString();
    var checker = false;
    for (i in bigString){
        checker = true;
        for(j in littleString){
            if(bigString.length() >= i+j && bigString[i+j] != littleString[j]){
                checker = false;
            }
        }
        if(checker == true){
            return true;
        }
    }
    return false;
}
function updatePlanReviewWorkflow(wfTask,status,wfComments,updateIndicator) {
	// updateIndicator determines if to update workflow or inspection
	// if a value of "W" workflow will be updated
	// if a value of "I" inspection will be updated
	// otherwise will return a false

    if (updateIndicator == "I") 
    {
		var sysDateYYYYMMDD = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"YYYY-MM-DD");
		resultInspection(wfTask,status,sysDateYYYYMMDD,wfComments);
    }
     else if (updateIndicator == "W") 
     {
		var action = "";

		action = lookup(docReviewStatusStdChoice,status);

        if (!matches(action,"",undefined)) 
        {
            if (action == "Next") 
            {
				closeTask(wfTask,status,wfComments,"");
				return true;
            } 
            else if (action == "No Change") 
            {
				updateTask(wfTask,status,wfComments,"");
				return true;
            } 
            else if (action == "Loop") {
				loopTask(wfTask,status,wfComments,"");
				return true;
            } 
            else if (action == "Branch") {
				branchTask(wfTask,status,wfComments,"");
				return true;
            } 
            else if (action == "Config") 
            {
				resultWorkflowTask(wfTask,status,wfComments,"");
				return true;
            } 
            else 
            {
				logDebug("Workflow not updated, action not defined");
				return false;
			}
        } 
        else 
        {
			logDebug("Workflow not updated, workflow task name not found");
			return false;
		}
    } 
    else 
    {
		logDebug("updateIndicator of " + updateIndicator + "is not a valid value only W or I are expected");
		return false;
	}
}  
function voidRemoveFees(vFeeCode)
{
var feeSeqArray = new Array();
var invoiceNbrArray = new Array();
var feeAllocationArray = new Array();
var itemCap = capId;
if (arguments.length > 1)
    itemCap = arguments[1];

// for each fee found
//  	  if the fee is "NEW" remove it
//  	  if the fee is "INVOICED" void it and invoice the void
//

var targetFees = loadFees(itemCap);

for (tFeeNum in targetFees)
    {
    targetFee = targetFees[tFeeNum];

    if (targetFee.code.equals(vFeeCode))
        {

        // only remove invoiced or new fees, however at this stage all AE fees should be invoiced.

        if (targetFee.status == "INVOICED")
            {
            var editResult = aa.finance.voidFeeItem(itemCap, targetFee.sequence);

            if (editResult.getSuccess())
                logDebug("Voided existing Fee Item: " + targetFee.code);
            else
                { logDebug( "**ERROR: voiding fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }

            var feeSeqArray = new Array();
            var paymentPeriodArray = new Array();

            feeSeqArray.push(targetFee.sequence);
            paymentPeriodArray.push(targetFee.period);
            var invoiceResult_L = aa.finance.createInvoice(itemCap, feeSeqArray, paymentPeriodArray);

            if (!invoiceResult_L.getSuccess())
                {
                logDebug("**ERROR: Invoicing the fee items voided " + thisFee.code + " was not successful.  Reason: " +  invoiceResult_L.getErrorMessage());
                return false;
                }

            }



        if (targetFee.status == "NEW")
            {
            // delete the fee
            var editResult = aa.finance.removeFeeItem(itemCap, targetFee.sequence);

            if (editResult.getSuccess())
                logDebug("Removed existing Fee Item: " + targetFee.code);
            else
                { logDebug( "**ERROR: removing fee item (" + targetFee.code + "): " + editResult.getErrorMessage()); return false; }

            }

        } // each matching fee
    }  // each  fee
}  // function
function workflowApplicationSubmitted()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_APPLICATION SUBMITTAL", emailParams, reportFile);
	}
}

//as of 12/18/18 this is only ever going to  be used on Subdivision records - REL
function workflowApprovalToConstruct()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
        }
    
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_APPROVAL_TO_CONSTRUCT", emailParams, reportFile);
    }
}

//as of 12/18/18 this is only ever going to  be used on Subdivision records - REL
function workflowApprovalToConstructWithPin()
{
	
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
    var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
    appTypeArray = appTypeString.split("/");

    var shortNotes = getShortNotes(capId);
   

    var capContactArray = new Array();
	var capContResult = aa.people.getCapContactByCapID(capId);

	if (capContResult.getSuccess()) {
		conArray = capContResult.getOutput();
	} else {
		retVal = false;
    }
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
    }
    
    var emailArray = new Array();
    var emailAddressArray = new Array();  
    var pinSentList = AInfo["Local Contact Numbers Sent"];
    var pinSentRefArray ="";
    if (pinSentList != null)
    {
      pinSentRefArray = pinSentList.toString().split(",");
    }


	for (con in conArray)
	{
        cont = conArray[con];				
		peop = cont.getPeople();
       
        logDebug("Email: " + peop.getEmail());      
        logDebug("Audit Status: " + peop.getAuditStatus());      
        var hasPublicUser = false;
        var emailSent = false;
        if (peop.getAuditStatus() != "I") 
        {        
            if (!matches(peop.getEmail(), null, undefined, ""))
            {           
                contactType = conArray[con].getCapContactModel().getPeople().getContactType();    
                  // Check to see if the users have public account linkage already.
                  var refSeqNumber  = conArray[con].getCapContactModel().getRefContactNumber();
                  if (!refSeqNumber)
                  {
                    logDebug("Check null for Reference sequence number: " + refSeqNumber);
                    }
                    else
                    {
                        logDebug("Reference sequence number Test: " + aa.util.parseLong(refSeqNumber));     
                    }

                  logDebug("Custom field ACA PIN Sent: " + AInfo["Pin Sent"]);      

                      
                  var found = false;
                  if (refSeqNumber)
                  {
                    for (num in emailArray)
                    {
                        if (emailArray[num] == refSeqNumber)
                        {
                            found = true;
                            logDebug("Found: " + refSeqNumber + " in the array.");
                        }
                    }
                 }

                   // Did we already send email to the same reference contact? 
                  // We only want to send if we have not already done so
                   if (!found)
                  {
                    if (refSeqNumber)
                    {
                      emailArray.push(refSeqNumber);
                      logDebug("Push email array in: " + refSeqNumber + "Length" + emailArray.length);
                      logDebug("Email Array does not have existing ref contact ID: " + refSeqNumber);      
  
                      var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(refSeqNumber));
                      if (s_publicUserResult.getSuccess()) {
                          var fpublicUsers = s_publicUserResult.getOutput();
                          if (fpublicUsers == null || fpublicUsers.size() == 0) 
                          {
                              hasPublicUser = false;
                          
                          } 
                          else 
                          {
                              hasPublicUser = true;
                              logDebug("The contact("+refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                          
                          }
                      } 
                      else { 
                          hasPublicUser = false;
                          logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage());                    
                          
                      }
                    }
                      
                    // Check to see if we sent the PIN previously in the workflow history
                    var localContactSeqNumber = peop.contactSeqNumber;
                    var workflowHistoryPinSent = false;
                    for (sent in pinSentRefArray)
                    {
                        if (pinSentRefArray[sent] == localContactSeqNumber)
                        {
                            workflowHistoryPinSent = true;
                            logDebug(localContactSeqNumber + "has received PIN letter previously in the workflow history.");
                            logDebug("We are not attaching PIN letter again to: " + localContactSeqNumber);
                        }
                    }

                      var emailParams = aa.util.newHashtable();	                     
                      var reportFile = new Array();	

                         // No public user linkage, send also the ACA Pin instruction letter
                    if (!hasPublicUser  && workflowHistoryPinSent == false)   
                    {
                        if (refSeqNumber)
                        {
                        logDebug("Couldn't find public user ref contact ID" + refSeqNumber + ". We never sent ACA letter neither.") ;
                        }    
                        // PIN report with record id and contact type as params                
                        var reportParams1 = aa.util.newHashtable();
                        reportParams1.put("RecordID", alternateID.toString());
                        reportParams1.put("ContactType", contactType);
                        // Local contact ID
                        localCId = conArray[con].getCapContactModel().getPeople().getContactSeqNumber();			
                        reportParams1.put("ContactID", localCId);

                        rFile = generateReport("ACA Registration Pins-WWM",reportParams1, appTypeArray[0]);
                        
                        logDebug("This is the ACA Pin File: " + rFile);           
                    
                        if (rFile) {
                            reportFile.push(rFile);
                        }

                        getRecordParams4Notification(emailParams);
                        getWorkflowParams4Notification(emailParams);
                        logDebug("Email:" + peop.getEmail());                       
                        addParameter(emailParams, "$$altID$$", capId.getCustomID());
                        addParameter(emailParams, "$$shortNotes$$", shortNotes);
                        addACAUrlsVarToEmail(emailParams);

                        conEmail = peop.getEmail();
                        if (conEmail != null)
                        {
                            // Add email to the array so we do not send duplicate email.
                            for (x in emailAddressArray)
                            {
                                if (emailAddressArray[x] == peop.getEmail())
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                                if (matches(emailAddressArray[x], peop.getEmail()))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                            }                                                  
                            if (!emailSent)
                            {            
                                sendNotification("", conEmail, "", "DEQ_WWM_APPROVAL_TO_CONSTRUCT", emailParams, reportFile);
                                emailAddressArray.push(peop.getEmail());
                            }
                            editAppSpecific("Pin Sent", "Yes");
                            // Append the ref conference in the list.
                            var tempList = AInfo["Local Contact Numbers Sent"];
                            var tempListArray = "";
                            if (tempList != null)
                            {
                              tempListArray = tempList.toString().split(",");
                            }
                            logDebug("Custom Field Local Contact Numbers Sent value: " + tempList);         
                            logDebug("Number of entries in Local Contact Numbers Sent:" + tempListArray.length);         
                           
                            if (tempList == null || tempListArray.length == 0)
                            {
                                editAppSpecific("Local Contact Numbers Sent", localContactSeqNumber);
                                logDebug("Update custom Field Local Contact Numbers Sent to: " + localContactSeqNumber);         
                            }
                            else   // Append comma
                            {
                                appendSeqNumber = tempList + "," + localContactSeqNumber;
                                editAppSpecific("Local Contact Numbers Sent", appendSeqNumber);
                                logDebug("Update custom Field Local Contact Numbers Sent to: " + appendSeqNumber);         
                            }
                        }
                    }
                    else 
                    {                                                   
                        conEmail = peop.getEmail();                                                                 
                        getRecordParams4Notification(emailParams);
                        getWorkflowParams4Notification(emailParams);                         
        
                        logDebug("Send standard report if any to contact without the PIN Letter: " + conEmail);
                        addParameter(emailParams, "$$altID$$", capId.getCustomID());
                        addParameter(emailParams, "$$shortNotes$$", shortNotes);
                        addACAUrlsVarToEmail(emailParams);
                        if (conEmail != null)
                        {

                            // Add email to the array so we do not send duplicate email.
                            for (x in emailAddressArray)
                            {
                                if (emailAddressArray[x] == peop.getEmail())
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                                if (matches(emailAddressArray[x], peop.getEmail()))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                            } 
                                                                            
                            if (!emailSent)
                            {        
                                sendNotification("", conEmail, "", "DEQ_WWM_APPROVAL_TO_CONSTRUCT", emailParams, reportFile);
                                emailAddressArray.push(peop.getEmail());
                            }
                        }
                    }
                }
                else
                {
                    if (refSeqNumber != null || refSeqNumber != "")
                    {
                    logDebug("Same Email address has been found in the contacts for: " + refSeqNumber + ". Skip sending to the same email address.");       
                    }
                }
            }
        }    
    }
    
    var lpEmail = "";
    var lpEmailParams = aa.util.newHashtable();	
    
	var lpResult = aa.licenseScript.getLicenseProf(capId);
    
    if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			lpEmail += lpArr[lp].getEmail() + "; ";
		}
    }
    
    var lpEmailParams = aa.util.newHashtable();	
    var lpReportParams = aa.util.newHashtable();
    var lpReportFile = new Array();	  
	getRecordParams4Notification(lpEmailParams);
    getWorkflowParams4Notification(lpEmailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(lpEmailParams, "$$altID$$", capId.getCustomID());
    addParameter(lpEmailParams, "$$shortNotes$$", shortNotes);

	if (lpEmail != null)
	{
        sendNotification("", lpEmail, "", "DEQ_WWM_APPROVAL_TO_CONSTRUCT", lpEmailParams, lpReportFile);
    }
}

function workflowAwaitingClientBackflow()
{
	var emailParams = aa.util.newHashtable();
	var conArray = getContactArray();
	var conEmail = "";
    var emailAddressArray = new Array();
    
    var shortNotes = getShortNotes(capId);

    getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$shortNotes$$", shortNotes);
    
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			 conEmail = conArray[con].email;
            var emailSent = false;
            for (x in emailAddressArray)
            {
                if (matches(emailAddressArray[x], conEmail))
                {
                    emailSent = true;
                    logDebug("Found: " + conEmail + " in the array. Not sending email again.");
                }
            }   
            if (!emailSent)
            {
                sendNotification("", conEmail, "", "DEQ_WR_AWAITING CLIENT REPLY", emailParams, null);
                emailAddressArray.push(conEmail);
                logDebug("email sending: " + conEmail );
            }
		}
    }

    var lpResult = aa.licenseScript.getLicenseProf(capId);
    if (lpResult.getSuccess())
    { 
        var lpArr = lpResult.getOutput();
        for (var lp in lpArr)
        {
            var attArray = lpArr[lp].getAttributes();            
            if (attArray != null)
            {
                for (var i = 0; i < attArray.length; i++)
                {
                    if (attArray[i].getAttributeName() == "CCC REPRESENTATIVE EMAIL")
                    {
                        var cccRepEm = attArray[i].getAttributeValue();
                        
                        if (!matches(cccRepEm, null, undefined, ""))
                        {
                            conEmail = cccRepEm;
                            var emailSent = false;
                            for (x in emailAddressArray)
                            {
                                if (matches(emailAddressArray[x], conEmail))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + conEmail + " in the array. Not sending email again.");
                                }
                            }   
                            if (!emailSent)
                            {
                                sendNotification("", conEmail, "", "DEQ_WR_AWAITING CLIENT REPLY", emailParams, null);
                                emailAddressArray.push(conEmail);
                                logDebug("email sending: " + conEmail );
                            }
                        }
                    }													
                }
            }	
            if(lpArr[lp].getLicenseType()== "Engineer" || lpArr[lp].getLicenseType()== "Architect")
            {
                conEmail = lpArr[lp].getEmail()

                if (!matches(conEmail, null, undefined, ""))               
                {                    
                    var emailSent = false;
                    for (x in emailAddressArray)
                    {
                        if (matches(emailAddressArray[x], conEmail))
                        {
                            emailSent = true;
                            logDebug("Found: " + conEmail + " in the array. Not sending email again.");
                        }
                    }   
                    if (!emailSent)
                    {
                        sendNotification("", conEmail, "", "DEQ_WR_AWAITING CLIENT REPLY", emailParams, null);
                        emailAddressArray.push(conEmail);
                        logDebug("email sending: " + conEmail );
                    }                
                  
                }
            }            
            
        }
    }
    else 
    { 
        logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
    }
}
function workflowAwaitingClientDEQ()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	var appTypeResult = itemCap.getCapType();
	var appTypeString = appTypeResult.toString(); 
	var appTypeArray = appTypeString.split("/");
	showDebug = false;
	var emailAddressArray = new Array();

	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);   
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail = conArray[con].email;
			var emailSent = false;
			for (x in emailAddressArray)
            {
                if (matches(emailAddressArray[x], conEmail))
                {
                    emailSent = true;
                    logDebug("Found: " + conEmail + " in the array. Not sending email again.");
                }
            }   
            if (!emailSent)
            {
				sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
				emailAddressArray.push(conEmail);
                logDebug("email sending: " + conEmail );
			}
		}
	}

// EHIMS-5041
	var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
	if(!matches(itemCapType, "DEQ/WWM/Residence/Application", "DEQ/WWM/Commercial/Application"))
	{
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail = lpArr[lp].getEmail();
			var emailSent = false;
			for (x in emailAddressArray)
            {
				if (matches(emailAddressArray[x], conEmail))
                {
                    emailSent = true;
                    logDebug("Found: " + conEmail + " in the array. Not sending email again.");
                }
			}
			if (!emailSent)
            {
				sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
				emailAddressArray.push(conEmail);
                logDebug("email sending: " + conEmail );
			}
		} 
	}
}
	
	/*
	if (appTypeArray[1] == "WWM")
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
		logDebug("We're in WWM");
		}
	}
	
	else if (appTypeArray[1] == "WR")
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WR_AWAITING CLIENT REPLY", emailParams, reportFile);
		logDebug("We're in WR");
		}
	}

	else if (appTypeArray[1] == "Ecology")
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
		logDebug("We're in Ecology");
		}
	}
	else
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
		logDebug("We're in General");
		}
	} */
} 
function workflowAwaitingClientOPC(wfComments, capAddresses)
{
    logDebug("We're in OPC");

	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var address1;				
	var city;
	var state;
	var zip;		

	var shortNotes = getShortNotes(capId);
	logDebug("My short notes are: " + shortNotes);
	
	if (capAddresses == null || capAddresses.length == 0)
    {
        logDebug("WARNING: no addresses on this CAP:" + capId);
        capAddresses = null;
    }   


	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
    }
      
     
    getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
     
	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$shortNotes$$", shortNotes); 
	addParameter(emailParams, "$$wfComments$$", wfComments);	
	// As a test

	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
	//Save Record Direct URL
	addParameter(emailParams, "$$ACAURL$$", acaSite + getACAUrl());
	//addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 

	if (capAddresses != null)
    {
        addParameter(emailParams, "$$address$$", capAddresses[0]);
    }	

	for (con in conArray)
	{
		
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			
			conEmail += conArray[con].email + "; ";
		}

		/*if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail = conArray[con].email;
			
			address1 = conArray[con].addressLine1;				
			city = conArray[con].city;
			state = conArray[con].state;
			zip = conArray[con].zip;		
	
			addParameter(emailParams, "$$address1$$", address1);
			addParameter(emailParams, "$$city$$", city);
			addParameter(emailParams, "$$state$$", state);
			addParameter(emailParams, "$$zip$$", zip);	           
                                                
		}*/
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}

	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{      	
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}	

	if (conEmail != null)
	{
		logDebug("Email addresses: " + conEmail);
		sendNotification("", conEmail, "", "DEQ_OPC_AWAITINGCLIENTREPLY", emailParams, reportFile);	
	}

	
}
function getACARecordURL() {

	itemCap = (arguments.length == 2) ? arguments[1] : capId;		
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
	var acaRecordUrl = "";
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
	// MODIFY THIS It's in PROD!!!
	acaUrl = "https://aca.suffolkcountyny.gov/CitizenAccess/Cap/CapDetail.aspx?"
	var itemCapModel = aa.cap.getCap(capId).getOutput().getCapModel();
	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";   
	acaRecordUrl += "&Module=" + itemCapModel.getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
	if(matches(enableCustomWrapper,"Yes","YES")){
			 acaRecordUrl += "&FromACA=Y";
			logDebug("ACA record Url is:" + acaRecordUrl); 
			return acaRecordUrl;
		}
} 
function wwmWorkflowAdditionalInfo(reportName)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
	       
		reportParams.put("RecordID", alternateID.toString());

		reportFile = generateReport(reportName,reportParams, appTypeArray[0])
	

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
	}
}
function workflowFinalReviewApproved()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = ""; 
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	var shortNotes = getShortNotes(capId);
	addParameter(emailParams, "$$shortNotes$$", shortNotes);	
	addACAUrlsVarToEmail(emailParams);

	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", emailParams, reportFile);
	}
}
function workflowFinalReviewApprovedWWM()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = ""; 
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	var shortNotes = getShortNotes(capId);
	addParameter(emailParams, "$$shortNotes$$", shortNotes);
	addACAUrlsVarToEmail(emailParams);

	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", emailParams, reportFile);
	}
}
function workflowFinalReviewApprovedWWMWithPin()
{
	var conEmail = "";
    var fromEmail = ""; 
    var shortNotes = getShortNotes(capId);
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();  
    
    
	var capContResult = aa.people.getCapContactByCapID(capId);

	if (capContResult.getSuccess()) {
		conArray = capContResult.getOutput();
	} else {
		retVal = false;
    }
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
    }
    
    var emailArray = new Array();
    var emailAddressArray = new Array();
    var pinSentList = AInfo["Local Contact Numbers Sent"];
    var pinSentRefArray ="";
    if (pinSentList != null)
    {
      pinSentRefArray = pinSentList.toString().split(",");
    }

	for (con in conArray)
	{

		cont = conArray[con];				
		peop = cont.getPeople();
       
        logDebug("Email: " + peop.getEmail());      
        logDebug("Audit Status: " + peop.getAuditStatus());      
        var hasPublicUser = false;
        var emailSent = false;
		if (peop.getAuditStatus() != "I") 
        {        
			if (!matches(peop.getEmail(), null, undefined, ""))
			{				
                contactType = conArray[con].getCapContactModel().getPeople().getContactType();
                logDebug("Contact: " + contactType);              

                // Check to see if the users have public account linkage already.
                var refSeqNumber  = conArray[con].getCapContactModel().getRefContactNumber();
                
                if (!refSeqNumber)
                {
                    logDebug("Check null for Reference sequence number: " + refSeqNumber);
                }
                else
                {
                    logDebug("Reference sequence number Test: " + aa.util.parseLong(refSeqNumber));     
                }
                
                logDebug("Custom field ACA PIN Sent: " + AInfo["Pin Sent"]);      
                    
                var found = false;

                if (refSeqNumber)
                {
                    for (num in emailArray)
                    {
                        if (emailArray[num] == refSeqNumber)
                        {
                            found = true;
                            logDebug("Found: " + refSeqNumber + " in the array.");
                        }
                    }
                }
                // Did we already send email to the same reference contact? 
                // We only want to send if we have not already done so
                // Add this later to check for custom field: if (AInfo["Pin Sent"] != "Yes")
                if (!found)
                {
                    if (refSeqNumber)
                    {
                        emailArray.push(refSeqNumber);
                        logDebug("Push email array in: " + refSeqNumber + "Length" + emailArray.length);

                        logDebug("Email Array does not have existing ref contact ID: " + refSeqNumber);      

                        var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(refSeqNumber));

                        //var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
                        //if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                        //var userModel = getUserResult.getOutput();

                        // Check to see if the contact has public user associated with it already.
                        if (s_publicUserResult.getSuccess()) {
                            var fpublicUsers = s_publicUserResult.getOutput();
                            if (fpublicUsers == null || fpublicUsers.size() == 0) 
                            {
                                hasPublicUser = false;
                            
                            } 
                            else 
                            {
                                hasPublicUser = true;
                                logDebug("The contact("+refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                            
                            }
                        } 
                        else { 
                            hasPublicUser = false;
                            logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage());
                    
                        }
                    }   

                    // Check to see if we sent the PIN previously in the workflow history
                    var localContactSeqNumber = peop.contactSeqNumber;
                    var workflowHistoryPinSent = false;
                    
                    for (sent in pinSentRefArray)
                    {
                        if (pinSentRefArray[sent] == localContactSeqNumber)
                        {
                            workflowHistoryPinSent = true;
                            logDebug(localContactSeqNumber + "has received PIN letter previously in the workflow history.");
                            logDebug("We are not attaching PIN letter again to: " + localContactSeqNumber);
                        }
                    }
                    //pubusers = aa.publicUser.getPublicUserListByLicenseSeqNBR(licenseNumber).getOutput().toArray();

                    var emailParams = aa.util.newHashtable();	                   
                    var reportFile = new Array();	
                                                                            
                    // No public user linkage, send also the ACA Pin instruction letter
                    if (!hasPublicUser && workflowHistoryPinSent == false)  
                    {
                        if (refSeqNumber)
                        {
                            logDebug("Couldn't find public user ref contact ID" + refSeqNumber + ". We never sent ACA letter neither.") ;
                        }       
                        // PIN report with record id and contact type as params                
                        var reportParams1 = aa.util.newHashtable();
                        reportParams1.put("RecordID", alternateID.toString());
                        reportParams1.put("ContactType", contactType);
                        // Local contact ID
                        localCId = conArray[con].getCapContactModel().getPeople().getContactSeqNumber();			
                        reportParams1.put("ContactID", localCId);
                    
                        rFile = generateReport("ACA Registration Pins-WWM",reportParams1, appTypeArray[0])
                        
                        logDebug("This is the ACA Pin File we are emailing: " + rFile);           
                    
                        if (rFile) {
                            reportFile.push(rFile);
                        }

                        getRecordParams4Notification(emailParams);
                        getWorkflowParams4Notification(emailParams);
                        logDebug("Email:" + peop.getEmail());                       
                        addParameter(emailParams, "$$altID$$", capId.getCustomID());
                        addParameter(emailParams, "$$shortNotes$$", shortNotes);
                        addACAUrlsVarToEmail(emailParams);
                        conEmail = peop.getEmail();
                        if (conEmail != null)
                        {
                            // Add email to the array so we do not send duplicate email.
                            for (x in emailAddressArray)
                            {
                                if (emailAddressArray[x] == peop.getEmail())
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                                if (matches(emailAddressArray[x], peop.getEmail()))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                            }                                                  
                            if (!emailSent)
                            {                            
                                sendNotification("", conEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", emailParams, reportFile);
                                emailAddressArray.push(peop.getEmail());
                            }
                           
                            editAppSpecific("Pin Sent", "Yes");
                            // Append the ref conference in the list.
                            var tempList = AInfo["Local Contact Numbers Sent"];
                            var tempListArray = "";
                            if (tempList != null)
                            {
                                tempListArray = tempList.toString().split(",");
                            }
                            logDebug("Custom Field Local Contact Numbers Sent value: " + tempList);         
                            logDebug("Number of entries in Local Contact Numbers Sent Sent:" + tempListArray.length);         
                            
                            if (tempList == null || tempListArray.length == 0)
                            {
                                editAppSpecific("Local Contact Numbers Sent", localContactSeqNumber);
                                logDebug("Update custom Field Local Contact Numbers Sent to: " + localContactSeqNumber);         
                            }
                            else   // Append comma
                            {
                                appendSeqNumber = tempList + "," + localContactSeqNumber;
                                editAppSpecific("Local Contact Numbers Sent", appendSeqNumber);
                                logDebug("Update custom Field Local Contact Numbers Sent to: " + appendSeqNumber);         
                            }
                        }
                    }
                    else 
                    {                                                   
                        conEmail = peop.getEmail();                                                                 
                        getRecordParams4Notification(emailParams);
                        getWorkflowParams4Notification(emailParams);                         
        
                        logDebug("Send standard report to contact without the PIN Letter: " + conEmail);
                        addParameter(emailParams, "$$altID$$", capId.getCustomID());
                        addParameter(emailParams, "$$shortNotes$$", shortNotes);
                        addACAUrlsVarToEmail(emailParams);

                        if (conEmail != null)
                        {
                            // Add email to the array so we do not send duplicate email.
                            for (x in emailAddressArray)
                            {
                                if (emailAddressArray[x] == peop.getEmail())
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                                if (matches(emailAddressArray[x], peop.getEmail()))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                            }                                                  
                            if (!emailSent)
                            {   
                                sendNotification("", conEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", emailParams, reportFile);
                                emailAddressArray.push(peop.getEmail());
                                
                            }
                        }

                    }
                }
                else
                {
                    if (refSeqNumber != null || refSeqNumber != "")
                    {
                        logDebug("Same Email address has been found in the contacts for: " + refSeqNumber + ". Skip sending to the same email address.");     
                    }
                }
                                           		
            
            }
        }		
    }
       


 var lpEmail = "";
 var lpEmailParams = aa.util.newHashtable();	
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
    
    for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			lpEmail += lpArr[lp].getEmail() + "; ";
		}
    }
    
    var lpEmailParams = aa.util.newHashtable();	
    var lpReportParams = aa.util.newHashtable();
    var lpReportFile = new Array();	   
    
	getRecordParams4Notification(lpEmailParams);
    getWorkflowParams4Notification(lpEmailParams);
	logDebug("Emails" + lpEmail);	

    addParameter(lpEmailParams, "$$altID$$", capId.getCustomID());
    addParameter(lpEmailParams, "$$shortNotes$$", shortNotes);
    addACAUrlsVarToEmail(lpEmailParams);

	if (lpEmail != null)
	{
		sendNotification("", lpEmail, "", "DEQ_WWM_FINAL REVIEW APPROVED", lpEmailParams, lpReportFile);
	}
}


function workflowFoodReviewCompleteWWM(reportName, reportParamRecID)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
    var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();

		reportParams.put(reportParamRecID, alternateID.toString());

		rFile = generateReport(reportName,reportParams, appTypeArray[0])
        logDebug("This is the rFile: " + rFile);           
        
            if (rFile) {
            reportFile.push(rFile);
            }

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (conArray[con].contactType == "Applicant")
		{
			conEmail += conArray[con].email + "; ";
        }
    
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_FOOD_REVIEW_COMPLETE", emailParams, reportFile);
    }
    logDebug(conEmail + "is the e-mail address.");
}

function workflowInspectionPlanChangedOPC(wfComments, capAddresses)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var shortNotes = getShortNotes(capId);
	logDebug("My short notes are in workflowInspectionPlanChangedOPC: " + shortNotes);
	
	if (capAddresses == null || capAddresses.length == 0)
    {
        logDebug("WARNING: no addresses on this CAP:" + capId);
        capAddresses = null;
	}  
	
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
	addParameter(emailParams, "$$shortNotes$$", shortNotes);
	addParameter(emailParams, "$$wfComments$$", wfComments);

    if (conEmail != null)
    {
        addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
        if (capAddresses != null)
        {
            addParameter(emailParams, "$$address$$", capAddresses[0]);
        }
        sendNotification("", conEmail, "", "DEQ_OPC_REVISED_TO_APPROVEDPLAN_NEEDED", emailParams, reportFile);
        logDebug("We're in OPC");
    }
	
	
}
function workflowInspectionResulted()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conEmail = "";
    var fromEmail = "";
		
		var capContResult = aa.people.getCapContactByCapID(capId);

		if (capContResult.getSuccess()) {
			conArray = capContResult.getOutput();
		} else {
			retVal = false;
		}
	
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{		
		cont = conArray[con];				
		peop = cont.getPeople();

		if (peop.getAuditStatus() != "I")
		{
			if (!matches(peop.getEmail(), null, undefined, ""))
			{
				conEmail += peop.getEmail() + "; ";
        }
			}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_INSPECTIONRESULT", emailParams, reportFile);
    }
}

function workflowInspectionResultedWWM(reportName, reportParamRecID)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();

	var conEmail = "";
    var fromEmail = "";
    var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();

		reportParams.put(reportParamRecID, alternateID.toString());

		rFile = generateReport(reportName,reportParams, appTypeArray[0])
        logDebug("This is the rFile: " + rFile);           
        
            if (rFile) {
            reportFile.push(rFile);
            }
						var capContResult = aa.people.getCapContactByCapID(capId);

						if (capContResult.getSuccess()) {
							conArray = capContResult.getOutput();
						} else {
							retVal = false;
						}

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		cont = conArray[con];				
		peop = cont.getPeople();

		if (peop.getAuditStatus() != "I")
		{
		if (!matches(peop.getEmail(), null, undefined, ""))
		{
			conEmail += peop.getEmail() + "; ";
				}
			}
    
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_INSPECTIONRESULT", emailParams, reportFile);
    }
}

function workflowPartialReviewApproved()
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = ""; 
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	var shortNotes = getShortNotes(capId);
	addParameter(emailParams, "$$shortNotes$$", shortNotes);	
	addACAUrlsVarToEmail(emailParams);

	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_PARTIAL_FINAL_REVIEW", emailParams, reportFile);
	}
}
function workflowPlanReviewApprovedBackflow()
{    
    var emailParams = aa.util.newHashtable();	
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var emailAddressArray = new Array();
    showDebug = true;
    
	var shortNotes = getShortNotes(capId);
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    

	addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$shortNotes$$", shortNotes);

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			if (conArray[con].contactType == "Applicant")
			{
                var address1 = conArray[con].addressLine1;		
                var address2 = conArray[con].addressLine2;				
                var city = conArray[con].city;
               
                addParameter(emailParams, "$$address1$$", address1);
                addParameter(emailParams, "$$address2$$", address2);
                addParameter(emailParams, "$$city$$", city);
                
				conEmail = conArray[con].email;

				var emailSent = false;

				for (x in emailAddressArray)
				{
					if (matches(emailAddressArray[x], conEmail))
					{
						emailSent = true;
						logDebug("Found: " + conEmail + " in the array. Not sending email again.");
					}
				}   

				logDebug("Time to send applicant: " + startDate.toLocaleTimeString());
				if (!emailSent)
				{
					sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW BACKFLOW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					logDebug("email sending: " + conEmail );
				}
			}
		}
	}

	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	
	// Send email to each contact separately.
	for (var lp in lpArr)
	{
			if( lpArr[lp].getLicenseType()== "Community Water Supply")
			{
				var attArray = lpArr[lp].getAttributes();
				if (attArray != null)
				{
					for (var i = 0; i < attArray.length; i++)
					{
						if (attArray[i].getAttributeName() == "CCC REPRESENTATIVE EMAIL")
						{
							var cccRepEm = attArray[i].getAttributeValue();
                            conEmail = cccRepEm;
							var emailSent = false;

							for (x in emailAddressArray)
							{
								if (matches(emailAddressArray[x], conEmail))
								{
									emailSent = true;
									logDebug("Found: " + conEmail + " in the array. Not sending email again.");
								}
							}   
			
							if (!emailSent)
							{
								licProfScriptModel = lpArr[lp];
								logDebug("Address1:" + licProfScriptModel.getAddress1());
								logDebug("Address2:" + licProfScriptModel.getAddress2());
								var address1 = licProfScriptModel.getAddress1();		
								var address2 = licProfScriptModel.getAddress2();				
								var city = lpArr[lp].city;
							
								logDebug("address1: " + address1);
								logDebug("address2: " + address2);
								logDebug("city"  + city);
								addParameter(emailParams, "$$address1$$", address1);
								addParameter(emailParams, "$$address2$$", address2);
								addParameter(emailParams, "$$city$$", city);
								
								logDebug("Time to send CCC emails: " + startDate.toLocaleTimeString());
								sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW BACKFLOW APPROVED", emailParams, reportFile);
								emailAddressArray.push(conEmail);
								logDebug("CCC email sending: " + conEmail );
							}
                            
                           
						}
						
					}
				}
			}
			if( lpArr[lp].getLicenseType()== "Engineer" || lpArr[lp].getLicenseType()== "Architect")
			{
                if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
                {
                    conEmail = lpArr[lp].getEmail();
					var emailSent = false;

					for (x in emailAddressArray)
					{					
						if (matches(emailAddressArray[x], conEmail))
						{
							emailSent = true;
							logDebug("Found: " + conEmail + " in the array. Not sending email again.");
						}
					}  
					if (!emailSent)
					{
						licProfScriptModel = lpArr[lp];
						logDebug("Address1:" + licProfScriptModel.getAddress1());
						logDebug("Address2:" + licProfScriptModel.getAddress2());
						var address1 = licProfScriptModel.getAddress1();		
						var address2 = licProfScriptModel.getAddress2();				
						var city = lpArr[lp].city;
						
						logDebug("address1: " + address1);
						logDebug("address2: " + address2);
						logDebug("city"  + city);
						addParameter(emailParams, "$$address1$$", address1);
						addParameter(emailParams, "$$address2$$", address2);
						addParameter(emailParams, "$$city$$", city);

						logDebug("Time to send other LP emails: " + startDate.toLocaleTimeString());
						sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW BACKFLOW APPROVED", emailParams, reportFile);
						emailAddressArray.push(conEmail);
						logDebug("Other LP email sending: " + conEmail );
					}
                }
			}
		}	
}


function workflowPlanReviewApprovedWR()
{
	
	var emailParams = aa.util.newHashtable();	
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
	var emailAddressArray = new Array();
	var combinedEmails = "";

	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);    
	var waterDistrict = getAppSpecific("Water District", capId);
	var appName = cap.getSpecialText();

	addParameter(emailParams, "$$altID$$", capId.getCustomID());
	addParameter(emailParams, "$$waterdistrict$$", waterDistrict);
	addParameter(emailParams, "$$appname$$", appName);

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			if (conArray[con].contactType == "Applicant")
			{
				conEmail = conArray[con].email;
				var emailSent = false;

				for (x in emailAddressArray)
				{					
					if (matches(emailAddressArray[x], conEmail))
					{
						emailSent = true;
						logDebug("Found: " + conEmail + " in the array. Not sending email again.");
					}
				}  
				if (!emailSent)
				{
					//sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					combinedEmails += conEmail + "; ";
					logDebug("Contact emails list: " + conEmail );
				}  
			}
		}
	}

	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	
	// Send email to each contact separately.
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			if( lpArr[lp].getLicenseType()== "Community Water Supply")
			{
				var attArray = lpArr[lp].getAttributes();
				if (attArray != null)
				{
					for (var i = 0; i < attArray.length; i++)
					{
						if (attArray[i].getAttributeName() == "CCC REPRESENTATIVE EMAIL")
						{
							var cccRepEm = attArray[i].getAttributeValue();
							conEmail = cccRepEm;
							var emailSent = false;
							for (x in emailAddressArray)
							{								
								if (matches(emailAddressArray[x], conEmail))
								{
									emailSent = true;
									logDebug("Found: " + conEmail + " in the array. Not sending email again.");
								}
							}     

							if (!emailSent)
							{
								//sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
								emailAddressArray.push(conEmail);
								combinedEmails += conEmail + "; ";
								
							}
						}
						
					}
				}
				
				conEmail = lpArr[lp].email;
				var emailSent = false;
				for (x in emailAddressArray)
				{					
					if (matches(emailAddressArray[x], conEmail))
					{
						emailSent = true;
						logDebug("Found: " + conEmail + " in the array. Not sending email again.");
					}
				}     
				if (!emailSent)
				{
					//sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					combinedEmails += conEmail + "; ";
					
				}
			}
			else
			{
				conEmail = lpArr[lp].email;
				var emailSent = false;
				for (x in emailAddressArray)
				{	
					if (matches(emailAddressArray[x], conEmail))
					{
						emailSent = true;
						logDebug("Found: " + conEmail + " in the array. Not sending email again.");
					}
				} 
				if (!emailSent)
				{
					//sendNotification("", conEmail, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
					emailAddressArray.push(conEmail);
					combinedEmails += conEmail + "; ";
					
				}
			}
		}
	}

	if (combinedEmails != null)
	{		
		sendNotification("", combinedEmails, "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
		logDebug("Contact and LP emails list sent: " + combinedEmails );
	}
	sendNotification("", "ada.chan@suffolkcountyny.gov", "", "DEQ_WR_PLAN REVIEW APPROVED", emailParams, reportFile);
	logDebug("Admin semail sent: ");
}
function workflowPlanRevisionsNeeded(wfComments, capAddresses)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var shortNotes = getShortNotes(capId);
	logDebug("My short notes are: " + shortNotes);
	
	if (capAddresses == null || capAddresses.length == 0)
    {
        logDebug("WARNING: no addresses on this CAP:" + capId);
        capAddresses = null;
	}  

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
	addParameter(emailParams, "$$shortNotes$$", shortNotes);
	addParameter(emailParams, "$$wfComments$$", wfComments);
	
	if (appTypeArray[1] == "WWM")
	{
		if (conEmail != null)
		{
		sendNotification("", conEmail, "", "DEQ_WWM_PLAN REVISIONS NEEDED", emailParams, reportFile);
		logDebug("We're in WWM");
		}
	}

	else if (appTypeArray[1] == "OPC")
	{
		if (conEmail != null)
		{
			addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
			if (capAddresses != null)
			{
				addParameter(emailParams, "$$address$$", capAddresses[0]);
			}
			sendNotification("", conEmail, "", "DEQ_OPC_PLANREVISIONSNEEDED", emailParams, reportFile);
			logDebug("We're in OPC");
		}
	}
	
}
function workflowPlansCoordinationApproved(capAddresses)
{
	var emailParams = aa.util.newHashtable();	
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
	var fromEmail = "";
	var shortNotes = getShortNotes(capId);
	logDebug("My short notes are: " + shortNotes);
	
	if (capAddresses == null || capAddresses.length == 0)
    {
        logDebug("WARNING: no addresses on this CAP:" + capId);
        capAddresses = null;
	}  

	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
	acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
	var projectName = workDescGet(capId);
	
	
    if (capAddresses != null || capAddresses.length > 0)
    {
		for (loopk in capAddresses)
		{
			sourceAddressfModel = capAddresses[loopk];	
			
			//debugObject(sourceAddressfModel);

			address1 = sourceAddressfModel.getAddressLine1();
			streetNumber = sourceAddressfModel.getHouseNumberStart();
			streetName = sourceAddressfModel.getStreetName();
			streetType = sourceAddressfModel.getStreetSuffix();
			city =sourceAddressfModel.getCity();
			state = sourceAddressfModel.getState();
			zip = sourceAddressfModel.getZip();

			addParameter(emailParams, "$$altID$$", capId.getCustomID());
			addParameter(emailParams, "$$shortnotes$$", shortNotes);
			addParameter(emailParams, "$$streetNumber$$", streetNumber);
			addParameter(emailParams, "$$streetName$$", streetName);
			addParameter(emailParams, "$$streetType$$", streetType);
			addParameter(emailParams, "$$city$$", city);
			addParameter(emailParams, "$$state$$", state);
			addParameter(emailParams, "$$zip$$", zip);	                                                    		
			addParameter(emailParams, "$$acaURL$$", acaSite);
			
		}
	}

	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";				
			
		}
	}

	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);

	if (conEmail != null)
	{
		if (appTypeArray[2] == "Swimming Pool")
		{
			sendNotification("", conEmail, "", "DEQ_OPC_PLANCOORDINATIONAPPROVED_POOL", emailParams, reportFile);
		}
		else
		{
			sendNotification("", conEmail, "", "DEQ_OPC_PLANCOORDINATIONAPPROVED", emailParams, reportFile);
		}
		logDebug("We're in OPC");
	}
    
}
function debugObject(object) {
	var output = ''; 
	for (property in object) { 
	  output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	} 
	logDebug(output);
} 

function workflowPrelimApproval(reportName, reportParamRecID)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	var alternateID = capId.getCustomID();
	/*
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
	if(appTypeArray[0] == "WWM")
	{	

    var alternateID = capId.getCustomID(); 
*/
		reportParams.put(reportParamRecID, alternateID.toString());

		rFile = generateReport(reportName, reportParams, appTypeArray[0])
        logDebug("This is the rFile: " + rFile);           
        
            if (rFile) {
            reportFile.push(rFile);
            }
	
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
        }
    
	}
	//EHIMS-5041: remove all LP email
	/*
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}*/
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	addACAUrlsVarToEmail(emailParams);

	if (conEmail != null)
	{
        sendNotification("", conEmail, "", "DEQ_WWM_PRELIMINARY_REVIEW_APPROVED", emailParams, null);
    }
}

function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput();
	logDebug("This is the report output: " + report);
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}
function workflowPrelimApprovalWithPin(reportName, reportNameAttachToRecord, reportParamRecID)
{	
	var conEmail = "";
    var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	var alternateID = capId.getCustomID();
    var shortNotes = getShortNotes(capId);
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
    appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();
    saveToRecord = true;
    var thisReport = "";

	var capContResult = aa.people.getCapContactByCapID(capId);

	if (capContResult.getSuccess()) {
		conArray = capContResult.getOutput();
	} else {
		retVal = false;
    }
    
	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
    }
    
    var emailArray = new Array();
    var emailAddressArray = new Array();
    var pinSentList = AInfo["Local Contact Numbers Sent"];
    var pinSentRefArray ="";
    if (pinSentList != null)
    {
      pinSentRefArray = pinSentList.toString().split(",");
    }

	for (con in conArray)
	{
        cont = conArray[con];				
		peop = cont.getPeople();
       
        logDebug("Email: " + peop.getEmail());      
        logDebug("Audit Status: " + peop.getAuditStatus());      
        var hasPublicUser = false;
        var emailSent = false;
        if (peop.getAuditStatus() != "I") 
        {        
            if (!matches(peop.getEmail(), null, undefined, ""))
            {             
                contactType = conArray[con].getCapContactModel().getPeople().getContactType();
                // Check to see if the users have public account linkage already.
                var refSeqNumber  = conArray[con].getCapContactModel().getRefContactNumber();
                if (!refSeqNumber)
                {
                    logDebug("Check null for Reference sequence number: " + refSeqNumber);
                }
                else
                {
                    logDebug("Reference sequence number Test: " + aa.util.parseLong(refSeqNumber));     
                }

                logDebug("Local Contact sequence number: " + peop.contactSeqNumber);

                 // Did we already send email to the same reference contact? 
                // We only want to send if we have not already done so
                logDebug("Custom field ACA PIN Sent: " + AInfo["Pin Sent"]); 
                
                var found = false;

                 if (refSeqNumber)
                {
                    for (num in emailArray)
                    {
                        if (emailArray[num] == refSeqNumber)
                        {
                            found = true;
                            logDebug("Found: " + refSeqNumber + " in the array.");
                        }
                    }
                }

                // Did we already send email to the same reference contact? 
                // We only want to send if we have not already done so
                // Add this later to check for custom field: if (AInfo["Pin Sent"] != "Yes")
                if (!found)
                {
                    if (refSeqNumber)
                    {
                            emailArray.push(refSeqNumber);
                            logDebug("Push email array in: " + refSeqNumber + "Length" + emailArray.length);
                            logDebug("Email Array does not have existing ref contact ID: " + refSeqNumber);      
                        
                        var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(refSeqNumber));
                        if (s_publicUserResult.getSuccess()) {
                            var fpublicUsers = s_publicUserResult.getOutput();
                            if (fpublicUsers == null || fpublicUsers.size() == 0) 
                            {
                                hasPublicUser = false;                        
                            } 
                            else 
                            {
                                hasPublicUser = true;
                                logDebug("The contact("+refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                            
                            }
                        } 
                        else { 
                            hasPublicUser = false;
                            logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage());                    
                            
                        }
                    }
                   
                    // Check to see if we sent the PIN previously in the workflow history                    
                    var localContactSeqNumber = peop.contactSeqNumber;
                    var workflowHistoryPinSent = false;
                    for (sent in pinSentRefArray)
                    {
                        if (pinSentRefArray[sent] == localContactSeqNumber)
                        {
                            workflowHistoryPinSent = true;
                            logDebug(localContactSeqNumber + "has received PIN letter previously in the workflow history.");
                            logDebug("We are not attaching PIN letter again to: " + localContactSeqNumber);
                        }
                    }
                   
                    var emailParams = aa.util.newHashtable();	
                    var reportParams = aa.util.newHashtable();
                    var reportFile = new Array();	
                    reportParams.put(reportParamRecID, alternateID.toString());

                    if (saveToRecord)
                    {
                        thisReport = reportNameAttachToRecord;
                        logDebug("This is the report will save to record: " + thisReport);
                    }
                    else
                    {
                        thisReport = reportName;
                        logDebug("This is the report that should not be saved: " + thisReport);
                    }

                    // WWM Permit Conditions Script 
                    rFile = generateReport(thisReport, reportParams, appTypeArray[0])
                    logDebug("This is the WWM Permit Conditions Script : " + rFile);           
                    
                    if (rFile) {
                    reportFile.push(rFile);
                    }

                    saveToRecord = false;
                    
                    // No public user linkage, send also the ACA Pin instruction letter
                    if (!hasPublicUser && workflowHistoryPinSent == false)  
                    {
                        if (refSeqNumber)
                        {
                            logDebug("Couldn't find public user ref contact ID" + refSeqNumber + ". We never sent ACA letter neither.") ;
                        }
                

                        logDebug("Local Contact sequence number: " + localContactSeqNumber);

                        // PIN report with record id and contact type as params                
                        var reportParams1 = aa.util.newHashtable();
                        reportParams1.put("RecordID", alternateID.toString());
                        reportParams1.put("ContactType", contactType);
                        // Local contact ID
                        localCId = conArray[con].getCapContactModel().getPeople().getContactSeqNumber();			
                        reportParams1.put("ContactID", localCId);

                        rFile = generateReport("ACA Registration Pins-WWM",reportParams1, appTypeArray[0])
                        
                        logDebug("This is the ACA Pin File we are emailing: " + rFile);              
                    
                        if (rFile) {
                            reportFile.push(rFile);
                        }

                        getRecordParams4Notification(emailParams);
                        getWorkflowParams4Notification(emailParams);
                        logDebug("Email:" + peop.getEmail());                       
                        addParameter(emailParams, "$$altID$$", capId.getCustomID());
                        addParameter(emailParams, "$$shortNotes$$", shortNotes);
                        addACAUrlsVarToEmail(emailParams);
                        conEmail = peop.getEmail();
                        if (conEmail != null)
                        {
                            // Add email to the array so we do not send duplicate email.
                            for (x in emailAddressArray)
                            {
                                if (emailAddressArray[x] == peop.getEmail())
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                                if (matches(emailAddressArray[x], peop.getEmail()))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                            }                                                  
                            if (!emailSent)
                            {
                                sendNotification("", conEmail, "", "DEQ_WWM_PRELIMINARY_REVIEW_APPROVED_WITH_ACA_PIN", emailParams, reportFile);
                                emailAddressArray.push(peop.getEmail());
                            }
                            editAppSpecific("Pin Sent", "Yes");
                            // Append the ref conference in the list.
                            var tempList = AInfo["Local Contact Numbers Sent"];
                            var tempListArray = "";
                            if (tempList != null)
                            {
                                tempListArray = tempList.toString().split(",");
                            }
                            logDebug("Custom Field Local Contact Numbers Sent value: " + tempList);         
                            logDebug("Number of entries in Local Contact Numbers Sent:" + tempListArray.length);         
                            
                            if (tempList == null || tempListArray.length == 0)
                            {
                                // We are putting the local contact number in 
                                editAppSpecific("Local Contact Numbers Sent", localContactSeqNumber);
                                logDebug("Update custom Field Local Contact Numbers Sent to: " + localContactSeqNumber);         
                            }
                            else   // Append comma
                            {
                                appendSeqNumber = tempList + "," + localContactSeqNumber;
                                editAppSpecific("Local Contact Numbers Sent", appendSeqNumber);
                                logDebug("Update custom Field Local Contact Numbers Sent to: " + appendSeqNumber);         
                            }
                        }
                    }
                    else 
                    {                                                   
                        conEmail = peop.getEmail();                                                                  
                        getRecordParams4Notification(emailParams);
                        getWorkflowParams4Notification(emailParams);                         
        
                        logDebug("Send standard report to contact without the PIN Letter: " + conEmail);
                        addParameter(emailParams, "$$altID$$", capId.getCustomID());
                        addParameter(emailParams, "$$shortNotes$$", shortNotes);
                        addACAUrlsVarToEmail(emailParams);
                        if (conEmail != null)
                        {
                            // Add email to the array so we do not send duplicate email.
                            for (x in emailAddressArray)
                            {
                                if (emailAddressArray[x] == peop.getEmail())
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                }
                                if (matches(emailAddressArray[x], peop.getEmail()))
                                {
                                    emailSent = true;
                                    logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                
                                }
                                
                            }
                            if (!emailSent)
                            {
                                sendNotification("", conEmail, "", "DEQ_WWM_PRELIMINARY_REVIEW_APPROVED", emailParams, reportFile);
                                emailAddressArray.push(peop.getEmail());                                  
                                logDebug("Push email: " + peop.getEmail() + " to emailAddressArray.");
                            }
                        }
                    }
                }
                else
                {
                    if (refSeqNumber)
                    {
                        logDebug("Same Email address has been found in the contacts for: " + refSeqNumber + ". Skip sending to the same email address.");     
                    }

                }

            }
        }
    
    }
    //EHIMS-5041: remove all LP email
    /*
    var lpEmail = "";
        
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			lpEmail += lpArr[lp].getEmail() + "; ";
		}
    }
    
    var lpEmailParams = aa.util.newHashtable();	
    var lpReportParams = aa.util.newHashtable();
    var lpReportFile = new Array();	
    lpReportParams.put(reportParamRecID, alternateID.toString());
    // NOI report
    rFile = generateReport(reportName,lpReportParams, appTypeArray[0])
    logDebug("This is the rFile: " + rFile);           
    
    if (rFile) {
        lpReportFile.push(rFile);
    }

	getRecordParams4Notification(lpEmailParams);
    getWorkflowParams4Notification(lpEmailParams);
    
    //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
    addParameter(lpEmailParams, "$$altID$$", capId.getCustomID());
    addParameter(lpEmailParams, "$$shortNotes$$", shortNotes);
    addACAUrlsVarToEmail(lpEmailParams);
    if (!matches(lpEmail, null, undefined, ""))	
	{
        logDebug("Found: " + lpEmail + " lp email in the array.");
        sendNotification("", lpEmail, "", "//EHIMS-5041: remove all LP email", lpEmailParams, null);
    } */
}

function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
	report = report.getOutput();
	logDebug("This is the report output: " + report);
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,currentUserID);

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logMessage("Report Result: "+ reportResult);
	       reportFile = reportFile.getOutput();
	       return reportFile
       } else {
       		logMessage("Unable to run report: "+ reportName + " for Admin" + systemUserObj);
       		return false;
       }
    } else {
         logMessage("No permission to report: "+ reportName + " for Admin" + systemUserObj);
         return false;
    }
}
function wwmWorkflowAdditionalInfo(reportName, reportParamRecID)
{
	var emailParams = aa.util.newHashtable();
	var reportParams = aa.util.newHashtable();
	var reportFile = new Array();
	var conArray = getContactArray();
	var conEmail = "";
    var fromEmail = "";
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();

		reportParams.put(reportParamRecID, alternateID.toString());

		rFile = generateReport(reportName,reportParams, appTypeArray[0])
        logDebug("This is the rFile: " + rFile);           
        
            if (rFile) {
            reportFile.push(rFile);
            }


	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
	for (con in conArray)
	{
		if (!matches(conArray[con].email, null, undefined, ""))
		{
			conEmail += conArray[con].email + "; ";
		}
	}
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
	for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			conEmail += lpArr[lp].getEmail() + "; ";
		}
	}
	getRecordParams4Notification(emailParams);
    getWorkflowParams4Notification(emailParams);
	logDebug("Test" + conEmail);
	
	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	logDebug("If this is showing up, you're a winner!");
    addParameter(emailParams, "$$altID$$", capId.getCustomID());
	if (conEmail != null)
	{
		sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
	}
}
function wwmWorkflowAdditionalInfoWithPin(reportName, reportNameAttachToRecord, reportParamRecID)
{	
	var conEmail = "";
    var fromEmail = "";
    var shortNotes = getShortNotes(capId);
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();
    saveToRecord = true;
    var thisReport = "";

	var capContResult = aa.people.getCapContactByCapID(capId);

	if (capContResult.getSuccess()) {
		conArray = capContResult.getOutput();
	} else {
		retVal = false;
	}

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
    }
    
    var emailArray = new Array();
    var emailAddressArray = new Array();
    var pinSentList = AInfo["Local Contact Numbers Sent"];
    var pinSentRefArray ="";
    if (pinSentList != null)
    {
      pinSentRefArray = pinSentList.toString().split(",");
    }

	for (con in conArray)
	{				
		cont = conArray[con];				
		peop = cont.getPeople();
       
        logDebug("Email: " + peop.getEmail());      
        logDebug("Audit Status: " + peop.getAuditStatus());      
        var hasPublicUser = false;
        var emailSent = false;
		if (peop.getAuditStatus() != "I") 
        {        
			if (!matches(peop.getEmail(), null, undefined, ""))
			{				
                contactType = conArray[con].getCapContactModel().getPeople().getContactType();
                logDebug("Contact: " + contactType);              
                if (contactType== "Agent" || contactType == "Applicant" || contactType== "Designer" || contactType == "Property Owner")
                {

                    // Check to see if the users have public account linkage already.
                    var refSeqNumber  = conArray[con].getCapContactModel().getRefContactNumber();
                    
                    if (!refSeqNumber)
                    {
                        logDebug("Check null for Reference sequence number: " + refSeqNumber);
                    }
                    else
                    {
                        logDebug("Reference sequence number Test: " + aa.util.parseLong(refSeqNumber));     
                    }
                    
                    logDebug("Custom field ACA PIN Sent: " + AInfo["Pin Sent"]);      
                       
                    var found = false;

                    if (refSeqNumber)
                    {
                        for (num in emailArray)
                        {
                            if (emailArray[num] == refSeqNumber)
                            {
                                found = true;
                                logDebug("Found: " + refSeqNumber + " in the array.");
                            }
                        }
                    }
                    // Did we already send email to the same reference contact? 
                    // We only want to send if we have not already done so
                  // Add this later to check for custom field: if (AInfo["Pin Sent"] != "Yes")
                    if (!found)
                    {
                        if (refSeqNumber)
                        {
                            emailArray.push(refSeqNumber);
                            logDebug("Push email array in: " + refSeqNumber + "Length" + emailArray.length);

                            logDebug("Email Array does not have existing ref contact ID: " + refSeqNumber);      

                            var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(refSeqNumber));

                            //var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
                            //if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                            //var userModel = getUserResult.getOutput();

                            // Check to see if the contact has public user associated with it already.
                            if (s_publicUserResult.getSuccess()) {
                                var fpublicUsers = s_publicUserResult.getOutput();
                                if (fpublicUsers == null || fpublicUsers.size() == 0) 
                                {
                                    hasPublicUser = false;
                                
                                } 
                                else 
                                {
                                    hasPublicUser = true;
                                    logDebug("The contact("+refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                                
                                }
                            } 
                            else { 
                                hasPublicUser = false;
                                logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage());
                        
                            }
                        }   

                        // Check to see if we sent the PIN previously in the workflow history
                        var localContactSeqNumber = peop.contactSeqNumber;
                        var workflowHistoryPinSent = false;
                        
                        for (sent in pinSentRefArray)
                        {
                            if (pinSentRefArray[sent] == localContactSeqNumber)
                            {
                                workflowHistoryPinSent = true;
                                logDebug(localContactSeqNumber + "has received PIN letter previously in the workflow history.");
                                logDebug("We are not attaching PIN letter again to: " + localContactSeqNumber);
                            }
                        }
                        //pubusers = aa.publicUser.getPublicUserListByLicenseSeqNBR(licenseNumber).getOutput().toArray();

                        var emailParams = aa.util.newHashtable();	
                        var reportParams = aa.util.newHashtable();
                        var reportFile = new Array();	
                        reportParams.put(reportParamRecID, alternateID.toString());
                        
                        if (saveToRecord)
                        {
                            thisReport = reportNameAttachToRecord;
                            logDebug("This is the report will save to record: " + thisReport);
                        }
                        else
                        {
                            thisReport = reportName;
                            logDebug("This is the report that should not be saved: " + thisReport);
                        }

                        
                        saveToRecord = false;
                        
                        // No public user linkage, send also the ACA Pin instruction letter
                        if (!hasPublicUser && workflowHistoryPinSent == false)  
                        {
                            if (refSeqNumber)
                            {
                                logDebug("Couldn't find public user ref contact ID" + refSeqNumber + ". We never sent ACA letter neither.") ;
                            }       
                            // PIN report with record id and contact type as params                
                            var reportParams1 = aa.util.newHashtable();
                            reportParams1.put("RecordID", alternateID.toString());
                            reportParams1.put("ContactType", contactType);
                            // Local contact ID
                            localCId = conArray[con].getCapContactModel().getPeople().getContactSeqNumber();			
                            reportParams1.put("ContactID", localCId);
                        
                            // NOI report - from reportParams in the earlier loop.
                            logDebug(thisReport + ": params are: " + reportParamRecID + ", " + alternateID.toString());
                            rFile = generateReport(thisReport,reportParams, appTypeArray[0])
                            logDebug("This is the NOI report: " + rFile);           
                            
                            if (rFile) {
                            reportFile.push(rFile);
                            }
                            // ACA PIN - from reportParams1 above.      
                            rFile = generateReport("ACA Registration Pins-WWM",reportParams1, appTypeArray[0])
                            
                            logDebug("This is the ACA Pin File we are emailing: " + rFile);           
                        
                            if (rFile) {
                                reportFile.push(rFile);
                            }

                            getRecordParams4Notification(emailParams);
                            getWorkflowParams4Notification(emailParams);
                            logDebug("Email:" + peop.getEmail());                       
                            addParameter(emailParams, "$$altID$$", capId.getCustomID());
                            addParameter(emailParams, "$$shortNotes$$", shortNotes);

                            conEmail = peop.getEmail();
                            if (conEmail != null)
                            {
                                logDebug("emailAddressArray.length:" + emailAddressArray.length);

                                // Add email to the array so we do not send duplicate email.
                                for (x in emailAddressArray)
                                {
                                    logDebug("Checking peop.getEmail(): " + peop.getEmail());
                                    logDebug("Checking emailAddressArray[x]: " + emailAddressArray[x]);

                                    if (matches(emailAddressArray[x], peop.getEmail()))
                                    {
                                        emailSent = true;
                                        logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }

                                    if (emailAddressArray[x] == peop.getEmail())
                                    {
                                        emailSent = true;
                                        logDebug("Matched: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }
                                }                  
                                logDebug("emailSent: " + emailSent);                                

                                if (!emailSent)
                                {
                                    sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY_WITH_ACA_PIN", emailParams, reportFile);
                                    emailAddressArray.push(peop.getEmail());
                                    logDebug("Push email: " + peop.getEmail() + " to emailAddressArray.");
                                }
                                editAppSpecific("Pin Sent", "Yes");
                                // Append the ref conference in the list.
                                var tempList = AInfo["Local Contact Numbers Sent"];
                                var tempListArray = "";
                                if (tempList != null)
                                {
                                  tempListArray = tempList.toString().split(",");
                                }
                                logDebug("Custom Field Local Contact Numbers Sent value: " + tempList);         
                                logDebug("Number of entries in Local Contact Numbers Sent Sent:" + tempListArray.length);         
                               
                                if (tempList == null || tempListArray.length == 0)
                                {
                                    editAppSpecific("Local Contact Numbers Sent", localContactSeqNumber);
                                    logDebug("Update custom Field Local Contact Numbers Sent to: " + localContactSeqNumber);         
                                }
                                else   // Append comma
                                {
                                    appendSeqNumber = tempList + "," + localContactSeqNumber;
                                    editAppSpecific("Local Contact Numbers Sent", appendSeqNumber);
                                    logDebug("Update custom Field Local Contact Numbers Sent to: " + appendSeqNumber);         
                                }
                            }
                        }
                        else 
                        {                                                   
                            conEmail = peop.getEmail();                                                                 
                            getRecordParams4Notification(emailParams);
                            getWorkflowParams4Notification(emailParams);                         
            
                            logDebug("Send standard report to contact without the PIN Letter: " + conEmail);
                            addParameter(emailParams, "$$altID$$", capId.getCustomID());
                            addParameter(emailParams, "$$shortNotes$$", shortNotes);
                            if (conEmail != null)
                            {
                                logDebug("emailAddressArray.length:" + emailAddressArray.length);
                              
                                for (x in emailAddressArray)
                                {
                                    logDebug("Checking emailAddressArray: " + peop.getEmail());
                                    logDebug("Checking emailAddressArray[x]: " + emailAddressArray[x]);

                                    if (matches(emailAddressArray[x], peop.getEmail()))
                                    {
                                        emailSent = true;
                                        logDebug("Found: " + peop.getEmail() + " in the array. Skip sending email.");
                                    }
                                    if (emailAddressArray[x] == peop.getEmail())
                                    {
                                        emailSent = true;
                                        logDebug("Matched: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }
                                }

                                logDebug("emailSent: " + emailSent);          

                                if (!emailSent)
                                {
                                      // NOI report
                                    rFile = generateReport(thisReport,reportParams, appTypeArray[0])
                                    logDebug("This is the NOI report: " + rFile);           

                                    if (rFile) {
                                    reportFile.push(rFile);
                                    }
                                    sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
                                    emailAddressArray.push(peop.getEmail());                                  
                                    logDebug("Push email: " + peop.getEmail() + " to emailAddressArray.");
                                }
                            }
                        }
                    }
                    else
                    {
                        if (refSeqNumber)
                        {
                            logDebug("Same Email address has been found in the contacts for: " + refSeqNumber + ". Skip sending to the same email address.");     
                        }
                    }
                }                             		
            
            }
        }		
    }
       

    var lpEmail = "";
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
    
    for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			lpEmail += lpArr[lp].getEmail() + "; ";
		}
    }
    
    var lpEmailParams = aa.util.newHashtable();	
    var lpReportParams = aa.util.newHashtable();
    var lpReportFile = new Array();	
    lpReportParams.put(reportParamRecID, alternateID.toString());
    // NOI report
    rFile = generateReport(reportName,lpReportParams, appTypeArray[0])
    logDebug("This is the rFile: " + rFile);           
    
    if (rFile) {
        lpReportFile.push(rFile);
    }

	getRecordParams4Notification(lpEmailParams);
    getWorkflowParams4Notification(lpEmailParams);
	logDebug("Emails" + lpEmail);	
	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	logDebug("If this is showing up, you're a winner!");
    addParameter(lpEmailParams, "$$altID$$", capId.getCustomID());
    addParameter(lpEmailParams, "$$shortNotes$$", shortNotes);
	if (lpEmail != null)
	{
		sendNotification("", lpEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", lpEmailParams, lpReportFile);
	}
}


function wwmWorkflowNOIwithPin(reportName, reportNameAttachToRecord, reportParamArray)
{	
	var conEmail = "";
    var fromEmail = "";
    var shortNotes = getShortNotes(capId);
	var itemCap = aa.cap.getCap(capId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");
    var alternateID = capId.getCustomID();
    saveToRecord = true;
    var thisReport = "";

	var capContResult = aa.people.getCapContactByCapID(capId);

	if (capContResult.getSuccess()) {
		conArray = capContResult.getOutput();
	} else {
		retVal = false;
	}

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
    }
    
    var emailArray = new Array();
    var emailAddressArray = new Array();
    var pinSentList = AInfo["Local Contact Numbers Sent"];
    var pinSentRefArray ="";
    if (pinSentList != null)
    {
      pinSentRefArray = pinSentList.toString().split(",");
    }

	for (con in conArray)
	{				
		cont = conArray[con];				
		peop = cont.getPeople();
       
        logDebug("Email: " + peop.getEmail());      
        logDebug("Audit Status: " + peop.getAuditStatus());      
        var hasPublicUser = false;
        var emailSent = false;
		if (peop.getAuditStatus() != "I") 
        {        
			if (!matches(peop.getEmail(), null, undefined, ""))
			{				
                contactType = conArray[con].getCapContactModel().getPeople().getContactType();
                logDebug("Contact: " + contactType);              
                if (contactType== "Agent" || contactType == "Applicant" || contactType== "Designer" || contactType == "Property Owner")
                {

                    // Check to see if the users have public account linkage already.
                    var refSeqNumber  = conArray[con].getCapContactModel().getRefContactNumber();
                    
                    if (!refSeqNumber)
                    {
                        logDebug("Check null for Reference sequence number: " + refSeqNumber);
                    }
                    else
                    {
                        logDebug("Reference sequence number Test: " + aa.util.parseLong(refSeqNumber));     
                    }
                    
                    logDebug("Custom field ACA PIN Sent: " + AInfo["Pin Sent"]);      
                       
                    var found = false;

                    if (refSeqNumber)
                    {
                        for (num in emailArray)
                        {
                            if (emailArray[num] == refSeqNumber)
                            {
                                found = true;
                                logDebug("Found: " + refSeqNumber + " in the array.");
                            }
                        }
                    }
                    // Did we already send email to the same reference contact? 
                    // We only want to send if we have not already done so
                  // Add this later to check for custom field: if (AInfo["Pin Sent"] != "Yes")
                    if (!found)
                    {
                        if (refSeqNumber)
                        {
                            emailArray.push(refSeqNumber);
                            logDebug("Push email array in: " + refSeqNumber + "Length" + emailArray.length);

                            logDebug("Email Array does not have existing ref contact ID: " + refSeqNumber);      

                            var s_publicUserResult = aa.publicUser.getPublicUserListByContactNBR(aa.util.parseLong(refSeqNumber));

                            //var getUserResult = aa.publicUser.getPublicUserByEmail(con.getEmail())
                            //if (getUserResult.getSuccess() && getUserResult.getOutput()) {
                            //var userModel = getUserResult.getOutput();

                            // Check to see if the contact has public user associated with it already.
                            if (s_publicUserResult.getSuccess()) {
                                var fpublicUsers = s_publicUserResult.getOutput();
                                if (fpublicUsers == null || fpublicUsers.size() == 0) 
                                {
                                    hasPublicUser = false;
                                
                                } 
                                else 
                                {
                                    hasPublicUser = true;
                                    logDebug("The contact("+refSeqNumber+") is associated with "+fpublicUsers.size()+" public users.");
                                
                                }
                            } 
                            else { 
                                hasPublicUser = false;
                                logMessage("**ERROR: Failed to get public user by contact number: " + s_publicUserResult.getErrorMessage());
                        
                            }
                        }   

                        // Check to see if we sent the PIN previously in the workflow history
                        var localContactSeqNumber = peop.contactSeqNumber;
                        var workflowHistoryPinSent = false;
                        
                        for (sent in pinSentRefArray)
                        {
                            if (pinSentRefArray[sent] == localContactSeqNumber)
                            {
                                workflowHistoryPinSent = true;
                                logDebug(localContactSeqNumber + "has received PIN letter previously in the workflow history.");
                                logDebug("We are not attaching PIN letter again to: " + localContactSeqNumber);
                            }
                        }
                        //pubusers = aa.publicUser.getPublicUserListByLicenseSeqNBR(licenseNumber).getOutput().toArray();

                        var emailParams = aa.util.newHashtable();	
                        //var reportParams = aa.util.newHashtable();
                        var reportFile = new Array();	
                        //reportParams.put("RecordID", alternateID.toString());
                        
                        if (saveToRecord)
                        {
                            thisReport = reportNameAttachToRecord;
                            logDebug("This is the report will save to record: " + thisReport);
                        }
                        else
                        {
                            thisReport = reportName;
                            logDebug("This is the report that should not be saved: " + thisReport);
                        }

                        
                        saveToRecord = false;
                        
                        // No public user linkage, send also the ACA Pin instruction letter
                        if (!hasPublicUser && workflowHistoryPinSent == false)  
                        {
                            if (refSeqNumber)
                            {
                                logDebug("Couldn't find public user ref contact ID" + refSeqNumber + ". We never sent ACA letter neither.") ;
                            }       
                            // PIN report with record id and contact type as params                
                            var reportParams1 = aa.util.newHashtable();
                            reportParams1.put("RecordID", alternateID.toString());
                            reportParams1.put("ContactType", contactType);
                            // Local contact ID
                            localCId = conArray[con].getCapContactModel().getPeople().getContactSeqNumber();			
                            reportParams1.put("ContactID", localCId);
                        
                            // NOI report - from reportParams in the earlier loop.                           
                            rFile = generateReport(thisReport, reportParamArray, appTypeArray[0])
                            logDebug("This is the NOI report: " + rFile);           
                            
                            if (rFile) {
                            reportFile.push(rFile);
                            }
                            // ACA PIN - from reportParams1 above.      
                            rFile = generateReport("ACA Registration Pins-WWM",reportParams1, appTypeArray[0])
                            
                            logDebug("This is the ACA Pin File we are emailing: " + rFile);           
                        
                            if (rFile) {
                                reportFile.push(rFile);
                            }

                            getRecordParams4Notification(emailParams);
                            getWorkflowParams4Notification(emailParams);
                            logDebug("Email:" + peop.getEmail());                       
                            addParameter(emailParams, "$$altID$$", capId.getCustomID());
                            addParameter(emailParams, "$$shortNotes$$", shortNotes);

                            conEmail = peop.getEmail();
                            if (conEmail != null)
                            {
                                logDebug("emailAddressArray.length:" + emailAddressArray.length);

                                // Add email to the array so we do not send duplicate email.
                                for (x in emailAddressArray)
                                {
                                    logDebug("Checking peop.getEmail(): " + peop.getEmail());
                                    logDebug("Checking emailAddressArray[x]: " + emailAddressArray[x]);

                                    if (matches(emailAddressArray[x], peop.getEmail()))
                                    {
                                        emailSent = true;
                                        logDebug("Found: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }

                                    if (emailAddressArray[x] == peop.getEmail())
                                    {
                                        emailSent = true;
                                        logDebug("Matched: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }
                                }                  
                                logDebug("emailSent: " + emailSent);                                

                                if (!emailSent)
                                {
                                    sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY_WITH_ACA_PIN", emailParams, reportFile);
                                    emailAddressArray.push(peop.getEmail());
                                    logDebug("Push email: " + peop.getEmail() + " to emailAddressArray.");
                                }
                                editAppSpecific("Pin Sent", "Yes");
                                // Append the ref conference in the list.
                                var tempList = AInfo["Local Contact Numbers Sent"];
                                var tempListArray = "";
                                if (tempList != null)
                                {
                                  tempListArray = tempList.toString().split(",");
                                }
                                logDebug("Custom Field Local Contact Numbers Sent value: " + tempList);         
                                logDebug("Number of entries in Local Contact Numbers Sent Sent:" + tempListArray.length);         
                               
                                if (tempList == null || tempListArray.length == 0)
                                {
                                    editAppSpecific("Local Contact Numbers Sent", localContactSeqNumber);
                                    logDebug("Update custom Field Local Contact Numbers Sent to: " + localContactSeqNumber);         
                                }
                                else   // Append comma
                                {
                                    appendSeqNumber = tempList + "," + localContactSeqNumber;
                                    editAppSpecific("Local Contact Numbers Sent", appendSeqNumber);
                                    logDebug("Update custom Field Local Contact Numbers Sent to: " + appendSeqNumber);         
                                }
                            }
                        }
                        else 
                        {                                                   
                            conEmail = peop.getEmail();                                                                 
                            getRecordParams4Notification(emailParams);
                            getWorkflowParams4Notification(emailParams);                         
            
                            logDebug("Send standard report to contact without the PIN Letter: " + conEmail);
                            addParameter(emailParams, "$$altID$$", capId.getCustomID());
                            addParameter(emailParams, "$$shortNotes$$", shortNotes);
                            if (conEmail != null)
                            {
                                logDebug("emailAddressArray.length:" + emailAddressArray.length);
                              
                                for (x in emailAddressArray)
                                {
                                    logDebug("Checking emailAddressArray: " + peop.getEmail());
                                    logDebug("Checking emailAddressArray[x]: " + emailAddressArray[x]);

                                    if (matches(emailAddressArray[x], peop.getEmail()))
                                    {
                                        emailSent = true;
                                        logDebug("Found: " + peop.getEmail() + " in the array. Skip sending email.");
                                    }
                                    if (emailAddressArray[x] == peop.getEmail())
                                    {
                                        emailSent = true;
                                        logDebug("Matched: " + peop.getEmail() + " in the array. Not sending email again.");
                                    }
                                }

                                logDebug("emailSent: " + emailSent);          

                                if (!emailSent)
                                {
                                      // NOI report
                                    rFile = generateReport(thisReport, reportParamArray, appTypeArray[0])
                                    logDebug("This is the NOI report: " + rFile);           

                                    if (rFile) {
                                    reportFile.push(rFile);
                                    }
                                    sendNotification("", conEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", emailParams, reportFile);
                                    emailAddressArray.push(peop.getEmail());                                  
                                    logDebug("Push email: " + peop.getEmail() + " to emailAddressArray.");
                                }
                            }
                        }
                    }
                    else
                    {
                        if (refSeqNumber)
                        {
                            logDebug("Same Email address has been found in the contacts for: " + refSeqNumber + ". Skip sending to the same email address.");     
                        }
                    }
                }                             		
            
            }
        }		
    }
       
  // EHIMS-5041: Remove LP
    /*
    var lpEmail = "";
	var lpResult = aa.licenseScript.getLicenseProf(capId);
	if (lpResult.getSuccess())
	{ 
		var lpArr = lpResult.getOutput();  
	} 
	else 
	{ 
		logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
	}
    
    for (var lp in lpArr)
	{
		if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
		{
			lpEmail += lpArr[lp].getEmail() + "; ";
		}
    }
    
    var lpEmailParams = aa.util.newHashtable();	
    var lpReportParams = aa.util.newHashtable();
    var lpReportFile = new Array();	
    lpReportParams.put("RecordID", alternateID.toString());
    // NOI report
    rFile = generateReport(reportName,lpReportParams, appTypeArray[0])
    logDebug("This is the rFile: " + rFile);           
    
    if (rFile) {
        lpReportFile.push(rFile);
    }

	getRecordParams4Notification(lpEmailParams);
    getWorkflowParams4Notification(lpEmailParams);
	logDebug("Emails" + lpEmail);	
	//addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
	logDebug("If this is showing up, you're a winner!");
    addParameter(lpEmailParams, "$$altID$$", capId.getCustomID());
    addParameter(lpEmailParams, "$$shortNotes$$", shortNotes);
	if (lpEmail != null)
	{
		sendNotification("", lpEmail, "", "DEQ_WWM_AWAITING CLIENT REPLY", lpEmailParams, lpReportFile);
	}
*/
}


function addBStructure(vCapId,structNo,structType,structName,structDesc){
    var added = aa.bStructure.addStructure(vCapId, structNo, structType, structName, structDesc, "", aa.date.getCurrentDate());
    if (added.getSuccess()) {
        logDebug("BStructure Added Successfully");
        return true;
    } else {
        logDebug("BStructure Added ERROR: " + added.getErrorMessage());
        return false;
    }
}
function addRefContactToRecord(refNum, cType, vcapId) {
	itemCap = vcapId;
	var refConResult = aa.people.getPeople(refNum);
	if (refConResult.getSuccess()) {
		var refPeopleModel = refConResult.getOutput();
		if (refPeopleModel != null) {
			pm = refPeopleModel;
			pm.setContactType(cType);
			pm.setFlag("N");
			pm.setContactAddressList(getRefAddContactList(refNum));
			
			var result = aa.people.createCapContactWithRefPeopleModel(itemCap, pm);
			if (result.getSuccess()) {
				logDebug("Successfully added the contact");
			}	
			else {
				logDebug("Error creating the applicant " + result.getErrorMessage());
			}
		}
	}
}

function AllowTimeSheetAdjustment(vDateLogged,vLoggedBy){
    var flagPreventSubmittal = false;
    //figure out what week today is in
    var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var currentTSDate = new Date(vDateLogged)
    var day = weekday[currentTSDate.getDay()];

    if(day == "Sunday"){
        TSSTartDate = currentTSDate
    }else if(day == "Monday"){
        TSSTartDate = dateAdd(currentTSDate,-1)
    }else if(day == "Tuesday"){
        TSSTartDate = dateAdd(currentTSDate,-2)
    }else if(day == "Wednesday"){
        TSSTartDate = dateAdd(currentTSDate,-3)
    }else if(day == "Thursday"){
        TSSTartDate = dateAdd(currentTSDate,-4)
    }else if(day == "Friday"){
        TSSTartDate = dateAdd(currentTSDate,-5)
    }else if(day == "Saturday"){
        TSSTartDate = dateAdd(currentTSDate,-6)
    }
    logDebug("Looking for Timesheet Start Date of " + TSSTartDate);

    //Find Time sheet record associated to this USER and Timeframe
    var fromDate = aa.date.parseDate(TSSTartDate);
    var toDate = aa.date.parseDate(dateAdd(TSSTartDate,7));
    logDebug("**INFO checking For Date = " + aa.util.formatDate(convertDate(fromDate), "MM/dd/YYYY") + " to date "  + aa.util.formatDate(convertDate(toDate), "MM/dd/YYYY"));
    var searchResult = aa.cap.getCapIDsByAppSpecificInfoDateRange("TIMESHEET INFORMATION", "Time Period Start Date", fromDate, toDate);
    if (searchResult.getSuccess()) {
        searchResultArray = searchResult.getOutput();
    }
    for ( var s in searchResultArray) {
        var timesheetCapId = searchResultArray[s];
        timesheetCapId = timesheetCapId.getCapID();
        var thisCap = aa.cap.getCap(timesheetCapId).getOutput();
        if(getAppSpecific("Employee Name",timesheetCapId) == vLoggedBy){
            //Found Timesheet
            logDebug("Record " + timesheetCapId.getCustomID() + " found for " + vLoggedBy + " for Date Range " + aa.util.formatDate(convertDate(fromDate), "MM/dd/YYYY") + " to date "  + aa.util.formatDate(convertDate(toDate), "MM/dd/YYYY"))
            var timesheetCap = aa.cap.getCap(timesheetCapId).getOutput();
            timesheetCapStatus = timesheetCap.getCapStatus();
            if(!matches(timesheetCapStatus,"Timesheet Rejected",null)){
                flagPreventSubmittal = true;
                showMessage = true;
                var timeStart = getAppSpecific("Time Period Start Date",timesheetCapId)
                var timeEnd = getAppSpecific("Time Period End Date",timesheetCapId)
                comment("<B><Font Color='RED'>WARNING: A timesheet " + timesheetCapId.getCustomID() + " with a status of " + timesheetCapStatus + " has been found for the time period " + timeStart + " to " + timeEnd + " and cannot be altered</Font></B>")
            }
        }
    }
    return flagPreventSubmittal;
}
function assignWfTask(wfstr, username, vCapId) {
    var processName = "";

    var taskUserResult = aa.person.getUser(username);
    if (taskUserResult.getSuccess()) {
        taskUserObj = taskUserResult.getOutput()
    } else {
        logMessage("**ERROR: Failed to get user object: " + taskUserResult.getErrorMessage());
        return false
    }
    var workflowResult = aa.workflow.getTaskItems(vCapId, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess()) {
        var wfObj = workflowResult.getOutput()
    } else {
        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false
    }
    for (i in wfObj) {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) {
            fTask.setAssignedUser(taskUserObj);
            var taskItem = fTask.getTaskItem();
            var adjustResult = aa.workflow.assignTask(taskItem);
            logMessage("Assigned Workflow Task: " + wfstr + " to " + username);
            logDebug("Assigned Workflow Task: " + wfstr + " to " + username)
        }
    }
}
function batchInvoicePermits()
{
    var billingParamRec = capId;
    if (arguments.length > 0)
        billingParamRec = arguments[0];

    var setName = billingParamRec.getCustomID();
    var set = new capSet(setName, setName, "Billing");
    for (var x in set.members)
    {
        var thisCapId = aa.cap.getCapID(set.members[x].getID1(), set.members[x].getID2(), set.members[x].getID3()).getOutput();
        if (appMatch("Administration/Billing/Parameters/NA", thisCapId))
            continue;
        aa.print("Processing " + thisCapId.getCustomID());
        invoiceAllFees4BillingParamRec(thisCapId);
        var thisFacilityRec = getParent(thisCapId);
        var appliedDate = getAppSpecific("Applied Date", billingParamRec) || "";
        var updateResult = true;
        if (!isBlank(appliedDate))
            updateResult = _updateInvoiceDate(appliedDate);
        if (!updateResult)
            continue;
        var sendEmail = getAppSpecific("Send Email", billingParamRec);
        var emailToArray = getContactsEmailArray(["Accounts Receivable"], thisFacilityRec);
        var emailToString = "";
        for (var x in emailToArray)
            emailToString += emailToArray[x] + ";";
        if ("CHECKED".equals(sendEmail) && thisFacilityRec && !isBlank(emailToString))
        {
            var reportParameters = aa.util.newHashMap();
            reportParameters.put("RECORD_ID", String(thisFacilityRec.getCustomID()));
            var files = new Array();
            var file = generateReport(thisFacilityRec, "EH_CONSOLIDATED_BILLING_REPORT_EMAIL", "ENVHEALTH", reportParameters);
            files.push(file);
            var emailParams = aa.util.newHashMap();
            var templateName = "EH_BILLING_NOTIFICATION";
            sendNotification("", emailToString, "", templateName, emailParams, files, thisFacilityRec);
        }
        else if (thisFacilityRec)
        {
            var reportParameters = aa.util.newHashMap();
            reportParameters.put("RECORD_ID", String(thisFacilityRec.getCustomID()));
            var file = generateReport(thisFacilityRec, "EH_CONSOLIDATED_BILLING_REPORT_PRINT", "ENVHEALTH", reportParameters);
        }
    }

    resultWorkflowTask("Invoice Processing", "Billing Complete", "", "", null, billingParamRec);
    var taskAssignedTo = getUserAssignedToTask(billingParamRec, "Invoice Processing");
    if (taskAssignedTo && !isBlank(taskAssignedTo.getEmail()))
    {
        var template = "EH_BILLING_TASK_UPDATE";
        var params = aa.util.newHashtable();
        addParameter(params, "$$taskName$$", "Renewal Set Processing");
        addParameter(params, "$$taskStatus$$", "Set Review in Progress");
        sendNotification("", taskAssignedTo.getEmail(), "", template, params, new Array());
    }

    var newBillingCapId = createCap("Administration/Billing/Parameters/NA", "");

    function _updateInvoiceDate(invoiceDateString)
    {
        var capInvoices = aa.finance.getInvoiceByCapID(thisCapId, null).getOutput() || new Array();
        if (capInvoices.length == 0)
        {
            logDebug(thisCapId.getCustomID() +": has no invoices");
            return false;
        }
        capInvoices.sort(sortInvoices);
        capInvoices[0].getInvoiceModel().setInvDate(new Date(invoiceDateString));
        var result = aa.invoice.editInvoice(thisCapId, capInvoices[0].getInvoiceModel());
        if (result.getSuccess())
            logDebug(thisCapId.getCustomID() + ": Updated invoice date successfully");
        else
            logDebug(thisCapId.getCustomID() + ": Problem updating invoice date " + result.getErrorMessage());
        function sortInvoices(a, b)
        {
            return b.getInvoiceModel().getInvNbr() - a.getInvoiceModel().getInvNbr();
        }
    }
}
function capExistsInSet(setId, altId)
{
    var capIdResult = new capSet(setId);
    var alreadyExists = false;
    var capIds = capIdResult.members;
    for (thisCap in capIds) {
        if (altId.toString() == capIds[thisCap].toString()) {
            alreadyExists = true;
            break;
        }
    }
    return alreadyExists;
}
function copyASIBySubGroup(sourceCapId, targetCapId, vSubGroupName) {
	useAppSpecificGroupName = true;
    var sAInfo = new Array;
    loadAppSpecific(sAInfo, sourceCapId);
    for (var asi in sAInfo) {
		if( asi.substr(0,asi.indexOf(".")) == vSubGroupName){
			editAppSpecific(asi, sAInfo[asi], targetCapId);
		}
    }
	useAppSpecificGroupName = false;
}

function copyOwner(sCapID, tCapID) {
    var ownrReq = aa.owner.getOwnerByCapId(sCapID);
    if (ownrReq.getSuccess()) {
        var ownrObj = ownrReq.getOutput();
        if (ownrObj.length >= 1) {
            for (xx in ownrObj) {
                ownrObj[xx].setCapID(tCapID);
                aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
                logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName());
            }
        } else {
            logDebug("Warning: No owners exist to copy");
        }
    } else {
        logDebug("Error Copying Owner : " + ownrObj.getErrorType() + " : " + ownrObj.getErrorMessage());
    }
}

function countRecordContactsByType(vContactType,vCapId){
	var cntTypeCnt = 0;
	var capContactResult = aa.people.getCapContactByCapID(vCapId);
	if (capContactResult.getSuccess()){
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts){
			var thisContact = Contacts[yy].getCapContactModel();
			if(thisContact.getContactType() == vContactType) {
				cntTypeCnt++
			}
		}
	}
	return cntTypeCnt
}
function createASITRow(recordList,resArray)
{
    var vRow = new Array();
    vRow["Time Accounting Group"] = new asiTableValObj("Time Accounting Group", recordList.get('TIME_GROUP_NAME')+"", "N");
    vRow["Time Accounting Type"] = new asiTableValObj("Time Accounting Type", recordList.get('TIME_TYPE_NAME')+"", "N");
    var logDate = recordList.get('LOG_DATE');
    logDate = aa.util.formatDate(logDate, "MM/dd/YYYY");
    vRow["Date Logged"] = new asiTableValObj("Date Logged", logDate+"", "N");

    var timeElapsedHHMMSS = recordList.get('TIME_ELAPSED');
    timeElapsedHHMMSS = aa.util.formatDate(timeElapsedHHMMSS, "hh:mm:ss");
    vRow["Time Elapsed"] = new asiTableValObj("Time Elapsed", timeElapsedHHMMSS+"", "N");

    var id1 = recordList.get('B1_PER_ID1');
    if(id1 == 'N/A')
    {
        vRow["Reference Record"] = new asiTableValObj("Reference Record", "N/A", "N");
    }
    else
    {
        var id2 = recordList.get('B1_PER_ID2');
        var id3 = recordList.get('B1_PER_ID3');
        var vCapID = aa.cap.getCapID(String(id1),String(id2),String(id3)).getOutput();
        vRow["Reference Record"] = new asiTableValObj("Reference Record", vCapID.getCustomID()+"", "N");
    }

    var bFlag = recordList.get('BILLABLE_FLAG');
    vRow["Billable"] = new asiTableValObj("Billable", bFlag, "N");
    vRow["Reject"] = new asiTableValObj("Reject", " ", "N");
    vRow["Reject Reason"] = new asiTableValObj("Reject Reason", " ", "N");
    vRow["Reject Date"] = new asiTableValObj("Reject Date", " ", "N");
    vRow["Time Accounting Entry ID"] = new asiTableValObj("Time Accounting Entry ID", recordList.get('TIME_LOG_SEQ')+"", "N");
    resArray.push(vRow);
}
function createTrustAccountAndLink(acctID, desc, overdraft, ledger, threshold, primary, user, vCapId) {
    // Creates a new trust account
    // acctID (int) - new account ID
    // desc (string) - account description
    // overdraft (double) - overdraft limit for the account (0 if none)
    // ledger (string) - GL account for the trust acount
    // threshold (double) - Amount when a low balance notice may be triggered
    // primary (String Y or N)
    // user (string) - the user ID to log the account creation transaction (typically the current user)
	var jDate = new java.util.Date();
	//create a trust account model
	var taModel = aa.trustAccount.createTrustAccountScriptModel().getTrustAccountModel();
	taModel.setAcctID(acctID);
	taModel.setAcctBalance(0);
	taModel.setAcctStatus("Active");
	taModel.setRecDate(jDate);
	taModel.setRecFulName(user);
	taModel.setRecStatus("A");
	taModel.setServProvCode(aa.getServiceProviderCode());
	taModel.setDescription(desc);
	taModel.setLedgerAccount(ledger);
	taModel.setThresholdAmount(threshold);
	//Set overdraft options
	if (overdraft > 0) {
		taModel.setOverdraftLimit(overdraft);
		taModel.setOverdraft("Y");
	} else {
		taModel.setOverdraftLimit(0);
		taModel.setOverdraft("N");
	}
	//commit the model
	var res = aa.trustAccount.createTrustAccount(taModel);
	if (res.getSuccess()) {
		var accSeq = aa.trustAccount.getTrustAccountByAccountID(acctID, aa.getServiceProviderCode()).getOutput().getAcctSeq();
        var tbiz = aa.proxyInvoker.newInstance("com.accela.aa.finance.trustAccount.TrustAccountBusiness").getOutput();
        tbiz.createTrustAccountCapRelationShip(vCapId,taModel,"Yes");
        if(matches(primary.toUpperCase(),"Y","YES")){
            tbiz.updatePrimaryTrustAccountForCap(vCapId,taModel.getAcctSeq(),"Y");
        }
        return accSeq
	} else {
		return false;
	}
}
// This is a modified loadASITable 
// that only returns true or false 
// depending on whether rows are found

function doASITRowsExist(tName){
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();

	while (tai.hasNext()){
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      if (!tn.equals(tName)) continue;

	  if(tsm.rowIndex.isEmpty()){
			return false;
		}else{
			return true;
		}
	}
}

function editAppSpecific(itemName, itemValue) {
    var itemCap = capId;
    var itemGroup = null;
    if (arguments.length == 3) {
        itemCap = arguments[2];
    }
    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0) {
            logDebug("**WARNING: (editAppSpecific) requires group name prefix when useAppSpecificGroupName is true");
            return false;
        }
        itemGroup = itemName.substr(0, itemName.indexOf("."));
        itemName = itemName.substr(itemName.indexOf(".") + 1);
    }
    var asiFieldResult = aa.appSpecificInfo.getByList(itemCap, itemName);
    if (asiFieldResult.getSuccess()) {
        var asiFieldArray = asiFieldResult.getOutput();
        if (asiFieldArray.length > 0) {
            var asiField = asiFieldArray[0];
            if (asiField) {
                var origAsiValue = asiField.getChecklistComment();
                asiField.setChecklistComment(itemValue);
                var updateFieldResult = aa.appSpecificInfo.editAppSpecInfoValue(asiField);
                if (updateFieldResult.getSuccess()) {
                    logDebug("Successfully updated custom field: " + itemName + " with value: " + itemValue);
                    if (arguments.length < 3) {
                        AInfo[itemName] = itemValue;
                    }
                } else {
                    logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");
                }
            } else {
                logDebug("WARNING: (editAppSpecific) " + itemName + " was not updated.");
            }
        }
    } else {
        logDebug("ERROR: (editAppSpecific) " + asiFieldResult.getErrorMessage());
    }
}

function editRecordStatus(targetCapId, strStatus){
    var capModel = aa.cap.getCap(targetCapId).getOutput();
    capModel.setCapStatus(strStatus);
    aa.cap.editCapByPK(capModel.getCapModel());
 }
function editSpecificASITableRow(tableCapId, tableName, keyName, keyValue, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (tableArr[r][keyName] != keyValue) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
         else {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function editSpecificASITableRow2Column(tableCapId, tableName, keyName1, keyValue1,keyName2, keyValue2, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (tableArr[r][keyName1] == keyValue1 && tableArr[r][keyName2] == keyValue2) {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }else{
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}

function editSpecificASITableRowforInteger(tableCapId, tableName, keyName, keyValue, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
         if (parseInt(tableArr[r][keyName]) != parseInt(keyValue)) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
         else {
            logDebug(" Editing row " + r);
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function editSpecificASITableRowforInteger2Column(tableCapId, tableName, keyName1, keyValue1,keyName2, keyValue2, editName, editValue) {
	// keyName and keyValue is the column name and column value you want to use to filter for records you want to update
	// editName and editValue are the new values
   var tableArr = loadASITable(tableName, tableCapId);
   var tssmResult = aa.appSpecificTableScript.removeAppSpecificTableInfos(tableName,tableCapId,"ADMIN");
   if (tableArr) {
      for (var r in tableArr) {
        if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1) && parseInt(tableArr[r][keyName2]) == parseInt(keyValue2)) {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               if (tableArr[r][col].columnName.toString() == editName) {
                  logDebug(" Editing row " + r + " updating " + tableArr[r][col].columnName.toString() + " to " + editValue);
                  var tVal = tableArr[r][col];
                  tVal.fieldValue = editValue;
               }
               else {
                  var tVal = tableArr[r][col];
               }
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         
         }else {
            var rowArr=new Array();
            var tempArr=new Array();
            for (var col in tableArr[r]) {
               var tVal = new asiTableValObj(tableArr[r][col].columnName, tableArr[r][col].fieldValue, tableArr[r][col].readOnly);
               var tVal = tableArr[r][col];
               //bizarre string conversion - just go with it
               var colName = new String(tableArr[r][col].columnName.toString());
               colName=colName.toString();
               tempArr[colName] = tVal;
            }
            rowArr.push(tempArr); 
            //for (var val in rowArr) for (var c in rowArr[val]) aa.print("Value " + c + ": " + rowArr[val][c]);
            addASITable(tableName,rowArr,tableCapId);
         }
      }
   }//end loop
}
function getAAUserEmail(userId){
    var email = aa.person.getUser(userId.toUpperCase()+"").getOutput().getEmail();
    logDebug("AA User email ID : "+email);
    return email;
}

function getACAUrl() {
    itemCap = (arguments.length == 1) ? arguments[0] : capId;
    var enableCustomWrapper = lookup("ACA_CONFIGS", "ENABLE_CUSTOMIZATION_PER_PAGE");
    var acaUrl = "";
    var id1 = itemCap.getID1();
    var id2 = itemCap.getID2();
    var id3 = itemCap.getID3();
    var itemCapModel = aa.cap.getCap(itemCap).getOutput().getCapModel();
    acaUrl += "/urlrouting.ashx?type=1000";
    acaUrl += "&Module=" + itemCapModel.getModuleName();
    acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
    acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
    if (matches(enableCustomWrapper, "Yes", "YES")) {
        acaUrl += "&FromACA=Y";
    }
    return acaUrl;
}

function getACAUrlWithCapId(vCapId){
	// returns the path to the record on ACA.  Needs to be appended to the site
	itemCap = vCapId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args
		var acaUrl = "";
	var id1 = capId.getID1();
	var id2 = capId.getID2();
	var id3 = capId.getID3();
	var cap = aa.cap.getCap(capId).getOutput().getCapModel();
	acaUrl += "/urlrouting.ashx?type=1000";
	acaUrl += "&Module=" + cap.getModuleName();
	acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
	return acaUrl;
}
function getActivityCustomFieldValue(capId,activityCustomFieldName,curActivityNumber){
	var activityBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.servicerequest.ActivityBusiness").getOutput();
	var ActivitySpecInfoBusiness = aa.proxyInvoker.newInstance("com.accela.aa.aamain.activityspecinfo.ActivitySpecInfoBusiness").getOutput();
	if(activityBusiness != null){
		var activityList = activityBusiness.getActivityListBySR(capId);
		if(!activityList) {
			logDebug("No activities on target record.");
			return false;
		}
		var lIt = activityList.iterator();
		while(lIt.hasNext()){
			var thisActivity = lIt.next();
			if(thisActivity.getActivityNumber() == parseInt(curActivityNumber)){
				var fieldsList = ActivitySpecInfoBusiness.getRefASIsByRefAcitivity(aa.getServiceProviderCode(),'RECORD',thisActivity.getActivityNumber());
				var fIt = fieldsList.iterator();
				while(fIt.hasNext()){
					var thisField = fIt.next();
					if(thisField.ASIName == activityCustomFieldName){
						return thisField.dispASIValue;
					}
				}
			}
		}
	}
}
function getAppName(capId){    
    capResult = aa.cap.getCap(capId);
    capModel = capResult.getOutput().getCapModel()
    var appName = capModel.getSpecialText();
    if(appName)
		return appName;
	else
		return false;
}
function getAppStatus()
{
    var itemCapId = capId;
    var capStatus = null;
    if (arguments.length == 1) itemCapId = arguments[0];

    var itemCap = aa.cap.getCap(itemCapId).getOutput();
    capStatus = itemCap.getCapStatus();

    return capStatus;
}
function getContactsEmailArray(contactTypeArray)
{
    var itemCap = capId;
    var result = new Array();
    if (!contactTypeArray)
        contactTypeArray = new Array();
    var getAll = (contactTypeArray.length == 0)
    if (arguments.length > 1)
        itemCap = arguments[1];
    var emailString = "";
    var contactArray = getPeople(itemCap);
    for (var c in contactArray)
    {
        if (!(contactArray[c].getPeople().getEmail() && contactArray[c].getPeople().getEmail().length() > 0))
            continue;
        if (getAll || exists(contactArray[c].getPeople().getContactType(), contactTypeArray))
        {
            result.push(contactArray[c].getPeople().getEmail());
        }
    }
    return result;
}
function getFacilityId(vCapId){
    var facilityId = null;
    facilityId = getParentByCapId(vCapId);
    if(!matches(facilityId,null,undefined,"")){
        if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
            return facilityId;
        }else{
            // If Parent isnt a Facility, try the Gradparent
            facilityId = getParentByCapId(facilityId);
            if(!matches(facilityId,null,undefined,"")){
                if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
                    return facilityId;
                }
            }
        }
    }
    return false;
}
function getGuideSheetFieldValue(gsCustomFieldItem,itemCap,inspIDNumArg,gsItemSeqNo) {
	itemCap = aa.cap.getCapID(itemCap.getID1(), itemCap.getID2(), itemCap.getID3()).getOutput();
	var r = aa.inspection.getInspections(itemCap);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
			var inspModel = inspArray[i].getInspection();
			if(inspModel.getIdNumber() == inspIDNumArg){
				var gs = inspModel.getGuideSheets();
				if (gs) {
					for (var i = 0; i < gs.size(); i++) {
						var guideSheetObj = gs.get(i);
						var guidesheetItem = guideSheetObj.getItems();
						for (var j = 0; j < guidesheetItem.size(); j++) {
							var item = guidesheetItem.get(j);
							if(item.guideItemSeqNbr == parseInt(gsItemSeqNo)){
								if (item.getItemASISubgroupList() != null) {
									var subGroupList = item.getItemASISubgroupList();
									if (subGroupList != null) {
										for (var index = 0; index < subGroupList.size(); index++) {
											var subGroupItem = subGroupList.get(index);
											if (subGroupItem != null) {
												var asiList = subGroupItem.getAsiList();
												for (var asiIndex = 0; asiIndex < asiList.size(); asiIndex++) {
													var asiItem = asiList.get(asiIndex);
													if (asiItem.getAsiName() == gsCustomFieldItem) {
														if (asiItem.getAttributeValue() != null && asiItem.getAttributeValue() != "") {
															return asiItem.getAttributeValue();
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return "";

}
function getParent()
{
    var itemCap = capId;
    if (arguments.length > 0)
        itemCap = arguments[0];

    getCapResult = aa.cap.getProjectParents(itemCap,1);
    if (getCapResult.getSuccess())
    {
        parentArray = getCapResult.getOutput();
        if (parentArray.length)
            return parentArray[0].getCapID();
        else
        {
            logDebug( "**WARNING: GetParent found no project parent for this application");
            return false;
        }
    }
    else
    {
        logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return false;
    }
}
function getPermitIDfromInspection(vFacilityID,inspIDNumArg){
    cldPmtAry = getChildren("EnvHealth/*/*/Permit",vFacilityID);
    for(x in cldPmtAry){
        var cldPmtCapId = cldPmtAry[x];
        var r = aa.inspection.getInspections(cldPmtCapId);
        if (r.getSuccess()) {
            var inspArray = r.getOutput();
            for (i in inspArray) {
                var inspModel = inspArray[i].getInspection();
                if(inspModel.getIdNumber() == inspIDNumArg){
                    return cldPmtCapId;
                }
            }
        }
    }
    return false;
 }
function getRefAddContactList(peoId){
	var conAdd = aa.proxyInvoker.newInstance("com.accela.orm.model.address.ContactAddressModel").getOutput();
	conAdd.setEntityID(parseInt(peoId));
	conAdd.setEntityType("CONTACT");
	var addList =  aa.address.getContactAddressList(conAdd).getOutput();
	var tmpList = aa.util.newArrayList();
	var pri = true;
	for(x in addList){
		if(pri){
			pri=false;
			addList[x].getContactAddressModel().setPrimary("Y"); 
		}
		tmpList.add(addList[x].getContactAddressModel());
	}
		
	return tmpList;
}

function getRefContactForPublicUser(userSeqNum) {
	contractorPeopleBiz = aa.proxyInvoker.newInstance("com.accela.pa.people.ContractorPeopleBusiness").getOutput();
	userList = aa.util.newArrayList();
	userList.add(userSeqNum);
	peopleList = contractorPeopleBiz.getContractorPeopleListByUserSeqNBR(aa.getServiceProviderCode(), userList); 
	if (peopleList != null) {
		peopleArray = peopleList.toArray();
		if (peopleArray.length > 0)
			return peopleArray[0];
	}
	return null;
}
function getRefGSItemComment(GSItem){
	var strReturn = null;
    var sql = "SELECT GUIDE_ITEM_COMMENT FROM RGUIDESHEET_ITEM WHERE GUIDE_ITEM_TEXT = '$$GuideItem$$' AND SERV_PROV_CODE = '$$servProvCode$$' AND REC_STATUS = 'A'";
    sql = sql.replace("$$GuideItem$$", GSItem).replace("$$servProvCode$$", aa.getServiceProviderCode());
    var r = aa.db.select(sql, new Array()).getOutput();
    var result = new Array();
    if (r.size() > 0){
        r = r.toArray();
        for (var x in r){
            var thisGuideComment = r[x].get("GUIDE_ITEM_COMMENT");
            result.push(thisGuideComment);
        }
    }
	if(result.length > 0){
		strReturn = result[0];
	}
	return strReturn;
}

function getStandardChoiceArray(stdChoice) {
    var cntItems = 0;
    var stdChoiceArray = new Array();
    var bizDomScriptResult = aa.bizDomain.getBizDomain(stdChoice);
    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        if (bizDomScriptObj != null) {
            cntItems = bizDomScriptObj.size();
            logDebug("getStdChoiceArray: " + stdChoice + " size = " + cntItems);
            if (cntItems > 0) {
                var bizDomScriptItr = bizDomScriptObj.iterator();
                while (bizDomScriptItr.hasNext()) {
                    var bizBomScriptItem = bizDomScriptItr.next();
                    var stdChoiceArrayItem = new Array();
                    stdChoiceArrayItem["value"] = bizBomScriptItem.getBizdomainValue();
                    stdChoiceArrayItem["valueDesc"] = bizBomScriptItem.getDescription();
                    stdChoiceArrayItem["active"] = bizBomScriptItem.getAuditStatus();
                    stdChoiceArray.push(stdChoiceArrayItem);
                }
            }
        } else {
            logDebug("getStdChoiceArray: WARNING stdChoice not found - " + stdChoice);
        }
    }
    return stdChoiceArray;
}

function getTaskSpecific(wfName, itemName) { // optional: itemCap
	var i = 0;
	itemCap = capId;
	if (arguments.length == 3) { // use cap ID specified in args
		itemCap = arguments[2];
	}
	var workflowResult = aa.workflow.getTasks(itemCap);
	if (workflowResult.getSuccess()) { // Get the workflows
		var wfObj = workflowResult.getOutput();
	} else {
		logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}
	for (i in wfObj) { // Loop through workflow tasks
		fTask = wfObj[i];
		stepnumber = fTask.getStepNumber();
		processID = fTask.getProcessID();
		if (wfName.equals(fTask.getTaskDescription())) { // Found the right Workflow Task
			TSIResult = aa.taskSpecificInfo.getTaskSpecifiInfoByDesc(itemCap, processID, stepnumber, itemName);
			if (TSIResult.getSuccess()) {
				var TSI = TSIResult.getOutput();
				if (TSI != null) {
					var TSIArray = new Array();
					TSInfoModel = TSI.getTaskSpecificInfoModel();
					var itemValue = TSInfoModel.getChecklistComment();
					return itemValue;
				} else
					logDebug("No task specific info field called " + itemName + " found for task " + wfName);
			} else {
				logDebug("**ERROR: Failed to get Task Specific Info objects: " + TSIResult.getErrorMessage());
				return false;
			}
		}
	}
}
function getTimeAccounting(userId, fromDate, toDate)
{
    var query = "";
    query += "SELECT * FROM T1_TIME_LOG T "
    query += "INNER JOIN R1_TIME_GROUP G ON "
    query += "T.TIME_GROUP_SEQ = G.TIME_GROUP_SEQ "
    query += "INNER JOIN R1_TIME_TYPES TYPE ON "
    query += "T.TIME_TYPE_SEQ = TYPE.TIME_TYPE_SEQ "
    query += "WHERE "
    query += "T.USER_NAME = '$$USERNAME$$' AND "
    query += "T.LOG_DATE >= TO_DATE('$$FROMDATE$$', 'MM/DD/YYYY') AND "
    query += "T.LOG_DATE <= TO_DATE('$$TODATE$$', 'MM/DD/YYYY') AND "
    query += "T.REC_STATUS = 'A' AND "
    query += "T.SERV_PROV_CODE = '$$SERVPROVCODE$$'"
    query = query.replace("$$USERNAME$$", userId).replace("$$FROMDATE$$", fromDate).replace("$$TODATE$$", toDate).replace("$$SERVPROVCODE$$", aa.getServiceProviderCode());

    var recordsResult = aa.db.select(query, new Array());
    var records = null;
    if (!recordsResult.getSuccess())
    {
        logDebug("Problem in getTimeAccounting(): " + recordsResult.getErrorMessage());
        return false;
    }
    records = recordsResult.getOutput() || new Array();
    if (records.size() > 0)
        return records.toArray();
    return records;
}
function getUserAssignedToTask(vCapId,taskName){
    currentUsrVar = null
    var taskResult1 = aa.workflow.getTask(vCapId,taskName);
    if (taskResult1.getSuccess()){
        tTask = taskResult1.getOutput();
    }
    else{
        logMessage("**ERROR: Failed to get workflow task object ");
        return false;
    }
    taskItem = tTask.getTaskItem()
    taskUserObj = tTask.getTaskItem().getAssignedUser()

    if(taskUserObj != null){
        return taskUserObj;
    }
    else{
        return false;
    }
}
function getWorkDesc(pCapId){
	var workDescResult = aa.cap.getCapWorkDesByPK(pCapId);
	if (!workDescResult.getSuccess()){
		logDebug("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage()); 
		return false;
	}
	var workDescObj = workDescResult.getOutput();
	var workDesc = workDescObj.getDescription();
	return workDesc;
}
	 
function invoiceAllFees4BillingParamRec(billingRecAltID) {
    itemCapId = capId;
    if (arguments.length > 1) itemCapId = arguments[1];
    feeSeqList = [];
    periodList = [];
    periodExists = false;

    feeList = aa.finance.getFeeItemByCapID(itemCapId).getOutput();

    for (fee in feeList) {
        if (feeList[fee].getFeeitemStatus() == "NEW" && billingRecAltID.equals(feeList[fee].getUdf1())) {
            feeSeqList.push(feeList[fee].getFeeSeqNbr());
            for (per in periodList){
                if (periodList[per] == feeList[fee].getPaymentPeriod()) periodExists = true;
            }
            if (!periodExists) periodList.push(feeList[fee].getPaymentPeriod());
        }
    }

    if(feeSeqList.length > 0) {
        doInvoice = aa.finance.createInvoice(itemCapId, feeSeqList, periodList);
        if (!doInvoice.getSuccess()){
            logDebug("Error during invoicing: " + doInvoice.getErrorMessage());
        }
    }
}
function isEmptyOrNull(value) {
    return value == null || value === undefined || String(value) == "";
}
// adding for test of STDBASE_BATCH_CONNECT_TO_PUBLIC_USER
 function peopleDuplicateCheck(ipPeop){
	// This function uses the close match criteria stored in the
	// INDIVIDUAL_CONTACT_MATCH_CRITERIA and ORGANIZATION_CONTACT_MATCH_CRITERIA standard choices to check the reference
	// contact library for potential duplicates
	// takes a single peopleModel as a parameter, and will return an array of people models (peopResult)
	// returns null if there are no matches

	var fvContType = ipPeop.getContactType();

	var fvCriteriaStdChoice = "INDIVIDUAL_CONTACT_MATCH_CRITERIA";
	// default to individual unless flag is Org
	if (fvContType == "Organization")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}
	if (lookup("REF_CONTACT_CREATION_RULES",fvContType) == "O")
	{
		fvCriteriaStdChoice = "ORGANIZATION_CONTACT_MATCH_CRITERIA";
	}

	//Add agency specific logic here if needed
	var fvBizDomainSR = aa.bizDomain.getBizDomain(fvCriteriaStdChoice);
	if (!fvBizDomainSR || !fvBizDomainSR.getSuccess())
	{
		logDebug("Standard Choice '" + fvCriteriaStdChoice + "' not defined.");
		return null;
	}
	var fvBizDomain = fvBizDomainSR.getOutput();
	if (!fvBizDomain || fvBizDomain.size() == 0)
	{
			logDebug("No criteria defined in Standard Choice '" + fvCriteriaStdChoice + "'.");
			return null;
	}

	for(var fvCounter1 = 0; fvCounter1 < fvBizDomain.size(); fvCounter1++)
	{
		var fvCloseMatchCriteriaObj = fvBizDomain.get(fvCounter1);
		var fvCriteriaStr = fvCloseMatchCriteriaObj.getDispBizdomainValue();
		if (!fvCriteriaStr || fvCriteriaStr == "")
			continue;

		var fvPeop = aa.people.createPeopleModel().getOutput().getPeopleModel();

		var fvCriteriaArr = fvCriteriaStr.split(";");

		var fvSkipThisCriteria = false;
		for (var fvCounter2 in fvCriteriaArr)
		{
		   var fvCriteriaFld = fvCriteriaArr[fvCounter2];
		   if (ipPeop[fvCriteriaFld] == null)
		   {
			   fvSkipThisCriteria = true;
			   logDebug("Value for " + fvCriteriaFld + " is null.");
			   break;
		   }
		   fvPeop[fvCriteriaFld] = ipPeop[fvCriteriaFld];
		   logDebug("Search for " + fvCriteriaFld + " " + fvPeop[fvCriteriaFld]);
		}

		if (fvSkipThisCriteria)
		{
			logDebug("WARNING: One or more Values for the Fields defined in this Criteria are null. Skipping this criteria.");
			continue;
		}

		var fvResult = aa.people.getPeopleByPeopleModel(fvPeop);
		if ( !fvResult.getSuccess())
		{
			logDebug("WARNING: Error searching for duplicate contacts : " + fvResult.getErrorMessage());
			continue;
		}

		var fvPeopResult = fvResult.getOutput();
		if (fvPeopResult.length == 0)
		{
			logDebug("Searched for REF contact, no matches found.");
			continue;
		}

		if (fvPeopResult.length > 0)
		{
			logDebug("Searched for a REF Contact, " + fvPeopResult.length + " matches found! returning the first match : " + fvPeopResult[0].getContactSeqNumber());
			return fvPeopResult[0].getContactSeqNumber();
		}
	}
	logDebug("No matches found. Returning Null.");
	return null;
}
function refreshTimeSheet(recordList)
{
    var itemCap = capId;
    if (arguments.length > 1) {
        itemCap = arguments[1]
    }

    var resArray = new Array();
    for (var i = 0 ; i < recordList.length ; i++)
    {
        if(recordList[i].get('TIME_LOG_STATUS') == 'U')
        {
            logDebug("DEBUG : " + itemCap.getCustomID() + " : Creating row for TIMESHEET ENTRIES table");
            createASITRow(recordList[i], resArray);
            logDebug("DEBUG : " + itemCap.getCustomID() + " : Updating time accounting entry with status as Lock");
            var lockStatus = "L";
            var timeLogSeq = recordList[i].get('TIME_LOG_SEQ')+"";
            updateTimeAccountingLockStatus(timeLogSeq,lockStatus);
        }
    }
    removeASITable("TIMESHEET ENTRIES",itemCap);
    addASITable("TIMESHEET ENTRIES", resArray, itemCap);
}
function removeContactsFromCap(vCapId){
    var cons = aa.people.getCapContactByCapID(vCapId).getOutput();
    for (x in cons){
        conSeqNum = cons[x].getPeople().getContactSeqNumber();
        if (conSeqNum){ 
            aa.people.removeCapContact(vCapId, conSeqNum);
        }
    }
}
function resultWorkflowTask(wfstr, wfstat, wfcomment, wfnote) // optional process name
{
    var useProcess = false;
    var processName = "";
    var itemCap = capId;
    if (arguments.length > 4 && arguments[4]) {
        processName = arguments[4]; // subprocess
        useProcess = true;
    }
    if (arguments.length > 5)
        itemCap = arguments[5];
    var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }

    if (!wfstat)
        wfstat = "NA";

    for (i in wfObj) {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
            var statObj = aa.workflow.getTaskStatus(fTask, wfstat);
            var dispo = "U";
            if (statObj.getSuccess()) {
                var status = statObj.getOutput();
                dispo = status.getResultAction();
            } else {
                logDebug("Could not get status action resulting to no change")
            }

            var dispositionDate = aa.date.getCurrentDate();
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();

            if (useProcess)
                aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, dispo);
            else
                aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, dispo);

            logMessage("Resulting Workflow Task: " + wfstr + " with status " + wfstat);
            logDebug("Resulting Workflow Task: " + wfstr + " with status " + wfstat);
        }
    }
}
function returnValueInASITCol(vTableName,keyName1,keyValue1,returnColumn,vCapId){
	var returnValue = null;
	var tableArr = loadASITable(vTableName, vCapId);
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1)){
				returnValue = tableArr[r][returnColumn]
			}
		}
	}
	return returnValue;
}
function scheduleInspectionReturnInspID(iType,DaysAhead,vCapId){
	// Added Optional 4th parameter inspTime Valid format is HH12:MIAM or AM (SR5110) 
	// Added Optional 5th parameter inspComm ex. to call without specifying other options params scheduleInspection("Type",5,null,null,"Schedule Comment");
	var inspectorObj = null;
	var inspTime = null;
	var inspComm = "Scheduled via Script";
	var schedRes = aa.inspection.scheduleInspection(vCapId, inspectorObj, aa.date.parseDate(dateAdd(null,DaysAhead)), inspTime, iType, inspComm)
	if (schedRes.getSuccess()){
		logDebug("Successfully scheduled inspection : " + iType + " for " + dateAdd(null,DaysAhead));
		return schedRes.getOutput();
	}
	else{
		logDebug( "**ERROR: adding scheduling inspection (" + iType + "): " + schedRes.getErrorMessage());
	}
}
function sendEmailtoAAUser(emailTo, templateName, capId)
{
    var emailParameters = aa.util.newHashtable();
    addParameter(emailParameters, "$$AltID$$",capId.getCustomID());
    addParameter(emailParameters, "$$subject$$","Your Timesheet has been rejected");
    if (emailTo != null && emailTo != '') {
        sendNotification("", emailTo, "", templateName, emailParameters, null);
    }
}
function updateASITableRow(tableName, ColName, colValue,  RowIndex, vCapID, currentUserID, readOnly) {
    //  tableName is the name of the ASI table
    //  tableValueArray is an array of associative array values.  All elements MUST be either a string or asiTableVal object
    var itemCap = vCapID;

    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName)

    if (!tssmResult.getSuccess()) {
        logDebug("WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false;
    }

    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var clm = tsm.getColumns();
    var fld_readonly = tsm.getReadonlyField();
    var sizeOFRecord = fld.size();
    var sizeOfColums = clm.size();
    var clmList = clm.toArray();

    var currentIndex = RowIndex * sizeOfColums;

    fld.set(currentIndex + getRowIndex(clmList, ColName), colValue);
    fld_readonly.set(currentIndex + getRowIndex(clmList, ColName), readOnly);

    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly);

    var addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);

    if (addResult.getSuccess()) {
        logDebug("updating app specific table " + tableName + " Successfully");
        //return false
    } else{
        logDebug("WARNING: error updating app specific table " + tableName + " " + addResult.getErrorMessage());
        return false;
    }
    function getRowIndex(cloumnList, columnName) {
        var index = -1;
        for (var i = 0; i < cloumnList.length; i++) {
            if (cloumnList[i].getColumnName() == columnName) return i;
        }
        return index;
    }
}
function updateBStructure(vCapId,structNo,structType,structName,structDesc){
    var updated = aa.bStructure.updateStructure(vCapId, structNo, structType, structName, structDesc, "", aa.date.getCurrentDate());
    if (updated.getSuccess()) {
        logDebug("BStructure Updated Successfully");
        return true;
    } else {
        logDebug("BStructure Updated ERROR: " + updated.getErrorMessage());
        return false;
    }
}
function updateFacilityInfo(targetCapId,vFacilityId){
	var capResult = aa.cap.getCap(vFacilityId);
	if(capResult != null){
		var capModel = capResult.getOutput().getCapModel()
		var appName = capModel.getSpecialText();
		var itemName = "Facility ID";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,vFacilityId.getCustomID(),itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
		var itemName = "Facility Name";
		var itemGroup = null;
		if (useAppSpecificGroupName){
			if (itemName.indexOf(".") < 0)
				{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
			itemGroup = itemName.substr(0,itemName.indexOf("."));
			itemName = itemName.substr(itemName.indexOf(".")+1);
		}
		var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(targetCapId,itemName,appName,itemGroup);
		if (appSpecInfoResult.getSuccess()){
			logDebug( "INFO: " + itemName + " was updated."); 
		} 	
		else{
			logDebug( "WARNING: " + itemName + " was not updated."); 
		}
	}
}
function updateGuidesheetFieldValueByArray(updateArr, vCapId) {
	var r = aa.inspection.getInspections(vCapId);
	if (r.getSuccess()) {
		var inspArray = r.getOutput();
		for (i in inspArray) {
            var vInspId = inspArray[i].getIdNumber();
            var inspModel = inspArray[i].getInspection();
            var gs = inspModel.getGuideSheets();
            if (gs) {
                gsArray = gs.toArray();
                for(gsIdx in gsArray){
                    var guideSheetObj = gsArray[gsIdx];
                    var guidesheetItem = guideSheetObj.getItems();
                    for(var j=0;j< guidesheetItem.size();j++) {
                        var item = guidesheetItem.get(j);
                        for (var gItem in updateArr){
                            var ArraySeqNo = updateArr[gItem][0];
                            var ArrayRowViolName = updateArr[gItem][1];
                            var ArrayASIName1 = updateArr[gItem][2];
                            var ArrayASIValue1 = updateArr[gItem][3];
                            var ArrayASIName2 = updateArr[gItem][4];
                            var ArrayASIValue2 = updateArr[gItem][5];
                            var ArrayASIName3 = updateArr[gItem][6];
                            var ArrayASIValue3 = updateArr[gItem][7];
                            var ArrayCapId = updateArr[gItem][8];
                            var ArrayInspd = updateArr[gItem][9];
                            if(parseInt(ArraySeqNo) == item.guideItemSeqNbr && parseInt(ArrayInspd) == vInspId){
								//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
								if(item.getGuideItemText() == ArrayRowViolName) {
									var ASISubGroups = item.getItemASISubgroupList();
									if(ASISubGroups) {
										//2. Filter ASI sub group by ASI Sub Group name
										for(var k=0;k< ASISubGroups.size();k++) {
											var ASISubGroup = ASISubGroups.get(k);
                                            var ASIModels =  ASISubGroup.getAsiList();
                                            if(ASIModels) {
                                                //3. Filter ASI by ASI name
                                                for( var m = 0; m< ASIModels.size();m++) {
                                                    var ASIModel = ASIModels.get(m);
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue1);
                                                    }
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName2) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue2);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue2);
                                                    }
                                                    if(ASIModel && ASIModel.getAsiName() == ArrayASIName3) {
                                                        logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue3);
                                                        //4. Reset ASI value
                                                        ASIModel.setAttributeValue(ArrayASIValue3);
                                                    }
                                                }
                                            }
										}
									}
								}
							}
                        }
                    }				
                    //Update the guidesheet
                    var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
                    if (updateResult.getSuccess()) {
                        logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
                    } else {
                        logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
                        return false;
                    }
                }
            } else {
                // if there are guidesheets
                logDebug("No guidesheets for this inspection");
                return false;
            }
		}
	} else {
		logDebug("No inspections on the record");
		return false;
	}
	logDebug("No updates to the guidesheet made");
	return false;
} 
function updateGuidesheetFieldValueByArrayMultiPermt(updateArr) {
	for (var Permit in updateArr){
		var ArrayCapId = updateArr[Permit][8];
		var r = aa.inspection.getInspections(ArrayCapId);
		if (r.getSuccess()) {
			var inspArray = r.getOutput();
			for (i in inspArray) {
				var vInspId = inspArray[i].getIdNumber();
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					gsArray = gs.toArray();
					for(gsIdx in gsArray){
						var guideSheetObj = gsArray[gsIdx];
						var guidesheetItem = guideSheetObj.getItems();
						for(var j=0;j< guidesheetItem.size();j++) {
							var item = guidesheetItem.get(j);
							for (var gItem in updateArr){
								var ArraySeqNo = updateArr[gItem][0];
								var ArrayRowViolName = updateArr[gItem][1];
								var ArrayASIName1 = updateArr[gItem][2];
								var ArrayASIValue1 = updateArr[gItem][3];
								var ArrayASIName2 = updateArr[gItem][4];
								var ArrayASIValue2 = updateArr[gItem][5];
								var ArrayASIName3 = updateArr[gItem][6];
								var ArrayASIValue3 = updateArr[gItem][7];
								var ArrayCapId = updateArr[gItem][8];
								var ArrayInspId = updateArr[gItem][9];
								if(parseInt(ArraySeqNo) == item.guideItemSeqNbr && parseInt(ArrayInspId) == vInspId){
									logDebug("DB1.1 " + vInspId)
									//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
									if(item.getGuideItemText() == ArrayRowViolName) {
										var ASISubGroups = item.getItemASISubgroupList();
										if(ASISubGroups) {
											//2. Filter ASI sub group by ASI Sub Group name
											for(var k=0;k< ASISubGroups.size();k++) {
												var ASISubGroup = ASISubGroups.get(k);
                                                var ASIModels =  ASISubGroup.getAsiList();
                                                if(ASIModels) {
                                                    //3. Filter ASI by ASI name
                                                    for( var m = 0; m< ASIModels.size();m++) {
                                                        var ASIModel = ASIModels.get(m);
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue1);
                                                        }
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName2) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue2);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue2);
                                                        }
                                                        if(ASIModel && ASIModel.getAsiName() == ArrayASIName3) {
                                                            logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue3);
                                                            //4. Reset ASI value
                                                            ASIModel.setAttributeValue(ArrayASIValue3);
                                                        }
                                                    }
                                                }
											}
										}
									}
								}
							}
						}				
						//Update the guidesheet
						var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
						if (updateResult.getSuccess()) {
							logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
						} else {
							logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
							return false;
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		} else {
			logDebug("No inspections on the record");
			return false;
		}
		logDebug("No updates to the guidesheet made");
		return false;
	}

}
function updateGuidesheetFieldValueByArrayMultiPermtAct(updateArr) {
	for (var Permit in updateArr){
		var ArrayCapId = updateArr[Permit][4];
		var r = aa.inspection.getInspections(ArrayCapId);
		if (r.getSuccess()) {
			var inspArray = r.getOutput();
			for (i in inspArray) {
				var inspModel = inspArray[i].getInspection();
				var gs = inspModel.getGuideSheets();
				if (gs) {
					gsArray = gs.toArray();
					for(gsIdx in gsArray){
						var guideSheetObj = gsArray[gsIdx];
						var guidesheetItem = guideSheetObj.getItems();
						for(var j=0;j< guidesheetItem.size();j++) {
							var item = guidesheetItem.get(j);
							for (var gItem in updateArr){
								var ArraySeqNo = updateArr[gItem][0];
								var ArrayRowViolName = updateArr[gItem][1];
								var ArrayASIName1 = updateArr[gItem][2];
								var ArrayASIValue1 = updateArr[gItem][3];
								var ArrayCapId = updateArr[gItem][4];
								if(parseInt(ArraySeqNo) == item.guideItemSeqNbr){
									//1. Filter Guide Sheet items by Guide sheet item name && ASI group code
									if(item.getGuideItemText() == ArrayRowViolName) {
										var ASISubGroups = item.getItemASISubgroupList();
										if(ASISubGroups) {
											//2. Filter ASI sub group by ASI Sub Group name
											for(var k=0;k< ASISubGroups.size();k++) {
												var ASISubGroup = ASISubGroups.get(k);
                                    var ASIModels =  ASISubGroup.getAsiList();
                                    if(ASIModels) {
                                          //3. Filter ASI by ASI name
                                          for( var m = 0; m< ASIModels.size();m++) {
                                             var ASIModel = ASIModels.get(m);
                                             if(ASIModel && ASIModel.getAsiName() == ArrayASIName1) {
                                                logDebug(ArrayRowViolName + " Change ASI value " + ASIModel.getAsiName() + " from:"+ ASIModel.getAttributeValue() +" to " + ArrayASIValue1);
                                                //4. Reset ASI value
                                                ASIModel.setAttributeValue(ArrayASIValue1);
                                             }
                                          }
                                    }
											}
										}
									}
								}
							}
						}				
						//Update the guidesheet
						var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj,guideSheetObj.getAuditID());
						if (updateResult.getSuccess()) {
							logDebug("Successfully updated GS Data on inspection " + inspArray[i].getIdNumber() + ".");
						} else {
							logDebug("Could not update guidesheet ID: " + updateResult.getErrorMessage());
							return false;
						}
					}
				} else {
					// if there are guidesheets
					logDebug("No guidesheets for this inspection");
					return false;
				}
			}
		} else {
			logDebug("No inspections on the record");
			return false;
		}
		logDebug("No updates to the guidesheet made");
		return false;
	}

}
function updateGuidesheetItemStatus(inspId, gItem, gItemStatus, itemCap) {
    var r = aa.inspection.getInspections(itemCap);
    if (r.getSuccess()) {
        var inspArray = r.getOutput();
        for (i in inspArray) {
            if (inspArray[i].getIdNumber() == inspId) {
                var inspModel = inspArray[i].getInspection();
                var gs = inspModel.getGuideSheets();
                if (gs) {
                    for (var i = 0; i < gs.size(); i++) {
                        var guideSheetObj = gs.get(i);
                        if (guideSheetObj) {
                            var guidesheetItem = guideSheetObj.getItems();
                            for (var j = 0; j < guidesheetItem.size(); j++) {
                                var item = guidesheetItem.get(j);
                                //1. Filter Guide Sheet items by Guide sheet item name && ASI group code
                                if (item && gItem == item.getGuideItemText()) {
                                    logDebug("Found the item: " + item.getGuideItemText() + " with Status: " + item.getGuideItemStatus());
                                    item.setGuideItemStatus(gItemStatus);
                                    var updateResult = aa.guidesheet.updateGGuidesheet(guideSheetObj, currentUserID).getOutput();
                                    return item.getGuideItemStatus();
                                }
                            }
                            //if we got here then there were no guide sheet items matching the item requested
                            logDebug("No matching guidesheet items found for: " + item);
                            return false;
                        }
                    }
                }
                else {
                    // if there are guidesheets
                    logDebug("No guidesheets for this inspection");
                    return false;
                }
            }
        }
    }
    else {
        logDebug("No inspections on the record");
        return false;
    }
 }
function updateTimeAccountingLockStatus(timeLogSeq, lockStatus)
{
    var query = "UPDATE T1_TIME_LOG T SET TIME_LOG_STATUS = '$$status$$' WHERE TIME_LOG_SEQ = '$$timeLogSeq$$' AND SERV_PROV_CODE = '$$SERVPROVCODE$$'";
    query = query.replace("$$timeLogSeq$$",timeLogSeq).replace("$$status$$",lockStatus).replace("$$SERVPROVCODE$$",aa.getServiceProviderCode());

    var recordsResult = aa.db.update(query, new Array());
    var records = null;
    if (!recordsResult.getSuccess())
    {
        logDebug("Problem in updateTimeAccounting(): " + recordsResult.getErrorMessage());
        return false;
    }
    logDebug("Updated Successfully...");
}
function valueExistInASIT2Col(vTableName,keyName1,keyValue1,keyName2,keyValue2,vCapId){
	var tableArr = loadASITable(vTableName, vCapId);
	var matchResult = false;
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName1]) == parseInt(keyValue1) && tableArr[r][keyName2].toString() == keyValue2.toString()) {
				
				matchResult = true;
			}
		}
	}
	return matchResult;
}
function valueExistInASITCol(vTableName,keyName,keyValue,vCapId){
	var tableArr = loadASITable(vTableName, vCapId);
	var matchResult = false;
	if (tableArr) {
		for (var r in tableArr) {
			if (parseInt(tableArr[r][keyName]) == parseInt(keyValue)) {
				matchResult = true;
			}
		}
	}
	return matchResult;
}
