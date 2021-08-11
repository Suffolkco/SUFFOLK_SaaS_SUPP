/*------------------------------------------------------------------------------------------------------/
| Program:DEQ_OPC_SITE_PRESET Trigger: Batch
| 
| This batch script will run one time to All OPC SITE records 
| to first preset if there is NO TANK child
| Article 18 Regulated Site = No;PBS Regulated Site = No;
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
currentUserID = "ADMIN";
useAppSpecificGroupName = false;
/*------------------------------------------------------------------------------------------------------/
| GLOBAL VARIABLES
/------------------------------------------------------------------------------------------------------*/
br = "<br>";
debug = "";
systemUserObj = aa.person.getUser(currentUserID).getOutput();
publicUser = false;
/*------------------------------------------------------------------------------------------------------/
| INCLUDE SCRIPTS (Core functions, batch includes, custom functions)
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0;
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I")
{
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess())
    {
        SAScript = bzr.getOutput().getDescription();
    }
}

if (SA)
{
    eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
    eval(getMasterScriptText(SAScript, SA));
} else
{
    eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

function getMasterScriptText(vScriptName)
{
    var servProvCode = aa.getServiceProviderCode();
    if (arguments.length > 1)
        servProvCode = arguments[1]; // use different serv prov code
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try
    {
        var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        return emseScript.getScriptText() + "";
    } catch (err)
    {
        return "";
    }
}

function getScriptText(vScriptName)
{
    var servProvCode = aa.getServiceProviderCode();
    if (arguments.length > 1)
        servProvCode = arguments[1]; // use different serv prov code
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try
    {
        var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
        return emseScript.getScriptText() + "";
    } catch (err)
    {
        return "";
    }
}
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true;// Set to true to see debug messages in email confirmation
var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60
var showMessage = true;
var timeExpired = false;
var emailAddress = "ada.chan@suffolkcountyny.gov";
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
var pgParms = aa.env.getParamValues();
var pgParmK = pgParms.keys();
while (pgParmK.hasNext())
{
    k = pgParmK.next();
    if (k == "Send Batch log to:")
    {
        emailAddress = pgParms.get(k);
    }
}
if (batchJobResult.getSuccess()) 
{
    batchJobID = batchJobResult.getOutput();
    logDebugLocal("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
{
    logDebugLocal("Batch job ID not found " + batchJobResult.getErrorMessage());
}
/*------------------------------------------------------------------------------------------------------/
|
| START: END CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var message = "";
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var todayDate = (startDate.getMonth() + 1) + "/" + startDate.getDate() + "/" + startDate.getFullYear();
var fromDate = aa.date.parseDate("1/1/1980");
var toDate = aa.date.parseDate((new Date().getMonth() + 1) + "/" + new Date().getDate() + "/" + new Date().getFullYear());
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS//
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
var paramsOK = true;

if (paramsOK) 
{
    logDebugLocal("Start Date: " + startDate + br);
	logDebugLocal("Start Time: " + startTime + br);
    if (!timeExpired) 
    {
        mainProcess();
        //logDebugLocal("End of Job: Elapsed Time : " + elapsed() + " Seconds");
        logDebugLocal("End Date: " + startDate + br);
		logDebugLocal("End Time: " + startDate.getTime());
        aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "Batch Job - DEQ_OPC_SITE_PRESET", emailText);
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS//
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() 
{    
    try 
    {
        logDebug("Batch script will run");
        //var vSQL = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.SERV_PROV_CODE = 'SUFFOLKCO' and B1_PER_GROUP = 'DEQ' and B1.B1_PER_TYPE = 'General' and B1.B1_PER_SUB_TYPE = 'Site'and B1_PER_CATEGORY = 'NA' ";

        // SQL Article 18 No Tank Child
        /*var artNoTankSql ="SELECT DISTINCT(B.B1_ALT_ID) as recordNumber FROM B1PERMIT B JOIN BCHCKBOX C ON B.B1_PER_ID1 = C.B1_PER_ID1 AND B.B1_PER_ID2 = C.B1_PER_ID2 AND B.B1_PER_ID3 = C.B1_PER_ID3 WHERE B.REC_STATUS = 'A' AND B.SERV_PROV_CODE = 'SUFFOLKCO' AND B.B1_PER_GROUP = 'DEQ' AND B.B1_PER_TYPE = 'General' AND B.B1_PER_SUB_TYPE = 'Site' AND B.B1_PER_CATEGORY = 'NA' AND B.B1_APPL_STATUS = 'Active' AND C.B1_CHECKBOX_DESC = 'OPC' AND C.B1_CHECKLIST_COMMENT = 'CHECKED' AND B.B1_ALT_ID IN (     SELECT DISTINCT(B3.B1_ALT_ID)     FROM B1PERMIT B3 JOIN BCHCKBOX C1     ON B3.B1_PER_ID1 = C1.B1_PER_ID1     AND B3.B1_PER_ID2 = C1.B1_PER_ID2     AND B3.B1_PER_ID3 = C1.B1_PER_ID3     WHERE B3.REC_STATUS = 'A'         AND B3.SERV_PROV_CODE = 'SUFFOLKCO'     AND B3.B1_PER_GROUP = 'DEQ'     AND B3.B1_PER_TYPE = 'General'     AND B3.B1_PER_SUB_TYPE = 'Site'     AND B3.B1_PER_CATEGORY = 'NA'     AND B3.B1_APPL_STATUS = 'Active'     AND C1.B1_CHECKBOX_DESC = 'Article 18 Regulated Site'          AND C1.B1_CHECKLIST_COMMENT <> 'No' ) AND B.B1_ALT_ID NOT IN (     SELECT DISTINCT(B1.B1_ALT_ID)     FROM B1PERMIT B1     JOIN XAPP2REF XAPP     ON B1.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B1.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B1.B1_PER_ID1 = XAPP.B1_MASTER_ID1     AND B1.B1_PER_ID2 = XAPP.B1_MASTER_ID2     AND B1.B1_PER_ID3 = XAPP.B1_MASTER_ID3         JOIN B1PERMIT B2     ON B2.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B2.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B2.B1_PER_ID1 = XAPP.B1_PER_ID1     AND B2.B1_PER_ID2 = XAPP.B1_PER_ID2     AND B2.B1_PER_ID3 = XAPP.B1_PER_ID3     WHERE B1.B1_APPL_STATUS = 'Active'     AND B1.SERV_PROV_CODE = 'SUFFOLKCO'         AND B1.B1_PER_GROUP = 'DEQ'     AND B1.B1_PER_TYPE = 'General'     AND B1.B1_PER_SUB_TYPE = 'Site'     AND B1.B1_PER_CATEGORY = 'NA'     AND B2.B1_PER_GROUP = 'DEQ'     AND B2.B1_PER_TYPE = 'OPC'     AND B2.B1_PER_SUB_TYPE = 'Hazardous Tank'     AND B2.B1_PER_CATEGORY = 'Permit' )";
        // SQL PBS No Tank C hild
        var pbsNoTankSql = "SELECT DISTINCT(B.B1_ALT_ID) as recordNumber FROM B1PERMIT B JOIN BCHCKBOX C ON B.B1_PER_ID1 = C.B1_PER_ID1 AND B.B1_PER_ID2 = C.B1_PER_ID2 AND B.B1_PER_ID3 = C.B1_PER_ID3 WHERE B.REC_STATUS = 'A' AND B.SERV_PROV_CODE = 'SUFFOLKCO' AND B.B1_PER_GROUP = 'DEQ' AND B.B1_PER_TYPE = 'General' AND B.B1_PER_SUB_TYPE = 'Site' AND B.B1_PER_CATEGORY = 'NA' AND B.B1_APPL_STATUS = 'Active' AND C.B1_CHECKBOX_DESC = 'OPC' AND C.B1_CHECKLIST_COMMENT = 'CHECKED' AND B.B1_ALT_ID IN (     SELECT DISTINCT(B3.B1_ALT_ID)     FROM B1PERMIT B3 JOIN BCHCKBOX C1     ON B3.B1_PER_ID1 = C1.B1_PER_ID1     AND B3.B1_PER_ID2 = C1.B1_PER_ID2     AND B3.B1_PER_ID3 = C1.B1_PER_ID3     WHERE B3.REC_STATUS = 'A'         AND B3.SERV_PROV_CODE = 'SUFFOLKCO'     AND B3.B1_PER_GROUP = 'DEQ'     AND B3.B1_PER_TYPE = 'General'     AND B3.B1_PER_SUB_TYPE = 'Site'     AND B3.B1_PER_CATEGORY = 'NA'     AND B3.B1_APPL_STATUS = 'Active'    AND C1.B1_CHECKBOX_DESC = 'PBS'        AND C1.B1_CHECKLIST_COMMENT <> 'No' ) AND B.B1_ALT_ID NOT IN (     SELECT DISTINCT(B1.B1_ALT_ID)     FROM B1PERMIT B1     JOIN XAPP2REF XAPP     ON B1.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B1.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B1.B1_PER_ID1 = XAPP.B1_MASTER_ID1     AND B1.B1_PER_ID2 = XAPP.B1_MASTER_ID2     AND B1.B1_PER_ID3 = XAPP.B1_MASTER_ID3         JOIN B1PERMIT B2     ON B2.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B2.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B2.B1_PER_ID1 = XAPP.B1_PER_ID1     AND B2.B1_PER_ID2 = XAPP.B1_PER_ID2     AND B2.B1_PER_ID3 = XAPP.B1_PER_ID3     WHERE B1.B1_APPL_STATUS = 'Active'     AND B1.SERV_PROV_CODE = 'SUFFOLKCO'         AND B1.B1_PER_GROUP = 'DEQ'     AND B1.B1_PER_TYPE = 'General'     AND B1.B1_PER_SUB_TYPE = 'Site'     AND B1.B1_PER_CATEGORY = 'NA'     AND B2.B1_PER_GROUP = 'DEQ'     AND B2.B1_PER_TYPE = 'OPC'     AND B2.B1_PER_SUB_TYPE = 'Hazardous Tank'     AND B2.B1_PER_CATEGORY = 'Permit' )";
        // SQL Article 18 HAS CHILD TANK
        var artNoYesTankSql ="SELECT DISTINCT(B.B1_ALT_ID) as recordNumber as recordNumber FROM B1PERMIT B JOIN BCHCKBOX C ON B.B1_PER_ID1 = C.B1_PER_ID1 AND B.B1_PER_ID2 = C.B1_PER_ID2 AND B.B1_PER_ID3 = C.B1_PER_ID3 WHERE B.REC_STATUS = 'A' AND B.SERV_PROV_CODE = 'SUFFOLKCO' AND B.B1_PER_GROUP = 'DEQ' AND B.B1_PER_TYPE = 'General' AND B.B1_PER_SUB_TYPE = 'Site' AND B.B1_PER_CATEGORY = 'NA' AND B.B1_APPL_STATUS = 'Active' AND C.B1_CHECKBOX_DESC = 'OPC' AND C.B1_CHECKLIST_COMMENT = 'CHECKED' AND B.B1_ALT_ID IN (     SELECT DISTINCT(B3.B1_ALT_ID)     FROM B1PERMIT B3 JOIN BCHCKBOX C1     ON B3.B1_PER_ID1 = C1.B1_PER_ID1     AND B3.B1_PER_ID2 = C1.B1_PER_ID2     AND B3.B1_PER_ID3 = C1.B1_PER_ID3     WHERE B3.REC_STATUS = 'A'         AND B3.SERV_PROV_CODE = 'SUFFOLKCO'     AND B3.B1_PER_GROUP = 'DEQ'     AND B3.B1_PER_TYPE = 'General'     AND B3.B1_PER_SUB_TYPE = 'Site'     AND B3.B1_PER_CATEGORY = 'NA'     AND B3.B1_APPL_STATUS = 'Active'     AND C1.B1_CHECKBOX_DESC = 'Article 18 Regulated Site'          AND C1.B1_CHECKLIST_COMMENT <> 'No' ) AND B.B1_ALT_ID IN (     SELECT DISTINCT(B1.B1_ALT_ID)     FROM B1PERMIT B1     JOIN XAPP2REF XAPP     ON B1.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B1.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B1.B1_PER_ID1 = XAPP.B1_MASTER_ID1     AND B1.B1_PER_ID2 = XAPP.B1_MASTER_ID2     AND B1.B1_PER_ID3 = XAPP.B1_MASTER_ID3         JOIN B1PERMIT B2     ON B2.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B2.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B2.B1_PER_ID1 = XAPP.B1_PER_ID1     AND B2.B1_PER_ID2 = XAPP.B1_PER_ID2     AND B2.B1_PER_ID3 = XAPP.B1_PER_ID3     WHERE B1.B1_APPL_STATUS = 'Active'     AND B1.SERV_PROV_CODE = 'SUFFOLKCO'         AND B1.B1_PER_GROUP = 'DEQ'     AND B1.B1_PER_TYPE = 'General'     AND B1.B1_PER_SUB_TYPE = 'Site'     AND B1.B1_PER_CATEGORY = 'NA'     AND B2.B1_PER_GROUP = 'DEQ'     AND B2.B1_PER_TYPE = 'OPC'     AND B2.B1_PER_SUB_TYPE = 'Hazardous Tank'     AND B2.B1_PER_CATEGORY = 'Permit' )";
        // SQL PBS HAS CHILD TANK
        var pbsHasTankSql ="SELECT DISTINCT(B.B1_ALT_ID) FROM B1PERMIT B JOIN BCHCKBOX C ON B.B1_PER_ID1 = C.B1_PER_ID1 AND B.B1_PER_ID2 = C.B1_PER_ID2 AND B.B1_PER_ID3 = C.B1_PER_ID3 WHERE B.REC_STATUS = 'A' AND B.SERV_PROV_CODE = 'SUFFOLKCO' AND B.B1_PER_GROUP = 'DEQ' AND B.B1_PER_TYPE = 'General' AND B.B1_PER_SUB_TYPE = 'Site' AND B.B1_PER_CATEGORY = 'NA' AND B.B1_APPL_STATUS = 'Active' AND C.B1_CHECKBOX_DESC = 'OPC' AND C.B1_CHECKLIST_COMMENT = 'CHECKED' AND B.B1_ALT_ID IN (     SELECT DISTINCT(B3.B1_ALT_ID)     FROM B1PERMIT B3 JOIN BCHCKBOX C1     ON B3.B1_PER_ID1 = C1.B1_PER_ID1     AND B3.B1_PER_ID2 = C1.B1_PER_ID2     AND B3.B1_PER_ID3 = C1.B1_PER_ID3     WHERE B3.REC_STATUS = 'A'         AND B3.SERV_PROV_CODE = 'SUFFOLKCO'     AND B3.B1_PER_GROUP = 'DEQ'     AND B3.B1_PER_TYPE = 'General'     AND B3.B1_PER_SUB_TYPE = 'Site'     AND B3.B1_PER_CATEGORY = 'NA'     AND B3.B1_APPL_STATUS = 'Active'    AND C1.B1_CHECKBOX_DESC = 'PBS'        AND C1.B1_CHECKLIST_COMMENT <> 'No' ) AND B.B1_ALT_ID IN (     SELECT DISTINCT(B1.B1_ALT_ID)     FROM B1PERMIT B1     JOIN XAPP2REF XAPP     ON B1.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B1.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B1.B1_PER_ID1 = XAPP.B1_MASTER_ID1     AND B1.B1_PER_ID2 = XAPP.B1_MASTER_ID2     AND B1.B1_PER_ID3 = XAPP.B1_MASTER_ID3         JOIN B1PERMIT B2     ON B2.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B2.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B2.B1_PER_ID1 = XAPP.B1_PER_ID1     AND B2.B1_PER_ID2 = XAPP.B1_PER_ID2     AND B2.B1_PER_ID3 = XAPP.B1_PER_ID3     WHERE B1.B1_APPL_STATUS = 'Active'     AND B1.SERV_PROV_CODE = 'SUFFOLKCO'         AND B1.B1_PER_GROUP = 'DEQ'     AND B1.B1_PER_TYPE = 'General'     AND B1.B1_PER_SUB_TYPE = 'Site'     AND B1.B1_PER_CATEGORY = 'NA'     AND B2.B1_PER_GROUP = 'DEQ'     AND B2.B1_PER_TYPE = 'OPC'     AND B2.B1_PER_SUB_TYPE = 'Hazardous Tank'     AND B2.B1_PER_CATEGORY = 'Permit' )";
        */
       //  
        var output = "Record ID\n";  		
        // Batch # 1
        var noChildTankCnt18 = 0;
		var noChildTankCntPBS = 0;
		// Batch # 2
		var childTankCnt18 = 0;
		var childTankCntPBS = 0;
		// Batch # 3
		var sitePBSSiteSetCnt = 0;
		var siteCnt = 0;
		/* GOAL # 1**********************************************************************
		All OPC SITE records first preset to this if there is NO TANK child
		Article 18 Regulated Site = No;
		PBS Regulated Site = No;
		***********************************************************************/
		// SQL to pull active OPC site records that has NO child Tank records
		/*var  vNoChildSQL= "SELECT DISTINCT B.B1_ALT_ID as recordNumber FROM B1PERMIT B JOIN BCHCKBOX C ON B.B1_PER_ID1 = C.B1_PER_ID1 AND B.B1_PER_ID2 = C.B1_PER_ID2 AND B.B1_PER_ID3 = C.B1_PER_ID3 WHERE B.B1_APPL_STATUS = 'Active' AND B.SERV_PROV_CODE = 'SUFFOLKCO' AND B.B1_PER_GROUP = 'DEQ' AND B.B1_PER_TYPE = 'General' AND B.B1_PER_SUB_TYPE = 'Site' AND B.B1_PER_CATEGORY = 'NA' AND C.B1_CHECKBOX_DESC = 'OPC' AND C.B1_CHECKLIST_COMMENT = 'CHECKED' AND B.B1_ALT_ID NOT IN ( SELECT B1.B1_ALT_ID FROM B1PERMIT B1  JOIN XAPP2REF XAPP ON B1.SERV_PROV_CODE = XAPP.SERV_PROV_CODE AND B1.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B1.B1_PER_ID1 = XAPP.B1_MASTER_ID1 AND B1.B1_PER_ID2 = XAPP.B1_MASTER_ID2 AND B1.B1_PER_ID3 = XAPP.B1_MASTER_ID3  JOIN B1PERMIT B2 ON B2.SERV_PROV_CODE = XAPP.SERV_PROV_CODE  AND B2.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE AND B2.B1_PER_ID1 = XAPP.B1_PER_ID1 AND B2.B1_PER_ID2 = XAPP.B1_PER_ID2 AND B2.B1_PER_ID3 = XAPP.B1_PER_ID3 WHERE B1.B1_APPL_STATUS = 'Active'  AND B1.SERV_PROV_CODE = 'SUFFOLKCO' AND B1.B1_PER_GROUP = 'DEQ' AND B1.B1_PER_TYPE = 'General' AND B1.B1_PER_SUB_TYPE = 'Site'     AND B1.B1_PER_CATEGORY = 'NA'     AND B2.B1_PER_GROUP = 'DEQ' AND B2.B1_PER_TYPE = 'OPC' AND B2.B1_PER_SUB_TYPE = 'Hazardous Tank' AND B2.B1_PER_CATEGORY = 'Permit')";               
		var vNoChildResult = doSQLSelect_local(vNoChildSQL);  	     
		logDebugLocal("********OPC site records that has NO child tank: " + vNoChildResult.length + "*********\n");
		for (r in vNoChildResult)
        {
            recordID = vNoChildResult[r]["recordNumber"];      
            //output += recordID + "\n";
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
            cap = aa.cap.getCap(capId).getOutput();
            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
                    var art18 = getAppSpecific("Article 18 Regulated Site", capId);   
					var pbsSite = getAppSpecific("PBS Regulated Site", capId);
					//editAppSpecific("Article 18 Regulated Site", "No", capId);
					//editAppSpecific("PBS Regulated Site", "No", capId);

					if (art18 != "No")
					{
						logDebugLocal("Article 18 for " + capIDString + " has a value of " + art18);
						childTankCnt18++;
					}
					if (pbsSite != "No")
					{
						logDebugLocal("PBS Regulated Site " + capIDString + " has  a value of " + pbsSite);
						childTankCntPBS++;
					}
					
				}
			}
		}

		/* GOAL # 2 **********************************************************************
		All OPC SITE records first preset to this if there is child tank
		Article 18 Regulated Site = No;
		PBS Regulated Site = No;
		***********************************************************************/
		// SQL to pull active OPC site records that  HAS child Tank records
		/*var vSQL = "SELECT DISTINCT B.B1_ALT_ID as recordNumber FROM B1PERMIT B JOIN BCHCKBOX C ON B.B1_PER_ID1 = C.B1_PER_ID1 AND B.B1_PER_ID2 = C.B1_PER_ID2 AND B.B1_PER_ID3 = C.B1_PER_ID3 WHERE B.B1_APPL_STATUS = 'Active' AND B.SERV_PROV_CODE = 'SUFFOLKCO' AND B.B1_PER_GROUP = 'DEQ' AND B.B1_PER_TYPE = 'General' AND B.B1_PER_SUB_TYPE = 'Site' AND B.B1_PER_CATEGORY = 'NA' AND C.B1_CHECKBOX_DESC = 'OPC' AND C.B1_CHECKLIST_COMMENT = 'CHECKED' AND B.B1_ALT_ID IN ( SELECT B1.B1_ALT_ID     FROM B1PERMIT B1     JOIN XAPP2REF XAPP     ON B1.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B1.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B1.B1_PER_ID1 = XAPP.B1_MASTER_ID1     AND B1.B1_PER_ID2 = XAPP.B1_MASTER_ID2     AND B1.B1_PER_ID3 = XAPP.B1_MASTER_ID3          JOIN B1PERMIT B2     ON B2.SERV_PROV_CODE = XAPP.SERV_PROV_CODE  AND B2.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE AND B2.B1_PER_ID1 = XAPP.B1_PER_ID1 AND B2.B1_PER_ID2 = XAPP.B1_PER_ID2 AND B2.B1_PER_ID3 = XAPP.B1_PER_ID3  WHERE B1.B1_APPL_STATUS = 'Active'     AND B1.SERV_PROV_CODE = 'SUFFOLKCO'         AND B1.B1_PER_GROUP = 'DEQ'     AND B1.B1_PER_TYPE = 'General' AND B1.B1_PER_SUB_TYPE = 'Site' AND B1.B1_PER_CATEGORY = 'NA' AND B2.B1_PER_GROUP = 'DEQ' AND B2.B1_PER_TYPE = 'OPC' AND B2.B1_PER_SUB_TYPE = 'Hazardous Tank' AND B2.B1_PER_CATEGORY = 'Permit' )";       
        var vResult = doSQLSelect_local(vSQL);
       
		logDebugLocal("********OPC site records that HAS child tank: " + vResult.length + "*********\n");
		for (r in vResult)
        {			
            recordID = vResult[r]["recordNumber"];      
            //output += recordID + "\n";
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
            cap = aa.cap.getCap(capId).getOutput();
            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
                    var art18 = getAppSpecific("Article 18 Regulated Site", capId);   
					var pbsSite = getAppSpecific("PBS Regulated Site", capId);
					//editAppSpecific("Article 18 Regulated Site", "No", capId);
					//editAppSpecific("PBS Regulated Site", "No", capId);

					if (art18 != "No")
					{
						logDebugLocal("Article 18 for " + capIDString + " has a value of " + art18);
						noChildTankCnt18++;
					}
					if (pbsSite != "No")
					{
						logDebugLocal("PBS Regulated Site " + capIDString + " has  a value of " + pbsSite);
						noChildTankCntPBS++;
					}
					
				}
			}
		}

		logDebugLocal("Total Site-OPC records that has a child tank with Article 18 that need to update to NO: " + childTankCnt18);
		logDebugLocal("Total Site-OPC records that has a child tank with PBS that need to update to NO: " + childTankCntPBS);
		
		logDebugLocal("Total Site-OPC records that has NO child tank with Article 18 that need to update to NO: " + noChildTankCnt18);
		logDebugLocal("Total Site-OPC records that has NO child tank with PBS that need to update to NO: " + noChildTankCntPBS);
        
		/* GOAL # 3 **********************************************************************
		At the end, set all OPC Site base on the below on the SITE.
		If Article 18 is Yes, set PBS Regulated Site = Yes; and if owner type = 2 or MOSF is Yes, set Article 18 to No		
		***********************************************************************/
		/*var vOpcSiteSql = "SELECT DISTINCT B.B1_ALT_ID as recordNumber FROM B1PERMIT B JOIN BCHCKBOX C ON B.B1_PER_ID1 = C.B1_PER_ID1 AND B.B1_PER_ID2 = C.B1_PER_ID2 AND B.B1_PER_ID3 = C.B1_PER_ID3 WHERE B.B1_APPL_STATUS = 'Active' AND B.SERV_PROV_CODE = 'SUFFOLKCO' AND B.B1_PER_GROUP = 'DEQ' AND B.B1_PER_TYPE = 'General' AND B.B1_PER_SUB_TYPE = 'Site' AND B.B1_PER_CATEGORY = 'NA' AND C.B1_CHECKBOX_DESC = 'OPC' AND C.B1_CHECKLIST_COMMENT = 'CHECKED'";
		var vOpcSite = doSQLSelect_local(vOpcSiteSql);
		logDebugLocal("********OPC site records settings: " + vOpcSite.length + "*********\n");
				
		for (r in vOpcSite)
        {			
            recordID = vOpcSite[r]["recordNumber"];      
            //output += recordID + "\n";
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
            cap = aa.cap.getCap(capId).getOutput();
            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
                    var art18 = getAppSpecific("Article 18 Regulated Site", capId);   								

					if (art18 == "Yes")
					{
						//editAppSpecific("PBS Regulated Site", "Yes", capId);
						logDebugLocal("Update PBS Regulated Site to Yes: " + capIDString);
						sitePBSSiteSetCnt++;
						var ownerType = getAppSpecific("Owner Type", capId);   
						var regulatedSite = getAppSpecific("MOSF Regulated Site", capId);     
						if (ownerType == "2-State Government" || regulatedSite == "Yes")
						{
							//editAppSpecific("Article 18 Regulated Site", "No", capId);	
							logDebugLocal("Owner Type: " + ownerType + ", " + "MOSF Regulated Site: " + regulatedSite);					
							logDebugLocal("Update Article 18 Regulated Site to No: " + capIDString);
							siteCnt++;
						}	
					}					
					
				}
			}
		}
		logDebugLocal("Batch # 3: Total Site-OPC records that has updated PBS Regulated Site to YES: " + sitePBSSiteSetCnt);
		logDebugLocal("Batch # 3: Total Site-OPC records with owner type or MOSF that has updated Artcle 18 to NO: " + siteCnt);
		*/

		/* GOAL # 4 **********************************************************************
		Go through all the child records of OPC site records. Child record can only be DEQ/OPC/Hazardous Tank/Permit.
		Also only look at tank records with the following: # = Number. 4 digital numbers.Official Use Code = ####P or 
		####UAP OR UAP or ####OOS or ####TOS or EX or EXP or 81 or 82 or 85 or ####HO or 66HO or UR or ####EMB or RNP	
		Goal is to set Article 18 and PBS
		***********************************************************************/
		// SQL to pull active OPC site records that  HAS child Tank records
		var vTankSQL = "SELECT DISTINCT B.B1_ALT_ID as recordNumber FROM B1PERMIT B JOIN BCHCKBOX C ON B.B1_PER_ID1 = C.B1_PER_ID1 AND B.B1_PER_ID2 = C.B1_PER_ID2 AND B.B1_PER_ID3 = C.B1_PER_ID3 WHERE B.B1_APPL_STATUS = 'Active' AND B.SERV_PROV_CODE = 'SUFFOLKCO' AND B.B1_PER_GROUP = 'DEQ' AND B.B1_PER_TYPE = 'General' AND B.B1_PER_SUB_TYPE = 'Site' AND B.B1_PER_CATEGORY = 'NA' AND C.B1_CHECKBOX_DESC = 'OPC' AND C.B1_CHECKLIST_COMMENT = 'CHECKED' AND B.B1_ALT_ID IN ( SELECT B1.B1_ALT_ID     FROM B1PERMIT B1     JOIN XAPP2REF XAPP     ON B1.SERV_PROV_CODE = XAPP.SERV_PROV_CODE     AND B1.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE     AND B1.B1_PER_ID1 = XAPP.B1_MASTER_ID1     AND B1.B1_PER_ID2 = XAPP.B1_MASTER_ID2     AND B1.B1_PER_ID3 = XAPP.B1_MASTER_ID3          JOIN B1PERMIT B2     ON B2.SERV_PROV_CODE = XAPP.SERV_PROV_CODE  AND B2.SERV_PROV_CODE = XAPP.MASTER_SERV_PROV_CODE AND B2.B1_PER_ID1 = XAPP.B1_PER_ID1 AND B2.B1_PER_ID2 = XAPP.B1_PER_ID2 AND B2.B1_PER_ID3 = XAPP.B1_PER_ID3  WHERE B1.B1_APPL_STATUS = 'Active'     AND B1.SERV_PROV_CODE = 'SUFFOLKCO'         AND B1.B1_PER_GROUP = 'DEQ'     AND B1.B1_PER_TYPE = 'General' AND B1.B1_PER_SUB_TYPE = 'Site' AND B1.B1_PER_CATEGORY = 'NA' AND B2.B1_PER_GROUP = 'DEQ' AND B2.B1_PER_TYPE = 'OPC' AND B2.B1_PER_SUB_TYPE = 'Hazardous Tank' AND B2.B1_PER_CATEGORY = 'Permit')";       
        var vTankSQLResult = doSQLSelect_local(vTankSQL);
       	var undergroundTotal = 0;
		var abovegroundGreaterThan1100 = 0;
		var heatingOilGreaterThan1100 = 0;

		logDebugLocal("********OPC site records that HAS child tank: " + vTankSQLResult.length + "*********\n");
		for (r in vTankSQLResult)
        {		
			var totalCapacity = 0;	
            recordID = vTankSQLResult[r]["recordNumber"];      
          
            capId = getApplication(recordID);
            capIDString = capId.getCustomID();
			
            cap = aa.cap.getCap(capId).getOutput();
            if (cap)
            {
                var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                if (capmodel.isCompleteCap())
                {
					var childArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", capId);
					if (childArray)
					{
						logDebugLocal("********OPC site has tank child***** ");

						if (childArray.length > 0)
						{
							logDebugLocal("********OPC site " + capIDString + " has tank child. ");

							for (yy in childArray)
							{
								var childCapId = childArray[yy];
								//var childCapStatus = getAppStatus(childCapId);
								
							
								var offUseCode = getAppSpecific("Official Use Code", childCapId);
								logDebugLocal("We found this child tank: " + childCapId.getCustomID() + " with official code " + offUseCode);

								var match = false;
								var isFourDigit = false;
								var isEMB = false;
								var length = offUseCode.length();
								// Good match
								if (offUseCode == 'UAP' ||offUseCode == 'EX' || offUseCode == 'EXP' || offUseCode == '81' || offUseCode == '82' || offUseCode == '85'
								|| offUseCode == '66HO' || offUseCode == 'UR' || offUseCode == 'RNP')
								{									
									match = true;
									//logDebugLocal("Match offUsecode." );
								} 
								else
								{
									//First check to see if it can be ###EMB
									
									//logDebugLocal("Official Use code length is: " + length);

									if (length == 6)
									{
										for (i = 0; i < 3; i++)
										{
											var c = offUseCode.ChartAt(i);
											if (i < 3)
											{
												isEMB = (c >= '0' && c <= '9');									
											}										
										}
										if (isEMB)
										{
											isEMB = offUseCode.endsWith('EMB');
											//logDebugLocal("Checking official code: " + offUseCode + "," + childCapId.getCustomID());
										}

									}	
									if (!isEMB)
									{
										//logDebugLocal("isEMB: " + isEMB);

										if (length > 4)
										{
											logDebugLocal("length is > 4: " + length);
											// Is first 4 digits?
											for (i = 0; i < 4; i++)
											{
												var c = offUseCode.charAt(i);			
												logDebugLocal("Char at : " + i, " is " + c);									
												isFourDigit = (c >= '0' && c <= '9');

												logDebugLocal("isFourDigit: " + isFourDigit + " since c is: " + c);
												// Any mistmatch should break the loop since we only for first 4 to be digit
												if(!isFourDigit) 
												{
													logDebugLocal("Break the loop since official use code does not begin with 4 digits: " + offUseCode + "," + childCapId.getCustomID());
													// Quit for that site. No need to check additional tank child
													finalCheck(totalCapacity, capId, capIDString);
													break;
												}
											}	

											
											// First 4 digits are numbers, check what they are end with
											// ####P, ####UAP, ####OOS, ####TOS, ####HO
											if (isFourDigit)
											{
												//logDebugLocal("First 4 digit is digits. Now checking the end string." + childCapId.getCustomID());
												if (length == 5) //####P
												{
													isFourDigit = offUseCode.endsWith('P');
													
												}
												else if (length == 6) // ####HO
												{
													isFourDigit = offUseCode.endsWith('HO');												
												}
												else if (length == 7) // ####UAP, ####OOS, ####TOS
												{
													if (offUseCode.endsWith('UAP') || offUseCode.endsWith('OOS') || offUseCode.endsWith('TOS'))		
													{
														isFourDigit = true;
													}										 
												}
												else
												{												
													logDebugLocal("Break the loop since official use code does not match the criterias: " + offUseCode + "," + childCapId.getCustomID());
													// Quit for that site. No need to check additional tank child
													finalCheck(totalCapacity, capId, capIDString);
													break;
												}																			
												logDebugLocal("4 digit and ends with P, HO, UAP, OOS or TOS: " + offUseCode);
												
											}
										}
									}
								}
								// If the official use code matches the criterias
								// we update Article 18 site
								if (match || isFourDigit || isEMB)
								{
									//logDebugLocal("Official use code matched: " + offUseCode + "," + capIDString);
									// Get SITE custom field
									var art18 = getAppSpecific("Article 18 Regulated Site", capId);   	

									//logDebugLocal("Article 18 for Site: " + art18 + "," + capIDString);

									var prodStoredCat = getAppSpecific("Product Stored", childCapId);
									var storageType = getAppSpecific("Storage Type", childCapId);
									var capacity = getAppSpecific("Capacity", childCapId);

									//logDebugLocal("prodStoredCat for Tank: " + prodStoredCat + "," + childCapId);
									//logDebugLocal("storageType for Tank: " + storageType + "," + childCapId);
									//logDebugLocal("capacity for Tank: " + capacity + "," + childCapId);

									if (storageType == "0-Tank" || storageType == null)
									{
										if (prodStoredCat == "Heating Oil: Resale/Redistribution" ||									
										prodStoredCat == "Emergency Generator Fuels" ||
										prodStoredCat == "Motor Fuels" ||
										prodStoredCat == "Other Petroleum Products" ||
										prodStoredCat == "Waste/Used/Other Oils") 										
										{
											var tankLoc = getAppSpecific("Tank Location", childCapId);

											if (tankLoc == "4-Underground-Outdoors" || tankLoc == "3-Underground-Indoors")
											{
												//editAppSpecific("Article 18 Regulated Site", "Yes", capId);
												logDebugLocal("Set Site Article 18 Regulated Site to Yes for underground tank child: " + capIDString + "," + childCapId.getCustomID());
												// Quit for that site. No need to check additional tank child
												finalCheck(totalCapacity, capId, capIDString);
												undergroundTotal++;
												break;
											}
											else
											{
												var petroFac = getAppSpecific("Type of Petroleum Facility", capId);
												if (capacity > 1100)
												{ 
													// Set Site Article 18 to No																							
													//editAppSpecific("Article 18 Regulated Site", "Yes", capId);
													logDebugLocal("Set Site Article 18 Regulated Site to Yes for capacity > 1100: " + capIDString + "," + childCapId.getCustomID());
													// Quit for that site. No need to check additional tank child
													finalCheck(totalCapacity, capId, capIDString);
													abovegroundGreaterThan1100++;
													break;
												}
												else
												{
													if (petroFac != "9-Farm" && petroFac != "10-Private Residence")
													{
														totalCapacity = totalCapacity + capacity;
														logDebugLocal("Adding capacity due to type of petroleum Fac: " + petroFac + "," + capIDString + "," + childCapId.getCustomID());
													}

												}

											}
										}
										else if (prodStoredCat == "Heating Oil:On-Site Consumption")
										{
											if (capacity > 1100)
											{
												//editAppSpecific("Article 18 Regulated Site", "Yes", capId);
												logDebugLocal("Set Site Article 18 Regulated Site to Yes for product stored and capcity > 1100:: " + prodStoredCat + "," + capIDString + "," + childCapId.getCustomID());
												// Quit for that site. No need to check additional tank child
												finalCheck(totalCapacity, capId, capIDString);
												heatingOilGreatherThan1100++;
												break;
											}
										}
									}

								}
							}

							// Now we are out of the child tanks, final check
							finalCheck(totalCapacity, capId, capIDString);
						}
					}
					
				}
			}
		}
		logDebugLocal("Batch # 4: Total Site-OPC records that has updated PBS Regulated Site to YES: " + undergroundTotal);
		logDebugLocal("Batch # 4: Total Site-OPC records has updated Artcle 18 to Yes with capacity > 1100: " + abovegroundGreaterThan1100);
		logDebugLocal("Batch # 4: Total Site-OPC records has updated Artcle 18 to Yes with heating oil product stored and capacity > 1100: " + heatingOilGreaterThan1100);
    
    }
    catch (err) 
    {
        logDebug("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
    logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");    
}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function finalCheck(totalCapacity, capId, capIDString)
{
	logDebugLocal("Final Check capcity");
	if (totalCapacity > 1100)
	{
		//editAppSpecific("Article 18 Regulated Site", "Yes", capId);
		logDebugLocal("Final Check capcity > 1100: " + totalCapacity + "," + capIDString);
		
	}
	var art18 = getAppSpecific("Article 18 Regulated Site", capId);   	
	if (art18 == "Yes")
	{
		//editAppSpecific("PBS Regulated Site", "Yes", capId);
		logDebugLocal("PBS Regulated Site set to Yes since Article 18 is : " + art18 + " for " + capIDString);

		var ownerType = getAppSpecific("Owner Type", capId);   
		var regulatedSite = getAppSpecific("MOSF Regulated Site", capId);     
		if (ownerType == "2-State Government" || regulatedSite == "Yes")
		{
			//editAppSpecific("Article 18 Regulated Site", "No", capId);				
			logDebugLocal("Final Check set Article 18 Regulated Site to No due to ownertype: " + ownerType + "," + capIDString);
		}

	}

}

function logDebugLocal(dstr)
{
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
    }
}
function doSQLSelect_local(sql)
{
    try
    {
        //logdebug("iNSIDE FUNCTION");
        var array = [];
        var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
        var ds = initialContext.lookup("java:/SUFFOLKCO");
        var conn = ds.getConnection();
        var sStmt = conn.prepareStatement(sql);
        if (sql.toUpperCase().indexOf("SELECT") == 0)
        {
            //logdebug("executing " + sql);
            var rSet = sStmt.executeQuery();
            while (rSet.next())
            {
                var obj = {};
                var md = rSet.getMetaData();
                var columns = md.getColumnCount();
                for (i = 1; i <= columns; i++)
                {
                    obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
                    //logdebug(rSet.getString(md.getColumnName(i)));
                }
                obj.count = rSet.getRow();
                array.push(obj)
            }
            rSet.close();
            //logdebug("...returned " + array.length + " rows");
            //logdebug(JSON.stringify(array));
        }
        sStmt.close();
        conn.close();
        return array
    } catch (err)
    {
        //logdebug("ERROR: "+ err.message);
        return array
    }
}

