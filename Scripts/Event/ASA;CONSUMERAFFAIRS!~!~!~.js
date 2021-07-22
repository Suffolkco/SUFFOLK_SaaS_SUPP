//ASA:CONSUMERAFFAIRS/*/*/*
//ASA;CONSUMERAFFAIRS!~!~!~.js

// copy First Name, Last Name; Business Name; Phone Number from contact type Vendor to Short Notes field
// copy Vendor address to record address

try{
	if (!publicUser){ 
		var contactType = "Vendor";
		var vendorInfo = getVendorInfo(contactType, capId);
		if(vendorInfo == false){
			logDebug("No vendor contact exists on this record");
		}else{
			// copy Vendor address to record address
			var vAddrLine1 = vendorInfo[0];
			var vCity = vendorInfo[1];
			var vState = vendorInfo[2];
			var vZip = vendorInfo[3];
			var vAddress = new Array();
			vAddress.push(vAddrLine1);
			vAddress.push(vCity);
			vAddress.push(vState);
			vAddress.push(vZip);
			createNewAddress(vAddress);
			
			// copy Vendor name, org name & phone to short notes
			var fName = vendorInfo[4];
			var lName = vendorInfo[5];
			var vbusiness = vendorInfo[6];
			var vPhone = vendorInfo[7];
			if(matches(vPhone, null, " ")){
				vPhone = " ";
			}
			var shortNotesString = fName + " " + lName + ", " + vbusiness + ", " + vPhone;
			updateShortNotes(shortNotesString); 
		}
	}
}catch(err){
	logDebug("**WARN: Error in ASA updating short notes and address -  " + err.message);
}

//// functions - to be moved to INCLUDES_CUSTOM sometime later
//
//function getVendorInfo(cType, capId) {
//	var returnArray = new Array();
//	var haveCType = false;
//	
//	var contModel = null; 
//	var consResult = aa.people.getCapContactByCapID(capId);	
//	if (consResult.getSuccess()) {
//		var cons = consResult.getOutput();
//		for (thisCon in cons) {
//			var capContactType = cons[thisCon].getCapContactModel().getPeople().getContactType();
//			if (capContactType == cType) {				
//				var contModel = cons[thisCon].getCapContactModel(); 
//				
//				var firstName = contModel.getFirstName();
//				var lastName = contModel.getLastName();
//				var business = contModel.getBusinessName();
//				var phone = contModel.getPhone1();
//				var addr1 = contModel.getAddressLine1();
//				var city = contModel.getCity();
//				var state = contModel.getState();
//				var zip = contModel.getZip();
//				
//				// build returnArray
//				returnArray.push(addr1);
//				returnArray.push(city);
//				returnArray.push(state);
//				returnArray.push(zip);
//				returnArray.push(firstName);
//				returnArray.push(lastName);
//				returnArray.push(business);
//				returnArray.push(phone);
//				return returnArray;
//				haveCType = true;
//			}
//		}
//	}
//	if (haveCType == false){
//		return false;
//	}
//}
//
//function createNewAddress(address){
//	var newAddr1 = address[0];
//	var newCity = address[1];
//	var newState = address[2];
//	var newZip = address[3];
//	
//	var newAddressModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.AddressModel").getOutput();
//	newAddressModel.setCapID(capId);
//	newAddressModel.setServiceProviderCode(aa.getServiceProviderCode());
//	newAddressModel.setAuditID("ADMIN");
//	newAddressModel.setPrimaryFlag("Y"); 
//
//// per customer - add address to BOTH AddressLine1 and StreetName
//	newAddressModel.setAddressLine1(newAddr1);
//	newAddressModel.setStreetName(newAddr1);
//	newAddressModel.setCity(newCity);
//	newAddressModel.setState(newState);
//	newAddressModel.setZip(newZip);
//
//	aa.address.createAddress(newAddressModel);
//	//logDebug("Added record address " + newAddr1 + ", " + newCity + ", " + newState + ", " + newZip + " successfully!");
//}