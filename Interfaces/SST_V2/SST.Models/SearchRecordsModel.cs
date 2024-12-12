using Newtonsoft.Json;

namespace SST.Models
{
    public enum SearchType { WwmApplications, OpcApplications, OpcSites }

    public class SearchRecordsModel
    {
        [JsonProperty("id")]
        public string Id { get; set; } = "";

        [JsonProperty("customId")]
        public string CustomId { get; set; } = "";

        [JsonProperty("module")]
        public string Module { get; set; } = "";

        [JsonProperty("parcel")]
        public ParcelModel Parcel { get; set; }

        [JsonProperty("serviceProviderCode")]
        public string ServiceProviderCode { get; set; } = "SUFFOLKCO";

        [JsonProperty("types")]
        public RecordTypeModel[] Types { get; set; }

        [JsonProperty("openedDate")]
        public string OpenedDate { get; set; } = "";

        [JsonProperty("customForms")]
        public CustomformModelForSearch[] CustomForms { get; set; }


        public string Criteria { get; set; } = "";

        public SearchType SearchType { get; set; }
        
        public bool FirstTime { get; set; } = true;



        public SearchRecordsModel DeepCopy()
        {
            SearchRecordsModel other = (SearchRecordsModel)this.MemberwiseClone();

            other.Id = string.Copy(Id);
            other.CustomId = string.Copy(CustomId);
            other.Module = string.Copy(Module);
            other.ServiceProviderCode = string.Copy(ServiceProviderCode);
            other.Criteria = string.Copy(Criteria);
            other.OpenedDate = string.Copy(OpenedDate);

            other.Parcel = new ParcelModel(Parcel.ParcelNumber);
            if (CustomForms != null && CustomForms.Length > 0)
            {
                other.CustomForms = new CustomformModelForSearch[] { new CustomformModelForSearch(CustomForms[0].Id, CustomForms[0].FileReferenceNumber) };
            }

            return other;
        }


        public SearchRecordsModel()
        { }


        public SearchRecordsModel(string customId)
        {
            this.CustomId = customId;
        }


        public SearchRecordsModel(string customId, ParcelModel parcel, string module, RecordTypeModel[] types, SearchType searchType, string criteria, CustomformModelForSearch[] customForms)
        {
            this.CustomId = customId;
            this.Module = module;
            this.Parcel = parcel;
            this.Types = types;
            this.SearchType = searchType;
            this.Criteria = criteria;
            this.CustomForms = customForms;
        }

    }
}
