/*------------------------------------------------------------------------------------------------------/
| Program: DEQ_WWM_LIQUID_WASTE_LP.js  Trigger: Batch|  
| This batch script will run once
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
    var endorsementCats;
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
function processComResSub() {
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
            logDebug(thisType + " checking");

            for (var j in recArray) 
            {
                capId = aa.cap.getCapID(recArray[j].getID1(), recArray[j].getID2(), recArray[j].getID3()).getOutput();
                capIDString = capId.getCustomID();
                cap = aa.cap.getCap(capId).getOutput();
                var appStatus = getAppStatus(capId);

                // Only if the application has an "Active" status
                //if(appStatus == "Active" &&  (capIDString == "LW-168"))
                if (appStatus == "Active" || appStatus == "About to Expire" || appStatus == "Temporary License" || appStatus == "Expired")
                {
                    if (cap)
                    {
                        createUpdateRefLicProfWWMLW(capId);
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


function createUpdateRefLicProfWWMLW(capId) {

    if (capId == null)
    {
        logDebug("createUpdateRefLicProfWWMLW : capId object is null");
        return;
    }

    capIDString = capId.getCustomID();
    cap = aa.cap.getCap(capId).getOutput();
    thisAppTypeResult = cap.getCapType();
    thisAppTypeString = thisAppTypeResult.toString();
    thisAppTypeArray = thisAppTypeString.split("/");
    licNum = capIDString;
    licExpDate = getAppSpecific("Expiration Date", capId);

    if (cap)
    {
        if (licExpDate && licExpDate != "")
        {
            endorsementCats = "";
            var restrictionTable = loadASITable("RESTRICTIONS");
            for (var p in restrictionTable)
            {
                var type = restrictionTable[p]["Type"];
                var category = String(restrictionTable[p]["Category"]);
                var catArray = new Array();
                logDebug("category is: " + category);

                if (String(category).indexOf("LW") > -1)
                {
                    //grab endorsements and store them here to update address line 3 later  ex: LW12, LW9, LW3
                    var tempCatArray = category.split(" ");
                    logDebug("trimmed category is: " + tempCatArray[0]);
                    catArray.push(tempCatArray[0] + ", ");

                    for (end in catArray)
                    {
                        endorsementCats += catArray[end];
                    }
                }
                //LW, LW1, LW2, LW3, LW4, LW5, LW6, LW7, LW8, LW9, LW10, LW11, LW12
                if (String(endorsementCats.length) > 66)
                {
                    logDebug("LOWKEY ERROR: " + capId.getCustomID() + " " + endorsementCats);
                }
            }
            if (endorsementCats.charAt(endorsementCats.length - 2) == "," && endorsementCats.charAt(endorsementCats.length - 1) == " ")
            {
                endorsementCats = endorsementCats.slice(0, -2);
            }
            logDebug("endorsement cats at the end is: " + endorsementCats);
            var capContResult = aa.people.getCapContactByCapID(capId);

            if (capContResult.getSuccess()) 
            {
                conArray = capContResult.getOutput();
                for (con in conArray)
                {
                    contactType = conArray[con].getCapContactModel().getPeople().getContactType();

                    if (contactType == "Vendor")
                    {
                        var licenType = "WWM Liquid Waste";

                        /* logDebug(capIDString + ":" + licenType + ":First Name: " +
                         conArray[con].getCapContactModel().getPeople().getFirstName() + " Middle Name: " +
                         conArray[con].getCapContactModel().getPeople().getMiddleName() + " Last Name: " +
                         conArray[con].getCapContactModel().getPeople().getLastName() + ". Business Name: " +
                         conArray[con].getCapContactModel().getPeople().getBusinessName() + ". SSN: " +
                         conArray[con].getCapContactModel().getPeople().getSocialSecurityNumber());      */

                        // Find existing LP with the same first and last name first
                        logDebug("<b>*** Look for: ***" + capIDString + ". License Type: " + licenType + "</b>");
                        var lp = findExistingRefLicenseProfByName(capIDString, conArray[con].getCapContactModel().getPeople().getFirstName(), conArray[con].getCapContactModel().getPeople().getMiddleName(),
                            conArray[con].getCapContactModel().getPeople().getLastName(), licenType, conArray[con].getCapContactModel().getPeople().getBusinessName(), conArray[con].getCapContactModel().getPeople().getSocialSecurityNumber());

                        var licStateNum = -1;
                        //logDebug("<b>Capid is: " + capIDString + "</br>");

                        // If found existing LP 
                        if (lp != null)
                        {
                            licStateNum = lp.getStateLicense();
                            logDebug("6. Found existing LP with license number: " + licStateNum);
                        }
                        else
                        {
                            logDebug("6. LP found is NULL: " + capIDString);
                        }

                        // 1. Cannot find a matched LP, we will create a new LP OR
                        // 2. We found the matched LP and the Liquid Waste Record ID matches with the LP state license number, 
                        // we need to update the existing the License Professional Information.
                        if (lp == null || licStateNum == capIDString)
                        {
                            logDebug("7. Create/Update existing LP: " + capIDString + ", Name: " + conArray[con].getCapContactModel().getPeople().getFirstName());
                            createUpdateRefLicProfWWMLiquidWaste(capId, false, licenType);

                        }
                        // If existing LP is found but the license number and record ID doesn't match. The business license # however matches with
                        // the LW record ID, this means we need to add the latest number in the business license # as information.
                        else if (lp != null && licStateNum != capIDString)                                                
                        {
                            logDebug("7. Update state license " + capIDString + " business license number custom field to: " + licStateNum);
                            // licStateNum is the old/existing LW LP we found a match in the system.       
                            // capId is the new capid # we want to put in the business license # field on the existing LP.                                                                         
                            updateRefLicProfBusinessNumber(capId, licStateNum, licenType);

                        }
                        logDebug("*** End ***" + capIDString);
                    }
                }
            }
        }
    }
    return true;
}

