/**  
* 	@param docType 
* 	used to halt progress of an ACA Pageflow by reviewing documents currently attached to it. 
*/
function determineACADocumentAttached(docType) {
	var docList = aa.document.getDocumentListByEntity(capId, "TMP_CAP");
	if (docList.getSuccess()) {
		docsOut = docList.getOutput();
		if (docsOut.isEmpty()) {
			return false;
		}
		else {
			attach = false;
			docsOuti = docsOut.iterator();
			while (docsOuti.hasNext()) {
				doc = docsOuti.next();
				docCat = doc.getDocCategory();
				logDebug("Document Category: " + docCat);
				if (docCat == (docType)) {
					attach = true;
				}
			}
			if (attach) {
				return true;
			}
			else {
				return false;
			}
		}
	}
	else {
		return false;
	}
}

