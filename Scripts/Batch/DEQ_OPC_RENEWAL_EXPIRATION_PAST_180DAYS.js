/*------------------------------------------------------------------------------------------------------/
| Program: DEQ_OPC_RENEWAL_EXPIRATION_180DAYS.js  Trigger: Batch| 
| 
| This batch script will run daily to send email notification to all contacts and :Past 180 days 
| the expiration 
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS 
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true;// Set to true to see debug messages in email confirmation
var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60
var showMessage = true;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var timeExpired = false;
var br = "<BR>";
var emailAddress = "ada.chan@suffolkcountyny.com";//email to send report
var lockParentLicense = "N";
var capId;;
var cap;
var appTypeArray;
var appExpDateCon;
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) 
{
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
{
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
// all record types to check
var rtArray = ["DEQ/OPC/Swimming Pool/Application", "DEQ/OPC/Hazardous Tank/Application", "DEQ/OPC/Global Containment/Application"];
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS//
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
var paramsOK = true;

if (paramsOK) 
{
	logDebug("Start Date: " + startDate + br);
	logDebug("Starting the timer for this job.  If it takes longer than 5 minutes an error will be listed at the bottom of the email." + br);
	if (!timeExpired) 
	{
		mainProcess();
		//logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
		logDebug("End Date: " + startDate);
		aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "Batch Job - DEQ_OPC_RENEWAL_EXPIRATION", emailText);
	}
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() 
{
    logDebug("Batch script will run");
    try 
    {
		var count = 0; 
        for (var i in rtArray) 
        {
            var thisType = rtArray[i];
            var capModel = aa.cap.getCapModel().getOutput();
            appTypeArray = thisType.split("/");
            // Specify the record type to query
            capTypeModel = capModel.getCapType();
            capTypeModel.setGroup(appTypeArray[0]);
            capTypeModel.setType(appTypeArray[1]);
            capTypeModel.setSubType(appTypeArray[2]);
            capTypeModel.setCategory(appTypeArray[3]);
            capModel.setCapType(capTypeModel);
            //capModel.setCapStatus(sArray[i]); if needed

            var recordListResult = aa.cap.getCapIDListByCapModel(capModel);
            if (!recordListResult.getSuccess()) 
            {
                logDebug("**ERROR: Failed to get capId List : " + recordListResult.getErrorMessage());
                continue;
            }
            var recArray = recordListResult.getOutput();
            logDebug("Looping through " + recArray.length + " records of type " + thisType);

            for (var j in recArray) 
            {
                capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput();                
                capIDString = capId.getCustomID();
                
                cap = aa.cap.getCap(capId).getOutput();	
                // TEST only: Use these 3 records for TESTING ONLY. TO BE REMOVED.
                //if (cap && ((capIDString == "T-HM-21-00082" || capIDString == "GC-21-00001" || capIDString == "SP-21-00008")))
				if (cap)
                {
                    logDebug("-> Looping to record: " + capIDString);
                    var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                    if(capmodel.isCompleteCap())
                    {
                        b1ExpResult = aa.expiration.getLicensesByCapID(capId)
                        if (b1ExpResult.getSuccess())
                        {
                            var b1Exp = b1ExpResult.getOutput();
                            var curExp = b1Exp.getExpDate();

                            if (curExp != null)
                            {                                
                                var expDateCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
                                logDebug("Current expiration date: " + expDateCon);
                                       
								 // 90 days after expiration for condition
								 var ninetyDay = new Date(dateAdd(curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear(), 90));
								 var ninetyDayCon = (ninetyDay.getMonth() + 1) + "/" + ninetyDay.getDate() + "/" + ninetyDay.getFullYear();
								 //logDebug("90 days after expiration date is: " + ninetyDayCon);
 
                               
                                // more than 180 days expired
                                var longExpDate = new Date(dateAdd((startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear(), -180));                                    
                                var past180DateCon = (longExpDate.getMonth() + 1) + "/" + longExpDate.getDate() + "/" + longExpDate.getFullYear();
                                logDebug("past180DateCon: " + past180DateCon);
                                var todaysDate = new Date();	
								var todayDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());

                                // Past 180 days or more
                                var dateDiff = parseFloat(dateDifference(todayDateCon, expDateCon));
                                logDebug("Day difference is: " + dateDiff);
                                               

                                if (dateDiff == -180) // The expiration date passed exactly 180 days 
                                {
									logDebug("*** " + capIDString + " has expired 180 days on " + todayDateCon + "***");
									count++;
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
                                        if (fTask.getTaskDescription() != null && (fTask.getTaskDescription() == ("Inspections")))
                                        {    
											if (fTask.getActiveFlag().equals("Y")) 
											{										        
										
												logDebug("Past 180 days: " + dateDiff);    
												logDebug("Get conditions on :" + capIDString);
												
												
											
												//addStdCondition("DEQ", "Lock", capId);     
												//aa.addCapCondition(capId, "DEQ", "Permit to Construct Expired > 90 days", "Permit to Construct",  ninetyDayCon,ninetyDayCon,null,null,null,null,
												//"Appliced(Applied)", null, null, null )		
												//capConditionScriptModels = s_result.getOutput();
												//debugObject(capConditionScriptModels);
												//logDebug("capConditionScriptModels : " + capConditionScriptModels);
												//logDebug("capConditionScriptModels.length: " + capConditionScriptModels.length);
												
												var conditionType = "DEQ";
												var conditionName = "Permit to Construct Expired > 90 days";
												var alreadyExisted = false;
		

												var capConditions = getCapConditionByCapID(capId);
												if (capConditions != null)
												{
													logDebug("Found Condition." + capConditions.length);
													// First check if there is already "Permit to Construct" condition, if there is, do not add.\
													for (loopk in capConditions)
													{
														sourceCapCondition = capConditions[loopk];
														if (sourceCapCondition.getConditionDescription() == conditionName)
														{
															alreadyExisted = true;
															logDebug("Already existed:"  + conditionName);
															break;
														}
													}
												}
												// No Permit to Construct Condition is found
												if (!alreadyExisted)
												{
													standardConditions = aa.capCondition.getStandardConditions("DEQ","Lock").getOutput();
													if (standardConditions.length > 0)
													{
														standardCondition = standardConditions[0]																											
														var conditionNbr = standardCondition.getConditionNbr();
														// Create lock base on the standard DEQ -> Lock Condition									
														var newConditionResult = aa.capCondition.createCapConditionFromStdCondition(capId, standardCondition.getConditionNbr())
														logDebug ("Added lock on: " + capIDString);
		
														if (newConditionResult.getSuccess()) {
															var newConditionObj = newConditionResult.getOutput();
															logDebug ("**********");
															debugObject(newConditionObj);	
															logDebug ("**********");																									
															logDebug(newConditionObj.toString());
														}
													
														logDebug("Find the newly created condition for :" + capIDString);
														var capConditions = getCapConditionByCapID(capId);
														logDebug("Length: " + capConditions.length);
														for (loopk in capConditions)
														{
															sourceCapCondition = capConditions[loopk];
															var issuedDate = sourceCapCondition.getIssuedDate();																
															issuedDateDate =  new Date(issuedDate.getMonth() + "/" + issuedDate.getDayOfMonth() + "/" + issuedDate.getYear());	
															var issuedDataCon = (issuedDateDate.getMonth() + 1) + "/" + issuedDateDate.getDate() + "/" + (issuedDateDate.getFullYear());
															var statusDate = sourceCapCondition.getStatusDate();											
															var statusDateDate = new Date(statusDate.getMonth() + "/" + statusDate.getDayOfMonth() + "/" + statusDate.getYear());																	
															var statusDateCon = (statusDateDate.getMonth() + 1) + "/" + statusDateDate.getDate() + "/" + (statusDateDate.getFullYear());	
																												
															if (statusDateCon == todayDateCon &&
																sourceCapCondition.getConditionDescription() == "Lock" &&
																sourceCapCondition.getConditionComment() == "Lock")														
															{
																logDebug("Found this conition with status date: " + statusDateCon);
															
																logDebug("getConditionDescription: " + sourceCapCondition.getConditionDescription());
																logDebug("getConditionNumber: " + sourceCapCondition.getConditionNumber());
																logDebug("getConditionGroup: " + sourceCapCondition.getConditionGroup());
																logDebug("getAppliedDepartmentName: " + sourceCapCondition.getAppliedDepartmentName());
																
																//logDebug("getCapConditionModel() : " + sourceCapCondition.getCapConditionModel());
																//logDebug("getConditionSource() : " + sourceCapCondition.getConditionSource());
															
																sourceCapCondition.setConditionDescription(conditionName);
																sourceCapCondition.setDisplayNoticeOnACA("Y");													
																sourceCapCondition.setConditionComment("Permit to Construct Expired more than 90 days; this applicaiton record has been CLOSED.");																																		
																var dateToSet = aa.date.parseDate(ninetyDayCon);
																sourceCapCondition.setIssuedDate(dateToSet);
																sourceCapCondition.setStatusDate(null);
																sourceCapCondition.setEffectDate(dateToSet);
																		
																var user = aa.people.getUsersByUserIdAndName("", "", "", "OPC");
		
																if (user != null) 
																{		
																	userOut = user.getOutput();
																	if (userOut != null)
																	{             
																		assUserStr = userOut[0].toString();
																		assUsersplit = assUserStr.split("/");
																		assName = assUsersplit[6];
																		if (assName != undefined)
																		{
																			assignEmail = userOut[0].getEmail();
																			assignTitle = userOut[0].getTitle();
																			logDebug("Assigned User is: " + assName + " and their title is: " + assignTitle);

																		}
																	}
																}
																
																aa.capCondition.editCapCondition(sourceCapCondition);	
																break;
															}
														}
													}
												}										
												
												
												var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
												acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
												var projectName = workDescGet(capId);

												var emailParams = aa.util.newHashtable();  
												var conArray = getContactArray();

												for (con in conArray)
												{		
													var address1 = conArray[con].addressLine1;				
													var city = conArray[con].city;
													var state = conArray[con].state;
													var zip = conArray[con].zip;											
													addParameter(emailParams, "$$ALTID$$", capIDString);
													addParameter(emailParams, "$$shortnotes$$", projectName);
													addParameter(emailParams, "$$address1$$", address1);
													addParameter(emailParams, "$$city$$", city);
													addParameter(emailParams, "$$state$$", state);
													addParameter(emailParams, "$$zip$$", zip);	                                                    
													addParameter(emailParams, "$$expireDate$$", expDateCon);	 
													addParameter(emailParams, "$$expireDate90$$",ninetyDayCon);
													addParameter(emailParams, "$$acaURL$$", acaSite);
													addParameter(emailParams, "$$DAY$$", "180 DAYS PAST THE EXPIRATION DATE");
													conEmail2 = conArray[con].email;
													if (conEmail2 != null)
													{
														logDebug("Sending email to contact: " + conEmail2); 
														sendNotification("", conEmail2, "", "DEQ_OPC_PERMIT_TO_CONSTRUCT_RENEWAL_180_DAYS", emailParams, null);
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
													lpEmail = lpArr[lp].getEmail();                                                 
													var address1 = lpArr[lp].addressLine1;				
													var city = lpArr[lp].city;
													var state = lpArr[lp].state;
													var zip = lpArr[lp].zip;											
													addParameter(lpEmailParams, "$$ALTID$$", capIDString);
													addParameter(lpEmailParams, "$$shortnotes$$", projectName);
													addParameter(lpEmailParams, "$$address1$$", address1);
													addParameter(lpEmailParams, "$$city$$", city);
													addParameter(lpEmailParams, "$$state$$", state);
													addParameter(lpEmailParams, "$$zip$$", zip);	                                                    
													addParameter(lpEmailParams, "$$expireDateD$$", expDateCon);	                                                    
													addParameter(lpEmailParams, "$$expireDate90$$",ninetyDayCon);
													addParameter(lpEmailParams, "$$acaURL$$", acaSite);
													addParameter(lpEmailParams, "$$DAY$$", "180 DAYS PAST THE EXPIRATION DATE");
													if (lpEmail != null)
													{
														logDebug("Sending email to: " + lpEmail); 
														sendNotification("", lpEmail, "", "DEQ_OPC_PERMIT_TO_CONSTRUCT_RENEWAL", lpEmailParams, null);
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
    catch (err) 
    {
        logDebug("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
	logDebug("Total of " + count + " records have expired at 180 days");
    logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");    
}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function isMatchCapCondition(capConditionScriptModel1, capConditionScriptModel2)
{
  if (capConditionScriptModel1 == null || capConditionScriptModel2 == null)
  {
    return false;
  }
  var description1 = capConditionScriptModel1.getConditionDescription();
  var description2 = capConditionScriptModel2.getStreetName();
  if ((description1 == null && description2 != null) 
    || (description1 != null && description2 == null))
  {
    return false;
  }
  if (description1 != null && !description1.equals(description2))
  {
    return false;
  }
  var conGroup1 = capConditionScriptModel1.getConditionGroup();
  var conGroup2 = capConditionScriptModel2.getConditionGroup();
  if ((conGroup1 == null && conGroup2 != null) 
    || (conGroup1 != null && conGroup2 == null))
  {
    return false;
  }
  if (conGroup1 != null && !conGroup1.equals(conGroup2))
  {
    return false;
  }
  return true;
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

function getCapConditionByCapID(capId) {
    capConditionScriptModels = null;
  
    var s_result = aa.capCondition.getCapConditions(capId);
    if (s_result.getSuccess()) {
      capConditionScriptModels = s_result.getOutput();
      if (
        capConditionScriptModels == null ||
        capConditionScriptModels.length == 0
      ) {
        aa.print("WARNING: no cap condition on this CAP:" + capId);
        capConditionScriptModels = null;
      }
    } else {
      aa.print(
        "ERROR: Failed to get cap condition: " + s_result.getErrorMessage()
      );
      capConditionScriptModels = null;
    }
    return capConditionScriptModels;
  }

function addStdCondition(cType,cDesc)
{
    if (!aa.capCondition.getStandardConditions)
    {
        aa.print("addStdCondition function is not available in this version of Accela Automation.");
    }
    else
    {
        standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
        for(i = 0; i<standardConditions.length;i++)
        {
        standardCondition = standardConditions[i]
        aa.capCondition.createCapConditionFromStdCondition(capId, standardCondition.getConditionNbr())
        }        
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

function workDescGet(pCapId)
	{
	//Gets work description
	//07SSP-00037/SP5017
	//
	var workDescResult = aa.cap.getCapWorkDesByPK(pCapId);
	
	if (!workDescResult.getSuccess())
		{
		logDebug("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage()); 
		return false;
		}
		
	var workDescObj = workDescResult.getOutput();
	var workDesc = workDescObj.getDescription();
	
	return workDesc;
	}


function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
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

function addFee(fcode, fsched, fperiod, fqty, finvoice)
{
	var feeCap = capId;
	var feeCapMessage = "";
	var feeSeq_L = new Array(); //invoicing fee for CAP in args
	var paymentPeriod_L = new Array(); //invoicing pay periods for CAP in args
	var feeSeq = null;
	if (arguments.length > 5)
	{
		feeCap = arguments[5]; //use cap ID specified in args
		feeCapMessage = " to specified CAP";
	}
	assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
	if (assessFeeResult.getSuccess())
	{
		feeSeq = assessFeeResult.getOutput();
		logDebug("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
		logDebug("The assessed fee Sequence Number " + feeSeq + feeCapMessage);
		if (finvoice == "Y" && arguments.length == 5) // use current CAP
		{
			feeSeqList.push(feeSeq);
			paymentPeriodList.push(fperiod);
		}
		if (finvoice == "Y" && arguments.length > 5) // use CAP in args
		{
			feeSeq_L.push(feeSeq);
			paymentPeriod_L.push(fperiod);
			var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
			if (invoiceResult_L.getSuccess())
			{
				logDebug("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			}
			else
			{
				logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
			}
		}
		updateFeeItemInvoiceFlag(feeSeq, finvoice);
	} 
	else 
	{
		logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
		feeSeq = null;
	}
	return feeSeq;
}

function updateFeeItemInvoiceFlag(feeSeq, finvoice)
{
	if(feeSeq == null)
		return;
	if(!cap.isCompleteCap())
	{
		var feeItemScript = aa.finance.getFeeItemByPK(capId,feeSeq);
		if(feeItemScript.getSuccess)
		{
			var feeItem = feeItemScript.getOutput().getF4FeeItem();
			feeItem.setAutoInvoiceFlag(finvoice);
			aa.finance.editFeeItem(feeItem);
		}
	}
}


function getAppSpecific(itemName) { // optional: itemCap
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
	
	if (useAppSpecificGroupName) {
		if (itemName.indexOf(".") < 0) {
			logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); 
			return false 
		}
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess()) {
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "") {
			for (i in appspecObj) {
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
			}
		}
	} else { 
		logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())
	}
}
function copyContacts(pFromCapId, pToCapId) 
{
	if (pToCapId == null)
	{
		var vToCapId = capId;
	}
	else
	{
		var vToCapId = pToCapId;
	}
	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess()) 
	{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) 
		{
			var newContact = Contacts[yy].getCapContactModel();
			// Retrieve contact address list and set to related contact
			var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
			if (contactAddressrs.getSuccess()) 
			{
				var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
				newContact.getPeople().setContactAddressList(contactAddressModelArr);
			}
			newContact.setCapID(vToCapId);
			// Create cap contact, contact address and contact template
			aa.people.createCapContactWithAttribute(newContact);
			copied++;
			logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
		}
	}
	else 
	{
		logDebug("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return copied;
}

function convertContactAddressModelArr(contactAddressScriptModelArr) 
{
	var contactAddressModelArr = null;
	if (contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0) 
	{
		contactAddressModelArr = aa.util.newArrayList();
		for (loopk in contactAddressScriptModelArr) 
		{
			contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
		}
	}
	return contactAddressModelArr;
}

function copyASIFields(sourceCapId,targetCapId)
{
	var ignoreArray = new Array();
	for (var i = 2; i < arguments.length; i++)
	{
		ignoreArray.push(arguments[i]);
	}
	var targetCap = aa.cap.getCap(targetCapId).getOutput();
	var targetCapType = targetCap.getCapType();
	var targetCapTypeString = targetCapType.toString();
	var targetCapTypeArray = targetCapTypeString.split("/");
	var sourceASIResult = aa.appSpecificInfo.getByCapID(sourceCapId);
	if (sourceASIResult.getSuccess())
	{ 
		var sourceASI = sourceASIResult.getOutput(); 
	}
	else
	{ 
		aa.print( "**ERROR: getting source ASI: " + sourceASIResult.getErrorMessage());
		return false;
	}
	for (ASICount in sourceASI)
	{
		thisASI = sourceASI[ASICount];
		if (!exists(thisASI.getCheckboxType(),ignoreArray))
		{
			thisASI.setPermitID1(targetCapId.getID1());
			thisASI.setPermitID2(targetCapId.getID2());
			thisASI.setPermitID3(targetCapId.getID3());
			thisASI.setPerType(targetCapTypeArray[1]);
			thisASI.setPerSubType(targetCapTypeArray[2]);
			aa.cap.createCheckbox(thisASI);
		}
	}
}

function copyASITables(pFromCapId, pToCapId) 
{
	var itemCap = pFromCapId;
	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray();
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
			{
				if (ignoreArr[i] == tn) 
				{
					ignore = true;
					break;
				}
			}
			if (ignore)
			{
				continue;
			}
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

function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile)
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

function addParameter(pamaremeters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		pamaremeters.put(key, value);
	}
}
function getDepartmentName(username)
	{
	var suo = aa.person.getUser(username).getOutput(); 
	var dpt = aa.people.getDepartmentList(null).getOutput();
	for (var thisdpt in dpt)
	  	{
	  	var m = dpt[thisdpt]
	  	var  n = m.getServiceProviderCode() + "/" + m.getAgencyCode() + "/" + m.getBureauCode() + "/" + m.getDivisionCode() + "/" + m.getSectionCode() + "/" + m.getGroupCode() + "/" + m.getOfficeCode() 
	  
	  	if (n.equals(suo.deptOfUser)) 
	  	return(m.getDeptName())
  		}
  	}
  
function updateAppStatus(stat,cmt) 
{
	var thisCap = capId;
	if (arguments.length > 2) thisCap = arguments[2];
	updateStatusResult = aa.cap.updateAppStatus(thisCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
	if (!updateStatusResult.getSuccess()) 
	{
		logDebug("ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + 
		updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	} 
	else 
	{
		logDebug("Application Status updated to " + stat);
	}
}

function getOutput(result, object) {
    if (result.getSuccess()) {
        return result.getOutput();
    } else {
        logDebug("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
        return null;
    }
}

function getContactArray()
{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];
	var cArray = new Array();
	if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
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

function getAppSpecific(itemName) { // optional: itemCap
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
	
	if (useAppSpecificGroupName) {
		if (itemName.indexOf(".") < 0) {
			logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); 
			return false 
		}
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess()) {
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "") {
			for (i in appspecObj) {
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
			}
		}
	} else { 
		logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())
	}
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

function dateAdd(td,amt) 
{
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	if (!td) 
	{
		dDate = new Date();
	} 
	else 
	{
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
	if (typeof(thisDate) == "string") {
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
		return retVal;
	}
	if (typeof(thisDate)== "object") {
		if (!thisDate.getClass) {// object without getClass, assume that this is a javascript date already 
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
	if (typeof(thisDate) == "number") {
		return new Date(thisDate);  // assume milliseconds
	}
	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;
}

function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null) {
		if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
			return (pJavaScriptDate.getMonth()+1).toString()+"/"+pJavaScriptDate.getDate()+"/"+pJavaScriptDate.getFullYear();
		} else {
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
		}
	} else {
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
	}
}

function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

function debugObject(object) {
	 var output = ''; 
	 for (property in object) { 
	   output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	 } 
	 logDebug(output);
} 

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}

function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
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
function isOdd(n) 
{
   return Math.abs(n % 2) == 1;
}
function isEven(n) 
{
    return n % 2 == 0;
}