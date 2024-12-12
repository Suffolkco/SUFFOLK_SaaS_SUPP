using Microsoft.AspNetCore.Components;
using SST.Models;
using SST.Web.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Text.RegularExpressions;


namespace SST.Web.Pages
{
    public class SearchOpcApplicationBase : ComponentBase
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
            SearchRecord = new SearchRecordsModel("", //T-HM-20-00093(3 taxmap), TC-21-00010, ESA-21-00010, SP-19-00026
                new ParcelModel(""), //0900312000100004002(max 7 records), 0101008000400010000(multiple records), 0103010000300105000, 0200174000700003017(SP), 0400258000100001000(multiple records)
                "DEQ",
                new RecordTypeModel[] {
                    new RecordTypeModel("DEQ", "DEQ", "OPC", "Global Containment", "Application"),
                    new RecordTypeModel("DEQ", "DEQ", "OPC", "Hazardous Tank", "Application"),
                    new RecordTypeModel("DEQ", "DEQ", "OPC", "Hazardous Tank Closure", "Application"),
                    new RecordTypeModel("DEQ", "DEQ", "OPC", "Site Assessment", "Application"),
                    new RecordTypeModel("DEQ", "DEQ", "OPC", "Swimming Pool", "Application")
                },
                SearchType.OpcApplications,
                "Record ID",
                null
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

                Regex rg5 = new Regex(@"^\s*T-HM-\d{2}-\d{5}\s*$");
                Regex rg6 = new Regex(@"^\s*TC-\d{2}-\d{5}\s*$");
                //Regex rg7 = new Regex(@"^\s*ESA-\d{2}-\d{5}\s*$");
                Regex rg8 = new Regex(@"^\s*SP-\d{2}-\d{5}\s*$");
                Regex rg9 = new Regex(@"^\s*GC-\d{2}-\d{5}\s*$");


                if (SearchRecord.Criteria == "Record ID"
                        && rg5.IsMatch(SearchRecord.CustomId.ToUpper()) == false
                        && rg6.IsMatch(SearchRecord.CustomId.ToUpper()) == false
                        //&& rg7.IsMatch(SearchRecord.CustomId.ToUpper()) == false
                        && rg8.IsMatch(SearchRecord.CustomId.ToUpper()) == false
                        && rg9.IsMatch(SearchRecord.CustomId.ToUpper()) == false
                   )
                {
                    ErrorMessage = "Invalid Record ID, Application ID or HDREF# ";
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
                else
                {
                    ErrorMessage = "";
                    DisplayError = "none";
                    IsLoading = true;
                    IsException = false;
                    IsClearResults = false;

                    if (SearchRecord.Criteria == "Record ID")
                    {
                        SearchRecord.Parcel.ParcelNumber = "";
                        SearchRecord.CustomId = SearchRecord.CustomId.Trim();
                    }
                    else
                    {
                        SearchRecord.CustomId = "";
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
                }
            }
            catch (Exception e)
            {
                IsLoading = false;
                IsException = true;
                throw e;
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
            }
            catch (Exception e)
            {
                IsLoading = false;
                IsException = true;
                throw e;
            }
        }


        protected void Toggle(string customId)
        {
            foreach (var record in Records.Result)
            {
                if (record.CustomId == customId)
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
