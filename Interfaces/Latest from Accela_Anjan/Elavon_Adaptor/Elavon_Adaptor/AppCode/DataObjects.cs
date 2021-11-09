using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Elavon_Adaptor.DataObjects {
    [DataContract]
    public class RestResponse<T> {
        [DataMember(Name = "result")]
        public T Result { get; set; }

        [DataMember(Name = "status")]
        public int Status { get; set; }

        [DataMember(Name = "message")]
        public string Message { get; set; }
    }

    // Data Objects used for response from REST calling EMSE
    [DataContract]
    public struct EmseResultObject<T> {
        [DataMember(Name = "message")]
        public string Message { get; set; }

        [DataMember(Name = "success")]
        public bool Success { get; set; }

        [DataMember(Name = "content")]
        public T Result { get; set; }
    }

    [DataContract]
    public class ConvergeTokenRequest {

        [DataMember(Name="ssl_merchant_id")]
        public string ssl_merchant_id { get; set; }

        [DataMember(Name = "ssl_user_id")]
        public string ssl_user_id { get; set; }

        [DataMember(Name = "ssl_pin")]
        public string ssl_pin { get; set; }

        [DataMember(Name = "ssl_invoice_number")]
        public string ssl_invoice_number { get; set; }

        [DataMember(Name = "ssl_transaction_type")]
        public string ssl_transaction_type { get; set; }

        [DataMember(Name = "ssl_amount")]
        public string ssl_amount { get; set; }
    }
}