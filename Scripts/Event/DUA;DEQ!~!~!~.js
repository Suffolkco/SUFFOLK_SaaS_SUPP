//DUA;DEQ!~!~!~!
var skip = false;
var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
// If record type is WWM and it's a backoffice user, we do not want to update the status
if (!publicUser && 
    (itemCapType == "DEQ/WWM/Residence/Application" || 
    itemCapType == "DEQ/WWM/Subdivision/Application" ||        
    itemCapType == "DEQ/WWM/Commercial/Application" ||
    itemCapType == "DEQ/OPC/Global Containment/Application" ||
    itemCapType == "DEQ/OPC/Hazardous Tank/Application" ||
    itemCapType == "DEQ/OPC/Swimming Pool/Application" ||
    itemCapType == "DEQ/OPC/Hazardous Tank Closure/Application"))
{
    skip = true;
}

if (!skip)
{
    if (isTaskActive('Plans Distribution') && isTaskStatus('Plans Distribution','Awaiting Client Reply')) 
        {
        updateTask("Plans Distribution","Resubmitted","Plan corrections submitted by Applicant.","Plan corrections submitted by Applicant.");
        } 
    if (isTaskActive('Plans Coordination') && isTaskStatus('Plans Coordination', 'Plan Revisions Needed'))
        {
            updateTask("Plans Distribution", "Resubmitted", "Plan corrections submitted by Applicant.", "Plan corrections submitted by Applicant.");
        }
    }
 
if (publicUser)
{
    if (isTaskActive("Application Review"))
    {
        if (isTaskStatus("Application Review", "Awaiting Client Reply")) 
        {
            updateAppStatus("Resubmitted");
            updateTask("Application Review", "Resubmitted", "Additional documents submitted by Applicant.", "Additional documents submitted by Applicant.");
        }
    }

    if (isTaskActive("Final Review") && isTaskStatus("Final Review","Awaiting Client Reply"))
        {
            updateTask("Final Review", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
            updateAppStatus("Resubmitted");
        }
    if (isTaskActive("Inspections") && isTaskStatus("Inspections","Awaiting Client Reply"))
    {
        updateTask("Inspections", "Resubmitted", "Additional information submitted by Applicant", "Additional information submitted by Applicant");
        updateAppStatus("Resubmitted");
    }
}