//CREATE_AND_COPY_TO_NEW_PARENT

logDebug('Executing CREATE_AND_COPY_TO_NEW_PARENT');
//2a - Create new parent and copy from amendment.
var pCapId = createParent('EnvHealth','Facility','NA','NA','');
logDebug('New parent capId: ' + pCapId.getCustomID());
copySpecialText(capId, pCapId);
//copyDetails   //TODO
copyASIFields(capId, pCapId);
copyASITables(capId, pCapId);
copyAddresses(capId, pCapId);
//copyContacts(capId, pCapId);  //Seems like contacts are copied when record is created above.
copyLicensedProf(capId, pCapId);
copyConditions(capId, pCapId);

//2b - Creating child records from old parent to new parent. 
var oldParentCapId = getParentByCapId(capId);
logDebug('Old Parent: ' + oldParentCapId.getCustomID());  
var oldParentChild = getChildren('EnvHealth/*/*/*', oldParentCapId);  

for(oc in oldParentChild){
    var recordStructure = oldParentChild[oc].toString().split('-');
    var oldParentChildCapIdObj = aa.cap.getCapID(recordStructure[0], recordStructure[1], recordStructure[2]);
    var oldParentChildCapId = oldParentChildCapIdObj.getOutput();
    var oldParentChildCapObj = aa.cap.getCap(oldParentChildCapId);
    var oldParentChildCap = oldParentChildCapObj.getOutput();
    var oldChildCapType = oldParentChildCap.getCapType().toString().split('/');
    if(oldChildCapType[1] != 'Amendment'){
        logDebug('New child: ' + oc + ' ' + oldParentChildCapId.getCustomID());
        var newChildCapId = createChild(oldChildCapType[0], oldChildCapType[1], oldChildCapType[2], oldChildCapType[3],'', pCapId);
        deleteCapContacts(newChildCapId);
        copyContacts(pCapId, newChildCapId); //Copy contacts from NEW facility to all children.
        copySpecialText(oldParentChildCapId, newChildCapId);
        copyASIFields(oldParentChildCapId, newChildCapId);
        copyASITables(oldParentChildCapId, newChildCapId);
        copyAddresses(oldParentChildCapId, newChildCapId);
        copyLicensedProf(oldParentChildCapId, newChildCapId);
        copyConditions(oldParentChildCapId, newChildCapId);
        // Find Parent Facility and update current record with Facility Name and ID
        var facilityID = getFacilityId(newChildCapId);
        if(facilityID != false){
            updateFacilityInfo(newChildCapId,facilityID);
        }
        //Update old children status
        updateAppStatus('Inactive, non-billable','',oldParentChildCapId); 
    }
}

updateAppStatus('Inactive','',oldParentCapId);

logDebug('Finishing CREATE_AND_COPY_TO_NEW_PARENT');

/**
 * Copies the record name from parent to child/amendment.
 * @param {*} srcCapId 
 * @param {*} targetCapId 
 */
 function copySpecialText(srcCapId, targetCapId){
    var capObj = aa.cap.getCap(srcCapId);
    var cap = capObj.getOutput(); 
    editAppName(cap.getSpecialText(), targetCapId);
}

/**
 * Deletes all record's contacts
 * @param {*} capId 
 */
 function deleteCapContacts(capId){
    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
		var Contacts = capContactResult.getOutput();        
        for (yy in Contacts) {
			var contactToRemove = Contacts[yy].getCapContactModel();
            logDebug(contactToRemove.getContactSeqNumber());
            var deletedContact = aa.people.removeCapContact(capId, contactToRemove.getContactSeqNumber());
            if(deletedContact.getSuccess()){
                logDebug("contact successfully deleted");
            }
            else{
                logDebug("contact cannot be deleted");
            }            
        }   
    }
}
