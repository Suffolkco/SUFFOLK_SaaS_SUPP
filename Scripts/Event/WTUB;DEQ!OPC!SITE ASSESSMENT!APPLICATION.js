showDebug = true;

if ((wfTask == "Closure Report Review" && wfStatus == "NFA") ||
(wfTask == "Lab Data Review" && wfStatus == "NFA"))
{
    if (balanceDue > 0)
    {
        cancel = true;
        showMessage = true;
        comment("Cannot proceed with fees due");
    }
}