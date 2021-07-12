showDebug = true;
var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
// If record type is WWM and it's a backoffice user, we do not want to update the status

if (!publicUser)
{   
    var docsList = new Array();
    docsList = getDocumentList();	//Get all Documents on a Record
    var assignDocList = aa.util.newArrayList();
    for(var counter = 0; counter < docsList.length; counter++)
    {
        //logDebug("Looping through docList.  Iterator = " + counter+ "  this is the type " +  docsList[counter].getDocCategory());
        var thisDocument = docsList[counter];
        logDebug("thisDocument.getDocName():" + thisDocument.getDocName());
        logDebug("thisDocument.getFileName():" + thisDocument.getFileName());
        var fileName = thisDocument.getFileName()
        thisDocument.setDocName(fileName);
        // thisDocument.getDocDescription()
        // thisDocument.getDocName()
        // thisDocument.getFileName()
        // thisDocument.setDocName()
    }
}