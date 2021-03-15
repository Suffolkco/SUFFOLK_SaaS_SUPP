//WTUA:DEQ/OPC/SWIMMING POOL/RENEWAL
/*
Scenario 1:
 
1. If workflow task is at "Awaiting Client Reply", email sent to Pool Owner and Pool Operator 
that you need more information.
2. The renewal record application status set to "Awaiting client reply" as well.

Scenario 2:
If workflow task is at "Complete", then set the renewal record status to "Complete" and 
set +2 years on expiration date on the swimming pool application and update the swimming pool 
application expiration status to "Pending". The swimming pool application should already 
be in the "Active" status.
*/

var showDebug = false;
// Find swimming pool parent application
var parentCapId = getParentCapID4Renewal();
var test = "";

var poolOwnerExist = false;
var operatorExist = false;
var propertyOwnerExist = false;
var pmExist = false;
var psExist = false;
var renConArray = [];

logDebug("Parent cap D is: " + parentCapId);

var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
if (b1ExpResult.getSuccess())
{
	b1Exp = b1ExpResult.getOutput();
	var newDate = new Date();
	var todDateCon = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + (newDate.getFullYear());
	
	logDebug("This is the current month: " + newDate.getMonth());
	logDebug("This is the current day: " + newDate.getDate());
	logDebug("This is the current year: " + newDate.getFullYear());
	
	logDebug("TodayDateCon: " + todDateCon);
	// 1 year expiration
	//var dateAdd = addDays(todDateCon, 365);
	
	var curYear = newDate.getFullYear();	
	var curYearPlus = parseInt(curYear) + 2;
	var curYearPlus1Year = parseInt(curYear) + 1;
	var curExpCon;

	// Set parent swimming pool application 2 years expiration 
	// Indoor
	if (isEven(newDate.getFullYear()))	
	{
		curExpCon = "12/31" + "/" + curYearPlus;
		logDebug("IsOdd: " + curExpCon);
	}
	// Outdoor
	if (isOdd(newDate.getFullYear()))	
	{
		curExpCon = "9/30" + "/" + curYearPlus;
		logDebug("isEven: " + curExpCon);
	}
	//var dateAdd = addDays(todDateCon, 730);
	//var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);
}

