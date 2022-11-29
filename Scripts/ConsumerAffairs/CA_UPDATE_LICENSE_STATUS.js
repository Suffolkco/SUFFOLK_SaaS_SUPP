// Get license Number
var licenseNumber = getAppSpecific("License Number", capId);

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
}