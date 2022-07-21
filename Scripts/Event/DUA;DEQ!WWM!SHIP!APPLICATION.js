//DUA:DEQ/WWM/SHIP/APPLICATION


//need to get this so that it doesn't set this status on submittal, but does each time after that
if (publicUser)
{
    if (cap.isCompleteCap())
    {
        var fileDateObj = cap.getFileDate();
        logDebug("filedateobj epoch is: " + fileDateObj.getEpochMilliseconds());
        var currentDate = new Date();
         var currentDateBefore = currentDate.setMinutes(currentDate.getMinutes() - 30);
         currentDateBefore = currentDate.setSeconds(currentDate.getSeconds());
        logDebug("currentdatebefore is: " + currentDateBefore);
        logDebug("filedateobj is: " + fileDateObj.getEpochMilliseconds() + " and currentdatebefore is " + currentDateBefore);
        if (fileDateObj.getEpochMilliseconds() < currentDateBefore)
        {
            updateAppStatus("Resubmitted");
        }
        else
        {
            logDebug("not updating today's date");
        }
    }
}