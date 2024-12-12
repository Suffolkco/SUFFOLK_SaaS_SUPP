using Microsoft.AspNetCore.Components;
using SST.Models;
using SST.Web.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Text.RegularExpressions;


namespace SST.Web.Pages
{
    public class SearchOpcSiteBase : ComponentBase
    {
        [Inject]
        protected IRecordService RecordService { get; set; }
        protected RecordsModel Records { get; set; }
        protected SearchRecordsModel SearchRecord { get; set; }
        protected SearchRecordsModel CurrentSearchRecord { get; set; }
        protected bool IsLoading { get; set; } = false;
        
        protected int CurrentPage { get; set; } = 1;
        protected int TotalPages { get; set; } = 0;
        public int TotalRecords { get; set; }
        protected int Radius { get; set; } = 3;
        protected int SelectedPage { get; set; }

        protected PageModel page = new PageModel();

        protected List<LinkModel> Links;

        protected bool IsException { get; set; } = false;
        protected string ErrorMessage { get; set; } = "";
        protected string DisplayError { get; set; } = "none";
        protected bool IsClearResults { get; set; } = true;


        protected override Task OnInitializedAsync()
        {
            SearchRecord = new SearchRecordsModel(
                "", //SITE-09759-OPC(SUPP), SITE-13012-OPC(226 children, 197 tanks, 14 active tanks), SITE-02043-OPC(128 children, 128 tanks, 27 active tanks), SITE-95-07986-OPC(facility code=17, has tanks), SITE-03-16683-OPC(25 taxmap), SITE-14249-OPC(2 addr), SITE-00024-OPC(Facility Type Code=17, should hide), SITE-00-15152-OPC(Facility Type Code=null), SITE-00015-OPC(1 addr, address StreetStart has no value), SITE-10602-OPC(has tank closure date)
                new ParcelModel(""), //0900312000100004002(75 records), 0200665000200001000(13 records), 0500207000100003035, 0300184000600001000, 0800132000400002000
                "DEQ",
                new RecordTypeModel[] { new RecordTypeModel("DEQ", "DEQ", "General", "Site") }, 
                SearchType.OpcSites,
                "Record ID",
                new CustomformModelForSearch[] { new CustomformModelForSearch("DEQ_SITE-OPC.cSPECIFIC") } //File Ref No: 05229
            );
            
            return base.OnInitializedAsync();
        }


        protected async Task HandleValidSubmit()
        {
            SearchRecord.FirstTime = true;
            try
            {
                Regex rg1 = new Regex(@"^\s*[CRST]\d{8}\s*$");
                Regex rg2 = new Regex(@"^\s*[CR]-\d{2}-\d{4}\s*$");
                Regex rg3 = new Regex(@"^\s*RS-\d{2}-\d{4}\s*$");
                Regex rg4 = new Regex(@"^\s*\d{19}\s*$");
                Regex rg5 = new Regex(@"^\s*\d{5}\s*$");
                Regex rg6 = new Regex(@"^\s*SITE-.*$");
                
                if (SearchRecord.Criteria == "Record ID"
                        && (rg6.IsMatch(SearchRecord.CustomId.ToUpper()) == false
                            || SearchRecord.CustomId.Length < 13)
                   )
                {
                    ErrorMessage = "Invalid SITE Record ID ";
                    DisplayError = "block";
                    IsClearResults = true;
                }
                else if (SearchRecord.Criteria == "Tax Map"
                             && rg4.IsMatch(SearchRecord.Parcel.ParcelNumber) == false
                        )
                {
                    ErrorMessage = "Invalid Tax Map Number.";
                    DisplayError = "block";
                    IsClearResults = true;
                }
                else if (SearchRecord.Criteria == "File Reference Number"
                            && rg5.IsMatch(SearchRecord.CustomForms[0].FileReferenceNumber) == false
                        )
                {
                    ErrorMessage = "Invalid File Reference Number.";
                    DisplayError = "block";
                    IsClearResults = true;
                }
                else
                {
                    ErrorMessage = "";
                    DisplayError = "none";
                    IsLoading = true;
                    IsException = false;
                    IsClearResults = false;

                    if (SearchRecord.Criteria == "Record ID")
                    {
                        SearchRecord.CustomId = SearchRecord.CustomId.Trim();
                        SearchRecord.CustomForms[0].FileReferenceNumber = "";
                        SearchRecord.Parcel.ParcelNumber = "";
                    }
                    else if (SearchRecord.Criteria == "File Reference Number")
                    {
                        SearchRecord.CustomId = "";
                        SearchRecord.CustomForms[0].FileReferenceNumber = SearchRecord.CustomForms[0].FileReferenceNumber.Trim();
                        SearchRecord.Parcel.ParcelNumber = "";
                    }
                    else if (SearchRecord.Criteria == "Tax Map")
                    {
                        SearchRecord.CustomId = "";
                        SearchRecord.CustomForms[0].FileReferenceNumber = "";
                        SearchRecord.Parcel.ParcelNumber = SearchRecord.Parcel.ParcelNumber.Trim();
                    }

                    CurrentSearchRecord = SearchRecord.DeepCopy();

                    page.Offset = 0;
                    Records = await RecordService.SearchRecords(SearchRecord, page);
                    IsLoading = false;
                    Links = null;

                    if (Records.Page != null)
                    {
                        CurrentPage = 1;
                        TotalRecords = Records.Page.Total;
                        if (Records.Page.Total % Records.Page.Limit > 0)
                        {
                            TotalPages = Records.Page.Total / Records.Page.Limit + 1;
                        }
                        else
                        {
                            TotalPages = Records.Page.Total / Records.Page.Limit;
                        }
                        LoadPages();
                    }

                    StateHasChanged();

                    GetTanksAndInspections();
                }
            }
            catch (Exception e)
            {
                IsLoading = false;
                IsException = true;
                throw e;
            }
        }


