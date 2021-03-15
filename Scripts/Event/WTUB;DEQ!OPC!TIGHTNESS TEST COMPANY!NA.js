//WTUB:DEQ/OCC/TIGHTNESS TEST COMPANY/NA

if (wfTask == "Review" && wfStatus == "Ready for Inspection")
{
    if (balanceDue > 0)
    {
        cancel = true;
        showMessage = true;
        comment("Cannot proceed with fees due")
    }
}
