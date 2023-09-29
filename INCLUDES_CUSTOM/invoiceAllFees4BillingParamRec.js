function invoiceAllFees4BillingParamRec(billingRecAltID) {
    itemCapId = capId;
    if (arguments.length > 1) itemCapId = arguments[1];
    feeSeqList = [];
    periodList = [];
    periodExists = false;

    feeList = aa.finance.getFeeItemByCapID(itemCapId).getOutput();

    for (fee in feeList) {
        if (feeList[fee].getFeeitemStatus() == "NEW" && billingRecAltID.equals(feeList[fee].getUdf1())) {
            feeSeqList.push(feeList[fee].getFeeSeqNbr());
            for (per in periodList){
                if (periodList[per] == feeList[fee].getPaymentPeriod()) periodExists = true;
            }
            if (!periodExists) periodList.push(feeList[fee].getPaymentPeriod());
        }
    }

    if(feeSeqList.length > 0) {
        doInvoice = aa.finance.createInvoice(itemCapId, feeSeqList, periodList);
        if (!doInvoice.getSuccess()){
            logDebug("Error during invoicing: " + doInvoice.getErrorMessage());
        }
    }
}