 /*
Batch Job Script 
Name: BATCH_EH_BILLING_INVOICEFEES
Description: 
Author: Don Bates (Accela)
*/
var BATCH_NAME = "BATCH_EH_BILLING_INVOICEFEES";

var SCRIPT_VERSION = "3.0";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));
var currentUserID = "ADMIN";

// Get Parameters
var EmailNotifyTo = aa.env.getValue("EmailNotifyTo");
if(matches(EmailNotifyTo,null,undefined,"")){
    EmailNotifyTo = getUserEmail(currentUserID);
}
var billingParamRecNumber = aa.env.getValue("BillingParamRecNumber");
if(matches(billingParamRecNumber,null,undefined,"")){
    billingParamRecNumber = capIDString;
}
var CreateNextBillingRecord = aa.env.getValue("CreateNextBillingRecord");
if(matches(CreateNextBillingRecord,null,undefined,"")){
    CreateNextBillingRecord = "Y";
}

//override functions for cleaner logs
var emailText = "";
var br = "<BR>";
overRide = "function logDebug(dstr) {aa.print(dstr + br);emailText += dstr}";
eval(overRide);

// Execute Main Process
mainProcess();

function mainProcess(){
    //get billing parameter record
    var aryFacilities = new Array;
    var curDate = new Date();
    var curYear = curDate.getFullYear();
    var billingParamId = aa.cap.getCapID(billingParamRecNumber).getOutput();
    if (!billingParamId){
        logDebug("<B><Font Color=RED>" + billingParamRecNumber + ": Invalid record number</Font></B");
        return false;
    }
    var setName = billingParamId.getCustomID();
    var EnvhProgramSet = aa.set.getSetByPK(setName).getOutput();
	if (EnvhProgramSet == null) {
		logDebug("<B><Font Color=RED>Set Not Found</Font></B>");
        return false;
	}
	logDebug("Found Set ID " + setName);
    logDebug("<B>Begin Processing of Set Members</B>");
	//get set members and process each record
	var setMembers = aa.set.getCAPSetMembersByPK(setName).getOutput().toArray();
	for (a in setMembers) {
		var setCap = aa.cap.getCap(setMembers[a].ID1, setMembers[a].ID2, setMembers[a].ID3).getOutput();
		var EnvhProgramCapId = setCap.getCapID();
        logDebug("<B><Font Color=BLUE>Set Member " + EnvhProgramCapId.getCustomID() + "</Font></B>");
        //Invoice All Fees on Program Record
        invoiceAllFees4BillingRecord(EnvhProgramCapId,null);
        // All notifications go to Accounts Receivable contact(s) on the Facility record
        // Compile a list of Facility IDs for emailing report at end of batch
        var facilityCapId = getFacilityId(EnvhProgramCapId);
        if(facilityCapId != false){
            if(aryFacilities.indexOf(facilityCapId) == -1){
                aryFacilities.push(facilityCapId);
            }
        }
    }
    logDebug("<B>End Processing of Set Members</B>");

    // Update Billing Parameters record workflow task Invoice Processing to status Billing Complete
    updateTaskAndHandleDisposition("Invoice Processing","Billing Complete",billingParamId);

    // Calculate the NBext Billing Date
    var billingFreq = getAppSpecific("Billing Schedule",billingParamId);
    // If Monthly
    if(billingFreq == "Monthly"){
        var nextBillingMonth =  getNextEHBillingMonth(getAppSpecific("Billing Month",billingParamId))
        //Determine Billing Month and Billing Year
        if(nextBillingMonth == "01 January"){
            var nextBillingYear = curYear+1;
        }else{
            var nextBillingYear = curYear;
        }
        nextBillingMonth = nextBillingMonth.substr(0,2);
        nextBillingYear = nextBillingYear.toString();
    }else if(billingFreq == "Annual"){
        var curBillingMonth = getAppSpecific("Billing Month",billingParamId);
        var nextBillingMonth = curBillingMonth.substr(0,2);
        var nextBillingYear = curYear+1;
        nextBillingYear = nextBillingYear.toString();
    }else if(billingFreq == "Semi-Annual"){
        var arySemi = calculateSemiAnnual(curYear.getMonth()+1, curYear.getFullYear(), true)
        var nextBillingMonth = arySemi[0];
        nextBillingMonth = getLongBillingMonth(nextBillingMonth);
        var nextBillingYear = arySemi[1];
        nextBillingYear = nextBillingYear.toString();
    }else if(billingFreq == "Quarterly"){
        var aryQuar = calculateQuarter(curYear.getMonth()+1, curYear.getFullYear(), true)
        var nextBillingMonth = aryQuar[0];
        nextBillingMonth = getLongBillingMonth(nextBillingMonth);
        var nextBillingYear = aryQuar[1];
        nextBillingYear = nextBillingYear.toString();
    }else if(billingFreq == "Bi-Annual"){
        var arySemi = calculateSemiAnnual(curYear.getMonth()+1, curYear.getFullYear(), true)
        var nextBillingMonth = arySemi[0];
        nextBillingMonth = getLongBillingMonth(nextBillingMonth);
        var nextBillingYear = arySemi[1];
        nextBillingYear = nextBillingYear.toString();
    }
    var billingKey = getAppSpecific("Billing Key",billingParamId);
    var billingSched = getAppSpecific("Billing Schedule",billingParamId);
    var billMonthNum = nextBillingMonth;
    var billYearNum = nextBillingYear;
    switch(String(billingSched)){
        case "Annual":
            var billSched = "ANN";
            break;
        case "Bi-Annual":
            var billSched = "BIANN";
            break;
        case "Monthly":
            var billSched = "MNTH";
            break;
        case "Quarterly":
            var billSched = "QRT";
            break;
        case "Semi-Annual":
            var billSched = "SEMIANN";
            break;
        default: break;
    }
	
    if(CreateNextBillingRecord == "Y"){
        // Create a new Billing Parameters record for the next cycle. Update altID
        logDebug("<B>Begin Creating next Billing Parameter Record</B>");
        var newAltID = billingKey + "_" + billMonthNum + "_" + billYearNum + "_" + billSched;
        if(matches(getApplicationLocal(newAltID),null,undefined)){
            var newbillingId = createRecordLocal("Administration", "Billing", "Parameters", "NA", "Billing Parameter Record");
            copyASIFields(billingParamId, newbillingId);
            copyASITables(billingParamId, newbillingId);
            var altUpdated = aa.cap.updateCapAltID(newbillingId, newAltID);
            logDebug("Created next Billing Parameter Record " + newAltID);
            //Edit Specific ASI Fields
            if(getAppSpecific("Billing Schedule",billingParamId) == "Monthly"){
                editAppSpecific("Billing Schedule","Monthly",newbillingId);
                editAppSpecific("Billing Month",nextBillingMonth,newbillingId);
            }
            editAppSpecific("Applied Date",null,newbillingId);
            // Set Due Date of task Set Renewal Review on new record to first week day of next Billing Month for that cycle.
            var dueDateStr = (billMonthNum + "/01/" + billYearNum)
            var dueJSDate = new Date(dueDateStr);
            editTaskDueDateWithCapId("Set Renewal Review", aa.util.formatDate(dueJSDate, "MM/dd/YYYY"), newbillingId)
            logDebug("<B>End Creating next Billing Parameter Record</B>");
        }else{
            logDebug("<B><Font Color=RED>ERROR Creating next Billing Parameter Record, " + newAltID + " already exists, skipping</Font></B>");
        }
    }
    // Set Status updated to Invoiced
    EnvhProgramSet.setSetStatus("Invoiced");
    EnvhProgramResult = aa.set.updateSetHeader(EnvhProgramSet);
    
    for (b in setMembers) {
        var nextDateStr = (billMonthNum + "/01/" + billYearNum)
        var nextJSDate = new Date(nextDateStr);
		var setCap = aa.cap.getCap(setMembers[b].ID1, setMembers[b].ID2, setMembers[b].ID3).getOutput();
		var EnvhProgramCapId = setCap.getCapID();
        //Update App Specific
        showDebug = false;
        editAppSpecific("Next Billing Date",aa.util.formatDate(nextJSDate, "MM/dd/YYYY"),EnvhProgramCapId);
        showDebug = true;
		// Update Permits workflow task to Permit Renewal Sent
		updateTaskAndHandleDisposition("Permit Status","Permit Renewal Sent",EnvhProgramCapId);
		//updateTask("Permit Status", "Permit Renewal Sent", "Updated By Renewal Batch", "Updated By Renewal Batch", EnvhProgramCapId);
        //While here in this loop, update Invoice Date
        //if custom field Applied Date is  populated, use that date as the invoice date
        //else use batch run date Will need to be reset
        if(!matches(getAppSpecific("Applied Date",billingParamId),null,undefined,"")){
            var invoiceDateString = getAppSpecific("Applied Date",billingParamId);
            var setMemberInvoices = aa.finance.getInvoiceByCapID(EnvhProgramCapId, null).getOutput() || new Array();
            setMemberInvoices.sort(sortInvoices);
            if(!matches( setMemberInvoices[0],undefined,null)){
                setMemberInvoices[0].getInvoiceModel().setInvDate(new Date(invoiceDateString));
                var result = aa.invoice.editInvoice(EnvhProgramCapId, setMemberInvoices[0].getInvoiceModel());
            }
        }
		var facilityContactArray = new Array;
        var facilityContactArray = getContactArray(EnvhProgramCapId);
        var accntReceivEmail = "";
        for (iCon in facilityContactArray){
            if(facilityContactArray[iCon]["contactType"] == "Accounts Receivable"){
                if(!matches(facilityContactArray[iCon]["email"],null,"",undefined)){
                    if(accntReceivEmail == ""){
                        accntReceivEmail = facilityContactArray[iCon]["email"];
                    }else{
                        accntReceivEmail = accntReceivEmail + ";" + facilityContactArray[iCon]["email"];
                    }
                }
            }
		}
    //for(Fac in aryFacilities){
    //    var facilityCapId = aryFacilities[Fac]
    //    logDebug("<B>Generating 5005 Report for " + EnvhProgramCapId.getCustomID() + "</B>");
    //    var facilityContactArray = new Array;
    //    var facilityContactArray = getContactArray(EnvhProgramCapId);
    //    var accntReceivEmail = "";
    //    for (iCon in facilityContactArray){
    //        if(facilityContactArray[iCon]["contactType"] == "Accounts Receivable"){
    //            if(!matches(facilityContactArray[iCon]["email"],null,"",undefined)){
    //                if(accntReceivEmail == ""){
    //                    accntReceivEmail = facilityContactArray[iCon]["email"];
    //                }else{
    //                   accntReceivEmail = accntReceivEmail + ";" + facilityContactArray[iCon]["email"];
    //                }
    //            }
    //        }

    //    }
        
        //var printDate = getAppSpecific("Payment Due Date",billingParamId);
        //var beginDate = getAppSpecific("Beginning Transaction Date",billingParamId);
        //var endDate = getAppSpecific("Ending Transaction Date",billingParamId);
        //if(!printDate || !beginDate || !endDate){
        	//logDebug("**WARN report will not generate, one or more required ASI are empty");
        	//continue;        	
        //}
        
		// Get the "Program Element" custom field value
		var programElement = getAppSpecific("Program Element",EnvhProgramCapId);
		logDebug("set member :" + EnvhProgramCapId.getCustomID());
		logDebug("found programElement :" + programElement);
		// Extract the first four characters as the fee code
		var feeCode = programElement ? programElement.substring(0, 4) : null;
		logDebug("split programElement :" + feeCode);
		// Use the feeCode to get the invoice number
		var invoiceNbr = feeCode ? getInvoiceNumberOfSpecificFee(EnvhProgramCapId, feeCode) : null;
		logDebug("found invoice nbr:" + invoiceNbr);
		
        // Report Params
        try{
            var rParams = aa.util.newHashtable();
            //rParams.put("FacilityID",facilityCapId.getCustomID());
            //rParams.put("PrintDate",printDate);
            //rParams.put("BeginningTransactionDate",beginDate);
            //rParams.put("EndingTransactionDate",endDate);
            //rParams.put("Agencyid",aa.getServiceProviderCode());
            //rFile = generateReportLocal(facilityCapId,"0256 Account Statement","EnvHealth",rParams);
				var rexpirationDate = getAppSpecific("To Date",EnvhProgramCapId);
				logDebug("found rexpirationDate :" + rexpirationDate);
				var rParams = aa.util.newHashtable();
				if(invoiceNbr != null && invoiceNbr != undefined) {
					invoiceNbr = parseInt(invoiceNbr).toString();
					rParams.put("BegInvoice", invoiceNbr);
					rParams.put("EndInvoice", invoiceNbr);
				} else {
					logDebug("invoiceNbr is null or undefined");
				}
				if(rexpirationDate != null && rexpirationDate != undefined) {
					rParams.put("PymtDueDate", rexpirationDate);
				} else {
					logDebug("rexpirationDate is null or undefined");
				}
				rParams.put("BarCode","N"); // This value is hardcoded and shouldn't be null or undefined
				var rFile = generateReportLocal(EnvhProgramCapId,"5005 Invoice Statement SSRS","EnvHealth",rParams);
            if (rFile) {
                var rFiles = new Array();
                rFiles.push(rFile);
            }
            // Email Params
            var PIN = getAppSpecific("PIN Number", EnvhProgramCapId)
			var expirationDate = getAppSpecific("To Date", EnvhProgramCapId)
			var eParams = aa.util.newHashtable();
            eParams.put("$$altID$$",EnvhProgramCapId.getCustomID());
			addParameter(eParams, "$$expirDate$$", expirationDate);
			addParameter(eParams, "$$PINNumber$$", PIN);
			//addACAUrlsVarToEmail(eParams, EnvhProgramCapId);
            if(getAppSpecific("Send Email",billingParamId) == "CHECKED" && !matches(accntReceivEmail,null,undefined,"")){
                // Emailing Report
                sendNotification(null,accntReceivEmail,"","PHP_PERMIT_ABOUT_TO_EXPIRE",eParams,[String(rFile)],EnvhProgramCapId);
            }else if(getAppSpecific("Send Email",billingParamId) != "CHECKED"){
                // Printing Report
                //runReportAttach(EnvhProgramCapId,"5005 Invoice Statement SSRS",rParams);
            }
        }catch(err){
            logDebug("Error Running report 5005 Invoice Statement SSRS " + err);
        }
    }
    if(!matches(EmailNotifyTo,null,undefined,"")){
        var emailCapId = getApplication(billingParamRecNumber)
        var template = "EH_BILLING_BATCH_LOG";
        var params = aa.util.newHashtable();
        addParameter(params, "$$BatchName$$", BATCH_NAME);
        addParameter(params, "$$BatchLog$$", emailText);
        sendNotification("NoReply@accela.com", EmailNotifyTo, "",template,params,null,emailCapId);
    }
}

