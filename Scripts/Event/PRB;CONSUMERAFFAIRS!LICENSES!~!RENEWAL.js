var rowsInTable = 0;
if (typeof (Restrictions) == "object")
{
    for (var rows = 0; rows < Restrictions.length; rows++)
    {
        rowsInTable += 1;
    }
}
logDebug("Number of Rows in Table is: " + rowsInTable);
updateFee("CA_SALES", "SLS_22", "FINAL", rowsInTable - 1, "Y");