        protected async Task SelectedPageInternal(LinkModel link)
        {
            IsLoading = true;
            IsException = false;
            SearchRecord.FirstTime = false;
            try
            {
                page.Offset = (link.Page - 1) * page.Limit;

                Records = await RecordService.SearchRecords(CurrentSearchRecord, page);
                IsLoading = false;

                CurrentPage = link.Page;
                LoadPages();

                StateHasChanged();

                GetTanksAndInspections();

            }
            catch (Exception e)
            {
                IsLoading = false;
                IsException = true;
                throw e;
            }
        }


        private async void GetTanksAndInspections()
        {
            foreach (var record in Records.Result)
            {
                if (record.FoilableSite == "Yes")
                {
                    await RecordService.GetTanks(record);
                }
                record.HidePlusMinus = false;
                StateHasChanged();
            }

            foreach (var record in Records.Result)
            {
                if (record.Tanks != null)
                {
                    foreach (var tank in record.Tanks)
                    {
                        await RecordService.GetLastInspectionDate(tank);
                        tank.showLoading = false;
                        StateHasChanged();
                    }
                }
            }
        }


        protected void LoadPages()
        {
            if (TotalPages < 2)
            {
                Links = null;
            }
            else
            {
                Links = new List<LinkModel>();
                var isPreviousPageLinkEnabled = CurrentPage != 1;
                var previousPage = CurrentPage - 1;
                Links.Add(new LinkModel(previousPage, isPreviousPageLinkEnabled, "Previous"));

                for (int i = 1; i <= TotalPages; i++)
                {
                    if (i >= CurrentPage - Radius && i <= CurrentPage + Radius)
                    {
                        Links.Add(new LinkModel(i) { Active = CurrentPage == i });
                    }
                }

                var isNextPageLinkEnabled = CurrentPage != TotalPages;
                var nextPage = CurrentPage + 1;
                Links.Add(new LinkModel(nextPage, isNextPageLinkEnabled, "Next"));
            }
        }


        protected void Toggle(string customId)
        {
            foreach (var record in Records.Result)
            {
                if (record.CustomId == customId && record.HidePlusMinus == false)
                {
                    record.ShowDetail = !record.ShowDetail;
                    record.ShowPlus = !record.ShowPlus;
                }
            }
        }


        protected void ToggleTaxMap(string customId)
        {
            foreach (var record in Records.Result)
            {
                if (record.CustomId == customId)
                {
                    record.ShowAllTaxMap = !record.ShowAllTaxMap;
                }
            }
        }

    }
}