// First Name, Middle Name and Last Name
function findExistingRefLicenseProfByName(refstlic, firstName, middleName, lastName, licenseType, businessName, ssn) {
    var refLicObj = null;
    // 1. First search License professional based on their first, middle and last name.
    var refLicenseResult = aa.licenseScript.getRefLicensesProfByName(aa.getServiceProviderCode(), firstName, "", lastName);

    if (!refLicenseResult.getSuccess())
    {logDebug("**There is no existing ref Lic Profs : " + refLicenseResult.getErrorMessage()); return false;}
    else
    {
        logDebug("1. Result returned.");

        var newLicArray = refLicenseResult.getOutput();

        //logDebug("newLicArray.: " + newLicArray);
        //logDebug("refLicenseResult: " + refLicenseResult);

        if (!newLicArray) return null;
        logDebug("COUNT: " + newLicArray.length);
        for (var thisLic in newLicArray)
        {
            //logDebug("licenseType: " + licenseType.toUpperCase() + " VS. " + newLicArray[thisLic].getLicenseType().toUpperCase());
            // logDebug("Business Name: " + businessName.toUpperCase() + " VS. " + newLicArray[thisLic].getBusinessName().toUpperCase());
            //logDebug("State License ID: " + newLicArray[thisLic].getStateLicense().toUpperCase());
            //logDebug("2. LP Status: " + newLicArray[thisLic].getAuditStatus());
            //logDebug("LP License Type: " + newLicArray[thisLic].getLicenseType());
            if (newLicArray[thisLic].getAuditStatus() == "A")
            {
                if (!matches(licenseType, null, undefined, ""))
                {                    

                    // 2. Compare the license type and the business name if they match 
                    if (licenseType.toUpperCase().equals(newLicArray[thisLic].getLicenseType().toUpperCase()) &&
                        (businessName != null && businessName.toUpperCase().equals(newLicArray[thisLic].getBusinessName())))
                    {
                        logDebug("3. State License: " + newLicArray[thisLic].getStateLicense().toUpperCase());
                        //3. Compare the State license number with the Liquid Waste Record Id. 
                        if (refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()))                          
                        {
                            logDebug("4. SSN: " + ssn + " VS. lic ssn: " + newLicArray[thisLic].getSocialSecurityNumber());

                            //4a. Check if the SSN is NOT empty and if the SSN matches
                            if (ssn != null && ssn.equals(newLicArray[thisLic].getSocialSecurityNumber()))
                            {
                                refLicObj = newLicArray[thisLic];
                                logDebug("5. Capid, business name and SSN matched!");
                            }
                            else if (ssn == null) // 4b. It's OK if SSN is null. 
                            {
                                refLicObj = newLicArray[thisLic];
                                logDebug("5. Capid, business name matched but SSN is NULL.");
                            }

                        } // 3. If the record ID matches with the business license #, this means that there is an updated license number
                        else if (refstlic.toUpperCase().equals(newLicArray[thisLic].getBusinessLicense()))
                        {
                            //4a. Check if the SSN is NOT empty and if the SSN matches
                            if (ssn != null && ssn.equals(newLicArray[thisLic].getSocialSecurityNumber()))
                            {
                                refLicObj = newLicArray[thisLic];
                                logDebug("4. Capid, business license # and SSN matched!");
                            }
                            else if (ss == null) // 4b. It's OK if SSN is null. 
                            {
                                refLicObj = newLicArray[thisLic];
                                logDebug("4. Capid, business license # a matched but SSN is NULL.");
                            }

                        } // If LW # and License # do not match BUT license type, first name, last name and business name matches,
                        // we consider this a match and just update the business license #
                        else if (!refstlic.toUpperCase().equals(newLicArray[thisLic].getStateLicense().toUpperCase()))     
                        {
                            logDebug("4. LW Number: " + refstlic + ". IA State License: " + newLicArray[thisLic].getStateLicense().toUpperCase());

                            if (ssn != null && ssn.equals(newLicArray[thisLic].getSocialSecurityNumber()))
                            {
                                refLicObj = newLicArray[thisLic];
                                logDebug("5. Update business #, and SSN matched! Break here");
                                break;
                            }
                            else if (ssn == null) // 4b. It's OK if SSN is null. 
                            {
                                refLicObj = newLicArray[thisLic];
                                logDebug("5. Update business # but SSN is NULL.");
                                break;
                            }

                        }
                        /*logDebug(".*****Start*****");
                        logDebug("State license: " + refstlic + " VS. " + newLicArray[thisLic].getStateLicense());  
                        logDebug("Business license: " + refstlic + " VS. " + newLicArray[thisLic].getBusinessLicense());                        
                        logDebug("businessName: " + businessName + " VS. " + newLicArray[thisLic].getBusinessName());
                        logDebug("SSN: " + ssn + " VS. " + newLicArray[thisLic].getSocialSecurityNumber());
                        logDebug("*****End*****.");*/
                    }
                }
            }
        }
    }
    return refLicObj;
}


