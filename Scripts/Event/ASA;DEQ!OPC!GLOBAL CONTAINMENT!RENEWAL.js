//ASA:DEQ/OPC/GLOBAL CONTAINMENT/RENEWAL

logDebug("ASA Start");
var emailParams = aa.util.newHashtable();
var reportParams = aa.util.newHashtable();
var reportFile = new Array();
var conArray = getContactArray(capId);
var conEmail = "";
var fromEmail = "";   
varcapAddresses = null;  
var shortNotes = getShortNotes(capId);
var emailText = "";
var addChild = aa.cap.createRenewalCap(parentCapId, capId, true);

// This is to limit access to ACA
aa.cap.updateAccessByACA(capId, "Y");
if (conArray.length < 1)
{
    copyContacts(parentCapId, capId);
    copyLicenseProfessional(parentCapId, capId);
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


 // Send email to all contacts 
 if (!publicUser)
 {
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

function copyLicenseProfessional(srcCapId, targetCapId)
{
    //1. Get license professionals with source CAPID.
    var capLicenses = getLicenseProfessional(srcCapId);
    if (capLicenses == null || capLicenses.length == 0)
    {
      return;
    }
    //2. Get license professionals with target CAPID.
    var targetLicenses = getLicenseProfessional(targetCapId);
    //3. Check to see which licProf is matched in both source and target.
    for (loopk in capLicenses)
    {
      sourcelicProfModel = capLicenses[loopk];
      //3.1 Set target CAPID to source lic prof.
      sourcelicProfModel.setCapID(targetCapId);
      targetLicProfModel = null;
      //3.2 Check to see if sourceLicProf exist.
      if (targetLicenses != null && targetLicenses.length > 0)
      {
        for (loop2 in targetLicenses)
        {
          if (isMatchLicenseProfessional(sourcelicProfModel, targetLicenses[loop2]))
          {
            targetLicProfModel = targetLicenses[loop2];
            break;
          }
        }
      }
      //3.3 It is a matched licProf model.
      if (targetLicProfModel != null)
      {
        //3.3.1 Copy information from source to target.
        aa.licenseProfessional.copyLicenseProfessionalScriptModel(sourcelicProfModel, targetLicProfModel);
        //3.3.2 Edit licProf with source licProf information. 
        aa.licenseProfessional.editLicensedProfessional(targetLicProfModel);
      }
      //3.4 It is new licProf model.
      else
      {
        //3.4.1 Create new license professional.
        aa.licenseProfessional.createLicensedProfessional(sourcelicProfModel);
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

