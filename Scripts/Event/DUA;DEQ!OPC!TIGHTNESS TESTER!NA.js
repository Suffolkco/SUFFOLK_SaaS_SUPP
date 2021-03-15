//DUA:DEQ/OPC/TIGHTNESS TESTER/NA
if (publicUser)
{ 
    if (isTaskActive("Review") && isTaskStatus("Review","Awaiting Client Reply"))
    {
        updateTask("Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }

}