function updateRefLicProfBusinessNumber(capId, originalLpAltId, rlpType) {

    busLicNumber = capId.getCustomID();

    var currentUserID = aa.env.getValue("CurrentUserID");

    //this line was from Ada's original code in script DEQ_IA_SERVICE_PROVIDER_LP, may have been used for testing
    //older DCA records had the prospective LP listed as a Business Owner contact, which is why we're checking this. Newer records use a Vendor contact type.
    pContactType = "Business Owner";
    licExpDate = getAppSpecific("Expiration Date", capId);


    var newLic = getRefLicenseProf(originalLpAltId, rlpType);
    if (newLic)
    {
        var contFound = "";
        updating = true;

        //Creates/updates a reference licensed prof from a Contact
        var capContResult = aa.people.getCapContactByCapID(capId);

        if (capContResult.getSuccess())
        {
            conArr = capContResult.getOutput();
        }
        else
        {
            logDebug("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
            return false;
        }
        if (!conArr.length)
        {
            logDebug("**WARNING: No contact available");
            return false;
        }

        if (pContactType == null)
        {
            var cont = conArr[0]; //if no contact type specified, use first contact
        }
        else
        {
            contFound = false;
            for (yy in conArr)
            {
                if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()) || "Vendor".equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
                {
                    compCont = conArr[yy];
                    cont = conArr[yy];
                    contFound = true;
                }
            }
            if (!contFound)
            {
                logDebug("**WARNING: No Contact found of type: " + pContactType);
                return false;
            }
        }
        if (contFound)
        {
            peop = cont.getPeople();
            compPeop = compCont.getPeople();
            addr = peop.getCompactAddress();
            compAddr = compPeop.getCompactAddress();
            newLic.setContactFirstName(cont.getFirstName());
            newLic.setContactLastName(cont.getLastName());
            newLic.setBusinessName(compPeop.getBusinessName());
            newLic.setAddress1(compAddr.getAddressLine1());
            newLic.setAddress2(compAddr.getAddressLine2());
            newLic.setAddress3(endorsementCats);
            logDebug("address 3 in update biznumber is: " + newLic.getAddress3());
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
            // Use this field for historical LW License Number
            newLic.setBusinessLicense(busLicNumber);

            newLic.setAuditStatus("A");
            if (licExpDate && licExpDate != "")
                newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
            newLic.setLicenseType(rlpType);
            // Use existing LW number
            newLic.setStateLicense(originalLpAltId);
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
            // EHIMS-4750: Leave it empty so it doesn't use this date to see if the LP has expired.
            //if (insExpDate && insExpDate != "") newLic.setInsuranceExpDate(aa.date.parseDate(insExpDate));
            wcInsPolicy = getAppSpecific("Workers Comp #", capId);
            if (wcInsPolicy && wcInsPolicy != "") newLic.setWcPolicyNo(wcInsPolicy);
            wcExpDate = getAppSpecific("Workers Comp Expiration Date", capId);
            if (wcExpDate && wcExpDate != "") newLic.setWcExpDate(aa.date.parseDate(wcExpDate));
            fein = getAppSpecific("Federal Tax ID #", capId);
            if (fein && fein != "") newLic.setFein(fein);
            if (bDate)
            {
                var sdtBirthDate = dateFormatted(1 + bDate.getMonth(), bDate.getDate(), 1900 + bDate.getYear(), "");
            }

            if (updating)
            {
                var myResult = aa.licenseScript.editRefLicenseProf(newLic);
                if (myResult.getSuccess())
                {
                    logDebug("Successfully updated LP " + originalLpAltId);
                }
                else
                {
                    logDebug("**ERROR: can't update ref lic prof: " + myResult.getErrorMessage());
                    return false;
                }
            }
        }
    }

    return true;
}


