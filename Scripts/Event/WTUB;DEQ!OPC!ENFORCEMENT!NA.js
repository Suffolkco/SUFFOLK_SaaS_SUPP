//WTUB:DEQ/OPC/ENFORCEMENT/NA

if (wfTask == "End Enforcement Action" && wfStatus == "Close")
{
    if (balanceDue > 0)
    {
        cancel = true;
        showMessage = true;
        comment("You must pay the balance due before you can close this record.");
    }
}