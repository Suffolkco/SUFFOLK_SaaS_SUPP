using Newtonsoft.Json;

namespace SST.Models
{
    public class RecordTypeModel
    {
        [JsonProperty("module")]
        public string Module { get; set; } = "";
        [JsonProperty("value")]
        public string Value { get; set; } = "";
        [JsonProperty("type")]
        public string Type { get; set; } = "";
        [JsonProperty("text")]
        public string Text { get; set; } = "";
        [JsonProperty("group")]
        public string Group { get; set; } = "";
        [JsonProperty("category")]
        public string Category { get; set; } = "";
        [JsonProperty("alias")]
        public string Alias { get; set; } = "";
        [JsonProperty("subType")]
        public string SubType { get; set; } = "";
        [JsonProperty("id")]
        public string Id { get; set; } = "";


        public RecordTypeModel()
        {

        }


        public RecordTypeModel(string module, string group, string type)
        {
            Module = module;
            Group = group;
            Type = type;
        }
        public RecordTypeModel(string module, string group, string type, string subType)
        {
            Module = module;
            Group = group;
            Type = type;
            SubType = subType;
        }
        public RecordTypeModel(string module, string group, string type, string subType, string category)
        {
            Module = module;
            Group = group;
            Type = type;
            SubType = subType;
            Category = category;
        }
    }

}
