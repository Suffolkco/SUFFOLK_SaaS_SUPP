function sendEmailsOnSIPRecordOnlyContacts(templateName)
{

		var sipPO = loadASITable("DEQ_SIP_PROPERTY_OWNER");
		var emailParams = aa.util.newHashtable();
			var reportParams = aa.util.newHashtable();
			var reportFile = new Array();
			var conArray = getContactArray(capId);
			 var dubCheckemails = "";
			var conEmail = "";
			var lpEmail= "";
			var fromEmail = "noreplyehims@suffolkcountyny.gov";   
			varcapAddresses = null;  
			
			var emailAddressArray = new Array();  
  

			if(matches(fromEmail, null, "", undefined))
			{
			  fromEmail = "";
			}
			
			//Contact Emails
			for (con in conArray)
			{
			  if (!matches(conArray[con].email, null, undefined, ""))
			  {
				logDebug("Contact email: " + conArray[con].email);
				conEmail = conArray[con].email;
				 if (conEmail && dubCheckemails.indexOf(conEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + ";" + conEmail;
					 else
						dubCheckemails = "" + conEmail;
				}
			  }
			}
		
		
				  //getRecordParams4Notification(emailParams);
//getWorkflowParams4Notification(emailParams);
 var comments = "";
    if (controlString == "WorkflowTaskUpdateAfter") {
 
	addParameter(emailParams, "$$wfComments$$", wfComment);
comments = wfComment;
addParameter(emailParams, "$$WFstatusdate$$", wfDate);
}
			var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
		  acaSite = acaSite.substr(0, acaSite.toUpperCase().indexOf("/ADMIN"));
			 addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
			  //addParameter(emailParams, "$$shortNotes$$", shortNotes); 
			  //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
			  addParameter(emailParams, "$$altID$$", capId.getCustomID());
			  addParameter(emailParams, "$$ACAURL$$", acaSite); 

 var capAddresses = getAddress(capId);
			  if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }

var parcelArray = getParcel(capId);


    var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
    if (capParcelResult.getSuccess())
    {
        var Parcels = capParcelResult.getOutput().toArray();
        for (zz in Parcels)
        {
            var parcelNumber = Parcels[zz].getParcelNumber();
            logDebug("parcelNumber = " + parcelNumber);
				  addParameter(emailParams, "$$parcelNBR$$", parcelNumber);

        }
    }


                var openDate = aa.cap.getCap(capId).getOutput().getFileDate();

                if (openDate != null)
                {
                    var openDateFormatted = openDate.getMonth() + "/" + openDate.getDayOfMonth() + "/" + openDate.getYear();
                    logDebug("openDateFormatted : " + openDateFormatted);
	  addParameter(emailParams, "$$opendate$$", openDateFormatted);

}
	
			if(comments != null && comments != "")
var containsNoemail = comments.contains("NOEMAIL");

			if (dubCheckemails != null && !(containsNoemail))
			{
				 
				  sendNotification("", dubCheckemails, "", templateName, emailParams, reportFile);
			}
		 

}