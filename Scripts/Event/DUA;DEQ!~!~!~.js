//DUA;DEQ!~!~!~!
showDebug = true;
showMessage = true;
var emailText = "";

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
    
 
    // Record Assigned?
	var cdScriptObjResult = aa.cap.getCapDetail(capId);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; }

	cd = cdScriptObj.getCapDetailModel();

    // Record Assigned to
    var assignedUserid = cd.getAsgnStaff();
    if (assignedUserid !=  null)
    {
    iNameResult = aa.person.getUser(assignedUserid)
	
	if (!iNameResult.getSuccess())
		{ logDebug("**ERROR retrieving  user model " + assignstaffId + " : " + iNameResult.getErrorMessage()) ;}

	iName = iNameResult.getOutput();
    logDebug("Dept of user: " + iName.getDeptOfUser());
	
   
        if(iNameResult.getSuccess())
        {
            var userObj = userResult.getOutput();
            logDebug("First Name: " +   userObj.getFirstName())
            logDebug("Email: " +     userObj.getEmail());
            logDebug("Last name: " + userObj.getLastName());        
        }
    } 

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

function assignCap(assignId) // option CapId
	{
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	iNameResult  = aa.person.getUser(assignId);

	if (!iNameResult.getSuccess())
		{ logDebug("**ERROR retrieving  user model " + assignId + " : " + iNameResult.getErrorMessage()) ; return false ; }

	iName = iNameResult.getOutput();

	cd.setAsgnDept(iName.getDeptOfUser());
	cd.setAsgnStaff(assignId);

	cdWrite = aa.cap.editCapDetail(cd)

	if (cdWrite.getSuccess())
		{ logDebug("Assigned CAP to " + assignId) }
	else
		{ logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()) ; return false ; }
	}