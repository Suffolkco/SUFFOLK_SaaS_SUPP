//DUA:DEQ/WWM/SHIP/APPLICATION


//need to get this so that it doesn't set this status on submittal, but does each time after that
if (publicUser)
{
    if (cap.isCompleteCap())
    {
        if (cap.getAuditID().search("SHIP Legacy Import") == -1)
        {
            var wfHist = aa.workflow.getWorkflowHistory(capId, null);
            var wfHistArray = [];
            if (wfHist.getSuccess())
            {
                wfHist = wfHist.getOutput();
                for (var h in wfHist)
                {
                    logDebug("wfhist[h] taskdesc is: " + wfHist[h].getTaskDescription());

                    wfHistArray.push(wfHist[h].getTaskDescription());
                }
                logDebug("wfhist array length is " + wfHistArray.length);
            } else
            {
                logDebug("not success");
            }

            if (wfHistArray.length != 0)
            {
                updateAppStatus("Resubmitted");
            }
            else
            {
                logDebug("not updating today's date");
            }
        }
    }
}