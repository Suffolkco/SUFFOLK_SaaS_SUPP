using Microsoft.AspNetCore.Components;
using SST.Models;
using SST.Web.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Text.RegularExpressions;

namespace SST.Web.Pages
{
    public class SearchWwmApplicationBase : ComponentBase
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
            SearchRecord = new SearchRecordsModel("", //S02980001(731 taxmap, but test use openDate 1/1/1900), R-21-0002(PROD), C-21-0004(has city)
                new ParcelModel(""), //0400278010100001000(86 records), 0200475000200007000, 0100169000100009000, 0100095000200015000(PROD)
                "DEQ",
                new RecordTypeModel[] {
                    new RecordTypeModel("DEQ", "DEQ", "WWM", "Commercial"),
                    new RecordTypeModel("DEQ", "DEQ", "WWM", "Residence"),
                    new RecordTypeModel("DEQ", "DEQ", "WWM", "Subdivision"),
                    //new RecordTypeModel("DEQ", "DEQ", "WWM", "Garbage"),
                    new RecordTypeModel("DEQ", "DEQ", "WWM", "STP")
                },
                SearchType.WwmApplications,
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
                //Regex rg1 = new Regex(@"^\s*[CRST]\d{8}\s*$");
                Regex rg2 = new Regex(@"^\s*[CR]-\d{2}-\d{4}\s*$");
                Regex rg3 = new Regex(@"^\s*RS-\d{2}-\d{4}\s*$");
                Regex rg4 = new Regex(@"^\s*\d{19}\s*$");
                if (SearchRecord.Criteria == "Record ID"  
                        //&& rg1.IsMatch(SearchRecord.CustomId.ToUpper()) == false 
                        && rg2.IsMatch(SearchRecord.CustomId.ToUpper()) == false
                        && rg3.IsMatch(SearchRecord.CustomId.ToUpper()) == false
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
