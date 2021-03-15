showDebug = true;


if (wfTask == "Tracking" && wfStatus == "System Valid")
{
    var workflowResult = aa.workflow.getTasks(capId);

    if (workflowResult.getSuccess())
    {
        wfObj = workflowResult.getOutput();
    }

    for (i in wfObj)
    {
        fTask = wfObj[i];
        logDebug("Task Description: " + fTask.getTaskDescription());
        logDebug("Task Disposition: " + fTask.getDisposition());        

        if (fTask.getTaskDescription().equals("Tracking") && fTask.getDisposition().equals("System Valid"))
        {      
            logDebug("Status Date: " +  fTask.getStatusDate());          
           
            if (fTask.getStatusDate() != null)
            {
                var expDateMMDDYYY = (fTask.getStatusDate().getMonth() + 1) + "/" + fTask.getStatusDate().getDate() + "/" + (parseInt(fTask.getStatusDate().getYear() + 3) + 1900);
                
                logDebug("ftTask expDateMMDDYYY: " + expDateMMDDYYY);
                expDateMMDDYYY = aa.date.parseDate(expDateMMDDYYY); 
                
                var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
                b1Exp = b1ExpResult.getOutput();
                b1Exp.setExpDate(expDateMMDDYYY);
                
                b1Exp.setExpStatus("Pending");
                aa.expiration.editB1Expiration(b1Exp.getB1Expiration());  
            }
            
        }            
                    
    }
}