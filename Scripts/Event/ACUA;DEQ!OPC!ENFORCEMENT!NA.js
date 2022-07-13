//
//ostatus is original status
//pstatus is status to set
if (currentUserID == "RLITTLEFIELD")
{
    showDebug = true;
}

editCapConditionWithStatus("DEQ", "Notice of Hearing", "Applied", "Met", parentCapId);
var childRecords = getChildren("DEQ/OPC/*/*", parentCapId);

var unmetCondsArray = [];
for (child in childRecords)
{
    unmetCondsArray.push(getUnmetConditions(childRecords[child]));
}

for (unmetCond in unmetCondsArray)
{
    logDebug("unmetconds is: " + unmetCondsArray[unmetCond]);
}

function editCapConditionWithStatus(pType, pDesc, oStatus, pStatus, capIdToUse)
{
    if (pType == null)
    {
        var condResult = aa.capCondition.getCapConditions(capIdToUse);
    }
    else
    {
        var condResult = aa.capCondition.getCapConditions(capIdToUse, pType);
    }

    if (!condResult.getSuccess()) 
    {
        logMessage("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
        logDebug("**ERROR: getting cap conditions: " + condResult.getErrorMessage());
        return false;
    }

    var capConds = condResult.getOutput();
    for (cc in capConds)
    {
        var thisCond = capConds[cc];
        var cStatus = thisCond.getConditionStatus();
        aa.print("status" + cStatus);
        //var cStatusType = thisCond.getConditionStatusType();
        var cDesc = thisCond.getConditionDescription();

        if (cDesc.toUpperCase() == pDesc.toUpperCase())
        {
            if (oStatus.toUpperCase().equals(cStatus.toUpperCase()))
            {
                aa.print("into update");
                thisCond.setConditionStatus(pStatus);
                //thisCond.setConditionStatusType(pStatusType);
                thisCond.setImpactCode("");
                aa.capCondition.editCapCondition(thisCond);
                return true;
            }

        }
    }

    logDebug("ERROR: no matching condition found");
    return false;
}

function getUnmetConditions()
{
    var itemCap = capId;
    if (arguments.length > 0)
        itemCap = arguments[0];
    var condResult = aa.capCondition.getCapConditions(itemCap);
    var condArray = new Array();
    if (condResult.getSuccess())
    {
        var capConds = condResult.getOutput();
        for (cc in capConds)
        {
            if (capConds[cc].getConditionStatus() != "Met") //"Y".equals(capConds[cc].getConditionOfApproval())
                condArray.push(capConds[cc]);
        }
    }
    return condArray;
}