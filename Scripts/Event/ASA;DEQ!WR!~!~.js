//ASA;DEQ/WR/*/*

// EHIMS-5239

// Short Notes = Project Name in DEQ
var shortNotes = getShortNotes(capId);
logDebug("This is the value for project name: " + shortNotes);

//Application Name
var appName = cap.getSpecialText();
logDebug("This is the value for Application Name: " + appName);

var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
if(matches(itemCapType, "DEQ/WR/Water Modification/Application")) 
{
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
}