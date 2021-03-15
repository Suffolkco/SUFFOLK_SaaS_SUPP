/*------------------------------------------------------------------------------------------------------/
| Program: wwwExpireWorkflowTask.js  Trigger: Batch
| Client: Andy Aguirre
| Version 1.0 Ada Chan 03/04/2019
| This batch script will run daily
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS 
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = false;// Set to true to see debug messages in email confirmation
var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60
var showMessage = false;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var timeExpired = false;
var br = "<BR>";
var emailAddress = "ada.chan@suffolkcountyny.gov";//email to send report
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
var rtArray = ["DEQ/WWM/STP/Upgrade"];
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
		processComResSub();
		//logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
		//logDebug("End Date: " + startDate);
		aa.sendMail("noreplyehims@suffolkcountyny.gov", emailAddress, "", "Batch Job - wwmExpireWorkflowTask", emailText);
	}
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
function processComResSub() 
{
    try 
    {
        for (var i in rtArray) 
        {
            var thisType = rtArray[i];
            var capModel = aa.cap.getCapModel().getOutput();
            var appTypeArray = thisType.split("/");
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
            logDebug("<b>" + thisType + "</b>");

            for (var j in recArray) 
            {
                capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput();
				capIDString = capId.getCustomID();


                cap = aa.cap.getCap(capId).getOutput();	
                if (cap)
                {
					
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
                        var fTask = wfObj[i];            
						
						logDebug("Debug Starts here..");
						//debugObject(fTask);
													
							var emailParams = aa.util.newHashtable();
							var taskDescrip = fTask.getTaskDescription();				
							
							// Must put this one first in order to get the  Order of Consent Date
							if (fTask.getDisposition() != null && taskDescrip == "Order on Consent")
							{
								var orderDate =  fTask.getAssignmentDate();	
								if (orderDate != null)
								{
									orderDateCon = (orderDate.getMonth()) + "/" + orderDate.getDayOfMonth() + "/" + orderDate.getYear();
									logDebug("Order on Consent Assign Date is: " + orderDateCon);	
								}
							}

							var dueDate =  fTask.getDueDate();		

							if (dueDate != null && orderDate != null)							
							{
								dueDateCon = dueDate.getMonth() + "/" + dueDate.getDayOfMonth() + "/" + dueDate.getYear();
								logDebug("Due Date is: " + dueDateCon);					
							
								var todaysDate = new Date();																
								var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
									
								logDebug("Today Date is: " + todDateCon);	
								
								var dateDiff = parseFloat(dateDifference(todDateCon, dueDateCon));

								logDebug("dateDiff is: " + dateDiff);
																
								// Due today
								if (dateDiff == 0)
								{					
									logDebug("In dateDiff loop: " + dateDiff);	

									var assignUser = aa.people.getUsersByUserIdAndName("", fTask.getAssignedStaff().getFirstName(),fTask.getAssignedStaff().getMiddleName(),fTask.getAssignedStaff().getLastName());

									logDebug("AssignUser varialble:" + assignUser);	
									logDebug("Active Falg: " + fTask.getActiveFlag());									
									//logDebug("fTask.getTaskDisposition() : " + fTask.getTaskDisposition() );
									logDebug("Task is: " + taskDescrip);

									if (fTask.getActiveFlag().equals("Y") && assignUser != null && taskDescrip != "Order on Consent")
									{						
										userOut = getOutput(assignUser);
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

										// Get 10 business days from start date	.
										var inTenDaysDate = getDateFromNumWorkDays(todaysDate, 10);
										inTenDaysDateCon = (inTenDaysDate.getMonth() +1)  + "/" + inTenDaysDate.getDate()  + "/" + inTenDaysDate.getFullYear();
										logDebug("Ten business days from today is: " + inTenDaysDateCon);		

										//if (dueDateCon != null && dueDateCon == todDateCon)
										{
											logDebug("<b>" + capIDString + "</b>" + " is expiring today, sending notification to LP");
											
											var conArray = getContactArray();
											var conEmail = [];
											var altId = capId.getCustomID();
											var busFacName = getAppSpecific("Business of Facility Name", capId);
											var assignedDate = fTask.getAssignmentDate();
											assignedDateCon = (assignedDate.getMonth()) + "/" + assignedDate.getDayOfMonth()+ "/" + assignedDate.getYear();
											assignedStaffNameCon = fTask.getAssignedStaff().getFirstName() + " " + fTask.getAssignedStaff().getLastName();
											//debugObject(fTask);

											addParameter(emailParams, "$$todayDate$$", todDateCon);
											addParameter(emailParams, "$$dueDate$$", dueDateCon);
											addParameter(emailParams, "$$TASKDESC$$", fTask.getTaskDescription());
											addParameter(emailParams, "$$ALTID$$", altId);
											addParameter(emailParams, "$$capName$$", appTypeArray[1]);
											addParameter(emailParams, "$$getAssignedStaff$$", assignedStaffNameCon);
											addParameter(emailParams, "$$tenBusinessDays$$", inTenDaysDateCon);
											addParameter(emailParams, "$$assignmentDate$$", assignedDateCon);
											addParameter(emailParams, "$$assignmentName$$", assignedStaffNameCon);
											addParameter(emailParams, "$$assignedStaffTitle$$", assignTitle);
											addParameter(emailParams, "$$busFacName$$", busFacName);
											addParameter(emailParams, "$$orderOfConsentDate$$", orderDateCon);

											//logDebug("DEBUG Assigned STAFF");
											//debugObject(fTask.getAssignedStaff());
											logDebug("Assigned Date:" + assignedDateCon);
											logDebug("Ten business days:" + inTenDaysDate);
											logDebug("Assigned Staff:" + assignedStaffNameCon);
											logDebug("Assigned Staff Title:" + assignTitle);
										}
																
										// Find property owner and engineer, send email.
										if (fTask.getAssignedStaff() != null)
										{
											for (con in conArray)
											{
												if (conArray[con].contactType == "Property Owner")
												{
													propertyOwner = conArray[con];
													var propFirstName = propertyOwner.firstName;
													var propLastName = propertyOwner.lastName;
													var propFullName = propertyOwner.fullName;
													var propAdd1 = propertyOwner.addressLine1;
													var propAdd2 = propertyOwner.addressLine2;
													var propCity = propertyOwner.city;
													var propState = propertyOwner.state;
													var propZip = propertyOwner.zip;
													var orgName = propertyOwner.businessName;

													logDebug("Property Owner info: ");
													logDebug("First:" + propFirstName);
													logDebug("Last:" + propLastName);
													logDebug("Full:" + propFullName);
													logDebug("Add1:" + propAdd1);
													logDebug("Add2" + propAdd2);
													logDebug("City:" + propCity);
													logDebug("State:" + propState);
													logDebug("Zip:" + propZip);
													logDebug("Email:" + propertyOwner.email);
													
													addParameter(emailParams, "$$propOwnerName$$", propFullName);
													addParameter(emailParams, "$$propFirstName$$", propFirstName);
													addParameter(emailParams, "$$propLastName$$", propLastName);
													addParameter(emailParams, "$$propOwnerAdd1$$", propAdd1);
													addParameter(emailParams, "$$propOwnerAdd2$$", propAdd2);
													addParameter(emailParams, "$$propOwnerCity$$", propCity);
													addParameter(emailParams, "$$propOwnerState$$", propState);
													addParameter(emailParams, "$$propOwnerZip$$", propZip);		
													addParameter(emailParams, "$$propOrgName$$", orgName);	
													conEmail.push(propertyOwner.email);								
												}
											}
										}	
										
										if (conEmail != null)
										{
											// Get LPs to cc email as well.
											var lpArr;
											var lpResult = aa.licenseScript.getLicenseProf(capId);
											var lpName;
											var lpNames;
											var more = false;
											logDebug("hitting LPs function.");
											if (lpResult.getSuccess())
											{ 
												lpArr = lpResult.getOutput();  
											} 
											for (var lp in lpArr)
											{
												logDebug("LP license type is: " + lpArr[lp].getLicenseType());
												if( lpArr[lp].getLicenseType()== "Engineer")
													{
														if (lpArr[lp].getEmail() != null)
															{
																conEmail2 = lpArr[lp].getEmail();
																// Add debug statemenet here
																//debugObject(lpArr[lp]);
																var lpFirstName = lpArr[lp].getContactFirstName();
																var lpLastName = lpArr[lp].getContactLastName();
																//addParameter(emailParams, "$$engineerFirstName$$", lpFirstName);			
																//addParameter(emailParams, "$$engineerLastName$$", lpLastName);	
																lpName = lpFirstName + " " + lpLastName;
																logDebug("Engineer name: " + lpFirstName + " " + lpLastName);
																addParameter(emailParams, "$$engineerNames$$", lpName);	

																if (more == true)
																{
																	lpNames = lpNames + ", " + lpFirstName + " " + lpLastName;
																}
																else
																{
																	lpNames = lpFirstName + " " + lpLastName;
																}
																//sendNotification("", conEmail2, "", "DEQ_WWM_EXPIRE_WORKFLOW_TASK", emailParams, null);
																
																sendNotification("", conEmail2, "", "DEQ_WWM_EXPIRE_WORKFLOW_TASK", emailParams, null);
																	
																more = true;																
															}
													}
											} 

											// Send email to property owner
											for (x in conEmail)
											{
												addParameter(emailParams, "$$engineerNames$$", lpNames);	
												sendNotification("", conEmail[x], "", "DEQ_WWM_EXPIRE_WORKFLOW_TASK", emailParams, null);
											}				
	
										}									
									}
								}
								else
								{
									logDebug("Task: " + taskDescrip + " is NOT due today, continue...");									
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
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


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


function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}

function debugObject(object) {
	var output = ''; 
	for (property in object) { 
	  output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	} 
	logDebug(output);
} 

function getDateFromNumWorkDays(startDate, businessDays)
{
   var numWorkDays = 1;
    var currentDate = startDate;
    while (numWorkDays <= businessDays)
    {
       // Skips Sunday and Saturday
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6)
        {
           numWorkDays++;    
	   }	   
	   
	    logDebug("Original current date is: " + currentDate);	
		currentDate = addDays(currentDate, 1);
		logDebug("Original current date is + 1: " + currentDate);	
		logDebug("Current day get day(): " + currentDate.getDay());	
		
		// If the new date is on a saturday or Sunday, we need to add one more day. 
		while (currentDate.getDay() == 0 || currentDate.getDay() == 6)
		{
			currentDate = addDays(currentDate, 1);
			logDebug("In the loop. Current date is now" + currentDate);	
		}
		
   }
   return currentDate;
}

function addDays(date, days) 
{
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function getOutput(result, object) {
    if (result.getSuccess()) {
        return result.getOutput();
    } else {
        logDebug("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
        return null;
    }
}

function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
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
