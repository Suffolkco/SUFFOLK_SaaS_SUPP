// On submittal, create a default Trust Account
if(!publicUser){
    createTrustAccountAndLink(capId.getCustomID(), "Created by Script", 0.0, "", 0.0, "Yes","ADMIN",capId);
}

// On submittal, create a default Payment Set
var searchSetResult = aa.set.getSetByPK(capId.getCustomID());
if (!searchSetResult.getSuccess()) {
    var setID = capId.getCustomID();
    var setName = setID + "-FACILITY FEES";
    var setType = "Payment Processing";
    paymentSet = new capSet(setID, setName, setType);
    paymentSet.type = "Payment Processing";
    paymentSet.status = "Open";
    paymentSet.update();
    // Add the Facility Record to the Set
    var searchSetResult = aa.set.getSetByPK(setID);
    if (searchSetResult.getSuccess()){
        var recSet = new capSet(setID);
        var newMember = true;
        for (var m in recSet.members) {
            if (recSet.members[m].getID1() == capId.getID1() && recSet.members[m].getID2() == capId.getID2() && recSet.members[m].getID3() == capId.getID3()) {
                newMember = false;
                break;
            }
        }
        if(newMember){
            var addResult = aa.set.add(setID, capId);
        }
    }
}

// Demote Contacts to a Secondary Type
if(!publicUser){
    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()){
        var Contacts = capContactResult.getOutput();
        for (yy in Contacts){
            var thisContact = Contacts[yy].getCapContactModel();
            var thisContactType = thisContact.getContactType();
            if(countRecordContactsByType(thisContactType,capId) > 1){
                contactType = thisContact.getContactType();
                ContactSeq = thisContact.getContactSeqNumber();
                eval(getScriptText("EH_Facility_DemoteContact"));
            }
        }
    }
}
function countRecordContactsByType(vContactType,vCapId){
	var cntTypeCnt = 0;
	var capContactResult = aa.people.getCapContactByCapID(vCapId);
	if (capContactResult.getSuccess()){
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts){
			var thisContact = Contacts[yy].getCapContactModel();
			if(thisContact.getContactType() == vContactType) {
				cntTypeCnt++
			}
		}
	}
	return cntTypeCnt
}
function createTrustAccountAndLink(acctID, desc, overdraft, ledger, threshold, primary, user, vCapId) {
    // Creates a new trust account
    // acctID (int) - new account ID
    // desc (string) - account description
    // overdraft (double) - overdraft limit for the account (0 if none)
    // ledger (string) - GL account for the trust acount
    // threshold (double) - Amount when a low balance notice may be triggered
    // primary (String Y or N)
    // user (string) - the user ID to log the account creation transaction (typically the current user)
	var jDate = new java.util.Date();
	//create a trust account model
	var taModel = aa.trustAccount.createTrustAccountScriptModel().getTrustAccountModel();
	taModel.setAcctID(acctID);
	taModel.setAcctBalance(0);
	taModel.setAcctStatus("Active");
	taModel.setRecDate(jDate);
	taModel.setRecFulName(user);
	taModel.setRecStatus("A");
	taModel.setServProvCode(aa.getServiceProviderCode());
	taModel.setDescription(desc);
	taModel.setLedgerAccount(ledger);
	taModel.setThresholdAmount(threshold);
	//Set overdraft options
	if (overdraft > 0) {
		taModel.setOverdraftLimit(overdraft);
		taModel.setOverdraft("Y");
	} else {
		taModel.setOverdraftLimit(0);
		taModel.setOverdraft("N");
	}
	//commit the model
	var res = aa.trustAccount.createTrustAccount(taModel);
	if (res.getSuccess()) {
		var accSeq = aa.trustAccount.getTrustAccountByAccountID(acctID, aa.getServiceProviderCode()).getOutput().getAcctSeq();
        var tbiz = aa.proxyInvoker.newInstance("com.accela.aa.finance.trustAccount.TrustAccountBusiness").getOutput();
        tbiz.createTrustAccountCapRelationShip(vCapId,taModel,"Yes");
        if(matches(primary.toUpperCase(),"Y","YES")){
            tbiz.updatePrimaryTrustAccountForCap(vCapId,taModel.getAcctSeq(),"Y");
        }
        return accSeq
	} else {
		return false;
	}
}