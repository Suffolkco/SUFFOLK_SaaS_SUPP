/*------------------------------------------------------------------------------------------------------/
| Script Name			: BATCH_VENDOR_ADDRESS_COPY.js
| Event					: Batch
| Description   		: Copies contact type 'Vendor' address to record address & writes vendor info to Short Notes
| Author				: nalbert
| Date					: June, 2021
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
emailText = "";
message = "";
br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 3.0;
eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getMasterScriptText("INCLUDES_ACCELA_GLOBALS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}
/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

try {

showDebug = true;
showMessage = false;
if (String(aa.env.getValue("showDebug")).length > 0) {
	showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
}
override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

var currentUserID = "ADMIN";
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) {
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
} else {
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
// Get parameters
/* var appGroup = getParam("appGroup");
var appTypeType = getParam("appTypeType");
var appSubtype = getParam("appSubType");
var appCategory = getParam("appCategory");
var appStatusList = getParam("appStatusList");
var emailAddress = getParam("emailAddress"); */ 

//test parms 

//ConsumerAffairs/Licenses/Home Improvement/NA
var batchJobEngine = aa.proxyInvoker.newInstance("com.accela.aa.aamain.batch.BatchJobParameterBusiness").getOutput();
var batchJobParams = batchJobEngine.getParamMap(aa.getServiceProviderCode(), "BATCH_VENDOR_ADDRESS_COPY");

var appGroup = "ConsumerAffairs"; // batchJobParams.get("appGroup"); 
var appTypeType = "*"; // batchJobParams.get("appTypeType");
var appSubtype = "*"; // batchJobParams.get("appSubtype");
var appCategory = "*"; // batchJobParams.get("appCategory");
//var appStatusList = batchJobParams.get("appStatusList");
var emailAddress = "nalbert@acclea.com"; //batchJobParams.get("emailAddress"); 

/* ----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var systemUserObj = aa.person.getUser("ADMIN").getOutput();

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

} catch (err) {
	logDebug("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

try {
	mainProcess();
	logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");

if (emailAddress.length)
	aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);

} catch (err) {
	logDebug("ERROR: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
	//Counters
	var capCount = 0;
	var totalCapsUpdated = 0;
	var totalCapsNoVendor = 0;
	var totalNewAddresses = 0;
	var capsNoVendor = new Array();
	var testCount = 0;
	
	var timeExpired = false;

	//Timeout variable
	var maxSeconds = 300 * 60;  // max out at 5 hours
	
	var paramRecordType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;
	
	var capsList = getCaps_Query(paramRecordType,null,null);
	logDebug("<br>**INFO Records List found: " + capsList.length);
		
	//Process record list
	for (var cc in capsList)  {			
		/* if (cc == 10000){
			//logDebug("stopping here: " + cc);
			break;
		}  */
		testCount++;
		
		//Time constraint
		if (elapsed() > maxSeconds){
			logDebug("Job took longer than allowed. Breaking...");
			break;
		}
		
		showDebug = true;
		var vendorInfo;
		
		var CACapId = capsList[cc];
		var capOutput = aa.cap.getCap(CACapId).getOutput();
		var altId = CACapId.getCustomID();
		
		//logDebug("Record " + altId);
		
		var contactType = "Vendor";

		vendorInfo = getVendorInfo(contactType, CACapId);
		if(vendorInfo == false){
			totalCapsNoVendor++;
			capsNoVendor.push(altId);
			//logDebug("No vendor contact exists on this record");
		}else{
			// copy Vendor address to record address
			var vAddrLine1 = vendorInfo[0];
			var vCity = vendorInfo[1];
			var vState = vendorInfo[2];
			var vZip = vendorInfo[3];
			var vAddress = new Array();
			vAddress.push(vAddrLine1);
			vAddress.push(vCity);
			vAddress.push(vState);
			vAddress.push(vZip);
			var newAddress = createNewAddressLocal(vAddress, CACapId);
			/* if(newAddress){
				totalNewAddresses++;
			} */
			
			// copy Vendor name, org name & phone to short notes
			var fName = vendorInfo[4];
			var lName = vendorInfo[5];
			var vbusiness = vendorInfo[6];
			var vPhone = vendorInfo[7];
			if(matches(vPhone, null, " ")){
				vPhone = " ";
			}
			var shortNotesString = fName + " " + lName + ", " + vbusiness + ", " + vPhone;
			updateShortNotesLocal(shortNotesString, CACapId); 
			
			totalCapsUpdated++;
			if(testCount == 1000){
				logDebug("Updated record: " + altId);
				testCount = 0;
			}
		}
		
		capCount++;
		
	} //capsList loop
		
	logDebug("Total Records Found: " + capCount);
	//logDebug("Total addresses added: " + totalNewAddresses);
	logDebug("Total Records successfully updated: " + totalCapsUpdated);
	logDebug("Total Records without a Vendor Contact Type: " + totalCapsNoVendor + ": ");
	
	//write out caps without a vendor contact type
	for(x in capsNoVendor){
		logDebug(capsNoVendor[x]);
	}
	
} // mainProcess
/*-----------------------------------------------------------
Helper Functions
------------------------------------------------------------*/

