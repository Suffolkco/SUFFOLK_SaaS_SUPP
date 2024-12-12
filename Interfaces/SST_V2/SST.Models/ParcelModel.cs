using Newtonsoft.Json;

namespace SST.Models
{
    public class ParcelModel
    {
        [JsonProperty("parcelNumber")]
        public string ParcelNumber { get; set; } = "";


        public ParcelModel()
        {
        }

        public ParcelModel(string p)
        {
            ParcelNumber = p;
        }
    }

}
