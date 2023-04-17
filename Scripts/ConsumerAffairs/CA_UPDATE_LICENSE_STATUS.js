// Get license Number
var licenseNumber = getAppSpecific("License Number", capId);

if (!matches(licenseNumber, null, ""))
{
    appId = getApplication(licenseNumber);
    if (appId) {
        licStatus = getAppStatus(appId);

        licList = lookup("DCA Filtered License Status", licStatus);

        // If it's in the shared drop down, reuse
        if (licList && licList != "")
        {
            editAppSpecific("License Status", licStatus, capId);
        }
        else
        {
            switch (licStatus) {
                case "Active":
                case "License Active":
                case "Pending Renewal":
                    licStatus = 'Licensed';
                    break;
                case "License Suspended":
                    licStatus = 'Suspended';
                    break;
                default:
                    licStatus = "Unlicensed";
                break;
            }
            editAppSpecific("License Status", licStatus, capId);
        }


        // Copy License Expiration Date
        var expDate = getAppSpecific("Expiration Date", appId);

        if (expDate && expDate != "")
        {
            //Updating Expiration Date of License	
            logDebug("Current ASI Expdate is: " + expDate);
            
            /*var today = new Date();
            logDebug("today's date is " + today);
            var nullExpDate = (today.getMonth() + 1) + "/" + 1 + "/" + (today.getFullYear() + 2);

            var newExpDate = formatDate(nullExpDate);*/

            logDebug("Docket license expiration date ASI set to " + expDate);	

            editAppSpecific("License Expiration Date", expDate, capId);
        }
    }

}

