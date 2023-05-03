 /*------------------------------------------------------------------------------------------------------/
| Program : ACA TAX MAP VALIDATION.js
| Event   : ACA_Before
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false;						// Set to true to see results in popup window
var showDebug = false;							// Set to true to see debug messages in popup window
var preExecute = "PreExecuteForBeforeEvents"
//var controlString = "";		// Standard choice for control
var documentOnly = false;						// Document Only -- displays hierarchy of std choice steps
var disableTokens = false;						// turn off tokenizing of std choices (enables use of "{} and []")
var useAppSpecificGroupName = false;			// Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false;			// Use Group name when populating Task Specific Info Values
var enableVariableBranching = false;			// Allows use of variable names in branching.  Branches are not followed in Doc Only
var maxEntries = 99;							// Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message =	"";							// Message String
var debug = "";								// Debug String
var br = "<BR>";							// Break Tag
var feeSeqList = new Array();						// invoicing fee list
var paymentPeriodList = new Array();					// invoicing pay periods

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); 
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 
	useSA = true; 	
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 
	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
}

if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA));
	eval(getScriptText(SAScript,SA));
}
else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_CUSTOM"));

if (documentOnly) {
	doStandardChoiceActions(controlString,false,0);
	aa.env.setValue("ScriptReturnCode", "0");
	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");
	aa.abortScript();
}

function getScriptText(vScriptName){
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1) servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();	
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode,vScriptName,"ADMIN");
		return emseScript.getScriptText() + "";	
	} catch(err) {
		return "";
	}
}

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode()       		// Service Provider Code
var publicUser = false ;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  // ignore public users
var capIDString = capId.getCustomID();					// alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  	// Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();				// Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");				// Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor			// Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();	// Calculated valuation
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
}

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;		// Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);			// Detail
if (capDetailObjResult.getSuccess())
{
	capDetail = capDetailObjResult.getOutput();
	var houseCount = capDetail.getHouseCount();
	var feesInvoicedTotal = capDetail.getTotalFee();
	var balanceDue = capDetail.getBalance();
}

var AInfo = new Array();						// Create array for tokenized variables
//loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
loadParcelAttributes(AInfo);						// Add parcel attributes
//loadASITables4ACA();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
//logDebug("estValue = " + estValue);
//logDebug("calcValue = " + calcValue);
//logDebug("feeFactor = " + feeFactor);

//logDebug("houseCount = " + houseCount);
//logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
//logDebug("balanceDue = " + balanceDue);



/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute,true,0); 	// run Pre-execution code

logGlobals(AInfo); 
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

try
{
	var emailText ="";
	var parcelObj = cap.getParcelModel();
	if (!parcelObj)
	{ logDebug("No parcel to get attributes"); 
	}
	else
	{
		/*   logDebug("Parcel No: " + parcelObj.getParcelNo());
			logDebug("Parcel Number: " + parcelObj.getParcelNumber());
			logDebug("UID: " + parcelObj.getUID());
			logDebug("getL1ParcelNo: " + parcelObj.getL1ParcelNo());

		logDebug("Parcelobj:" + parcelObj);
		for (property in parcelObj) {
			logDebug("Property:" + parcelObj[property]);
			
		}*/
		var parcelNo = parcelObj.getParcelNumber();
		logDebug("parcelNo:" + parcelNo);
		
		if (parcelNo != null)
		{
			logDebug("Data Entry - Parcel No: " + parcelNo + ", Length: " + parcelNo.length());			
			
			var parcelTxt = new String(parcelNo);

			noSpaceParcelNo = parcelTxt.replace(/\s/g, '');	
			
			var numeric = /^\d+$/.test(noSpaceParcelNo);
			//var numeric = isNumeric(noSpaceParcelNo);

			logDebug("numeric? " + numeric);
			var length = noSpaceParcelNo.length;
			logDebug("Removed space- Parcel No: " + noSpaceParcelNo + ", Length: " + length);
			logDebug("ParcelNo: " + noSpaceParcelNo + ", " + length);
			if (length != 19 || !numeric)        
			{            
				cancel = true;
				showMessage = true;

				comment("You have entered the wrong Parcel (Tax Map) Number.");
				if (length != 19)
				{
					comment ("Parcel (Tax Map) Number must be 19 digits; you entered " + length + " digits.");
				}
				if (!numeric)
				{
					comment ("Parcel (Tax Map) Number must be a number. Your entry has included a non-numeric value.");
				}
				comment ("Please see instructional note in Parcel Section.");
			}				
		}
	}
	logDebug("Debug info: " + (debug.indexOf("**ERROR")));
	aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "ACA TAX MAP VALIDATION", emailText);
	
	
		//Adding Min 1 row validation for SIP records on property owners
	//Checking SIP Record
	if(appMatch("DEQ/Ecology/SIP/Application"))
	{	
		var appSpecificInfo = new Array();
		loadAppSpecific4ACA(appSpecificInfo);
			var asitRows = getASITable4ACA("DEQ_SIP_PROPERTY_OWNER");
			if (!asitRows || asitRows.length == 0) 
			{
				cancel = true;
				showMessage = true;
				comment("Please enter at least one deeded property owner information below in order to continue");
			}
	}

}
catch (ex)
{
	logDebug("**ERROR** runtime error " + ex.message);
	comment ("Pease see instructional note in Parcel Section." + message);
	
}

 //push.   


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function isNumeric(str) {
	if (typeof str != "string") return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		   !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
	}
else
	{
	if (cancel)
		{
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage) aa.env.setValue("ErrorMessage", message);
		if (showDebug) 	aa.env.setValue("ErrorMessage", debug);
		}
	else
		{
		aa.env.setValue("ErrorCode", "0");
		if (showMessage) aa.env.setValue("ErrorMessage", message);
		if (showDebug) 	aa.env.setValue("ErrorMessage", debug);
		}
	}

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| Custom Functions (End)
/------------------------------------------------------------------------------------------------------*/
function logDebug(dstr)
{
	//if (showDebug.substring(0,1).toUpperCase().equals("Y"))
	if(showDebug)
	{
		aa.print(dstr)
		emailText+= dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}

function parcelExistsOnCap()
{
	// Optional parameter, cap ID to load from
	//

	var itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

	var fcapParcelObj = null;
	var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
	if (capParcelResult.getSuccess())
		var fcapParcelObj = capParcelResult.getOutput().toArray();
	else
		{ logDebug("**ERROR: Failed to get Parcel object: " + capParcelResult.getErrorType() + ":" + capParcelResult.getErrorMessage()); return false; }

	for (i in fcapParcelObj)
	{
		return true;
	}

	return false;
}

function debugObject(object) {
    var output = ''; 
    for (property in object) { 
      output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
    } 
    logDebug(output);
    aa.sendEmail("ada.chan@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "debugObject Log", output, null);

} 

function getParcel(capId)
{
  capParcelArr = null;
  var s_result = aa.parcel.getParcelandAttribute(capId, null);
  if(s_result.getSuccess())
  {
    capParcelArr = s_result.getOutput();
    if (capParcelArr == null || capParcelArr.length == 0)
    {
      aa.print("WARNING: no parcel on this CAP:" + capId);
      capParcelArr = null;
    }
  }
  else
  {
    aa.print("ERROR: Failed to parcel: " + s_result.getErrorMessage());
    capParcelArr = null;  
  }
  return capParcelArr;
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