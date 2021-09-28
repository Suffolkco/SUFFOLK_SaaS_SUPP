//CTRCA


var rowsInTable = 0;
if (typeof (RESTRICTIONS) == "object")
{
    logDebug("RESTRICTIONS is an object")
    for (var rows = 0; rows < RESTRICTIONS.length; rows++)
    {
        rowsInTable += 1;
    }
}
logDebug("Number of Rows in Table is: " + rowsInTable);
var feesToAssess = rowsInTable - 1;
if (feesToAssess != 0 && !publicUser)
{
    updateFee("CA_SALES", "SLS_22", "FINAL", feesToAssess, "Y");
}