//CA_LIC_RENEW_BLOCK_IF_CONDITION

//If Condition for Child Support Exists, block WorkFlow Step 'Renewal Review' from being marked as 'Complete'



if (wfTask == "Renewal Review" && wfStatus == "Complete")
{
    logDebug ("Where inside the workflow check");
    var condResult = aa.capCondition.getCapConditions(parentCapId);
    var capConds = condResult.getOutput();

    if (capConds.length) 
    {
        logDebug("capConds has length");
        for (cc in capConds) 
        {
            logDebug("Condition name is: " + capConds[cc].getConditionDescription());
            if (capConds[cc].getConditionDescription() == "Child Support" && !capConds[cc].getConditionStatus().contains("Met"))
            {
                logDebug("Child Support Condition is not met");
                var cDesc = capConds[cc].getConditionDescription();
                logDebug("cDesc " + cDesc);
                var cType = capConds[cc].getConditionType();
                logDebug("cType " + cType);

                cancel = true;
                showMessage = true;
                comment("This Renewal cannot be marked as complete until the following Conditions are Met: " + "<br>" + cDesc);
            } 
        }
    }
}