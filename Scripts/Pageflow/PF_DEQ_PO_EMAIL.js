/*------------------------------------------------------------------------------------------------------/
| Program : PF_DEQ_PO_EMAIL
| Event   : ACA_BEFORE Event
|
|
| 
| Author:JGreene
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
var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var AInfo = new Array();
loadAppSpecific4ACA(AInfo);
try
{
    var validation = false;

    var propOwnerSearch = cap.getContactsGroup();
    if (propOwnerSearch.size() > 0)
    {
        var propOwnerArray = propOwnerSearch.toArray();
        logDebug("Prop Owner Search = " + propOwnerArray);
        for (po in propOwnerArray)
        {
            logDebug("contact is " + propOwnerArray[po].getContactType());

        if (propOwnerArray[po].getContactType() == "Property Owner")
        {
            logDebug("First Name is " + propOwnerArray[po].getFirstName());
            logDebug("Email is " + propOwnerArray[po].getEmail());
            if (matches(propOwnerArray[po].getEmail(), null, "", undefined))
            {
                cancel = true;
                showMessage = true;
                comment("An email address is required for the Property Owner");
            }
        }
        }
    }

	var parcelObj = cap.getParcelModel();
	if (!parcelObj)
	{ logDebug("No parcel to get attributes"); 
	}
	else
	{
		var parcelNo = parcelObj.getParcelNumber();
		if (parcelNo != null)
		{
			var parcelTxt = new String(parcelNo);
			noSpaceParcelNo = parcelTxt.replace(/\s/g, '');				
			var length = noSpaceParcelNo.length;
			if (length != 19)        
			{            
				cancel = true;
				showMessage = true;
				comment("You have entered the wrong Parcel (Tax Map) Number.");
				comment ("Parcel (Tax Map) Number must be 19 digits; you entered " + length + " digits.");
				comment ("Please see instructional note in Parcel Section.");
			}				
		}
	}

    // Require LP
var lpList = cap.getLicenseProfessionalList();
var correctType = false;

if (lpList != null)
{
    for (i = 0; i < lpList.size(); i++)
    {
        logDebug("license type is: " + lpList.get(i).getLicenseType());
        if (lpList.get(i).getLicenseType() == "WWM Liquid Waste")
        {
            correctType = true;
                break;
        }
    }
}

if (correctType == false)
{
    cancel = true;
    showMessage = true;
    comment("The Licensed Professional indicated is not permitted, OR, no license was selected. The Licensed Professional section cannot be changed here and you must begin a new application (click 'Create an Application'). When selecting a license, the license type chosen must be 'WWM Liquid Waste'.");
}


	
}
catch (error)
{
    logDebug("an error was encoutered: " + error.message);
    showDebug = true;
    showMessage = true;
}

if (debug.indexOf("**ERROR") > 0 || debug.substr(0, 7) == "**ERROR")
{
    aa.env.setValue("ErrorCode", "1");
    aa.env.setValue("ErrorMessage", debug);
} else
{
    if (cancel)
    {
        aa.env.setValue("ErrorCode", "-2");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    } else
    {
        aa.env.setValue("ErrorCode", "0");
        if (showMessage) aa.env.setValue("ErrorMessage", message);
        if (showDebug) aa.env.setValue("ErrorMessage", debug);
    }
}


//ACA Functions 
function getScriptText(vScriptName, servProvCode, useProductScripts)
{
    if (!servProvCode) servProvCode = aa.getServiceProviderCode();
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    try
    {
        if (useProductScripts)
        {
            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
        } else
        {
            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
        }
        return emseScript.getScriptText() + "";
    } catch (err)
    {
        return "";
    }
}
