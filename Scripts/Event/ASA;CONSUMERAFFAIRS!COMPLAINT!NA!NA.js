//ASA;CONSUMERAFFAIRS!COMPLAINTS!NA!NA.js

// Send email notification to Complainant 
try{

	if (!publicUser)
	{
		include("CA_SEND_COMPLAINANT_EMAIL");
	}
	
}catch(err){
	logDebug("**WARN: Error in ASA to send Complaintant email -  " + err.message);
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