//ASA:DEQ/OPC/SITE ASSESSMENT/APPLICATION
 
var showDebug = false;
var subType = AInfo["Submittal Type"];
var feeEx = AInfo["Fee Exempt"];
var emailParams = aa.util.newHashtable();
var reportParams = aa.util.newHashtable();
var reportFile = new Array();
var conArray = getContactArray();
var conEmail = "";
var fromEmail = "";   
var capAddresses = null;  
var shortNotes = getShortNotes(capId);

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

if (feeEx == "No" || feeEx == null)
{
    if (subType.equals("ESA/Remediation Oversight Closure"))
    {
        updateFee("BEIR-ESA-REV", "DEQ_ESACAPP", "FINAL", 1, "Y");
        updateFee("BEIR-RO", "DEQ_ESACAPP", "FINAL", 1, "Y");
        updateFee("BEIR-CR", "DEQ_ESACAPP", "FINAL", 1, "Y");
        
            if (feeExists("BEIR-CLOSURE"))
			{
                updateFee("BEIR-CLOSURE", "DEQ_SFR", "FINAL", 0, "Y");
            }
    }
    if (subType.equals("BEIR/Remediation Oversight Closure"))
    {
        updateFee("BEIR-RO", "DEQ_ESACAPP", "FINAL", 1, "Y");
        updateFee("BEIR-CR", "DEQ_ESACAPP", "FINAL", 1, "Y");

        if (feeExists("BEIR-ESA-REV"))
        {
            updateFee("BEIR-ESA-REV", "DEQ_SFR", "FINAL", 0, "Y");
        }
        if (feeExists("BEIR-CLOSURE"))
        {
            updateFee("BEIR-CLOSURE", "DEQ_SFR", "FINAL", 0, "Y");
        }
    }
    if (subType.equals("ESA/UIC Evaluation"))
    {
        updateFee("BEIR-ESA-REV", "DEQ_ESACAPP", "FINAL", 1, "Y");

        if (feeExists("BEIR-RO"))
        {
            updateFee("BEIR-RO", "DEQ_SFR", "FINAL", 0, "Y");
        }
        if (feeExists("BEIR-CR"))
        {
            updateFee("BEIR-CR", "DEQ_SFR", "FINAL", 0, "Y");
        }
        if (feeExists("BEIR-CLOSURE"))
        {
            updateFee("BEIR-CLOSURE", "DEQ_SFR", "FINAL", 0, "Y");
        }
    }
    if (subType.equals("Wastewater Management"))
    {
        updateFee("BEIR-CLOSURE", "DEQ_ESACAPP", "FINAL", 1, "Y");

        if (feeExists("BEIR-ESA-REV"))
        {
            updateFee("BEIR-ESA-REV", "DEQ_SFR", "FINAL", 0, "Y");
        }
        if (feeExists("BEIR-RO"))
        {
            updateFee("BEIR-RO", "DEQ_SFR", "FINAL", 0, "Y");
        }
        if (feeExists("BEIR-CR"))
        {
            updateFee("BEIR-CR", "DEQ_SFR", "FINAL", 0, "Y");
        }
    }
}
