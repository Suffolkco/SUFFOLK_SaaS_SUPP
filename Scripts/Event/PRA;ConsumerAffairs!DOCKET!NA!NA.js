var emailText ="";


logDebug("balanceDue" + balanceDue);
var emailParams = aa.util.newHashtable();
try{
if (balanceDue <= 0) {

    logDebug("publicUser" + publicUser);

	if (publicUser)
	{
		updateAppStatus("Paid-Online", "Status Updated by Automation Script", capId); 	
        logDebug("updateAppStatus");
		//var staffEmailsToSend = lookup("DCA_Docket_Email_List", "All");   	
        var staffEmailsToSend = lookup("DCA_Docket_Email_List", "LW");   	
        logDebug("staffEmailsToSend" + staffEmailsToSend);
        addParameter(emailParams, "$$altID$$", capId.getCustomID());        	
		sendNotification("", staffEmailsToSend, "", "DCA_DOCKET_PAYMENT_MADE", emailParams, null);	

	}
	else
	{
        logDebug("updateAppStatus " + capId);
		updateAppStatus("Paid", "Status Updated by Automation Script", capId); 	
	}
	
} 

  
//Send Notification on Payment to outline what was paid and remaining balance due
var vEParams = aa.util.newHashtable();
var vRParams = aa.util.newHashtable()
var PaymentTotalPaidAmount = aa.env.getValue("PaymentTotalPaidAmount");
var itemCapDetail = capDetailObjResult.getOutput();
var itemBalanceDue = itemCapDetail.getBalance();
var contactResult = aa.people.getCapContactByCapID(capId);

logDebug("PaymentTotalPaidAmount addresses: " + PaymentTotalPaidAmount);
logDebug("PaymenitemBalanceDue addresses: " + itemBalanceDue);
logDebug("contactResult.getSuccess(): " + contactResult.getSuccess());
if (contactResult.getSuccess())
{
    var capContacts = contactResult.getOutput();
    var conEmail = "";
    
    var recPayments = aa.finance.getPaymentByCapID(capId, null).getOutput();

    recPayments.sort(sortPayments);

    // Get the Last Payment on the record
    for (i in recPayments) 
    {
        logDebug(recPayments[i].getPaymentSeqNbr() + " , " + recPayments[i].getPaymentDate() + ", " + recPayments[i].getReceiptNbr());
    }
       
    var lastPayment = recPayments[0];
    
    for (c in capContacts) 
    {
        logDebug("capContacts[c].getCapContactModel().getContactType(): " + capContacts[c].getCapContactModel().getContactType());
        logDebug("capContacts[c].email: " + capContacts[c].email);
       
        if (capContacts[c].getCapContactModel().getContactType() == "Vendor")
        {
            addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));

            if (!matches(capContacts[c].email, null, undefined, ""))
            {
                
                var batchTransCode = lastPayment.getBatchTransCode(); 
                var tranCode = batchTransCode.toString();  
                logDebug("batchTransCode: " + batchTransCode);
				addParameter(vEParams, "$$paidAmount$$", parseFloat(PaymentTotalPaidAmount).toFixed(2));
				addParameter(vEParams, '$$altID$$', capId.getCustomID());
				addParameter(vEParams, "$$balanceDue$$", "$" + parseFloat(itemBalanceDue).toFixed(2));
				addParameter(vRParams, "capid", "-1");
				//addParameter(vRParams, "batchtransactionnbr", "-1");
                addParameter(vRParams, "batchtransactionnbr", tranCode);
				conEmail += capContacts[c].email + "; ";
				logDebug("Email addresses: " + conEmail);

                
				var caReport = generateReportBatch(capId, "ACA Receipt", appTypeArray[0], vRParams)
				if (caReport)
				{
					var caReports = new Array();
					caReports.push(caReport);
					logDebug("CaReport valid and send to " + conEmail);

				}

				sendNotification ("", conEmail, "", "DCA_DOCKET_PAYMENT_MADE_NOTIFICATION", vEParams, caReports);
               
            }
        }
    } 
	aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "PRA DOCKET", emailText);

    /*
                logDebug("parseFloat(PaymentTotalPaidAmount).toFixed(2): " + parseFloat(PaymentTotalPaidAmount).toFixed(2));
                logDebug("parseFloat(itemBalanceDue).toFixed(2): " + parseFloat(itemBalanceDue).toFixed(2));
                logDebug("PaymentTotalPaidAmount : " + PaymentTotalPaidAmount);

                // F4PAYMENT.PAYMENT_AMOUNT
                logDebug("lastPayment.getTotalPaidAmount() : " + lastPayment.getTotalPaidAmount());                
                // F4PAYMENT.CASHIER_ID
                logDebug("lastPayment.getCcType(): " + lastPayment.getCcType());
                // F4PAYMENT.PAYMENT_STATUS
                logDebug("lastPayment.getPaymentStatus(): " + lastPayment.getPaymentStatus());
                logDebug("lastPayment.getPaymentMethod(): " + lastPayment.getPaymentMethod());
                // F4PAYMENT.PAYMENT_DATE
                logDebug("lastPayment.getPaymentDate(): " + lastPayment.getPaymentDate());
                //ScriptDateTime paymentDate =  lastPayment.getPaymentDate();
                logDebug("lastPayment.getReceiptNbr(): " + lastPayment.getReceiptNbr());
                // F4PAYMENT.PAYMENT_SEQ_NBR
                logDebug("lastPayment.getPaymentSeqNbr(): " + lastPayment.getPaymentSeqNbr());
                logDebug("lastPayment.getBatchTransCode(): " + lastPayment.getBatchTransCode());
                logDebug("lastPayment.getTranNbr(): " + lastPayment.getTranNbr());
                logDebug("lastPayment.getTotalInvoiceAmount():" + lastPayment.getTotalInvoiceAmount());
                //paymentModel = lastPayment.getPaymentModel()
               
                if (lastPayment.getTotalPaidAmount() == PaymentTotalPaidAmount)
                if (lastPayment.getPaymentMethod() == PaymentMethod)
                if (lastPayment.getPaymentDate() == PaymentDate
                )
                if (lastPayment.getCashierID() == PaymentCashierId) 

                debugObject(lastPayment);
                */
