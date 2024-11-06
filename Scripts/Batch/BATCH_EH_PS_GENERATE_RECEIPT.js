/*
Title: BATCH_EH_PS_GENERATE_RECEIPT
Version: 1.0
Description: Batch script run post conversion to generate receipt for payment records
Last Updated By: Aaron Williams
Last updated Date: 05/17/2024
Tip: Collapse all regions to better navigate the script: CTRL+K+0 / CMD+K+0
*/

//#region CHANGE LOG
/*  REVISIONS:
	05/17/2024 - Aaron Williams - Initial version created
*/
//#endregion

//#region SCRIPT INITIALIZERS FOR TEST SCRIPT 
/*
aa.env.setValue("CurrentUserID", "AWILLIAMS"); // used only for testing, batch job will set this value when executed from the UI
aa.env.setValue("LoggingLevel", "DEBUG");
aa.env.setValue("TestRecords", "AR0019912");
*/
//#endregion

//#region Load Environment
var SCRIPT_VERSION = "1.0";
var BATCH_NAME = "";
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS", null, true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));
var currentUserID = "ADMIN";
var enableHTMLLog = true; // change to false to disable HTML logging
//#endregion

//#region Setup Logging
var showDebug = false; //default debug is off
var loggingLevel = "INFO"; //default logging level
logMessage = function (logDesc) {
	var msg = "";
	var level = "INFO"
	var style = "";

	// Handle logging level
	if (arguments.length > 1) {
		level = arguments[1] || "INFO";
	}
	// Handle style
	if (arguments.length > 2)
		style = arguments[2];

	if (enableHTMLLog) {
		var css = "";
		switch (style) {
			case "h1":
				css = "color: blue;";
				msg = "<h1 style='" + css + "'>" + logDesc + "</h1>";
				break;
			case "h2":
				css = "color: blue;";
				msg = "<h2 style='" + css + "'>" + logDesc + "</h2>";
				break;
			case "h3":
				css = "color: blue;";
				msg = "<h3 style='" + css + "'>" + logDesc + "</h3>";
				break;
			case "code":
				css = "background: #ebe4d5; color: #172B4D; font-size: 0.875rem; line-height: 1.5rem; padding:8px; display:block;";
				msg = "<pre><code style='" + css + "'>" + logDesc + "</code></pre>";
				break;
			case "xml":
				css = "background: #ebe4d5; color: #172B4D; font-size: 0.875rem; line-height: 1.5rem; padding:8px; display:block;";
				msg = "<textarea style='" + css + "'>" + logDesc + "</textarea>";
				break;
			case "bold":
				css = "color:black; font-weight:bold;";
				msg = "<span style='" + css + "'>" + logDesc + "</span><br>";
				break;
			case "error":
				css = "color:red; font-weight:bold;";
				msg = "<span style='" + css + "'>" + logDesc + "</span><br>";
				break;
			default:
				msg = logDesc + "<BR>";
		}
	} else {
		msg = logDesc + "<BR>";
	}

	// always print INFO level and VERBOSE loggingLeval
	if (level == "INFO" || loggingLevel == "VERBOSE") {
		//aa.print(msg);
		message += msg;
	}
	// print DEBUG level if loggingLevel is DEBUG
	if (loggingLevel == "DEBUG" && level == "DEBUG") {
		//aa.print(msg);
		message += msg;
	}
}
logDebug = function (edesc) {
	if (showDebug) {
		var msg = "";
		var color = "";
		if (arguments.length > 1)
			color = arguments[1];
		if (!isBlank(color)) {
			msg = "<font color='" + color + "' size=4>" + edesc + "</font><BR>";
		} else {
			msg = edesc + "<BR>";
		}
		logMessage(msg);
	}
}
//#endregion

//#region Initilize Batch Parameters
var loggingLevel = aa.env.getValue("LoggingLevel");
var testRecords = aa.env.getValue("TestRecords");
//#endregion

//#region Batch Globals
if (loggingLevel == "VERBOSE") {
	// If logging level is VERBOSE, show debug
	showDebug = true;
}
var batchJobName = aa.env.getValue("batchJobName");
if (isBlank(batchJobName))
	batchJobName = "BATCH_EH_PS_GENERATE_RECEIPT";
var maxSeconds = 5 * 60; // number of seconds allowed for batch processing, usually < 5*60
var startDate = new Date();
var timeExpired = false;
var startTime = new Date().getTime();
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var servProvCode = aa.getServiceProviderCode();
var capId = null;
var altId = "";
var cntTotalRecords = 0;
var cntProcessed = 0;
var cntSuccess = 0;
var cntFailed = 0;
var exceptionLogs = new Array();

//#endregion

//#region Start Logging
logMessage("Executing Batch Job: " + batchJobName + " - v" + SCRIPT_VERSION, "INFO", "h1");
logMessage("Start Time: " + startDate);

