//DUA:DEQ/WR/Well Driller/Application

if (publicUser)
{ 
    if (isTaskActive("Application Review") && isTaskStatus("Application Review","Awaiting Client Reply"))
    {
        updateTask("Application Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }

    if (isTaskActive("Well Driller Certification Review") && isTaskStatus("Well Driller Certification Review","Awaiting Client Reply"))
    {
        updateTask("Well Driller Certification Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }
}
