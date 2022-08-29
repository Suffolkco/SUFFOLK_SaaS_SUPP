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

if (wfTask == "Enforcement Request Review" && wfStatus == "NOPH Sent")
{
    var enforcementType = getAppSpecific("Enforcement Type");
    if (matches(enforcementType, "", null, undefined, " "))
    {
        cancel = true;
        showMessage = true;
        comment("You must select an Enforcement Type on the Custom Fields tab before you can advance the workflow to this status.");
    }
}