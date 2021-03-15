//CTRCA:DEQ/WWM/COMMERCIAL/RENEWAL

var feeEx = getAppSpecific("Fee Exempt");
if (feeEx == "No" || feeEx == null)
{
    if (feeEx == "No")
    {
        updateFee("COM-UP", "DEQ_OSFR", "FINAL", 1, "Y"); 
    }
}
