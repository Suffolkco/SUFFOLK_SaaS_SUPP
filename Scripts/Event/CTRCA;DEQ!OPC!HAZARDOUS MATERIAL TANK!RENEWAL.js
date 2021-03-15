//CTRCA:DEQ/OPC/HAZARDOUS MATERIAL TANK/RENEWAL

var siteFeeEx = false;
var parentID = getParentCapID4Renewal();
var ownTypeCod = getAppSpecific("Owner Type Code", parentID); 
var petCode = getAppSpecific("Type of Petroleum Facility Code", parentID);

if (!publicUser)
{
    if (ownTypeCod == null || ownTypeCod == "2" || ownTypeCod == "4" || (ownTypeCod == "3" && petCode != "8"))
	{
		logDebug("This permit is fee exempt");
		editAppSpecific("Fee Exempt", "Yes", capId);
		siteFeeEx = true;
	}
	else
	{
		var ownTypeLab = getAppSpecific("Owner Type Label", parentID);
		logDebug("Owner type is Label is: " + ownTypeLab);
		var epaReg = getAppSpecific("EPA", parentID);
		logDebug("EPA is: " + epaReg);
		var pbsReg = getAppSpecific("PBS", parentID);
		logDebug("PBS is: " + pbsReg);
		var permYears = 0;
		var totalCap = 0;

		if ((epaReg != null && epaReg == "Yes") || (pbsReg != null && pbsReg == "Yes"))
		{
			permYears = 3;
		}
		if ((epaReg == "No" || epaReg == null) && (pbsReg == "No" || pbsReg == null))
		{
			permYears = 5;
		}

		var tankArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", parentID);
		logDebug("My tank array is: " + tankArray);

		for (t in tankArray)
		{
			var tankCapacity = parseInt(getAppSpecific("Capacity", tankArray[t]));
			var feeEx = getAppSpecific("Fee Exempt", tankArray[t]);
			var offUse = getAppSpecific("Official Use Code", tankArray[t]);
			var tankStat = getTankAppStatus(tankArray[t]);
			logDebug("Capacity for " + tankArray[t] + " is " + tankCapacity + " and the app status is: " + tankStat);
			if ((feeEx == null || feeEx == "No") && tankStat == "Active" && !matches(offUse, "UR", "UA", "81", "82", "85", null) && !offUse.contains("EX"))
			{
				totalCap += tankCapacity;
			}
		}
		logDebug("total capacity is: " + totalCap);

		if (totalCap > 0 && !siteFeeEx)
		{
			if (totalCap <= 1000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (39.82 * permYears), "Y");
			}
			else if (totalCap > 1000 && totalCap <= 10000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (36.30 + (0.00352 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 10000 && totalCap <= 100000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (45.10 + (0.00264 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 100000 && totalCap <= 1000000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (133.10 + (0.00176 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 1000000 && totalCap <= 10000000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (1717.10 + (0.000176 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 10000000 && totalCap <= 100000000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (3301.10 + (0.0000176 * parseInt(totalCap))) * permYears, "Y");
			}
			else if (totalCap > 100000000)
			{
				updateFee("PERMOP-001", "DEQ_OPCSITE", "FINAL", (4885.10 + (0.00000176 * parseInt(totalCap))) * permYears, "Y");
			}
		}
    }
}


function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 