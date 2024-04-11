/*------------------------------------------------------------------------------------------------------/
| Program : ACA WWM RD APP DOC ATTACHED.js
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
var showMessage = false; 
var showDebug = false;							// Set to true to see debug messages in popup window
var preExecute = "PreExecuteForBeforeEvents"
//var controlString = "";    
var documentOnly = false;                                                               
var disableTokens = false;                                                                                          
var useAppSpecificGroupName = false;                                 
var useTaskSpecificGroupName = false;                                            
var enableVariableBranching = false; 
var maxEntries = 99; // Maximum number of std choice entries.  Entries must be Left Zero Padded
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message =   ""; 
var debug = "";
var br = "<BR>"; 
var feeSeqList = new Array(); 
var paymentPeriodList = new Array();

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
var servProvCode = capId.getServiceProviderCode()                                     
var publicUser = false ;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) { currentUserID = "ADMIN" ; publicUser = true }  
var capIDString = capId.getCustomID();                                                                 
var systemUserObj = aa.person.getUser(currentUserID).getOutput();  
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();                                                  
var appTypeArray = appTypeString.split("/");                                                      
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0],currentUserID).getOutput()
if (currentUserGroupObj) currentUserGroup = currentUserGroupObj.getGroupName();
var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(),sysDate.getDayOfMonth(),sysDate.getYear(),"");
var parcelArea = 0;

var estValue = 0; var calcValue = 0; var feeFactor                                               
var valobj = aa.finance.getContractorSuppliedValuation(capId,null).getOutput();              
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
}

var balanceDue = 0 ; var houseCount = 0; feesInvoicedTotal = 0;                            
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId);                                   
if (capDetailObjResult.getSuccess())
{
                capDetail = capDetailObjResult.getOutput();
                var houseCount = capDetail.getHouseCount();
                var feesInvoicedTotal = capDetail.getTotalFee();
                var balanceDue = capDetail.getBalance();
}

var AInfo = new Array();
loadAppSpecific4ACA(AInfo);                                                                              
//loadTaskSpecific(AInfo);                                                                                          
//loadParcelAttributes(AInfo);                                                                                 
//loadASITables4ACA();
/*
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
*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| END Event Specific Variables
/------------------------------------------------------------------------------------------------------*/

if (preExecute.length) doStandardChoiceActions(preExecute,true,0);    // run Pre-execution code

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

    var vehReg = determineACADocumentAttached("Vehicle Registration");
	var vehIns = determineACADocumentAttached("Vehicle Insurance");    
    var disSite = determineACADocumentAttached("Disposal Site Authorization");
    var disIns = determineACADocumentAttached("Disability Insurance");
    var workerComp = determineACADocumentAttached("Workers Comp Insurance");

    if(!vehReg || !vehIns || !disSite || !disIns || !wrokerComp)
    {       
        cancel = true;
        showMessage = true;
        comment("You cannot proceed until all the required document types are provided (see below for required documents). When uploading documents, verfiy the correct document 'type' is selected. The following document types are still required:");
        if (!vehReg)                
        { 
            cancel = true;
            showMessage = true;
            comment("Vehicle Registration");        
		} 
		if(!vehIns)
        {
            cancel = true;
            showMessage = true;
            comment("Vehicle Insurance");
        }       
        if(!disSite)
        {
            cancel = true;
            showMessage = true;
            comment("Disposal Site Authorization");
        }
        if(!disIns)
        {
            cancel = true;
            showMessage = true;
            comment("Disability Insurance");
        }
        if(!workerComp)
        {
            cancel = true;
            showMessage = true;
            comment("Workers Comp Insurance");
        }
    }  
    
    

} 
catch (err) { logDebug(err)	}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
}
else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
    else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
} 
/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| Custom Functions (End)
/------------------------------------------------------------------------------------------------------*/
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

function determineACADocumentAttached(docType) 
{
    var docList = aa.document.getDocumentListByEntity(capId, "TMP_CAP");
    if (docList.getSuccess()) 
	{
        docsOut = docList.getOutput();
		logDebug("Docs Out " + docsOut.isEmpty());
        if (docsOut.isEmpty()) 
		{
            return false;
        }
        else 
		{
            attach = false;
            docsOuti = docsOut.iterator();
            while (docsOuti.hasNext()) 
			{
                doc = docsOuti.next();
			//	debugObject(doc);
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