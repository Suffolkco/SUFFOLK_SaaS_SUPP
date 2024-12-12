using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SST.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace SST.Web.Services
{

    public class RecordService : IRecordService
    {
        private IConfiguration IConfig { get; }
        private ILogger<RecordService> Logger { get; }
        private HttpClient Client { get; }
        private string Token { get; set; }

        public RecordService(HttpClient httpClient, IConfiguration iConfiguration, ILogger<RecordService> logger)
        {
            Client = httpClient;
            IConfig = iConfiguration;
            Logger = logger;
        }

        public async Task<RecordsModel> SearchRecords(SearchRecordsModel search, PageModel page)
        {
            try
            {
                if (Token == null)
                {
                    Token = await GetToken();
                }
                return await HttpGetRecords(search, page);
            }
            catch (HttpRequestException e)
            {
                if (e.Message.Contains("401 (Unauthorized)"))
                {
                    try
                    {
                        Token = await GetToken();
                        return await HttpGetRecords(search, page);
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }
                else
                {
                    throw e;
                }
            }
        }


        private void Error(string source, Exception e)
        {
            Logger.LogError($"Error calling {source}. Message: {e.Message}");
        }

        public async Task<string> GetToken()
        {
            try
            {
                var requestToken = new HttpRequestMessage(HttpMethod.Post, IConfig.GetValue<string>("RestApi:TokenUrl"));

                var secrets = IConfig.GetValue<string>("DCASearch:Secrets").Split("|");
                var clientSecret = secrets[0];
                var password = secrets[1];

                var requestBody = new Dictionary<string, string>()
                {
                    { "client_id", IConfig.GetValue<string>("RestApi:clientId") },
                    { "client_secret", clientSecret },
                    { "grant_type", IConfig.GetValue<string>("RestApi:grantType") },
                    { "username", IConfig.GetValue<string>("RestApi:userName") },
                    { "password", password },
                    { "scope", IConfig.GetValue<string>("RestApi:scope") },
                    { "agency_name", IConfig.GetValue<string>("RestApi:agencyName") },
                    { "environment", IConfig.GetValue<string>("RestApi:environment") }
                };

                var sb = new StringBuilder();
                foreach (var keyValue in requestBody)
                {
                    if (sb.Length > 0)
                    {
                        sb.Append("&");
                    }
                    sb.Append(keyValue.Key);
                    sb.Append("=");
                    sb.Append(keyValue.Value);
                }

                requestToken.Content = new StringContent(sb.ToString(), Encoding.UTF8, IConfig.GetValue<string>("RestApi:ContentType"));

                HttpResponseMessage response = await Client.SendAsync(requestToken);
                response.EnsureSuccessStatusCode();
                var result = await response.Content.ReadFromJsonAsync<TokenModel>();

                return result.Access_Token;
            }
            catch (Exception e)
            {
                Error("GetToken", e);
                throw e;
            }
        }


        private async Task<RecordsModel> HttpGetRecords(SearchRecordsModel search, PageModel page)
        {
            switch (search.SearchType) 
            {
                case SearchType.WwmApplications:
                    return await HttpGetRecordsWwmApp(search, page);
                case SearchType.OpcApplications:
                    return await HttpGetRecordsOpcApp(search, page);
                case SearchType.OpcSites:
                    return await HttpGetRecordsOpcSite(search, page);
                default:
                    return null;
            }
        }


        private async Task<RecordsModel> HttpGetRecordsWwmApp(SearchRecordsModel search, PageModel page)
        {
            try
            {
                RecordsModel records = await HttpSearchRecords(search, page);
                if (records.Page != null && records.Page.Hasmore && search.FirstTime)
                {
                    records.Page.Total = await HttpSearchRecordsCount(search);
                }
                if (records.Result != null && records.Result.Length > 0)
                {
                    foreach (var record in records.Result)
                    {
                        BuildTaxMap(search, record);
                        await BuildWwmApplicationInfoAsync(record);
                    }

                    UpdatePagination(records);
                }
                return records;
            }
            catch(Exception e)
            {
                Error("HttpGetRecordsWwmApp", e);
                throw e;
            }
        }


        private async Task<RecordsModel> HttpGetRecordsOpcApp(SearchRecordsModel search, PageModel page)
        {
            try
            {
                RecordsModel records = await HttpSearchRecords(search, page);
                if (records.Page != null && records.Page.Hasmore && search.FirstTime)
                {
                    records.Page.Total = await HttpSearchRecordsCount(search);
                }
                if (records.Result != null && records.Result.Length > 0)
                {
                    foreach (var record in records.Result)
                    {
                        BuildTaxMap(search, record);
                        await BuildOpcApplicationInfoAsync(record);
                    }
                    UpdatePagination(records);                
                }
                return records;
            }
            catch (Exception e)
            {
                Error("HttpGetRecordsOpcApp", e);
                throw e;
            }
        }


        private async Task<RecordsModel> HttpGetRecordsOpcSite(SearchRecordsModel search, PageModel page)
        {
            try
            {
                RecordsModel sites = await HttpSearchRecords(search, page);
                if (sites.Page != null && sites.Page.Hasmore && search.FirstTime)
                {
                    sites.Page.Total = await HttpSearchRecordsCount(search);
                }

                if (sites.Result != null && sites.Result.Length > 0)
                {
                    foreach (var site in sites.Result)
                    {
                        BuildTaxMap(search, site);
                        BuildOpcSiteAsi(site);

                        if (site.Address != "NA" && site.Addresses != null && site.Addresses.Length > 0)
                        {
                            BuildPrimaryAddress(site);
                        }
                    }
                    UpdatePagination(sites);
                }
                return sites;
            }
            catch (Exception e)
            {
                Error("HttpGetRecordsOpcSite", e);
                throw e;
            }
        }


        private async Task<int> HttpSearchRecordsCount(SearchRecordsModel search)
        {
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, IConfig.GetValue<string>("RestApi:SearchUrl4"));

                request.Headers.Add("Authorization", Token);


                var json = JsonConvert.SerializeObject(search);

                request.Content = new StringContent(json);
                HttpResponseMessage response = await Client.SendAsync(request);

                response.EnsureSuccessStatusCode();

                var records = await response.Content.ReadFromJsonAsync<RecordsModel>();
                return records.Result.Length;

            }
            catch (Exception e)
            {
                Error("HttpSearchRecordsCount", e);
                throw e;

            }
        }


        private async Task<RecordsModel> HttpSearchRecords(SearchRecordsModel search, PageModel page)
        {
            try
            {
                var sb = new StringBuilder();

                if (search.SearchType == SearchType.WwmApplications)
                {
                    sb.Append(IConfig.GetValue<string>("RestApi:SearchUrl1"));
                    search.OpenedDate = IConfig.GetValue<string>("RestApi:WwmRecordOpenDate");
                }
                else
                {
                    sb.Append(IConfig.GetValue<string>("RestApi:SearchUrl2"));
                }

                sb.Append($"&limit={page.Limit}&offset={page.Offset}");

                var request = new HttpRequestMessage(HttpMethod.Post, sb.ToString());

                request.Headers.Add("Authorization", Token);


                var json = JsonConvert.SerializeObject(search);

                request.Content = new StringContent(json);
                HttpResponseMessage response = await Client.SendAsync(request);

                response.EnsureSuccessStatusCode();

                return await response.Content.ReadFromJsonAsync<RecordsModel>();
            }
            catch (Exception e)
            {
                Error("HttpSearchRecords", e);
                throw e;
            }

        }


        public async Task<WorkFlowHistoryModel> HttpGetWorkFlow(string id)
        {
            try
            {
                var sb = new StringBuilder();
                sb.Append(IConfig.GetValue<string>("RestApi:RecordUrl"));
                sb.Append(id);
                sb.Append(IConfig.GetValue<string>("RestApi:WorkflowPath"));

                var request = new HttpRequestMessage(HttpMethod.Get, sb.ToString());

                request.Headers.Add("Authorization", Token);
                HttpResponseMessage response = await Client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                var workFlowHistory = await response.Content.ReadFromJsonAsync<WorkFlowHistoryModel>();

                return workFlowHistory;
            }
            catch (Exception e)
            {
                Error("HttpGetWorkFlow", e);
                throw e;
            }
        }


        private void BuildTaxMap(SearchRecordsModel search, RecordModel record)
        {
            try
            {
                if (record.Parcels != null && record.Parcels.Length > 0)
                {
                    StringBuilder taxMaps = new StringBuilder();

                    if (search.Parcel.ParcelNumber.Trim().Length > 0 &&
                        record.Parcels.Length > 3 &&
                        search.Parcel.ParcelNumber != record.Parcels[0].ParcelNumber)
                    {
                        for (int k = 1; k < record.Parcels.Length; k++)
                        {
                            if (search.Parcel.ParcelNumber == record.Parcels[k].ParcelNumber)
                            {
                                var taxMap0 = record.Parcels[0].ParcelNumber;
                                record.Parcels[0].ParcelNumber = record.Parcels[k].ParcelNumber;
                                record.Parcels[k].ParcelNumber = taxMap0;
                                break;
                            }
                        }
                    }

                    // Build TaxMaps
                    for (int m = 0; m < record.Parcels.Length; m++)
                    {
                        if (taxMaps.Length > 0)
                        {
                            taxMaps.Append(", ");
                            taxMaps.Append(record.Parcels[m].ParcelNumber);
                        }
                        else
                        {
                            taxMaps.Append(record.Parcels[m].ParcelNumber);
                        }
                    }
                    record.ParcelNumber = taxMaps.ToString();


                    if (record.Parcels.Length > 3)
                    {
                        taxMaps.Clear();
                        for (int m = 0; m < 3; m++)
                        {
                            if (taxMaps.Length > 0)
                            {
                                taxMaps.Append(", ");
                                taxMaps.Append(record.Parcels[m].ParcelNumber);
                            }
                            else
                            {
                                taxMaps.Append(record.Parcels[m].ParcelNumber);
                            }
                        }
                        record.ParcelNumberShort = taxMaps.ToString();
                    }
                }
            }
            catch (Exception e)
            {
                Error("BuildTaxMap", e);
                throw e;
            }
        }


        private async Task BuildWwmApplicationInfoAsync(RecordModel record)
        {
            try
            {
                if (record.Status.Text == "Create STP Monitoring Record")
                {
                    record.Status.Text = "Approved";
                }

                record.OpenedDate = record.OpenedDate.Substring(0, 10);

                BuildHamletInfo(record);

                var workFlow = await HttpGetWorkFlow(record.Id);
                if (workFlow.Result != null)
                {
                    var previousWF = workFlow.Result[0];

                    for (int i = 0; i < workFlow.Result.Length; i++)
                    {
                        workFlow.Result[i].StatusDate = workFlow.Result[i].StatusDate.Substring(0, 10);

                        if (workFlow.Result[i].Status != null &&
                            workFlow.Result[i].Description == "Plans Coordination" &&
                            workFlow.Result[i].Status.Text == "Approved")
                        {
                            workFlow.Result[i].Description = "Preliminary Review";
                            workFlow.Result[i].Status.Text = "Approved for Construction";
                            record.PlansCoordinationApprovedDate = workFlow.Result[i].StatusDate;
                        }
                        else if (workFlow.Result[i].Status != null &&
                            workFlow.Result[i].Description == "Plans Coordination" &&
                            workFlow.Result[i].Status.Text == "Plan Revisions Needed")
                        {
                            workFlow.Result[i].Description = "Preliminary Review";
                            workFlow.Result[i].Status.Text = "Application Incomplete";
                        }
                        else if (workFlow.Result[i].Status != null &&
                            workFlow.Result[i].Description == "Final Review" &&
                            workFlow.Result[i].Status.Text == "Approved")
                        {
                            record.FinalReviewApprovedDate = workFlow.Result[i].StatusDate;
                        }
                        else if (workFlow.Result[i].Status != null &&
                            workFlow.Result[i].Description == "Final Review" &&
                            workFlow.Result[i].Status.Text == "Create STP Monitoring Record")
                        {
                            workFlow.Result[i].Status.Text = "Approved";
                            record.FinalReviewApprovedDate = workFlow.Result[i].StatusDate;
                        }

                        if (workFlow.Result[i].Description == "WWM Review" ||
                            workFlow.Result[i].Description == "WR Review" ||
                            workFlow.Result[i].Description == "OPC Review" ||
                            workFlow.Result[i].Status == null)
                        {
                            workFlow.Result[i].Description = "HIDE";
                        }
                        else if (i > 0 &&
                                    string.Equals(workFlow.Result[i].Description, previousWF.Description) &&
                                    string.Equals(workFlow.Result[i].StatusDate, previousWF.StatusDate) &&
                                    string.Equals(workFlow.Result[i].Status.Text, previousWF.Status.Text))
                        {
                            workFlow.Result[i].Description = "HIDE";
                        }
                        else if (i > 0)
                        {
                            previousWF = workFlow.Result[i];
                        }
                    }
                    Array.Sort(workFlow.Result, new WorkFlowComparer());
                }
                record.WorkFlowHistory = workFlow;
            }
            catch (Exception e)
            {
                Error("BuildWwmApplicationInfoAsync", e);
                throw e;
            }
        }


        private async Task BuildOpcApplicationInfoAsync(RecordModel record)
        {
            try
            {
                record.OpenedDate = record.OpenedDate.Substring(0, 10);

                if (record.Addresses != null && record.Addresses.Length > 0)
                {
                    BuildPrimaryAddress(record);
                }

                if (record.Type.Value == "DEQ/OPC/Site Assessment/Application")
                {
                    record.PlansCoordinationApprovedDate = "HIDE";
                }

                var workFlow = await HttpGetWorkFlow(record.Id);
                if (workFlow.Result != null && workFlow.Result.Length > 0)
                {
                    var previousWF = workFlow.Result[0];

                    for (int i = 0; i < workFlow.Result.Length; i++)
                    {
                        workFlow.Result[i].StatusDate = workFlow.Result[i].StatusDate.Substring(0, 10);

                        if (record.Type.Value != "DEQ/OPC/Site Assessment/Application" &&
                            workFlow.Result[i].Status != null &&
                            workFlow.Result[i].Description == "Final Review" &&
                            workFlow.Result[i].Status.Text == "Approved" &&
                            record.FinalReviewApprovedDate == "")
                        {
                            record.FinalReviewApprovedDate = workFlow.Result[i].StatusDate;
                        }
                        else if (record.Type.Value == "DEQ/OPC/Site Assessment/Application" &&
                            workFlow.Result[i].Status != null &&
                            workFlow.Result[i].Description == "Closure Report Review" &&
                            workFlow.Result[i].Status.Text == "NFA" &&
                            record.FinalReviewApprovedDate == "")
                        {
                            record.FinalReviewApprovedDate = workFlow.Result[i].StatusDate;
                        }
                        else if (record.Type.Value == "DEQ/OPC/Site Assessment/Application" &&
                            workFlow.Result[i].Status != null &&
                            workFlow.Result[i].Description == "Lab Data Review" &&
                            workFlow.Result[i].Status.Text == "NFA" &&
                            record.FinalReviewApprovedDate == "")
                        {
                            record.FinalReviewApprovedDate = workFlow.Result[i].StatusDate;
                        }
                        else if (workFlow.Result[i].Status != null &&
                            workFlow.Result[i].Description == "Plans Coordination" &&
                            workFlow.Result[i].Status.Text == "Approved" &&
                            record.PlansCoordinationApprovedDate == "")
                        {
                            record.PlansCoordinationApprovedDate = workFlow.Result[i].StatusDate;
                        }

                        if (i > 0 &&
                                    string.Equals(workFlow.Result[i].Description, previousWF.Description) &&
                                    string.Equals(workFlow.Result[i].StatusDate, previousWF.StatusDate) &&
                                    string.Equals(workFlow.Result[i].Status.Text, previousWF.Status.Text))
                        {
                            workFlow.Result[i].Description = "HIDE";
                        }
                        else if (i > 0)
                        {
                            previousWF = workFlow.Result[i];
                        }
                    }
                    Array.Sort(workFlow.Result, new WorkFlowComparer());
                }
                record.WorkFlowHistory = workFlow;
            }
            catch (Exception e)
            {
                Error("BuildOpcApplicationInfoAsync", e);
                throw e;
            }
        }


        public async Task<RecordModel> GetTanks(RecordModel record)
        {
            try
            {
                return await GetTanksAsync(record);
            }
            catch (HttpRequestException e)
            {
                if (e.Message.Contains("401 (Unauthorized)"))
                {
                    try
                    {
                        Token = await GetToken();
                        return await GetTanksAsync(record);
                    }
                    catch (Exception ex)
                    {
                        throw ex;
                    }
                }
                else
                {
                    throw e;
                }
            }
        }


        public async Task<RecordModel> GetTanksAsync(RecordModel record)
        {
            try
            {
                // Get site's child record IDs
                var children = await HttpGetChildren(record.Id);

                var allTanks = new List<TankModel>();
                var childTanks = new List<RecordModel>();

                if (children.Result != null && children.Result.Length > 0)
                {
                    //build tank list
                    foreach (var child in children.Result)
                    {
                        if (child.Type.Value == "DEQ/OPC/Hazardous Tank/Permit")
                        {
                            childTanks.Add(child);
                        }
                    }
                }

                const int batchCount = 8; // if too large, the API call will fail with http error 500.

                if (childTanks.Count > 0 && childTanks.Count <= batchCount)
                { 
                    StringBuilder ids = new StringBuilder();

                    foreach (var tank in childTanks)
                    {
                        ids.Append(",");
                        ids.Append(tank.Id);
                    }
                    ids.Remove(0, 1);
                    await GetTanksByIdsAsync(ids.ToString(), allTanks);
                }
                else if (childTanks.Count > 0 && childTanks.Count > batchCount)
                {
                    int loopCount = 0;
                    
                    if (childTanks.Count % batchCount > 0)
                    {
                        loopCount = childTanks.Count / batchCount + 1;
                    }
                    else
                    {
                        loopCount = childTanks.Count / batchCount;
                    }

                    for(int j = 0; j < loopCount; j++)
                    {
                        StringBuilder ids = new StringBuilder();
                        //get multiple tanks in a batch
                        for (int i = 0; i < batchCount; i++)
                        {
                            if (j * batchCount + i < childTanks.Count)
                            {
                                ids.Append(",");
                                ids.Append(childTanks[j * batchCount + i].Id);
                            }
                        }
                        ids.Remove(0, 1);
                        await GetTanksByIdsAsync(ids.ToString(), allTanks);
                    }
                }

                record.Tanks = allTanks.ToArray();
                Array.Sort(record.Tanks, new TankComparer());
                
                return record;
            }
            catch (Exception e)
            {
                Error("GetTanksAsync", e);
                throw e;
            }
        }


        public async Task GetTanksByIdsAsync(string ids, List<TankModel> allTanks)
        {
            var tanks = await HttpGetTanksInfoByIds(ids);
            if (tanks.Result != null && tanks.Result.Length > 0)
            {
                foreach (var tank in tanks.Result)
                {
                    BuildOpcTankAsiInfo(tank);
                    if (tank.Hide == false)
                    {
                        allTanks.Add(tank);
                    }
                }
            }

        }


        public async Task GetLastInspectionDate(TankModel tank)
        {
            try
            {
                var inspections = await HttpGetInspections(tank.Id);
                if (inspections.Result != null && inspections.Result.Length > 0)
                {
                    Array.Sort(inspections.Result, new InspectionComparer());
                    tank.LastInspectionDate = inspections.Result[0].CompletedDate;
                }
            }
            catch (Exception e)
            {
                Error("GetLastInspectionDate", e);
                throw e;
            }
        }


        private void BuildOpcSiteAsi(RecordModel site)
        {
            try 
            {
                if (site.CustomForms != null && site.CustomForms.Length > 0)
                {
                    foreach (var asi in site.CustomForms)
                    {                       
                      
                        if (asi.NonFoilable != null && asi.NonFoilable == "Yes")
                        {
                            site.NonFoilable = asi.NonFoilable;
                        }
                        if (asi.FoilableSite != null && asi.FoilableSite == "Yes")
                        {
                            site.FoilableSite = asi.FoilableSite;
                        }
                        if (asi.FileReferenceNumber != "")
                        {
                            site.FileReferenceNumber = asi.FileReferenceNumber;
                        }
                        if (asi.OPCPermitToOperateStartDate != null && asi.OPCPermitToOperateStartDate != "")
                        {
                            site.OPCPermitToOperateStartDate = asi.OPCPermitToOperateStartDate;
                        }
                        if (asi.OPCPermitToOperateEndDate != null && asi.OPCPermitToOperateEndDate != "")
                        {
                            site.OPCPermitToOperateEndDate = asi.OPCPermitToOperateEndDate;
                        }

                        if (site.FileReferenceNumber != "" && site.OPCPermitToOperateStartDate != "" && site.OPCPermitToOperateEndDate != "")
                        {
                            break;
                        }
                    }
                    if (site.Parcels == null)
                    {
                        site.Parcels = new ParcelModel[] { new ParcelModel() };
                    }
                }
            }
            catch (Exception e)
            {
                Error("BuildOpcSiteAsi", e);
                throw e;
            }
        }


        private void BuildHamletInfo(RecordModel record)
        {
            foreach(var asi in record.CustomForms)
            {
                if (asi.Hamlet != null && asi.Hamlet != "")
                {
                    record.Hamlet = asi.Hamlet;
                }
            }
        }


        private void UpdatePagination(RecordsModel records)
        {
            try
            {
                if (records.Page.Hasmore)
                {
                    records.DisplayRange = $"{records.Page.Offset + 1} - {records.Page.Offset + records.Page.Limit}";
                }
                else
                {
                    records.DisplayRange = $"{records.Page.Offset + 1} - {records.Page.Offset + records.Result.Length}";
                }
            }
            catch (Exception e)
            {
                Error("UpdatePagination", e);
                throw e;
            }
        }


        private void BuildPrimaryAddress(RecordModel record)
        {
            foreach (var address in record.Addresses)
            {
                if (address.IsPrimary == "Y")
                {
                    record.Address = BuildAddress(address);
                    break;
                }
                else
                {
                    record.Address = BuildAddress(address);
                }
            }
        }


        private string BuildAddress(AddressesModel address)
        {
            try
            {
                var addr = new StringBuilder();
                if (address.StreetStart >= 0)
                {
                    addr.Append(address.StreetStart);
                }
                if (address.Direction != null)
                {
                    addr.Append(" ");
                    addr.Append(address.Direction.Text);
                }
                if (address.StreetName != null)
                {
                    addr.Append(" ");
                    addr.Append(address.StreetName);
                }
                if (address.StreetSuffix != null)
                {
                    addr.Append(" ");
                    addr.Append(address.StreetSuffix.Text);
                }
                if (address.StreetSuffixDirection != null)
                {
                    addr.Append(" ");
                    addr.Append(address.StreetSuffixDirection.Text);
                }
                if (address.UnitStart != null)
                {
                    addr.Append(" ");
                    addr.Append(address.UnitStart);
                }
                if (address.City != null)
                {
                    addr.Append(", ");
                    addr.Append(address.City);
                }
                if (address.State != null)
                {
                    addr.Append(", ");
                    addr.Append(address.State.Text);
                }
                if (address.PostalCode != null)
                {
                    addr.Append(" ");
                    addr.Append(address.PostalCode);
                }

                return addr.ToString();
            }
            catch (Exception e)
            {
                Error("BuildAddress", e);
                throw e;
            }
        }


        private void BuildOpcTankAsiInfo(TankModel tank)
        {
            try
            {
                foreach (var asi in tank.CustomForms)
                {
                    if (asi.SCDHSTankNumber != "")
                    {
                        tank.SCDHSTankNumber = asi.SCDHSTankNumber;
                    }
                    if (asi.TankLocation != "")
                    {
                        tank.TankLocation = asi.TankLocation;
                    }
                    if (asi.Capacity != "")
                    {
                        if (int.TryParse(asi.Capacity, out int result))
                        {
                            tank.Capacity = String.Format("{0:n0}", result);
                        }
                        else
                        {
                            tank.Capacity = asi.Capacity;
                        }
                    }
                    if (asi.UnitsLabel != "")
                    {
                        tank.UnitsLabel = asi.UnitsLabel;
                    }
                    if (asi.ProductStoredCode != "")
                    {
                        if (asi.ProductStoredCode == "97" || asi.ProductStoredCode == "98" || asi.ProductStoredCode == "99")
                        {
                            tank.ProductStored = asi.OtherProductStored;
                        }
                        else
                        {
                            tank.ProductStored = asi.ProductStoredLabel;
                        }
                    }

                    if (asi.StorageTypeLabel != "")
                    {
                        tank.StorageTypeLabel = asi.StorageTypeLabel;
                    }


                    if (asi.Status != null && asi.Status.Trim().StartsWith("10"))
                    {
                        tank.Hide = true;
                    }
                    else if (asi.OfficialUseCode != null && asi.OfficialUseCode.Trim() == "NI")
                    {
                        tank.Hide = true;
                    }
                    else if (asi.CbsReg != null && asi.CbsReg == "Yes")
                    {
                        tank.Hide = true;
                    }
                    else if (asi.Status != null && asi.Status != "" && asi.Status.Trim().StartsWith("5") == false && asi.Status.Trim().StartsWith("99") == false) 
                    {
                        tank.AsiStatus = asi.Status.Trim().Substring(2);
                    }


                    if (asi.DateInstalled != "")
                    {
                        tank.DateInstalled = asi.DateInstalled;
                    }
                    if (asi.DateOfPermanentClosureOrOutOfService != "")
                    {
                        tank.DateOfPermanentClosureOrOutOfService = asi.DateOfPermanentClosureOrOutOfService;
                    }
                }

                if (tank.Hide == false && tank.AsiStatus == "")
                {
                    tank.AsiStatus = tank.Status.Text;
                }
            }
            catch (Exception e)
            {
                Error("BuildOpcTankAsiInfo", e);
                throw e;
            }
        }


        public async Task<RecordsModel> HttpGetChildren(string id)
        {
            try
            {
                var sb = new StringBuilder();
                sb.Append(IConfig.GetValue<string>("RestApi:RecordUrl"));
                sb.Append(id);
                sb.Append(IConfig.GetValue<string>("RestApi:ChildPath"));

                var request = new HttpRequestMessage(HttpMethod.Get, sb.ToString());

                request.Headers.Add("Authorization", Token);
                HttpResponseMessage response = await Client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<RecordsModel>();
            }
            catch (Exception e)
            {
                Error("HttpGetChildren", e);
                throw e;
            }
        }


        public async Task<TanksModel> HttpGetTanksInfoByIds(string ids)
        {
            try
            {
                var sb = new StringBuilder();
                sb.Append(IConfig.GetValue<string>("RestApi:RecordUrl"));
                sb.Append(ids);
                sb.Append(IConfig.GetValue<string>("RestApi:ExpandAsiPath"));


                var request = new HttpRequestMessage(HttpMethod.Get, sb.ToString());

                request.Headers.Add("Authorization", Token);

                HttpResponseMessage response = await Client.SendAsync(request);

                response.EnsureSuccessStatusCode();

                var tankInfo = await response.Content.ReadFromJsonAsync<TanksModel>();

                return tankInfo;
            }
            catch (Exception e)
            {
                Error("HttpGetTanksInfoByIds", e);
                throw e;
            }
        }


        public async Task<InspectionsModel> HttpGetInspections(string id)
        {
            try
            {
                var sb = new StringBuilder();
                sb.Append(IConfig.GetValue<string>("RestApi:RecordUrl"));
                sb.Append(id);
                sb.Append(IConfig.GetValue<string>("RestApi:InspectionPath"));

                var request = new HttpRequestMessage(HttpMethod.Get, sb.ToString());

                request.Headers.Add("Authorization", Token);
                HttpResponseMessage response = await Client.SendAsync(request);
                response.EnsureSuccessStatusCode();
                return await response.Content.ReadFromJsonAsync<InspectionsModel>();
            }
            catch (Exception e)
            {
                Error("HttpGetInspection", e);
                throw e;
            }
        }

    }
}
