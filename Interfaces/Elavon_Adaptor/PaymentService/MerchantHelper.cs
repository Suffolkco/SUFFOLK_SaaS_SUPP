using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml;
using System.Xml.Serialization;
using Accela.ACA.Payment.Xml;
using Accela.ACA.PaymentAdapter.Service.Common;

namespace Accela.ACA.PaymentAdapter {
    public class MerchantHelper {
        /// <summary>
        /// Gets the adapter parameter mapping file path
        /// </summary>
        private static string MappingFilePath {
            get {
                var adapterName = GetConfig("AdapterName");
                var filePath = Path.Combine(HttpContext.Current.Server.MapPath("~"), adapterName + "\\MerchantMapping.xml");
                return filePath;
            }
        }

        /// <summary>
        /// Get custom session configuration by key
        /// </summary>
        /// <param name="key">the session key</param>
        /// <returns>the session value</returns>
        internal static string GetConfig(string key) {
            var parameters = ConfigurationManager.GetSection(@"paymentAdapter") as NameValueCollection;
            return parameters[key];
        }

        public static MerchantNode GetMerchantByAccountName(string accountName) {
            var merchantMapping = LoadMerchantMapping(MappingFilePath);
            return merchantMapping.Merchant.Merchants.FirstOrDefault(t => t.MerchantAccountName == accountName);
        }

        /// <summary>
        /// Get parameter mapping
        /// </summary>
        /// <param name="fullPath">the mapping file path</param>
        /// <returns>the instance of Merchant</returns>
        private static MerchantMapping LoadMerchantMapping(string fullPath) {
            if (!File.Exists(fullPath)) {
                throw new Exception("Can not find mapping file." + fullPath);
            }

            if (PaymentHelper.GetDataFromCache<MerchantMapping>("MerchantMapping") == null) {
                using (var reader = new XmlTextReader(new StreamReader(fullPath))) {
                    var xml = new XmlSerializer(typeof(MerchantMapping));
                    var parameter = (MerchantMapping)xml.Deserialize(reader);

                    PaymentHelper.SetDataToCache<MerchantMapping>("MerchantMapping", parameter, 300);
                }
            }

            return PaymentHelper.GetDataFromCache<MerchantMapping>("MerchantMapping");
        }
    }
}