// log batch parameters
logMessage("Batch Parameters", "INFO", "h2");
logMessage("Logging Level: " + loggingLevel, "INFO");
logMessage("Test Records: " + testRecords, "INFO");

if (!isBlank(testRecords))
	logMessage("The batch will only process test records: " + testRecords, "INFO", "error");
//#endregion

//#region Main Process
// execute the main process

try {
	if (!timeExpired) mainProcess();
} catch (err) {
	logMessage("Error: " + err, "INFO", "error");
}

logMessage("End of Job: Elapsed Time : " + elapsed() + " Seconds");

// Script result for script test
var scriptResult = message;
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", scriptResult);

function mainProcess() {

	// Main Process Logic
	logMessage("Executing Main Process", "INFO", "h2");

	// First null out converted receipt numbers
	var updateResult = nullConvertedReceiptNumbers();
	logMessage("Converted Receipt Numbers Updated to NULL: " + updateResult, "INFO");

	var records = getRecords();
	cntTotalRecords = records.size();

	//Initialize a cashier session before the loop so we don't have to get it every time
	// aa.finance.getCashierSessionFromDB()
	var cashierSession = aa.finance.getCashierSessionFromDB().getOutput();

	// Process records
	for (var i = 0; i < records.size(); i++) {
		try {

			var record = records.get(i);
			var sourceRecordId = record.get("B1_ALT_ID");
			var paymentSeqNbr = record.get("PAYMENT_SEQ_NBR");

			logMessage("Processing Facility Record: " + sourceRecordId, "INFO", "bold");
			cntProcessed++;

			// transfer funds for record
			var result = generateReceipt(sourceRecordId, paymentSeqNbr, cashierSession);
			if (result) {
				logMessage("Successfully generated receipt for payment: " + sourceRecordId + ":" + paymentSeqNbr, "INFO");
				cntSuccess++;
			}
		} catch (e) {
			logMessage(e, "INFO", "error");
			exceptionLogs.push(sourceRecordId + " - " + e);
			cntFailed++;
		}
	}

	// Summarize results
	var holdMessage = message; // temp hold the logs so we can summarize and add to the top of the log
	message = "";
	var logSummary = generateLogSummary();
	logMessage(batchJobName + " Result Summary", "INFO", "h1")
	logMessage(logSummary);
	message = message + holdMessage; // add the logs back to the end of the log

}
//#endregion

//#region Main Process Functions

function generateReceipt(sourceRecordId, paymentSeqNbr, cashierSession) {
	logMessage("Generating receipt for: " + sourceRecordId + ":" + paymentSeqNbr, "DEBUG");

	// Initialize source capId
	// Check if source record exists, if not, throw an error
	var sourceCapId = aa.cap.getCapID(sourceRecordId).getOutput();

	// check the cashier session
	var thisCashierSession = cashierSession;
	if (!thisCashierSession) {
		throw new Error("Cashier Session not found.");
	}
	var cashierID = thisCashierSession.userID;
	var registerNbr = thisCashierSession.terminalID;

	//Get Payment Script Model for the source payment
	//aa.finance.getPaymentByPK(com.accela.aa.aamain.cap.CapIDModel capID, long paymentSeqNbr, java.lang.String callerId)
	var sourcePaymentScriptModel = aa.finance.getPaymentByPK(sourceCapId, paymentSeqNbr, currentUserID).getOutput();
	if (!sourcePaymentScriptModel) {
		throw new Error("Source Payment not found: " + sourceRecordId + " - " + paymentSeqNbr);
	}
	var paymentDate = sourcePaymentScriptModel.paymentDate;

	// Generate the receipt
	// aa.finance.generateReceipt(com.accela.aa.aamain.cap.CapIDModel capID, com.accela.aa.emse.util.ScriptDateTime paymentDate, long paymentNbr, java.lang.String cashierID, java.lang.String registerNbr)
	var result = aa.finance.generateReceipt(sourceCapId, paymentDate, paymentSeqNbr, cashierID, registerNbr);
	if (!result.getSuccess()) {
		throw new Error("Error generating receipt: " + result.getErrorMessage());
	}

	return true;
}

