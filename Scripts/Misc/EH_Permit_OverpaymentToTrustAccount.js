// Function EH_Permit_OverpaymentToTrustAccount
// Add an overpayment to the Facility trust account
var sysDate = aa.util.now();
var parentFacilityId = getFacilityId(capId);
var tPAcctResult = aa.trustAccount.getPrimaryTrustAccountByCAP(parentFacilityId).getOutput();
var trustAccountModel = tPAcctResult.getTrustAccountModel();
//If no Primary then look for non primary
if(trustAccountModel == null){
    var tPAcctResult = aa.trustAccount.getTrustAccountListByCAPID(capId).getOutput();
    for(ts in tPAcctResult){
        var trustAccountModel = tPAcctResult[ts].getTrustAccountModel();
        if(trustAccountModel != null){
            tPAcctResult = trustAccountModel = tPAcctResult[ts];
            break;
        }
    }
}
if(trustAccountModel != null){
    var unapplied = paymentGetNotAppliedTot();
    newDate1 = convertDate(sysDate);
    newDate2 = aa.date.getScriptDateTime(newDate1);
    var refundResult = aa.finance.makeRefund(
                        capId, //capId
                        "To Trust Account", //paymentMethod
                        "", //paymentRefNbr
                        "", //ccType
                        newDate2, //ccExpDate
                        "", //payee
                        newDate2, //paymentDate
                        unapplied, //paymentAmount
                        "Refund", //paymentStatus
                        "", //tranCode
                        "ADMIN", //cashierId
                        "", //registerNbr
                        "Refunded to Trust Account", //paymentComment
                        "Refunded to Trust Account", //receiptComment
                        newDate2, //receiptDate
                        newDate2, //receiptBatchDate
                        "A" //receiptStatus
                        );
    if (refundResult.getSuccess())
        logDebug("Successfully completed refund");
    else
        logDebug("**ERROR: doing refund: " + refundResult.getErrorMessage());
    // Step 4: Deposit the funds to the trust
    try{
        var t = new com.accela.aa.finance.trustAccount.TransactionModel();
        t.setServProvCode(servProvCode);
        t.setAcctSeq(tPAcctResult.getAcctSeq());
        t.setRecStatus("A");
        t.setDepositMethod("Transfer");
        t.setPayor("Transfer");
        t.setTransAmount(unapplied);
        t.setRecDate(sysDate);
        t.setRecFulNam("ADMIN");
        t.setAcctID(tPAcctResult.getAcctID());
        t.setTransType("DEPOSIT");
        t.setCashierID("ADMIN");
        t.setComment("Automated transfer from " + capId.getCustomID());
        var tDeposit = aa.trustAccount.depositTrustAccount(t);
        if(tDeposit.getSuccess()){
            logDebug("Deposited " + unapplied + " to " + tPAcctResult.getAcctID());
        }
        else{
            logDebug("Deposit error " + tDeposit.getErrorMessage());
        }
    }
    catch(e){
        logDebug("Error depositing to trust account: " + e);
    }
}

function getFacilityId(vCapId){
    var facilityId = null;
    facilityId = getParent(vCapId);
    if(!matches(facilityId,null,undefined,"")){
        if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
            return facilityId
        }
    }
    return false;
 }
