function sendEmailsOnSIPRecord(templateName)
{

		var sipPO = loadASITable("DEQ_SIP_PROPERTY_OWNER");
		var emailParams = aa.util.newHashtable();
			var reportParams = aa.util.newHashtable();
			var reportFile = new Array();
			var conArray = getContactArray(capId);
			 var dubCheckemails = "";
			var conEmail = "";
			var lpEmail= "";
			var fromEmail = "autosend@suffolkcountyny.gov";   
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
						dubCheckemails = dubCheckemails + "||" + conEmail;
					 else
						dubCheckemails = "" + conEmail;
				}
			  }
			}
			//Lp emails
			
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
				lpEmail = lpArr[lp].getEmail();
				 if (lpEmail && dubCheckemails.indexOf(lpEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + ";" + lpEmail;
					 else
						dubCheckemails = "" + lpEmail;
				}
			  }
			}
			
			//Email from ASIT table
			
						for (var k = 0; k < sipPO.length; k++)
			{
					  var poEmail = sipPO[k]["Email Address"];
					  if (!matches(poEmail, null, undefined, ""))
					 {
						  if (poEmail && dubCheckemails.indexOf(poEmail) == -1) {
					if(dubCheckemails)
						dubCheckemails = dubCheckemails + ";" + poEmail;
					 else
						dubCheckemails = "" + poEmail;
				}
					 }
		   }
			  //getRecordParams4Notification(emailParams);
				  
			 //addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
			  //addParameter(emailParams, "$$shortNotes$$", shortNotes); 
			  //addParameter(emailParams, "$$applicationName$$", capId.getCapModel().getAppTypeAlias());
			  //addParameter(emailParams, "$$altID$$", capId.getCustomID());
			  //addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 
			  /*if (capAddresses != null)
			  {
				logDebug("Record address:" +capAddresses[0]);
				  addParameter(emailParams, "$$address$$", capAddresses[0]);
			  }*/

			if (dubCheckemails != null)
			{
				 
				  sendNotification("", dubCheckemails, "", templateName, emailParams, reportFile);
			}
		 

}