if (wfTask == "Renewal Review" && wfStatus == "Complete")
{

	var indoorCheck = false;	
	
	var poolTable = loadASITable("SWIMMING POOL INFORMATION");
	for (p in poolTable)
	{
		if (poolTable[p]["Location"] == "Indoor")
		{
			indoorCheck = true;
			logDebug("It is an indoor pool");
			break;
		}
	}
	// If it's indoor pool, doesn't matter when they expire, the expiration date will be on the even year.
	// Similiar to outdoor pool, doesn't matter when they exire, the expiration date will be on the odd  year.
	// So they can have shorter than than 2 years expiration. 
	if (indoorCheck) 
	{
		logDebug("Indoor check passes");
		// if it's in the even year, we add 2 years
		if (isEven(newDate.getFullYear()))
		{
			curExpCon = "12/31" + "/" + curYearPlus;
		}
		// If it's in the odd year and inddor, we just add it 1 year.
		else if (isOdd(newDate.getFullYear()))
		{
			curExpCon = "12/31" + "/" + curYearPlus1Year;
		}
	}
	else // If it's outdoor pool
	{
		logDebug("Outdoor check passes");
		// if it's in the odd year, we add 2 years
		if (isOdd(newDate.getFullYear()))
		{
			curExpCon = "9/30" + "/" + curYearPlus;
		}
		// If it's in the odd year and inddor, we just add it 1 year.
		else if (isEven(newDate.getFullYear()))
		{
			curExpCon = "9/30" + "/" + + curYearPlus1Year;
		}	
	}
	//dateMMDDYYY = aa.date.parseDate(dateMMDDYYY);
	// Set swimming pool applicaiton expiration + 2 years
	//b1Exp.setExpDate(dateMMDDYYY);
	var expDate = aa.date.parseDate(curExpCon);

	b1Exp.setExpDate(expDate);

	// Update swimmming pool application app status to Pending
	b1Exp.setExpStatus("Pending");
	aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
	//logDebug("Expiration date for swimming pool application: " + dateMMDDYYY);
	logDebug("Expiration date for swimming pool application: " + curExpCon);

	updateAppStatus("Active", "Updated via WTUA script", parentCapId);
	 
	// Copy Contacts to Swiming Pool application		
    var poolOwner = getAppSpecific("Any changes to the Pool Ownership?", capId);
    logDebug("Any changes to the Pool Ownership? " + poolOwner);
    var poolOp = getAppSpecific("Any changes to the Pool Operator?", capId);
    logDebug("Any changes to the Pool Operator? " + poolOp);
    var propOwner = getAppSpecific("Any changes to the Property Owner?", capId);
    logDebug("Any changes to the Property Owner? " + propOwner);
    var poolMgm = getAppSpecific("Any changes to the Pool Management Company?", capId);
    logDebug("Any changes to the Pool Management Company? " + poolMgm);
    var poolSer = getAppSpecific("Any changes to the Pool Service Company?", capId);
    logDebug("Any changes to the Pool Service Company? " + poolMgm);

	/****************************** */
	var parCapContactResult = aa.people.getCapContactByCapID(parentCapId);
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (parCapContactResult.getSuccess()) 
	{
		var parContacts = parCapContactResult.getOutput();
		//logDebug(parContacts.length);
		for (con in parContacts)
		{
			/****************************** */
			// Get EXISTING contacts from the SWIMMING POOL application
			//var parArray = getContactArray(parentCapId);
			/*var capContactResult = aa.people.getCapContactByCapID(parentCapId);
			var applicationContacts = capContactResult.getOutput();*/
			// Go through the contacts for the swimming pool application and set them
			// to Inactive if the ASI field in renewal application indicates there is a change.

			/*Any changes to the Pool Ownership?  * If yes, it means pool owner has changed. Deactivate existing and copy updated one from swimming renewal to swimming application.
			Any changes to the Pool Operator?  If yes, it means Pool Operator has changed.  Deactivate existing and copy updated one from swimming renewal to swimming application.
			Any changes to the Property Owner?  * If yes, it means Property Owner has changed. Deactivate existing and copy updated one from swimming renewal to swimming application.
			Any changes to the Pool Management Company? If yes, deactivate existing and copy updated one from swimming renewal to swimming application.
			Any changes to the Pool Service Company? If yes, deactivate existing and copy updated one from swimming renewal to swimming application.*/	
			var newContact = parContacts[con].getCapContactModel();
			logDebug("Contact type is: " + newContact.getPeople().getContactType());
			var appContactType = newContact.getPeople().getContactType();
			if ((poolOwner == "Yes" && matches(appContactType, "Pool Owner") )||
			(poolOp == "Yes" && matches(appContactType, "Operator")) ||
			(propOwner == "Yes" && matches(appContactType, "Property Owner")) ||
			(poolMgm == "Yes" && matches(appContactType, "Pool Management Company")) ||
			(poolSer == "Yes" && matches(appContactType, "Pool Service Company")))
			{
				renConArray.push(newContact);
			}
			if (matches(appContactType, "Pool Owner") )
			{
				logDebug("Pool Owner Exists in App.");
				poolOwnerExist = true;
			}
			if (matches(appContactType, "Operator") )
			{
				logDebug("Operator Exists in App.");
				operatorExist = true;
			}
			if (matches(appContactType, "Property Owner") )
			{
				logDebug("Property Exists in App.");
				propertyOwnerExist = true;
			}
			if (matches(appContactType, "Pool Management Company") )
			{
				logDebug("Pool Management Exists in App.");
				pmExist = true;
			}
			if (matches(appContactType, "Pool Service Company") )
			{
				logDebug("Pool Service Exists in App.");
				psExist = true;
			}
		}
		for (r in renConArray)
		{
			logDebug("Current audit status is: " + renConArray[r].getPeople().getAuditStatus());	
			
			// Set existing pool contact to be INACTIVE 			
			renConArray[r].getPeople().setAuditStatus("I");
			//Commits update
			aa.people.editCapContact(renConArray[r]);
			logDebug("Set contact:" + renConArray[r].getPeople().getContactType() + " to INACTIVE");	
			logDebug("Current audit status is: " + renConArray[r].getPeople().getAuditStatus());	
		}

		if (capContactResult.getSuccess()) 
		{
			var capContacts = capContactResult.getOutput();
			for (con in capContacts)
			{
				var contact = capContacts[con].getCapContactModel();
				var seqNumber = contact.getPeople().getContactSeqNumber(); 
				var appContactType = contact.getPeople().getContactType();
				logDebug("Contact type is: " + contact.getPeople().getContactType());
				logDebug("Contact seq number is: " + seqNumber);
				if (matches(appContactType, "Pool Owner") &&  (poolOwner == "Yes" || poolOwnerExist == false))
				{
					copyActiveContactsByType(capId, parentCapId, appContactType, seqNumber);
					logDebug("Not exist. Copy contact type " + appContactType + ": " + seqNumber + " from renewal:" + capId + " to swimming pool:" + parentCapId);
				}
				if (matches(appContactType, "Property Owner") &&  (propOwner == "Yes" &&  propertyOwnerExist == false))
				{
					copyActiveContactsByType(capId, parentCapId, appContactType, seqNumber);
					logDebug("Not exist. Copy contact type " + appContactType + ": " + seqNumber + " from renewal:" + capId + " to swimming pool:" + parentCapId);
				}
				if (matches(appContactType, "Operator") &&  (poolOp == "Yes" || operatorExist == false))
				{
					copyActiveContactsByType(capId, parentCapId, appContactType, seqNumber);
					logDebug("Not exist. Copy contact type " + appContactType + ": " + seqNumber + " from renewal:" + capId + " to swimming pool:" + parentCapId);
				}
				if (matches(appContactType, "Pool Management Company") && (poolMgm == "Yes" ||   pmExist == false))
				{
					copyActiveContactsByType(capId, parentCapId, appContactType, seqNumber);
					logDebug("Not exist. Copy contact type " + appContactType + ": " + seqNumber + " from renewal:" + capId + " to swimming pool:" + parentCapId);
				}
				if (matches(appContactType, "Pool Service Company") &&  (poolSer == "Yes" || psExist == false))
				{
					copyActiveContactsByType(capId, parentCapId, appContactType, seqNumber);
					logDebug("Not exist. Copy contact type " + appContactType + ": " + seqNumber + " from renewal:" + capId + " to swimming pool:" + parentCapId);
				}	
			}
		}

	}

	var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");
    logDebug("Proj Inc " + projIncomplete.getSuccess());
    if(projIncomplete.getSuccess())
    {
        var projInc = projIncomplete.getOutput();
        for (var pi in projInc)
        {
            parentCapId = projInc[pi].getProjectID();
            logDebug("parentCapId: " + parentCapId);
            projInc[pi].setStatus("Review");
            var updateResult = aa.cap.updateProject(projInc[pi]);
        }
	}     
	
    var projReview = aa.cap.getProjectByChildCapID(capId, "Renewal", "Review");
    logDebug("Proj Rev " + projReview.getSuccess());
    if(projReview.getSuccess())
    {
        var projRev = projReview.getOutput();
        for (var pr in projRev)
        {
            parentCapId = projRev[pr].getProjectID();
			logDebug("parentCapId: " + parentCapId);
			// Set renewal record to "Complete" 
            projRev[pr].setStatus("Complete");
            var updateResult = aa.cap.updateProject(projRev[pr]);
        }
    }	
}