function isMatchCapCondition(capConditionScriptModel1, capConditionScriptModel2)
{
  if (capConditionScriptModel1 == null || capConditionScriptModel2 == null)
  {
    return false;
  }
  var description1 = capConditionScriptModel1.getConditionDescription();
  var description2 = capConditionScriptModel2.getStreetName();
  if ((description1 == null && description2 != null) 
    || (description1 != null && description2 == null))
  {
    return false;
  }
  if (description1 != null && !description1.equals(description2))
  {
    return false;
  }
  var conGroup1 = capConditionScriptModel1.getConditionGroup();
  var conGroup2 = capConditionScriptModel2.getConditionGroup();
  if ((conGroup1 == null && conGroup2 != null) 
    || (conGroup1 != null && conGroup2 == null))
  {
    return false;
  }
  if (conGroup1 != null && !conGroup1.equals(conGroup2))
  {
    return false;
  }
  return true;
}

function getChildren(pCapType, pParentCapId) 
	{
	// Returns an array of children capId objects whose cap type matches pCapType parameter
	// Wildcard * may be used in pCapType, e.g. "Building/Commercial/*/*"
	// Optional 3rd parameter pChildCapIdSkip: capId of child to skip

	var retArray = new Array();
	if (pParentCapId!=null) //use cap in parameter 
		var vCapId = pParentCapId;
	else // use current cap
		var vCapId = capId;
		
	if (arguments.length>2)
		var childCapIdSkip = arguments[2];
	else
		var childCapIdSkip = null;
		
	var typeArray = pCapType.split("/");
	if (typeArray.length != 4)
		logDebug("**ERROR in childGetByCapType function parameter.  The following cap type parameter is incorrectly formatted: " + pCapType);
		
	var getCapResult = aa.cap.getChildByMasterID(vCapId);
	if (!getCapResult.getSuccess())
		{ logDebug("**WARNING: getChildren returned an error: " + getCapResult.getErrorMessage()); return null }
		
	var childArray = getCapResult.getOutput();
	if (!childArray.length)
		{ logDebug( "**WARNING: getChildren function found no children"); return null ; }

	var childCapId;
	var capTypeStr = "";
	var childTypeArray;
	var isMatch;
	for (xx in childArray)
		{
		childCapId = childArray[xx].getCapID();
		if (childCapIdSkip!=null && childCapIdSkip.getCustomID().equals(childCapId.getCustomID())) //skip over this child
			continue;

		capTypeStr = aa.cap.getCap(childCapId).getOutput().getCapType().toString();	// Convert cap type to string ("Building/A/B/C")
		childTypeArray = capTypeStr.split("/");
		isMatch = true;
		for (yy in childTypeArray) //looking for matching cap type
			{
			if (!typeArray[yy].equals(childTypeArray[yy]) && !typeArray[yy].equals("*"))
				{
				isMatch = false;
				continue;
				}
			}
		if (isMatch)
			retArray.push(childCapId);
		}
		
	logDebug("getChildren returned " + retArray.length + " capIds");
	return retArray;

    }

