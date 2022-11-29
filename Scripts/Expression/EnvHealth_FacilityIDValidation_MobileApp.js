var servProvCode = expression.getValue("$$servProvCode$$").value;
var recNumber = expression.getValue("ASI::FACILITY INFORMATION::Facility ID");
var aa = expression.getScriptRoot();
var capID1EB = expression.getValue("$$capID1$$").value;
var capID2EB = expression.getValue("$$capID2$$").value;
var capID3EB = expression.getValue("$$capID3$$").value;
var capIdEB = aa.cap.getCapID(capID1EB, capID2EB, capID3EB).getOutput();
var thisForm = expression.getValue("ASI::FORM");
var showDebug = true;
var emailText = "";
var totalRowCount = expression.getTotalRowCount();

if(!matches(recNumber.value, "", null, undefined))
{
	var capIdPar = aa.cap.getCapID(recNumber.value);
	if(capIdPar.getSuccess())
	{
		var capIdP = capIdPar.getOutput();
		var matchCap = aa.cap.getCap(capIdP).getOutput();
		var matchArray = matchCap.getCapType().toString().split("/");
		var isMatch = true;
		var ats = "EnvHealth/*/*/*";
		var ata = ats.split("/");
		for (xx in ata)
		{
			if (!ata[xx].equals(matchArray[xx]) && !ata[xx].equals("*"))
			{
				isMatch = false;	
			}
		}
		if (!isMatch)
		{
			recNumber.message = "Valid Facility ID required.";
			expression.setReturn(recNumber);
			thisForm.blockSubmit = true;
			expression.setReturn(thisForm);
		}
		else 
		{
			recNumber.message = "Facility ID verified.";
			expression.setReturn(recNumber);
			thisForm.blockSubmit = false;
			expression.setReturn(thisForm);
		}
	}
	else
	{
		recNumber.message = "Facility ID (" + recNumber.value + ") not found. Please provide a valid Facility ID or leave this field blank.";
		expression.setReturn(recNumber);
		thisForm.blockSubmit = true;
		expression.setReturn(thisForm);
	}
	
}
//else
//{
//	recNumber.message = "Project Record ID # needed.";
//	expression.setReturn(recNumber);
//	thisForm.blockSubmit = true;
//	expression.setReturn(thisForm);
//}

function matches(eVal, argList) 
{
	for(var i = 1; i < arguments.length; i++)
	{
		if(arguments[i] == eVal)
		{
			return true;
		}
	}
	return false;
}

function debugObject(object)
{
	 var output = ''; 
	 for (property in object)
	 { 
	   output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
	 } 
	 logDebug(output);
} 

function logDebug(dstr) 
{
	if(showDebug) 
	{
		aa.print(dstr)
		emailText += dstr + "<br>";
		aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
	}
}

var toPrecision = function(value)
{
  var multiplier = 10000;
  return Math.round(value * multiplier) / multiplier;
}

function addDate(iDate, nDays)
{ 
	if(isNaN(nDays))
	{
		throw("Day is a invalid number!");
	}
	return expression.addDate(iDate, parseInt(nDays));
}

function dateAdd(td, amt) 
{
	var dDate = new Date();
	if (!td)
	{
		dDate = new Date();
	}
	else
	{
		dDate = new Date(td); 
	}
	dDate.setTime(dDate.getTime() + (1000 * 60 * 60 * 24 * amt));
	return (dDate.getMonth() + 1) + "/" + dDate.getDate() + "/" + dDate.getFullYear();
}

function getJSDateDiff(startDate, endDate) 
{
	var diffDays = parseInt((endDate - startDate) / (1000 * 60 * 60 * 24));
    return diffDays;
}

function parseDate(dateString)
{
	return expression.parseDate(dateString);
}

function formatDate(dateString, pattern)
{ 
	if(dateString == null || dateString == '')
	{
		return '';
	}
	return expression.formatDate(dateString, pattern);
}
