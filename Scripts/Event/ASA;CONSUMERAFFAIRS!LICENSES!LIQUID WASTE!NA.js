
    // DAP-347: As per Matt request, do not add endorsement fee automatically for LW application.
    /*removeAllFees(capId); //If user updates table after assessment 
    if (typeof (RESTRICTIONS) == "object")
    {
        var rowsToPay = 0;
        logDebug("RESTRICTIONS is an object");
        for (var rows = 0; rows < RESTRICTIONS.length; rows++)
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
        if (rowsToPay -1 > 0)
        {
            addFee("SLS_22", "CA_SALES", "FINAL", rowsToPay -1, "Y"); 
        }
    }*/



