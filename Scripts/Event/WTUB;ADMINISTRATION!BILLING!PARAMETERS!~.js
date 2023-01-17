// WTUB:ADMINISTRATION/BILLING/PARAMETERS/NA 	

try{
	// find Set
	var setStatus;
	var noSet = false; 
	
	var setID = capId.getCustomID(); 
	var setResult = aa.set.getSetByPK(setID);
	if(setResult.getSuccess()){
		var setModel=setResult.getOutput();
		setStatus = setModel.getSetStatus();
	}else{
		noSet = true;
	}
	
	if(wfTask == "Renewal Set Processing"  &&  wfStatus == "Create Renewal Set" ){
		
		// required fields must be populated to create set
		var billingRange = doASITRowsExist("BILLING PROGRAMS RANGE");
		var peKeys = doASITRowsExist("PROGRAM ELEMENT KEYS");
		
		logDebug("billingRange: " + billingRange);
		logDebug("peKeys: " + peKeys);
		if (billingRange == false && peKeys == false) {
			cancel = true;
			showMessage = true;
			comment("Program Elements must be defined in Billing Information tab before billing Set can be created.");
		} 
		// set already exists
		if(!noSet){
			cancel = true;
			showMessage = true;
			comment("Set already exists.");
		}
	}
	
}catch(err){
	logDebug("A JavaScript Error occurred: WTUB:ADMINISTRATION/BILLING/PARAMETERS/NA :  " + err.message);
}



try{
	if(wfTask == "Renewal Set Processing" && wfStatus == "Run Fee Assessment Batch"){
		
		if(noSet == true){
			cancel = true;
			showMessage = true;
			comment("Must first create a valid Billing set before assessing fees");
		}
	}
}catch(err){
	logDebug("A JavaScript Error occurred: WTUB:ADMINISTRATION/BILLING/PARAMETERS/NA :  " + err.message);
}

try{
	if(wfTask == "Invoice Processing"){
		cancel = true;
		showMessage = true;
		comment("No manual updates can be made on this task");
	}	
}catch(err){
	logDebug("A JavaScript Error occurred: WTUB:ADMINISTRATION/BILLING/PARAMETERS/NA :  " + err.message);
}
function doASITRowsExist(tName){
	var itemCap = capId;
	if (arguments.length == 2) itemCap = arguments[1]; // use cap ID specified in args

	var gm = aa.appSpecificTableScript.getAppSpecificTableGroupModel(itemCap).getOutput();
	var ta = gm.getTablesArray()
	var tai = ta.iterator();

	while (tai.hasNext()){
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      if (!tn.equals(tName)) continue;

	  if(tsm.rowIndex.isEmpty()){
			return false;
		}else{
			return true;
		}
	}
}
