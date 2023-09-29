try 
{

                if((typeof (DEQSIPGRANTELIGIBILITY) == "object") &&  DEQSIPGRANTELIGIBILITY.length > 0)
	{
                     for (var vRowind in DEQSIPGRANTELIGIBILITY) 
		{
						var docRow = DEQSIPGRANTELIGIBILITY[vRowind];
						var docType = String(docRow["Document Type"]);
					  

						if (docType == ""  || docType == null) 
						{
							cancel = true;
							showMessage = true;
							comment("A row cannot be manually added to this table");
						}
        }
     }
               
                     if((typeof (DEQSIPGRANTPAYMENT) == "object") &&  DEQSIPGRANTPAYMENT.length > 0)
	{
                     for (var vRowind in DEQSIPGRANTPAYMENT) 
		{
						var docRow = DEQSIPGRANTPAYMENT[vRowind];
						var docType = String(docRow["Document Type"]);
					  

						if (docType == ""  || docType == null) 
						{
							cancel = true;
							showMessage = true;
							comment("A row cannot be manually added to this table");
						}
        }
     }   
	
} catch (err) {
    logDebug("A JavaScript Error occurred: ASIUB:Building/*/*/* : " + err.message);
}