
    removeAllFees(capId); //If user updates table after assessment 
    if (typeof (RESTRICTIONS) == "object")
    {
        var rowsToPay = 0;
        logDebug("RESTRICTIONS is an object");
        for (var rows = 1; rows < RESTRICTIONS.length; rows++)
        {
            var thisRow = RESTRICTIONS[rows];
            var categoryNeeded = thisRow["Category"];
            logDebug("Category found is: " + categoryNeeded);
            if (!matches(categoryNeeded, "LW - Wastewater Demo Project", "LW12 - All Endorsements"))
            {
                rowsToPay++;
                logDebug("Found a row that is: " + categoryNeeded + ". We will bill for this row.")
            }
            else
            {
                logDebug("Found a row that is: " + categoryNeeded + ". Will not bill for this row.")
            }
        }
        logDebug("Number of Billable Rows in Table is: " + rowsToPay);
        if (rowsToPay)
        {
            addFee("SLS_22", "CA_SALES", "FINAL", rowsToPay, "Y");
        }
    }



