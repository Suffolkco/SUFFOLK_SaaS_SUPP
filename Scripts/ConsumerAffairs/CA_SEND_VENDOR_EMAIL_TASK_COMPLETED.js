// Send email notification to Vendor task has been completed
try{
showDebug = true;
var emailText = ""
	var emailParams = aa.util.newHashtable();
	var reportFile = new Array();
		
	var contactType = "Vendor";
	var contactInfo = getContactInfo(contactType, capId);
	if(contactInfo == false){
		logDebug("No vendor contact exists on this record");
	}else{
		
		var vAddrLine1 = contactInfo[0];
		var vCity = contactInfo[1];
		var vState = contactInfo[2];
		var vZip = contactInfo[3];
		var vAddress = new Array();
		vAddress.push(vAddrLine1);
		vAddress.push(vCity);
		vAddress.push(vState);
		vAddress.push(vZip);
		logDebug("Address: " + vAddrLine1 + ", City: " +  vCity + ", State: " +  vState + ", Zip: " +  vZip);
		// copy Vendor name, org name & phone to short notes
		var fName = contactInfo[4];
		var lName = contactInfo[5];					
		var email = contactInfo[8];	

		var startDate = new Date();
		var startTime = startDate.getTime(); // Start timer
		var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();

		getRecordParams4Notification(emailParams);
		addParameter(emailParams, "$$altID$$", capId.getCustomID());
		addParameter(emailParams, "$$name$$", fName + " " + lName);
		addParameter(emailParams, "$$address", vAddrLine1);
		addParameter(emailParams, "$$city$$", vCity);
		addParameter(emailParams, "$$state$$", vState);
		addParameter(emailParams, "$$zip$$", vZip);
		addParameter(emailParams, "$$date$$", todayDate);

		var success = sendNotification("", email, "", "DCA_DOCKET_VENDOR_TASK_COMPLETE_NOTIFICATION", emailParams, reportFile);	
		logDebug("success:" + success + ", to: " + email);		
    }
	
}catch(err){
	logDebug("**WARN: Error in ASA updating short notes and address -  " + err.message);
}

function logDebug(dstr)
{
	//if (showDebug.substring(0,1).toUpperCase().equals("Y"))
	if(showDebug)
	{
		aa.print(dstr)
		emailText+= dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}


function getContactInfo(cType, capId) {
	var returnArray = new Array();
	var haveCType = false;
	
	var contModel = null; 
	var consResult = aa.people.getCapContactByCapID(capId);	
	if (consResult.getSuccess()) {
		var cons = consResult.getOutput();
		for (thisCon in cons) {
			var capContactType = cons[thisCon].getCapContactModel().getPeople().getContactType();
			if (capContactType == cType) {				
				var contModel = cons[thisCon].getCapContactModel(); 
				
				var firstName = contModel.getFirstName();
				var lastName = contModel.getLastName();
				var business = contModel.getBusinessName();
				var phone = contModel.getPhone1();
				var addr1 = contModel.getAddressLine1();
				var city = contModel.getCity();
				var state = contModel.getState();
				var zip = contModel.getZip();
				var email = contModel.getPeople().getEmail();

			
				// build returnArray
				returnArray.push(addr1);
				returnArray.push(city);
				returnArray.push(state);
				returnArray.push(zip);
				returnArray.push(firstName);
				returnArray.push(lastName);
				returnArray.push(business);
				returnArray.push(phone);
				returnArray.push(email);
				return returnArray;
				haveCType = true;
			}
		}
	}
	if (haveCType == false){
		return false;
	}
}
