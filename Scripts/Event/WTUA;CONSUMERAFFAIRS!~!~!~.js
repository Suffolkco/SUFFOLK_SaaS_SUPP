//WTUA;CONSUMERAFFAIRS!~!~!~!

if (matches(appTypeArray[1], "Registrations", "ID Cards", "Licenses")) {
	if ( wfTask == "Issuance" && (wfStatus == "Issued" || wfStatus == "Renewed"))
	{
		createUpdateRefLicProfDCA(capId, true);		
		createUpdateRefLicProfIA(capId);
	}
}

if (matches(appTypeArray[1], "Licenses")) {
	if (wfTask == "Issuance" && wfStatus == "Shelved")
	{
		//1.  Check to see if the renewal was initiated before.
		result = aa.cap.getProjectByMasterID(capId, "Renewal", "Incomplete");
		var tChild;
		if (result.getSuccess()) {
			childrenArr = result.getOutput();
			logDebugLocal("Found renewal: " + childrenArr.length);
			if (childrenArr != null && childrenArr.length > 0) {
				
				for (var cIdx in childrenArr) {
					
					logDebugLocal("Found renewal alt ID: " + childrenArr[cIdx].capID.toString());
					var tChildId = childrenArr[cIdx].capID.toString().split("-");
					tChild = aa.cap.getCapID(tChildId[0],tChildId[1],tChildId[2]).getOutput();						
				}

				feeCode = "LIC_REN_01";

				if (feeExistsWithCapId(feeCode, "Invoiced", tChild) ||
				feeExistsWithCapId(feeCode, "New", tChild))
				{					
					logDebugLocal("Void and remove fee: " + feeCode);
					voidRemoveFeesLocal(feeCode, tChild);		
					logDebug("Parent record has a status of Shelved. SLS_8 fee code instead.")
					updateFee("SLS_38", "CA_SALES", "FINAL", 1, "Y", "N", null) 
		
				}
			}
	
		}
	}
}

// DOCKET-66
if (matches(appTypeArray[1], "Licenses") && appTypeArray[2] != "Renewal" && matches(appTypeArray[3], "NA"))
{
	if ((wfTask == "Test" && wfStatus == "Passed") || ( wfTask == "Issuance" && wfStatus == "Renewed"))
	{
		// Finding matching license number in docket record
		var licenseNumber = capId.getCustomID();
		var vSQL = "SELECT B1.B1_ALT_ID as recordNumber, BC.B1_CHECKLIST_COMMENT as LicNum FROM B1PERMIT B1 INNER JOIN BCHCKBOX BC on b1.serv_prov_code = bc.serv_prov_code and b1.b1_per_id1 = bc.b1_per_id1 and b1.b1_per_id2 = bc.b1_per_id2 and b1.b1_per_id3 = bc.b1_per_id3 and bc.B1_CHECKBOX_DESC = 'License Number' and BC.B1_CHECKLIST_COMMENT = '" + licenseNumber + "'   WHERE B1.SERV_PROV_CODE = 'SUFFOLKCO' and B1_PER_GROUP = 'ConsumerAffairs' and B1.B1_PER_TYPE = 'DOCKET' and B1_PER_CATEGORY = 'NA'";		
		
        var vSQLResult = doSQLSelect_local(vSQL);
		

		logDebugLocal("******** Finding matching license in docket : " + vSQLResult.length + "*********\n");
		for (r in vSQLResult)
        {		
            docketId = vSQLResult[r]["recordNumber"];     
            licNum = vSQLResult[r]["LicNum"];
       
			var emailParams = aa.util.newHashtable();
			addParameter(emailParams, "$$docketId$$", docketId);		
			addParameter(emailParams, "$$LicNum$$", licNum);
			addParameter(emailParams, "$$status$$", wfStatus);
			var staffEmailsToSend = lookup("DCA_Docket_Email_List", "All");   	
			sendNotification("", staffEmailsToSend, "", "DCA_DOCKET_LICENSE_TEST_PASSED", emailParams, null);		

		}

	}
}