function debugObject(object) {
    var output = '';
    for (property in object)
    {
        output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" + '; ' + "<BR>";
    }
    logDebug(output);
}

function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}

function logDebug(dstr) {
    if (showDebug)
    {
        aa.print(dstr)
        emailText += dstr + "<br>";
        aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr)
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
    for (var i = 1; i < arguments.length; i++)
    {
        if (arguments[i] == eVal)
        {
            return true;
        }
    }
    return false;
}

function getOutput(result, object) {
    if (result.getSuccess())
    {
        return result.getOutput();
    } else
    {
        logDebug("ERROR: Failed to get " + object + ": " + result.getErrorMessage());
        return null;
    }
}

function dateDifference(date1, date2) {
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}


function convertDate(thisDate) {

    if (typeof (thisDate) == "string")
    {
        var retVal = new Date(String(thisDate));
        if (!retVal.toString().equals("Invalid Date"))
            return retVal;
    }

    if (typeof (thisDate) == "object")
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

    if (typeof (thisDate) == "number")
    {
        return new Date(thisDate);  // assume milliseconds
    }

    logDebug("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;

}


function getAppSpecific(itemName)  // optional: itemCap
{
    var updated = false;
    var i = 0;
    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0)
        {logDebug("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false}


        var itemGroup = itemName.substr(0, itemName.indexOf("."));
        var itemName = itemName.substr(itemName.indexOf(".") + 1);
    }

    var appSpecInfoResult = aa.appSpecificInfo.getByCapID(itemCap);
    if (appSpecInfoResult.getSuccess())
    {
        var appspecObj = appSpecInfoResult.getOutput();

        if (itemName != "")
        {
            for (i in appspecObj)
                if (appspecObj[i].getCheckboxDesc() == itemName && (!useAppSpecificGroupName || appspecObj[i].getCheckboxType() == itemGroup))
                {
                    return appspecObj[i].getChecklistComment();
                    break;
                }
        } // item name blank
    }
    else
    {logDebug("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())}
}

function getAppStatus() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    var appStatus = null;
    var capResult = aa.cap.getCap(itemCap);
    if (capResult.getSuccess())
    {
        licCap = capResult.getOutput();
        if (licCap != null)
        {
            appStatus = "" + licCap.getCapStatus();
        }
    } else
    {
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

    while (tai.hasNext())
    {
        var tsm = tai.next();
        var tn = tsm.getTableName();

        if (!tn.equals(tname)) continue;

        if (tsm.rowIndex.isEmpty())
        {
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
            if (readOnlyi.hasNext())
            {
                readOnly = readOnlyi.next();
            }
            var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
            tempObject[tcol.getColumnName()] = fieldInfo;

        }
        tempArray.push(tempObject); // end of record//
    }
    return tempArray;
}

function createUpdateRefLicProfWWMLiquidWaste(capId, relate, rlpType) {
    if (capId == null)
    {
        logDebug("createUpdateRefLicProfWWMLiquidWaste : capId object is null");
        return;
    }
    if (relate == null) relate = true;
    thisCapIDString = capId.getCustomID();
    thisCap = aa.cap.getCap(capId).getOutput();
    thisAppTypeResult = thisCap.getCapType();
    thisAppTypeString = thisAppTypeResult.toString();
    thisAppTypeArray = thisAppTypeString.split("/");

    pContactType = "Business Owner";
    licNum = thisCapIDString;
    licExpDate = getAppSpecific("Expiration Date", capId);

    var updating = false;

    var newLic = getRefLicenseProf(licNum, rlpType);
    if (newLic)
    {
        logDebug("8. Found existing lic. Updating: " + licNum + "," + rlpType);
        logDebug("Lic Current Status: " + newLic.getAuditStatus());
        updating = true;
    }
    else
    {
        logDebug("8. Create new license is needed.");
        var newLic = aa.licenseScript.createLicenseScriptModel();
    }

    //Creates/updates a reference licensed prof from a Contact
    var capContResult = aa.people.getCapContactByCapID(capId);
    var altId = capId.getCustomID();
    if (capContResult.getSuccess())
    {
        conArr = capContResult.getOutput();
    }
    else
    {
        logDebug("**ERROR: getting cap contact: " + capAddResult.getErrorMessage());
        return false;
    }
    if (!conArr.length)
    {
        logDebug("**WARNING: No contact available");
        return false;
    }

    if (pContactType == null)
    {
        var cont = conArr[0]; //if no contact type specified, use first contact
    }
    else
    {
        var contFound = false;
        for (yy in conArr)
        {
            if (pContactType.equals(conArr[yy].getCapContactModel().getPeople().getContactType()) || "Vendor".equals(conArr[yy].getCapContactModel().getPeople().getContactType()))
            {
                compCont = conArr[yy];
                cont = conArr[yy];
                contFound = true;
            }
        }
        if (!contFound)
        {
            logDebug("**WARNING: No Contact found of type: " + pContactType);
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
    logDebug("8.1 Address 1: " + compAddr.getAddressLine1());
    newLic.setAddress2(compAddr.getAddressLine2());
    if (endorsementCats.charAt(endorsementCats.length - 2) == "," && endorsementCats.charAt(endorsementCats.length - 1) == " ")
    {
        endorsementCats = endorsementCats.slice(0, -2);
    }
    logDebug("endorsement cats at the end is: " + endorsementCats);
    newLic.setAddress3(endorsementCats);
    logDebug("address 3 in createupdate is: " + newLic.getAddress3());
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
    var currentUserID = aa.env.getValue("CurrentUserID");
    newLic.setAuditID(currentUserID);
    newLic.setAuditStatus("A");
    if (licExpDate && licExpDate != "")
        newLic.setLicenseExpirationDate(aa.date.parseDate(licExpDate));
    newLic.setLicenseType(rlpType);
    newLic.setStateLicense(thisCapIDString);
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
    // EHIMS-4750: Leave it empty so it doesn't use this date to see if the LP has expired.
    //insExpDate = getAppSpecific("Policy Expiration Date", capId);
    //if (insExpDate && insExpDate != "") newLic.setInsuranceExpDate(aa.date.parseDate(insExpDate));
    wcInsPolicy = getAppSpecific("Workers Comp #", capId);
    if (wcInsPolicy && wcInsPolicy != "") newLic.setWcPolicyNo(wcInsPolicy);
    wcExpDate = getAppSpecific("Workers Comp Expiration Date", capId);
    if (wcExpDate && wcExpDate != "") newLic.setWcExpDate(aa.date.parseDate(wcExpDate));
    fein = getAppSpecific("Federal Tax ID #", capId);
    if (fein && fein != "") newLic.setFein(fein);
    if (bDate)
    {
        var sdtBirthDate = dateFormatted(1 + bDate.getMonth(), bDate.getDate(), 1900 + bDate.getYear(), "");
    }

    if (updating)
    {
        var myResult = aa.licenseScript.editRefLicenseProf(newLic);
        if (myResult.getSuccess())
        {
            logDebug("9. Successfully updated LP " + thisCapIDString);
        }
        else
        {
            logDebug("**ERROR: can't update ref lic prof: " + myResult.getErrorMessage());
            return false;
        }
    }
    else
    {
        myResult = aa.licenseScript.createRefLicenseProf(newLic);
        if (myResult.getSuccess())
        {
            bWebSite = getAppSpecific("Business Website", capId);
            if (bWebSite && bWebSite != "")
                editRefLicProfAttribute(licNum, "BUSINESS WEBSITE", bWebSite);
            cArrears = getAppSpecific("Child Support Arrears", capId);
            if (cArrears == "CHECKED")
                editRefLicProfAttribute(licNum, "CHILD SUPPORT ARREARS", "Yes");
            nysID = getAppSpecific("NYS Sales Tax ID #", capId);
            if (nysID && nysID != "")
                editRefLicProfAttribute(licNum, "NYS SALES TAX ID #", nysID);
            dli = getAppSpecific("Driver License Info", capId);
            if (dli && dli != "")
                editRefLicProfAttribute(licNum, "DRIVER LICENSE INFO", dli);
            coNum = getAppSpecific("Company Affiliation License Number", capId);
            if (coNum && coNum != "")
                editRefLicProfAttribute(licNum, "LICENSE NUMBER", coNum);
            if (bDate)
            {
                var sdtBirthDate = dateFormatted(1 + bDate.getMonth(), bDate.getDate(), 1900 + bDate.getYear(), "");
                editRefLicProfAttribute(licNum, "BIRTH DATE", sdtBirthDate);
            }
            if (relate)
                assocResult = aa.licenseScript.associateLpWithCap(capId, newLic);
            logDebug("9. Successfully created LP " + thisCapIDString);
        }
        else
        {
            logDebug("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
            logMessage("**ERROR: can't create ref lic prof: " + myResult.getErrorMessage());
            return false;
        }
    }

    return true;
}


function logMessage(etype, edesc) {
    //aa.eventLog.createEventLog(etype, "Batch Process", batchJobName, sysDate, sysDate,"", edesc,batchJobID);
    aa.print(etype + " : " + edesc);
    emailText += etype + " : " + edesc + "\n";
    if (etype == "INFO" || etype == "ERROR") 
    {
        userEmailText += etype + " : " + edesc + "<br> \n";
    }
    else if (etype == "CSR") CSREmailText += edesc + "<br> \n";
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

function editRefLicProfAttribute(pLicNum, pAttributeName, pNewAttributeValue) {

    var attrfound = false;
    var oldValue = null;

    licObj = getRefLicenseProf(pLicNum)

    if (!licObj)
    {logDebug("**WARNING Licensed Professional : " + pLicNum + " not found"); return false}

    licSeqNum = licObj.getLicSeqNbr();
    attributeType = licObj.getLicenseType();

    if (licSeqNum == null || attributeType == "" || attributeType == null)
    {logDebug("**WARNING Licensed Professional Sequence Number or Attribute Type missing"); return false}

    var peopAttrResult = aa.people.getPeopleAttributeByPeople(licSeqNum, attributeType);

    if (!peopAttrResult.getSuccess())
    {logDebug("**WARNING retrieving reference license professional attribute: " + peopAttrResult.getErrorMessage()); return false}

    var peopAttrArray = peopAttrResult.getOutput();

    for (i in peopAttrArray)
    {
        if (pAttributeName.equals(peopAttrArray[i].getAttributeName()))
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
        logDebug("**WARNING attribute: " + pAttributeName + " not found for Ref Lic Prof: " + pLicNum)
        /* make a new one with the last model.  Not optimal but it should work
        newPAM = peopAttrArray[i].getPeopleAttributeModel();
        newPAM.setAttributeName(pAttributeName);
        newPAM.setAttributeValue(pNewAttributeValue);
        newPAM.setAttributeValueDataType("Number");
        aa.people.createPeopleAttribute(newPAM);
        */
    }
}



function getRefLicenseProf(refstlic, licenseType) {
    var refLicObj = null;
    var refLicenseResult = aa.licenseScript.getRefLicensesProfByLicNbr(aa.getServiceProviderCode(), refstlic);
    if (!refLicenseResult.getSuccess())
    {logDebug("**ERROR retrieving Ref Lic Profs : " + refLicenseResult.getErrorMessage()); return false;}
    else
    {
        var newLicArray = refLicenseResult.getOutput();
        if (!newLicArray) return null;
        for (var thisLic in newLicArray)
            if (!matches(licenseType, null, undefined, ""))
            {
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
    for (var i = 1; i < arguments.length; i++)
    {
        if (arguments[i] == eVal)
        {
            return true;
        }
    }
    return false;
} 