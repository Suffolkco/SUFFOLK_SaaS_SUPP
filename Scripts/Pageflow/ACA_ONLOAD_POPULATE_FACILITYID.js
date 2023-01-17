var useAppSpecificGroupName = false;

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var asiGroups = cap.getAppSpecificInfoGroups();
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
	currentUserID = "ADMIN";
}

try {
	var parentCapId;
	// get source renewal record
	var parentCapIdString = getFieldValue("Facility ID", asiGroups);
	if (parentCapIdString) {
		parentCapId = aa.cap.getCapID(parentCapIdString).getOutput();
	}

	if (parentCapId) {
		parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);

		//Copy Address
		copyAddressFromParent4ACA(cap, parentCapId);
		//Copy Parcel
		copyParcelsFromParent4ACA(cap, parentCapId);
		//Copy Parcel
		copyOwnersFromParent4ACA(cap, parentCapId);

		// OMATKARI - Isseue 3021 - Copy Contacts
		//copyContactFromParent4ACA(cap, parentCapId);

		//Copy ASI
		copyAppSpecific4ACA(parentCap);
		
		aa.env.setValue("CapModel", cap);
	}
} catch (e) {
	aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", e.message);
    showMessage = true;
    cancel = true;
}
////////////////////////////////////// Functions below this point ////////////////////////////////////////////////////////////////

// Copy address
function copyAddressFromParent4ACA(currentRecordCapModel, parentCapId) {

	var capAddressResult = aa.address.getAddressWithAttributeByCapId(parentCapId).getOutput();
	if (capAddressResult == null || capAddressResult.length == 0) {
		return;
	}

	var adrr = getPrimaryOrAddressByType(capAddressResult);
	if (adrr != null) {
		currentRecordCapModel.setAddressModel(adrr);
	}
}
function getPrimaryOrAddressByType(addresses) {
	var ourTypeAddress = null;

	for (a in addresses) {
		if (addresses[a].getPrimaryFlag() == "Y") {
			return addresses[a];
		} else if (ourTypeAddress == null) {
			ourTypeAddress = addresses[a];
		}
	} //for

	return ourTypeAddress;
}

// Copy parcels
function copyParcelsFromParent4ACA(currentRecordCapModel, parentCapId) {

	//assume primary parcel is at index=0
	var primaryIndex = 0;

	var capParcelResult = aa.parcel.getParcelandAttribute(parentCapId, null).getOutput();

	if (capParcelResult == null || capParcelResult.size() == 0) {
		return;
	}

	for (var i = 0; i < capParcelResult.size(); i++) {

		if (capParcelResult.get(i).getPrimaryParcelFlag() == "Y") {
			primaryIndex = i;
			break;
		}
	} //for all parcels

	var capParcel = aa.parcel.getCapParcelModel().getOutput();
	capParcel.setParcelModel(capParcelResult.get(primaryIndex));
	currentRecordCapModel.setParcelModel(capParcel);
}


function getFieldValue(fieldName, asiGroups) {
	if (asiGroups == null) {
		return null;
	}

	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (fieldName == field.getCheckboxDesc()) {
					return field.getChecklistComment();
				}
			}
		}
	}
	return null;
}

function copyAppSpecific4ACA(capFrom) { // copy all App Specific info into new Cap
	var t = capFrom.getAppSpecificInfoGroups();
	if (t == null) return;
	var i = t.iterator();

	while (i.hasNext()) {
		var group = i.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();

				if (useAppSpecificGroupName)
					editAppSpecific4ACA(field.getCheckboxType() + "." + field.getCheckboxDesc(), field.getChecklistComment());
				else
					editAppSpecific4ACA(field.getCheckboxDesc(), field.getChecklistComment());
			}
		}
	}
}

function editAppSpecific4ACA(itemName, itemValue) {
	var t = cap.getAppSpecificInfoGroups();
	if (t == null) return;
	var i = t.iterator();

	while (i.hasNext()) {
		var group = i.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." + field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {
					field.setChecklistComment(itemValue);
				}
			}
		}
	}
}

function getAppSpecific(itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
}



function copyContactFromParent4ACA(currentRecordCapModel, parentCapId) {
	contactsGroup = currentRecordCapModel.getContactsGroup();
	if (contactsGroup.size() > 0) {
		return;
	}
	var t = aa.people.getCapContactByCapID(parentCapId);
	if (t.getSuccess()) {
		capPeopleArr = t.getOutput();
		for (cp in capPeopleArr) {
			capPeopleArr[cp].getCapContactModel().setCapID(null);
			contactAddFromUser4ACA(currentRecordCapModel, capPeopleArr[cp].getCapContactModel());
		} //for all contacts from parent
	} //get paretn contacts success
}

function contactAddFromUser4ACA(capModel, contactModel) {
	var theContact = contactModel.getPeople();
	var capContactModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
	capContactModel.setContactType(theContact.getContactType());
	capContactModel.setFirstName(theContact.getFirstName());
	capContactModel.setMiddleName(theContact.getMiddleName());
	capContactModel.setLastName(theContact.getLastName());
	capContactModel.setFullName(theContact.getFullName());
	capContactModel.setEmail(theContact.getEmail());
	capContactModel.setPhone2(theContact.getPhone2());
	capContactModel.setPhone1CountryCode(theContact.getPhone1CountryCode());
	capContactModel.setPhone2CountryCode(theContact.getPhone2CountryCode());
	capContactModel.setPhone3CountryCode(theContact.getPhone3CountryCode());
	capContactModel.setCompactAddress(theContact.getCompactAddress());
	capContactModel.sePreferredChannele(theContact.getPreferredChannel()); // Preferred Channel is used for 'Particiapnt Type' in ePermits. Yes, the function itself is misspelled, just use it like this.
	capContactModel.setPeople(theContact);
	var birthDate = theContact.getBirthDate();
	if (birthDate != null && birthDate != "") {
		capContactModel.setBirthDate(aa.util.parseDate(birthDate));
	}
	var peopleAttributes = aa.people.getPeopleAttributeByPeople(theContact.getContactSeqNumber(), theContact.getContactType()).getOutput();
	if (peopleAttributes) {
		var newPeopleAttributes = aa.util.newArrayList();
		for ( var i in peopleAttributes) {
			newPeopleAttributes.add(peopleAttributes[i].getPeopleAttributeModel())
		}
		capContactModel.getPeople().setAttributes(newPeopleAttributes)
	}
	capModel.getContactsGroup().add(capContactModel);

}
function copyOwnersFromParent4ACA(currentRecordCapModel, parentCapId) {
	var owners = aa.owner.getOwnerByCapId(parentCapId).getOutput();
	if (owners.length > 0) {
		currentRecordCapModel.setOwnerModel(owners[0].getCapOwnerModel());
	}
}
