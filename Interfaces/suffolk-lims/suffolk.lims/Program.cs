using Microsoft.VisualBasic.FileIO;
using System;
using System.Collections.Generic;
using System.Net.Mail;
using System.Configuration;
using System.IO;
using log4net;

namespace suffolk.lims
{

    class Program {

        static ILog Logger;
        static void Main() {
            log4net.Config.XmlConfigurator.Configure();
            Logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
            Utility.LogInfo("Starting Up Running this file " + DateTime.Now.ToLocalTime());            
            string srcpath = Config.InputPath;
            string destpath = Config.OutputPath;
            string badfile = destpath + DateTime.Now.ToString("MMddyyyyHHmmss") + ".txt";
            List<string[]> table;
            Dictionary<string, bool> dataProcessedInEDT = new Dictionary<string, bool>();
            var moreThanFifty = false;
            int setCount = 0;
            int rowLimit = 50; // As per Josh, the 50 row check idoes 50 at a time then resets, it was that json magic becky said
            DirectoryInfo src = new DirectoryInfo(srcpath);
            foreach (FileInfo f in src.GetFiles()) {
                if (f.Extension.ToLower() == ".csv") {
                    Utility.LogInfo("Processing " + f.FullName);
                    table = GetDataTabletFromCSVFile(f.FullName, destpath + f.Name + ".bad");
                    Logger.Info("Processed " + f.FullName);
                    File.Move(f.FullName, Path.Combine(destpath, f.Name));
                    Utility.LogInfo("File moved to " + destpath);

                    if (table.Count > 0) {
                        string key = table[0][0];                       
                        string previousKey = key;
                        string dataName = "";
                        List<string[]> rowSet = new List<string[]>();
                        // special data includes Herbmet or Perflorinated compounds PFAS
                        List<string[]> specialData = new List<string[]>();
                        string[] headerRow = null;
                        int count = 0;
                        bool alreadyPosted = isDuplicate(key);
                       
                        bool processingError = false;                      
                        foreach (string[] x in table) {
                            key = x[0];                         
                            if (key == "FieldNumber") {
                                headerRow = x;
                                continue;
                            }
                            dataName = x[3];                           
                            if (x[3] == "$HERBMET" || x[3]== "PERFLUORINATED COMPOUNDS") {                                
                                if (x[1] == "-0-") {
                                    
                                    // herbmet or PFAS incomplete data - do not process
                                    Utility.LogInfo("Incomplete " + dataName + " line, skipping  " + String.Join(",", x));
                                    continue;
                                }
                                else {
                                    // hermet or PFAS completed data - transfer to holding array for processing later.
                                    specialData.Add(x);
                                    continue;
                                }
                            }
                         
                            // Keep adding data to the rowset
                            if (key == previousKey) {
                                rowSet.Add(x);
                            }
                            else { // The key is different than previous key. It means we can process the existing rowset.
                                Logger.Debug("Processing " + previousKey);                                                               
                                alreadyPosted = isDuplicate(previousKey);
                                
                                Logger.Debug("Is duplicate? " + alreadyPosted);
                                Logger.Debug("row set count is: " + rowSet.Count);
                                Logger.Debug("previous key: " + previousKey + ", key: " + key);
                                Logger.Debug("setCount: " + setCount + ", count: " + count);

                                // This logic is to handle situation when the field data has exactly a multiple of 50.                                
                                // Scenario is if the data ends at a multiple of 50 of the same field number. At 151, it detects a different key.
                                // The duplicate check found that it's a duplicate key since we do process data for every 50. To overcome this,
                                // we need to add this logic to process the remaining data for example: 101 to 150 that still needs to be go on.                              
                                bool alreadyInSystem;
                                dataProcessedInEDT.TryGetValue(previousKey, out alreadyInSystem);
                                Logger.Debug(previousKey + " more than 50 counts and already in system? " + alreadyInSystem);
                                if (moreThanFifty && !alreadyInSystem && count % rowLimit == 0 && rowSet.Count > 0)
                                {                                                   
                                    processingError = !processInterface(headerRow, rowSet);
                                    if (!processingError)
                                    {
                                        completeKeyProcess(previousKey);
                                    }
                                }
                                else if (moreThanFifty && !alreadyInSystem && rowSet.Count > 0)
                                {
                                    Logger.Debug("Processing the remaining " + rowSet.Count + " for " + previousKey);

                                   processingError = !processInterface(headerRow, rowSet);
                                    if (!processingError)
                                    {
                                        completeKeyProcess(previousKey);
                                    }
                                }
                                else if (!alreadyPosted &&!processingError) {
                                    if (rowSet.Count > 0)
                                    processingError = !processInterface(headerRow, rowSet);
                                    if (!processingError) {                      
                                        completeKeyProcess(previousKey);
                                    }                                    
                                }
                                // start a new set
                                rowSet.Clear();
                                rowSet.Add(x);
                                previousKey = key;                              
                                alreadyPosted = false; processingError = false;
                                moreThanFifty = false;
                                // This count 0 is to tell you it can start a new set. 
                                setCount = 0;                                
                            }                           
                            if (count > 0 && count % rowLimit == 0) { // It processes a batch up to 50. It then clear the rowset and continue the next.
                                Logger.Debug("Batch of : " + count);
                                moreThanFifty = true;
                                // Only the very first time
                                if (setCount == 0) {                                    
                                    alreadyPosted = isDuplicate(key);
                                    if (!dataProcessedInEDT.ContainsKey(key))
                                    {
                                        dataProcessedInEDT.Add(key, alreadyPosted);
                                    }
                                }                              
                                if (!alreadyPosted && !processingError) {
                                    processingError = !processInterface(headerRow, rowSet);
                                   
                                }
                              
                                moreThanFifty = true;
                                rowSet.Clear();
                                setCount++;
                            }
                            count++;                           
                        } // end looping thru table, processes last bunch      
                        Logger.Debug("Key:" + key + ". setCount: " + setCount + ". rowSet.Count: " + rowSet.Count + ". already Posted: " + alreadyPosted + ". Count: " + count);
                        // Check for duplicate to avoid processing data
                        if (setCount == 0)
                        {
                            alreadyPosted = isDuplicate(key);
                        }
                        if (rowSet.Count > 0 && !alreadyPosted)
                        {
                            processingError = !processInterface(headerRow, rowSet);                            
                        }
                            if (!processingError) {           
                                completeKeyProcess(previousKey);                           
                        }
                      
                        if (specialData.Count > 0) {
                            processSpecialData(specialData, dataName);
                        }
                    }
                }
            }

           Utility.LogInfo("Complete " + DateTime.Now.ToLocalTime());
           emailInfo("LIMS Interface complete run at " + DateTime.Now.ToLocalTime());
        }

