//ASA:DEQ/OPC/SWIMMING POOL/RENEWAL
var showDebug = false;
var emailText = "";
var conArray = getContactArray(capId);
var feeCount = 0;
var methArray = [];
 
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
  logDebug("ASA: Swimming Pool Renewal");
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

    parentShortNotes = getShortNotes(parentCapId);
    updateShortNotes(parentShortNotes);   
    editAppName(parentShortNotes)   
    
    //var parArray = getContactArray(parentCapId);
 //copyContacts(parentCapId, capId);     
        // We only want to copy contacts if it has an ACTIVE status
        // That's why we can't just blindly Copy All Contacts
    var capContactResult = aa.people.getCapContactByCapID(parentCapId);
    if (capContactResult.getSuccess())
    {
        var contacts = capContactResult.getOutput();
        logDebug(contacts.length);
          // Parent contacts
          for (yy in contacts)
          {
              var newContact = contacts[yy].getCapContactModel();                       
              var contactType = newContact.getPeople().getContactType();
              logDebug("Contact type is: " +  contactType);
              logDebug("Audit status is: " +  newContact.getPeople().getAuditStatus());
  
              if (newContact.getPeople().getAuditStatus() != "I")         
              {
                  logDebug("In the active loop" +  contactType);
                  // Add here, only if it's these contact types, we copy
                  //Copy only PropertyOwner, Pool Owner and operator to the renewal
                  if (matches(contactType, "Property Owner", "Pool Owner", "Operator", "Pool Management Company", "Pool Service Company"))
                  {
                      logDebug("Contact type matched: " +  contactType);
                      logDebug ("First name: " + newContact.getPeople().getFirstName());
                      copyActiveContactsByType(parentCapId, capId, contactType);   
                      logDebug("Copy contact type of " +  contactType + " from " + parentCapId + " to " + capId);                             
                  }
  
                  renewalCapContactResult = aa.people.getCapContactByCapID(capId);
                  if (renewalCapContactResult.getSuccess()) 
                  {
                      var childContacts = renewalCapContactResult.getOutput();
                      logDebug("Child Contact Count: " + childContacts.length);
                  }
            }
        }
    }	
     
    copyASIFields(parentCapId, capId);
    // clear the signature
    editAppSpecific("Attestation", "UNCHECKED", capId);
    editAppSpecific("Signature", " ", capId);
    copyASITables(parentCapId, capId);
    if (!publicUser)
    {
        var nysFacilityId = getAppSpecific("NYS Facility ID", parentCapId);
        var jobNumber = getAppSpecific("Job Number", parentCapId);
        var fileRefNo = getAppSpecific("File Reference Number", parentCapId);
        editAppSpecific("NYS Facility ID", nysFacilityId, capId);
        editAppSpecific("Job Number", jobNumber, capId);
        editAppSpecific("File Reference Number", fileRefNo, capId);
    }
    copyAddresses(parentCapId, capId);
    //copyOwnerSpr(parentCapId, capId);
    copyParcels(parentCapId, capId);
    copyParcelGisObjects();
    logDebug("parentCapId = " +  parentCapId);     
    logDebug("CapId = " +  capId); 
}
else
{
    var swimPools = loadASITable("SWIMMING POOL INFORMATION", capId);
    var changeUse = getAppSpecific("Change in Use", capId);

    var feeEx = AInfo["Fee Exempt"];

    if (feeEx == "No" || feeEx == null)
    {
        //var swimPools = loadASITable("SWIMMING POOL INFORMATION");
        logDebug("swimPools.length= " +  swimPools.length);         
        if (swimPools.length >= 1)
        {
            var outSpaWade = 0;
            var outOther = 0;
            var indSpaWade = 0;
            var indOther = 0;
        
            //logDebug("Amount of swimming pools on this record are: " + swimPools.length);
            for (p in swimPools)
            {
                var loc = swimPools[p]["Location"];
                var type = swimPools[p]["Type of Pool"];
                var status = swimPools[p]["Status"];
                
                // Only if the swimming pool has an active status, we add fees                    
                if (status == "Active")
                {
                    if (loc == "Outdoor")
                    {        
                        logDebug("Outdoor Pool Type is : " +  type);          
                        if (matches(type, "Spa", "Wading Pool"))
                        {
            
                            outSpaWade++
                        }
                        else
                        {
                            outOther++
                        }
                    }
                    else if (loc == "Indoor")
                    {
                        logDebug("Indoor Pool Type is : " +  type);        
                        if (matches(type, "Spa", "Wading Pool"))
                        {
                            indSpaWade++
                        }
                        else
                        {
                            indOther++
                        }
                    }
                    else
                    {
                        logDebug("the loc is : " +  loc);     
                        //logDebug("This shoud not happen");
                    }
                }
            }

            if (indSpaWade > 0 || indOther > 0)
            {
                if (indSpaWade > 0)	
                {
                    logDebug("There are " + parseInt(indSpaWade) + " Indoor Spa or Wading Pools");           
                    updateFee("SP-BI-01", "DEQ_POOLAPP", "FINAL", parseInt(indSpaWade), "Y");
                }
                
                if (indOther > 0)
                {
                    logDebug("There are " + parseInt(indOther) + " Indoor Other than Spa or Wading Pools");
                    updateFee("SP-BI-02","DEQ_POOLAPP","FINAL",parseInt(indOther), "Y");
                }
            }
            if (outSpaWade > 0 || outOther > 0)
            {
                if (outSpaWade > 0)	
                {
                    logDebug("There are " + parseInt(outSpaWade) + " Outdoor Spa or Wading Pools");
                    updateFee("SP-BI-03","DEQ_POOLAPP","FINAL",parseInt(outSpaWade), "Y");
                }
                if (outOther > 0)
                {
                    logDebug("There are " + parseInt(outOther) + " Outdoor Other than Spa or Wading Pools");
                    updateFee("SP-BI-04","DEQ_POOLAPP","FINAL",parseInt(outOther), "Y");
                }        
            }
        }         
    }
}

function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}
function copyOwnerSpr(sCapID, tCapID)
{
	var ownrReq = aa.owner.getOwnerByCapId(sCapID);
	if(ownrReq.getSuccess())
	{
		var ownrObj = ownrReq.getOutput();
		for (xx in ownrObj)
		{
			ownrObj[xx].setCapID(tCapID);
			aa.owner.createCapOwnerWithAPOAttribute(ownrObj[xx]);
            logDebug("Copied Owner: " + ownrObj[xx].getOwnerFullName());
            break; //Only copy first owner
		}
	}
	else
		logDebug("Error Copying Owner : " + ownrObj.getErrorType() + " : " + ownrObj.getErrorMessage());
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

function copyActiveContactsByType(pFromCapId, pToCapId, pContactType)
	{
	//Copies all contacts from pFromCapId to pToCapId
	//where type == pContactType
	if (pToCapId==null)
		var vToCapId = capId;
	else
		var vToCapId = pToCapId;
	
	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess())
    {
        var Contacts = capContactResult.getOutput();
         
		for (yy in Contacts)
        {            
            if(Contacts[yy].getCapContactModel().getContactType() == pContactType) 
            {
                var newContact = Contacts[yy].getCapContactModel();
                if (newContact.getPeople().getAuditStatus() != "I")
                {
                    newContact.setCapID(vToCapId);
                    aa.people.createCapContact(newContact);
                    copied++;
                    logDebug("Copied contact from "+pFromCapId.getCustomID()+" to "+vToCapId.getCustomID());
                }
            }
    
        }
    }
	else
		{
		logMessage("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage()); 
		return false; 
		}
	return copied;
    } 