function getCapConditionByCapID(capId) {
    capConditionScriptModels = null;
  
    var s_result = aa.capCondition.getCapConditions(capId);
    if (s_result.getSuccess()) {
      capConditionScriptModels = s_result.getOutput();
      if (
        capConditionScriptModels == null ||
        capConditionScriptModels.length == 0
      ) {
        aa.print("WARNING: no cap condition on this CAP:" + capId);
        capConditionScriptModels = null;
      }
    } else {
      aa.print(
        "ERROR: Failed to get cap condition: " + s_result.getErrorMessage()
      );
      capConditionScriptModels = null;
    }
    return capConditionScriptModels;
  }

function addStdCondition(cType,cDesc)
{
    if (!aa.capCondition.getStandardConditions)
    {
        aa.print("addStdCondition function is not available in this version of Accela Automation.");
    }
    else
    {
        standardConditions = aa.capCondition.getStandardConditions(cType,cDesc).getOutput();
        for(i = 0; i<standardConditions.length;i++)
        {
        standardCondition = standardConditions[i]
        aa.capCondition.createCapConditionFromStdCondition(capId, standardCondition.getConditionNbr())
        }        
    }
}

function getShortNotes() // option CapId
{
	var itemCap = capId
	if (arguments.length > 0)
		itemCap = arguments[0]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	var sReturn = cd.getShortNotes();

	if(sReturn != null)
		return sReturn;
	else
		return "";
}