        private static void completeKeyProcess(string fNum) {
            var result = AccelaRestHandler.CompleteKeyProcess<string>(fNum);
            ProcessResult(result, "Complete processing");
        }
        private static Boolean processInterface(string[] header, List<string[]> rowList) {
            try {
                var result = AccelaRestHandler.ProcessDataList<string>(header, rowList);
                ProcessResult(result, "Process data");
                return result.Success;
            }
            catch (Exception e) {
                Logger.ErrorFormat("Exception processing data: {0}", e.Message);
            }
            return false;
        }

        private static void processSpecialData(List<string[]> table, String dataName) {
            Logger.Debug("Processing completed " + dataName + " data");
            string key = table[0][0];
            string previousKey = key;
            List<string[]> rowSet = new List<string[]>();
            int count = 0;
            int setCount = 0;
            int rowLimit = 50;
            string[] headerRow = null;
            bool processingError = false;
            foreach (string[] x in table) {
                key = x[0];             
                if (key == previousKey) {
                    rowSet.Add(x);
                }
                else {
                    Logger.Debug("Processing " + dataName + " data for " + previousKey);
                    if  (!processingError) {
                        processingError = !processInterface(headerRow, rowSet);
                        if (!processingError) {
                            completeKeyProcess(previousKey);
                        }
                    }
                    // start a new set
                    rowSet.Clear();
                    rowSet.Add(x);
                    previousKey = key; processingError = false;
                    setCount = 0;
                }
                if (count > 0 && count % rowLimit == 0) {                  
                    if (!processingError) {
                        processingError = !processInterface(headerRow, rowSet);
                    }
                    rowSet.Clear();
                    setCount++;
                }
                count++;
            } // end looping thru table, processes last bunch
            if (rowSet.Count > 0) {
                processingError = !processInterface(headerRow, rowSet);
                if (!processingError) {
                    completeKeyProcess(previousKey);
                }
            }
        }

