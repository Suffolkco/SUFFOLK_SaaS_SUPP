if (wfTask == "Application Review" && wfStatus == "Full Permit Required")
{
    //deactivateActiveTasks("DEQ_SHIP")
    closeTask("Application Review", "Full Permit Required", "", "");
}