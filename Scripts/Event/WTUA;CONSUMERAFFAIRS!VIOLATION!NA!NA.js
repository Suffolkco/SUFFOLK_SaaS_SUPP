var itemCap = aa.cap.getCap(capId).getOutput();

if (wfTask == "Notice of Hearing" && wfStatus == "Notice Sent-Certified/Regular") 
{
    var childArray = getChildren("ConsumerAffairs/Violation/NA/NA", capId);

    if (childArray != null)
    {
        logDebug("childArray count: " + childArray.length);
        var length = childArray.length;

        for (var i = 0; i < length; i++)
        {
            logDebug("i: " + i);
            childCapId = childArray[i];

            var getCapResult = aa.cap.getCapID(childCapId);

            logDebug("Child cap: " + childCapId + " capResult: " + getCapResult);

            if (getCapResult)
            {
                var customId = childArray[i].getCustomID();

                //debugObject(childCapId);

                logDebug("Child record ID: " + customId);
                logDebug("childArray[i]:" + childCapId);

                var itemCapType = aa.cap.getCap(childCapId).getOutput().getCapType().toString();
                logDebug("itemCapType:" + itemCapType);

                if (matches(itemCapType, "ConsumerAffairs/Violation/NA/NA"))
                {

                    logDebug("matched...");
                    var workflowResult = aa.workflow.getTasks(childCapId);
                    if (workflowResult.getSuccess())
                    {
                        var wfObj = workflowResult.getOutput();
                        var fTask;
                        var wfChildTask;
                        var wfChildStatus;
                        var update = false;
                        for (w in wfObj)
                        {
                            fTask = wfObj[w];
                            wfChildTask = fTask.getTaskDescription();
                            wfChildStatus = fTask.getDisposition();

                            //logDebug("wfChildTask: " + wfChildTask);
                            //logDebug("wfChildStatus: " + wfChildStatus);

                            //logDebug("isTaskActive: " + fTask.getActiveFlag());

                            //logDebug("w within wfobj: " + w);

                            if (wfChildTask == "Notice of Hearing" && wfChildStatus == "Note")
                            {
                                logDebug("here wfChildTask: " + wfChildTask);
                                logDebug("here wfChildStatus: " + wfChildStatus);

                                if (fTask.getActiveFlag().equals("Y"))                        
                                {
                                    logDebug("Update to notice of hearing sent-certified");
                                    updateTask("Notice of Hearing", "Notice Sent-Certified/Regular", "Updated via WTUA script", "Updated via WTUA script", "", childCapId);
                                    logDebug("Deatctivated notice of hearing.");
                                    deactivateTaskWithCapId("Notice of Hearing", "", childCapId);
                                    logDebug("isTaskActive: " + fTask.getActiveFlag());
                                    activateTaskWithCapId("Hearing", "", childCapId);
                                    updateTask("Hearing", "In Progress", "Updated via WTUA script", "Updated via WTUA script", "", childCapId);
                                    //updateTask("Hearing", "In Progress", "Updated via WTUA script", "Updated via WTUA script", "",childCapId); 
                                    update = true;
                                }
                                else if (wfChildTask == "Hearing")
                                {
                                    logDebug("wfChildTask:" + wfChildTask);
                                    logDebug("here wfChildStatus: " + wfChildStatus);
                                    logDebug("update:" + update);
                                    logDebug("isTaskActive: " + fTask.getActiveFlag());
                                    /*
                                    if (update)
                                    { 
                                        activateTaskWithCapId("Hearing", "", childCapId);
                                        logDebug("isTaskActive: " + fTask.getActiveFlag());
                                        updateTask("Hearing", "In Progress", "Updated via WTUA script", "Updated via WTUA script", "",childCapId); 
                                        logDebug("isTaskActive: " + fTask.getActiveFlag());
                                    }*/

                                }
                                else
                                {
                                    logDebug("Not Active..." + wfChildTask);
                                }
                            }
                        }
                    }
                }
            }

            logDebug("i final here: " + i);
        }
    }

}

//Notify Primary Vendor Contact When WF task Payment has a status of Collections External, or Collections Internal

if (!publicUser)
{
    var vEParams = aa.util.newHashtable();
    var conArray = getContactByType("Vendor", capId);
    var conEmail = "";
    if (conArray.getPrimaryFlag() == "Y")
    {
        if (wfTask == "Payment" && wfStatus == "Collections External" || "Collections Internal")
        {
            addParameter(vEParams, '$$altID$$', capId.getCustomID());
            conEmail += conArray.email + "; ";
            logDebug("Email addresses: " + conEmail);
            sendNotification("", conEmail, "", "CA_VIOLATION_FEES_DUE", vEParams, null);
        }
    }
}



function debugObject(object)
{
    var output = '';
    for (property in object)
    {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}

function activateTaskWithCapId(wfstr, temp, id) // optional process name
{
    var useProcess = false;
    var processName = "";

    if (arguments.length == 2)
    {
        processName = arguments[1]; // subprocess
        useProcess = true;
    }

    var workflowResult = aa.workflow.getTaskItems(id, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    {
        logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }

    for (i in wfObj)
    {
        var fTask = wfObj[i];
        logDebug("fTask: " + fTask);
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
        {
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();

            if (useProcess)
            {
                aa.workflow.adjustTask(id, stepnumber, processID, "Y", "N", null, null)
            } else
            {
                aa.workflow.adjustTask(id, stepnumber, "Y", "N", null, null)
            }
            logDebug("Activating Workflow Task: " + wfstr);
            logDebug("Activating Workflow Task: " + wfstr);
        }
    }
}

function deactivateTaskWithCapId(wfstr, temp, id) // optional process name
{
    var useProcess = false;
    var processName = "";

    if (arguments.length == 2)
    {
        processName = arguments[1]; // subprocess
        useProcess = true;
    }

    var workflowResult = aa.workflow.getTaskItems(id, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else
    {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }

    for (i in wfObj)
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName)))
        {
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            var completeFlag = fTask.getCompleteFlag();
            logDebug("completeFlag:" + completeFlag);

            if (useProcess)
            {
                aa.workflow.adjustTask(id, stepnumber, processID, "N", completeFlag, null, null);
            } else
            {
                aa.workflow.adjustTask(id, stepnumber, "N", completeFlag, null, null);
            }

            logDebug("deactivating Workflow Task: " + wfstr);
        }
    }
}
