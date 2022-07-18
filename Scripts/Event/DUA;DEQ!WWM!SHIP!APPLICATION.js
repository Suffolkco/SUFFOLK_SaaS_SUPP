//DUA:DEQ/WWM/SHIP/APPLICATION


//need to get this so that it doesn't set this status on submittal, but does each time after that
if (publicUser)
{
    if (cap.isCompleteCap())
    {
        var fileDateObj = cap.getFileDate();
        var fileDate = "" + fileDateObj.getMonth() + "/" + fileDateObj.getDayOfMonth() + "/" + fileDateObj.getYear();
        logDebug("Filedate is: " + fileDate);
        var currentDate = new Date();
        var currentDateParsed = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + (currentDate.getYear() + 1900);
        logDebug("currentdateparsed is: " + currentDateParsed);

        if (fileDate != currentDateParsed)
        {
            updateAppStatus("Resubmitted");
        }
        else
        {
            logDebug("not updating today's date");
        }
    }
}