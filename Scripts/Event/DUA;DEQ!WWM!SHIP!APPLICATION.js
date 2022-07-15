//DUA:DEQ/WWM/SHIP/APPLICATION

if (publicUser)
{
    logDebug("capId is: " + capId);
    if (capId.isCompleteCap())
    {
        updateAppStatus("Resubmitted");
    }
}