using ClosedXML.Excel;
using log4net;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Net;
using System.Security;
using System.Text.Json;
using System.Threading.Tasks;
using Path = System.IO.Path;

namespace SIPSync
{
    internal class Program
    {
        private static readonly ILog logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private static AAHelper objAA = new AAHelper();
        private static int goodRows = 0;
        private static List<string> badRows;

        static async Task Main(string[] args)
        {          
            // Check for the parameter to encrypt a password
            if (args.Length == 1)
            {
                
                string[] param = args[0].Split('=');               
                string option = param[0];

                if(option== "encryptpass")
                {
                    SecureString pass = new NetworkCredential("", param[1]).SecurePassword;
                                                                                               
                    string passHash = objAA.Encrypt(pass);                    

                    Console.WriteLine($"Your encrypted password is: {passHash}");
                    Console.WriteLine("Press Enter to close this window.");
                    Console.ReadLine();

                    pass.Dispose();
                }
                else
                {
                    Console.WriteLine("Command argument not recognized.");
                    Console.WriteLine();
                    Console.WriteLine("If you are trying to create an encrypted password, ");
                    Console.WriteLine(@"pass the value ""encryptpass=<password to encrypt>"" without the quotes.");
                    Console.WriteLine();
                    Console.WriteLine("This will return an encrypted value you can use in the app.config file for the password.");
                    Console.WriteLine();
                    Console.WriteLine("Press Enter to close this window and try again.");
                    Console.ReadLine();
                }                                
            }
            else
            {
                try
                {
                    await ProcessTasks();
                    ArchiveFiles("*.xlsx");
                }
                catch (Exception ex)
                {
                    logger.Error($"An error occurred in the main process: {ex.Message}");
                }
            }            
        }