// custom processing functions go here

function getVendorInfo(cType, capId) {
	var returnArray = new Array();
	var haveCType = false;
	
	var contModel = null; 
	var consResult = aa.people.getCapContactByCapID(capId);	
	if (consResult.getSuccess()) {
		var cons = consResult.getOutput();
		for (thisCon in cons) {
			var capContactType = cons[thisCon].getCapContactModel().getPeople().getContactType();
			if (capContactType == cType) {				
				var contModel = cons[thisCon].getCapContactModel(); 
				
				var firstName = contModel.getFirstName();
				var lastName = contModel.getLastName();
				var business = contModel.getBusinessName();
				var phone = contModel.getPhone1();
				var addr1 = contModel.getAddressLine1();
				var city = contModel.getCity();
				var state = contModel.getState();
				var zip = contModel.getZip();
				
				// build returnArray
				returnArray.push(addr1);
				returnArray.push(city);
				returnArray.push(state);
				returnArray.push(zip);
				returnArray.push(firstName);
				returnArray.push(lastName);
				returnArray.push(business);
				returnArray.push(phone);
				return returnArray;
				haveCType = true;
			}
		}
	}
	if (haveCType == false){
		return false;
	}
}

function createNewAddressLocal(address, capId){
	// check if one already exists
	/* var haveAddress = false;
	var addressList = aa.address.getAddressByCapId(capId);
	if (addressList.getSuccess()) {
		var addressArray = addressList.getOutput();
		if (addressArray.length > 0) {
			//logDebug("An address already exists on this record");
			haveAddress = true;
		}
	}		
	if(!haveAddress){ */ // per customer - add address even if one already exists on record, make new one primary
	
		var newAddr1 = address[0];
		var newCity = address[1];
		var newState = address[2];
		var newZip = address[3];
		
		var newAddressModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.address.AddressModel").getOutput();
		newAddressModel.setCapID(capId);
		newAddressModel.setServiceProviderCode(aa.getServiceProviderCode());
		newAddressModel.setAuditID("ADMIN");
		newAddressModel.setPrimaryFlag("Y"); 

		// per customer - add address to BOTH AddressLine1 and StreetName
		newAddressModel.setAddressLine1(newAddr1);
		newAddressModel.setStreetName(newAddr1);
		newAddressModel.setCity(newCity);
		newAddressModel.setState(newState);
		newAddressModel.setZip(newZip);

		aa.address.createAddress(newAddressModel);
		//logDebug("Added record address " + newAddr1 + ", " + newCity + ", " + newState + ", " + newZip + " successfully!");
		return true;
		
	//}
}


function updateShortNotesLocal(newSN){ // option CapId
	var itemCap = capId
	if (arguments.length > 1) itemCap = arguments[1]; // use cap ID specified in args

	var cdScriptObjResult = aa.cap.getCapDetail(itemCap);
	if (!cdScriptObjResult.getSuccess())
		{ logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage()) ; return false; }

	var cdScriptObj = cdScriptObjResult.getOutput();

	if (!cdScriptObj)
		{ logDebug("**ERROR: No cap detail script object") ; return false; }

	cd = cdScriptObj.getCapDetailModel();

	cd.setShortNotes(newSN);

	cdWrite = aa.cap.editCapDetail(cd)

	if (!cdWrite.getSuccess()){ 
		logDebug("**ERROR writing capdetail : " + cdWrite.getErrorMessage()); 
		return false ; 
	}
	// else{
		// logDebug("updated short notes to " + newSN);
	// }
}



