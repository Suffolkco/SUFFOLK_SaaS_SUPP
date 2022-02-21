//ASA:DEQ/*/*/*/

showDebug = true; 
if(!publicUser)
{
//A comment is added
    var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString(); 
    logDebug("Here's the output for getCap of capId and this shouldn't be null: " + aa.cap.getCap(capId))
    logDebug("Here is the output before getCapType, and this also shouldn't be null: " + aa.cap.getCap(capId).getOutput())
    if(matches(itemCapType, "DEQ/OPC/Global Containment/Application", "DEQ/OPC/Hazardous Tank/Application", "DEQ/OPC/Hazardous Tank Closure/Application", "DEQ/OPC/Swimming Pool/Application", "DEQ/OPC/Swimming Pool/Permit", "DEQ/OPC/Site Assessment/Application",  "DEQ/WR/Backflow/Application", "DEQ/WR/Public Water Complaint/NA","DEQ/WR/Private Well Request/Application",  "DEQ/WWM/STP/Upgrade",  "DEQ/WWM/Commercial/Application", "DEQ/WWM/Residence/Application", "DEQ/WWM/Subdivision/Application", "DEQ/WWM/Subdivision/Application")) 
    {

        var capParcelResult = aa.parcel.getParcelandAttribute(capId,null);
        if (capParcelResult.getSuccess())
            { var Parcels = capParcelResult.getOutput().toArray(); } 
        else	
            { logDebug("**ERROR: getting parcels by cap ID: " + capParcelResult.getErrorMessage()); }

        for (zz in Parcels)
            {
            var ParcelValidatedNumber = Parcels[zz].getParcelNumber();
            logDebug("There is a parcel number, we are checking for SITES now.");
            checkForRelatedSITERecord(ParcelValidatedNumber);
            }
     }
    }


var appName = workDescGet(capId);
//var acaAppName = cap.getSpecialText();
var shortNotes = getShortNotes(capId);

logDebug("This is the value for Short Notes: " + shortNotes);

logDebug("This is the value for work description get function: " + appName);

//logDebug("This is the value for Application Name: " + acaAppName);

if (!publicUser)

    {
        if (shortNotes = null && appName != null)
        {
                updateShortNotes(appName);        
        }
    }
/*
if (publicUser)
{
    if (appName != null)
    {
        updateShortNotes(appName);
    }
}*/


logDebug("This is the value for Application Name: " + appName); 
