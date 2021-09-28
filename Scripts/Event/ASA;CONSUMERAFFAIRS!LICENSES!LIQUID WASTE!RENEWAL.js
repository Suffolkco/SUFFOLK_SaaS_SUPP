// ASA;CONSUMERAFFAIRS!LICENSES!HOME IMPROVEMENT!RENEWAL

//showDebug = 1;
//logDebug("Entering Renew ASA");

var rowsToPay = 0;
if (typeof (RESTRICTIONS) == "object")
{
    logDebug("RESTRICTIONS is an object")
    for (var rows = 0; rows < RESTRICTIONS.length; rows++)
    {
        var thisRow = RESTRICTIONS[rows];
        var categoryNeeded = thisRow["Category"];
        logDebug("Category found is: " + categoryNeeded);
        if (!matches(categoryNeeded, "LW - Wastewater Demo Project", "LW12 - All Endorsements"))
        {
            rowsToPay = rowsToPay + 1;
            logDebug("Found a row that is: " + categoryNeeded + ". We will bill for this row.")
        }
        else
        {
            logDebug("Found a row that is: " + categoryNeeded + ". Will not bill for this row.")
        }
    }
    logDebug("Number of Billable Rows in Table is: " + rowsToPay);
    var feesToAssess = rowsToPay - 1;
    if (feesToAssess != 0 && publicUser)
    {
        updateFee("SLS_22", "CA_SALES", "FINAL", feesToAssess, "Y");
    }
}