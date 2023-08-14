function batchInvoicePermits()
{
    var billingParamRec = capId;
    if (arguments.length > 0)
        billingParamRec = arguments[0];

    var setName = billingParamRec.getCustomID();
    var set = new capSet(setName, setName, "Billing");
    for (var x in set.members)
    {
        var thisCapId = aa.cap.getCapID(set.members[x].getID1(), set.members[x].getID2(), set.members[x].getID3()).getOutput();
        if (appMatch("Administration/Billing/Parameters/NA", thisCapId))
            continue;
        aa.print("Processing " + thisCapId.getCustomID());
        invoiceAllFees4BillingParamRec(thisCapId);
        var thisFacilityRec = getParent(thisCapId);
        var appliedDate = getAppSpecific("Applied Date", billingParamRec) || "";
        var updateResult = true;
        if (!isBlank(appliedDate))
            updateResult = _updateInvoiceDate(appliedDate);
        if (!updateResult)
            continue;
        var sendEmail = getAppSpecific("Send Email", billingParamRec);
        var emailToArray = getContactsEmailArray(["Accounts Receivable"], thisFacilityRec);
        var emailToString = "";
        for (var x in emailToArray)
            emailToString += emailToArray[x] + ";";
        if ("CHECKED".equals(sendEmail) && thisFacilityRec && !isBlank(emailToString))
        {
            var reportParameters = aa.util.newHashMap();
            reportParameters.put("RECORD_ID", String(thisFacilityRec.getCustomID()));
            var files = new Array();
            var file = generateReport(thisFacilityRec, "EH_CONSOLIDATED_BILLING_REPORT_EMAIL", "ENVHEALTH", reportParameters);
            files.push(file);
            var emailParams = aa.util.newHashMap();
            var templateName = "EH_BILLING_NOTIFICATION";
            sendNotification("", emailToString, "", templateName, emailParams, files, thisFacilityRec);
        }
        else if (thisFacilityRec)
        {
            var reportParameters = aa.util.newHashMap();
            reportParameters.put("RECORD_ID", String(thisFacilityRec.getCustomID()));
            var file = generateReport(thisFacilityRec, "EH_CONSOLIDATED_BILLING_REPORT_PRINT", "ENVHEALTH", reportParameters);
        }
    }

    resultWorkflowTask("Invoice Processing", "Billing Complete", "", "", null, billingParamRec);
    var taskAssignedTo = getUserAssignedToTask(billingParamRec, "Invoice Processing");
    if (taskAssignedTo && !isBlank(taskAssignedTo.getEmail()))
    {
        var template = "EH_BILLING_TASK_UPDATE";
        var params = aa.util.newHashtable();
        addParameter(params, "$$taskName$$", "Renewal Set Processing");
        addParameter(params, "$$taskStatus$$", "Set Review in Progress");
        sendNotification("", taskAssignedTo.getEmail(), "", template, params, new Array());
    }

    var newBillingCapId = createCap("Administration/Billing/Parameters/NA", "");

    function _updateInvoiceDate(invoiceDateString)
    {
        var capInvoices = aa.finance.getInvoiceByCapID(thisCapId, null).getOutput() || new Array();
        if (capInvoices.length == 0)
        {
            logDebug(thisCapId.getCustomID() +": has no invoices");
            return false;
        }
        capInvoices.sort(sortInvoices);
        capInvoices[0].getInvoiceModel().setInvDate(new Date(invoiceDateString));
        var result = aa.invoice.editInvoice(thisCapId, capInvoices[0].getInvoiceModel());
        if (result.getSuccess())
            logDebug(thisCapId.getCustomID() + ": Updated invoice date successfully");
        else
            logDebug(thisCapId.getCustomID() + ": Problem updating invoice date " + result.getErrorMessage());
        function sortInvoices(a, b)
        {
            return b.getInvoiceModel().getInvNbr() - a.getInvoiceModel().getInvNbr();
        }
    }
}