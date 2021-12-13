/*------------------------------------------------------------------------------------------------------/
| Program: DEQ_SET_IA_LPS_DISABLED.js  Trigger: Batch|  
| This batch script will run daily to check the liquid waste LP has been expired
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var showDebug = true;// Set to true to see debug messages in email confirmation
var maxSeconds = 60 * 5;// number of seconds allowed for batch processing, usually < 5*60
var showMessage = true;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var timeExpired = false;
var br = "<BR>";
var emailAddress = "ada.chan@suffolkcountyny.gov";//email to send report
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobID = 0;
if (batchJobResult.getSuccess()) 
{
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
{
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
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
var todayDate = "" + startDate.getFullYear() + "-" + (startDate.getMonth() + 1) + "-" + startDate.getDate();
// Record type to check
var rtArray = ["ConsumerAffairs/Licenses/Liquid Waste/NA"];
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
	logDebug("Start Date: " + startDate + br);
	logDebug("Starting the timer for this job.  If it takes longer than 5 minutes an error will be listed at the bottom of the email." + br);
	if (!timeExpired) 
	{
		processComResSub();
		aa.sendMail("noreplyehimslower@suffolkcountyny.gov", emailAddress, "", "Batch Job - assigneed Task", emailText);
	}
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
function processComResSub() 
{    
    var count = 0;
    var icount = 0;
    var updateBusinessCount = 0;
    var newCount = 0;
    try 
    {
        for (var i in rtArray) 
        {
            var thisType = rtArray[i];
            var capModel = aa.cap.getCapModel().getOutput();
            var appTypeArray = thisType.split("/");
            // Specify the record type to query
            capTypeModel = capModel.getCapType();
            capTypeModel.setGroup(appTypeArray[0]);
            capTypeModel.setType(appTypeArray[1]);
            capTypeModel.setSubType(appTypeArray[2]);
            capTypeModel.setCategory(appTypeArray[3]);
            capModel.setCapType(capTypeModel);
            //capModel.setCapStatus(sArray[i]); if needed

            var recordListResult = aa.cap.getCapIDListByCapModel(capModel);
            if (!recordListResult.getSuccess()) 
            {
                logDebug("**ERROR: Failed to get capId List : " + recordListResult.getErrorMessage());
                continue;
            }
            var recArray = recordListResult.getOutput();
            logDebug("<b>" + thisType + " checking for expired records" + "</b>");

            for (var j in recArray) 
            {
                capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput();
                capIDString = capId.getCustomID();
				cap = aa.cap.getCap(capId).getOutput();
                var appStatus = getAppStatus(capId);
                
                // Only if the application has an "Active" status
				if(appStatus == "Expired")
				{
                    logDebug("1. Application is :" +  appStatus + ". " + capIDString);
					if (cap)
					{         
                        var licExpDate = getAppSpecific("Expiration Date", capId);
                     
                        if (licExpDate && licExpDate != "")
                        {                      
                            var todaysDate = new Date();																
                            var todDateCon = (todaysDate.getMonth() + 1) + "/" + todaysDate.getDate() + "/" + (todaysDate.getFullYear());
                           
                            logDebug("2. Today Date is: " + todDateCon + ". Expiration Date is: " + licExpDate);	
                            
                            var dateDiff = parseFloat(dateDifference(licExpDate, todDateCon));
                            logDebug("3. Date difference is: " + dateDiff);	
                            var dateDifRound = Math.floor(dateDiff);

                            // If it expired more than 90 days
                            if (dateDifRound == 90)
                            {
                                var restrictionTable = loadASITable("RESTRICTIONS");
                                
                                for (var p in restrictionTable)
                                {
                                    var type = restrictionTable[p]["Type"];
                                    var category = restrictionTable[p]["Category"];
                                    
                                    var cat = category.toString();
                                    cat = cat.substr(0,4);
                                                                
                                    // logDebug("Category : " + category);
                                    if (cat == "LW11" || cat == "LW10")
                                    {                                                                       
                                        var capContResult = aa.people.getCapContactByCapID(capId);

                                        if (capContResult.getSuccess()) {
                                        conArray = capContResult.getOutput();
                                        for (con in conArray)
                                        {
                                            contactType = conArray[con].getCapContactModel().getPeople().getContactType();
                                            
                                            if (contactType == "Vendor")
                                            {                                           
                                                var licenType;                                            
                                                if (cat == "LW11" || cat == "LW10")
                                                {
                                                    if (cat == "LW11" )
                                                    {
                                                        licenType = "IA Service Provider";
                                                        count++;                        
                                                    }
                                                    else if (cat == "LW10")
                                                    {
                                                        licenType = "IA Installer";
                                                        icount++;
                                                    }

                                                    logDebug("<b>" + capIDString + ":" + licenType + ":First Name: " +
                                                    conArray[con].getCapContactModel().getPeople().getFirstName() + " Last Name: " +
                                                    conArray[con].getCapContactModel().getPeople().getLastName() + "</b>");      
                                                    logDebug("4. Find LP to disable " + capIDString);
                                                    // Find existing LP with the same first and last name first
                                                    var lp = findActiveLicenseProfByNameToSetToDisabled(capIDString, licenType);
                                                    
                                                    if (lp != null)
                                                    {                                                                                           
                                                        logDebug("7. Found LP to disable altID is: " + lp.getStateLicense());                                                       
                                                        businessLicense = lp.getBusinessLicense();
                                                        logDebug("8. LP Business License: " + businessLicense);
                                                                                                       
                                                        // Add code to check if it's 90 days after expiration. 
                                                        // Set the LP to disable                                                                    
                                                        logDebug("9. Start to disable : " + capIDString + ". License Type: " + licenType);                                            
                                                        disableRefLicProf(capId, licenType);
                                                    }                                                
                                                                                                                            
                                                }

                                            }
                
                                        }
                                         }
                                    }
                                                              
                                }  
                            }      
                        }
					
				    }			
                }                                 

            }                    
        }      
    }
    catch (err) 
    {
        logDebug("**ERROR** runtime error " + err.message + " at " + err.lineNumber + " stack: " + err.stack);
    }
}               

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

 
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

function getOutput(result, object) {
    if (result.getSuccess()) {
        return result.getOutput();
    } else {
        logDebug("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
        return null;
    }
}

function dateDifference(date1, date2)
{
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}


function convertDate(thisDate)
{

if (typeof(thisDate) == "string")
    {
    var retVal = new Date(String(thisDate));
    if (!retVal.toString().equals("Invalid Date"))
        return retVal;
    }

if (typeof(thisDate)== "object")
    {

    if (!thisDate.getClass) // object without getClass, assume that this is a javascript date already
        {
        return thisDate;
        }

    if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
        {
        return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }
        
    if (thisDate.getClass().toString().equals("class com.accela.aa.emse.util.ScriptDateTime"))
        {
        return new Date(thisDate.getMonth() + "/" + thisDate.getDayOfMonth() + "/" + thisDate.getYear());
        }			

    if (thisDate.getClass().toString().equals("class java.util.Date"))
        {
        return new Date(thisDate.getTime());
        }

    if (thisDate.getClass().toString().equals("class java.lang.String"))
        {
        return new Date(String(thisDate));
        }
    if (thisDate.getClass().toString().equals("class java.sql.Timestamp"))
        {
        return new Date(thisDate.getMonth() + "/" + thisDate.getDate() + "/" + thisDate.getYear());
        }
    }

if (typeof(thisDate) == "number")
    {
    return new Date(thisDate);  // assume milliseconds
    }

logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
return null;

}
 

function getAppSpecific(itemName)  // optional: itemCap
{
	var updated = false;
	var i=0;
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args
   	
	if (useAppSpecificGroupName)
	{
		if (itemName.indexOf(".") < 0)
			{ logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true") ; return false }
		
		
		var itemGroup = itemName.substr(0,itemName.indexOf("."));
		var itemName = itemName.substr(itemName.indexOf(".")+1);
	}
	
    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
	if (appSpecInfoResult.getSuccess())
 	{
		var appspecObj = appSpecInfoResult.getOutput();
		
		if (itemName != "")
		{
			for (i in appspecObj)
				if( appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup) )
				{
					return appspecObj[i].getChecklistComment();
					break;
				}
		} // item name blank
	} 
	else
		{ logDebug( "**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage()) }
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


function loadASITable(tname) {

    //
    // Returns a single ASI Table array of arrays
    // Optional parameter, cap ID to load from
    //

    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
    var ta = gm.getTablesArray()
    var tai = ta.iterator();

    while (tai.hasNext()) {
        var tsm = tai.next();
        var tn = tsm.getTableName();

        if (!tn.equals(tname)) continue;

        if (tsm.rowIndex.isEmpty()) {
            logDebug("Couldn't load ASI Table " + tname + " it is empty");
            return false;
        }

        var tempObject = new Array();
        var tempArray = new Array();

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
            if (readOnlyi.hasNext()) {
                readOnly = readOnlyi.next();
            }
            var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
            tempObject[tcol.getColumnName()] = fieldInfo;

        }
        tempArray.push(tempObject); // end of record//
    }
    return tempArray;
}
function disableRefLicProf(capId, rlpType) {

    var currentUserID = aa.env.getValue("CurrentUserID");
    capIDString = capId.getCustomID();
    pContactType = "Business Owner";     
    licExpDate = getAppSpecific("Expiration Date", capId);
    
    var newLic = getRefLicenseProf(capIDString, rlpType);
    logDebug ("10. Get Reference Lic Prof ");
	if (newLic) {
	   
        //Creates/updates a reference licensed prof from a Contact
        var capContResult = aa.people.getCapContactByCapID(capId);
        logDebug ("11. Get Contacts ");
        if (capContResult.getSuccess()) {
            conArr = capContResult.getOutput();
        }
        else {
            logDebug ("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
            return false;
        }
        if (!conArr.length) {
            logDebug ("**WARNING: No contact available");
            return false;
        }

        if (pContactType == null) {
            var cont = conArr[0]; //if no contact type specified, use first contact
        }
        else
        {
            var contFound = false;
            for (yy in conArr) {
                if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()) || "Vendor".equals(conArr[yy].getCapContactModel().getPeople().getContactType()) ) {
                    compCont = conArr[yy];
                    cont = conArr[yy];
                    contFound = true;
                }
            }
            if (!contFound) {
                logDebug ("**WARNING: No Contact found of type: "+pContactType);
                return false;
            }
        }
        peop = cont.getPeople();
        compPeop = compCont.getPeople();
        addr = peop.getCompactAddress();
        compAddr = compPeop.getCompactAddress();
        newLic.setContactFirstName(cont.getFirstName());
        newLic.setContactLastName(cont.getLastName());
        newLic.setBusinessName(compPeop.getBusinessName());
        newLic.setAddress1(compAddr.getAddressLine1());
        newLic.setAddress2(compAddr.getAddressLine2());
        newLic.setAddress3(compAddr.getAddressLine3());
        newLic.setCity(compAddr.getCity());
        newLic.setState(compAddr.getState());
        newLic.setZip(compAddr.getZip());
        newLic.setPhone1(compPeop.getPhone1());
        newLic.setPhone2(peop.getPhone2());
        newLic.setPhone3(peop.getPhone3());
        newLic.setEMailAddress(peop.getEmail());
        newLic.setFax(compPeop.getFax());
        newLic.setAgencyCode(aa.getServiceProviderCode());
        newLic.setAuditDate(sysDate);
        newLic.setAuditID(currentUserID);
        logDebug ("12. Set " + capIDString + " to Inactive.");
        newLic.setAuditStatus("I");
        if (licExpDate && licExpDate != "")
            newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
        newLic.setLicenseType(rlpType);
        
        newLic.setLicState("NY");
        newLic.setMaskedSsn(compPeop.getSocialSecurityNumber());
        newLic.setSocialSecurityNumber(compPeop.getSocialSecurityNumber());
        bDate = compCont.getCapContactModel().getBirthDate();
        issueDate = getAppSpecific("Issued Date");
        if (issueDate && issueDate != "") newLic.setLicenseIssueDate(aa.date.parseDate(issueDate));
        insCo = getAppSpecific("Insurance Agent", capId)
        if (insCo && insCo != "") newLic.setInsuranceCo(insCo);
        insPolicy = getAppSpecific("Insurance Policy", capId);
        if (insPolicy && insPolicy != "") newLic.setPolicy(insPolicy);
        insExpDate = getAppSpecific("Policy Expiration Date", capId);
        if (insExpDate && insExpDate != "") newLic.setInsuranceExpDate(aa.date.parseDate(insExpDate));
        wcInsPolicy = getAppSpecific("Workers Comp #", capId);
        if (wcInsPolicy && wcInsPolicy != "") newLic.setWcPolicyNo(wcInsPolicy);
        wcExpDate = getAppSpecific("Workers Comp Expiration Date", capId);
        if (wcExpDate && wcExpDate != "") newLic.setWcExpDate(aa.date.parseDate(wcExpDate));
        fein = getAppSpecific("Federal Tax ID #", capId);
        if (fein && fein != "") newLic.setFein(fein);
        if (bDate) {
            var sdtBirthDate = dateFormatted(1+bDate.getMonth(), bDate.getDate(), 1900+bDate.getYear(), "");
        }
        
       
        var myResult = aa.licenseScript.editRefLicenseProf(newLic);
        if (myResult.getSuccess()) {
            logDebug("13. Successfully updated LP " + capIDString);
        }
        else {
            logDebug("**ERROR: can't update ref lic prof: " + myResult.getErrorMessage());
            return false;
        }
             
    }

	return true;
}

 
function logMessage(etype,edesc) 
{
	//aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
	aa.print(etype + " : " + edesc);
	emailText+=etype + " : " + edesc + "\n";
	if (etype=="INFO" || etype=="ERROR") 
    {
      userEmailText+=etype + " : " + edesc + "<br> \n";
	}
	else if (etype=="CSR") CSREmailText+= edesc + "<br> \n";
}	

function dateFormatted(pMonth, pDay, pYear, pFormat)
//returns date string formatted as YYYY-MM-DD or MM/DD/YYYY (default)
{
	var mth = "";
	var day = "";
	var ret = "";
	if (pMonth > 9)
		mth = pMonth.toString();
	else
		mth = "0" + pMonth.toString();

	if (pDay > 9)
		day = pDay.toString();
	else
		day = "0" + pDay.toString();

	if (pFormat == "YYYY-MM-DD")
		ret = pYear.toString() + "-" + mth + "-" + day;
	else
		ret = "" + mth + "/" + day + "/" + pYear.toString();

	return ret;
} 

function editRefLicProfAttribute(pLicNum,pAttributeName,pNewAttributeValue)
	{

	var attrfound = false;
	var oldValue = null;

	licObj = getRefLicenseProf(pLicNum)

	if (!licObj)
		{ logDebug("**WARNING Licensed Professional : " + pLicNum + " not found") ; return false }

	licSeqNum = licObj.getLicSeqNbr();
	attributeType = licObj.getLicenseType();

	if (licSeqNum==null || attributeType=="" || attributeType==null)
		{ logDebug("**WARNING Licensed Professional Sequence Number or Attribute Type missing") ; return false }

	var peopAttrResult = aa.people.getPeopleAttributeByPeople(licSeqNum, attributeType);

	if (!peopAttrResult.getSuccess())
		{ logDebug("**WARNING retrieving reference license professional attribute: " + peopAttrResult.getErrorMessage()); return false }

	var peopAttrArray = peopAttrResult.getOutput();

	for (i in peopAttrArray)
		{
		if ( pAttributeName.equals(peopAttrArray[i].getAttributeName()))
			{
			oldValue = peopAttrArray[i].getAttributeValue()
			attrfound = true;
			break;
			}
		}

	if (attrfound)
		{
		logDebug("Updated Ref Lic Prof: " + pLicNum + ", attribute: " + pAttributeName + " from: " + oldValue + " to: " + pNewAttributeValue)
		peopAttrArray[i].setAttributeValue(pNewAttributeValue);
		aa.people.editPeopleAttribute(peopAttrArray[i].getPeopleAttributeModel());
		}
	else
		{
		logDebug("**WARNING attribute: " + pAttributeName + " not found for Ref Lic Prof: "+ pLicNum)
		/* make a new one with the last model.  Not optimal but it should work
		newPAM = peopAttrArray[i].getPeopleAttributeModel();
		newPAM.setAttributeName(pAttributeName);
		newPAM.setAttributeValue(pNewAttributeValue);
		newPAM.setAttributeValueDataType("Number");
		aa.people.createPeopleAttribute(newPAM);
		*/
		}
    } 
    