// DAP-559
if (matches(appTypeArray[1], "Licenses") && appTypeArray[2] != "Renewal" && matches(appTypeArray[3], "NA"))
{
	if ( wfTask == "Issuance" && wfStatus == "Invalid Payment")
	{
		var expDateASI = getAppSpecific("Expiration Date", capId);

		//Updating Expiration Date of License	
		logDebug("Current ASI Expdate is: " + expDateASI);
		
		var expDate = new Date(expDateASI);
		logDebug("expDate's date is " + expDate);	
		var newExpDate = moveBackDate(expDate);
		logDebug("New expiration date is " + newExpDate);

		editAppSpecific("Expiration Date", newExpDate, capId);
		var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
		if (b1ExpResult.getSuccess())
		{
			var b1Exp = b1ExpResult.getOutput();
			b1Exp.setExpStatus("Expired");
			b1Exp.setExpDate(aa.date.parseDate(newExpDate));
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		} 
		
	}
}


logDebug("appTypeString  is " + appTypeString);
// DAP-362
if (matches(appTypeArray[1], "Registrations", "Licenses") && appTypeArray[2] != "Renewal" && matches(appTypeArray[3], "NA"))
{

	if ( wfTask == "Issuance" && wfStatus == "Issued")
	{
		var expDateASI = getAppSpecific("Expiration Date", capId);

		//Updating Expiration Date of License	
		logDebug("Current ASI Expdate is: " + expDateASI);
		
		var today = new Date();
		logDebug("today's date is " + today);
		var nullExpDate = (today.getMonth() + 1) + "/" + 1 + "/" + (today.getFullYear() + 2);

		var newExpDate = formatDate(nullExpDate);
		logDebug("New expiration date is " + newExpDate);

		editAppSpecific("Expiration Date", newExpDate, capId);
		var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
		if (b1ExpResult.getSuccess())
		{
			var b1Exp = b1ExpResult.getOutput();
			b1Exp.setExpStatus("Active");
			b1Exp.setExpDate(aa.date.parseDate(newExpDate));
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
		} 
		// DAP-579 Send Survey
		var conArray = getContactByType("Vendor", capId);
		var conEmail = "";
		var emailTemplate = "";
		var emailParams = aa.util.newHashtable();
		if (!matches(conArray.email, null, undefined, "")) 
		{			
			emailTemplate = "CA_LIC_REG_SURVEYS";						
			conEmail += conArray.email + "; ";
			logDebug("Email addresses: " + conEmail);
			sendNotification("", conEmail, "", emailTemplate, emailParams, null);
		}
	}

} 
function moveBackDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()-2;

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [month, day, year].join('/');
}
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [month, day, year].join('/');
}
function getUserIDAssignedToTask(taskName,vCapId){
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
	taskUserObjLname = taskUserObj.getLastName()
	taskUserObjFname = taskUserObj.getFirstName()
	taskUserObjMname = taskUserObj.getMiddleName()
	currentUsrVar = aa.person.getUser(taskUserObjFname,taskUserObjMname,taskUserObjLname).getOutput();
	if(currentUsrVar != null){
		currentUserIDVar = currentUsrVar.getGaUserID();
		return currentUserIDVar;
		}
	else{
		return false;
		}
	}

function voidRemoveFeesLocal(vFeeCode, childCap)
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

var targetFees = loadFees(childCap);

for (tFeeNum in targetFees)
    {
    targetFee = targetFees[tFeeNum];

    if (targetFee.code.equals(vFeeCode))
        {

        // only remove invoiced or new fees, however at this stage all AE fees should be invoiced.

        if (targetFee.status == "INVOICED")
            {
            var editResult = aa.finance.voidFeeItem(childCap, targetFee.sequence);

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

function feeExistsWithCapId(feestr,feeStatus,vCapId){
	var feeResult = aa.fee.getFeeItems(vCapId, feestr, null);
	
	if (feeResult.getSuccess()) {
		var feeObjArr = feeResult.getOutput();
		logDebugLocal("Found fee code for : " + feestr + " and status: " + feeStatus);
	} else {
		logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
		return false
	}
	for (ff in feeObjArr)
		if (feestr.equals(feeObjArr[ff].getFeeCod()) && feeObjArr[ff].getFeeitemStatus() == feeStatus){
            return true;
        }
	return false;
} 