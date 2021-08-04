//PRA
//When Violation full balance is paid, update parent Complaint record with appropriate status

if (balanceDue == 0) 
{
    var vWF = aa.workflow.getTasks(capId);
    if (vWF.getSuccess()) 
    {
        vWF = vWF.getOutput();
    }
    else 
    {
        logDebug("Failed to get workflow tasks");
    }
    var x = 0;
    for (x in vWF) 
    {
        var vTask = vWF[x];
        var vTaskItem = vTask.getTaskItem();
        var vTaskName = "Payment";
        var vProcessID = vTask.getProcessID();
        var vProcessCode = vTask.getProcessCode();
        var vStepNum = vTask.getStepNumber();
        var vEParams = aa.util.newHashtable();
        var vRParams = aa.util.newHashtable();
        var conEmail = '';

        if (isTaskActive(vTaskName) == true) 
        {
            closeTask(vTaskName, "Paid", "Updated via PRA script", "Updated via PRA script");
            //need to know which status to use here
            if (parentCapId)
            {
                updateAppStatus(parentCapId, "In Review", "");
            }

            var conArray = getContactArray(capId);
            for (con in conArray)
            {
                if (!matches(conArray[con].email, null, undefined, ""))
                {
                    if (conArray[con].contactType == "Applicant") 
                    {
                        conEmail += conArray[con].email;
                    }
                }
            }

            /* var contactResult = aa.people.getCapContactByCapID(capId);
             if (contactResult.getSuccess())
             {
                 var capContacts = contactResult.getOutput();
                 for (c in capContacts)
                 {
                     if (capContacts[c].getCapContactModel().getContactType() == "Applicant")
                     {
                         addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));
                     }
                 }
             }*/
        }
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
        if (capContacts[c].getCapContactModel().getContactType() == "Public User")
        {
            addParameter(vEParams, "$$FullNameBusName$$", getContactName(capContacts[c]));
            if (!matches(capContacts[c].email, null, undefined, ""))
            {

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

                    sendNotification ("", conEmail, "", "CA_VIOLATION_PAYMENT_RECEIVED", vEParams, caReports);
                }
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