if (wfTask == "Application Review" && wfStatus == "Full Permit Required")
{
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Application Review", "Full Permit Required", "", "");
    deactivateTask("Site Consult");
    deactivateTask("Residential Provisional Phase");
    deactivateTask("Grant Review");
}

if (wfTask == "Preliminary Sketch Review")
{
    if (wfStatus == "Full Permit Required")
    {
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Preliminary Sketch Review", "Full Permit Required", "", "");
    deactivateTask("Inspections");
    deactivateTask("Final Review"); 
    }
}

if (isTaskActive("Grant Review") || isTaskActive("Preliminary Sketch Review"))
{
    deactivateTask("Final Review")
    deactivateTask("Inspections")
} 

if (wfTask == "Grant Review" && (wfStatus == "No Application Received" || wfStatus == "Not Eligible" || wfStatus == "OK to Proceed")) 
{
    if (isTaskStatus("Preliminary Sketch Review", "OK to Proceed"))
        
        {
            deactivateTask("Inspections")
            activateTask("Final Review");

        }

    
}

