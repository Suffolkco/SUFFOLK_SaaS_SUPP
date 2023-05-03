// Enter your script here...
//showDebug = true;
//EHIMS2-288
try{


		var table = new Array();
		var sysDate = aa.date.getCurrentDate();
		var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
        if(loadASITable("DEQ_SIP_GRANT_ELIGIBILITY",capId))
            table = loadASITable("DEQ_SIP_GRANT_ELIGIBILITY",capId);
		 if(loadASITable("DEQ_SIP_GRANT_PAYMENT",capId))
            table2 = loadASITable("DEQ_SIP_GRANT_PAYMENT",capId);
			var documentModel = aa.env.getValue("DocumentModel");
             var rowArray = [];
			 var rowArrayPayment = [];
        if(table && table.length>0)
        {

     			var docType = documentModel.getDocCategory();
                var status = documentModel.getDocStatus();
            for(var bb in table)
            {

                if(table[bb]["Document Type"] == String(docType))

                {
                  
if(String(status) == "Insufficient")
                    table[bb]["Current Status"] = "Incomplete";
else if(String(status) == "Sufficient")
                    table[bb]["Current Status"] = "Complete";
else
table[bb]["Current Status"] = status;
                    table[bb]["Status Date"] = sysDateMMDDYYYY;
                    addRowToASITable("DEQ_SIP_GRANT_ELIGIBILITY", rowArray, capId);
                    break;
                }
            }                         
        } 
		
		
		if(table2 && table2.length>0)
        {

     			var docType = documentModel.getDocCategory();
                var status = documentModel.getDocStatus();
            for(var bb in table2)
            {

                if(table2[bb]["Document Type"] == String(docType))

                {
                  
                   if(String(status) == "Insufficient")
                    table2[bb]["Current Status"] = "Incomplete";
else if(String(status) == "Sufficient")
                    table2[bb]["Current Status"] = "Complete";
else
table2[bb]["Current Status"] = status;
                    table2[bb]["Status date"] = sysDateMMDDYYYY;
                    addRowToASITable("DEQ_SIP_GRANT_PAYMENT", rowArrayPayment, capId);
                    break;
                }
            }                         
        } 
        
        removeASITable("DEQ_SIP_GRANT_ELIGIBILITY", capId);
        addASITable("DEQ_SIP_GRANT_ELIGIBILITY",table, capId); 
		 removeASITable("DEQ_SIP_GRANT_PAYMENT", capId);
        addASITable("DEQ_SIP_GRANT_PAYMENT",table2, capId); 
				  
  }
catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
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
	var tssmResult = aa.appSpecificTableScript.getAppSpecificTableModel(itemCap,tableName);
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
		if (typeof(tableValues[colname.getColumnName()].fieldValue) != "undefined")
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
	if (!addResult .getSuccess())
	{ 
		logDebug("**WARNING: error adding record to ASI Table:  " + tableName + " " + addResult.getErrorMessage()); 
		return false;
	}
	else
	{
		logDebug("Successfully added record to ASI Table: " + tableName);
	}
}
