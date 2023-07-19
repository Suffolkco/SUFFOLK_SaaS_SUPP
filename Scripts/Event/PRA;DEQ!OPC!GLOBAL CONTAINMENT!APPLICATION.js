//PRA:DEQ/OPC/Global Containment/Application
var emailText = "";
var emailAddress = "ada.chan@suffolkcountyny.gov";//email to send report


if (publicUser)
{    
    logDebug("balanceDue: " + balanceDue);
    
    if (balanceDue <= 0)
    {       
        // EHIMS-4609: Send email to assignee 
        if (isTaskActive("Inspections"))
        {
            logDebugLocal("Insepctions active.")
            // Check Fee Codes
            if (checkFeeCode)
            {
                assignedUserId = getUserIDAssignedToTask(capId, 'Plan Coordination')
                logDebugLocal("assignedUserId: " + assignedUserId);

                if (assignedUserid !=  null)
                {
                    iNameResult = aa.person.getUser(assignedUserid)
    
                    if(iNameResult.getSuccess())
                    {
                        assignedUser = iNameResult.getOutput();                   
                        var emailParams = aa.util.newHashtable();               
                        getRecordParams4Notification(emailParams);             
                        logDebugLocal("capId.getCustomID(): " + capId.getCustomID());

                        addParameter(emailParams, "$$altID$$", capId.getCustomID());
                        if (assignedUser.getEmail() != null)
                        {
                            logDebug("Sending email to assignee: " + assignedUser.getEmail()); 
                            sendNotification("", assignedUser.getEmail(), "", "DEQ_OPC_PAYMENT_MADE", emailParams, null);
                        }
                    }
                }
            }         
               
        }

        if (isTaskActive("Inspections") || isTaskActive("Final Review"))
        {
            var appStatus = getAppStatus(capId);
            logDebug("appStatus:" + appStatus);

            if (isTaskActive("Inspections"))
            {
                logDebug("Inspection task is active");
                updateTask("Inspections", "Permit Renewed", "", "");        
                updateAppStatus("Plan Approved");
            }
            else if (isTaskActive("Final Review"))
            {
                logDebug("Final Review task is active");
                updateTask("Final Review", "Resubmitted", "", "");       
                updateAppStatus("Final Review");
            }

            var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
            
            if (b1ExpResult.getSuccess())
            {
                b1Exp = b1ExpResult.getOutput();
                var curExp = b1Exp.getExpDate();
                var curExpCon = curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear();
                var dateAdd = addDays(curExpCon, 365);
                var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);               

                //var newDate = new Date();
                //var newExpDate = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + (newDate.getFullYear() + 1);       
                logDebug("This is the current expiration date: " + curExpCon);                
                //logDebug("This is the current month: " + newDate.getMonth() + 1 );
                //logDebug("This is the current date: " + newDate.getDate() );
                newIndExpDateOne = aa.date.parseDate(dateMMDDYYY);
                logDebug("This is the new expiration date: " + dateMMDDYYY);
                b1Exp.setExpDate(newIndExpDateOne);
                b1Exp.setExpStatus("Active");
                aa.expiration.editB1Expiration(b1Exp.getB1Expiration());        
            }        
        }
    }
    aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "PRA - OPC GC", emailText);
}

function checkFeeCode()
{
    var recPayments = new Array;
    var recPayments = aa.finance.getPaymentByCapID(capId, null).getOutput();
    // Get the Last Payment on the record
    recPayments.sort(sortPayments);
    var lastPayment = recPayments[0];
    var pfResult = aa.finance.getPaymentFeeItems(capId, null);
    if (pfResult.getSuccess()) {
    var pfObj = pfResult.getOutput();
    for (ij in pfObj) {
        var paymentFee = pfObj[ij];
        logDebugLocal('paymentFee.getPaymentSeqNbr():' + paymentFee.getPaymentSeqNbr());

        if (paymentFee.getPaymentSeqNbr() == lastPayment.getPaymentSeqNbr()) {
        // Count number of Annual Fees in Payment by comparing the Fee Code 
        // and the Program Element Number
        thisFeeResult = aa.finance.getFeeItemByPK(capId, paymentFee.getFeeSeqNbr());
        if (thisFeeResult.getSuccess()) {
            thisFee = thisFeeResult.getOutput();

            logDebugLocal('thisFee.feeCod:' + thisFee.feeCod);

            if (thisFee.feeCod == 'HM-CON-REN')
            {
                logDebugLocal('Match fee code:' + thisFee.feeCod);
                 return true;
            }
        }
        }
    }
}
    return false;
}

function logDebugLocal(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
} 

function getUserIDAssignedToTask(vCapId, taskName) {
    currentUsrVar = null;
    var taskResult1 = aa.workflow.getTask(vCapId, taskName);
    if (taskResult1.getSuccess())
    {
        tTask = taskResult1.getOutput();
    } else
    {
        logMessage("**ERROR: Failed to get workflow task object ");
        return false;
    }
    taskItem = tTask.getTaskItem();
    taskUserObj = tTask.getTaskItem().getAssignedUser();
    taskUserObjLname = taskUserObj.getLastName();
    taskUserObjFname = taskUserObj.getFirstName();
    taskUserObjMname = taskUserObj.getMiddleName();
    currentUsrVar = aa.person.getUser(taskUserObjFname, taskUserObjMname, taskUserObjLname).getOutput();
    if (currentUsrVar != null)
    {
        currentUserIDVar = currentUsrVar.getGaUserID();
        return currentUserIDVar;
    } else
    {
        return false;
    }
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

function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}

