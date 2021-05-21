//WTUA;DEQ!~!~!~!

var itemCap = aa.cap.getCap(capId).getOutput();
var appTypeResult = itemCap.getCapType();
var appTypeString = appTypeResult.toString(); 
var appTypeArray = appTypeString.split("/");
var workflowResult = aa.workflow.getTasks(capId);
var wfObj;
var capAddresses = null;  


if (workflowResult.getSuccess())
{
    wfObj = workflowResult.getOutput();
}
else
{ 
    logDebug("**ERROR: Failed to get workflow object"); 
}

logDebug("WTUA; DEQ" + wfTask + "," + wfStatus);
// OPC Tank Installation/Registration
if ((wfTask == "Application Review" && wfStatus == "Awaiting Client Reply") &&      
    ((appTypeArray[2] == "Hazardous Tank" && appTypeArray[3] == "Application") ||
    (appTypeArray[2] == "Global Containment" && appTypeArray[3] == "Application") ||
    (appTypeArray[2] == "Global Containment" && appTypeArray[3] == "Renewal") ||
    (appTypeArray[2] == "Hazardous Tank Closure" && appTypeArray[3] == "Appllication")||      
    (appTypeArray[2] == "Swimming Pool" && appTypeArray[3] == "Application")))
{

    logDebug("[2]" + appTypeArray[2]);
    logDebug("[2]" + appTypeArray[3]);

    var s_result = aa.address.getAddressByCapId(capId);
    if(s_result.getSuccess())
    {
        capAddresses = s_result.getOutput();       
    }

                  
    //if (wfTask == "Application Review" && wfStatus == "Awaiting Client Reply")
    //{
        logDebug("App Review and waiting client reply.");  
        logDebug("Outside loop workflow comment" + wfComment);

        for (i in wfObj)
        {
            fTask = wfObj[i];
    
                if (fTask.getDisposition() != null && fTask.getCompleteFlag() == "N")
                {
                    wfComment = fTask.getDispositionComment();
                    
                    if (wfComment == null)
                    {
                        workflowAwaitingClientOPC(" ", capAddresses);
                        logDebug("Comments are empty.");
                    }
                    else
                    {
                        logDebug("Comments are: " + wfComment);
                        workflowAwaitingClientOPC(wfComment, capAddresses);
                    }

                }                
        }   
        logDebug("done in applicaiton review OPC.")
    //}            
}
else if ((wfTask == "Final Review" && wfStatus == "Awaiting Client Reply") ||
    (wfTask == "Inspections" && wfStatus == "Awaiting Client Reply"))
{
    if (appTypeArray[1] == "OPC")
	{
        var wfComment = null;
        var s_result = aa.address.getAddressByCapId(capId);
        if(s_result.getSuccess())
        {
            capAddresses = s_result.getOutput();
            if (capAddresses != null)
            {                              
                var output = '';
                for (property in capAddresses) {
                    output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + capAddresses[property] + "</bold>" + '; ' + "<BR>";
                }
                logDebug(output);  
            }
            else
            {
                logDebug("capaddresses is null.");
            }
        }
    
        for (i in wfObj)
        {
            fTask = wfObj[i];
    
                if (fTask.getTaskDescription().equals("Final Review") && fTask.getDisposition() != null && fTask.getCompleteFlag() == "N")
                {
                    wfComment = fTask.getDispositionComment();
                    
                    if (wfComment == null)
                    {
                        workflowAwaitingClientOPC(" ", capAddresses);
                        logDebug("Comments are empty.");
                    }
                    else
                    {
                        logDebug("Comments are: " + wfComment);
                        workflowAwaitingClientOPC(wfComment, capAddresses);
                    }

                }                
        }


    }
    else
    {
        var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
        if(!matches(itemCapType, "DEQ/WWM/Residence/Application", "DEQ/WWM/Commercial/Application"))
        {
            workflowAwaitingClientDEQ();
        }
    } 
}
else if(wfStatus == "Awaiting Client Reply")
{
    var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
    if (appTypeArray[1] == "OPC")
    {
        if (appTypeArray[2] != "Swimming Pool" && appTypeArray[3] != "Renewal")
        {
            var wfComment = null;
            var s_result = aa.address.getAddressByCapId(capId);
            if(s_result.getSuccess())
            {
                capAddresses = s_result.getOutput();                    
            }

            for (i in wfObj)
            {
                fTask = wfObj[i];
        
                if (fTask.getDisposition() != null && fTask.getCompleteFlag() == "N")
                {
                    wfComment = fTask.getDispositionComment();
                            
                    if (wfComment == null)
                    {
                        workflowAwaitingClientOPC(" ", capAddresses);
                        logDebug("Comments are empty.");
                    }
                    else
                    {
                        logDebug("Comments are: " + wfComment);
                        workflowAwaitingClientOPC(wfComment, capAddresses);                    
                    }            
                }
            }        
        }
    }
    else if(!matches(itemCapType, "DEQ/WR/Water Modification/Application", "DEQ/WR/Backflow/Application", "DEQ/WWM/Residence/Application", "DEQ/WWM/Commercial/Application", "DEQ/WWM/Subdivision/Application")) 
    {            
        workflowAwaitingClientDEQ();
    }
    updateAppStatus("Awaiting Client Reply");
}
if (wfTask == 'Plans Coordination' && wfStatus == 'Plan Revisions Needed') 
    {
        var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
        if(!matches(itemCapType, "DEQ/WWM/Residence/Application", "DEQ/WWM/Commercial/Application", "DEQ/WWM/Subdivision/Application")) 
        {            
            activateTask("Plans Distribution");
            updateTask("Plans Distribution", "Awaiting Client Reply", "Awaiting Plan Revisions", ""); 
        } 
        if (matches(itemCapType, "DEQ/WWM/Commercial/Application", "DEQ/WWM/Residence/Application", "DEQ/WWM/Subdivision/Application")) 
        {
            updateTask("Plans Distribution", "Awaiting Client Reply", "Awaiting Plan Revisions", "Awaiting Plan Revisions"); 
        }
    }  
   