        //===================================================
        // Main task for processing files
        //===================================================
        private static async Task ProcessTasks()
        {
            try
            {
                string folder = ConfigurationManager.AppSettings["ExportPath"];
                string configFilePath = ConfigurationManager.AppSettings["MappingFilePath"];
                string lookupColumn = ConfigurationManager.AppSettings["LookupColumn"];
                string customFieldGroupId = ConfigurationManager.AppSettings["CustomFieldGroupId"];
                string customFieldLookupField = String.Empty;
                Dictionary<string, string> countyColumnMappings = ReadColumnMappings(configFilePath, "County");
                Dictionary<string, string> stateColumnMappings = ReadColumnMappings(configFilePath, "State");

                string reportEmail = ConfigurationManager.AppSettings["ReportToEmail"];
                string sendReport = ConfigurationManager.AppSettings["SendReportEmail"];
                
                if (countyColumnMappings == null || stateColumnMappings == null)
                {
                    logger.Error("Column mappings could not be loaded.");
                    return;
                }

                foreach (string fileName in Directory.GetFiles(folder, "*.xlsx"))
                {
                    
                    int totalRows =0;
                    goodRows = 0;
                    badRows = new List<string>();

                    try
                    {

                        logger.Info($"Processing {fileName}");

                        using (var workbook = new XLWorkbook(fileName))
                        {
                            var worksheet = workbook.Worksheet(1);
                            int lastRow = worksheet.LastRowUsed().RowNumber();

                            logger.Info($"There are {lastRow} rows to process");

                            for (int row = 5; row <= lastRow; row++)
                            {
                                try
                                {
                                    string colB = worksheet.Cell(row, GetColumnIndex("ColumnB")).Value.ToString();
                                    string colC = worksheet.Cell(row, GetColumnIndex("ColumnC")).Value.ToString();
                                    string colD = worksheet.Cell(row, GetColumnIndex("ColumnD")).Value.ToString();

                                    Dictionary<string, string> fieldMapping = null;
                                    string grantType = null;

                                    if (colB == "406" && colC == "6422" && colD == "4772")
                                    {
                                        customFieldLookupField = ConfigurationManager.AppSettings["CountyLookupCustomField"];
                                        fieldMapping = countyColumnMappings;
                                        grantType = "SIP";
                                    }
                                    else if (colB == "362" && colC == "8110" && colD == "4772")
                                    {
                                        customFieldLookupField = ConfigurationManager.AppSettings["CountyLookupCustomField"];
                                        fieldMapping = countyColumnMappings;
                                        grantType = "ARPA";
                                    }
                                    else if (colB == "003" && colC == "4455" && colD == "4772")
                                    {
                                        customFieldLookupField = ConfigurationManager.AppSettings["StateLookupCustomField"];
                                        fieldMapping = stateColumnMappings;
                                    }

                                    if (fieldMapping != null)
                                    {
                                        totalRows++;
                                        await ProcessRow(worksheet, row, fieldMapping, lookupColumn, customFieldLookupField, customFieldGroupId, grantType);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    logger.Error($"Error processing row {row} in file {Path.GetFileName(fileName)}: {ex.Message}");
                                }
                            }
                        }

                        // Send the report if the settings are on
                        if (sendReport.ToUpper() == "YES")
                        {
                            string reportBody = BuildEmailBody(goodRows, totalRows, badRows, Path.GetFileName(fileName));

                            // Send report out with the results
                            await objAA.SendEmail(reportEmail,reportBody);
                        }
                                                
                        logger.Info($"Processing complete for {fileName}");
                    }
                    catch (Exception ex)
                    {
                        logger.Error($"Error processing file {fileName}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("Error in ProcessTasks: " + ex.Message);
            }
        }

        //===================================================
        // Method for processing a row
        //===================================================
        private static async Task ProcessRow(IXLWorksheet worksheet, int row, Dictionary<string, string> fieldMapping, string lookupColumn, string customFieldLookupField, string customFieldGroupId, string grantType = "")
        {
            string voucherNum = null;

            try
            {

                Dictionary<string, string> newVals = new Dictionary<string, string>();
                foreach (var mapping in fieldMapping)
                {
                    string columnIndex = GetColumnIndex(mapping.Key).ToString();
                    newVals.Add(mapping.Value, worksheet.Cell(row, int.Parse(columnIndex)).Value.ToString());
                }

                if (!string.IsNullOrEmpty(grantType)) 
                {
                    newVals.Add("County Grant Type", grantType); 
                }                

                string columnValues = worksheet.Cell(row, GetColumnIndex(lookupColumn)).Value.ToString();
                string[] fields = columnValues.Split(',');

                if (fields.Length > 2)
                {
                    voucherNum = fields[2];
                    if (!String.IsNullOrEmpty(voucherNum))
                    {
                        string capId = await objAA.GetCAPFromCustomField(customFieldLookupField, voucherNum);
                        if (!String.IsNullOrEmpty(capId))
                        {
                            await objAA.UpdateCustomFields(capId, customFieldGroupId, newVals);
                            await objAA.UpdateWorkflowStatus(capId, "Payment Processing", "Complete");
                        }
                    }
                }
                goodRows++;
            }
            catch (Exception ex)
            {
                logger.Error($"Error processing row {row}: {ex.Message}");

                badRows.Add(voucherNum);
            }
        }

        //*************************************************************
        // Method for changing the column names to an index
        //*************************************************************
        private static Dictionary<string, string> TranslateColumnNamesToIndex(Dictionary<string, string> fields)
        {

            Dictionary<string, string> indexedFields = new Dictionary<string, string>();

            foreach (var item in fields)
            {
                string idxNbr = GetColumnIndex(item.Key).ToString();

                indexedFields.Add(idxNbr, item.Value);                
            }

            return indexedFields;

        }

        //*************************************************************
        // Method for archiving old files
        //*************************************************************
        private static void ArchiveFiles(string fileMask = "*.*")
        {
            try
            {
                string exportPath = ConfigurationManager.AppSettings["ExportPath"];
                string archivePath = ConfigurationManager.AppSettings["ArchivePath"];
                string autoArchive = ConfigurationManager.AppSettings["AutoArchive"];

                if (Directory.Exists(exportPath) && autoArchive.ToUpper() == "YES")
                {
                    foreach (string folder in Directory.GetDirectories(exportPath))
                    {
                        foreach (string fileName in Directory.GetFiles(folder, fileMask))
                        {
                            try
                            {
                                string archiveFile = archivePath + Path.GetFileName(fileName);
                                System.IO.File.Move(fileName, archiveFile);
                                logger.Info(Path.GetFileName(fileName) + " has been archived.");
                            }
                            catch (Exception ex)
                            {
                                logger.Error($"Error archiving file {fileName}: {ex.Message}");
                            }
                        }
                    }
                    logger.Info("Archiving of old files has completed.");
                }
                else
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(exportPath));
                }
            }
            catch (Exception ex)
            {
                logger.Error("Error in ArchiveFiles: " + ex.Message);
            }
        }

        //*************************************************************
        // Gets the column index in Excel
        //*************************************************************
        private static int GetColumnIndex(string columnName)
        {
            int index = 0;
            int factor = 1;

            if (!string.IsNullOrWhiteSpace(columnName))
            {
                // Convert the column name to uppercase for comparison
                string upperColumnName = columnName.Replace("Column", "").ToUpper();                

                // Iterate through each character in the column name from right to left
                for (int i = upperColumnName.Length - 1; i >= 0; i--)
                {
                    char c = upperColumnName[i];
                    if (c < 'A' || c > 'Z')
                    {
                        throw new ArgumentException("Invalid character in column name", nameof(upperColumnName));
                    }

                    index += (c - 'A' + 1) * factor;
                    factor *= 26;
                }                
            }

            return index;
        }

        //*************************************************************
        // Method to read the mapping file
        //*************************************************************
        private static Dictionary<string, string> ReadColumnMappings(string jsonFilePath, string mappingSetName)
        {
            try
            {
                // Read the JSON file
                string jsonString = File.ReadAllText(jsonFilePath);

                // Parse the JSON into a JsonDocument
                JsonDocument jsonDocument = JsonDocument.Parse(jsonString);
                JsonElement root = jsonDocument.RootElement;

                // Extract the specified mapping set
                if (root.TryGetProperty(mappingSetName, out JsonElement mappingSet))
                {
                    // Convert the mapping set to a Dictionary<string, string>
                    var mappingDictionary = new Dictionary<string, string>();
                    foreach (JsonProperty property in mappingSet.EnumerateObject())
                    {
                        mappingDictionary[property.Name] = property.Value.GetString();
                    }

                    return mappingDictionary;
                }
                else
                {
                    logger.Error($"Mapping set '{mappingSetName}' not found in the JSON file.");
                    return null;
                }
            }
            catch (Exception ex)
            {
                logger.Error($"Error reading config file: {ex.Message}");
                return null;
            }
        }

        //*************************************************************
        // Method to create the email body
        //*************************************************************
        private static string BuildEmailBody(int goodRecsCount,int totalRecs, List<String> badRecs, string fileName)
        {
            string body = String.Empty;
            int badCount = 0;

            if(badRecs != null)
            {
                badCount= badRecs.Count;
            }

            body += "<html><body>";
            body += "<b>File Processed:</b> " + fileName + "<br>";
            body += "<b>Records successfully processed:</b> " + goodRecsCount + "<br>";
            body += "<b>Failed Records:</b> " + badCount + "<br>";
            body += "<b>Total records processed:</b> " + totalRecs + "<br>";

            body += "<b>Failed Voucher Numbers: </b><br>";
            foreach (var item in badRecs)
            {
                body += "<div style = 'color:red'>";
                body += item;
                body += "</div>";
            }

            body += "</body></html>";

            return body;
        }
    }

}
