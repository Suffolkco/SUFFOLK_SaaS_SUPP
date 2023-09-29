/*
Batch Job Script
Name: BATCH_EH_BILLING_ASSESSFEES
Description: 
Author: Don Bates (Accela)
*/
var BATCH_NAME = "BATCH_EH_BILLING_ASSESSFEES";

var SCRIPT_VERSION = "3.0";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));

// Get Parameters
var currentUserID = "ADMIN";
var EmailNotifyTo = aa.env.getValue("EmailNotifyTo");
var billingParamRecNumber = aa.env.getValue("BillingParamRecNumber");

//override functions for cleaner logs
var emailText = "";
var br = "<BR>";
overRide = "function logDebug(dstr) {aa.print(dstr + br);emailText += dstr}";
eval(overRide);

// Execute Main Process
mainProcess();
function mainProcess(){
    //get billing parameter record
    var billingParamId = aa.cap.getCapID(billingParamRecNumber).getOutput();
    if (!billingParamId){
        logDebug("<B><Font Color=RED>" + billingParamRecNumber + ": Invalid record number</Font></B");
        return false;
    }
    var EnvhProgramLookupFeeSched = "";
    var prorationAccuracy = getAppSpecific("Accuracy",billingParamId);
    var prorationNumOf = parseInt(getAppSpecific("User Defined Of",billingParamId));
    var setName = billingParamId.getCustomID();
    var EnvhProgramSet = aa.set.getSetByPK(setName).getOutput();
	if (EnvhProgramSet == null) {
		logDebug("<B><Font Color=RED>Set Not Found</Font></B>");
        return false;
	}
	logDebug("Found Set ID " + setName);
    logDebug("<B>Begin Processing of Set Members</B>");
	//get set members and process each record
	var setMembers = aa.set.getCAPSetMembersByPK(setName).getOutput().toArray();
	for (a in setMembers) {
		var setCap = aa.cap.getCap(setMembers[a].ID1, setMembers[a].ID2, setMembers[a].ID3).getOutput();
		var EnvhProgramCapId = setCap.getCapID();
        logDebug("<B><Font Color=BLUE>Set Member " + EnvhProgramCapId.getCustomID() + "</Font></B>");
        var surchargeCode = null;
        var addlSurchargeCode = null;
        var addlSurchargeCode2 = null;
        var addlSurchargeCode3 = null;
        // Assess Program Annual Fee
        var EnvhProgramElement = getAppSpecific("Program Element",EnvhProgramCapId);
        if(!matches(EnvhProgramElement,null,undefined,"")){
            EnvhProgramElement = EnvhProgramElement.substring(0, 4);
            /// Get the active fee Schedule from the Fee Code
            var aryFeeSchedInfo = new Array;
            var EnvhProgramLookupFeeSched = "";
            aryFeeSchedInfo = getRefFeeSchedByFeeCode(EnvhProgramElement);
            for(x in aryFeeSchedInfo){
                if(isFeeScheduleEnabled(aryFeeSchedInfo[x]) == "A"){
                    EnvhProgramLookupFeeSched = aryFeeSchedInfo[x];
                    logDebug("Schedule " + EnvhProgramLookupFeeSched + " selected for fee assessment");
                }
            }
            var EnvhProgramLookupFeeCode = EnvhProgramElement;
            var EnvhProgramLookupFeePeriod = "FINAL";

            // See if program number exists in Standard Choice EH_BILLING_ICBO_UNIT
            // If it does, the lookup will return the field name where the quantity is stored
            // System will assume an ICBO type fee formula 
            var EnvhProgramCalcFeeQuantity = null;
            var EnvhProgramICBOUnit = lookupLoc("EH_BILLING_ICBO_UNIT",EnvhProgramLookupFeeCode);
            if(!matches(EnvhProgramICBOUnit,null,undefined,"")){
                var EnvhProgramCalcFeeQuantity = getAppSpecific(EnvhProgramICBOUnit,EnvhProgramCapId);
                logDebug("Value found in Standard Choice EH_BILLING_ICBO_UNIT, ICBO fee will use data field " + EnvhProgramICBOUnit + " value of " + EnvhProgramCalcFeeQuantity);
            }
            
            if(matches(EnvhProgramCalcFeeQuantity,null,undefined,"",0)){
                EnvhProgramCalcFeeQuantity = 1;
            }
            if(feeExistsWithCapId(EnvhProgramLookupFeeCode,"NEW",EnvhProgramCapId)){
                logDebug("An Assessed fee of type " + EnvhProgramLookupFeeCode + " already exists on this record, skipping");
                continue;
            }
            if(!doesRefFeeExist(EnvhProgramLookupFeeSched,EnvhProgramLookupFeeCode)){
                logDebug("<Font Color=RED>An Assessed fee of type " + EnvhProgramLookupFeeCode + " has not been configured. This fee cannot be invoiced please correct</Font></B>");
                continue;
            }
            var annPermitFeeSeq = addFee(EnvhProgramLookupFeeCode, EnvhProgramLookupFeeSched, EnvhProgramLookupFeePeriod, EnvhProgramCalcFeeQuantity,"N",EnvhProgramCapId);
            if(!matches(annPermitFeeSeq,null,undefined)){
                logDebug("Annual Permit Fee " + EnvhProgramLookupFeeCode + " has been assessed");
            }
             // Annual Permit Fee Proration
             if(matches(getAppSpecific("Fee Proration",billingParamId),"CHECKED")){
                feeProrationAmnt = prorateFeeQuantity(1,prorationAccuracy,prorationNumOf);
                var annPermitFeeSeq = prorateFee(annPermitFeeSeq,feeProrationAmnt,EnvhProgramCapId);
            }
            // Apply Discount if one exists
            var facilityCapId = getFacilityId(EnvhProgramCapId);
            if(!matches(facilityCapId,null,undefined,false)){
                var EnvhFacilityDiscountCode = getAppSpecific("Discount Code",facilityCapId);
            }else{
                var EnvhFacilityDiscountCode = null
            }
            var EnvhProgramDiscountCode = getAppSpecific("Discount Code",EnvhProgramCapId);
            var NoProgramsDiscountFlag = getAppSpecific("Number of Programs Discount",billingParamId);
            if(!matches(EnvhFacilityDiscountCode,null,"",undefined)){
                var EnvhFacilityDiscountLookup = lookupLoc("EH_DISCOUNT_CODE",EnvhFacilityDiscountCode);
                if(!matches(EnvhFacilityDiscountLookup,"",undefined,null)){
                    var EnvhFacilityDiscountLookupArray = new Array;
                    EnvhFacilityDiscountLookupArray = EnvhFacilityDiscountLookup.split("|");
                    if(EnvhFacilityDiscountLookupArray.length != 0){
                        var discountAccuracy = EnvhFacilityDiscountLookupArray[0];
                        var discountNumOf = EnvhFacilityDiscountLookupArray[1];
                        discountFraction = discountFeeQuantity(1,discountAccuracy,discountNumOf);
                        discountFee(annPermitFeeSeq,discountFraction,EnvhProgramCapId);
                    }
                }
            }else if(!matches(EnvhProgramDiscountCode,null,"",undefined)){
                var EnvhProgramDiscountLookup = lookupLoc("EH_DISCOUNT_CODE",EnvhProgramDiscountCode);
                if(!matches(EnvhProgramDiscountLookup,"",undefined,null)){
                    var EnvhProgramDiscountLookupArray = new Array;
                    EnvhProgramDiscountLookupArray = EnvhProgramDiscountLookup.split("|");
                    if(EnvhProgramDiscountLookupArray.length != 0){
                        var discountAccuracy = EnvhProgramDiscountLookupArray[0];
                        var discountNumOf = EnvhProgramDiscountLookupArray[1];
                        discountFraction = discountFeeQuantity(1,discountAccuracy,discountNumOf);
                        discountFee(annPermitFeeSeq,discountFraction,EnvhProgramCapId);
                    }
                }
            }else if(!matches(NoProgramsDiscountFlag,null,"",undefined)){
                //this block is left open for sany hard coded discount associated to the Billing Parameter Record itself
            }
            
            // Program Fee Surcharge if configured
            if(!matches(lookupLoc("EH_PROGRAM_FEES_SURCHARGE",EnvhProgramElement),null,undefined,"")){
                surchargeCode = lookupLoc("EH_PROGRAM_FEES_SURCHARGE",EnvhProgramElement)
            }

            // Fee Surcharges
            var feeSurCharges = lookupLoc("EH_AGENCY_INFO","CUPA Agency");
            if(feeSurCharges == "Y" && !matches(surchargeCode,null,undefined,"")){
                // Apply the fee item for CUPA Oversight Surcharge (only 1 fee item) to the appropriate permits based on the 
                // Program Elements chosen in the dropdowns, applied to and assessed on, the facility
                // CUPA Oversight Surcharge
                var EnvhSurchargeLookup = lookupLoc("EH_PROGRAM_FEE_SURCHARGE",surchargeCode);
                if(!matches(EnvhSurchargeLookup,"",undefined,null)){
                    var EnvhSurchargeLookupArray = new Array;
                    EnvhSurchargeLookupArray = EnvhSurchargeLookup.split("|");
                    if(EnvhSurchargeLookupArray.length != 0){
                        var EnvhSurchargeLookupFeeSched = EnvhSurchargeLookupArray[0];
                        var EnvhSurchargeLookupFeeCode = EnvhSurchargeLookupArray[1];
                        var EnvhSurchargeLookupFeePeriod = EnvhSurchargeLookupArray[2];
                        var EnvhSurchargeCalcFeeQuantity = 1;
                        // Fee Surcharge Proration - Fee Engine
                        if(matches(getAppSpecific("Prorate CUPA Oversight Surcharge",billingParamId),"CHECKED")){
                            // Surcharge Fee Proration
                            EnvhSurchargeCalcFeeQuantity = prorateFeeQuantity(EnvhSurchargeCalcFeeQuantity,prorationAccuracy,prorationNumOf);
                        }
                        addFee(EnvhSurchargeLookupFeeCode, EnvhSurchargeLookupFeeSched, EnvhSurchargeLookupFeePeriod, EnvhSurchargeCalcFeeQuantity, "N",EnvhProgramCapId);
                        logDebug("Surcharge Fee " + EnvhProgramLookupFeeCode + " has been assessed");
                        //Additional Surcharge - Surcharge
                        if(!matches(lookupLoc("EH_PROGRAM_FEES_SURCHARGE",surchargeCode),null,undefined,"")){
                            addlSurchargeCode = lookupLoc("EH_PROGRAM_FEES_SURCHARGE",surchargeCode)
                        }
                    }
                }
            }
            if(feeSurCharges == "Y" && !matches(addlSurchargeCode,null,undefined,"")){
                var EnvhAddlSurchargeLookup = lookupLoc("EH_PROGRAM_FEE_SURCHARGE",addlSurchargeCode);
                if(!matches(EnvhAddlSurchargeLookup,"",undefined,null)){
                    var EnvhAddlSurchargeLookupArray = new Array;
                    EnvhAddlSurchargeLookupArray = EnvhAddlSurchargeLookup.split("|");
                    if(EnvhAddlSurchargeLookupArray.length != 0){
                        var EnvhAddlSurchargeLookupFeeSched = EnvhAddlSurchargeLookupArray[0];
                        var EnvhAddlSurchargeLookupFeeCode = EnvhAddlSurchargeLookupArray[1];
                        var EnvhAddlSurchargeLookupFeePeriod = EnvhAddlSurchargeLookupArray[2];
                        var EnvhAddlSurchargeCalcFeeQuantity = 1;
                        // Surcharge Fee Proration
                        if(matches(getAppSpecific("Prorate CUPA Oversight Surcharge",billingParamId),"CHECKED")){
                            EnvhAddlSurchargeCalcFeeQuantity = prorateFeeQuantity(EnvhAddlSurchargeCalcFeeQuantity,prorationAccuracy,prorationNumOf);
                        }
                        addFee(EnvhAddlSurchargeLookupFeeCode, EnvhAddlSurchargeLookupFeeSched, EnvhAddlSurchargeLookupFeePeriod,EnvhAddlSurchargeCalcFeeQuantity, "N",EnvhProgramCapId);
                        logDebug("Surcharge Fee " + EnvhAddlSurchargeLookupFeeCode + " has been assessed");
                        //Additional Surcharge - Surcharge
                        if(!matches(lookupLoc("EH_PROGRAM_FEES_SURCHARGE",addlSurchargeCode),null,undefined,"")){
                            addlSurchargeCode2 = lookupLoc("EH_PROGRAM_FEES_SURCHARGE",addlSurchargeCode)
                        }
                    }
                }
            }
            if(feeSurCharges == "Y" && !matches(addlSurchargeCode2,null,undefined,"")){
                var EnvhAddlSurcharge2Lookup = lookupLoc("EH_PROGRAM_FEE_SURCHARGE",addlSurchargeCode2);
                if(!matches(EnvhAddlSurcharge2Lookup,"",undefined,null)){
                    var EnvhAddlSurcharge2LookupArray = new Array;
                    EnvhAddlSurcharge2LookupArray = EnvhAddlSurcharge2Lookup.split("|");
                    if(EnvhAddlSurcharge2LookupArray.length != 0){
                        var EnvhAddlSurcharge2LookupFeeSched = EnvhAddlSurcharge2LookupArray[0];
                        var EnvhAddlSurcharge2LookupFeeCode = EnvhAddlSurcharge2LookupArray[1];
                        var EnvhAddlSurcharge2LookupFeePeriod = EnvhAddlSurcharge2LookupArray[2];
                        var EnvhAddlSurcharge2CalcFeeQuantity = 1;
                        // Surcharge Fee Proration
                        if(matches(getAppSpecific("Prorate CUPA Oversight Surcharge",billingParamId),"CHECKED")){
                            EnvhAddlSurcharge2CalcFeeQuantity = prorateFeeQuantity(EnvhAddlSurcharge2CalcFeeQuantity,prorationAccuracy,prorationNumOf);
                        }
                        addFee(EnvhAddlSurcharge2LookupFeeCode, EnvhAddlSurcharge2LookupFeeSched, EnvhAddlSurcharge2LookupFeePeriod,EnvhAddlSurcharge2CalcFeeQuantity, "N",EnvhProgramCapId);
                        logDebug("Surcharge Fee " + EnvhAddlSurcharge2LookupFeeCode + " has been assessed");
                        //Additional Surcharge - Surcharge
                        if(!matches(lookupLoc("EH_PROGRAM_FEES_SURCHARGE",addlSurchargeCode2),null,undefined,"")){
                            addlSurchargeCode3 = lookupLoc("EH_PROGRAM_FEES_SURCHARGE",addlSurchargeCode2)
                        }
                    }
                }
            }
            if(feeSurCharges == "Y" && !matches(addlSurchargeCode3,null,undefined,"")){
                var EnvhAddlSurcharge3Lookup = lookupLoc("EH_PROGRAM_FEE_SURCHARGE",addlSurchargeCode3);
                if(!matches(EnvhAddlSurcharge3Lookup,"",undefined,null)){
                    var EnvhAddlSurcharge3LookupArray = new Array;
                    EnvhAddlSurcharge3LookupArray = EnvhAddlSurcharge2Lookup.split("|");
                    if(EnvhAddlSurcharge3LookupArray.length != 0){
                        var EnvhAddlSurcharge3LookupFeeSched = EnvhAddlSurcharge3LookupArray[0];
                        var EnvhAddlSurcharge3LookupFeeCode = EnvhAddlSurcharge3LookupArray[1];
                        var EnvhAddlSurcharge3LookupFeePeriod = EnvhAddlSurcharge3LookupArray[2];
                        var EnvhAddlSurcharge3CalcFeeQuantity = 1;
                        // Surcharge Fee Proration
                        if(matches(getAppSpecific("Prorate CUPA Oversight Surcharge",billingParamId),"CHECKED")){
                            EnvhAddlSurcharge3CalcFeeQuantity = prorateFeeQuantity(EnvhAddlSurcharge3CalcFeeQuantity,prorationAccuracy,prorationNumOf);
                        }
                        addFee(EnvhAddlSurcharge3LookupFeeCode, EnvhAddlSurcharge3LookupFeeSched, EnvhAddlSurcharge3LookupFeePeriod,EnvhAddlSurcharge3CalcFeeQuantity,"N",EnvhProgramCapId);
                        logDebug("Surcharge Fee " + EnvhAddlSurcharge3LookupFeeCode + " has been assessed");
                    }
                }
            }
            // Update Set Status
            EnvhProgramSet.setSetStatus("Fees Assessed");
            EnvhProgramResult = aa.set.updateSetHeader(EnvhProgramSet);
            // Update Faility Balance
            refreshFacilityBalance(EnvhProgramCapId);
        }else{
            logDebug("<Font Color=RED>No Program Element ASI Configured for " + EnvhProgramLookupFeeCode + "</Font>");
        }
    }
    // Update "Fee Assessment Review" to status "Fee Assessment Review in Progress"
    updateTaskAndHandleDisposition("Fee Assessment Review","Fee Assessment Review in Progress",billingParamId);
    logDebug("<B>End Processing of Set Members</B>");
    logDebug("Workflow task Fee Assessment Review updated to status Fee Assessment Review In Progress");
    // Send email notification template EH_BILLING_TASK_UPDATE to task assignee 
    var staffUsr = getUserIDAssignedToTask("Fee Assessment Review", billingParamId);
    if (staffUsr != null) {
        staffUsrEmail = getUserEmail(staffUsr);
        var emailTemplate = "EH_BILLING_TASK_UPDATE";
        var eParams = aa.util.newHashtable();
        eParams.put("$$taskName$$", "Fee Assessment Review");
        eParams.put("$$taskStatus$$", "Fee Assessment Review in Progress");
        if(!matches(staffUsrEmail,null,undefined,"")){
            sendNotification(null, staffUsrEmail, null, emailTemplate, eParams, null, billingParamId);
            logDebug("Email Notification Sent");
        }
    }
    if(!matches(EmailNotifyTo,null,undefined,"")){
        aa.sendMail("NoReply@accela.com",EmailNotifyTo, "", "Batch Job - EH Monthly Billing Assess Fees", emailText);
    }
}