if (wfTask == "Plans Distribution" && wfStatus == "Routed for Review")
{
    var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
    logDebug("itemCapType: " + itemCapType);     
    if (matches(itemCapType, "DEQ/WWM/Residence/Application", "DEQ/WWM/Commercial/Application", "DEQ/WWM/Subdivision/Application"))
    {        
        var appStatus = getAppStatus(capId);
        logDebug("appStatus: " + appStatus);     

        if (appStatus == "Resubmitted")
        {
            updateAppStatus("Review In Process");
        }
    }

    //msg = "itemCapType:" + itemCapType + ".appStatus: " + appStatus;
    //aa.sendEmail("ada.chan@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "Log", msg, null);

}

if (wfStatus == "Final Review Approved")
    {
        workflowFinalReviewApproved();
    }

if (appTypeArray[2] == "Water Modification" && appTypeArray[3] == "Application")
{
    if ((wfTask == "Application Review"  || wfTask == "Plan Review") && wfStatus == "Awaiting Client Reply")
    {
        logDebug("Application Review or Plan Reivews and awaiting client reply"); 
        workflowAwaitingClientBackflow();
    }
    else if (wfTask == "Plan Review" && wfStatus == "Approved")
	{
        logDebug("Plan Review and Approved");         
		workflowPlanReviewApprovedWR();
	}
}

if (appTypeArray[2] == "Backflow" && appTypeArray[3] == "Application") 
{
    if (wfTask == "Plan Review" && wfStatus == "Approved")
	{
		workflowPlanReviewApprovedBackflow();
	}
	if (wfStatus == "Awaiting Client Reply")
    {
        workflowAwaitingClientBackflow();
    }
} 

if (wfTask == "Final Review" && wfStatus == "Approved") 
{
    var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
    if(!matches(itemCapType, "DEQ/OPC/Hazardous Tank/Application", "DEQ/OPC/Global Containment/Application", "DEQ/OPC/Hazardous Tank Closure/Application"))
    {
        updateAppStatus("Approved");
    }
    else
    {
        updateAppStatus("Complete");
    }
}

if (wfTask == "Inspections") 
{        
    var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
    if(matches(itemCapType, "DEQ/OPC/Hazardous Tank/Application", "DEQ/OPC/Global Containment/Application", "DEQ/OPC/Swimming Pool/Application"))
    {
        if (wfStatus == "Permit Expired")        
        {
            b1ExpResult = aa.expiration.getLicensesByCapID(capId)
            if (b1ExpResult.getSuccess())
            {
                b1Exp = b1ExpResult.getOutput();
                b1Exp.setExpStatus("Expired");
                aa.expiration.editB1Expiration(b1Exp.getB1Expiration());                
            }
            updateAppStatus("Permit Expired");
        }
        else if (wfStatus == "Permit Renewed")  
        {
            b1ExpResult = aa.expiration.getLicensesByCapID(capId)
            if (b1ExpResult.getSuccess())
            {
                b1Exp = b1ExpResult.getOutput();
                curExp = b1Exp.getExpDate();         
                expDateCon = new Date(curExp.getMonth() + "/" + curExp.getDayOfMonth() + "/" + curExp.getYear());
                logDebug("Current expiration is: " + expDateCon);
                var year = expDateCon.getFullYear();
                var month = expDateCon.getMonth();
                var day = expDateCon.getDate();
                var newDate = new Date(year + 1, month, day);
                var dateMMDDYYYY = jsDateToMMDDYYYY(newDate);
                dateMMDDYYYY = aa.date.parseDate(dateMMDDYYYY);
                b1Exp.setExpDate(dateMMDDYYYY);
                logDebug("New expiration date is: " + dateMMDDYYYY);
                b1Exp.setExpStatus("Pending");
                aa.expiration.editB1Expiration(b1Exp.getB1Expiration());                
            }
            updateAppStatus("Plan Approved");
        }
    }
}



