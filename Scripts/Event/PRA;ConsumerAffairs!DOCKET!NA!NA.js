
if (balanceDue <= 0) {

	if (publicUser)
	{
		updateAppStatus("Paid-Online", "Status Updated by Automation Script", capId); 	

		var staffEmailsToSend = lookup("DCA_Docket_Email_List", "All");   	
		sendNotification("", staffEmailsToSend, "", "DCA_DOCKET_PAYMENT_MADE", emailParams, null);	

	}
	else
	{
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
if (contactResult.getSuccess())
{
    var capContacts = contactResult.getOutput();
    var conEmail = "";
    for (c in capContacts) 
    {
        if (capContacts[c].getCapContactModel().getContactType() == "Vendor")
        {
            addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));
            if (!matches(capContacts[c].email, null, undefined, ""))
            {
				addParameter(vEParams, "$$paidAmount$$", parseFloat(PaymentTotalPaidAmount).toFixed(2));
				addParameter(vEParams, '$$altID$$', capId.getCustomID());
				addParameter(vEParams, "$$balanceDue$$", "$" + parseFloat(itemBalanceDue).toFixed(2));
				addParameter(vRParams, "capid", "-1");
				addParameter(vRParams, "batchtransactionnbr", "-1");
				conEmail += capContacts[c].email + "; ";
				logDebug("Email addresses: " + conEmail);


				var caReport = generateReportBatch(capId, "ACA Receipt", appTypeArray[0], vRParams)
				if (caReport)
				{
					var caReports = new Array();
					caReports.push(caReport);
				}

				sendNotification ("", conEmail, "", "DCA_DOCKET_PAYMENT_MADE_NOTIFICATION", vEParams, caReports);
               
            }
        }
    }
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
