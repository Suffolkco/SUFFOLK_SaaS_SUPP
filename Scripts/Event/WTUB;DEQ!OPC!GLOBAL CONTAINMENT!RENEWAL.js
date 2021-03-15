//WTUB:DEQ/OPC/GLOBAL CONTAINMENT/RENEWAL

// In order to show the message of cannot proceed with fees due, debug must be on.
showDebug = true;

if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    if (balanceDue > 0)
    {
        cancel = true;
        showMessage = true;
        comment("Cannot proceed with fees due");
    }
}

