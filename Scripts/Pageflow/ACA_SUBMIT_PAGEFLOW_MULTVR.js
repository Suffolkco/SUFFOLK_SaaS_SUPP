/*------------------------------------------------------------------------------------------------------/
| Program		: ACA_FIRE_CONST_PERMIT_CHECK_ASIT_ROWS
| Event			: ACA_OnBefore
|
| Usage			: validate required ASIT based on ASI
|
| Client		: SUFFOLKCO
| Created by	: Ron Kovacs
| Created On	: 10/06/2022
|
| Notes			: Item 215 G8 require ASIT row quantity based on ASI # quantity
/------------------------------------------------------------------------------------------------------*/
showDebug = false;
/*------------------------------------------------------------------------------------------------------/
| DO NOT EDIT BELOW THIS POINT
/------------------------------------------------------------------------------------------------------*/
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_CUSTOM"));
var SCRIPT_VERSION = 9.0;

var message = "";
var br = "<br>";
var debug = ""; // Debug String
var err = "";
var useAppSpecificGroupName = false;

var cancel = false;
var capModel = aa.env.getValue('CapModel');
var capId = capModel.getCapID();
cap = capModel;

try {
	var appSpecificInfo = new Array();
	loadAppSpecific4ACA(appSpecificInfo);
	var eventNumber = appSpecificInfo["Number of Events"];
	
	var asitRows = getASITable4ACA("EVENT INFORMATION");
	if ((!asitRows || asitRows.length == 0) && asitRows.length != (parseInt(eventNumber))) {
		cancel = true;
		message += "<font color=red>Please enter the same number of events as rows below as is in the 'Number of Events' field above. </font>" + br;
	}
	var appSpecificInfo = new Array();
loadAppSpecific4ACA(appSpecificInfo);
	var asitRows = getASITable4ACA("FOOD SOURCE INFORMATION");
	if (!asitRows || asitRows.length == 0) {
		cancel = true;
		message += "<font color=red>Please enter at least one Food Service item below in order to continue. </font>" + br;
	}
		var appSpecificInfo = new Array();
loadAppSpecific4ACA(appSpecificInfo);
	var asitRows = getASITable4ACA("MENU AND PREPARATION");
	if (!asitRows || asitRows.length == 0) {
		cancel = true;
		message += "<font color=red>Please enter at least one Menu and Prep item below in order to continue. </font>" + br;
	}
} catch (err) {
	cancel = true;
	message += "A system error has occured: " + err.message;
	debug = debug + " Additional Information Required: " + err.message;
}

if (cancel) {
	cancel = true;
	showMessage = true;
	aa.env.setValue("ErrorCode", -1);
	aa.env.setValue('ErrorMessage', '<br><font color=#D57C55><b>' + message + '</b></font>');
}

/************************************************************
| FUNCTION USED BY THIS SCRIPT - DO NOT REMOVE/EDIT
 ************************************************************/
/************************************************************
 * Imports all Accela custom functions.
 *
 * 	@param vScriptName - Script to import
 * 	@returns {String}
 ************************************************************/
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

//***********************************************************************
//------------------------HELPER FUNCTIONS-------------------------------
//***********************************************************************
function exists(eVal, eArray) {
	for (ii in eArray) {
		if (eArray[ii] == eVal)
			return true;
	}

	return false;
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}

	return false;
}

function getAppSpecificInfo(capId) {
	capAppSpecificInfo = null;
	var s_result = aa.appSpecificInfo.getByCapID(capId);

	if (s_result.getSuccess()) {
		capAppSpecificInfo = s_result.getOutput();

		if (capAppSpecificInfo == null || capAppSpecificInfo.length == 0) {
			aa.print("WARNING: no appSpecificInfo on this CAP:" + capId);
			capAppSpecificInfo = null;
		}
	} else {
		aa.print("ERROR: Failed to appSpecificInfo: " + s_result.getErrorMessage());
		capAppSpecificInfo = null;
	}
	// Return AppSpecificInfoModel[]
	return capAppSpecificInfo;
}

function loadAppSpecific4ACA(thisArr) {
	// Returns an associative array of App Specific Info
	// Optional second parameter, cap ID to load from
	//
	// uses capModel in this event

	var itemCap = capId;

	if (arguments.length >= 2) {
		itemCap = arguments[1]; // use cap ID specified in args

		var fAppSpecInfoObj = aa.appSpecificInfo.getByCapID(itemCap).getOutput();

		for (loopk in fAppSpecInfoObj) {
			if (useAppSpecificGroupName) {
				thisArr[fAppSpecInfoObj[loopk].getCheckboxType() + "." + fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
			} else {
				thisArr[fAppSpecInfoObj[loopk].checkboxDesc] = fAppSpecInfoObj[loopk].checklistComment;
			}
		}
	} else {
		var capASI = capModel.getAppSpecificInfoGroups();

		if (!capASI) {
			logDebug("No ASI for the CapModel");
		} else {
			var i = capModel.getAppSpecificInfoGroups().iterator();
			while (i.hasNext()) {
				var group = i.next();
				var fields = group.getFields();

				if (fields != null) {
					var iteFields = fields.iterator();
					while (iteFields.hasNext()) {
						var field = iteFields.next();

						if (useAppSpecificGroupName) {
							thisArr[field.getCheckboxType() + "." + field.getCheckboxDesc()] = field.getChecklistComment();
						} else {
							thisArr[field.getCheckboxDesc()] = field.getChecklistComment();
						}
					}
				}
			}
		}
	}
}

function checkForLPs() {
	var capLPResult = capModel.getLicenseProfessionalList();

	if (capLPResult != null && !capLPResult.isEmpty()) {
		var capLPsArray = capLPResult.toArray();

		/*	CHECK AND FLAG UPLOADED DOCUMENTS */
		for (lp in capLPsArray) {
			primaryContractor = capLPsArray[lp].getLicenseType();

			if (exists(capLPsArray[lp].getLicenseType(), allowedContractorTypes)) {
				//debug += lp + ".- LICENSE TYPE FOUND: " + capLPsArray[lp].getLicenseType() + " for Accessory Type: " + accessoryType + br;
				allowApplication = true;
				break;
			}
		}
	} else {
		cancel = true;
		showMessage = true;
		noLpsfound = true;
	}
}

function getASITable4ACA(tableName) {
	var gm = null;
	if (String(cap.getClass()).indexOf("CapScriptModel") != -1) {
		gm = cap.getCapModel().getAppSpecificTableGroupModel();
	} else {
		gm = cap.getAppSpecificTableGroupModel();
	}
	if (gm == null) {
		return false;
	}
	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();
	while (tai.hasNext()) {
		var tsm = tai.next();
		if (tsm.rowIndex.isEmpty())
			continue;

		var asitRow = new Array;
		var asitTables = new Array;
		var tn = tsm.getTableName();
		if (tn != tableName) {
			continue;
		}

		var tsmfldi = tsm.getTableField().iterator();
		var tsmcoli = tsm.getColumns().iterator();
		while (tsmfldi.hasNext()) {

			var tcol = tsmcoli.next();
			var tval = tsmfldi.next();

			asitRow[tcol.getColumnName()] = tval;

			if (!tsmcoli.hasNext()) {
				tsmcoli = tsm.getColumns().iterator();
				asitTables.push(asitRow);
				asitRow = new Array;
			}
		}
		return asitTables;
	}
	return false;
}