/*
|  some standard helper functions
*/  
function getParam(pParamName) //gets parameter value and logs message showing param value
{
	var ret = "" + aa.env.getValue(pParamName);
	// logDebug("Parameter : " + pParamName + " = " + ret);
	return ret;
}
function elapsed() {
	var thisDate = new Date();
	var thisTime = thisDate.getTime();
	return ((thisTime - startTime) / 1000);
}

function logDebug(dstr) {
	aa.print(dstr + "\n");
	aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
}


/// record query
function getCaps_Query(recordType,lstRecordStatuses,lstIgnoreRecordStatuses){
    //var _q = "SELECT B.B1_ALT_ID, B.B1_PER_ID1, B.B1_PER_ID2, B.B1_PER_ID3 FROM B1PERMIT B INNER JOIN R3APPTYP R3AT ON 1 = 1 AND B.SERV_PROV_CODE = R3AT.SERV_PROV_CODE AND B.B1_PER_GROUP = R3AT.R1_PER_GROUP AND B.B1_PER_TYPE = R3AT.R1_PER_TYPE AND B.B1_PER_SUB_TYPE = R3AT.R1_PER_SUB_TYPE AND B.B1_PER_CATEGORY = R3AT.R1_PER_CATEGORY AND R3AT.REC_STATUS = 'A' WHERE 1 = 1 AND B.REC_STATUS = 'A' AND B.SERV_PROV_CODE = '?ServProvCode' AND (UPPER(B.B1_APPL_CLASS) = 'COMPLETE' OR B.B1_APPL_CLASS IS NULL) AND (R3AT.R1_PER_GROUP + '/' + R3AT.R1_PER_TYPE + '/' + R3AT.R1_PER_SUB_TYPE + '/' + R3AT.R1_PER_CATEGORY) IN (?RecordTypeArray) AND R3AT.R1_PER_GROUP IN(?InGroup) AND R3AT.R1_PER_TYPE IN(?InType) AND R3AT.R1_PER_SUB_TYPE IN(?InSubType) AND R3AT.R1_PER_CATEGORY IN(?InCategory) AND ISNULL(B.B1_APPL_STATUS,'-1') IN (?InStatuses) AND ISNULL(B.B1_APPL_STATUS,'-1') NOT IN (?NotInStatuses)"
    var _q = "SELECT B.B1_ALT_ID, B.B1_PER_ID1, B.B1_PER_ID2, B.B1_PER_ID3 FROM B1PERMIT B INNER JOIN R3APPTYP R3AT ON 1 = 1 AND B.SERV_PROV_CODE = R3AT.SERV_PROV_CODE AND B.B1_PER_GROUP = R3AT.R1_PER_GROUP AND B.B1_PER_TYPE = R3AT.R1_PER_TYPE AND B.B1_PER_SUB_TYPE = R3AT.R1_PER_SUB_TYPE AND B.B1_PER_CATEGORY = R3AT.R1_PER_CATEGORY AND R3AT.REC_STATUS = 'A' WHERE 1 = 1 AND B.REC_STATUS = 'A' AND B.SERV_PROV_CODE = '?ServProvCode' AND (UPPER(B.B1_APPL_CLASS) = 'COMPLETE' OR B.B1_APPL_CLASS IS NULL) AND R3AT.R1_PER_GROUP IN(?InGroup) AND R3AT.R1_PER_TYPE IN(?InType) AND R3AT.R1_PER_SUB_TYPE IN(?InSubType) AND R3AT.R1_PER_CATEGORY IN(?InCategory) AND ISNULL(B.B1_APPL_STATUS,'-1') IN (?InStatuses) AND ISNULL(B.B1_APPL_STATUS,'-1') NOT IN (?NotInStatuses)"
                var result = new Array();
                var singleQuote = "'";

                //var _defaultrecordTypes = "R3AT.R1_PER_GROUP + '/' + R3AT.R1_PER_TYPE + '/' + R3AT.R1_PER_SUB_TYPE + '/' + R3AT.R1_PER_CATEGORY"; 
                var _defaultrecordStatuses = "ISNULL(B.B1_APPL_STATUS, '-1')"; 
                var _defaultignoreRecordStatuses = "'-2'"; 
                var _defaultcapGroup = "R3AT.R1_PER_GROUP"; 
                var _defaultcapType = "R3AT.R1_PER_TYPE"; 
                var _defaultcapSubType = "R3AT.R1_PER_SUB_TYPE"; 
    var _defaultcapCategory = "R3AT.R1_PER_CATEGORY";

                //var recordTypes = _defaultrecordTypes; 
                var recordStatuses = _defaultrecordStatuses; 
                var ignoreRecordStatuses = ignoreRecordStatuses; 
                var capGroup = _defaultcapGroup; 
                var capType = _defaultcapType; 
                var capSubType = _defaultcapSubType; 
    var capCategory = _defaultcapCategory;
                                                
/*     if(lstRecordTypes && lstRecordTypes.length > 0){
        recordTypes = singleQuote + lstRecordTypes.join("','").toString() + singleQuote;
    }
    else{
        recordTypes = _defaultrecordTypes;
    }
*/
    if(lstRecordStatuses && lstRecordStatuses.length > 0){
        recordStatuses = singleQuote + lstRecordStatuses.join("','").toString() + singleQuote;
    }
    else{
        recordStatuses = _defaultrecordStatuses;
    }

    if(lstIgnoreRecordStatuses && lstIgnoreRecordStatuses.length > 0){
        ignoreRecordStatuses = singleQuote + lstIgnoreRecordStatuses.join("','").toString() + singleQuote;
    }
    else{
        ignoreRecordStatuses = _defaultignoreRecordStatuses;
    }

    if(recordType){
        var recordTypeArray = recordType.split("/");
        if(recordTypeArray.length == 4){
            if(recordTypeArray[0] == "*"){
                capGroup = _defaultcapGroup;
            }
            else{
                capGroup = singleQuote + recordTypeArray[0] + singleQuote;
            }

            if(recordTypeArray[1] == "*"){
                capType = _defaultcapType;
            }
            else{
                capType = singleQuote + recordTypeArray[1] + singleQuote;
            }

            if(recordTypeArray[2] == "*"){
                capSubType = _defaultcapSubType;
            }
            else{
                capSubType = singleQuote + recordTypeArray[2] + singleQuote;
            }

            if(recordTypeArray[3] == "*"){
                capCategory = _defaultcapCategory;
            }
            else{
                capCategory = singleQuote + recordTypeArray[3] + singleQuote;
            }
        }
    }

    _q = _q.replace("?ServProvCode",servProvCode);
    //_q = _q.replace("?RecordTypeArray",recordTypes);
    _q = _q.replace("?InGroup",capGroup);
    _q = _q.replace("?InType",capType);
    _q = _q.replace("?InSubType",capSubType);
    _q = _q.replace("?InCategory",capCategory);
    _q = _q.replace("?InStatuses",recordStatuses);
    _q = _q.replace("?NotInStatuses",ignoreRecordStatuses);
    
    aa.print("SQL = " + _q);

    runCapsBy_Query(_q,result);

                return result;
}

function runCapsBy_Query(q,r){
	try{
		var conn = aa.db.getConnection();
		var sStmt = conn.prepareStatement(q);
		var rSet = sStmt.executeQuery();

		while (rSet.next()) {
						var ID1 = rSet.getString("B1_PER_ID1");
						var ID2 = rSet.getString("B1_PER_ID2");
						var ID3 = rSet.getString("B1_PER_ID3");
						capIdResult = aa.cap.getCapID(ID1, ID2, ID3);
						if (capIdResult.getSuccess()) {
										thisCapId = capIdResult.getOutput();
										if (thisCapId != null)
										r.push(thisCapId);
						}
		}
	} catch (err) {
		aa.print(err.message);
	}
	finally {
		if (rSet) {
						rSet.close();
		}
		if (sStmt) {
						sStmt.close();
		}
		if (conn) {
						conn.close();
		}
		if (initialContext) {
						initialContext.close();
		}
	}
}