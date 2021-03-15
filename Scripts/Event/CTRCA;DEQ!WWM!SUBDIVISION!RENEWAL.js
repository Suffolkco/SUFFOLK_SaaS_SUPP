var showDebug = false;

var propLots = AInfo["Total Number of Lots Proposed"];
var feeEx = AInfo["Fee Exempt"];
 
if (feeEx == "No" || feeEx == null)
{
     if (propLots != null)
    {
        addFee("SUB-UP", "DEQ_SUB", "FINAL", parseInt(propLots), "Y");
    }
}