// Batch Custom Functions
function isFeeScheduleEnabled(feeSchedule) {
    var array = [];
    var sql = "SELECT REC_STATUS FROM RFEE_SCHEDULE WHERE SERV_PROV_CODE = '$$servprovcode$$' AND FEE_SCHEDULE_NAME = '$$feeSchedule$$'" ;
    sql = sql.replace("$$servprovcode$$", aa.getServiceProviderCode());
    sql = sql.replace("$$feeSchedule$$", feeSchedule);

	var r = aa.db.select(sql, new Array()).getOutput();
    var result = "";
    if (r.size() > 0)
    {
        r = r.toArray();
		result = r[0].get("REC_STATUS");
    }
    return result;
}
function getRefFeeSchedByFeeCode(feeCode) {
    var array = [];
    var sql = "SELECT R1_FEE_CODE FROM RFEEITEM WHERE SERV_PROV_CODE = '$$servprovcode$$' AND R1_GF_COD = '$$feeCode$$'" ;
    sql = sql.replace("$$servprovcode$$", aa.getServiceProviderCode());
    sql = sql.replace("$$feeCode$$", feeCode);

	var r = aa.db.select(sql, new Array()).getOutput();
    var result = new Array();
    if (r.size() > 0)
    {
        r = r.toArray();
        for (var x in r){
            result.push(r[x].get("R1_FEE_CODE"));
        }
    }
    return result;
}
function refreshFacilityBalance(itemCap){
    var parents = new Array();
    if (!appMatch("EnvHealth/Facility/NA/NA",itemCap)) {
        var parents = getParentsLOC("EnvHealth/Facility/NA/NA");
    }
    else {
        parents.push(itemCap);
    }
    for (var parent in parents){
		var parentCapId = parents[parent];
        var sumCredits = 0;
        var sumBalance = 0;
		var capDetails = aa.cap.getCapDetail(parentCapId).getOutput();
        sumBalance = parseFloat(capDetails.getBalance());
		logDebug("sumBalance: " + sumBalance);
        var accountArrayAll = aa.trustAccount.getTrustAccountListByCAPID(parentCapId).getOutput() || new Array();
        for (ta in accountArrayAll) {
            var tArrayModel = accountArrayAll[ta].getTrustAccountModel();
            if (tArrayModel.getAssociations() == "Record") {
                sumCredits += parseFloat(accountArrayAll[ta].getAcctBalance());
            }
        }
        var facilityBalanceDue = parseFloat(sumBalance - sumCredits);
		logDebug("facilityBalanceDue: " + facilityBalanceDue);
        editAppSpecific("Facility Total Due",facilityBalanceDue,parentCapId);
    }
}
function discountFeeQuantity(prQuantity,prAccuracy,prNumberOf){
	var prFeeQuantity = prQuantity;
	if(!isNaN(prFeeQuantity)){
		prFeeQuantity = (prQuantity/12)*prNumberOf
	}
	return prFeeQuantity;
}
function discountFee(tempFeeSeq,discountFraction,vCapId){
	var feeResult = aa.fee.getFeeItemByPK(vCapId,tempFeeSeq);
	if (feeResult.getSuccess()) {
		var feeObj = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + feeResult.getErrorMessage());
	}	
	var entireFeeAmount = feeObj.getFee();
	var deltaAmount = entireFeeAmount*parseFloat(discountFraction);
	if(deltaAmount != null){
		if (tempFeeSeq) {
			var templateFeeList = aa.fee.getFeeItems(vCapId).getOutput();
			for (var ff in templateFeeList) {
				if (templateFeeList[ff].getFeeSeqNbr() == tempFeeSeq) {
					_templateFee = templateFeeList[ff];
					originalAmt = _templateFee.getFee();
					break;
				}
			}
		}
        // Override fee formula
        var f4fim = _templateFee.getF4FeeItemModel();
        f4fim.setCapID(vCapId);
        f4fim.setFeeCalcProc("CONSTANT");
        f4fim.setFormula(deltaAmount/f4fim.getFeeUnit());
        f4fim.setParentFeeItemSeqNbr(null);
        f4fim.setFee(deltaAmount);
        f4fim.setFeeUnit(f4fim.getFeeUnit());
		var editResult = aa.finance.removeFeeItem(vCapId, tempFeeSeq);
		assessFeeResult = aa.fee.addFeeItem(_templateFee);
		var feeResult = aa.fee.getFeeItemByPK(vCapId,assessFeeResult.getOutput());
		var feeObj = feeResult.getOutput();
        var newFeeAmount =  feeObj.getFee();
        //Update Fee Notes
        var feeNotes = "Fee has been discounted from its original amount of " + entireFeeAmount + " to " + deltaAmount;
        logDebug(feeNotes);
        var fsm = feeObj.getF4FeeItem();
        var prevFeeNotes =  fsm.getFeeNotes()
        if(!matches(prevFeeNotes,null,undefined,"")){
            fsm.setFeeNotes(prevFeeNotes + " " + feeNotes);
        }else{
            fsm.setFeeNotes(feeNotes);
        }
        aa.finance.editFeeItem(fsm);
        return assessFeeResult.getOutput();
	}
}
function prorateFee(tempFeeSeq,prorationFraction,vCapId){
	var feeResult = aa.fee.getFeeItemByPK(vCapId,tempFeeSeq);
	if (feeResult.getSuccess()) {
		var feeObj = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + feeResult.getErrorMessage());
	}	
	var entireFeeAmount =  feeObj.getFee();
	var deltaAmount = entireFeeAmount*parseFloat(prorationFraction);
	if(deltaAmount != 0){
		if (tempFeeSeq) {
			var templateFeeList = aa.fee.getFeeItems(vCapId).getOutput();
			for (var ff in templateFeeList) {
				if (templateFeeList[ff].getFeeSeqNbr() == tempFeeSeq) {
					_templateFee = templateFeeList[ff];
					originalAmt = _templateFee.getFee();
					break;
				}
			}
		}
		// Override fee formula
		var f4fim = _templateFee.getF4FeeItemModel();
        f4fim.setCapID(vCapId);
		f4fim.setFeeCalcProc("CONSTANT");
		f4fim.setFormula(deltaAmount/f4fim.getFeeUnit());
		f4fim.setParentFeeItemSeqNbr(null);
		f4fim.setFee(deltaAmount);
		f4fim.setFeeUnit(f4fim.getFeeUnit());
		var editResult = aa.finance.removeFeeItem(vCapId, tempFeeSeq);
		assessFeeResult = aa.fee.addFeeItem(_templateFee);
		var feeResult = aa.fee.getFeeItemByPK(vCapId,assessFeeResult.getOutput());
		var feeObj = feeResult.getOutput();
        var newFeeAmount =  feeObj.getFee();
        //Update Fee Notes
        var feeNotes = "Fee has been prorated from its original amount of " + entireFeeAmount + " to " + deltaAmount;
        logDebug(feeNotes);
        var fsm = feeObj.getF4FeeItem();
        var prevFeeNotes =  fsm.getFeeNotes()
        if(!matches(prevFeeNotes,null,undefined,"")){
            fsm.setFeeNotes(prevFeeNotes + " " + feeNotes);
        }else{
            fsm.setFeeNotes(feeNotes);
        }
        aa.finance.editFeeItem(fsm);
        return assessFeeResult.getOutput();
	}
}
function doesRefFeeExist(feeSched,feeCode) {
    var array = [];
    var sql = "SELECT R1_GF_COD FROM RFEEITEM WHERE SERV_PROV_CODE = '$$servprovcode$$' AND R1_FEE_CODE = '$$feesched$$' AND R1_GF_COD = '$$feeCode$$'";
    sql = sql.replace("$$feesched$$", feeSched);
    sql = sql.replace("$$servprovcode$$", aa.getServiceProviderCode());
    sql = sql.replace("$$feeCode$$", feeCode);
	
	var r = aa.db.select(sql, new Array()).getOutput();
	var result = new Array();
    if (r.size() > 0)
    {
        r = r.toArray();
        for (var x in r)
        {
            var thisRefFeeCode = aa.cap.getCapID(r[x].get("R1_GF_COD")).getOutput();
            result.push(thisRefFeeCode);
        }
    }
    if(result.length == 0){
		return false;
	}else{
		return true;
	}
}
function prorateFeeQuantity(prQuantity,prAccuracy,prNumberOf){
	var prFeeQuantity = prQuantity;
	if(!isNaN(prFeeQuantity)){
		if(prAccuracy == "12 Months"){
			prFeeQuantity = (prQuantity/12)*prNumberOf
		}else if(prAccuracy == "365 Days"){
			prFeeQuantity = (prQuantity/365)*prNumberOf
		}else if(prAccuracy == "User Defined"){
            if(!matches(getAppSpecific("User Defined Bill",billingParamId),null,undefined,"")){
                var customDenom = parseInt(getAppSpecific("User Defined Bill",billingParamId));
                prFeeQuantity = (prQuantity/customDenom)*prNumberOf
            }
		}
	}
	return prFeeQuantity;
}
function feeExistsWithCapId(feestr,feeStatus,vCapId){
	var feeResult = aa.fee.getFeeItems(vCapId, feestr, null);
	if (feeResult.getSuccess()) {
		var feeObjArr = feeResult.getOutput();
	} else {
		logDebug("**ERROR: getting fee items: " + capContResult.getErrorMessage());
		return false
	}
	for (ff in feeObjArr)
		if (feestr.equals(feeObjArr[ff].getFeeCod()) && feeObjArr[ff].getFeeitemStatus() == feeStatus){
            return true;
        }
	return false;
} 
function getUserIDAssignedToTask(taskName,vCapId){
	currentUsrVar = null
	var taskResult1 = aa.workflow.getTask(vCapId,taskName);
	if (taskResult1.getSuccess()){
		tTask = taskResult1.getOutput();
		}
	else{
		logMessage("**ERROR: Failed to get workflow task object ");
		return false;
		}
	taskItem = tTask.getTaskItem()
	taskUserObj = tTask.getTaskItem().getAssignedUser()
	taskUserObjLname = taskUserObj.getLastName()
	taskUserObjFname = taskUserObj.getFirstName()
	taskUserObjMname = taskUserObj.getMiddleName()
	currentUsrVar = aa.person.getUser(taskUserObjFname,taskUserObjMname,taskUserObjLname).getOutput();
	if(currentUsrVar != null){
		currentUserIDVar = currentUsrVar.getGaUserID();
		return currentUserIDVar;
		}
	else{
		return false;
		}
	}
