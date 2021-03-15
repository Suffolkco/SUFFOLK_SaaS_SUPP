//DUA:DEQ/OPC/SITE ASSESSMENT/APPLICATION
 
	showDebug = false;

var supSamcheck = false;
inspFail = false;
var docToCheckFor = "Supplemental Sampling Report";
var docsList = new Array();
docsList = getDocumentList();	//Get all Documents on a Record
var assignDocList = aa.util.newArrayList();
for(var counter = 0; counter < docsList.length; counter++)
{
	//logDebug("Looping through docList.  Iterator = " + counter+ "  this is the type " +  docsList[counter].getDocCategory());
	var thisDocument = docsList[counter];
	if (thisDocument.getDocCategory()  == docToCheckFor)
	{
		supSamcheck = true;
		logDebug("Supplemental Sampling Report has been uploaded");
	}
}

var insps;
var inspections = aa.inspection.getInspections(capId);
logDebug("Has Inspections: " + inspections.getSuccess());
if (inspections.getSuccess()) 
{
    insps = inspections.getOutput();
    for (i in insps) 
    {
        if (insps[i].getInspectionType() == "Remediation and Spills Inspection")
        {
            if (insps[i].getInspectionStatus() == "Fail")
            {
                logDebug("Remediation and Spills Inspection has failed.")
                inspFail = true;
            }
            else
            {
                inspFail = false;
            }
        }
    }
}
if(supSamcheck == true && inspFail == true)
{
    updateFee("BIER-SSR", "DEQ_ESACAPP", "FINAL", 1, "Y");
}

logDebug("I made it to the task updates!");

if (isTaskActive("Report/Plan Review") &&  isTaskStatus("Report/Plan Review","Incomplete"))
{ 
    updateTask("Report/Plan Review", "Resubmitted", "Report/Plan corrections submitted by Applicant", "Report/Plan corrections submitted by Applicant");
}
	 
if (isTaskActive("Remediation Plan Review") && isTaskStatus("Remediation Plan Review","Unapproved"))
{
	updateTask("Remediation Plan Review", "Resubmitted", "Plan corrections submitted by Applicant", "Plan corrections submitted by Applicant");
} 

if (isTaskActive("Closure Report Review") && isTaskStatus("Closure Report Review","Unapproved"))
{
	updateTask("Closure Report Review", "Resubmitted", "Plan corrections submitted by Applicant", "Plan corrections submitted by Applicant");
} 

if (isTaskActive("Closure Report Review") && isTaskStatus("Closure Report Review","Additional Work Required")) 
{
	updateTask("Remediation Plan Review", "Resubmitted", "Plan corrections submitted by Applicant", "Plan corrections submitted by Applicant");
} 

if (isTaskActive("Application Submitted") && isTaskStatus("Application Submitted","Awaiting Client Reply")) 
{
	updateTask("Application Submitted", "Resubmitted", "Application submitted by Applicant", "Application submitted by Applicant");
}
if (isTaskActive("Closure Report Review") && isTaskStatus("Closure Report Review","Complete")) 
{
	updateTask("Closure Report Review", "Resubmitted", "Closure Report Review submitted by Applicant", "Closure Report Review submitted by Applicant");
} 
if (isTaskActive("Lab Data Review") && isTaskStatus("Lab Data Review","Awaiting Client Reply")) 
{
	updateTask("Lab Data Review", "Resubmitted", "Lab Data Review submitted by Applicant", "Lab Data Review submitted by Applicant");
} 

if (isTaskActive("Remediation Plan Review") && isTaskStatus("Remediation Plan Review","Awaiting Client Reply")) 
{
	updateTask("Remediation Plan Review", "Resubmitted", "Lab Data Review submitted by Applicant", "Lab Data Review submitted by Applicant");
} 
if (isTaskActive("Closure Report Review") && isTaskStatus("Closure Report Review","Awaiting Client Reply")) 
{
	updateTask("Closure Report Review", "Resubmitted", "Closure Report Review submitted by Applicant", "Closure Report Review submitted by Applicant");
} 