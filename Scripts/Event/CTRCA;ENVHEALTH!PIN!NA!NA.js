// CTRCA:ConsumerAffairs/PIN/NA/NA
// CTRCA;CONSUMERAFFAIRS!PIN!NA!NA.js
//
// Custom Fields PIN_REC
// PIN INFORMATION
//    Email Address
// -- list  PIN_REC
// PIN ENTRY
//    License Number
//    PIN #
try {
	// get the public user account
	var getUserResult = aa.publicUser.getPublicUserByPUser(publicUserID);
   	if (getUserResult.getSuccess() && getUserResult.getOutput()) {
       	userModel = getUserResult.getOutput();	
		userSeqNum = userModel.getUserSeqNum();
		refContact = getRefContactForPublicUser(userSeqNum) 
		if (refContact != null) {
			refContactNum = refContact.getContactSeqNumber();
			// ADD CONTACT TO ~THIS~ PIN RECORD
			//addRefContactToRecord(refContactNum, "Project Manager", capId);
			//addRefContactToRecord(refContactNum, "Manager", capId);
			addRefContactToRecord(refContactNum, "Public User", capId);
    		//tmpTable = loadASITable("RECORD MATCH CRITERIA");
    		tmpTable = loadASITable("PIN ENTRY");
   			for (rowIndex in tmpTable) {
				thisRow = tmpTable[rowIndex]; 
				//recNum = thisRow["Record Number"].fieldValue;
				recNum = thisRow["License Number"].fieldValue;
				if (recNum && recNum != "") {
					var capResult = aa.cap.getCapID(recNum);
					if (capResult.getSuccess()) {
						recCapId = capResult.getOutput();
						// add the reference contact to the record with contact type of "Project Manager", for now...type may/will change
						//addRefContactToRecord(refContactNum, "Requestor", recCapId);			 
						//addRefContactToRecord(refContactNum, "Respondent", recCapId);			 
						addRefContactToRecord(refContactNum, "Public User", recCapId);			 
						
						// 		may not need for Meck
						// find the cap contact	
						// capContact = findCapContact("Other", refContactNum, recCapId);
						// edit the contact ASI field
						// editContactASI(capContact, "Other Type", "PIN Record Contact");

						// adding contact to child records - may need for Meck
						/* recAltId = recCapId.getCustomID();
						if (recAltId.indexOf("RTAP") == 0) {	// added RTAP - may need more
							childArr = getChildren("CodeEnforcement/*", recCapId);
							if (childArr && childArr.length > 0) {
								for (cIndex in childArr) {
									thisChildId = childArr[cIndex];
									logDebug("Adding contact to child " + thisChildId.getCustomID());
									addRefContactToRecord(refContactNum, "Project Manager", thisChildId);			
									capContact = findCapContact("Project Manager", refContactNum, thisChildId);
									editContactASI(capContact, "Other Type", "PIN Record Contact");				Probably won't need this contact ASI
								}
							}
						} */ 
					}
				}
			}
		}
	}
    aa.cap.updateAccessByACA(capId,'N');
}
catch (err) {
	aa.print("A JavaScript Error occurred in CTRCA:BUILDING/PIN/NA/NA: " + err.message);
}

// Functions
function findCapContact(cType, refNum) {
	itemCap = capId;
	if (arguments.length > 2)
		itemCap = arguments[2];
 	var capContactResult = aa.people.getCapContactByCapID(itemCap);
    	if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();
       		for (yy in Contacts) {
            		if (cType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType())) {
				if (Contacts[yy].getCapContactModel().getRefContactNumber() == refNum)
					return Contacts[yy];
			}
		}
        }
	return null;
}

function addRefContactToRecord(refNum, cType) {
	itemCap = capId;
	if (arguments.length > 2)
		itemCap = arguments[2];

	var refConResult = aa.people.getPeople(refNum);
	if (refConResult.getSuccess()) {
		var refPeopleModel = refConResult.getOutput();
		if (refPeopleModel != null) {
			pm = refPeopleModel;
			pm.setContactType(cType);
			pm.setFlag("N");
			var result = aa.people.createCapContactWithRefPeopleModel(itemCap, pm);
			if (result.getSuccess()) {
				logDebug("Successfully added the contact");
			}	
			else {
				logDebug("Error creating the applicant " + result.getErrorMessage());
			}
		}
	}
}
function getRefContactForPublicUser(userSeqNum) {
	contractorPeopleBiz = aa.proxyInvoker.newInstance("com.accela.pa.people.ContractorPeopleBusiness").getOutput();
	userList = aa.util.newArrayList();
	userList.add(userSeqNum);
	peopleList = contractorPeopleBiz.getContractorPeopleListByUserSeqNBR(aa.getServiceProviderCode(), userList); 
	if (peopleList != null) {
		peopleArray = peopleList.toArray();
		if (peopleArray.length > 0)
			return peopleArray[0];
	}
	return null;
}

// probably won't need to update/add contact ASI
function editContactASI(cContact, asiName, asiValue) {
	peopleModel = cContact.getPeople();
	peopleTemplate = peopleModel.getTemplate();
	var templateGroups = peopleTemplate.getTemplateForms(); //ArrayList
	var gArray = new Array(); 
	if (!(templateGroups == null || templateGroups.size() == 0)) {
		thisGroup = templateGroups.get(0);
		var subGroups = templateGroups.get(0).getSubgroups();
		for (var subGroupIndex = 0; subGroupIndex < subGroups.size(); subGroupIndex++) {
			var subGroup = subGroups.get(subGroupIndex);
			var fArray = new Array();
			var fields = subGroup.getFields();
			for (var fieldIndex = 0; fieldIndex < fields.size(); fieldIndex++) {
				var field = fields.get(fieldIndex);
				fArray[field.getDisplayFieldName()] = field.getDefaultValue();
				if(field.getDisplayFieldName().toString().toUpperCase()==asiName.toString().toUpperCase()) {
					field.setDefaultValue(asiValue);
					fields.set(fieldIndex, field);  //set the field in the ArrayList of fields
					subGroup.setFields(fields);	
					subGroups.set(subGroupIndex, subGroup);
					thisGroup.setSubgroups(subGroups);
					templateGroups.set(0, thisGroup);
					peopleTemplate.setTemplateForms(templateGroups);
					peopleModel.setTemplate(peopleTemplate);
					cContact.setPeople(peopleModel);
					editResult = aa.people.editCapContact(cContact.getCapContactModel());
					if (editResult.getSuccess()) 
						logDebug("Successfully edited the contact ASI");
				}
			}
		}
	}
}
