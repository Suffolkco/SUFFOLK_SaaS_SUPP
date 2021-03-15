//CTRCA:DEQ/OPC/SWIMMING POOL/RENEWAL
var showdebug = false;

var emailParams = aa.util.newHashtable();
var reportFile = null;
var altID = capId.getCustomID();
var conArray = getContactArray();
var conEmail = "";
var emailAddress = "";
var shortNotes = getShortNotes(capId);

var appName = cap.getSpecialText();

updateShortNotes(appName);
addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
// Short Note is a project name.
addParameter(emailParams, "$$shortNotes$$", appName); 
addParameter(emailParams, "$$ALTID$$", altID);
addParameter(emailParams, "$$CAPAlias$$", cap.getCapType().getAlias());
addParameter(emailParams, "$$ACAURL$$", getACARecordURL()); 

var s_result = aa.address.getAddressByCapId(capId);
if(s_result.getSuccess())
{
 capAddresses = s_result.getOutput();
}
if (capAddresses != null)
{
    addParameter(emailParams, "$$address$$", capAddresses[0]);
}

for (con in conArray)
{
    if (!matches(conArray[con].email, null, undefined, ""))
    {
        conEmail += conArray[con].email + "; ";
    }
}
if (conEmail != null)
{
    //sending Notification
    sendNotification("noreplyehims@suffolkcountyny.gov", conEmail, "", "DEQ_OPC_APPLICATION_SUBMITTAL", emailParams, null);
}

var lpResult = aa.licenseScript.getLicenseProf(capId);
if (lpResult.getSuccess())
{ 
    var lpArr = lpResult.getOutput();  
} 

if(lpArr != null)
{
    for (var lp in lpArr)
    {
        if (!matches(lpArr[lp].getEmail(), null, undefined, ""))
        {
        emailAddress = lpArr[lp].getEmail();
        sendNotification("noreplyehims@suffolkcountyny.gov", emailAddress, "", "DEQ_OPC_APPLICATION_SUBMITTAL", emailParams, null);
        }
    }      
}	

if (!publicUser)
{ 
    var swimPools = loadASITable("SWIMMING POOL INFORMATION", capId);

    var feeEx = AInfo["Fee Exempt"];

    if (feeEx == "No" || feeEx == null)
    {
        //var swimPools = loadASITable("SWIMMING POOL INFORMATION");
        logDebug("swimPools.length= " +  swimPools.length);         
        if (swimPools.length >= 1)
        {
            var outSpaWade = 0;
            var outOther = 0;
            var indSpaWade = 0;
            var indOther = 0;
        
            //logDebug("Amount of swimming pools on this record are: " + swimPools.length);
            for (p in swimPools)
            {
                var loc = swimPools[p]["Location"];
                var type = swimPools[p]["Type of Pool"];
                var status = swimPools[p]["Status"];
                
                // Only if the swimming pool has an active status, we add fees                    
                if (status == "Active")
                {
                    if (loc == "Outdoor")
                    {        
                        logDebug("Outdoor Pool Type is : " +  type);          
                        if (matches(type, "Spa", "Wading Pool"))
                        {
            
                            outSpaWade++
                        }
                        else
                        {
                            outOther++
                        }
                    }
                    else if (loc == "Indoor")
                    {
                        logDebug("Indoor Pool Type is : " +  type);        
                        if (matches(type, "Spa", "Wading Pool"))
                        {
                            indSpaWade++
                        }
                        else
                        {
                            indOther++
                        }
                    }
                    else
                    {
                        logDebug("the loc is : " +  loc);     
                        //logDebug("This shoud not happen");
                    }
                }
            }

            if (indSpaWade > 0 || indOther > 0)
            {
                if (indSpaWade > 0)	
                {
                    logDebug("There are " + parseInt(indSpaWade) + " Indoor Spa or Wading Pools");           
                    updateFee("SP-BI-01", "DEQ_POOLAPP", "FINAL", parseInt(indSpaWade), "Y");
                }
                
                if (indOther > 0)
                {
                    logDebug("There are " + parseInt(indOther) + " Indoor Other than Spa or Wading Pools");
                    updateFee("SP-BI-02","DEQ_POOLAPP","FINAL",parseInt(indOther), "Y");
                }
            }
            if (outSpaWade > 0 || outOther > 0)
            {
                if (outSpaWade > 0)	
                {
                    logDebug("There are " + parseInt(outSpaWade) + " Outdoor Spa or Wading Pools");
                    updateFee("SP-BI-03","DEQ_POOLAPP","FINAL",parseInt(outSpaWade), "Y");
                }
                if (outOther > 0)
                {
                    logDebug("There are " + parseInt(outOther) + " Outdoor Other than Spa or Wading Pools");
                    updateFee("SP-BI-04","DEQ_POOLAPP","FINAL",parseInt(outOther), "Y");
                }        
            }
        }         
    }
}

function getACARecordURL() {

	itemCap = (arguments.length == 2) ? arguments[1] : capId;		
	var enableCustomWrapper = lookup("ACA_CONFIGS","ENABLE_CUSTOMIZATION_PER_PAGE");
	var acaRecordUrl = "";
	var id1 = itemCap.ID1;
	var id2 = itemCap.ID2;
	var id3 = itemCap.ID3;
	// MODIFY THIS It's in PROD!!!
	acaUrl = "https://aca.suffolkcountyny.gov/CitizenAccess/Cap/CapDetail.aspx?"
	var itemCapModel = aa.cap.getCap(capId).getOutput().getCapModel();
	acaRecordUrl = acaUrl + "/urlrouting.ashx?type=1000";   
	acaRecordUrl += "&Module=" + itemCapModel.getModuleName();
	acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();
	if(matches(enableCustomWrapper,"Yes","YES")){
			 acaRecordUrl += "&FromACA=Y";
			logDebug("ACA record Url is:" + acaRecordUrl); 
			return acaRecordUrl;
		}
} 
