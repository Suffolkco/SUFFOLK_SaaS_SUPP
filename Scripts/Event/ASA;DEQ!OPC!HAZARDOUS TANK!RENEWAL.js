//ASA:DEQ/OPC/HAZARDOUS TANK/RENEWAL

var feeEx = getAppSpecific("Fee Exempt");
var conArray = getContactArray(capId);
var emailParams = aa.util.newHashtable();
var reportParams = aa.util.newHashtable();
var reportFile = new Array();	
var conEmail = "";
var fromEmail = "";   
var capAddresses = null;  
var shortNotes = getShortNotes(capId);

    // Send email to all contacts
    if (!publicUser)
    {
    logDebug("ASA: Submit Tank Installation/Registration Renewal");
    var s_result = aa.address.getAddressByCapId(capId);
    if(s_result.getSuccess())
    {
    capAddresses = s_result.getOutput();
    }
    logDebug("Getting emails.");

    if(matches(fromEmail, null, "", undefined))
    {
        fromEmail = "";
    }
    for (con in conArray)
    {
        if (!matches(conArray[con].email, null, undefined, ""))
        {
        logDebug("Contact email: " + conArray[con].email);
        conEmail += conArray[con].email + "; ";
        }
    }
    var lpResult = aa.licenseScript.getLicenseProf(capId);
    if (lpResult.getSuccess())
    { 
        var lpArr = lpResult.getOutput();  
    } 
    else 
    { 
        logDebug("**ERROR: getting lic profs from Cap: " + lpResult.getErrorMessage()); 
    }
    for (var lp in lpArr)
    {
        if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
        {
        logDebug("LP email: " + lpArr[lp].email);
        conEmail += lpArr[lp].getEmail() + "; ";
        }
    }
        getRecordParams4Notification(emailParams);
            
        addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
        addParameter(emailParams, "$$shortNotes$$", shortNotes); 
        //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
        addParameter(emailParams, "$$altID$$", capId.getCustomID());
        addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 

        if (capAddresses != null)
        {
        logDebug("Record address:" +capAddresses[0]);
            addParameter(emailParams, "$$address$$", capAddresses[0]);
        }

    if (conEmail != null)
    {
            logDebug ("test");
            logDebug("Email addresses: " + conEmail);
            sendNotification("", conEmail, "", "DEQ_OPC_APPLICATION_SUBMITTAL", emailParams, reportFile);
    }
} 

//Without this check in place, ASA is running twice.  Once when the renewal is first generated and again when the application has been submitted
if (conArray.length < 1)
{
    var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);
    aa.cap.updateAccessByACA(capId, "Y");
    copyContacts(parentCapId, capId);
    copyASIFields(parentCapId, capId);
    // clear the signature
    editAppSpecific("Attestation", "UNCHECKED", capId);
    editAppSpecific("Signature", " ", capId);
    copyASITables(parentCapId, capId);
    copyAddresses(parentCapId, capId);
    copyOwner(parentCapId, capId);
    copyParcels(parentCapId, capId);
    copyParcelGisObjects();
}

if (feeEx == "No" || feeEx == null)
{
    if (!feeExists("HM-CON-REN"))
    {
        updateFee("HM-CON-REN", "DEQ_HAZCON_REN", "FINAL", 1, "Y");
    }
}


//var appName = workDescGet(capId);
var shortNotes = getShortNotes(capId);
logDebug("This is the value for Short Notes: " + shortNotes);
logDebug("This is the value for Application Name: " + appName);
var appName = cap.getSpecialText();

if (publicUser)
{
    updateShortNotes(appName);
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

