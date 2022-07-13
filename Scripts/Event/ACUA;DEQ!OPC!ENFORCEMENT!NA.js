//
//ostatus is original status
//pstatus is status to set
if (currentUserID == "RLITTLEFIELD")
{
    showDebug = true;
}

if (conditionComment == "Notice of Hearing" && conditionStatus == "Met")
{
    editCapConditionWithStatus("DEQ", "Notice of Hearing", "Applied", "Met", parentCapId);
    var childRecords = getChildren("DEQ/OPC/*/*", parentCapId);

    for (child in childRecords)
    {
        if (childRecords[child].getCustomID() != capId.getCustomID())
        {
            logDebug("inside my array and child cap id is: " + childRecords[child].getCustomID());
            editCapConditionWithStatus("DEQ", "Notice of Hearing", "Applied", "Met", childRecords[child]);
        }
    }
}

function editCapConditionWithStatus(pType, pDesc, oStatus, pStatus, capIdToUse) {
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