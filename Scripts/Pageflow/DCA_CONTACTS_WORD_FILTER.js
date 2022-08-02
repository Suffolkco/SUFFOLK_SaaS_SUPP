/*------------------------------------------------------------------------------------------------------/
| Program : DCA_CONTACTS_WORD_FILTER
| 
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

    var contactsSearch = cap.getContactsGroup();
    if (contactsSearch.size() > 0)
    {
        var contactsArray = contactsSearch.toArray();
        logDebug("Contacts Search = " + contactsArray);
        for (po in contactsArray)
        {
            logDebug("contact is " + contactsArray[po].getContactType());

            if (contactsArray[po].getContactType() == "Complainant" ||
                contactsArray[po].getContactType() == "Vendor")
            {
                logDebug("First Name is " + contactsArray[po].getFirstName());
                validFirst = checkWordFilter(contactsArray[po].getFirstName());           
                validLast = checkWordFilter(contactsArray[po].getLastName());     
                validBusiness = checkWordFilter(contactsArray[po].getBusinessName());     

                if (validFirst || validLast || validBusiness)
                {
                    cancel = true;
                    showMessage = true;
                }
                if (validFirst)
                {              
                    comment("Bad word entered in First Name. Please reenter using responsible language.");
                }
                if (validLast)
                {               
                    comment("Bad word entered in Last Name. Please reenter using responsible language.");
                }            
                if (validBusiness)
                {              
                    comment("Bad word entered in Business Name. Please reenter using responsible language.");
                }                  

            }
        }
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

function checkWordFilter(text)
{
    var wordList = lookup("ACA_WORD_FILTER","RESTRICTED_WORD_LIST").split(',');
    
    var badWord = false;
    
    for (wL in wordList){
        word = wordList[wL].toUpperCase();

        if (text.toUpperCase().indexOf(word) > -1){          
            badWord = true;
        }
     
    }
    return badWord;
}

