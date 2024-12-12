using Newtonsoft.Json;

namespace SST.Models
{
    
    public class CustomformModelForSearch
    {
        [JsonProperty("id")]
        public string Id { get; set; } = "";

        /* OPC Sites */
        [JsonProperty("File Reference Number")]
        public string FileReferenceNumber { get; set; } = "";



        public CustomformModelForSearch(string id)
        {
            Id = id;
        }

        public CustomformModelForSearch(string id, string fileReferenceNumber)
        {
            Id = id;
            FileReferenceNumber = fileReferenceNumber;
        }

    }
}