if (wfStatus == "Awaiting Client Reply")
{
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

	if(matches(fromEmail, null, "", undefined))
	{
		fromEmail = "";
	}
		
	getRecordParams4Notification(emailParams);
	getWorkflowParams4Notification(emailParams);


	addParameter(emailParams, "$$altID$$", capId.getCustomID());
	addParameter(emailParams, "$$shortNotes$$", shortNotes); 

	var workflowResult = aa.workflow.getTasks(capId);

	if (workflowResult.getSuccess())
	{
		var wfObj = workflowResult.getOutput();
	}
	else
	{ 
		logDebug("**ERROR: Failed to get workflow object"); 
	}
	for (i in wfObj)
	{
		fTask = wfObj[i];

			if (fTask.getTaskDescription().equals("Renewal Review"))
			{
				var adhocComs = fTask.getDispositionComment();
				logDebug("Adhoc comments are: " + adhocComs);
			}		
	}
	getWorkflowParams4Notification(emailParams);
	
	var s_result = aa.address.getAddressByCapId(capId);
	if(s_result.getSuccess())
	{
		capAddresses = s_result.getOutput();	
	}

	addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
	addParameter(emailParams, "$$altID$$", capId.getCustomID());
    addParameter(emailParams, "$$shortNotes$$", shortNotes); 
	addParameter(emailParams, "$$wfComments$$", adhocComs);	
	addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 

	if (capAddresses != null)
    {
        addParameter(emailParams, "$$address$$", capAddresses[0]);
	}	
	

	for (var con in conArray)
	{
		if (conArray[con].contactType == "Pool Owner" || conArray[con].contactType == "Operator" ||
		conArray[con].contactType == "Pool Management Company")
		{
			if (!matches(conArray[con].email, null, undefined, ""))
			{
				
				conEmail += conArray[con].email + "; ";
			}
		}
	}
	if (conEmail != null)
	{
		logDebug("Email addresses: " + conEmail);
		sendNotification("", conEmail, "", "DEQ_OPC_AWAITINGCLIENTREPLY_RENEWAL", emailParams, reportFile);	
	}


	updateAppStatus("Awaiting Client Reply", "Set to Awaiting Client Reply by batch process.");
}