function getRecords() {
	// Get records to process
	var output;
	try {

		// SQL Query
		var sql = "SELECT A.B1_ALT_ID ";
		sql += " ,F4P.PAYMENT_SEQ_NBR ";
		sql += " ,F4P.RECEIPT_NBR ";
		sql += " FROM F4PAYMENT F4P ";
		sql += " INNER JOIN B1PERMIT A ON 1=1 ";
		sql += " AND A.SERV_PROV_CODE = F4P.SERV_PROV_CODE ";
		sql += " AND A.B1_PER_ID1 = F4P.B1_PER_ID1 ";
		sql += " AND A.B1_PER_ID2 = F4P.B1_PER_ID2 ";
		sql += " AND A.B1_PER_ID3 = F4P.B1_PER_ID3 ";
		sql += " WHERE 1=1 ";
		sql += " AND A.SERV_PROV_CODE = '$$ServProvCode$$' ";
		sql += " AND A.B1_PER_GROUP = 'EnvHealth' ";
		sql += " AND A.B1_PER_ID1 LIKE '%D2A' ";
		sql += " AND (A.B1_ALT_ID LIKE 'FA%' OR A.B1_ALT_ID LIKE 'AR%') ";
		sql += " AND F4P.RECEIPT_NBR IS NULL ";
		sql += " AND F4P.PAYMENT_SEQ_NBR <= 201046"

		// add test records
		if (!isBlank(testRecords)) {
			var testRecordsArray = testRecords.split(",");
			var testRecordsString = "";
			testRecordsArray.forEach(function (record) {
				testRecordsString += "'" + record + "',";
			});
			testRecordsString = testRecordsString.slice(0, -1); // remove last comma
			sql += " AND A.B1_ALT_ID IN (" + testRecordsString + ")";
		}

		// order by source record ID
		sql += " ORDER BY A.B1_ALT_ID";

		// replace parameters in sql
		sql = sql.replace("$$ServProvCode$$", aa.getServiceProviderCode());

		// execute sql
		logMessage("Executing Select Records Query: ", "DEBUG");
		logMessage(sql, "DEBUG", "code");
		var result = aa.db.select(sql, []);

		if (!result.getSuccess()) {
			throw "Error executing SQL: " + result.getErrorMessage();
		}

		output = result.getOutput();

		if (output && output.size() > 0) {
			logMessage("Records Found: " + output.size(), "INFO");
		} else {
			logMessage("No records found.", "INFO", "error");
		}

	} catch (e) {
		throw new Error("Error executing SQL Query: " + e);
	}

	return output;

}

function nullConvertedReceiptNumbers() {
	
	var sql = "UPDATE F4PAYMENT ";
	sql += " SET RECEIPT_NBR = NULL ";
	sql += " WHERE SERV_PROV_CODE = '$$ServProvCode$$' ";
	sql += " AND RECEIPT_NBR IS NOT NULL ";
	sql += " AND B1_PER_ID1 LIKE '%D2A' ";
	sql += " AND PAYMENT_SEQ_NBR <= 201046";

	// replace parameters in sql
	sql = sql.replace("$$ServProvCode$$", aa.getServiceProviderCode());

	// execute sql
	logMessage("Executing Null Receipt Numbers Query: ", "DEBUG");
	logMessage(sql, "DEBUG", "code");
	var result = aa.db.update(sql, []);
	
	if (!result.getSuccess()) {
		throw "Error executing SQL update to null receipt numbers: " + result.getErrorMessage();
	}

	return result.getOutput();
}

//#endregion
//#region Helper Functions
function generateLogSummary() {

	var logSummary = "";
	logSummary += "Date: " + startDate + "<\BR>";
	logSummary += "User: " + aa.env.getValue("CurrentUserID") + "<\BR>";

	// Add elapsed time
	var totalElapsed = elapsed();
	var minutes = Math.floor(totalElapsed / 60);
	var seconds = Math.round(totalElapsed % 60);
	var elapsedTime = minutes + " m " + (seconds < 10 ? "0" : "") + seconds + " s";
	logSummary += "Elapsed Time: " + elapsedTime + "<BR><BR>";

	logSummary += "# Total Records: " + cntTotalRecords + "<\BR>";
	logSummary += "# Processed: " + cntProcessed + "<\BR>";
	logSummary += "# Succeeded: " + cntSuccess + "<\BR>";
	logSummary += "# Failed: " + cntFailed + "<\BR><\BR>";

	if (exceptionLogs.length > 0) {
		logSummary += "Exceptions: " + exceptionLogs.length + "<\BR>";
		exceptionLogs.forEach(function (log) {
			logSummary += log + "<\BR>";
		});
	}
	return logSummary;
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

function exploreObject(objExplore) {

	logMessage("Methods:")
	for (x in objExplore) {
		if (typeof (objExplore[x]) == "function") {
			logMessage("<font color=blue><u><b>" + x + "</b></u></font> ");
			logMessage("   " + objExplore[x] + "<br>");
		}
	}

	logMessage("");
	logMessage("Properties:")
	for (x in objExplore) {
		if (typeof (objExplore[x]) != "function") logMessage("  <b> " + x + ": </b> " + objExplore[x]);
	}

}

function elapsed() {
	var thisTime = new Date().getTime();
	return (thisTime - startTime) / 1000;
}
//#endregion