function updateTaskAndHandleDisposition(taskName, taskStatus){
     try{
         var itemCap = null;
         if(arguments.length > 2){
             itemCap = arguments[2]
         }
         else{
             itemCap = capId;
         }
         var functionName = "updateTaskAndHandleDisposition";
         var taskResult = aa.workflow.getTask(itemCap, taskName);
         if(!taskResult.getSuccess()){
             logDebug("Problem while getting task " + taskResult.getErrorMessage());
         }
         task = taskResult.getOutput();
         if (!task) return false;
         task.setDisposition(taskStatus);  
         var updateResult = aa.workflow.handleDisposition(task.getTaskItem(),itemCap);
 
         if(!updateResult.getSuccess()){
             logDebug("Problem while updating workflow " + updateResult.getErrorMessage());
         }
     }catch(e){
         aa.debug("**EXCEPTION in function " + functionName, e);
         throw(e);
     }
}
function getFacilityId(vCapId){
    var facilityId = null;
    facilityId = getParentLOC(vCapId);
    if(!matches(facilityId,null,undefined,"")){
        if(appMatch("EnvHealth/Facility/NA/NA",facilityId)){
            return facilityId
        }
    }
    return false;
 }
function updateFeeWithCapId(fcode, fsched, fperiod, fqty, finvoice, pDuplicate, pFeeSeq,vCapId) {
	// Updates an assessed fee with a new Qty.  If not found, adds it; else if invoiced fee found, adds another with adjusted qty.
	// optional param pDuplicate -if "N", won't add another if invoiced fee exists (SR5085)
	// Script will return fee sequence number if new fee is added otherwise it will return null (SR5112)
	// Optional param pSeqNumber, Will attempt to update the specified Fee Sequence Number or Add new (SR5112)
	// 12/22/2008 - DQ - Correct Invoice loop to accumulate instead of reset each iteration

	// If optional argument is blank, use default logic (i.e. allow duplicate fee if invoiced fee is found)
	if (pDuplicate == null || pDuplicate.length == 0)
		pDuplicate = "Y";
	else
		pDuplicate = pDuplicate.toUpperCase();

	var invFeeFound = false;
	var adjustedQty = fqty;
	var feeSeq = null;
	feeUpdated = false;

	if (pFeeSeq == null)
		getFeeResult = aa.finance.getFeeItemByFeeCode(vCapId, fcode, fperiod);
	else
		getFeeResult = aa.finance.getFeeItemByPK(vCapId, pFeeSeq);

	if (getFeeResult.getSuccess()) {
		if (pFeeSeq == null)
			var feeList = getFeeResult.getOutput();
		else {
			var feeList = new Array();
			feeList[0] = getFeeResult.getOutput();
		}
		for (feeNum in feeList) {
			if (feeList[feeNum].getFeeitemStatus().equals("INVOICED")) {
				if (pDuplicate == "Y") {
					logDebug("Invoiced fee " + fcode + " found, subtracting invoiced amount from update qty.");
					adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
					invFeeFound = true;
				} else {
					invFeeFound = true;
					logDebug("Invoiced fee " + fcode + " found.  Not updating this fee. Not assessing new fee " + fcode);
				}
			}

			if (feeList[feeNum].getFeeitemStatus().equals("NEW")) {
				adjustedQty = adjustedQty - feeList[feeNum].getFeeUnit();
			}
		}

		for (feeNum in feeList)
			if (feeList[feeNum].getFeeitemStatus().equals("NEW") && !feeUpdated) // update this fee item
			{
				var feeSeq = feeList[feeNum].getFeeSeqNbr();
				var editResult = aa.finance.editFeeItemUnit(vCapId, adjustedQty + feeList[feeNum].getFeeUnit(), feeSeq);
				feeUpdated = true;
				if (editResult.getSuccess()) {
					logDebug("Updated Qty on Existing Fee Item: " + fcode + " to Qty: " + fqty);
					if (finvoice == "Y") {
						feeSeqList.push(feeSeq);
						paymentPeriodList.push(fperiod);
					}
				} else {
					logDebug("**ERROR: updating qty on fee item (" + fcode + "): " + editResult.getErrorMessage());
					break
				}
			}
	} else {
		logDebug("**ERROR: getting fee items (" + fcode + "): " + getFeeResult.getErrorMessage())
	}

	// Add fee if no fee has been updated OR invoiced fee already exists and duplicates are allowed
	if (!feeUpdated && adjustedQty != 0 && (!invFeeFound || invFeeFound && pDuplicate == "Y"))
		feeSeq = addFee(fcode, fsched, fperiod, adjustedQty, finvoice,vCapId);
	else
		feeSeq = null;
	updateFeeItemInvoiceFlag(feeSeq, finvoice);
	return feeSeq;
}
function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode)
        servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}
function lookupLoc(stdChoice,stdValue) {
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
   	if (bizDomScriptResult.getSuccess()){
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription();
		//logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
	}
	return strControl;
}
function getParentLOC() {
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(capId,1);
	if (getCapResult.getSuccess()){
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else{
			return false;
		}
	}
	else{ 
		return false;
	}
}
function getParentsLOC(pAppType) {
	// returns the capId array of all parent caps
	//Dependency: appMatch function
	//
	var i = 1;
	while (true) {
		if (!(aa.cap.getProjectParents(capId, i).getSuccess()))
			break;

		i += 1;
	}
	i -= 1;
	getCapResult = aa.cap.getProjectParents(capId, i);
	myArray = new Array();
	if (getCapResult.getSuccess()) {
		parentArray = getCapResult.getOutput();
		if (parentArray.length) {
			for (x in parentArray) {
				if (pAppType != null) {
					//If parent type matches apType pattern passed in, add to return array
					if (appMatch(pAppType, parentArray[x].getCapID()))
						myArray.push(parentArray[x].getCapID());
				} else
					myArray.push(parentArray[x].getCapID());
			}
			return myArray;
		} else {
			return null;
		}
	} else {
		return null;
	}
} 
