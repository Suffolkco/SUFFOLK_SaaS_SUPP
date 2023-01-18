/**
 * Record_Name: ACA Record Validation (APCD)
 * Story Number: 1
 * Developer: Accela - jtu@accela.com
 * 
 * Date: January 8, 2018
 */
/**
 *
 * An entry needs to be made for a Custom List based on a custom field value.
 *
 */
var customFieldName = "Number of Events";
var customTableName = "EVENT INFORMATION";

var asiValue = null;
var asitRowsCount = null;

var needValidate = false;
var isPublicUser = false;

var capp = aa.env.getValue("CapModel");
asiValue = getFieldValue(customFieldName, capp);
var asitRows = getASITableRows(customTableName, capp);
asitRowsCount = asitRows.length;

if (asiValue != null && asitRowsCount != null) {
	if (asiValue == 1) {
		if (asitRowsCount != 1) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 2) {
		if (asitRowsCount != 2) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 3) {
		if (asitRowsCount != 3) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 4) {
		if (asitRowsCount != 4) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 5) {
		if (asitRowsCount != 5) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 6) {
		if (asitRowsCount != 6) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 7) {
		if (asitRowsCount != 7) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 8) {
		if (asitRowsCount != 8) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 9) {
		if (asitRowsCount != 9) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		if (asiValue == 10) {
		if (asitRowsCount != 10) {
			var validation = customFieldName + " is (" + asiValue + ") and " + customTableName + " does not have the same number of rows.";
			cancel = true;
			aa.env.setValue("ErrorCode", "1");
			aa.env.setValue("ErrorMessage", validation);
		}//asitRows == 0
		
	}//asi value match
}//record fields !null

function getFieldValue(fieldName, capp) {
	var asiGroups = null;

	try {
		asiGroups = capp.getAppSpecificInfoGroups();
	} catch (ex) {
		cancel = true;
		aa.env.setValue("ErrorCode", "1");
		aa.env.setValue("ErrorMessage", "Error getFieldValue(): " + ex);
	}

	if (asiGroups == null) {
		return null;
	}

	var iteGroups = asiGroups.iterator();
	while (iteGroups.hasNext()) {
		var group = iteGroups.next();
		var fields = group.getFields();
		if (fields != null) {
			var iteFields = fields.iterator();
			while (iteFields.hasNext()) {
				var field = iteFields.next();
				if (fieldName == field.getCheckboxDesc()) {
					return field.getChecklistComment();
				}
			}
		}
	}
	return null;
}

function getASITableRows(tableName, capp) {

	var gm = capp.getAppSpecificTableGroupModel();

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
	return new Array();
}
