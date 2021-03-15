// FOR OPC ONLY
var shortNotes = getShortNotes(capId);
logDebug("This is the value for project name: " + shortNotes);
logDebug("This is the value for Application Name: " + appName);
var appName = cap.getSpecialText();

if (publicUser)
{
    // In ACA, the project name field is empty.
    // We want to copy the application name to project name on ACA submittal.
    updateShortNotes(appName);
}
else
{
    //In AA, we want the project name to be copied to the Application name field.
    editAppName(shortNotes);
}
