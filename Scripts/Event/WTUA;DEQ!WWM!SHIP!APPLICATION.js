if (wfTask == "Application Review" && wfStatus == "Full Permit Required")
{
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Application Review", "Full Permit Required", "", "");
    deactivateTask("Site Consult");
    deactivateTask("Residential Provisional Phase");
}

if (wfTask == "Preliminary Sketch Review" && wfStatus == "Full Permit Required")
{
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Preliminary Sketch Review", "Full Permit Required", "", "");
    deactivateTask("Inspections");
    deactivateTask("Final Review");
}