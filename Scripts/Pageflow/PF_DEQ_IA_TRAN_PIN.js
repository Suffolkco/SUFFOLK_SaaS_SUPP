
    /*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = true;
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = " "; // Message String
var debug = "true"; // Debug String
var br = "<BR>"; // Break Tag
// Comment left by Jason C as a test

var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}
if (SA) {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}
eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1)
		servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

function printObjProperties(obj){
    var rtn = "";
    var idx;
    if(obj.getClass != null){
        rtn += "************* " + obj.getClass() + " *************<br/>";
    }
    for(idx in obj){
        if (typeof (obj[idx]) == "function") {
            try {
                rtn += "" + idx + "==>  " + obj[idx]() + "<br/>";
            } catch (ex) { }
        } else {
            rtn += "" + idx + ":  " + obj[idx] + "<br/>";
        }
    }

    return rtn;
}


function local_loadASITables4ACA() {
    // Loads App Specific tables into their own array of arrays.  Creates global array objects
    // Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
    var itemCap = capId;
    if (1 == arguments.length) {
        itemCap = arguments[0];
        var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput()
    } else {
        var gm = cap.getAppSpecificTableGroupModel();   
    }
    for (var ta = gm.getTablesMap(), tai = ta.values().iterator(); tai.hasNext();) {
        var tsm = tai.next();
        if (!tsm.rowIndex.isEmpty()) {
            var tempObject = new Array,
            tempArray = new Array,
            tn = tsm.getTableName();
            tn = String(tn).replace(/[^a-zA-Z0-9]+/g, ""),
            isNaN(tn.substring(0, 1)) || (tn = "TBL" + tn);
            for (var tsmfldi = tsm.getTableField().iterator(), tsmcoli = tsm.getColumns().iterator(), numrows = 1; tsmfldi.hasNext();) {
                if (!tsmcoli.hasNext()) {
                    var tsmcoli = tsm.getColumns().iterator();
                    tempArray.push(tempObject);
                    var tempObject = new Array;
                    numrows++
                }
                var tcol = tsmcoli.next();
                var tobj = tsmfldi.next(); 
                var tval = ""; 
                try { 
                    if(!tobj || !tobj.getInputValue()){
                        tval = tobj;
                    } else {
                        tval = tobj.getInputValue(); 
                    }
                }  catch (ex) { 
                    tval = tobj; 
                }
                tempObject[tcol.getColumnName()] = tval;
            }
            tempArray.push(tempObject);
            var copyStr = "" + tn + " = tempArray";
            logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)"),
            eval(copyStr)
        }
    }
}

///// SET REQUIRED FIELDS - START
var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode(); // Service Provider Code
var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
    currentUserID = "ADMIN";
	publicUser = true;
} // ignore public users
var capIDString = capId.getCustomID(); // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
///// SET REQUIRED FIELDS - END


//// LOAD CUSTOM FIELDS AND LISTS - START
var AInfo = new Array(); // Create array for tokenized variables
useAppSpecificGroupName = true;
loadAppSpecific4ACA(AInfo);
local_loadASITables4ACA();
//// LOAD CUSTOM FIELDS AND LISTS - END

/*------------------------------------------------------------------------------------------------------/
| <=========== MAIN PROCESSING START ================>
/-----------------------------------------------------------------------------------------------------*/
// Validation messaging and halting work on on Before Button in PageFlow

var pin = AInfo["PIN Number"];
var iaNumber = AInfo["IA Record Number"];


    var getCapResult = aa.cap.getCapIDsByAppSpecificInfoField("IA PIN Number", pin);
    if (getCapResult.getSuccess())
    {
        var apsArray = getCapResult.getOutput();
        for (aps in apsArray)
        {
            myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
            logDebug("apsArray = " + apsArray);
            var relCap = myCap.getCapID();
            var relCapID = relCap.getCustomID();
        }
    }

    var getCapResult = aa.cap.getCapID(iaNumber);
    if (getCapResult.getSuccess() && !matches(relCapID, iaNumber))
    {
        showMessage = true;
        cancel = true;
        message = "PIN and IA Number do not match that of " + relcap;
    }
    else 
    {
        showMessage = false;
        cancel = false;
        message = "";
    }

//////////////////////////////////////////////
//  GENERIC BLOCK TO HANDLE MESSAGES - START
if (debug.indexOf("**ERROR") > 0) {
    aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
        aa.env.setValue("ErrorMessage", message);
		if (showDebug)
        aa.env.setValue("ErrorMessage", debug);
	} else {
        aa.env.setValue("ErrorCode", "0");
		if (showMessage)
        aa.env.setValue("ErrorMessage", message);
		if (showDebug)
        aa.env.setValue("ErrorMessage", debug);
	}
}
//  GENERIC BLOCK TO HANDLE MESSAGES - END
//////////////////////////////////////////////
/*------------------------------------------------------------------------------------------------------/
| <=========== MAIN PROCESSING END ================>
/-----------------------------------------------------------------------------------------------------*/