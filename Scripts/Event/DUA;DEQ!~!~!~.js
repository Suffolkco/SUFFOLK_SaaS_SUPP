//DUA;DEQ!~!~!~!
showDebug = true;
showMessage = true;

var skip = false;
var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
// If record type is WWM and it's a backoffice user, we do not want to update the status
if (!publicUser && 
    (itemCapType == "DEQ/WWM/Residence/Application" || 
    itemCapType == "DEQ/WWM/Subdivision/Application" ||        
    itemCapType == "DEQ/WWM/Commercial/Application" ||
    itemCapType == "DEQ/WWM/Garbage/Permit" ||
    itemCapType == "DEQ/WWM/Garbage/Amendment" ||
    itemCapType == "DEQ/WWM/Garbage/Renewal"    ||
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
 
    logDebug("First Name: " +   cap.getFirstName())
    logDebug("Email: " +     cap.getEmail());
    logDebug("Last name: " + cap.getLastName());
    


if (publicUser)
{
     // EHIMS-4832: Resubmission after user already submitted.
     if (publicUser && 
        (itemCapType == "DEQ/WWM/Residence/Application" || 
        itemCapType == "DEQ/WWM/Subdivision/Application" ||        
        itemCapType == "DEQ/WWM/Commercial/Application"))
    {
        if (getAppStatus() == "Resubmitted" || getAppStatus() == "Review in Process" )
        {
            // Send email, set a flag
          

            editAppSpecific("New Documents Uploaded", 'CHECKED', capId);
            
        }
    }

    if (isTaskActive("Application Review"))
    {
        if (isTaskStatus("Application Review", "Awaiting Client Reply")) 
        {
            updateAppStatus("Resubmitted");
            updateTask("Application Review", "Resubmitted", "Additional documents submitted by Applicant.", "Additional documents submitted by Applicant.");
        }
        if (itemCapType == "DEQ/WWM/Garbage/Permit")
        {               
            updateAppStatus("Resubmitted");
            
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

    if (itemCapType == "DEQ/WWM/Garbage/Amendment" || itemCapType == "DEQ/WWM/Garbage/Renewal")
    {
        if (isTaskActive("Renewal Review"))
        {
            updateAppStatus("Resubmitted");
        }
    }
   

    
}

function logDebug(dstr)
{
	//if (showDebug.substring(0,1).toUpperCase().equals("Y"))
	if(showDebug)
	{
		aa.print(dstr)
		emailText+= dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}