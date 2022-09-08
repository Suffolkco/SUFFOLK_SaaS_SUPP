/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_DEQ_OPC_ENF_CREATE_OP_TT_RECORDS.js
| Trigger: Batch
| Author: RLittlefield
| This batch script will run daily.
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

function getMasterScriptText(vScriptName) {
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

function getScriptText(vScriptName) {
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
var showMessage = false;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var useAppSpecificGroupName = false;
var timeExpired = false;
var br = "<BR>";
var emailAddress = "";
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
logDebugLocal("Batch started on " + new Date());

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
var capId = null;

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
    logDebugLocal("Starting the timer for this job.  If it takes longer than 5 minutes an error will be listed at the bottom of the email." + br);
    if (!timeExpired) 
    {
        mainProcess();
        //logDebugLocal("End of Job: Elapsed Time : " + elapsed() + " Seconds");
        logDebugLocal("End Date: " + startDate);
        aa.sendMail("ada.chan@suffolkcountyny.gov", emailAddress, "", "Batch Job - BATCH_DEQ_OPC_ENF_CREATE_OP_TT_RECORDS", emailText);
    }
}
/*------------------------------------------------------------------------------------------------------/
| <===========End Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() {
    try
    {
        var sql = "SELECT B1_ALT_ID, convert(varchar, convert(datetime,BC.B1_CHECKLIST_COMMENT), 101) as MYDATE, convert(varchar, dateadd(d, -90, Getdate()), 101) as DDIFF                                                            \n" +
            "  FROM B1PERMIT P                                                               \n" +
            "  INNER JOIN BCHCKBOX BC                                                        \n" +
            "      ON P.SERV_PROV_CODE = BC.SERV_PROV_CODE                                    \n" +
            "     AND P.B1_PER_ID1 = BC.B1_PER_ID1                                            \n" +
            "     AND P.B1_PER_ID2 = BC.B1_PER_ID2                                            \n" +
            "     AND P.B1_PER_ID3 = BC.B1_PER_ID3                                            \n" +
            "     AND BC.B1_CHECKBOX_DESC  in ('OPC Permit to Operate End Date', 'Next Line Test Date', 'Next Tank Test Date')                        \n" +
            "     AND convert(varchar, convert(datetime,BC.B1_CHECKLIST_COMMENT), 101) = convert(varchar, dateadd(d, -90, Getdate()), 101)                         \n" +
            " WHERE P.SERV_PROV_CODE = 'SUFFOLKCO'                                                \n" +
            "   AND P.REC_STATUS = 'A'                                                       \n" +
            "   AND P.B1_PER_GROUP in ('DEQ')                                       \n" +
            "   AND P.B1_PER_TYPE in ('General', 'OPC')                                      \n" +
            "   AND P.B1_PER_SUB_TYPE  in ('Hazardous Tank', 'Site')                                  \n" +
            "   AND P.B1_PER_CATEGORY in ('Permit', 'NA')           "
        var altIds = doSQL2(sql);
        if (altIds)
        {
            if (altIds.length <= 0)
            {
                logDebugLocal("No records found");
            }
            else
            {
                for (i in altIds)
                {
                    var row = altIds[i];
                    var altId = row.B1_ALT_ID; logDebugLocal("Found this: " + altId);
                    var capIdRes = aa.cap.getCapID(altId);
                    //GET CAP ID, if result returns an error then don't process this record.
                    if (!capIdRes.getSuccess()) {logDebugLocal("ERROR getting capId for record " + altId + ". Err: " + capIdRes.getOutput()); continue;}
                    capId = capIdRes.getOutput();
                    var cap = aa.cap.getCap(capId).getOutput();
                    var appType = cap.getCapType();
                    var appTypeArray = String(appType).split("/");
                    if (cap)
                    {
                        var capmodel = aa.cap.getCap(capId).getOutput().getCapModel();
                        if (capmodel.isCompleteCap())
                        {
                            if (appTypeArray[1] == "General" && appTypeArray[2] == "Site")
                            {
                                var enfChild = createChildLOCAL("DEQ", "OPC", "Enforcement", "NA", null, capId);
                                //copyContacts(capId, enfChild);
                                copyParcel(capId, enfChild);
                                copyAddress(capId, enfChild);
                                var siteAltId = capId.getCustomID();
                                editAppSpecific("Site/Pool (Parent) Record ID", siteAltId, enfChild);
                                var fileRefNumber = getAppSpecific("File Reference Number", capId);
                                editAppSpecific("File Reference Number/Facility ID", fileRefNumber, enfChild);
                                editAppSpecific("Enforcement Type", "OP", enfChild);
                                var appName = getAppName();
                                var projDesc = workDescGet(capId);
                                editAppName(appName, enfChild);
                                updateWorkDesc(projDesc, enfChild);

                                //updating Code Enf record with Tank record info
                                logDebugLocal("checking for tank records as children of the site");
                                var childTankRecordArray = getChildren("DEQ/OPC/Hazardous Tank/Permit", capId);
                                logDebugLocal("childTankRecordArray length is: " + childTankRecordArray.length);
                                if (childTankRecordArray.length > 0)
                                {
                                    //logDebugLocal("child tank records found");
                                    for (ct in childTankRecordArray)
                                    {
                                        //logDebugLocal("checking tank record appstatuses...");
                                        if (getAppStatus(childTankRecordArray[ct]) == "Active")
                                        {
                                            logDebugLocal("Active tank found! AltID is: " + childTankRecordArray[ct].getCustomID());
                                            var newRow = new Array();
                                            var tankNo = getAppSpecific("SCDHS Tank #", childTankRecordArray[ct]);
                                            var productStore = getAppSpecific("Product Stored Label", childTankRecordArray[ct]);
                                            //logDebugLocal("productstore is: " + productStore);
                                            var capacity = getAppSpecific("Capacity", childTankRecordArray[ct]) + " " + getAppSpecific("Units", childTankRecordArray[ct]);
                                            var tankLocLabel = getAppSpecific("Tank Location Label", childTankRecordArray[ct]);
                                            var articleTwelve = getAppSpecific("Article 12 Reg", childTankRecordArray[ct]);
                                            var articleEighteen = getAppSpecific("Article 18 Reg", childTankRecordArray[ct]);
                                            newRow["Tank Number"] = tankNo;
                                            newRow["Product Store Label"] = productStore;
                                            newRow["Capacity"] = capacity;
                                            newRow["Tank Location Label"] = tankLocLabel;
                                            newRow["Article 12"] = articleTwelve;
                                            newRow["Article 18"] = articleEighteen;
                                            //logDebugLocal("newRow psl is: " + newRow["Product Store Label"]);
                                            addRowToASITable("OPERATING PERMIT", newRow, enfChild);
                                        }
                                    }
                                }
                            }
                            if (appTypeArray[1] == "OPC" && appTypeArray[2] == "Hazardous Tank" && appTypeArray[3] == "Permit")
                            {
                                var parentCap = getParentLOCAL(capId);

                                logDebugLocal("updating contacts, parcel, address, ASIs, appname, and project description");
                                var enfChild = createChildLOCAL("DEQ", "OPC", "Enforcement", "NA", null, parentCap);
                                //copyContacts(capId, enfChild);
                                copyParcel(capId, enfChild);
                                copyAddress(capId, enfChild);
                                var siteAltId = parentCap.getCustomID();
                                editAppSpecific("Site/Pool (Parent) Record ID", siteAltId, enfChild);
                                var fileRefNumber = getAppSpecific("File Reference Number", parentCap);
                                editAppSpecific("File Reference Number/Facility ID", fileRefNumber, enfChild);
                                editAppSpecific("Enforcement Type", "TT", enfChild);
                                var appName = getAppName();
                                var projDesc = workDescGet(parentCap);
                                editAppName(parentCap, enfChild);
                                updateWorkDesc(projDesc, enfChild);

                                var newRow = new Array();
                                var tankNo = getAppSpecific("SCDHS Tank #", capId);
                                var productStore = getAppSpecific("Product Stored Label", capId);
                                logDebugLocal("productstore is: " + productStore);
                                var capacity = getAppSpecific("Capacity", capId) + " " + getAppSpecific("Units", capId);
                                var tankLocLabel = getAppSpecific("Tank Location Label", capId);
                                var articleTwelve = getAppSpecific("Article 12 Reg", capId);
                                var articleEighteen = getAppSpecific("Article 18 Reg", capId);
                                var nextLineTestDate = getAppSpecific("Next Line Test Date", capId);
                                var nextTankTestDate = getAppSpecific("Next Tank Test Date", capId);
                                newRow["Tank Number"] = tankNo;
                                newRow["Product Store Label"] = productStore;
                                newRow["Capacity"] = capacity;
                                newRow["Tank Location Label"] = tankLocLabel;
                                newRow["Next Tank Test Date"] = nextLineTestDate;
                                newRow["Next Line Test Date"] = nextTankTestDate;
                                logDebugLocal("newRow psl is: " + newRow["Product Store Label"]);
                                addRowToASITable("TANK TIGHTNESS TEST", newRow, enfChild);



                            }
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
    logDebugLocal("End of Job: Elapsed Time : " + elapsed() + " Seconds");
}
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
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
        logDebugLocal("ERROR: Failed to get app status: " + capResult.getErrorMessage());
    }
    return appStatus;
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

function lookup(stdChoice, stdValue) {
    var strControl;
    var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

    if (bizDomScriptResult.getSuccess())
    {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        //logDebugLocal("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
    }
    else
    {
        //logDebugLocal("lookup(" + stdChoice + "," + stdValue + ") does not exist");
    }
    return strControl;
}

function dateDiff(date1, date2) {
    return (convertDate(date2).getTime() - convertDate(date1).getTime()) / (1000 * 60 * 60 * 24);
}
function convertDate(thisDate) {
    //converts date to javascript date
    if (typeof (thisDate) == "string")
    {
        var retVal = new Date(String(thisDate));
        if (!retVal.toString().equals("Invalid Date"))
            return retVal;
    }
    if (typeof (thisDate) == "object")
    {
        if (!thisDate.getClass)
        {// object without getClass, assume that this is a javascript date already 
            return thisDate;
        }
        if (thisDate.getClass().toString().equals("class com.accela.aa.emse.dom.ScriptDateTime"))
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
    }
    if (typeof (thisDate) == "number")
    {
        return new Date(thisDate);  // assume milliseconds
    }
    //logDebugLocal("**WARNING** convertDate cannot parse date : " + thisDate);
    return null;
}
function elapsed() {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - startTime) / 1000)
}
function logDebugLocal(dstr) {
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
function getAppSpecific(itemName)  // optional: itemCap
{
    var updated = false;
    var i = 0;
    var itemCap = capId;
    if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

    if (useAppSpecificGroupName)
    {
        if (itemName.indexOf(".") < 0)
        {logDebugLocal("**WARNING: editAppSpecific requires group name prefix when useAppSpecificGroupName is true"); return false}


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
    {logDebugLocal("**ERROR: getting app specific info for Cap : " + appSpecInfoResult.getErrorMessage())}
}
function getAppName() {
    var itemCap = capId;
    if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args

    capResult = aa.cap.getCap(itemCap)

    if (!capResult.getSuccess())
    {logDebug("**WARNING: error getting cap : " + capResult.getErrorMessage()); return false}

    capModel = capResult.getOutput().getCapModel()

    return capModel.getSpecialText()
}
function addRowToASITable(tableName, tableValues) //optional capId
{
    //tableName is the name of the ASI table
    //tableValues is an associative array of values.  All elements must be either a string or asiTableVal object
    itemCap = capId
    if (arguments.length > 2)
    {
        itemCap = arguments[2]; //use capId specified in args
    }
    var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap, tableName);
    if (!tssmResult.getSuccess())
    {
        logDebug("**WARNING: error retrieving app specific table " + tableName + " " + tssmResult.getErrorMessage());
        return false;
    }
    var tssm = tssmResult.getOutput();
    var tsm = tssm.getAppSpecificTableModel();
    var fld = tsm.getTableField();
    var col = tsm.getColumns();
    var fld_readonly = tsm.getReadonlyField(); //get ReadOnly property
    var coli = col.iterator();
    while (coli.hasNext())
    {
        colname = coli.next();
        if (!tableValues[colname.getColumnName()]) 
        {
            logDebug("Value in " + colname.getColumnName() + " - " + tableValues[colname.getColumnName()]);
            logDebug("addToASITable: null or undefined value supplied for column " + colname.getColumnName() + ", setting to empty string");
            tableValues[colname.getColumnName()] = "";
        }
        if (typeof (tableValues[colname.getColumnName()].fieldValue) != "undefined")
        {
            fld.add(tableValues[colname.getColumnName()].fieldValue);
            fld_readonly.add(tableValues[colname.getColumnName()].readOnly);
        }
        else // we are passed a string
        {
            fld.add(tableValues[colname.getColumnName()]);
            fld_readonly.add(null);
        }
    }
    tsm.setTableField(fld);
    tsm.setReadonlyField(fld_readonly); // set readonly field
    addResult = aa.appSpecificTableScript.editAppSpecificTableInfos(tsm, itemCap, currentUserID);
    if (!addResult.getSuccess())
    {
        logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage());
        return false;
    }
    else
    {
        logDebug("Successfully added record to ASI Table: " + tableName);
    }
}
function doSQL2(sql) {
    try
    {
        var valuesArr = [];
        //commented out as per task 6825 , replaced with var conn = aa.db.getConnection();
        //var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
        //var ds = initialContext.lookup("java:/AA");
        //var conn = ds.getConnection();
        var conn = aa.db.getConnection();
        var sStmt = conn.prepareStatement(sql);
        if (sql.toUpperCase().indexOf("SELECT") == 0)
        {
            var rSet = sStmt.executeQuery();
            while (rSet.next())
            {
                var obj = {};
                var md = rSet.getMetaData();
                var columns = md.getColumnCount();
                for (i = 1; i <= columns; i++)
                {
                    obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
                }
                obj.count = rSet.getRow();
                valuesArr.push(obj);
            }
            rSet.close();
            sStmt.close();
            conn.close();
            return valuesArr;
        }
    } catch (err)
    {
        logDebugLocal(err.message);
        logDebugLocal(err.message);
    }
}
function getParentLOCAL(targetCapId) {
    // returns the capId object of the parent.  Assumes only one parent!
    //
    var getCapResult = aa.cap.getProjectParents(targetCapId, 1);
    if (getCapResult.getSuccess())
    {
        var parentArray = getCapResult.getOutput();
        if (parentArray.length)
            return parentArray[0].getCapID();
        else
        {
            aa.print("**WARNING: GetParent found no project parent for this application");
            return false;
        }
    }
    else
    {
        aa.print("**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
        return false;
    }
}
function createChildLOCAL(grp, typ, stype, cat, desc) // optional parent capId
{
    //
    // creates the new application and returns the capID object
    //

    var itemCap = capId
    if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args

    var appCreateResult = aa.cap.createApp(grp, typ, stype, cat, desc);
    logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
    if (appCreateResult.getSuccess())
    {
        var newId = appCreateResult.getOutput();
        logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

        // create Detail Record
        capModel = aa.cap.newCapScriptModel().getOutput();
        capDetailModel = capModel.getCapModel().getCapDetailModel();
        capDetailModel.setCapID(newId);
        aa.cap.createCapDetail(capDetailModel);

        var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
        var result = aa.cap.createAppHierarchy(itemCap, newId);
        if (result.getSuccess())
            logDebug("Child application successfully linked");
        else
            logDebug("Could not link applications");

        // Copy Parcels

        var capParcelResult = aa.parcel.getParcelandAttribute(itemCap, null);
        if (capParcelResult.getSuccess())
        {
            var Parcels = capParcelResult.getOutput().toArray();
            for (zz in Parcels)
            {
                logDebug("adding parcel #" + zz + " = " + Parcels[zz].getParcelNumber());
                var newCapParcel = aa.parcel.getCapParcelModel().getOutput();
                newCapParcel.setParcelModel(Parcels[zz]);
                newCapParcel.setCapIDModel(newId);
                newCapParcel.setL1ParcelNo(Parcels[zz].getParcelNumber());
                newCapParcel.setParcelNo(Parcels[zz].getParcelNumber());
                aa.parcel.createCapParcel(newCapParcel);
            }
        }

        // Copy Contacts
        capContactResult = aa.people.getCapContactByCapID(itemCap);
        if (capContactResult.getSuccess())
        {
            Contacts = capContactResult.getOutput();
            for (yy in Contacts)
            {
                var newContact = Contacts[yy].getCapContactModel();
                newContact.setCapID(newId);
                aa.people.createCapContact(newContact);
                logDebug("added contact");
            }
        }

        // Copy Addresses
        capAddressResult = aa.address.getAddressByCapId(itemCap);
        if (capAddressResult.getSuccess())
        {
            Address = capAddressResult.getOutput();
            for (yy in Address)
            {
                newAddress = Address[yy];
                newAddress.setCapID(newId);
                aa.address.createAddress(newAddress);
                logDebug("added address");
            }
        }

        return newId;
    }
    else
    {
        logDebug("**ERROR: adding child App: " + appCreateResult.getErrorMessage());
    }
}