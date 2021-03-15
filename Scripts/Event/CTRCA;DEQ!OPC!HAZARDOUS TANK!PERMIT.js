//CTCA:DEQ/OPC/HAZARDOUS TANK/PERMIT

if (publicUser)
{
	var parentId = getParent();
	logDebug("Tank App parent is: " + parentId);
	var siteRecordCapID = getParentByCapId(parentId);
	logDebug("Site parent is: " + siteRecordCapID);

	removeExistingRelations(capId);

	var linkResult = aa.cap.createAppHierarchy(siteRecordCapID, capId);
	if (linkResult.getSuccess())
	{
		logDebug("Successfully linked to Application : " + siteRecordCapID.getCustomID());
	}
	else
	{
		logDebug( "**ERROR: linking to parent application parent cap id (" + siteRecordCapID.getCustomID() + "): " + linkResult.getErrorMessage());
	}

}
function getParentByCapId(itemCap) 
{
	// returns the capId object of the parent.  Assumes only one parent!
	getCapResult = aa.cap.getProjectParents(itemCap,1);
	if (getCapResult.getSuccess())
	{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
		{
			return parentArray[0].getCapID();
		}
		else
		{
			logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
		}
	}
	else
	{ 
		logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
	}
}

function removeExistingRelations(itemCap)
{
	// remove the parents from the caps!
	parentId = getParent();
	if (parentId != null)
	{
		var linkResult = aa.cap.removeAppHierarchy(parentId, itemCap);
		if (linkResult.getSuccess())
		{
			logDebug("Successfully removed from Parent Application : " + parentId.getCustomID());
		}
		else
		{
			logDebug( "**ERROR: removing from parent application parent cap id (" + parentId.getCustomID() + "): " + linkResult.getErrorMessage());
		}
	}
}