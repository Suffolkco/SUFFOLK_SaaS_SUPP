/*------------------------------------------------------------------------------------------------------/
| Program : PF_DEQ_IA_TRAN_REQUIRE_LAB.js
| Event   : ACA_BEFORE Event
| Ticket   : EHIMS2-50
| Requiring entries in custom tables based on ASI values
| Author:Dpinzon
/------------------------------------------------------------------------------------------------------*/

var documentOnly = false;
var disableTokens = false;
var useAppSpecificGroupName = false;
var useTaskSpecificGroupName = false;
var enableVariableBranching = false;
var maxEntries = 99;
var cancel = false;
var startDate = new Date();
var startTime = startDate.getTime();
var message = "";
var debug = "";
var br = "<br>";
var showDebug = false;
var showMessage = false;
//Needed to load the includes files
//This way we are not re-defining everything over and over.
eval(getScriptText("INCLUDES_CUSTOM", null, true));
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
try {
    var cap = aa.env.getValue("CapModel");
    var capId = cap.getCapID();
    var capOut = aa.cap.getCap(capId).getOutput();
    if (capOut != null) {
        var appTypeResult = cap.getCapType();
        var appTypeString = appTypeResult.toString();
        var appTypeArray = appTypeString.split("/");
    }
    var AInfo = new Array();
    loadAppSpecific4ACA(AInfo);
    var samRes = AInfo["Sample Results"];
  
    if (samRes == "CHECKED") {
        LABRESULTSANDFIELDDATA = new Array();
        loadASITables4ACATANK();
        if (typeof LABRESULTSANDFIELDDATA == "undefined" || LABRESULTSANDFIELDDATA.length == 0) {
            cancel = true;
            showMessage = true;
            comment("Please add at least one entry in table LAB RESULTS");
        }
    }

}

catch (error) {
    logDebug("an error was encoutered: " + error.message);
    showDebug = true;
    showMessage = true;
}

if (debug.indexOf("**ERROR") > 0 || debug.substr(0, 7) == "**ERROR") {
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else {
    if (cancel) {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    } else {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function loadASITables4ACATANK() {

    //
    // Loads App Specific tables into their own array of arrays.  Creates global array objects
   //
   // Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
   //

   var itemCap = capId;
   if (arguments.length == 1)
       {
       itemCap = arguments[0]; // use cap ID specified in args
       var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
       }
   else
       {
       var gm = cap.getAppSpecificTableGroupModel()
       }

   var ta = gm.getTablesMap();


   var tai = ta.values().iterator();

   while (tai.hasNext())
     {
     var tsm = tai.next();

     if (tsm.rowIndex.isEmpty()) continue;  // empty table

     var tempObject = new Array();
     var tempArray = new Array();
     var tn = tsm.getTableName();

     tn = String(tn).replace(/[^a-zA-Z0-9]+/g,'');

     if (!isNaN(tn.substring(0,1))) tn = "TBL" + tn  // prepend with TBL if it starts with a number

       var tsmfldi = tsm.getTableField().iterator();
     var tsmcoli = tsm.getColumns().iterator();
     var numrows = 1;

     while (tsmfldi.hasNext())  // cycle through fields
       {
       if (!tsmcoli.hasNext())  // cycle through columns
           {

           var tsmcoli = tsm.getColumns().iterator();
           tempArray.push(tempObject);  // end of record
           var tempObject = new Array();  // clear the temp obj
           numrows++;
           }
       var tcol = tsmcoli.next();
       var tval = tsmfldi.next();
       tempObject[tcol.getColumnName()] = tval;
       }
     tempArray.push(tempObject);  // end of record
     var copyStr = "" + tn + " = tempArray";
     //logDebug("ASI Table Array : " + tn + " (" + numrows + " Rows)");
     eval(copyStr);  // move to table name
     }

   }

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



//ACA Functions 
function getScriptText(vScriptName, servProvCode, useProductScripts) {
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try {
        if (useProductScripts) {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err) {
        return "";
    }
}