        private static Boolean isDuplicate(string fNum) {
            var result = AccelaRestHandler.isDuplicateFieldNum<string>(fNum);
      //      Logger.Info("Rest Result :" + result.Message);
            ProcessResult(result, "Determine duplicate");
            if (result.Message == "DUPLICATEFOUND")
                return true;
            else return false;
        }

        private static List<string[]> GetDataTabletFromCSVFile(string csv_file_path, string badfile) {
            List<string[]> table = new List<string[]>();

            try {

                using (TextFieldParser csvReader = new TextFieldParser(csv_file_path)) {
                    csvReader.SetDelimiters(new string[] { "," });
                    csvReader.HasFieldsEnclosedInQuotes = true;


                    string[] fieldData;
                    //bool valid = true;
                    while (!csvReader.EndOfData) {
                        try {
                            fieldData = csvReader.ReadFields();
                            // Test code to check data format *************************
                            /*
                            string[] formats = new string[] { "MM/dd/yyyy" };
                            foreach (string f in fieldData)
                            {                               
                                DateTime dv;
                                if (DateTime.TryParseExact(f, formats, System.Globalization.CultureInfo.CurrentCulture, System.Globalization.DateTimeStyles.None, out dv))
                                {
                                    //Console.WriteLine($"found date - { dv.ToLongDateString()}");
                                }
                                else
                                {
                                    //Console.WriteLine($"found something  - {f}");
                                    var errorMsg = $"Required MM/dd/yyyy format in the file. Found something  - {f}";
                                    Utility.LogError(errorMsg);
                                    Logger.Error(errorMsg);
                                    valid = false;
                                }
                            }
                            if (valid)  // Test code to check data format *************************
                            {*/
                                table.Add(fieldData);
                            //}
                        }
                        catch (MalformedLineException ex) {
                            if (ex.Message.Contains("cannot be parsed using the current Delimiters")) {
                                Utility.LogError(ex.Data.ToString());
                            }

                        }

                    }
                }
            }
            catch (Exception ex) {
                Logger.Error(ex.Message);
            }
            return table;
        }

        public static void ProcessResult<T>(EmseResultObject<T> result, string action) {
            if (!result.Success) {
                Utility.LogError($"{action} failed. {result.Message}");
            }

            if (result.Warnings != null && result.Warnings.Count > 0) {
                Utility.LogWarning($"{action} warning messages:{Environment.NewLine}{string.Join(Environment.NewLine, result.Warnings)}");
            }

            if (result.Info != null && result.Info.Count > 0) {
                Utility.LogInfo($"{action} info messages:{Environment.NewLine}{string.Join(Environment.NewLine, result.Info)}");
            }

            if (result.Errors != null && result.Errors.Count > 0) {
                Utility.LogError($"{action} error messages:{Environment.NewLine}{string.Join(Environment.NewLine, result.Errors)}");
            }
        }

        public static void emailInfo(string mess) {
            string SMTPHost = ConfigurationManager.AppSettings["SMTPHost"];
            string SMTPPort = ConfigurationManager.AppSettings["SMTPPort"];
            string SMTPUser = ConfigurationManager.AppSettings["SMTPUser"];
            string SMTPPass = ConfigurationManager.AppSettings["SMTPPass"];
            string toEmail = ConfigurationManager.AppSettings["ResultEmailAddress"];
            if (!String.IsNullOrEmpty(SMTPHost) && !String.IsNullOrEmpty(toEmail)) {
                Utility.LogInfo("Sending notification email");
                try
                {
                    SmtpClient smtpClient = new SmtpClient(SMTPHost);
                    // smtpClient.EnableSsl = true;
                    //  smtpClient.UseDefaultCredentials = false;
                    //  smtpClient.Credentials = new System.Net.NetworkCredential(Config.SMTPUser, Config.SMTPPass);
                    smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                    MailMessage mail = new MailMessage();
                    mail.From = new MailAddress("SuffolkLIMSLinterfaceDoNotReply@suffolkcountyny.gov", "FTL");
                    string[] addresses = toEmail.Split(';');
                    foreach (string addr in addresses)
                        mail.To.Add(new MailAddress(addr));
                    mail.Subject = "Email from LIMS Interface";
                    mail.Body = mess;
                    smtpClient.Send(mail);
                }
                catch 
                {
                    Utility.LogInfo("Unable to send notification email");
                }
            }
        }


    }
}