// Custom Functions
function getUserEmail(userID){
	var userEmail = ""
	var currentUsrVar = aa.person.getUser(userID).getOutput();
	if (currentUsrVar != null)
		{
		userEmail = currentUsrVar.getEmail();
		}
	return  userEmail;
}
function getApplicationLocal(appNum) {
	var getCapResult = aa.cap.getCapID(appNum);
	if (getCapResult.getSuccess())
		return getCapResult.getOutput();
	else
		return null;
	}
function generateReportLocal(itemCap,reportName,module,parameters) {
    //returns the report file which can be attached to an email.
    var user = "Admin";   // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap.getID1() + "-" + itemCap.getID2() + "-" + itemCap.getID3());
    report.setReportParameters(parameters);
    report.getEDMSEntityIdModel().setAltId(itemCap.getCustomID());
  
    var permit = aa.reportManager.hasPermission(reportName,user);
  
    if (permit.getOutput().booleanValue()) {
      var reportResult = aa.reportManager.getReportResult(report);
      if(reportResult) {
        reportOutput = reportResult.getOutput();
        var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
        reportFile=reportFile.getOutput();
        return reportFile;
      }  else {
        logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
        return false;
      }
    } else {
      logDebug("You have no permission.");
      return false;
    }
  } 
function sortInvoices(a, b){
    return b.getInvoiceModel().getInvNbr() - a.getInvoiceModel().getInvNbr();
}
function editTaskDueDateWithCapId(wfstr, wfdate, vCapId){
	var processName = "";
	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(vCapId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}
	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			wfObj[i].setDueDate(aa.date.parseDate(wfdate));
			var fTaskModel = wfObj[i].getTaskItem();
			var tResult = aa.workflow.adjustTaskWithNoAudit(fTaskModel);
			if (tResult.getSuccess())
				logDebug("Set Workflow Task: " + fTask.getTaskDescription() + " due Date " + wfdate);
			else {
				logMessage("**ERROR: Failed to update due date on workflow: " + tResult.getErrorMessage());
				return false;
			}
		}
	}
}
function calculateSemiAnnual(month, year, nextSemiAnnual) {
	var se = parseInt(month) / 6;
	se = Math.ceil(se);
	if (nextSemiAnnual && se == 2) {
		//Last quarter in the year, next quarter will be 1st quarter of nextYear
		se = 1
		year = year + 1;
	} else if (nextSemiAnnual && se < 2) {
		++se;
	}
	if (se == 1) {
		return [1,year];
	} else if (se == 2) {
		return[2,year];
	} else {
		return null;
	}
}
function calculateQuarter(month, year, nextQuarter) {
	var q = parseInt(month) / 3;
	q = Math.ceil(q);
	if (nextQuarter && q == 4) {
		//Last quarter in the year, next quarter will be 1st quarter of nextYear
		q = 1
		year = year + 1;
	} else if (nextQuarter && q < 4) {
		++q;
	}
	if (q == 1) {
		return [1,year];
	} else if (q == 2) {
		return[2,year];
	} else if (q == 3) {
		return [3,year];
	} else if (q == 4) {
		return [4,year];
	} else {
		return null;
	}
}

