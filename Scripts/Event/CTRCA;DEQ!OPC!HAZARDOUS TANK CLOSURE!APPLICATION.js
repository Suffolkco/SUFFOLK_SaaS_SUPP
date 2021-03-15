//CTCA:DEQ/OPC/HAZARDOUS TANK CLOSURE/APPLICATION
var emailParams = aa.util.newHashtable();
var reportFile = null;
var altID = capId.getCustomID();
var conArray = getContactArray();
var conEmail = "";
var emailAddress = "";

var shortNotes = getShortNotes(capId);

//Defaulting "Fee Exempt" to N for citizen access
var feeEx = AInfo["Fee Exempt"];

if (feeEx == null)
{
    editAppSpecific("Fee Exempt", "No");
}
    
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


addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
addParameter(emailParams, "$$shortNotes$$", shortNotes); 
addParameter(emailParams, "$$ALTID$$", altID);
addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());

var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
 capAddresses = s_result.getOutput();
}
if (capAddresses != null)
{
    addParameter(emailParams, "$$address$$", capAddresses[0]);
}

for (con in conArray)
{
    if (!matches(conArray[con].email, null, undefined, ""))
    {
        conEmail += conArray[con].email + "; ";
    }
}
if (conEmail != null)
{
    //sending Notification
    sendNotification("noreplyehims@suffolkcountyny.gov", conEmail, "", "DEQ_OPC_TANK_CLOSURE_APPLICATION_SUBMITTAL", emailParams, null);
}

var lpResult = aa.licenseScript.getLicenseProf(capId);
if (lpResult.getSuccess())
{ 
    var lpArr = lpResult.getOutput();  
} 

if(lpArr != null)
{
    for (var lp in lpArr)
    {
        if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
        {
        emailAddress = lpArr[lp].getEmail();
        sendNotification("noreplyehims@suffolkcountyny.gov", emailAddress, "", "DEQ_OPC_TANK_CLOSURE_APPLICATION_SUBMITTAL", emailParams, null);
        }
    }      
}	