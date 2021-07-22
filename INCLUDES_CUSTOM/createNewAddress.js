function createNewAddress(address){
	var newAddr1 = address[0];
	var newCity = address[1];
	var newState = address[2];
	var newZip = address[3];
	
	var newAddressModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.AddressModel").getOutput();
	newAddressModel.setCapID(capId);
	newAddressModel.setServiceProviderCode(aa.getServiceProviderCode());
	newAddressModel.setAuditID("ADMIN");
	newAddressModel.setPrimaryFlag("Y"); 

// per customer - add address to BOTH AddressLine1 and StreetName
	newAddressModel.setAddressLine1(newAddr1);
	newAddressModel.setStreetName(newAddr1);
	newAddressModel.setCity(newCity);
	newAddressModel.setState(newState);
	newAddressModel.setZip(newZip);

	aa.address.createAddress(newAddressModel);
	//logDebug("Added record address " + newAddr1 + ", " + newCity + ", " + newState + ", " + newZip + " successfully!");
}