function findActiveLicenseProfByNameToSetToDisabled(refstlic, lictype)
{
    var refLicModel = null;
    var result = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), refstlic);
    if (result.getSuccess()) {
        var tmp = result.getOutput();
    
        if (tmp != null)
            for (lic in tmp)
                if (tmp[lic].getLicenseType().toUpperCase() == lictype.toUpperCase()) 
                {
                    logDebug("5. Found LP license type " + lictype);
                    logDebug("5.1 LP Audit Status " + tmp[lic].getAuditStatus());
                    if (tmp[lic].getAuditStatus() == "A")
                    {              
                        logDebug("5.2 LP Business Licnese " + tmp[lic].getBusinessLicense());              
                        if(matches(tmp[lic].getBusinessLicense(),null,undefined,""))
                        {      
                            logDebug("6. Found LP and business license is empty. Ready to disable.");
                            refLicModel = tmp[lic];
                        }
                    }   
                }
    }

    return refLicModel;
}

function getRefLicenseProf(refstlic,licenseType)
	{
	var refLicObj = null;
	var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(),refstlic);
	if (!refLicenseResult.getSuccess())
		{ logDebug("**ERROR retrieving Ref Lic Profs : " + refLicenseResult.getErrorMessage()); return false; }
	else
		{
		var newLicArray = refLicenseResult.getOutput();
		if (!newLicArray) return null;
		for (var thisLic in newLicArray)
			if(!matches(licenseType,null,undefined,"")){
				if (refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()) && 
					licenseType.toUpperCase().equals(newLicArray[thisLic].getLicenseType().toUpperCase()))
					refLicObj = newLicArray[thisLic];
			}
			else if (refstlic && newLicArray[thisLic] && refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()))
				refLicObj = newLicArray[thisLic];
		}

	return refLicObj;
	}


function asiTableValObj(columnName, fieldValue, readOnly) {
    this.columnName = columnName;
    this.fieldValue = fieldValue;
    this.readOnly = readOnly;
    this.hasValue = Boolean(fieldValue != null & fieldValue != "");

    asiTableValObj.prototype.toString = function () {
        return this.hasValue ? String(this.fieldValue) : String("");
    }
}

function matches(eVal, argList) {
	for (var i = 1; i < arguments.length; i++) {
		if (arguments[i] == eVal) {
			return true;
		}
	}
	return false;
} 