function createRecord(grp, typ, stype, cat, desc) {
    var newId = null
    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
    logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
    if (appCreateResult.getSuccess()) {
        newId = appCreateResult.getOutput();
        logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
        capModel = aa.cap.newCapScriptModel().getOutput();
        capDetailModel = capModel.getCapModel().getCapDetailModel();
        capDetailModel.setCapID(newId);
        aa.cap.createCapDetail(capDetailModel);
    }
    return newId;
}
function getNextEHBillingMonth(vCurrentBillingMonth){
	switch(curBillMonth) {
		case "01 January":
			return "02 February";
		case "02 February":
			return "03 March";
		case "03 March":
			return "04 April";	
		case "04 April":
			return "05 May";	
		case "05 May":
			return "06 June";
		case "06 June":
			return "07 July";
		case "07 July":
			return "08 August";		
		case "08 August":
			return "09 September";	
		case "09 September":
			return "10 October";	
		case "10 October":
			return "11 November";
		case "11 November":
			return "12 December";
		case "12 December":
			return "01 January";			
	}
}
function getLongBillingMonth(monthNumber){
    if(monthNumber <10){
        monthNumber = "0" + monthNumber.toString();
    }else{
        monthNumber = monthNumber.toString();
    }
}
function getFacilityId(vCapId){
    var facilityId = null;
    facilityId = getParentLOC(vCapId);
    if(!matches(facilityId,null,undefined,"")){
        if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
            return facilityId
        }
    }
    return false;
 }
