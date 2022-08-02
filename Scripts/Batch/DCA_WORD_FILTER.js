var servProvCode=expression.getValue("$$servProvCode$$").value;
var firstName=expression.getValue("CONTACT1::contactsModel*firstName");
var lastName=expression.getValue("CONTACT1::contactsModel*lastName");
var bName=expression.getValue("CONTACT1::contactsModel*businessName");
var variable3=expression.getValue("CONTACT1::FORM");
var aa = expression.getScriptRoot();
var myCapId = expression.getValue("CAP::capModel*altID").value;  

var capId = aa.cap.getCapID(myCapId).getOutput();

var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)

var showDebug=true;
var showMessage=true;
var debug="";
var br = "<br>";

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript));
eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();
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

var wordList = lookup("ACA_WORD_FILTER","RESTRICTED_WORD_LIST").split(',');
var badWordFound = "";
var badWordName = false;
var badFirstName = false;
var badLastName = false;

for (wL in wordList){
	badWord = wordList[wL].toUpperCase();

    if (bName.value.toUpperCase().indexOf(badWord) > -1){
		// dataFieldForm.message = badWord + " BAD WORD ENTERED ";
		bName.message = "BAD WORD ENTERED IN BUSINESS NAME.  PLEASE REENTER USING RESPONSIBLE LANGUAGE";
		bName.value = String("");
		badWordName = true;
	}
	if (firstName.value.toUpperCase().indexOf(badWord) > -1){
		// dataFieldForm.message = badWord + " BAD WORD ENTERED ";
		firstName.message = "BAD WORD ENTERED IN DESCRIPTION OF COMPLAINT.  PLEASE REENTER USING RESPONSIBLE LANGUAGE";
		firstName.value = String("");	
		badFirstName  = true;
	}
    if (lastName.value.toUpperCase().indexOf(badWord) > -1){
		// dataFieldForm.message = badWord + " BAD WORD ENTERED ";
		lastName.message = "BAD WORD ENTERED IN LOCATION.  PLEASE REENTER USING RESPONSIBLE LANGUAGE";
		lastName.value = String("");	
		badLastName = true;
	}
}
if (!badWordName )
{
bName.message = "";
}
if (!badFirstName)
{
    firstName.message = "";
}
if (!badLastName)
{
    lastName.message = "";
}
expression.setReturn(bName);
expression.setReturn(firstName);
expression.setReturn(lastName);