function getACARecordURL() {

	itemCap = (arguments.length == 2) ? arguments[1] : capId;		
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
	var acaRecordUrl = "";
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
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

function getACADocDownloadParam4Notification(params,acaUrl,docModel) {

	// pass in a hashtable and it will add the additional parameters to the table
	addParameter(params, "$$acaDocDownloadUrl$$", getACADocumentDownloadUrl(acaUrl,docModel));
	return params;	

}

function getACADocumentDownloadUrl(acaUrl,documentModel) 
{
	//returns the ACA URL for supplied document model
 var acaUrlResult = aa.document.getACADocumentUrl(acaUrl, documentModel);

 if(acaUrlResult.getSuccess())
 {
	 acaDocUrl = acaUrlResult.getOutput();
	 return acaDocUrl;

 }
 else
 {
	 logDebug("Error retrieving ACA Document URL: " + acaUrlResult.getErrorType());
	 return false;
 }
}

function isOdd(n) 
{
   return Math.abs(n % 2) == 1;
}
function isEven(n) 
{
    return n % 2 == 0;
}

function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null) {
		if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
			return (pJavaScriptDate.getMonth() + 1).toString() + "/" + pJavaScriptDate.getDate() + "/" + pJavaScriptDate.getFullYear();
		} else {
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
		}
	} else {
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
	}
}

function copyActiveContactsByType(pFromCapId, pToCapId, pContactType, pContactSeqNumber)
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
			if(Contacts[yy].getCapContactModel().getContactType() == pContactType &&
			Contacts[yy].getCapContactModel().getContactSeqNumber() == pContactSeqNumber) 
            {
                var newContact = Contacts[yy].getCapContactModel();
                if (newContact.getPeople().getAuditStatus() != "I")
                {
                    newContact.setCapID(vToCapId);
                    aa.people.createCapContact(newContact);
                    copied++;
                    logDebug("Copied contact from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
                }
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