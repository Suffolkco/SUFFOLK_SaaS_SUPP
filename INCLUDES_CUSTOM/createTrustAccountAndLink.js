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