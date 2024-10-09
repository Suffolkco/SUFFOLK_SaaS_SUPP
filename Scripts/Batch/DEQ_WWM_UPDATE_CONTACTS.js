/*------------------------------------------------------------------------------------------------------/
| Program:DEQ_WWM_UPDATE_CONTACTS.js Batch
| 
| This batch script will run one time to update reference contact email
|
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
    if (!timeExpired) 
    {
        mainProcess();
        //logDebugLocal("End of Job: Elapsed Time : " + elapsed() + " Seconds");
        logDebugLocal("End Date: " + startDate + br);		
        aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "Batch Job - DEQ_WWM_UPDATE_CONTACTS", emailText);
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
		// TEST data
		
	
		// SUPP
		// 1. Global reference contact
		//var vSQL = "select distinct G1_CONTACT_NBR contactId, G1_CONTACT_TYPE as contactType, G1_FULL_NAME as fullName, G1_FNAME as firstName, G1_LNAME as lastName, G1_EMAIL as email from G3CONTACT where G1_EMAIL like 'astolzenberg@________bbvpc.com'";
		// Reference record contact
		//var vSQL = "select distinct CONTACT_REF_ID as contactId from V_CONTACT where RECORD_MODULE = 'DEQ' and EMAIL like 'astolzenberg@________bbvpc.com' and CONTACT_REF_ID is NOT NULL";
		// 2. In SUPP Transaction contact		
		var vSQL = "select b1.B1_ALT_ID as recordId, B1_CONTACT_NBR as contactId, b3.B1_CONTACT_TYPE, b3.B1_EMAIL from b1permit b1, b3contact b3 where b1.serv_prov_code = 'SUFFOLKCO' AND B1.SERV_PROV_CODE = B3.SERV_PROV_CODE AND B1.B1_PER_ID1 = B3.B1_PER_ID1 AND B1.B1_PER_ID2 = B3.B1_PER_ID2 AND B1.B1_PER_ID3 = B3.B1_PER_ID3 AND  b3.B1_EMAIL = 'astolzenberg@________bbvpc.com'";

		// SUPP data
		var oldEmail = 'astolzenberg@________bbvpc.com';		
		var newEmail = 'PELS@________BBVPC.com';
	

		// PROD data
		//var oldEmail = 'AStolzenberg@BBVPC.com';		
		//var newEmail = 'PELS@BBVPC.com';
		var newFirstName = 'Joseph';
		var newLastName = 'Marx';
		var newFullName = 'Joseph Marx';

		// PROD
		// 1. Update reference contact name only:
        //var vSQL = "select distinct G1_CONTACT_NBR contactId, G1_CONTACT_TYPE as contactType, G1_FULL_NAME as fullName, G1_FNAME as firstName, G1_LNAME as lastName, G1_EMAIL as email from G3CONTACT where G1_EMAIL like 'AStolzenberg@BBVPC.com'";
		
		// 2. PROD Transaction contact 
		//var vSQL = "select b1.B1_ALT_ID as recordId, B1_CONTACT_NBR as contactId, b3.B1_CONTACT_TYPE from b1permit b1, b3contact b3 where b1.serv_prov_code = 'SUFFOLKCO' AND B1.SERV_PROV_CODE = B3.SERV_PROV_CODE AND B1.B1_PER_ID1 = B3.B1_PER_ID1 AND B1.B1_PER_ID2 = B3.B1_PER_ID2 AND B1.B1_PER_ID3 = B3.B1_PER_ID3 AND  b3.B1_EMAIL = 'AStolzenberg@BBVPC.com'";


		// Optional:  Retrieve all contacts with the email
		//var vSQL ="select * from b1permit b1, b3contact b3 where b1.serv_prov_code = 'SUFFOLKCO' and b1.b1_per_group = 'DEQ' and b1.b1_PER_TYPE = 'WWM' AND B1.SERV_PROV_CODE = B3.SERV_PROV_CODE AND B1.B1_PER_ID1 = B3.B1_PER_ID1 AND B1.B1_PER_ID2 = B3.B1_PER_ID2 AND B1.B1_PER_ID3 = B3.B1_PER_ID3 and b3.B1_EMAIL in ('AStolzenberg@BBVPC', 'aStolzenberg@BBVPC')";
		
		
		var count = 0;
		var noCount = 0;
		var vResult = doSQLSelect_local(vSQL);  	     

		logDebugLocal("Total number of reference ID with that email address: " +  vResult.length);	
		// 1. 
		// Comment this section when updating transaction reference contact
		// Update all reference contact with email address *****************
		/*
		for (r in vResult)
        {
            refNum = vResult[r]["contactId"];      
			recordId = vResult[r]["recordId"];      
			ct = vResult[r]["contactType"];  
			em = vResult[r]["email"];  
			fn = vResult[r]["firstName"];  
			ln = vResult[r]["lastName"];  
			fullName =  vResult[r]["fullName"];  

			logDebugLocal("Contact Type: " + ct + ", Email: " + em + ", Full Name: " + fullName);

			var refConResult = aa.people.getPeople(refNum);
			if (refConResult.getSuccess()) {
				var refPeopleModel = refConResult.getOutput();
				if (refPeopleModel != null) {
					pm = refPeopleModel;
					logDebugLocal("***************************");
					logDebugLocal("Current email: " + pm.getEmail());
					logDebugLocal("Current first: " + pm.getFirstName());
					logDebugLocal("Current last: " + pm.getLastName());
					logDebugLocal("Current full: " + pm.getFullName());
					if (!matches(pm.getEmail(), null, "", undefined)) 
					{
						if (matches(pm.getEmail().toUpperCase(), oldEmail.toUpperCase()))
						{
							pm.setFirstName(newFirstName);
							pm.setLastName(newLastName);
							pm.setFullName(newFullName);			
							pm.setEmail(newEmail);
							var result = aa.people.editPeopleWithAttribute(pm, pm.getAttributes());

							if (result.getSuccess()) {
								logDebugLocal("Successfully update the contact " + refNum + " with name");
								var refConResult1 = aa.people.getPeople(refNum);
								if (refConResult1.getSuccess()) {
									var refPeopleModel1 = refConResult1.getOutput();
									if (refPeopleModel1 != null) {
										pm1 = refPeopleModel1;
										logDebugLocal("Updated email: " + pm1.getEmail());
										logDebugLocal("Updated first: " + pm1.getFirstName());
										logDebugLocal("Updated last: " + pm1.getLastName());
										logDebugLocal("Updated full: " + pm1.getFullName());
										logDebugLocal("***************************");
									}
								}
								count++;
							}	
							else{
								logDebugLocal("Unable to update the reference contact");
							}
						}
					}
					else
					{
						logDebugLocal(refNum + " contact ID does not have email address of " + oldEmail + ". Do not update.");
						noCount++;
					}
				}
			}
		}
		logDebugLocal("********************************");
		logDebugLocal ("Total updated: " + count);
		
		*/
		//Uncomment this section for transaction contact query
		// 2.  Update all record contacts with email address *****************
		for (r in vResult)
		{
			recordId = vResult[r]["recordId"];      
			contactId = vResult[r]["contactId"];           
			capId = getApplication(recordId);
			capIDString = capId.getCustomID();
			cap = aa.cap.getCap(capId).getOutput();
			if (cap)
			{
				var t = aa.people.getCapContactByCapID(capId);
				if (t.getSuccess())
				{
					capPeopleArr = t.getOutput();
					for (cp in capPeopleArr)
					{
						var currentContactEmail = capPeopleArr[cp].getCapContactModel().getPeople().getEmail();
						if (!matches(oldEmail, null, '', undefined))
						{
							oldEmail = oldEmail.toUpperCase();
						}
						if (!matches(currentContactEmail, null, '', undefined))
						{
							currentContactEmail = currentContactEmail.toUpperCase();
						}

						if(matches(oldEmail, currentContactEmail))
						{
							logDebugLocal("******* Record ID ******* " + capIDString);
							logDebugLocal("Contact Type: " + capPeopleArr[cp].getCapContactModel().getContactType());			
							logDebugLocal("First, Last, Full Name: " + capPeopleArr[cp].getCapContactModel().getFirstName() + ", "
							+ capPeopleArr[cp].getCapContactModel().getLastName() + ", "
							+ capPeopleArr[cp].getCapContactModel().getFullName());				
							recordContactId = capPeopleArr[cp].getCapContactModel().getContactSeqNumber();
							logDebugLocal("Contact Seq: " + recordContactId);							
							var refContactNum = capPeopleArr[cp].getCapContactModel().getRefContactNumber();
							logDebugLocal("Reference sequence Number: " + refContactNum);																
							logDebugLocal("Email in contact:" + currentContactEmail + "| Contact ID:  " + recordContactId);  
							capPeopleArr[cp].getCapContactModel().getPeople().setEmail(newEmail);
							capPeopleArr[cp].getCapContactModel().getPeople().setFirstName(newFirstName);
							capPeopleArr[cp].getCapContactModel().getPeople().setLastName(newLastName);
							capPeopleArr[cp].getCapContactModel().getPeople().setFullName(newFullName);
							//3.3.2 Edit People with source People information.                                 
							aa.people.editCapContactWithAttribute(capPeopleArr[cp].getCapContactModel());										
							logDebugLocal("Email set:" + capPeopleArr[cp].getCapContactModel().getPeople().getEmail());   
							logDebugLocal("First Name set:" + capPeopleArr[cp].getCapContactModel().getPeople().getFirstName());  
							logDebugLocal("Last Name set:" + capPeopleArr[cp].getCapContactModel().getPeople().getLastName());  
							logDebugLocal("Full Name set:" + capPeopleArr[cp].getCapContactModel().getPeople().getFullName());       
							count++;
						}
						else
						{
							logDebugLocal(capIDString + ": Email does not match: " + currentContactEmail + ", " + oldEmail + ", Contact type: " + capPeopleArr[cp].getCapContactModel().getContactType());
							noCount++;
						}
						
					}

				}	
			} 
		} 
	}		
    catch (err) 
    {
        logDebugLocal("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
	logDebugLocal("Total number of successfully update with email address: " + count);
	logDebugLocal("Total number that did not have an update with email address: " + noCount);
    logDebugLocal("End of Job: Elapsed Time : " + elapsed() + " Seconds");    
}


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
function isNumeric(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
  }

function finalCheck(totalCapacity, capId, capIDString)
{
	//logDebugLocal("Final Check capcity total: " + totalCapacity);
	if (totalCapacity > 1100)
	{
		//editAppSpecific("Article 18 Regulated Site", "Yes", capId);
		logDebugLocal("Final Check capacity > 1100: " + totalCapacity + "," + capIDString);
		
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
		var conn = aa.db.getConnection();
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