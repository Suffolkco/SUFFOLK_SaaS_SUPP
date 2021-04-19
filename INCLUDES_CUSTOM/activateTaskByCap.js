function activateTaskByCap(wfstr, capId) 
{
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess()) 
    {
        var wfObj = workflowResult.getOutput();
    } else 
    {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
  
    for (var i in wfObj)
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) 
        {
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            //PARAMETERS ARE: Cap ID, StepNumber, ActiveFlag, CompleteFlag, Assignment Date, Due Date
            aa.workflow.adjustTask(capId, stepnumber, "Y", "N", null, null);
            logDebug("Activating Workflow Task: " + wfstr);
        }
    }
}