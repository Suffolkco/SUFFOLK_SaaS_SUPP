/*------------------------------------------------------------------------------------------------------/
| Program : ACA POOL RENEWAL ONLOAD.js
| Event   : ACA Amend OnLoad
|
| Usage   : Developed by Casey Gray 5/21/2019
|
| Client  : Suffolk County
| Action# : 
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
useAppSpecificGroupName = false;
var br = "<BR>";

//eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
//eval(getScriptText("INCLUDES_CUSTOM"));

var errorMessage = "";

var errorCode = "0";
var currentUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
  currentUserID = "ADMIN";
  publicUser = true;
} // ignore public users

  copy();
 
/*------------------------------------------------------------------------------------------------------/
| <===========Functions (used by copy)
/------------------------------------------------------------------------------------------------------*/

function copy() {
  //----------------------------------------
  var capModel = aa.env.getValue("CapModel");

  targetCapId = capModel.getCapID();

  aa.debug("Debug:", "TargetCapId:" + targetCapId);

  if (targetCapId == null) {
    errorMessage += "targetCapId is null.";
    errorCode = -1;
    end();
    return;
  }
  var parentCapId = getParent(targetCapId);

    try {
    
        var capModel = aa.env.getValue("CapModel"); 
        targetCapId = capModel.getCapID();
        if(targetCapId==null)
        {
            errorMessage+="targetCapId is null.";
            errorCode=-1;
        }
        var cap = aa.env.getValue("CapModel");
        var capId = aa.cap.getCapViewBySingle4ACA(targetCapId);

        var ownerTypeCode = getAppSpecific("Owner Type Code", capId);

    if ((ownerTypeCode == '2') || (ownerTypeCode == '3') || (ownerTypeCode = '4'))
    {
        editAppSpecific4ACA("Fee Exempt", 'Yes', capId); 
    }
    else
    {
        editAppSpecific4ACA("Fee Exempt", 'No', capId);
    }
    var fee = getAppSpecific("Fee Exempt", capId);
    //aa.sendMail("noreplyehims@suffolkcountyny.gov", "casey.gray@scubeenterprise.com", "", ownerTypeCode + " " + fee , "BODY");

        aa.env.setValue("CapModel", capId);
        aa.env.setValue("CAP_MODEL_INITED", "TRUE");

        }	
	catch (err) { aa.print("**ERROR : " + err); }
} 
               
/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function editAppSpecific4ACA(itemName, itemValue, cap) {

	var i = cap.getAppSpecificInfoGroups().iterator();
    while (i.hasNext()) {
        var group = i.next();
        var fields = group.getFields();
        if (fields != null) {
            var iteFields = fields.iterator();
            while (iteFields.hasNext()) {
                var field = iteFields.next();
                if ((useAppSpecificGroupName && itemName.equals(field.getCheckboxType() + "." + 
  
  field.getCheckboxDesc())) || itemName.equals(field.getCheckboxDesc())) {
  
                    field.setChecklistComment(itemValue);
  
                }
            }
        }
    }
}
function getParent() 
	{
	// returns the capId object of the parent.  Assumes only one parent!
	//
	getCapResult = aa.cap.getProjectParents(capId,1);
	if (getCapResult.getSuccess())
		{
		parentArray = getCapResult.getOutput();
		if (parentArray.length)
			return parentArray[0].getCapID();
		else
			{
			//logDebug( "**WARNING: GetParent found no project parent for this application");
			return false;
			}
		}
	else
		{ 
		//logDebug( "**WARNING: getting project parents:  " + getCapResult.getErrorMessage());
		return false;
		}
	}
  