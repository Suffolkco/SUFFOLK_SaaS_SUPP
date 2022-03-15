if (wfTask == "Application Review" && wfStatus == "Full Permit Required")
{
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Application Review", "Full Permit Required", "", "");
    deactivateTask("Site Consult");
    deactivateTask("Residential Provisional Phase");
    deactivateTask("Grant Review");
}

if (wfTask == "Preliminary Sketch Review" && wfStatus == "Full Permit Required")
{
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Preliminary Sketch Review", "Full Permit Required", "", "");
    deactivateTask("Inspections");
    deactivateTask("Final Review");
}

if (wfTask == "Grant Review" && (wfStatus == "No Application Received" || wfStatus == "Not Eligible" || wfStatus == "OK to Proceed"))
{
   if(isTaskActive("Site Consult") || isTaskActive("Preliminary Sketch Review"))
   {
       deactivateTask("Inspections");
   }
   else
   {
       activateTask("Inspections");
   }

}

if (wfTask == "Application Review" && wfStatus == "I/A OWTS")
{
    if (wfTask == "Inspections" && wfStatus == "Complete")
    {
        var desc = "SHIP Amendment of Application" + capIDString;
        var shipAmend = createChild('DEQ', 'WWM', 'SHIP', 'Amendment', desc) 
    }
}