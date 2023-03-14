// Calculate the From Date and To Date if an annual permit fee has been paid and the balance is zero
// Script will calculate the number of health program annual fees paid in the event that
// more than one has been paid. 
// If more than one has been paid then multiple years will be added to the From Date
// Example, if two annual permit fees are paid the From Date will get incremented 2 years
// The script looks at the first 4 chars of the "Program Element" data field and matches it
// with the fee codes that exist in the last payment
// Has a dependancy on the standard choice EH_PROGRAM_RENEWAL_INTERVAL unless default of 12 months is being used

if (balanceDue <= 0) {
  var programNumber = getAppSpecific("Program Element");
  if (!matches(programNumber, null, undefined, "")) {
		var programNumberString = programNumber.substr(0, 4);
		var aryAnnPermitCount = new Array;
		var recPayments = new Array;
		var recPayments = aa.finance.getPaymentByCapID(capId, null).getOutput();
		// Get the Last Payment on the record
		recPayments.sort(sortPayments);
		var lastPayment = recPayments[0];
		var pfResult = aa.finance.getPaymentFeeItems(capId, null);
		if (pfResult.getSuccess()) {
		  var pfObj = pfResult.getOutput();
		  for (ij in pfObj) {
			var paymentFee = pfObj[ij];
			if (paymentFee.getPaymentSeqNbr() == lastPayment.getPaymentSeqNbr()) {
			  // Count number of Annual Fees in Payment by comparing the Fee Code 
			  // and the Program Element Number
			  thisFeeResult = aa.finance.getFeeItemByPK(capId, paymentFee.getFeeSeqNbr());
			  if (thisFeeResult.getSuccess()) {
				thisFee = thisFeeResult.getOutput();
				if (thisFee.feeCod == programNumberString) {
				  aryAnnPermitCount.push(thisFee.feeCod)
				}
			  }
			}
		  }
		}
		var annualPermitCounter = aryAnnPermitCount.length
		// Increment Permit Dates based on number of annual permits paid for
		if (annualPermitCounter > 0) {
		  // Lookup Renewal Interval in months
		  var renIntervalMonths = lookup("EH_PROGRAM_RENEWAL_INTERVAL", programNumberString);
		  if (!matches(renIntervalMonths, null, undefined, "")) {
			renIntervalMonths = parseInt(renIntervalMonths);
		  } else {
			renIntervalMonths = 12;
		  }
		  
		  var origPermitToDt = getAppSpecific("To Date");
		  if (matches(origPermitToDt, "", null, undefined)) {
			var pTToday = new Date;
			origPermitToDt = jsDateToMMDDYYYY(pTToday);
		  }

		  // Calculate new From Date as payment date if annual permit fee has been paid
			var newPermitFromDt = "";
			if (annualPermitCounter > 0) {
			  newPermitFromDt = new Date(lastPayment.getPaymentDate());
			  newPermitFromDt = jsDateToMMDDYYYY(newPermitFromDt);
			} else {
			  newPermitFromDt = getAppSpecific("From Date");
			}
			if (matches(newPermitFromDt, "", null, undefined)) {
			  var pFToday = new Date;
			  newPermitFromDt = jsDateToMMDDYYYY(pFToday);
			}
			  
		  // Calculate new To Date as 1 year from previous To Date
		  var newPermitToDt = dateAddYears(origPermitToDt, 1);

		  // Calculate new Next Billing Date as 1 year from original Next Billing Date
		  var origNextBillingDate = getAppSpecific("Next Billing Date");
		  var newNextBillingDate = dateAddYears(origNextBillingDate, 1);

		  editAppSpecific("From Date", newPermitFromDt);
		  editAppSpecific("To Date", newPermitToDt);
		  editAppSpecific("Next Billing Date", newNextBillingDate);
		  showMessage = true;
		  comment("<B><Font Color=BLUE>" + annualPermitCounter + " annual fee(s) have been paid in this transaction. The Permit To Date has been updated to " + newPermitToDt + "</Font></B>");
		}
	}
}

function sortPayments(a, b) {
return b.getPaymentSeqNbr() - a.getPaymentSeqNbr();
}

// Function to add years to a date
function dateAddYears(dateString, years) {
	var newDate = new Date(dateString);
	newDate.setFullYear(newDate.getFullYear() + years);
	return jsDateToMMDDYYYY(newDate);
}

// Function to convert date object to MM/DD/YYYY format
function jsDateToMMDDYYYY(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var year = date.getFullYear();

  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    return "";
  }

  var mm = (month < 10 ? "0" : "") + month;
  var dd = (day < 10 ? "0" : "") + day;
  var yyyy = year.toString();

  return mm + '/' + dd + '/' + yyyy;
}

