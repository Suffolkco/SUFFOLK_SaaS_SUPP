// This is a modified loadASITable 
// that only returns true or false 
// depending on whether rows are found

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