//CTRCA:DEQ/*/*/*

//Defaulting "Fee Exempt" to N for citizen access
var feeEx = AInfo["Fee Exempt"];

if (feeEx == null)
{
    editAppSpecific("Fee Exempt", "No");
}

var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
if(matches(itemCapType, "DEQ/OPC/Global Containment/Application", "DEQ/OPC/Hazardous Tank/Application", "DEQ/OPC/Hazardous Tank Closure/Application", "DEQ/OPC/Swimming Pool/Application", "DEQ/OPC/Site Assessment/Application",  "DEQ/WR/Backflow/Application", "DEQ/WR/Private Well Request/Application", "DEQ/WR/Public Water Complaint/NA","DEQ/WR/Water Modification/Application",  "DEQ/WWM/STP/Upgrade",  "DEQ/WWM/Commercial/Application", "DEQ/WWM/Residence/Application", "DEQ/WWM/Subdivision/Application", "DEQ/WWM/Subdivision/Application")) 
{

    var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
	if (capParcelResult.getSuccess())
		{ var Parcels = capParcelResult.getOutput().toArray(); }
	else	
		{ logDebug("**ERROR: getting parcels by cap ID: " + capParcelResult.getErrorMessage());  }

	for (zz in Parcels)
		{
        var ParcelValidatedNumber = Parcels[zz].getParcelNumber();
        logDebug("There is a parcel number, we are checking for SITES now.");
        checkForRelatedSITERecord(ParcelValidatedNumber);
        }
 //push.   
}

    applicationSubmittedDEQ(); 