function invoiceAllFees4BillingRecord(itemCapId) {
    feeSeqList = [];
    periodList = [];
    periodExists = false;
    feeList = aa.finance.getFeeItemByCapID(itemCapId).getOutput();
    for (fee in feeList) {
        if (feeList[fee].getFeeitemStatus() == "NEW") {
            feeSeqList.push(feeList[fee].getFeeSeqNbr());
            for (per in periodList){
                if (periodList[per] == feeList[fee].getPaymentPeriod()) periodExists = true;
            }
            if (!periodExists){
                periodList.push(feeList[fee].getPaymentPeriod());
            } 
        }
    }
    if(feeSeqList.length > 0) {
        doInvoice = aa.finance.createInvoice(itemCapId, feeSeqList, periodList);
        if (!doInvoice.getSuccess()){
            logDebug("Error during invoicing: " + doInvoice.getErrorMessage());
        }else{
            logDebug("Invoicing of Fees Successful");
        }
    }
}
function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}
function updateTaskAndHandleDisposition(taskName, taskStatus){
    try{
        var itemCap = null;
        if(arguments.length > 2){
            itemCap = arguments[2]
        }
        else{
            itemCap = capId;
        }
        var functionName = "updateTaskAndHandleDisposition";
        var taskResult = aa.workflow.getTask(itemCap, taskName);
        if(!taskResult.getSuccess()){
            logDebug("Problem while getting task " + taskResult.getErrorMessage());
        }
        task = taskResult.getOutput();
        if (!task) return false;
        task.setDisposition(taskStatus);  
        var updateResult = aa.workflow.handleDisposition(task.getTaskItem(),itemCap);

        if(!updateResult.getSuccess()){
            logDebug("Problem while updating workflow " + updateResult.getErrorMessage());
        }
    }catch(e){
        aa.debug("**EXCEPTION in function " + functionName, e);
        throw(e);
    }
}
function createRecordLocal(grp,typ,stype,cat,desc){
	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	if (appCreateResult.getSuccess()){
		var newId = appCreateResult.getOutput();
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);
		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		return newId;
	}
}