function logDebugLocal(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
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




//WTUA:DEQ/OPC/SWIMMING POOL/APPLICATION
/* As per Xiaoyu on 01/29/2020, we don't use this for swimming pool applicaiton 
var showDebug = false;

var workflowResult = aa.workflow.getTasks(capId);
var swimPools = loadASITable("SWIMMING POOL INFORMATION");
var totalPools = swimPools.length;
var indoorArray = new Array();
var outdoorArray = new Array();
var adHocArray = new Array();
var b1ExpResult = aa.expiration.getLicensesByCapID(capId);

if (balanceDue <= 0)
{
    if (b1ExpResult.getSuccess())
    {
        b1Exp = b1ExpResult.getOutput();
        var newDate = new Date();
        var todDateCon = (newDate.getMonth() + 1) + "/" + newDate.getDate() + "/" + (newDate.getFullYear());
        //logDebug("This is the current month: " + newDate.getMonth());
        //logDebug("This is the current day: " + newDate.getDate());
        //logDebug("This is the current year: " + newDate.getFullYear());
        var dateAdd = addDays(todDateCon, 365);
        var dateMMDDYYY = jsDateToMMDDYYYY(dateAdd);

        var year = newDate.getFullYear();
        var yearOne = newDate.getFullYear() + 1;
        var yearTwo = newDate.getFullYear() + 2;

        var newIndExpDate = new Date("12/31" + "/" + year);

        var newIndExpDateOne = (newIndExpDate.getMonth() + 1) + "/" + newIndExpDate.getDate() + "/" + (newIndExpDate.getFullYear() + 1);

        var newIndExpDateTwo = (newIndExpDate.getMonth() + 1) + "/" + newIndExpDate.getDate() + "/" + (newIndExpDate.getFullYear() + 2);

        var newOutExpDate = new Date("9/30" + "/" + year);

        var newOutExpDateOne = (newOutExpDate.getMonth() + 1) + "/" + newOutExpDate.getDate() + "/" + (newOutExpDate.getFullYear() + 1);

        var newOutExpDateTwo = (newOutExpDate.getMonth() + 1) + "/" + newOutExpDate.getDate() + "/" + (newOutExpDate.getFullYear() + 2);
    }
    //logDebug("This is how many rows my table has: " + totalPools);
    if(totalPools != null && totalPools >= 1)
    {
        for(p in swimPools)
        {
            var poolLoc = swimPools[p]["Location"];
            if (poolLoc == "Indoor")
            {
                //logDebug("Indoor pool!");
                indoorArray.push(poolLoc);
            }
            else
            {
                //logDebug("Outdoor pool!");
                outdoorArray.push(poolLoc);
            }
        }
    }
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
        if (fTask.getTaskDescription().equals("Operation Review"))
        {
            adHocArray.push(fTask);
        }
    }
    for (h in adHocArray)
    {
        var latestAdhoc = adHocArray.slice(-1)[0];
        //logDebug("My latest adhoc task is: " + latestAdhoc);
        if (latestAdhoc.getDisposition() != null && latestAdhoc.getDisposition().equals("Complete") && latestAdhoc.getCompleteFlag() == "Y")
        {
            //logDebug("This is how many pools are in my indoor array: " + indoorArray.length);
            //logDebug("This is how many pools are in my outdoor array: " + outdoorArray.length);
            if (indoorArray.length >=1 && outdoorArray.length == 0)
            {
                if (isEven(year))
                {
                    logDebug("We have only indoor pools, updating epiration date to 12/31" + "/" + yearTwo);
                    newIndExpDateTwo = aa.date.parseDate(newIndExpDateTwo);
                    b1Exp.setExpDate(newIndExpDateTwo);
                    b1Exp.setExpStatus("Active");
                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                }
                else
                {
                    logDebug("We have only indoor pools, updating epiration date to 12/31" + "/" + yearOne);
                    newIndExpDateOne = aa.date.parseDate(newIndExpDateOne);
                    b1Exp.setExpDate(newIndExpDateOne);
                    b1Exp.setExpStatus("Active");
                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                }
            }
            if (outdoorArray.length >=1 && indoorArray.length == 0)
            {
                if (isOdd(year))
                {
                    logDebug("We have only outdoor pools, updating epiration date to 9/30" + "/" + yearTwo);
                    newOutExpDateTwo = aa.date.parseDate(newOutExpDateTwo);
                    b1Exp.setExpDate(newOutExpDateTwo);
                    b1Exp.setExpStatus("Active");
                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                }
                else
                {
                    logDebug("We have only outdoor pools, updating epiration date to 9/30" + "/" + yearOne);
                    newOutExpDateOne = aa.date.parseDate(newOutExpDateOne);
                    b1Exp.setExpDate(newOutExpDateOne);
                    b1Exp.setExpStatus("Active");
                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                }
            }    
        }
    break;	
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
*/