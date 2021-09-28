// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

var rowsInTable = 0;
if (typeof (RESTRICTIONS) == "object")
{
    logDebug("RESTRICTIONS is an object")
    for (var rows = 0; rows < RESTRICTIONS.length; rows++)
    {
        rowsInTable += 1;
        var thisRow = RESTRICTIONS[rows];
        var categoryNeeded = thisRow["Category"];
        logDebug("category needed is: " + categoryNeeded);
    }

    logDebug("Number of Rows in Table is: " + rowsInTable);
    var feesToAssess = rowsInTable - 1;
    if (feesToAssess != 0 && publicUser)
    {
        if (matches(categoryNeeded, "LW - Wastewater Demo Project", "LW12 - All Endorsements"))
        {
            logDebug("we have a match for one row");
            updateFee("SLS_22", "CA_SALES", "FINAL", feesToAssess, "Y");
        }
    }
}