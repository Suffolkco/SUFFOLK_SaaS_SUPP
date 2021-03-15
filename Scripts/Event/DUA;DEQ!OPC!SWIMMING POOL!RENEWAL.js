//DUA:DEQ/OPC/SWIMMING POOL/RENEWAL
if (publicUser)
{ 
    if (isTaskActive("Renewal Review") && isTaskStatus("Renewal Review","Awaiting Client Reply"))
    {
        updateTask("Renewal Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }
}
