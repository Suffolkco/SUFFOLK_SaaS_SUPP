//WTUA:DEQ/OPC/SITE ASSESSMENT/APPLICATION
var capAddresses = null;  
var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
	capAddresses = s_result.getOutput();	
}

if ((wfTask == 'Report/Plan Review' && wfStatus == 'Incomplete') ||
(wfTask == 'Remediation Plan Review' && wfStatus == 'Unapproved'))
{
	logDebug("Report/Plan Review and Incomplete/unapproved.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowPlanRevisionsNeeded(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowPlanRevisionsNeeded(wfComment, capAddresses);
	}		
}
else if (wfTask == 'Field Inspection' && wfStatus == 'Plan Revision Needed')     
{
	logDebug("Inspections and Plan Changed.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowInspectionPlanChangedOPC(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowInspectionPlanChangedOPC(wfComment, capAddresses);
	}		
}
else if (wfTask == "Closure Report Review" && wfStatus == "Unapproved")
{
	logDebug("Closure Report Review and Unapproved.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowAwaitingClientOPC(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowAwaitingClientOPC(wfComment, capAddresses);
    }		
}   
else if (wfTask == 'Closure Report Review' && wfStatus == 'Additional Work Required')
{
    logDebug("Closure Report Review and Additional Work Required.");          
	logDebug("In this loop Comments:" + wfComment);
	
	if (wfComment == null)
	{
		logDebug("Comments are empty.");
		workflowPlanRevisionsNeeded(" ", capAddresses);
	}
	else
	{
		logDebug("Comments are: " + wfComment);
		workflowPlanRevisionsNeeded(wfComment, capAddresses);
    }		

    updateTask("Remediation Plan Review", "Unapproved", "Additional Work Required", "Additional Work Required");
}
else if (wfTask == 'Closure Report Review' && wfStatus == 'NFA')
{
	copyAppSpecificTable(capId, parentCapId);
}

if (wfTask == "Sample Observation" && wfStatus == "Complete / Not Applicable")
{
	logDebug("Update task to Awaiting Client Reply");
	updateTask("Lab Data Review", "Awaiting Client Reply", "Additional Work Required", "Additional Work Required");
}
if (wfTask == "Lab Data Review" && wfStatus == "NTR")
{
	logDebug("Update task to Awaiting Client Reply");
	updateTask("Remediation Plan Review", "Awaiting Client Reply", "Additional Work Required", "Additional Work Required");
}

if (wfTask == "Remediation Oversight" && wfStatus == "Complete")
{
	logDebug("Update task to Awaiting Client Reply");
	updateTask("Closure Report Review", "Awaiting Client Reply", "Additional Work Required", "Additional Work Required");
}


function copyAppSpecificTable(srcCapId, targetCapId)
{
  var tableNameArray = getTableName(srcCapId);
  if (tableNameArray == null)
  {
    return;
  }
  for (loopk in tableNameArray)
  {
    var tableName = tableNameArray[loopk];
	logDebug("tableName: " + tableName);

	// UIC Data Alias
    if (matches(tableName,"CONTAMINANTS"))
    {
    	var targetAppSpecificTable = loadASITable(tableName,srcCapId);
		addASITable(tableName, targetAppSpecificTable,targetCapId);
	}
  }
}

function getTableName(capId)
{
  var tableName = null;
  var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
  if(result.getSuccess())
  {
    tableName = result.getOutput();
    if(tableName!=null)
    {
      return tableName;
    }
  }
  return tableName;
}