function workDescGet(pCapId)
	{
	//Gets work description
	//07SSP-00037/SP5017
	//
	var workDescResult = aa.cap.getCapWorkDesByPK(pCapId);
	
	if (!workDescResult.getSuccess())
		{
		logDebug("**ERROR: Failed to get work description: " + workDescResult.getErrorMessage()); 
		return false;
		}
		
	var workDescObj = workDescResult.getOutput();
	var workDesc = workDescObj.getDescription();
	
	return workDesc;
	}


function debugObject(object) {
    var output = '';
    for (property in object) {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}

function getAppStatus() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    var appStatus = null;
   var capResult = aa.cap.getCap(itemCap);
   if (capResult.getSuccess()) {
      licCap = capResult.getOutput();
      if (licCap != null) {
         appStatus = "" + licCap.getCapStatus();
      }
   } else {
        logDebug("ERROR: Failed to get app status: " + capResult.getErrorMessage());
    }
    return appStatus;
}

function addFee(fcode, fsched, fperiod, fqty, finvoice)
{
	var feeCap = capId;
	var feeCapMessage = "";
	var feeSeq_L = new Array(); //invoicing fee for CAP in args
	var paymentPeriod_L = new Array(); //invoicing pay periods for CAP in args
	var feeSeq = null;
	if (arguments.length > 5)
	{
		feeCap = arguments[5]; //use cap ID specified in args
		feeCapMessage = " to specified CAP";
	}
	assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
	if (assessFeeResult.getSuccess())
	{
		feeSeq = assessFeeResult.getOutput();
		logDebug("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
		logDebug("The assessed fee Sequence Number " + feeSeq + feeCapMessage);
		if (finvoice == "Y" && arguments.length == 5) // use current CAP
		{
			feeSeqList.push(feeSeq);
			paymentPeriodList.push(fperiod);
		}
		if (finvoice == "Y" && arguments.length > 5) // use CAP in args
		{
			feeSeq_L.push(feeSeq);
			paymentPeriod_L.push(fperiod);
			var invoiceResult_L = aa.finance.createInvoice(feeCap, feeSeq_L, paymentPeriod_L);
			if (invoiceResult_L.getSuccess())
			{
				logDebug("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			}
			else
			{
				logDebug("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
			}
		}
		updateFeeItemInvoiceFlag(feeSeq, finvoice);
	} 
	else 
	{
		logDebug("**ERROR: assessing fee (" + fcode + "): " + assessFeeResult.getErrorMessage());
		feeSeq = null;
	}
	return feeSeq;
}

function updateFeeItemInvoiceFlag(feeSeq, finvoice)
{
	if(feeSeq == null)
		return;
	if(!cap.isCompleteCap())
	{
		var feeItemScript = aa.finance.getFeeItemByPK(capId,feeSeq);
		if(feeItemScript.getSuccess)
		{
			var feeItem = feeItemScript.getOutput().getF4FeeItem();
			feeItem.setAutoInvoiceFlag(finvoice);
			aa.finance.editFeeItem(feeItem);
		}
	}
}


function getAppSpecific(itemName) { // optional: itemCap
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
	
	if (useAppSpecificGroupName) {
		if (itemName.indexOf(".") < 0) {
			logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); 
			return false 
		}
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess()) {
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "") {
			for (i in appspecObj) {
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
			}
		}
	} else { 
		logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())
	}
}
function copyContacts(pFromCapId, pToCapId) 
{
	if (pToCapId == null)
	{
		var vToCapId = capId;
	}
	else
	{
		var vToCapId = pToCapId;
	}
	var capContactResult = aa.people.getCapContactByCapID(pFromCapId);
	var copied = 0;
	if (capContactResult.getSuccess()) 
	{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts) 
		{
			var newContact = Contacts[yy].getCapContactModel();
			// Retrieve contact address list and set to related contact
			var contactAddressrs = aa.address.getContactAddressListByCapContact(newContact);
			if (contactAddressrs.getSuccess()) 
			{
				var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
				newContact.getPeople().setContactAddressList(contactAddressModelArr);
			}
			newContact.setCapID(vToCapId);
			// Create cap contact, contact address and contact template
			aa.people.createCapContactWithAttribute(newContact);
			copied++;
			logDebug("Copied contact from " + pFromCapId.getCustomID() + " to " + vToCapId.getCustomID());
		}
	}
	else 
	{
		logDebug("**ERROR: Failed to get contacts: " + capContactResult.getErrorMessage());
		return false;
	}
	return copied;
}

