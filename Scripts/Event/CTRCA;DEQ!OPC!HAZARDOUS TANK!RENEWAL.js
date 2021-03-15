var feeEx = getAppSpecific("Fee Exempt");
var emailParams = aa.util.newHashtable();
var reportFile = null;
var altID = capId.getCustomID();
var conArray = getContactArray();
var conEmail = "";
var emailAddress = "";
var shortNotes = getShortNotes(capId);

var appName = cap.getSpecialText();

if (feeEx == "No" || feeEx == null)
{
    if (!feeExists("HM-CON-REN"))
    {
        updateFee("HM-CON-REN", "DEQ_HAZCON_REN", "FINAL", 1, "Y");
    }
} 


updateShortNotes(appName);
addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
// Short Note is a project name.
addParameter(emailParams, "$$shortNotes$$", appName); 
addParameter(emailParams, "$$ALTID$$", altID);
addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 

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
    sendNotification("noreplyehims@suffolkcountyny.gov", conEmail, "", "DEQ_OPC_APPLICATION_SUBMITTAL", emailParams, null);
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
        sendNotification("noreplyehims@suffolkcountyny.gov", emailAddress, "", "DEQ_OPC_APPLICATION_SUBMITTAL", emailParams, null);
        }
    }      
}	

function getACARecordURL() {

	itemCap = (arguments.length == 2) ? arguments[1] : capId;		
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
	var acaRecordUrl = "";
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
	// MODIFY THIS It's in PROD!!!
	acaUrl = "https://aca.suffolkcountyny.gov/CitizenAccess/Cap/CapDetail.aspx?"
	var itemCapModel = aa.cap.getCap(capId).getOutput().getCapModel();
	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";   
	acaRecordUrl += "&Module=" + itemCapModel.getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
	if(matches(enableCustomWrapper,"Yes","YES")){
			 acaRecordUrl += "&FromACA=Y";
			logDebug("ACA record Url is:" + acaRecordUrl); 
			return acaRecordUrl;
		}
} 
