using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Accela.ACA.PaymentAdapter.CSPAdapterWeb.DataObjects {
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
}