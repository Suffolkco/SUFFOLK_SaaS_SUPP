//WTUA:DEQ/OPC/ENFORCEMENT/NA
var emailParams = aa.util.newHashtable();

var conArray = getContactArray();
var conEmailList = "";
var conEmailListAll = "";

for (con in conArray)
{
    if (matches(conArray[con].getContactType(), "Property Owner", "Tank Owner", "Operator"))
    {
        if (!matches(conArray[con].email, null, undefined, ""))
        {
            logDebug("Contact email: " + conArray[con].email);
            conEmailList += conArray[con].email + "; ";
        }
    }
    if (!matches(conArray[con].email, null, undefined, ""))
    {
        logDebug("Contact email: " + conArray[con].email);
        conEmailListAll += conArray[con].email + "; ";
    }
}

if (wfTask == "Violation Review") 
{
    if (wfStatus == "Request Inspection")
    {
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", templateName, emailParams, null);
    }
    if (wfStatus == "NOV Letter Sent")
    {
        sendNotification("", conEmailList, "", templateName, emailParams, null);
        //set task due date to status date plus 30 days here
    }
}

if (wfTask == "Enforcement Request Review")
{
    if (wfStatus == "Request Inspection")
    {
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", templateName, emailParams, null);
    }
    if (wfStatus == "NOPH Sent")
    {
        //need to confirm that this report information is correct, below:
        //generateReportBatch(capId, "NOPH", 'DEQ', null);
        //set task due date to the date found in the TSI Hearing Date on the Preliminary Hearing task
        //add a condition to this record and parent SITE record
    }
    if (wfStatus == "NOFH Sent")
    {
        //need to confirm that this report information is correct, below:
        //generateReportBatch(capId, "NOFH", 'DEQ', null);
        //set task due date to the date found in the TSI Hearing Date on the Formal Hearing task
        //add a condition to this record and parent SITE record
    }
    if (wfStatus == "Warning Letter Sent")
    {
        //need to confirm that this report information is correct, below:
        //generateReportBatch(capId, "Warning Letter", 'DEQ', null);
    }
}

if (wfTask == "Preliminary Hearing")
{
    if (wfStatus == "Request Inspection")
    {
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", templateName, emailParams, null);
    }
    if (wfStatus == "Adjourned")
    {
        sendNotification("", conEmailList, "", templateName, emailParams, null);
        //set task due date to the date found in the TSI Hearing Date on this task
    }
    if (wfStatus == "Revised Waiver")
    {
        sendNotification("", conEmailListAll, "", templateName, emailParams, null);
    }
}

if (wfTask == "Formal Hearing")
{
    if (wfStatus == "Request Inspection")
    {
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", templateName, emailParams, null);
    }
    if (wfStatus == "Adjourned")
    {
        sendNotification("", conEmailList, "", templateName, emailParams, null);
        //set task due date to the date found in the TSI Hearing Date on this task
    }
    if (wfStatus == "Revised Waiver")
    {
        sendNotification("", conEmailListAll, "", templateName, emailParams, null);
    }
}

if (wfTask == "Commissioner's Order")
{
    if (wfStatus == "Request Inspection")
    {
        sendNotification("", "Michael.Seaman@suffolkcountyny.gov", "", templateName, emailParams, null);
    }
}
if (wfTask == "Inspection Request")
{
    if (wfStatus == "Inspection Review")
    {
        //check current record to see if the current mask reflects the current value in the Enforcement Type ASI. If not, update the mask to reflect the current value.
    }
}
if (wfStatus == "Case Closed")
{
    sendNotification("", conEmailListAll, "", templateName, emailParams, null);
}