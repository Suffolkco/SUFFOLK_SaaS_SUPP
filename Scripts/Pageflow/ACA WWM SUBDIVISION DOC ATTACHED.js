/*------------------------------------------------------------------------------------------------------/
| Program : ACA OPC TANK APP DOC ATTACHED.js
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
loadAppSpecific4ACA(AInfo); 						// Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
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
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);

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
    var conCheck = false;
    var servCheck = false;
    var samCheck = false;

	var mapCheck = determineACADocumentAttached("Subdivision/Development Map");
	var siteCheck = determineACADocumentAttached("Site Plan");
	var certCheck = determineACADocumentAttached("Certificate of Authorization/Exemption");    
    var appCheck = determineACADocumentAttached("Application Checklist");
	var seaCheck = determineACADocumentAttached("Short Environmental Assessment Form");
	var bor = AInfo["Are you applying for a Board of Review (BOR) hearing at this time? If yes, submit form WWM-061"];
	var borCheck = false;

	
    if(!mapCheck || !siteCheck || !certCheck || !appCheck || !seaCheck)
    {       
        cancel = true;
        showMessage = true;
		comment("Missing required documents for this application. Before you can save this application, you must attach the following documents:");
		if (!mapCheck)                
        { 
            cancel = true;
            showMessage = true;
            comment("Subdivision/Development Map");        
		} 
        if (!siteCheck)                
        { 
            cancel = true;
            showMessage = true;
            comment("Site Plan");        
		} 
		if(!certCheck)
        {
            cancel = true;
            showMessage = true;
            comment("Certificate of Authorization/Exemption");
        }       
        if(!appCheck)
        {
            cancel = true;
            showMessage = true;
            comment("Application Checklist");
		}
		
		if(!seaCheck)
        {
            cancel = true;
            showMessage = true;
            comment("Short Environmental Assessment Form");
        }
	}   
	borCheck = determineACADocumentAttached("Board of Review Application");
	if (bor == "Yes")
	{		 	
		if (!borCheck)
		{
			cancel = true;
			showMessage = true;
			comment("Section 2 indicates you're applying for a Board of Review hearing and a BOR Application is required - upload from WWM-061.");
		}
	}
	else
	{
		if (borCheck)
		{
			showMessage = true;			
			comment("A BOR application was attached; however, previous page(s) indicate that you are not applying for a BOR hearing at this time - your BOR application will not be processed unless you indicate on previous page(s) that you are applying for a BOR hearing.");
		}
	}
} catch (err) { logDebug(err)	}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/


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

function determineACADocumentAttached(docType) 
{
    var docList = aa.document.getDocumentListByEntity(capId, "TMP_CAP");
    if (docList.getSuccess()) 
	{
        docsOut = docList.getOutput();
		logDebug("Docs Out " + docsOut.isEmpty());
        if (docsOut.isEmpty()) 
		{
            logDebug("here");
            return false;
        }
        else 
		{
            attach = false;
            docsOuti = docsOut.iterator();
            while (docsOuti.hasNext()) 
			{
                doc = docsOuti.next();
				//debugObject(doc);
                docCat = doc.getDocCategory();
                if (docCat.equals(docType)) 
				{
                    attach = true;
                }
            }
            if (attach) 
			{
                return true;
            }
            else 
			{
                return false;
            }
        }
    }
    else 
	{
        return false;
    }
}
function determineAnyACADocumentAttached() 
{
    var docList = aa.document.getDocumentListByEntity(capId, "TMP_CAP");
    if (docList.getSuccess()) 
	{
        docsOut = docList.getOutput();
		logDebug("Docs Out " + docsOut.isEmpty());
        if (docsOut.isEmpty()) 
		{
            logDebug("here");
            return false;
        }
        else 
		{
           
            return true;
            
        }
    }
    else 
	{
        return false;
    }
}