function convertContactAddressModelArr(contactAddressScriptModelArr) 
{
	var contactAddressModelArr = null;
	if (contactAddressScriptModelArr != null && contactAddressScriptModelArr.length > 0) 
	{
		contactAddressModelArr = aa.util.newArrayList();
		for (loopk in contactAddressScriptModelArr) 
		{
			contactAddressModelArr.add(contactAddressScriptModelArr[loopk].getContactAddressModel());
		}
	}
	return contactAddressModelArr;
}

function copyASIFields(sourceCapId,targetCapId)
{
	var ignoreArray = new Array();
	for (var i = 2; i < arguments.length; i++)
	{
		ignoreArray.push(arguments[i]);
	}
	var targetCap = aa.cap.getCap(targetCapId).getOutput();
	var targetCapType = targetCap.getCapType();
	var targetCapTypeString = targetCapType.toString();
	var targetCapTypeArray = targetCapTypeString.split("/");
	var sourceASIResult = aa.appSpecificInfo.getByCapID(sourceCapId);
	if (sourceASIResult.getSuccess())
	{ 
		var sourceASI = sourceASIResult.getOutput(); 
	}
	else
	{ 
		aa.print( "**ERROR: getting source ASI: " + sourceASIResult.getErrorMessage());
		return false;
	}
	for (ASICount in sourceASI)
	{
		thisASI = sourceASI[ASICount];
		if (!exists(thisASI.getCheckboxType(),ignoreArray))
		{
			thisASI.setPermitID1(targetCapId.getID1());
			thisASI.setPermitID2(targetCapId.getID2());
			thisASI.setPermitID3(targetCapId.getID3());
			thisASI.setPerType(targetCapTypeArray[1]);
			thisASI.setPerSubType(targetCapTypeArray[2]);
			aa.cap.createCheckbox(thisASI);
		}
	}
}

