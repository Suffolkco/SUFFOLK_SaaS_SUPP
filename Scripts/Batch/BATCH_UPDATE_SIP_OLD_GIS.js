/*------------------------------------------------------------------------------------------------------/
| Program:BATCH_DEQ_WM_ADD_FEES.js: Batch
| 
| This batch script will run one time to add fees 
| Record ranges:R02180195-ZEC TO R02180215-ZEC, R02180233-ZEC TO R02180237-ZEC, R02180265-ZEC TO R02180315-ZEC
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
var emailAddress = "bhandhavya.nadagoud@scubeenterprises.com";
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
        aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_DEQ_WM_ADD_FEES", emailText);
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
      
		// Test one record
        var vSQL = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.SERV_PROV_CODE = 'SUFFOLKCO' and B1_PER_GROUP = 'DEQ' and B1_PER_CATEGORY = 'Application' AND  B1.B1_PER_SUB_TYPE = 'SIP' AND B1.B1_PER_TYPE = 'Ecology' and B1.B1_ALT_ID NOT LIKE '%TMP%' and B1.B1_ALT_ID LIKE '%G-23%'"
		// First set R02180195-ZEC TO R02180215-ZEC		  
		//var vSQL = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.B1_ALT_ID IN ('G-24-00144')";
		// Second set R02180233-ZEC TO R02180237-ZEC
		//var vSQL = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.B1_ALT_ID IN ('R02180233-ZEC','R02180234-ZEC','R02180235-ZEC','R02180236-ZEC','R02180237-ZEC')";
		// Third set R02180265-ZEC TO R02180315-ZEC
		//var vSQL = "SELECT B1.B1_ALT_ID as recordNumber FROM B1PERMIT B1 WHERE B1.B1_ALT_ID IN ('R02180265-ZEC','R02180266-ZEC','R02180267-ZEC','R02180268-ZEC','R02180269-ZEC','R02180270-ZEC','R02180271-ZEC','R02180272-ZEC','R02180273-ZEC','R02180274-ZEC','R02180275-ZEC','R02180276-ZEC','R02180277-ZEC','R02180278-ZEC','R02180279-ZEC','R02180280-ZEC','R02180281-ZEC','R02180282-ZEC','R02180283-ZEC','R02180284-ZEC','R02180285-ZEC','R02180286-ZEC','R02180287-ZEC','R02180288-ZEC','R02180289-ZEC','R02180290-ZEC','R02180291-ZEC','R02180292-ZEC','R02180293-ZEC','R02180294-ZEC','R02180295-ZEC','R02180296-ZEC','R02180297-ZEC','R02180298-ZEC','R02180299-ZEC','R02180300-ZEC','R02180301-ZEC','R02180302-ZEC','R02180303-ZEC','R02180304-ZEC','R02180305-ZEC','R02180306-ZEC','R02180307-ZEC','R02180308-ZEC','R02180309-ZEC','R02180310-ZEC','R02180311-ZEC','R02180312-ZEC','R02180313-ZEC','R02180314-ZEC','R02180315-ZEC')";

        var output = "Record ID\n";  		
        
		// SQL to pull active OPC site records that has NO child Tank records		
		var recordIDs = doSQLSelect_local(vSQL);  	
	    var count = 0;
		logDebugLocal("Pulling number of records:" +  recordIDs.length);		
		for (r in recordIDs)
		{
			recordID = recordIDs[r]["recordNumber"];      
			logDebugLocal("Setting GIS for record: " + recordID);			
			capId = getApplication(recordID);
			capIDString = capId.getCustomID();
			//logDebugLocal("Setting GIS for capId: " + capId);
			cap = aa.cap.getCap(capId).getOutput();
			//logDebugLocal("cap: " + cap);
			if (cap)
			{
				 count++;
 var AInfo = new Array();
                            loadAppSpecific(AInfo);

var parcelNumber= getFirstParcelFromCapId(capId);
var townIdentifier = parcelNumber.slice(0, 2);
					var town = lookup("TaxNumTownMapping", townIdentifier);
					editAppSpecific("Town", town,capId);
editContactType("Applicant", "Property Owner", capId);

				//logDebugLocal("LD" +getGISInfo_Custom("SUFFOLKCO_ACA","LegislativeDistrict","NAME"));
				//logDebugLocal("Batch Job " + batchJobName + "Added GIS for : " + capIDString);  
				 // Sewer District
                  editAppSpecific("Sewer District Name", getGISInfo_Custom("SUFFOLKCO_ACA","SanitationDistrictPolygon","SHORTNAME"), capId); 

                  // Legislative District
                  editAppSpecific("Legislative District", getGISInfo_Custom("SUFFOLKCO_ACA","LegislativeDistrict","NAME"), capId); 

                  // Priority Area 
                  editAppSpecific("Priority Area", getGISInfo_Custom("SUFFOLKCO_ACA","ReclaimWaterPolygon","PRIORITY"), capId);


					if (AInfo["Catastrophic Failure"] == "Yes")
					  editAppSpecific("SCORE", 100, capId); 
					if (AInfo["Non-Catastrophic"] == "Yes" && AInfo["Catastrophic Failure"] == "No")
					  editAppSpecific("SCORE", 90, capId); 
					if (AInfo["Priority Area"] == "Priority 1" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 80,capId); 
					if (AInfo["Priority Area"] == "Priority 2" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 70,capId); 
					if (AInfo["Priority Area"] == "No Priority" && AInfo["Catastrophic Failure"] == "No" &&  AInfo["Non-Catastrophic"] == "No")
					  editAppSpecific("SCORE", 60,capId);
			}
		}
			
		logDebugLocal("Total Records Processed" +count);  
	
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

function editContactType(existingType,newType)
//Function will change contact types from exsistingType to newType, 
//optional paramter capID
{    
    if (arguments.length==3)
    updateCap=arguments[2]
    capContactResult = aa.people.getCapContactByCapID(updateCap);
    if (capContactResult.getSuccess())
	{
        Contacts = capContactResult.getOutput();
        for (yy in Contacts)
		{
		var theContact = Contacts[yy].getCapContactModel();
		if(theContact.getContactType() == existingType)
			{
			theContact.setContactType(newType);
			var peopleModel = theContact.getPeople();
			var contactAddressrs = aa.address.getContactAddressListByCapContact(theContact);
			if (contactAddressrs.getSuccess())
			{
				var contactAddressModelArr = convertContactAddressModelArr(contactAddressrs.getOutput());
				peopleModel.setContactAddressList(contactAddressModelArr);    
			}
			aa.people.editCapContactWithAttribute(theContact);
			//logDebug("Contact for " + theContact.getFullName() + " Updated to " + newType);
			}
		}
	}
 }

function lookup(stdChoice,stdValue) 
	{
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);
	
   	if (bizDomScriptResult.getSuccess())
   		{
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
	else
		{
		logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
	return strControl;
	}


  function getFirstParcelFromCapId(capId)
{
		var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
							if (capParcelResult.getSuccess())
							{
								var Parcels = capParcelResult.getOutput().toArray();
							}

							for ( i in Parcels)
							{
							var parcelNumber = Parcels[0].getParcelNumber();
							}

		return parcelNumber;
}


function getGISInfo_Custom(svc,layer,attributename)
	{
	// use buffer info to get info on the current object by using distance 0
	// usage: 
	//
	// x = getGISInfo("flagstaff","Parcels","LOT_AREA");
	//
	
	var distanceType = "feet";
	var retString;
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
var parcelNumber= getParcelForCapId();
if(parcelNumber)
{
	var gisObjResult = aa.gis.getParcelGISObjects(parcelNumber); // get gis objects on the parcel number
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
				}
			
			}
		}
		}
	return retString
	}
	
	
				function getParcelForCapId()
{
 var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
    if (capParcelResult.getSuccess())
    {
        var Parcels = capParcelResult.getOutput().toArray();
        for (zz in Parcels)
        {
            var parcelNumber = Parcels[0].getParcelNumber();
            logDebug("parcelNumber = " + parcelNumber);
return parcelNumber;
        }
    }
}


function getGISInfo(svc,layer,attributename)
	{
	// use buffer info to get info on the current object by using distance 0
	// usage: 
	//
	// x = getGISInfo("flagstaff","Parcels","LOT_AREA");
	//
	
	var distanceType = "feet";
	var retString;
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], "0", distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
				}
			
			}
		}
	return retString
	}
	
	
	
function editAppSpecific(itemName,itemValue)  // optional: itemCap
{
	var itemCap = capId;
	var itemGroup = null;
	if (arguments.length == 3) itemCap = arguments[2]; // use cap ID specified in args
   	
  	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		itemGroup = itemName.substr(0,itemName.indexOf("."));
		itemName = itemName.substr(itemName.indexOf(".")+1);
	}
   	
   	var appSpecInfoResult = aa.appSpecificInfo.editSingleAppSpecific(itemCap,itemName,itemValue,itemGroup);

	if (appSpecInfoResult.getSuccess())
	 {
	 	if(arguments.length < 3) //If no capId passed update the ASI Array
	 		AInfo[itemName] = itemValue; 
	} 	
	else
		{ logDebug( "WARNING: " + itemName + " was not updated."); }
}


function addLocalFee(fcode, fsched, fperiod, fqty, finvoice)
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
	logDebugLocal("Create fee item: " + feeCap + fsched+ fcode + fperiod + fqty);
	assessFeeResult = aa.finance.createFeeItem(feeCap, fsched, fcode, fperiod, fqty);
	if (assessFeeResult.getSuccess())
	{
		logDebugLocal("assessFeeResult success.");
		feeSeq = assessFeeResult.getOutput();
		logDebugLocal("Successfully added Fee " + fcode + ", Qty " + fqty + feeCapMessage);
		
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
				logDebugLocal("Invoicing assessed fee items" + feeCapMessage + " is successful.");
			}
			else
			{
				logDebugLocal("**ERROR: Invoicing the fee items assessed" + feeCapMessage + " was not successful.  Reason: " + invoiceResult.getErrorMessage());
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
function logDebug(dstr) {
	vLevel = 1
	if (arguments.length > 1)
		vLevel = arguments[1];
	if ((showDebug & vLevel) == vLevel || vLevel == 1)
		debug += dstr + br;
	if ((showDebug & vLevel) == vLevel)
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
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

function renewPermit() {
	var itemCap = capId;
	var itemCapIDString = capIDString;

	// 1. in case this cap is already a renewal record, we should work in the parent context
	if (itemCapIDString.indexOf('-REN') > 1) {
		var parentsArr = getParents(appTypeString);
		if (parentsArr && parentsArr.length > 0) {
			itemCap = parentsArr[0];
			itemCapIDString = itemCap.getCustomID();
		} else {
			logDebug(
				'**Error: parent permit cap is not linked to this renewal record.'
			);
			return null;
		}
	}
	var migratedRec = false;
	if (itemCapIDString.indexOf('-') == -1) migratedRec = true;

	// 2. Get next child Seq
	var seqArr = new Array();
	var childrenArr = getChildren(appTypeString, itemCap);
	if (childrenArr)
		for (cIdx in childrenArr) {
			if (
				!migratedRec &&
				childrenArr[cIdx].getCustomID().indexOf(itemCapIDString + '-REN') > -1
			) {
				var seqVal = parseInt(
					childrenArr[cIdx].getCustomID().replace(itemCapIDString + '-REN', '')
				);
				if (!isNaN(seqVal)) seqArr.push(seqVal);
			} else if (
				migratedRec &&
				childrenArr[cIdx].getCustomID().indexOf('-REN') > -1
			) {
				var repTxt = childrenArr[cIdx]
					.getCustomID()
					.substr(
						childrenArr[cIdx].getCustomID(),
						childrenArr[cIdx].getCustomID().indexOf('-REN') + 4
					);
				var seqVal = parseInt(
					childrenArr[cIdx].getCustomID().replace(repTxt, '')
				);
				if (!isNaN(seqVal)) seqArr.push(seqVal);
			}
		}

	// 3. Create Child
	var childCapId = createCap(appTypeString, '');

	// 4. set cap altid
	var childNewAltID = itemCapIDString + '-REN01';
	if (migratedRec) childNewAltID = childCapId.getCustomID() + '-REN01';
	if (seqArr.length > 0) {
		lastSeq =
			seqArr.sort(function (a, b) {
				return b - a;
			})[0] + 1;
		if (migratedRec)
			childNewAltID =
				childCapId.getCustomID() +
				'-REN' +
				(String(lastSeq).length > 1 ? lastSeq : '0' + String(lastSeq));
		else
			childNewAltID =
				itemCapIDString +
				'-REN' +
				(String(lastSeq).length > 1 ? lastSeq : '0' + String(lastSeq));
	}
	aa.cap.updateCapAltID(childCapId, childNewAltID);

	childCapId = aa.cap.getCapID(childNewAltID).getOutput();
}