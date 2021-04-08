// ASB:CONSUMERAFFAIRS/LICENSES/*/*
// CONSUMERAFFAIRS/LICENSES/Appliance Repair/NA
// CONSUMERAFFAIRS/LICENSES/Home Improvement/NA
// CONSUMERAFFAIRS/LICENSES/Liquid Waster/NA
// CONSUMERAFFAIRS/LICENSES/Restricted Electrical/NA
// CONSUMERAFFAIRS/LICENSES/Restricted Plumbing/NA


// BANK ACCOUNTS
// RESTRICTIONS 
// EMPLOYMENT 
// EDUCATION 



var validationMessage = "";
var asitBankAccounts = getASITBefore('BANK ACCOUNTS');
var asitRestrictions = getASITBefore('RESTRICTIONS');
var asitEmployment = getASITBefore('EMPLOYMENT');
var asitEducation = getASITBefore('EDUCATION');

var isPublicUser = false;
if (typeof publicUser === 'undefined') {
	isPublicUser = currentUserID.indexOf("PUBLICUSER") == 0;
} else {
	isPublicUser = publicUser;
}

var msgMissingBank = "At least one row is required in Bank Accounts list.<br/>";
var msgMissingRestrict = "At least one row is required in Restrictions list.<br/>";
var msgMissingEmployment = "At least one row is required in Employment list.<br/>";
var msgMissingEdu = "At least one row is required in Education list.<br/>";

if(ApplicationTypeLevel3.equalsIgnoreCase('Restricted Electrical') || ApplicationTypeLevel3.equalsIgnoreCase('Restricted Plumbing') || ApplicationTypeLevel3.equalsIgnoreCase('Master Plumber') || ApplicationTypeLevel3.equalsIgnoreCase('Master Electrician')){ 
    if(asitBankAccounts == null || asitBankAccounts.length <= 0){
        validationMessage += msgMissingBank;
    }
    if(asitRestrictions == null || asitRestrictions.length <= 0){
        validationMessage += msgMissingRestrict;
    }
    if(asitEmployment == null || asitEmployment.length <= 0){
        validationMessage += msgMissingEmployment;
    }
    if(asitEducation == null || asitEducation.length <= 0){
        validationMessage += msgMissingEdu;
    }
}


if(ApplicationTypeLevel3.equalsIgnoreCase('Appliance Repair') || ApplicationTypeLevel3.equalsIgnoreCase('Home Improvement')|| ApplicationTypeLevel3.equalsIgnoreCase('Liquid Waste')){
    if(asitBankAccounts == null || asitBankAccounts.length <= 0){
        validationMessage += msgMissingBank;
    }
    if(asitRestrictions == null || asitRestrictions.length <= 0){
        validationMessage += msgMissingRestrict;
    }
}

if (validationMessage != "") {
    showMessage = true;
    cancel = true;
  
        comment(validationMessage);
    }

/**
 * this function will return the ASIT on the application submit before event.
 * @param asitName the name of the ASIT
 * @returns the ASIT object if exists else will returns null
 */
 function getASITBefore(asitName) {
	var gm = aa.env.getValue("AppSpecificTableGroupModel");
	var gmItem = gm;

	if (null != gmItem && gmItem != "") {
		var ta = gmItem.getTablesMap().values();
		var ASITArray = ta.toArray();
		for ( var x in ASITArray) {
			var tsm = ASITArray[x];
			var tn = tsm.getTableName();
			if (tn != asitName)
				continue;
			if (tsm.rowIndex.isEmpty())
				continue;
			var tempObject = new Array;
			var tempArray = new Array;
			var numrows = 0;
			if (!tsm.rowIndex.isEmpty()) {
				var tsmfldi = tsm.getTableField().iterator();
				var tsmcoli = tsm.getColumns().iterator();
				var numrows = 1;
				while (tsmfldi.hasNext()) {
					if (!tsmcoli.hasNext()) {
						var tsmcoli = tsm.getColumns().iterator();
						tempArray.push(tempObject);
						var tempObject = new Array;
						numrows++
					}
					var tcol = tsmcoli.next();
					var tval = tsmfldi.next();
					var readOnly = "N";
					var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
					tempObject[tcol.getColumnName()] = fieldInfo
				}

				tempArray.push(tempObject);

				if (tn == asitName) {
					return tempArray;
				} else {
					return null;
				}
			}
		}
	}

	return null;
}