function copyASITables(pFromCapId, pToCapId) 
{
	var itemCap = pFromCapId;
	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray();
	var tai = ta.iterator();
	var tableArr = new Array();
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) 
	{
		ignoreArr = arguments[2];
		limitCopy = true;
	}
	while (tai.hasNext()) 
	{
		var tsm = tai.next();
		var tempObject = new Array();
		var tempArray = new Array();
		var tn = tsm.getTableName() + "";
		var numrows = 0;
		//Check list
		if (limitCopy) 
		{
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++)
			{
				if (ignoreArr[i] == tn) 
				{
					ignore = true;
					break;
				}
			}
			if (ignore)
			{
				continue;
			}
		}
		if (!tsm.rowIndex.isEmpty()) 
		{
			var tsmfldi = tsm.getTableField().iterator();
			var tsmcoli = tsm.getColumns().iterator();
			var readOnlyi = tsm.getAppSpecificTableModel().getReadonlyField().iterator(); // get Readonly filed
			var numrows = 1;
			while (tsmfldi.hasNext()) // cycle through fields
			{
				if (!tsmcoli.hasNext()) // cycle through columns
				{
					var tsmcoli = tsm.getColumns().iterator();
					tempArray.push(tempObject); // end of record
					var tempObject = new Array(); // clear the temp obj
					numrows++;
				}
				var tcol = tsmcoli.next();
				var tval = tsmfldi.next();
				var readOnly = 'N';
				if (readOnlyi.hasNext()) 
				{
					readOnly = readOnlyi.next();
				}
				var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
				tempObject[tcol.getColumnName()] = fieldInfo;
				//tempObject[tcol.getColumnName()] = tval;
			}
			tempArray.push(tempObject); // end of record
		}
		addASITable(tn, tempArray, pToCapId);
		logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
	}
}

