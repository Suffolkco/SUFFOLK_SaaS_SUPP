/* 	
|	
|	Ron Kovacs
|	
|				  Copy ASI from Parent Facility Record
|				  12/1/2022 - 
*/

var servProvCode=expression.getValue("$$servProvCode$$").value;
var permitNumber = expression.getValue("ASI::FACILITY INFORMATION::Facility ID");
var asiForm = expression.getValue("ASI::FORM");

var fields = ["ASI::FACILITY INFORMATION::Facility Name"];

var aa = expression.getScriptRoot();

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,true));
eval(getScriptText("INCLUDES_CUSTOM", null, true));
var SCRIPT_VERSION = 9.0;


var permitCapId = aa.cap.getCapID(permitNumber.value.trim());
var permitCapIdOut = permitCapId.getOutput();
if(permitCapId.getSuccess())
{


	fillData(fields,permitCapIdOut);

}



function getScriptText(vScriptName, servProvCode, useProductScripts)
{
	if(!servProvCode)
	{
		servProvCode = aa.getServiceProviderCode();
	}

	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();

	try
	{
		if(useProductScripts)
		{
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		}
		else
		{
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}

		return emseScript.getScriptText() + "";
	}
	catch (err)
	{
		return "";
	}
}

function fillData(fieldsarray,itemcap)
{
	for(var f in fieldsarray)
	{
		expression.getValue(fieldsarray[f]).value = getAppSpecific(fieldsarray[f].replace("ASI::FACILITY INFORMATION::",""),itemcap);
		expression.setReturn(expression.getValue(fieldsarray[f]));
	}
}

function clearData(fieldsarray)
{
	for(var f in fieldsarray)
	{
		expression.getValue(fieldsarray[f]).value = "";
		expression.setReturn(expression.getValue(fieldsarray[f]));
	}
}
