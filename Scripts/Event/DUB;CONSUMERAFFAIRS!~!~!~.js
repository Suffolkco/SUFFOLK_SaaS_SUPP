if (String(aa.env.getValue("showDebug")).length > 0) {
    showDebug = aa.env.getValue("showDebug").substring(0, 1).toUpperCase().equals("Y");
}
// override showdebug
showDebug = true;
showMessage = true;

var itemCapType = aa.cap.getCap(capId).getOutput().getCapType().toString();
// If record type is WWM and it's a backoffice user, we do not want to update the status

//documentModelArray 
//var documentModel = documentModelArray.split(",");
// var cap = aa.env.getValue("CapModel");

var docNamesArray = aa.document.getDocumentListByEntity(capId, "CAP").getOutput().toArray();

for (d in docNamesArray)
{
var documentName = docNamesArray[d];
logDebug(documentName);

}


/*
var capDocList = aa.document.getCapDocumentList(capId);
if (capDocList.getSuccess()) 
{
    logDebug ("size: " + capDocList.getOutput().size());

}*/
/*
var docList = aa.document.getDocumentListByEntity(capId, "CAP");
if (docList.getSuccess()) 
{
    docsOut = docList.getOutput();
    logDebug("Docs Out " + docsOut.isEmpty());
    if (docsOut.isEmpty()) 
    {
        logDebug("empty");        
    }
    else 
    {
            docsOuti = docsOut.iterator();
            while (docsOuti.hasNext()) 
			{
                doc = docsOuti.next();
				//debugObject(doc);
                docName = doc.getDocName();
                logDebug("docName is: " + docName);

                if (docName.equals("*")) 
				{
                    fileName = doc.getFileName();
                    logDebug("fileName is: " + fileName);
                    doc.setDocName(fileName);
                    logDebug("docName set to: " + doc.getDocName());
                }
            }
            
        
    }
}
else 
{
    logDebug("fail");
}

*/

/*
var capDocResult = aa.document.getDocumentListByEntity(capId, "CAP");
    if (capDocResult.getSuccess())
    {       
        logDebug("*** count *** " + capDocResult.getOutput().size());

        for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
        {
            var documentObject = capDocResult.getOutput().get(docInx);
           
           
            emailText = publicUser + "\n" + documentObject.getDocumentNo() + "\n" + documentObject.getDocName() + "\n" + documentObject.getFileName()+ "\n";

            if (documentObject.getDocName() == "*")
            {
                logDebug("*** documentNo *****" + documentObject.getDocumentNo());
                logDebug("docName:" + documentObject.getDocName());
                logDebug("fileName:" + documentObject.getFileName());
                documentObject.setDocName(documentObject.getFileName());
                logDebug("Setting docName to filename:" + documentObject.getFileName());
                logDebug("Getting docName:" + documentObject.getDocumentNo() + ":" + documentObject.getDocName());
                emailText = emailText + documentObject.getDocName();
            }
        }
    }

aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "DUB script", emailText);
*/
/*
if (!publicUser)
{   
    var capDocResult = aa.document.getDocumentListByEntity(capId, "CAP");
    if (capDocResult.getSuccess())
    {       
        if (capDocResult.getOutput().size() > 0)
        {
            for (docInx = 0; docInx < capDocResult.getOutput().size(); docInx++)
            {
                var documentObject = capDocResult.getOutput().get(docInx);
                var fileName = documentObject.getFileName();
                var docName = documentObject.getDocName();
               
                if (docName == "*")
                {
                    documentObject.setDocName(fileName);
                    emailText = emailText + ". Setting Doc name to: " + fileName;
                    emailText = emailText + "Set to: " + documentObject.getDocName();

                    logDebug("thisDocument.getDocName():" + documentObject.getFileName());
                    logDebug("thisDocument.getDocName():" + documentObject.getDocName());
                }
            }
        }
       
    } 
    
}
*/
/*
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
        emailText = emailText + ";" + showDebug + ";" + fileName;
        // thisDocument.getDocDescription()
        // thisDocument.getDocName()
        // thisDocument.getFileName()
        // thisDocument.setDocName()
    }
}

aa.sendMail("noreplyehimslower@suffolkcountyny.gov", "ada.chan@suffolkcountyny.gov", "", "DUA script", emailText);
*/

function debugObject(object) {
    var output = ''; 
    for (property in object) { 
      output += "<font color=red>" + property + "</font>" + ': ' + "<bold>" + object[property] + "</bold>" +'; ' + "<BR>"; 
    } 
    logDebug(output);
} 
