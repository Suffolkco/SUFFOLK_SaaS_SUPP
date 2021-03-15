//DEQ/WR/Backflow/Application

if (publicUser)
{
    if (isTaskActive("Plan Review"))
    {
        updateTask("Plan Review", "Resubmitted", "Updated via DUA script", "Updated via DUA script");
        updateAppStatus("Resubmitted");
    }

    if (isTaskActive("Application Review") && isTaskStatus("Application Review","Awaiting Client Reply"))
    {
        updateTask("Application Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }
}