/*
parcelArea = 0
estValue = 0
calcValue = 0
feeFactor = CONT
houseCount = 0
feesInvoicedTotal = 2600
balanceDue = 0
parentCapId = LW-65087
lookup(EMSE_VARIABLE_BRANCH_PREFIX,PaymentReceiveAfter) = PRA
FeeSeqList = [456228|456229|456288|456289|456492|456493|456496|456497|456501]
FeeItemsOffsetList = [0.0|0.0|0.0|0.0|0.0|0.0|0.0|0.0|0.0]
FeeItemsPaidList = [100.0|200.0|100.0|500.0|200.0|500.0|500.0|200.0|300.0]
FeePeriod = [FINAL|FINAL|FINAL|FINAL|FINAL|FINAL|FINAL|FINAL|FINAL]
NumberOfFeeItems = 9
PaymentCashierId = ACHAN
PaymentComment =
PaymentDate = 2023-04-20
PaymentMethod = Credit Card
PaymentRegisterId =
PaymentTotalAvailableAmount = 0.0
PaymentTotalPaidAmount = 500.00
checkNumber =
checkType =
cHolderName =
cHolderEmail =
country =
state =
city =
street =
street =
phoneNumber =
postalCode =
bankName =
*/
// 1. Find the RECEIPT Number match in the F4PAYMENT table.
// SELECT TRANSACTION_CODE FROM F4PAYMENT WHERE RECEIPT_NBR = '419291';
   

}

} catch(err) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", err.message);
    showMessage = true;
    cancel = true;
    aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "PRA DOCKET",  err.message);
}


function sortPayments(a, b) {
    return b.getPaymentSeqNbr() - a.getPaymentSeqNbr();
    }
    
function logDebug(dstr)
{
	//if (showDebug.substring(0,1).toUpperCase().equals("Y"))
	if(showDebug)
	{
		aa.print(dstr)
		emailText+= dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}
function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}
function getContactName(vConObj)
{
    if (vConObj.people.getContactTypeFlag() == "organization")
    {
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
    else
    {
        if (vConObj.people.getFullName() != null && vConObj.people.getFullName() != "")
        {
            return vConObj.people.getFullName();
        }
        if (vConObj.people.getFirstName() != null && vConObj.people.getLastName() != null)
        {
            return vConObj.people.getFirstName() + " " + vConObj.people.getLastName();
        }
        if (vConObj.people.getBusinessName() != null && vConObj.people.getBusinessName() != "")
            return vConObj.people.getBusinessName();

        return vConObj.people.getBusinessName2();
    }
}
function generateReportBatch(itemCap, reportName, module, parameters)
{
    //returns the report file which can be attached to an email.
    var user = currentUserID; // Setting the User Name
    var report = aa.reportManager.getReportInfoModelByName(reportName);
    if (!report.getSuccess() || report.getOutput() == null)
    {
        logDebug("**WARN report generation failed, missing report or incorrect name: " + reportName);
        return false;
    }
    report = report.getOutput();
    report.setModule(module);
    report.setCapId(itemCap); //CSG Updated from itemCap.getCustomID() to just itemCap so the file would save to Record
    report.setReportParameters(parameters);

    var permit = aa.reportManager.hasPermission(reportName, user);

    if (permit.getOutput().booleanValue())
    {
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult.getSuccess())
        {
            reportOutput = reportResult.getOutput();
            var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
            reportFile = reportFile.getOutput();
            return reportFile;
        } else
        {
            logDebug("**WARN System failed get report: " + reportResult.getErrorType() + ":" + reportResult.getErrorMessage());
            return false;
        }
    } else
    {
        logDebug("You have no permission.");
        return false;
    }
}
