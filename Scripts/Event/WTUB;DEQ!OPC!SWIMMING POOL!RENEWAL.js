//WTUB:DEQ/OPC/SWIMMING POOL/RENEWAL

if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    if (balanceDue > 0)
    {
        cancel = true;
        showMessage = true;
        comment("Cannot proceed with fees due");
    }
}

