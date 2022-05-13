//DUA;DEQ!~!~!~!
var showMessage = true;
var showDebug = true;
var emailText = "";

var skip = false;
var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
// If record type is WWM and it's a backoffice user, we do not want to update the status
if (!publicUser && 
    (itemCapType == "DEQ/WWM/Residence/Application" || 
    itemCapType == "DEQ/WWM/Subdivision/Application" ||        
    itemCapType == "DEQ/WWM/Commercial/Application" ||
    itemCapType == "DEQ/WWM/Garbage/Permit" ||
    itemCapType == "DEQ/WWM/Garbage/Amendment" ||
    itemCapType == "DEQ/WWM/Garbage/Renewal"    ||
    itemCapType == "DEQ/OPC/Global Containment/Application" ||
    itemCapType == "DEQ/OPC/Hazardous Tank/Application" ||
    itemCapType == "DEQ/OPC/Swimming Pool/Application" ||
    itemCapType == "DEQ/OPC/Hazardous Tank Closure/Application"))
{
    skip = true;
}

if (!skip)
{
    if (isTaskActive('Plans Distribution') && isTaskStatus('Plans Distribution','Awaiting Client Reply')) 
        {
        updateTask("Plans Distribution","Resubmitted","Plan corrections submitted by Applicant.","Plan corrections submitted by Applicant.");
        } 
    if (isTaskActive('Plans Coordination') && isTaskStatus('Plans Coordination', 'Plan Revisions Needed'))
        {
            updateTask("Plans Distribution", "Resubmitted", "Plan corrections submitted by Applicant.", "Plan corrections submitted by Applicant.");
        }
    }


if (publicUser)
{    
   
     // EHIMS-4832: Resubmission after user already submitted.
     if (publicUser && 
        (itemCapType == "DEQ/WWM/Residence/Application" || 
        itemCapType == "DEQ/WWM/Subdivision/Application" ||        
        itemCapType == "DEQ/WWM/Commercial/Application"))
    {
        // EHIMS-4832
        if (getAppStatus() == "Resubmitted" || getAppStatus() == "Review in Process" || getAppStatus() == "Pending")
        {
            // 1. Set a flag
            editAppSpecific("New Documents Uploaded", 'CHECKED', capId);
            
            // 2. Send email to Record Assignee                       
            var cdScriptObjResult = aa.cap.getCapDetail(capId);
            if (!cdScriptObjResult.getSuccess())
                { logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; }

            var cdScriptObj = cdScriptObjResult.getOutput();

            if (!cdScriptObj)
                { logDebug("**ERROR: No cap detail script object") ; }

            cd = cdScriptObj.getCapDetailModel();

            // Record Assigned to
            var assignedUserid = cd.getAsgnStaff();
            if (assignedUserid !=  null)
            {
                iNameResult = aa.person.getUser(assignedUserid)

                if(iNameResult.getSuccess())
                {
                    assignedUser = iNameResult.getOutput();                   
                    var emailParams = aa.util.newHashtable();
                    var reportFile = new Array();
                    getRecordParams4Notification(emailParams);   
                    addParameter(emailParams, "$$assignedUser$$",assignedUser.getFirstName() + " " + assignedUser.getLastName());                 
                    addParameter(emailParams, "$$altID$$", capId.getCustomID());
                    if (assignedUser.getEmail() != null)
                    {
                        sendNotification("", assignedUser.getEmail() , "", "DEQ_WWM_REVIEW_REQUIRED", emailParams, reportFile);
                        logDebug("Email Sent here***************");
                        logDebug("Info: " + isTaskActive("Plans Coordination") + getAppStatus())
                    }                    
                }
            }             
        }

        // EHIMS -4431: Check if BOR is attached and there is a BOR fee already
        var capDocResult = aa.document.getDocumentListByEntity(capId, "CAP");
        if (capDocResult.getSuccess())
        {       
            logDebug("*** count *** " + capDocResult.getOutput().size());            
            var docType = "Board of Review Application";
            for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
            {
                var documentObject = capDocResult.getOutput().get(docInx);        
                
                var docCat = documentObject.getDocCategory();
                if (docCat.equals(docType)) 
                {

                    logDebug("Fee exists in record.");
                    logDebug("docName:" + documentObject.getDocName());
                    logDebug("fileName:" + documentObject.getFileName());
                    
                    // If BOR fee does not exist but BOR document has been attached, we need to add/invoice fee.
                    if (!feeExists("BOR"))
                    {
                        if (itemCapType == "DEQ/WWM/Residence/Application")
                        {
                            result = addFee("COM-BOR", "DEQ_SFR", "FINAL", 1, "Y");
                            logDebug("Add fee: DEQ_SFR" +  result);
                        }  
                        else if (itemCapType == "DEQ/WWM/Subdivision/Application")
                        {
                            addFee("COM-BOR", "DEQ_SUB", "FINAL", 1, "Y");
                            logDebug("Add fee: DEQ_SUB" +  result);
                        }
                        else if (itemCapType == "DEQ/WWM/Commercial/Application")
                        {
                            addFee("COM-BOR", "DEQ_SFR", "FINAL", 1, "Y");
                            logDebug("Add fee: DEQ_SFR" +  result);
                        }
                    }
                    
                    aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "DUA", emailText);
                }
            }
        }
   

    }

    if (isTaskActive("Application Review"))
    {
        if (isTaskStatus("Application Review", "Awaiting Client Reply")) 
        {
            updateAppStatus("Resubmitted");
            updateTask("Application Review", "Resubmitted", "Additional documents submitted by Applicant.", "Additional documents submitted by Applicant.");
        }
        if (itemCapType == "DEQ/WWM/Garbage/Permit")
        {               
            updateAppStatus("Resubmitted");
            
        }
    
    }

    if (isTaskActive("Final Review") && isTaskStatus("Final Review","Awaiting Client Reply"))
    {
        updateTask("Final Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }
    if (isTaskActive("Inspections") && isTaskStatus("Inspections","Awaiting Client Reply"))
    {
        updateTask("Inspections", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }

    if (itemCapType == "DEQ/WWM/Garbage/Amendment" || itemCapType == "DEQ/WWM/Garbage/Renewal")
    {
        if (isTaskActive("Renewal Review"))
        {
            updateAppStatus("Resubmitted");
        }
    }
   

    
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

