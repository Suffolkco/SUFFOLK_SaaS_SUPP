//ASA;CONSUMERAFFAIRS!WEIGHTS AND MEAUSRES!WAIVERS!NA//
var showDebug = true;

// Remove existing ones in case users click back ACA
voidRemoveFees("WM_12");
voidRemoveFees("WM_RA");

updateFee("WM_12", "CAPOS_WT_MRS", "FINAL", 1, "Y");	
updateFee("WM_RA", "CAPOS_WT_MRS", "FINAL", 25, "Y");		


if (publicUser)
{
    var docComments = "";

	var docCheck0 = determineACADocumentAttached("dba Certificate");    
    var docCheck1 = determineACADocumentAttached("New York State filing receipt");    
    

    if(!determineACADocumentAttached("dba Certificate"))
    {       
		docComments += "dba Certificate" + "<br>";
	}
    if(!determineACADocumentAttached("New York State filing receipt"))
    {       
		docComments += "New York State filing receipt" + "<br>";
	}   
    
}

if (docComments != "") 
{
    cancel = true;
    showMessage = true;
    comment("This application requires you to submit the following documents: <br>" + docComments);
}


function determineACADocumentAttached(docType) 
{
    var docList = aa.document.getDocumentListByEntity(capId, "TMP_CAP");
    if (docList.getSuccess()) 
	{
        docsOut = docList.getOutput();
		logDebug("Docs Out " + docsOut.isEmpty());
        if (docsOut.isEmpty()) 
		{
            logDebug("here");
            return false;
        }
        else 
		{
            attach = false;
            docsOuti = docsOut.iterator();
            while (docsOuti.hasNext()) 
			{
                doc = docsOuti.next();
				//debugObject(doc);
                docCat = doc.getDocCategory();
                if (docCat.equals(docType)) 
				{
                    attach = true;
                }
            }
            if (attach) 
			{
                return true;
            }
            else 
			{
                return false;
            }
        }
    }
    else 
	{
        return false;
    }
}

