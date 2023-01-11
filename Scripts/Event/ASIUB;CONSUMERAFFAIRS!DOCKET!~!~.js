// /ASIUA:
// This is to add the unique ID to the custom list VIOLATION CHEAT SHEET
var showDebug = true;
var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I")
{
    useSA = true;
    SA = bzr.getOutput().getDescription();
    bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
    if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }
}

if (SA)
{
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
    eval(getScriptText(SAScript, SA));
}
else
{
    eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_CUSTOM"));

try
{
	var AInfo = new Array();						// Create array for tokenized variables

	loadASITables4ACA();

	loadASITablesBefore();
	//logGlobals(AInfo);

	cheatSheet = loadASITable("VIOLATION CHEAT SHEET");
	
		
	for (var c in cheatSheet)
	{
	
		var createVio = cheatSheet[c]["Create Violation"];
		var withdrawVio = cheatSheet[c]["Withdraw Violation"];
		logDebug("createVio:" + createVio);
		logDebug("withdrawVio:" + withdrawVio);
 
		// Only if they enable the flag and the field is empty
		if (createVio == 'CHECKED' && withdrawVio =='CHECKED')
		{
			cancel = true;
			showMessage = true;
			comment("Please confirm the entries. 'Create Violation' and 'Withdraw Violation' checkboxes cannot be enabled at the same time.");
		}
	}


}
catch (err) {
    var showDebug = false;
	logDebug("A JavaScript Error occured: " + err.message + " In Line " + err.lineNumber);
	}

	function loadASITables4ACA() {

		//
		// Loads App Specific tables into their own array of arrays.  Creates global array objects
	   //
	   // Optional parameter, cap ID to load from.  If no CAP Id specified, use the capModel
	   //
   
	   var itemCap = capId;
	   if (1 == arguments.length) {
		   itemCap = arguments[0];
		   var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput()
	   } else var gm = cap.getAppSpecificTableGroupModel();
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
								  try 
								  { 
										 tval = tobj.getInputValue(); 
										 logDebug("tval: " + tval);
								  } 
								  catch (ex) 
								  { 
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
	
	
   function loadASITablesBefore() {
   
	   //
	   // Loads App Specific tables into their own array of arrays.  Creates global array objects
	   //
	   //Sometimes "AppSpecificTableGroupModel" is a list
	   var gm = aa.env.getValue("AppSpecificTableGroupModel");
   
	   var gmItem = gm;
   
	   if (gm != null && typeof(gm).size != "undefined" && gm.size() > 0) {
		   gmItem = gm.get(0);
	   } else {
		   gmItem = gm;
	   }
   
	   if (null != gmItem && gmItem != "") {
		   var ta = gmItem.getTablesMap().values();
		   var tai = ta.iterator();
		   while (tai.hasNext()) {
			   var tsm = tai.next();
   
			   if (tsm.rowIndex.isEmpty())
				   continue; // empty table
   
			   var tempObject = new Array();
			   var tempArray = new Array();
			   var tn = tsm.getTableName();
   
			   var numrows = 0;
			   tn = String(tn).replace(/[^a-zA-Z0-9]+/g, '');
   
			   if (!isNaN(tn.substring(0, 1)))
				   tn = "TBL" + tn // prepend with TBL if it starts with a number
   
					   if (!tsm.rowIndex.isEmpty()) {
						   var tsmfldi = tsm.getTableField().iterator();
						   var tsmcoli = tsm.getColumns().iterator();
   
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
							   var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
							   logDebug("fieldInfo: " + fieldInfo);
							   tempObject[tcol.getColumnName()] = fieldInfo;
   
						   }
   
						   tempArray.push(tempObject); // end of record
					   }
   
					   var copyStr = "" + tn + " = tempArray";
			   aa.print("ASI Table Array : " + tn + " (" + numrows + " Rows)");
			   eval(copyStr); // move to table name
		   }
	   }
   } 
	