function sendNotification(emailFrom, emailTo, emailCC, templateName, params, reportFile)
{
	var itemCap = capId;
	if (arguments.length == 7) itemCap = arguments[6]; // use cap ID specified in args
	var id1 = itemCap.ID1;
 	var id2 = itemCap.ID2;
 	var id3 = itemCap.ID3;
	var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);
	var result = null;
	result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
	if(result.getSuccess())
	{
		logDebug("Sent email successfully!");
		return true;
	}
	else
	{
		logDebug("Failed to send mail. - " + result.getErrorType());
		return false;
	}
}

function addParameter(pamaremeters, key, value)
{
	if(key != null)
	{
		if(value == null)
		{
			value = "";
		}
		pamaremeters.put(key, value);
	}
}
function getDepartmentName(username)
	{
	var suo = aa.person.getUser(username).getOutput(); 
	var dpt = aa.people.getDepartmentList(null).getOutput();
	for (var thisdpt in dpt)
	  	{
	  	var m = dpt[thisdpt]
	  	var  n = m.getServiceProviderCode() + "/" + m.getAgencyCode() + "/" + m.getBureauCode() + "/" + m.getDivisionCode() + "/" + m.getSectionCode() + "/" + m.getGroupCode() + "/" + m.getOfficeCode() 
	  
	  	if (n.equals(suo.deptOfUser)) 
	  	return(m.getDeptName())
  		}
  	}
  
