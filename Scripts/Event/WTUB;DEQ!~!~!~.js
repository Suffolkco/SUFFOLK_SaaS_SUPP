
//WTUB:DEQ/*/*/*

//Agency wide to cancel workflow if Final Review is Approved and fees are due

if (wfTask == "Final Review" && wfStatus == "Approved")
{
    if (balanceDue > 0)
    {
        cancel = true;
        showMessage = true;
        comment("Cannot proceed with fees due");
    }
}