function getParentLOC(vCapId) {
	getCapResult = aa.cap.getProjectParents(vCapId,1);
	if (getCapResult.getSuccess()){
		parentArray = getCapResult.getOutput();
		if (parentArray.length){
			return parentArray[0].getCapID();
        }else{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
		}
	}else{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
	}
}
function addACAUrlsVarToEmail(vEParams, capId) {
    // Get base ACA site from standard choices
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));

    // Save Base ACA URL
    addParameter(vEParams, "$$acaURL$$", acaSite);

    // Save Record Direct URL
    addParameter(vEParams, "$$acaRecordURL$$", acaSite + getACAUrl(capId));

    var paymentUrl = vEParams.get("$$acaRecordURL$$");
    paymentUrl = paymentUrl.replace("type=1000", "type=1009");
    addParameter(vEParams, "$$acaPaymentUrl$$", paymentUrl);
}

function getInvoiceNumberOfSpecificFee(capId, feeCode) {
    var checkFeeArray = new Array();
    var invoiceNumberOfFee = null;
    if (arguments.length > 2) {
        for(var i = 2; i < arguments.length; i++) {
            checkFeeArray.push(arguments[i]);
        }
    } else {
        checkFeeArray.push(feeCode);
    }
    for (fc in checkFeeArray) {
        iListResult = aa.finance.getInvoiceByCapID(capId, null);
        if (iListResult.getSuccess()) {
            iList = iListResult.getOutput();
            invNbr = "";
            feeAmount = "";
            feeSeqNbr = "";
            for (iNum in iList) {
                invModel = iList[iNum].getInvoiceModel();
                invBalance = invModel.getBalanceDue();
                if(parseInt(invBalance) > 0) {	
                    fList = aa.invoice.getFeeItemInvoiceByInvoiceNbr(iList[iNum].getInvNbr()).getOutput()
                    for (fNum in fList) {
                        invNbr = iList[iNum].getInvNbr();
                        feeAmount = fList[fNum].getFee();
                        feeSeqNbr = fList[fNum].getFeeSeqNbr();

                        logDebug("Invoice Balance: " + invBalance);
                        logDebug("Invoice Number Found: " + invNbr);
                        logDebug("Fee Seq Number Found: " + feeSeqNbr);
                        logDebug("Fee Code: " + fList[fNum].getFeeCode());
                        logDebug("Fee Amount: " + feeAmount);

                        if(fList[fNum].getFeeCode().equals(feeCode)) {
                            invoiceNumberOfFee = invNbr;
                        }
                    }
                }
            }
        }
    }
    return invoiceNumberOfFee;
}
