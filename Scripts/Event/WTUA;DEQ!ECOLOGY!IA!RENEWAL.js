var showDebug = false; 
var parentCapId = getParentCapID4Renewal(); 
logDebug("Renewal parentCapId: " + parentCapId);
if (parentCapId == null)
{
    parentCapId = getParent(capId);
    logDebug("Actual parent ID: " + parentCapId);

}

var type = getAppSpecific("Type", capId);
var use = getAppSpecific("Use", capId);



if (wfTask == "Ecology Clerical Staff Review" && wfStatus == "Approved")
{
    logDebug("Child Type: " + type);
    logDebug("Child Use: " + use);

    logDebug("Existig Parent Type: " + getAppSpecific("Type", parentCapId));
    logDebug("Existig Parent Type: " + getAppSpecific("Use", parentCapId));


    editAppSpecific("Type", type, parentCapId);
    editAppSpecific("Use", use, parentCapId);
    logDebug("New Parent Type: " + getAppSpecific("Type", parentCapId));
    logDebug("New Parent Type: " + getAppSpecific("Use", parentCapId));

    var projIncomplete = aa.cap.getProjectByChildCapID(capId, "Renewal", "Incomplete");
    logDebug("Proj Inc " + projIncomplete.getSuccess());
    if(projIncomplete.getSuccess())
    {
        var projInc = projIncomplete.getOutput();
        for (var pi in projInc)
        {
            parentCapId = projInc[pi].getProjectID();
            logDebug("parentCapId: " + parentCapId);
            projInc[pi].setStatus("Review");
            var updateResult = aa.cap.updateProject(projInc[pi]);
        }
    }     
    var projReview = aa.cap.getProjectByChildCapID(capId, "Renewal", "Review");
    logDebug("Proj Rev " + projReview.getSuccess());
    if(projReview.getSuccess())
    {
        var projRev = projReview.getOutput();
        for (var pr in projRev)
        {
            parentCapId = projRev[pr].getProjectID();
            logDebug("parentCapId: " + parentCapId);
            projRev[pr].setStatus("Complete");
            var updateResult = aa.cap.updateProject(projRev[pr]);
        }
    }	

    // EHIMS-4423
    // Update parent SITE record expiration date and status to Pending
    var workflowResult = aa.workflow.getTasks(capId);
    var wfObj;
    var todaysDate = new Date();
    var expDateMMDDYYY = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear()); 

    if (workflowResult.getSuccess())
    {
        wfObj = workflowResult.getOutput();
    }

    for (i in wfObj)
    {
        fTask = wfObj[i];
        logDebug("Task Description: " + fTask.getTaskDescription());
        logDebug("Task Disposition: " + fTask.getDisposition());        

        if (fTask.getTaskDescription().equals("Ecology Clerical Staff Review") && fTask.getDisposition() != null)
        {      
            logDebug("Status Date: " +  fTask.getStatusDate());          
           
            if (fTask.getStatusDate() != null)
            {
                expDateMMDDYYY = (fTask.getStatusDate().getMonth() + 1) + "/" + fTask.getStatusDate().getDate() + "/" + (parseInt(fTask.getStatusDate().getYear() + 3) + 1900);
                logDebug("ftTask expDateMMDDYYY: " + expDateMMDDYYY);
            }
            
        }            
                    
    }


    //var todaysDate = new Date();
    //var expDateMMDDYYY = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear() + 3);        
    expDateMMDDYYY = aa.date.parseDate(expDateMMDDYYY); 
    logDebug("expDateMMDDYYY: " + expDateMMDDYYY);

    var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
    if (b1ExpResult.getSuccess())
    {
        b1Exp = b1ExpResult.getOutput();
        b1Exp.setExpDate(expDateMMDDYYY);
        b1Exp.setExpStatus("Pending");
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());  
    }
}
logDebug("We made it to the end of the script!");