function updateAppStatus(stat,cmt) 
{
	var thisCap = capId;
	if (arguments.length > 2) thisCap = arguments[2];
	updateStatusResult = aa.cap.updateAppStatus(thisCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
	if (!updateStatusResult.getSuccess()) 
	{
		logDebug("ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + 
		updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
	} 
	else 
	{
		logDebug("Application Status updated to " + stat);
	}
}

function getOutput(result, object) {
    if (result.getSuccess()) {
        return result.getOutput();
    } else {
        logDebug("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
        return null;
    }
}

function getContactArray()
{
	// Returns an array of associative arrays with contact attributes.  Attributes are UPPER CASE
	// optional capid
	// added check for ApplicationSubmitAfter event since the contactsgroup array is only on pageflow,
	// on ASA it should still be pulled normal way even though still partial cap
	var thisCap = capId;
	if (arguments.length == 1) thisCap = arguments[0];
	var cArray = new Array();
	if (arguments.length == 0 && !cap.isCompleteCap() && controlString != "ApplicationSubmitAfter") // we are in a page flow script so use the capModel to get contacts
	{
	capContactArray = cap.getContactsGroup().toArray() ;
	}
	else
	{
	var capContactResult = aa.people.getCapContactByCapID(thisCap);
	if (capContactResult.getSuccess())
		{
		var capContactArray = capContactResult.getOutput();
		}
	}

	if (capContactArray)
	{
	for (yy in capContactArray)
		{
		var aArray = new Array();
		aArray["lastName"] = capContactArray[yy].getPeople().lastName;
		aArray["refSeqNumber"] = capContactArray[yy].getCapContactModel().getRefContactNumber();
		aArray["firstName"] = capContactArray[yy].getPeople().firstName;
		aArray["middleName"] = capContactArray[yy].getPeople().middleName;
		aArray["businessName"] = capContactArray[yy].getPeople().businessName;
		aArray["contactSeqNumber"] =capContactArray[yy].getPeople().contactSeqNumber;
		aArray["contactType"] =capContactArray[yy].getPeople().contactType;
		aArray["relation"] = capContactArray[yy].getPeople().relation;
		aArray["phone1"] = capContactArray[yy].getPeople().phone1;
		aArray["phone2"] = capContactArray[yy].getPeople().phone2;
		aArray["email"] = capContactArray[yy].getPeople().email;
		aArray["addressLine1"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine1();
		aArray["addressLine2"] = capContactArray[yy].getPeople().getCompactAddress().getAddressLine2();
		aArray["city"] = capContactArray[yy].getPeople().getCompactAddress().getCity();
		aArray["state"] = capContactArray[yy].getPeople().getCompactAddress().getState();
		aArray["zip"] = capContactArray[yy].getPeople().getCompactAddress().getZip();
		aArray["fax"] = capContactArray[yy].getPeople().fax;
		aArray["notes"] = capContactArray[yy].getPeople().notes;
		aArray["country"] = capContactArray[yy].getPeople().getCompactAddress().getCountry();
		aArray["fullName"] = capContactArray[yy].getPeople().fullName;
		aArray["peopleModel"] = capContactArray[yy].getPeople();

		var pa = new Array();

		if (arguments.length == 0 && !cap.isCompleteCap()) {
			var paR = capContactArray[yy].getPeople().getAttributes();
			if (paR) pa = paR.toArray();
			}
		else
			var pa = capContactArray[yy].getCapContactModel().getPeople().getAttributes().toArray();
				for (xx1 in pa)
					aArray[pa[xx1].attributeName] = pa[xx1].attributeValue;

		cArray.push(aArray);
		}
	}
	return cArray;
}

function getAppSpecific(itemName) { // optional: itemCap
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
	
	if (useAppSpecificGroupName) {
		if (itemName.indexOf(".") < 0) {
			logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); 
			return false 
		}
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
	var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess()) {
		var appspecObj = appSpecInfoResult.getOutput();
		if (itemName != "") {
			for (i in appspecObj) {
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
			}
		}
	} else { 
		logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())
	}
}


function updateTask(wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 4) 
	{
		if (arguments[4] != "") 
		{
			processName = arguments[4]; // subprocess
			useProcess = true;
		}
	}
	var itemCap = capId;
	if (arguments.length == 6)
	{
		itemCap = arguments[5]; // use cap ID specified in args
	}
	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
	{
		var wfObj = workflowResult.getOutput();
	}
	else 
	{
		logDebug("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}
	if (!wfstat)
	{
		wfstat = "NA";
	}
	for (i in wfObj)
	{
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) 
		{
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			if (useProcess)
			{
				aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
				logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
			}
			else
			{
				aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
				logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
			}
		}
	}
}

function dateAdd(td,amt) 
{
	// perform date arithmetic on a string
	// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
	// amt can be positive or negative (5, -3) days
	if (!td) 
	{
		dDate = new Date();
	} 
	else 
	{
		dDate = convertDate(td);
	}
	//var i = 0;
	//while (i < Math.abs(amt)) 
	//{
	//	dDate = new Date(aa.calendar.getNextWorkDay(aa.date.parseDate(dDate.getMonth()+1 + "/" + dDate.getDate() + "/" + dDate.getFullYear())).getOutput().getTime());
	//	i++;
	//}
	dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));
	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function dateAddMonths(pDate, pMonths) {
	// Adds specified # of months (pMonths) to pDate and returns new date as string in format MM/DD/YYYY
	// If pDate is null, uses current date
	// pMonths can be positive (to add) or negative (to subtract) integer
	// If pDate is on the last day of the month, the new date will also be end of month.
	// If pDate is not the last day of the month, the new date will have the same day of month, unless such a day doesn't exist in the month, 
	// in which case the new date will be on the last day of the month
	if (!pDate) {
		baseDate = new Date();
	} else {
		baseDate = convertDate(pDate);
	}
	var day = baseDate.getDate();
	baseDate.setMonth(baseDate.getMonth() + pMonths);
	if (baseDate.getDate() < day) {
		baseDate.setDate(1);
		baseDate.setDate(baseDate.getDate() - 1);
		}
	return ((baseDate.getMonth() + 1) + "/" + baseDate.getDate() + "/" + baseDate.getFullYear());
}

function convertDate(thisDate) {
	//converts date to javascript date
	if (typeof(thisDate) == "string") {
		var retVal = new Date(String(thisDate));
		if (!retVal.toString().equals("Invalid Date"))
		return retVal;
	}
	if (typeof(thisDate)== "object") {
		if (!thisDate.getClass) {// object without getClass, assume that this is a javascript date already 
			return thisDate;
		}
		if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime")) {
			return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
		}
		if (thisDate.getClass().toString().equals("class java.util.Date")) {
			return new Date(thisDate.getTime());
		}
		if (thisDate.getClass().toString().equals("class java.lang.String")) {
			return new Date(String(thisDate));
		}
	}
	if (typeof(thisDate) == "number") {
		return new Date(thisDate);  // assume milliseconds
	}
	logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
	return null;
}

function jsDateToMMDDYYYY(pJavaScriptDate) {
	//converts javascript date to string in MM/DD/YYYY format
	if (pJavaScriptDate != null) {
		if (Date.prototype.isPrototypeOf(pJavaScriptDate)) {
			return (pJavaScriptDate.getMonth()+1).toString()+"/"+pJavaScriptDate.getDate()+"/"+pJavaScriptDate.getFullYear();
		} else {
			logDebug("Parameter is not a javascript date");
			return ("INVALID JAVASCRIPT DATE");
		}
	} else {
		logDebug("Parameter is null");
		return ("NULL PARAMETER VALUE");
	}
}

function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}

function debugObject(object) {
	 var output = ''; 
	 for (property in object) { 
	   output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	 } 
	 logDebug(output);
} 

function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000)
}

function logDebug(dstr) {
	if(showDebug) {
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"),dstr)
	}
}

function exists(eVal, eArray) {
	  for (ii in eArray)
	  	if (eArray[ii] == eVal) return true;
	  return false;
}

//
// matches:  returns true if value matches any of the following arguments
//
function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 
function isOdd(n) 
{
   return Math.abs(n % 2) == 1;
}
function isEven(n) 
{
    return n % 2 == 0;
}