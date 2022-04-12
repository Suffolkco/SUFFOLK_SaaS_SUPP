/*-------------------------------------------------------------------------------------------------------------------------/
| Program: IA_RENEWAL_SET_TO_EXPIRED.js  Trigger: Batch
| Version 1.0 Zachary McVicker 01/04/2018
| This batch script will run daily. 
| This will send an email notification to the Property Owner, update expiration to About to Expire, and add records to the set. 
/---------------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true; // Set to true to see debug messages in email confirmation//
var maxSeconds = 60 * 5; // number of seconds allowed for batch processing, usually < 5*60
var showMessage = false;
var useAppSpecificGroupName = false;
var br = "<BR>";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
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
var todaysDate = new Date();																
var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
								

// all record types to check
var rtArray = ["DEQ/Ecology/IA/Application"];
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

        for (var j in recArray)
        {
            var conEmail = "";
            capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput(); // reload since it's 	capId = aa.cap.getCapID();
            capIDString = capId.getCustomID();
            cap = aa.cap.getCap(capId).getOutput();
            if (cap)
            {
                var appStatus = getAppStatus();
                
                var expDateCon = getAppSpecific("Contract Expiration Date", capId);
                var pin = getAppSpecific("IA PIN Number", capId);
                if (expDateCon != null)
                {
                
                var dateDiffernce = parseFloat(dateDifference(todDateCon, expDateCon));
                } 

                

                // Due today	
                if (expDateCon != null &&dateDiffernce == 0)                             
                {
                    logDebug("Record: " + capId.getCustomID() + " Status: " + appStatus);
                    logDebug("ExpDateCon = " + expDateCon);
                    updateAppStatus("Expired", "");
                    logDebug("dateDiff is: " + dateDiffernce); 
                    logDebug("Just set: " + capId.getCustomID() + " to expired.");
                    addToSet(capId, "IARENEWAL", "Ecology Renewals");
                                    var contactArray = getPeople(capId);
                                if(contactArray)
						{
                                    for(thisContact in contactArray) {			
                                        if((contactArray[thisContact].getPeople().contactType).toUpperCase() == "PROPERTY OWNER")
                                        {
                                            //var reportParams = aa.util.newHashtable();
                                           // var reportFile = new Array();
                                            var itemCap = aa.cap.getCap(capId).getOutput();
                                            appTypeResult = itemCap.getCapType();
                                            appTypeString = appTypeResult.toString(); 
                                            appTypeArray = appTypeString.split("/");
                                                   
                                                // reportParams.put("RECORD_ID", capId.getCustomID());
                                        
                                                // rFile = generateReport('IA Registration Renewal Reminder',reportParams, 'DEQ')

                                                // if (rFile) {
                                                //     reportFile.push(rFile);
                                                //     }

                                                var licProfResult = aa.licenseScript.getLicenseProf(capId);
                                                var capLPs = licProfResult.getOutput();
                                                logDebug ("capLps = " + capLPs)
                                                for (l in capLPs)
                                                {
                                                    if (capLPs[l].getLicenseType() == "IA Installer")
                                                    
                                                {
                                                    lpBusType = capLPs[l].getBusinessName();
                                                    logDebug("business name = " + lpBusType)
                                                    lpFirstName = capLPs[l].getLicenseProfessionalModel().getContactFirstName();
                                                    logDebug("first name = " + lpFirstName);
                                                    lpLastName = capLPs[l].getLicenseProfessionalModel().getContactLastName();
                                                    logDebug("last name = " + lpLastName);
                                                    lpemail = capLPs[l].getLicenseProfessionalModel().getEmail().toString();
                                                    logDebug("email = " + lpemail);
                                                    lpPhone = capLPs[l].getLicenseProfessionalModel().getPhone1();
                                                    logDebug ("phone = " + lpPhone);
                                                }
                                                }    

                                            var params = aa.util.newHashtable(); 
                                            var PropertyOwnerEmail = contactArray[thisContact].getPeople().email;
                                            var addrResult = getAddressInALine(capId);
                                            addParameter(params, "$$altId$$", capId.getCustomID());
                                            addParameter(params, "$$ADDRESS$$", addrResult);
                                            addParameter(params, "$$BusinessName$$", lpBusType);
                                            addParameter(params, "$$FirstName$$", lpFirstName);
                                            addParameter(params, "$$LastName$$", lpLastName);
                                            addParameter(params, "$$Email$$", lpemail);
                                            addParameter(params, "$$Phone$$", lpPhone);
                                            addParameter(params, "$$PIN$$", pin);
                                            sendNotification("noreplyehims@suffolkcountyny.gov",PropertyOwnerEmail,"","IARENEWALEXPIRED",params,null);
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


function convertDate(thisDate)
{

if (typeof(thisDate) == "string")
    {
    var retVal = new Date(String(thisDate));
    if (!retVal.toString().equals("Invalid Date"))
        return retVal;
    }

if (typeof(thisDate)== "object")
    {

    if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
        {
        return thisDate;
        }

    if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
        {
        return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }
        
    if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
        {
        return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }			

    if (thisDate.getClass().toString().equals("class java.util.Date"))
        {
        return new Date(thisDate.getTime());
        }

    if (thisDate.getClass().toString().equals("class java.lang.String"))
        {
        return new Date(String(thisDate));
        }
    if (thisDate.getClass().toString().equals("class java.sql.Timestamp"))
        {
        return new Date(thisDate.getMonth() + "/" + thisDate.getDate() + "/" + thisDate.getYear());
        }
    }

if (typeof(thisDate) == "number")
    {
    return new Date(thisDate);  // assume milliseconds
    }

logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
return null;

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
 
 
 
function getContactParams4Notification(params,conType) {

	// pass in a hashtable and it will add the additional parameters to the table

	// pass in contact type to retrieve



	contactArray = getContactArray();



	for(ca in contactArray) {

		thisContact = contactArray[ca];



		if (thisContact["contactType"] == conType) {



			conType = conType.toLowerCase();



			addParameter(params, "$$" + conType + "LastName$$", thisContact["lastName"]);

			addParameter(params, "$$" + conType + "FirstName$$", thisContact["firstName"]);

			addParameter(params, "$$" + conType + "MiddleName$$", thisContact["middleName"]);

			addParameter(params, "$$" + conType + "BusinesName$$", thisContact["businessName"]);

			addParameter(params, "$$" + conType + "ContactSeqNumber$$", thisContact["contactSeqNumber"]);

			addParameter(params, "$$" + conType + "$$", thisContact["contactType"]);

			addParameter(params, "$$" + conType + "Relation$$", thisContact["relation"]);

			addParameter(params, "$$" + conType + "Phone1$$", thisContact["phone1"]);

			addParameter(params, "$$" + conType + "Phone2$$", thisContact["phone2"]);

			addParameter(params, "$$" + conType + "Email$$", thisContact["email"]);

			addParameter(params, "$$" + conType + "AddressLine1$$", thisContact["addressLine1"]);

			addParameter(params, "$$" + conType + "AddressLine2$$", thisContact["addressLine2"]);

			addParameter(params, "$$" + conType + "City$$", thisContact["city"]);

			addParameter(params, "$$" + conType + "State$$", thisContact["state"]);

			addParameter(params, "$$" + conType + "Zip$$", thisContact["zip"]);

			addParameter(params, "$$" + conType + "Fax$$", thisContact["fax"]);

			addParameter(params, "$$" + conType + "Notes$$", thisContact["notes"]);

			addParameter(params, "$$" + conType + "Country$$", thisContact["country"]);

			addParameter(params, "$$" + conType + "FullName$$", thisContact["fullName"]);

		}

	}



	return params;	

}


function getPeople(capId)

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

			aa.print("WARNING: no People on this CAP:" + capId);

			capPeopleArr = null;

		}

	}

	else

	{

		aa.print("ERROR: Failed to People: " + s_result.getErrorMessage());

		capPeopleArr = null;	

	}

	return capPeopleArr;

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

    var sysDate = todDateCon;
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
    var setName = setPrefix + " " +  (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + sysDateArray[2];
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
function generateReport(aaReportName,parameters,rModule) {
	var reportName = aaReportName;
      
    report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
  
    report.setModule(rModule);
    report.setCapId(capId);

    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName,"ADMIN");

    if(permit.getOutput().booleanValue()) {
       var reportResult = aa.reportManager.getReportResult(report);
     
       if(reportResult) {
	       reportResult = reportResult.getOutput();
	       var reportFile = aa.reportManager.storeReportToDisk(reportResult);
			logDebug("Report Result: "+ reportResult);
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