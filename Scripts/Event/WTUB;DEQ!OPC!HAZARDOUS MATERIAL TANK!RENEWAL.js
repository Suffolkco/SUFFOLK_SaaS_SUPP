
if (wfTask == "Renewal Review" && wfStatus == "Issue Permit")
{
    if (balanceDue > 0)
    {
        cancel = true;
        showMessage = true;
        comment("Cannot proceed with fees due");
    }
}

