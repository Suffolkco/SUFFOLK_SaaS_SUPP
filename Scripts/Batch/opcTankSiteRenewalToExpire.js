/*------------------------------------------------------------------------------------------------------/
| Program: opcTankSiteRenewalToExpire.js  Trigger: Batch
| Version 1.0 Zachary McVicker 01/04/2018
| This batch script will run daily to see if it expires TODAY
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS 
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = false; // Set to true to see debug messages in email confirmation//
var maxSeconds = 60 * 5; // number of seconds allowed for batch processing, usually < 5*60
var showMessage = false;
var useAppSpecificGroupName = false;
var br = "<BR>";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var startDate = new Date();
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
} else {
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}
/*------------------------------------------------------------------------------------------------------/
|
| START: END CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var message = "";
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var todayDate = "" + startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate();

var todaysDate = new Date();																
var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());			

// all record types to check
var rtArray = ["DEQ/General/Site/NA"];
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS//
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
try {
    for (var i in rtArray) {
        var thisType = rtArray[i];
        var capModel = aa.cap.getCapModel().getOutput();
        var appTypeArray = thisType.split("/");
        // Specify the record type to query//
        capTypeModel = capModel.getCapType();
        capTypeModel.setGroup(appTypeArray[0]);
        capTypeModel.setType(appTypeArray[1]);
        capTypeModel.setSubType(appTypeArray[2]);
        capTypeModel.setCategory(appTypeArray[3]);
        capModel.setCapType(capTypeModel);
        //capModel.setCapStatus(sArray[i]); if needed

        var recordListResult = aa.cap.getCapIDListByCapModel(capModel);
        if (!recordListResult.getSuccess()) {
            logDebug("**ERROR: Failed to get capId List : " + recordListResult.getErrorMessage());
            continue;
        }
        var recArray = recordListResult.getOutput();
        logDebug("Looping through " + recArray.length + " records of type " + thisType);

        for (var j in recArray) {
            var conEmail = "";
            capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput(); // reload since it's 	capId = aa.cap.getCapID();
            capIDString = capId.getCustomID();
            cap = aa.cap.getCap(capId).getOutput();
            //These are legacy records, don't have expirations associated.
            if(!matches(capIDString,"SITE-18-00100"))
            {
                if (cap) {
                    var opcCheck = getAppSpecific("OPC");
                    logDebug(capId.getCustomID());
                    var ownerType = getAppSpecific("Owner Type");
                    
                    var ownerTypeCheck = false;
                    if (ownerType == "2-State Government" || ownerType == "3-Local Government" || ownerType == "4-Federal Government")
                    {
                        ownerTypeCheck = true;
                    }
                    if ((opcCheck == "CHECKED")) {
                    //  logDebug(capIDString + " Our ASI Check was True to some capacity. OPC CHECK: "  + opcCheck + " owner Type: " + ownerTypeCheck)
                        var appStatus = getAppStatus();
                        if (appStatus == "Active") {
                            logDebug("Record: " + capId.getCustomID() + " Status: " + appStatus);

                            var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                            if(capmodel.isCompleteCap())
                            {
                                logDebug("Is complete cap.");
                                b1ExpResult = aa.expiration.getLicensesByCapID(capId)
                                if (b1ExpResult.getSuccess()) {
                                    logDebug("Success.");
                                    var b1Exp = b1ExpResult.getOutput();
                                    try
                                    {
                                        if (b1Exp != null)
                                        {
                                            var expDate = b1Exp.getExpDate();
                                            if (expDate != null)
                                            {
                                                var expDateCon = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
                                                logDebug("Expiration date: " + expDateCon);

                                                logDebug("Today's date: " + todDateCon);

                                                var dateDiff = parseFloat(dateDifference(todDateCon, expDateCon));
      
                                                if (dateDiff == 0)                             
                                                {
                                                    b1Exp.setExpStatus("Expired");
                                                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());

                                                    logDebug("Just set: " + capId.getCustomID() + " to expire.");
                                                    //WORKS
                                                    //addToSet(capId, "OPCRENEWAL", "OPC");
                                                    addToSet(capId, "OPC_SITE_RENEWAL", "OPC");
                                                    // addToSet(capId, "IARENEWAL", "OPC Site Renewals");
                                                    var altID = capId.getCustomID();
                                                    var shortNotes = getShortNotes(capId);

                                                    var emailParams = aa.util.newHashtable();
                                                    addParameter(emailParams, "$$ALTID$$", altID);
                                                    //var acaURL = "aca.suffolkcountyny.gov/CitizenAccess/";
                                                    //acaURL+= getACAUrl(capId);

                                                    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                                                    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
                                                    acaURL = acaSite + getACAUrl();
                                                    
                                                    //logDebug("ACA URL: " + acaURL);
                                                    addParameter(emailParams, "$$ACAURL", acaURL);
                                                    addParameter(emailParams, "$$shortNotes$$", shortNotes);
                                                    addParameter(emailParams, "$$expireDate$$", expDateCon);	
                                                    
                                                    var conArray = getContactArray(capId);
                                                    var altID = capId.getCustomID();
                                                    var conEmail = "";
                                                    for (x in conArray)
                                                    {
                                                        var address1 = conArray[x].addressLine1;				
                                                        var city = conArray[x].city;
                                                        var state = conArray[x].state;
                                                        var zip = conArray[x].zip;	
                                            
                                                        addParameter(emailParams, "$$address1$$", address1);
                                                        addParameter(emailParams, "$$city$$", city);
                                                        addParameter(emailParams, "$$state$$", state);
                                                        addParameter(emailParams, "$$zip$$", zip);	


                                                        if (conArray[x].contactType == "Tank Owner")
                                                        {   
                                                            conArray[x];
                                                            var conEmail = conArray[x].email;
                                                            sendNotification("", conEmail, "", "OPC_SITE_RENEWAL_FINAL_NOTICE", emailParams, null);
                                                        }
                                                        if (conArray[x].contactType == "Billing Contact")
                                                        {
                                                            conArray[x];
                                                            var conEmail = conArray[x].email;
                                                            sendNotification("", conEmail, "", "OPC_SITE_RENEWAL_FINAL_NOTICE", emailParams, null);
                                                        }
                                                    }
                    
                                                }
                                            } 
                                        }
                                    }
                                    catch (expError)
                                    {
                                        logDebug("**ERROR** runtime error " + expError.message + " at " + expError.lineNumber + " stack: " + expError.stack);
                                    }
                                }
                            }

                        }

                    }
                }

            }        
        }
    }
} catch (err) {
    logDebug("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
}
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}
function sendNotification(emailFrom,emailTo,emailCC,templateName,params,reportFile)

{

	var itemCap = capId;

	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args



	var id1 = itemCap.ID1;

 	var id2 = itemCap.ID2;

 	var id3 = itemCap.ID3;



	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);





	var result = null;

	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);

	if(result.getSuccess())

	{

		logDebug("Sent email successfully!");

		return true;

	}

	else

	{

		logDebug("Failed to send mail. - " + result.getErrorType());

		return false;

	}

}
 
function getShortNotes() // option CapId
{
	var itemCap = capId
	if (arguments.length > 0)
		itemCap = arguments[0]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	var sReturn = cd.getShortNotes();

	if(sReturn != null)
		return sReturn;
	else
        return "";
        
}



function getACAUrl(){

	// returns the path to the record on ACA.  Needs to be appended to the site

	itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args
   	var acaUrl = "";
	var id1 = capId.getID1();
	var id2 = capId.getID2();
	var id3 = capId.getID3();
	var cap = aa.cap.getCap(capId).getOutput().getCapModel();

	acaUrl += "/CapDetail.aspx?";
	acaUrl += "Module=" + cap.getModuleName();
	acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
	return acaUrl;
	}
 
 
function getChildren(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ logDebug( "**WARNING: getChildren function found no children"); return null ; }

	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (xx in childArray)
		{
		childCapId = childArray[xx].getCapID();
		if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
			continue;

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
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
			retArray.push(childCapId);
		}
		
	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray;

    }
    
function getContactsCompanyName(contactType) {
    var itemCap = capId
    if (arguments.length > 1) {
        itemCap = arguments[1]; // use cap ID specified in args
    }

    var orgName = "";
    var capContactResult = aa.people.getCapContactByCapID(itemCap);
    if (capContactResult.getSuccess()) {
        var contacts = capContactResult.getOutput();
        for (yy in contacts) {
            if (contactType.equals(contacts[yy].getCapContactModel().getPeople().getContactType())) {
                if (contacts[yy].getPeople().getBusinessName() != null) {
                    orgName = "" + contacts[yy].getPeople().getBusinessName();
                }
            }
        }
    }
    return orgName;
}

function lookup(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        //logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    } else {
        logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
}

function updateAppStatus(stat, cmt) {
    updateStatusResult = aa.cap.updateAppStatus(capId, "APPLICATION", stat, sysDate, cmt, systemUserObj);
    if (!updateStatusResult.getSuccess()) {
        logDebug("ERROR: application status update to " + stat + " was unsuccessful.  The reason is " +
            updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
    } else {
        logDebug("Application Status updated to " + stat);
    }
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

function addAdHocTask(adHocProcess, adHocTask, adHocNote) {
    //adHocProcess must be same as one defined in R1SERVER_CONSTANT
    //adHocTask must be same as Task Name defined in AdHoc Process
    //adHocNote can be variable
    //Optional 4 parameters = Assigned to User ID must match an AA user
    //Optional 5 parameters = CapID
    var username = "ADMIN";
    var thisCap = capId;
    var thisUser = username;
    if (arguments.length > 3)
        thisUser = arguments[3]
    if (arguments.length > 4)
        thisCap = arguments[4];
    var userObj = aa.person.getUser(thisUser);
    if (!userObj.getSuccess()) {
        logDebug("Could not find user to assign to");
        return false;
    }
    var taskObj = aa.workflow.getTasks(thisCap).getOutput()[0].getTaskItem()
    taskObj.setProcessCode(adHocProcess);
    taskObj.setTaskDescription(adHocTask);
    taskObj.setDispositionNote(adHocNote);
    taskObj.setProcessID(0);
    taskObj.setAssignmentDate(aa.util.now());
    taskObj.setDueDate(aa.util.now());
    taskObj.setAssignedUser(userObj.getOutput());
    wf = aa.proxyInvoker.newInstance("com.accela.aa.workflow.workflow.WorkflowBusiness").getOutput();
    wf.createAdHocTaskItem(taskObj);
    logDebug("AdHoc task 'SP Review' has been added");
    return true;
}

function addFee(fcode, fsched, fperiod, fqty, finvoice) {
    var feeCap = capId;
    var feeCapMessage = "";
    var feeSeq_L = new Array(); //invoicing fee for CAP in args
    var paymentPeriod_L = new Array(); //invoicing pay periods for CAP in args
    var feeSeqList = new Array();
    var paymentPeriodList = new Array();
    var feeSeq = null;
    if (arguments.length > 5) {
        feeCap = arguments[5]; //use cap ID specified in args
        feeCapMessage = " to specified CAP";
    }
    assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
    if (assessFeeResult.getSuccess()) {
        feeSeq = assessFeeResult.getOutput();
        logDebug("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
        logDebug("The assessed fee Sequence Number " + feeSeq + feeCapMessage);
        if (finvoice == "Y" && arguments.length == 4) // use current CAP
        {
            feeSeqList.push(feeSeq);
            paymentPeriodList.push(fperiod);
        }
        if (finvoice == "Y" && arguments.length > 4) // use CAP in args
        {
            feeSeq_L.push(feeSeq);
            paymentPeriod_L.push(fperiod);
            var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
            if (invoiceResult_L.getSuccess()) {
                logDebug("Invoicing assessed fee items" + feeCapMessage + " is successful.");
            } else {
                logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
            }
        }
        updateFeeItemInvoiceFlag(feeSeq, finvoice);
    } else {
        logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
        feeSeq = null;
    }
    return feeSeq;
}

function updateFeeItemInvoiceFlag(feeSeq, finvoice) {
    if (feeSeq == null)
        return;
    if (!cap.isCompleteCap()) {
        var feeItemScript = aa.finance.getFeeItemByPK(capId, feeSeq);
        if (feeItemScript.getSuccess) {
            var feeItem = feeItemScript.getOutput().getF4FeeItem();
            feeItem.setAutoInvoiceFlag(finvoice);
            aa.finance.editFeeItem(feeItem);
        }
    }
}

function copyContacts(pFromCapId, pToCapId) {
    if (pToCapId == null) {
        var vToCapId = capId;
    } else {
        var vToCapId = pToCapId;
    }
    var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
    var copied = 0;
    if (capContactResult.getSuccess()) {
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts) {
            var newContact = Contacts[yy].getCapContactModel();
            // Retrieve contact address list and set to related contact
            var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
            if (contactAddressrs.getSuccess()) {
                var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
                newContact.getPeople().setContactAddressList(contactAddressModelArr);
            }
            newContact.setCapID(vToCapId);
            // Create cap contact, contact address and contact template
            aa.people.createCapContactWithAttribute(newContact);
            copied++;
            logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
        }
    } else {
        logDebug("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
        return false;
    }
    return copied;
}

function convertContactAddressModelArr(contactAddressScriptModelArr) {
    var contactAddressModelArr = null;
    if (contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0) {
        contactAddressModelArr = aa.util.newArrayList();
        for (loopk in contactAddressScriptModelArr) {
            contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
        }
    }
    return contactAddressModelArr;
}

function copyASIFields(sourceCapId, targetCapId) {
    var ignoreArray = new Array();
    for (var i = 2; i < arguments.length; i++) {
        ignoreArray.push(arguments[i]);
    }
    var targetCap = aa.cap.getCap(targetCapId).getOutput();
    var targetCapType = targetCap.getCapType();
    var targetCapTypeString = targetCapType.toString();
    var targetCapTypeArray = targetCapTypeString.split("/");
    var sourceASIResult = aa.appSpecificInfo.getByCapID(sourceCapId);
    if (sourceASIResult.getSuccess()) {
        var sourceASI = sourceASIResult.getOutput();
    } else {
        aa.print("**ERROR: getting source ASI: " + sourceASIResult.getErrorMessage());
        return false;
    }
    for (ASICount in sourceASI) {
        thisASI = sourceASI[ASICount];
        if (!exists(thisASI.getCheckboxType(), ignoreArray)) {
            thisASI.setPermitID1(targetCapId.getID1());
            thisASI.setPermitID2(targetCapId.getID2());
            thisASI.setPermitID3(targetCapId.getID3());
            thisASI.setPerType(targetCapTypeArray[1]);
            thisASI.setPerSubType(targetCapTypeArray[2]);
            aa.cap.createCheckbox(thisASI);
        }
    }
}

function copyASITables(pFromCapId, pToCapId) {
    var itemCap = pFromCapId;
    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray();
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
            for (var i = 0; i < ignoreArr.length; i++) {
                if (ignoreArr[i] == tn) {
                    ignore = true;
                    break;
                }
            }
            if (ignore) {
                continue;
            }
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
        addASITable(tn, tempArray, pToCapId);
        logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
    }
}

function sendNotificationCon(emailFrom, emailTo, emailCC, templateName, params, reportFile) {
    var itemCap = capId;
    if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
    logDebug("Item cap: " + itemCap.getCustomID());

    var id1 = itemCap.ID1;
    var id2 = itemCap.ID2;
    var id3 = itemCap.ID3;
    var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
    var result = null;
    result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
    if (result.getSuccess()) {
        logDebug("Sent email successfully!");
        return true;
    } else {
        logDebug("Failed to send mail. - " + result.getErrorMessage());
        return false;
    }
}

function addParameter(pamaremeters, key, value) {
    if (key != null) {
        if (value == null) {
            value = "";
        }
        pamaremeters.put(key, value);
    }
}

function updateAppStatus(stat, cmt) {
    var thisCap = capId;
    if (arguments.length > 2) thisCap = arguments[2];
    updateStatusResult = aa.cap.updateAppStatus(thisCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
    if (!updateStatusResult.getSuccess()) {
        logDebug("ERROR: application status update to " + stat + " was unsuccessful.  The reason is " +
            updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
    } else {
        logDebug("Application Status updated to " + stat);
    }
}

function getContactArray() {
    // Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
    // optional capid
    // added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
    // on ASA it should still be pulled normal way even though still partial cap
    var thisCap = capId;
    if (arguments.length == 1) thisCap = arguments[0];
    var cArray = new Array();
    if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
    {
        capContactArray = cap.getContactsGroup().toArray();
    } else {
        var capContactResult = aa.people.getCapContactByCapID(thisCap);
        if (capContactResult.getSuccess()) {
            var capContactArray = capContactResult.getOutput();
        }
    }

    if (capContactArray) {
        for (yy in capContactArray) {
            var aArray = new Array();
            aArray["lastName"] = capContactArray[yy].getPeople().lastName;
            aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
            aArray["firstName"] = capContactArray[yy].getPeople().firstName;
            aArray["middleName"] = capContactArray[yy].getPeople().middleName;
            aArray["businessName"] = capContactArray[yy].getPeople().businessName;
            aArray["contactSeqNumber"] = capContactArray[yy].getPeople().contactSeqNumber;
            aArray["contactType"] = capContactArray[yy].getPeople().contactType;
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
            } else
                var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
            for (xx1 in pa)
                aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

            cArray.push(aArray);
        }
    }
    return cArray;
}

function getAppSpecific(itemName) { // optional: itemCap
    var updated = false;
    var i = 0;
    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    if (useAppSpecificGroupName) {
        if (itemName.indexOf(".") < 0) {
            logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true");
            return false
        }
        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess()) {
        var appspecObj = appSpecInfoResult.getOutput();
        if (itemName != "") {
            for (i in appspecObj) {
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup)) {
                    return appspecObj[i].getChecklistComment();
                    break;
                }
            }
        }
    } else {
        logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())
    }
}

function updateTask(wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
    var useProcess = false;
    var processName = "";
    if (arguments.length > 4) {
        if (arguments[4] != "") {
            processName = arguments[4]; // subprocess
            useProcess = true;
        }
    }
    var itemCap = capId;
    if (arguments.length == 6) {
        itemCap = arguments[5]; // use cap ID specified in args
    }
    var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess()) {
        var wfObj = workflowResult.getOutput();
    } else {
        logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }
    if (!wfstat) {
        wfstat = "NA";
    }
    for (i in wfObj) {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
            var dispositionDate = aa.date.getCurrentDate();
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            if (useProcess) {
                aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
                logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
            } else {
                aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
                logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
            }
        }
    }
}

function dateAdd(td, amt) {
    // perform date arithmetic on a string
    // td can be "mm/dd/yyyy" (or any string that will convert to JS date)
    // amt can be positive or negative (5, -3) days
    if (!td) {
        dDate = new Date();
    } else {
        dDate = convertDate(td);
    }
    //var i = 0;
    //while (i < Math.abs(amt)) 
    //{
    //	dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
    //	i++;
    //}
    dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));
    return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function dateAddMonths(pDate, pMonths) {
    // Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
    // If pDate is null, uses current date
    // pMonths can be positive (to add) or negative (to subtract) integer
    // If pDate is on the last day of the month, the new date will also be end of month.
    // If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, 
    // in which case the new date will be on the last day of the month
    if (!pDate) {
        baseDate = new Date();
    } else {
        baseDate = convertDate(pDate);
    }
    var day = baseDate.getDate();
    baseDate.setMonth(baseDate.getMonth() + pMonths);
    if (baseDate.getDate() < day) {
        baseDate.setDate(1);
        baseDate.setDate(baseDate.getDate() - 1);
    }
    return ((baseDate.getMonth() + 1) + "/" + baseDate.getDate() + "/" + baseDate.getFullYear());
}

function convertDate(thisDate) {
    //converts date to javascript date
    if (typeof (thisDate) == "string") {
        var retVal = new Date(String(thisDate));
        if (!retVal.toString().equals("Invalid Date"))
            return retVal;
    }
    if (typeof (thisDate) == "object") {
        if (!thisDate.getClass) { // object without getClass, assume that this is a javascript date already 
            return thisDate;
        }
        if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) {
            return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }
        if (thisDate.getClass().toString().equals("class java.util.Date")) {
            return new Date(thisDate.getTime());
        }
        if (thisDate.getClass().toString().equals("class java.lang.String")) {
            return new Date(String(thisDate));
        }
    }
    if (typeof (thisDate) == "number") {
        return new Date(thisDate); // assume milliseconds
    }
    logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;
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

function dateDiff(date1, date2) {
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}

function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}

function logDebug(dstr) {
    if (showDebug) {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}

function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}

//
// matches:  returns true if value matches any of the following arguments
//
function matches(eVal, argList) {
    for (var i = 1; i < arguments.length; i++) {
        if (arguments[i] == eVal) {
            return true;
        }
    }
    return false;
}

function loadASITable(tname) {

    //
    // Returns a single ASI Table array of arrays
    // Optional parameter, cap ID to load from
    //

    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();

    while (tai.hasNext()) {
        var tsm = tai.next();
        var tn = tsm.getTableName();

        if (!tn.equals(tname)) continue;

        if (tsm.rowIndex.isEmpty()) {
            logDebug("Couldn't load ASI Table " + tname + " it is empty");
            return false;
        }

        var tempObject = new Array();
        var tempArray = new Array();

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

        }
        tempArray.push(tempObject); // end of record//
    }
    return tempArray;
}

function asiTableValObj(columnName, fieldValue, readOnly) {
    this.columnName = columnName;
    this.fieldValue = fieldValue;
    this.readOnly = readOnly;
    this.hasValue = Boolean(fieldValue != null & fieldValue != "");

    asiTableValObj.prototype.toString = function () {
        return this.hasValue ? String(this.fieldValue) : String("");
    }
}
function capSet(desiredSetId)
    {
    this.refresh = function()
        {

        var theSet = aa.set.getSetByPK(this.id).getOutput();
		this.status = theSet.getSetStatus();
        this.setId = theSet.getSetID();
        this.name = theSet.getSetTitle();
        this.comment = theSet.getSetComment();
		this.model = theSet.getSetHeaderModel();
		this.statusComment = theSet.getSetStatusComment();
		this.type = theSet.getRecordSetType();

        var memberResult = aa.set.getCAPSetMembersByPK(this.id);

        if (!memberResult.getSuccess()) { logDebug("**WARNING** error retrieving set members " + memberResult.getErrorMessage()); }
        else
            {
            this.members = memberResult.getOutput().toArray();
            this.size = this.members.length;
            if (this.members.length > 0) this.empty = false;
            logDebug("capSet: loaded set " + this.id + " of status " + this.status + " with " + this.size + " records");
            }
        }
        
    this.add = function(addCapId) 
        {
        var setMemberStatus;
        if (arguments.length == 2)  setMemberStatus = arguments[1]; 
            
        var addResult = aa.set.add(this.id,addCapId);
		
		if (setMemberStatus) this.updateMemberStatus(addCapId,setMemberStatus);
		
        }
    
	this.updateMemberStatus = function(addCapId,setMemberStatus) {
	
		// Update a SetMember Status for a Record in SetMember List.

        var setUpdateScript = aa.set.getSetDetailsScriptModel().getOutput();
        setUpdateScript.setSetID(this.id);          //Set ID
        setUpdateScript.setID1(addCapId.getID1());
        setUpdateScript.setID2(addCapId.getID2());
        setUpdateScript.setID3(addCapId.getID3());
        setUpdateScript.setSetMemberStatus(setMemberStatus); 
        setUpdateScript.setSetMemberStatusDate(aa.date.getCurrentDate());  
        setUpdateScript.setServiceProviderCode(aa.getServiceProviderCode());

        var addResult = aa.set.updateSetMemberStatus(setUpdateScript);
        
        if (!addResult.getSuccess()) 
            { 
            logDebug("**WARNING** error adding record to set " + this.id + " : " + addResult.getErrorMessage() );
            }
        else 
            { 
            logDebug("capSet: updated record " + addCapId + " to status " + setMemberStatus);
            }
	}			
	
	
    this.remove = function(removeCapId) 
        {
        var removeResult = aa.set.removeSetHeadersListByCap(this.id,removeCapId)
        if (!removeResult.getSuccess()) 
            { 
            logDebug("**WARNING** error removing record from set " + this.id + " : " + removeResult.getErrorMessage() );
            }
        else 
            { 
            logDebug("capSet: removed record " + removeCapId + " from set " + this.id);
            }
        }
    
    this.update = function() 
        {
		var sh = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.SetBusiness").getOutput();
		this.model.setSetStatus(this.status)
        this.model.setSetID(this.setId);
        this.model.setSetTitle(this.name);
		this.model.setSetComment(this.comment);
		this.model.setSetStatusComment(this.statusComment);
		this.model.setRecordSetType(this.type);
		
		logDebug("capSet: updating set header information");
		try {
			updateResult = sh.updateSetBySetID(this.model);
			}
		catch(err) {
            logDebug("**WARNING** error updating set header failed " + err.message);
            }

        }
    
    this.id = desiredSetId;
    this.name = desiredSetId;
    this.type = null;
	this.comment = null;
    
	if (arguments.length > 1 && arguments[1]) this.name = arguments[1];
	if (arguments.length > 2 && arguments[2]) this.type = arguments[2];
    if (arguments.length > 3 && arguments[3]) this.comment = arguments[3];
    
    this.size = 0;
    this.empty = true;
    this.members = new Array();
    this.status = "";
	this.statusComment = "";
	this.model = null;
	
    var theSetResult = aa.set.getSetByPK(this.id);
    
    if (theSetResult.getSuccess())
        {
        this.refresh();
        }
        
    else  // add the set
        {
        theSetResult = aa.set.createSet(this.id,this.name,this.type,this.comment);
        if (!theSetResult.getSuccess()) 
            {
            logDebug("**WARNING** error creating set " + this.id + " : " + theSetResult.getErrorMessage);
            }
        else
            {
            logDebug("capSet: Created new set " + this.id + " of type " + this.type); 
            this.refresh();
            }
        }
    }


    function addToSet(addToSetCapId, setPrefix, setType) {
        var startDate = new Date();
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
                    logDebug("Members Exist.");
                    break;
                }
    
            }
            if (!memberExists)
            logDebug("Members do not Exist.");
    logDebug("Adding: " + addToSetCapId.getCustomID());
                aa.set.add(setName,addToSetCapId);
        }
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
        setScript.setAuditID("ADMIN");
    
        var setCreateResult = aa.set.createSetHeader(setScript);
    
        return setCreateResult.getSuccess();
    }