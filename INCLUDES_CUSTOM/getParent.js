function getParent()
{
    var itemCap = capId;
    if (arguments.length > 0)
        itemCap = arguments[0];

    getCapResult = aa.cap.getProjectParents(itemCap,1);
    if (getCapResult.getSuccess())
    {
        parentArray = getCapResult.getOutput();
        if (parentArray.length)
            return parentArray[0].getCapID();
        else
        {
            logDebug( "**WARNING: GetParent found no project parent for this application");
            return false;
        }
    }
    else
    {
        logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return false;
    }
}