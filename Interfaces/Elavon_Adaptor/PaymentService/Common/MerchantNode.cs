using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Accela.ACA.PaymentAdapter.Service.Common {
    /// <summary>
    /// the merchant node
    /// </summary>
    public sealed class MerchantNode {
        /// <summary>
        /// The merchant account name
        /// </summary>
        [XmlAttribute("MerchantAccountName")]
        public string MerchantAccountName;

        /// <summary>
        /// the merchant profile ID
        /// </summary>
        [XmlAttribute("MerchantID")]
        public string MerchantID;

        /// <summary>
        /// the merchant profile access key
        /// </summary>
        [XmlAttribute("UserID")]
        public string UserID;
        
        /// <summary>
        /// the merchant profile secret key
        /// </summary>
        [XmlAttribute("PIN")]
        public string PIN;
    }
}
