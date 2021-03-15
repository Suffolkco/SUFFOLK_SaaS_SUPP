function createChildTempRecord(cTypeArray) // optional groups to ignore
{
	var childId = null;
	if (arguments.length > 0) 
	{
		groupsIgnoreArray = arguments[1];
	}
	
	var cRecordArray = getChildren(cTypeArray[0] + "/" + cTypeArray[1] + "/" + cTypeArray[2] + "/" + cTypeArray[3],capId);
	if (isEmpty(cRecordArray)){
		try{	
			ctm = aa.proxyInvoker.newInstance("com.accela.aa.aamain.cap.CapTypeModel").getOutput();
			ctm.setGroup(cTypeArray[0]);
			ctm.setType(cTypeArray[1]);
			ctm.setSubType(cTypeArray[2]);
			ctm.setCategory(cTypeArray[3]);
			childId = aa.cap.createSimplePartialRecord(ctm, null, "INCOMPLETE TMP").getOutput();
			aa.cap.createAssociatedFormsHierarchy(capId, childId);
			copyAdditionalInfo(capId, childId);
			copyAddresses(capId, childId);
			copyParcels(capId, childId);
			//copyOwner(capId, childId);
			//copyContactsForAssociatedForms(capId, childId);
            copyLicensedProf(capId, childId);
            //copyAddresses(capId, childId);
           var childCap = aa.cap.getCap(childId).getOutput();
            aa.print("Parent Cap: " + parentCapId);
            if (parentCapId) {
                parentCap =aa.cap.getCap(capId).getOutput();
            }
        if (parentCap) {
                contactList = parentCap.getContactsGroup();
                for (i = 0; i < contactList.size(); i++) {
                    contactList.get(i).getPeople().setContactSeqNumber(null);
                    contactList.get(i).setComponentName(contactList.get(i).getContactType());
                }
                childCap.setContactsGroup(contactList); 
            }
        if (parentCap) {
            childCap.setContactsGroup(contactList);
            }
                        //Copy Applicant
        if (parentCap) {
                        var vApplicantModel = parentCap.getApplicantModel();
                        childCap.setApplicantModel(vApplicantModel);
        }


        
        copyAddress(parentCapId, capId);
        copyParcel(parentCapId, capId);
        copyOwner(parentCapId, capId);	
  
   if (parentCap) {
		aa.env.setValue("CapModel",childCap);
	}



		}
		catch (err) {
			logDebug("createChildTempRecord Error occured: " + err.message);
		}		
	}
	return childId;
}