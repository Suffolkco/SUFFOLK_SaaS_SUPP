// Enter your script here...
//showDebug = true;
//default upload the status of Doc to System Generated for all docs in category DEQ_SIP_GRANTREPORTS
//EHIMS2-255
try{
		 var documentModelArray = aa.env.getValue("DocumentModelList");
				var docModel = documentModelArray.toArray();
				for (i in docModel) 
				  {
						if(docModel[i].getDocGroup()=="DEQ_SIP_GRANTREPORTS")
						{
									docModel[i].setDocStatus("System Generated");
									aa.document.updateDocument(docModel[i]);
						}
				  }
				  
  }
catch (ex)
  {
		logDebug("**ERROR** runtime error " + ex.message);
		
  }