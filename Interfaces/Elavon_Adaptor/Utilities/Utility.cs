using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Script.Serialization;

namespace Elavon_Adaptor.Utilities {
    public class Utility {
        private static JavaScriptSerializer _serializer;
        public static JavaScriptSerializer Serializer => _serializer ?? (_serializer = new JavaScriptSerializer());

        public static string SerializeToJson<T> (T obj) {
            return Serializer.Serialize(obj);
        }

        public static T DeserializeFromJson<T>(string jsonString) {
            var ser = new DataContractJsonSerializer(typeof(T), new DataContractJsonSerializerSettings {
                UseSimpleDictionaryFormat = true
            });
            var stream = new MemoryStream(Encoding.UTF8.GetBytes(jsonString));
            var obj = (T)ser.ReadObject(stream);
            return obj;
        }

        public static string BuildUrlFromParameters(Dictionary<string, string> parameters) {
            var url = "";
            foreach (var parameter in parameters) {
                url += $"&{parameter.Key}={parameter.Value}";
            }
            if (url.Length > 0) {
                url = url.Substring(1);
            }
            return url;
        }

        public static object GetKeyValue(dynamic dictionary, string path, object defaultValue = null) {
            var arr = path.Split('.');

            foreach (var key in arr) {
                if (!dictionary.ContainsKey(key)) {
                    return defaultValue;
                }
                dictionary = dictionary[key];
            }

            return dictionary;
        }
    }

    public class Config
    {
        public static string AccelaAccessTokenUrl => GetConfig("AccelaAccessTokenUrl");
        public static string AccelaRequestUrl => GetConfig("AccelaRequestUrl");
        //public static string AccelaAgency => GetConfig("AccelaAgency");
        //public static string AccelaUserName => GetConfig("AccelaUsername");
        //public static string AccelaPassword => GetConfig("AccelaPassword");
        //public static string AccelaClientId => GetConfig("AccelaClientId");
        //public static string AccelaClientSecret => GetConfig("AccelaClientSecret");
        //public static string AccelaEnvironment => GetConfig("AccelaEnvironment");
        //public static string AccelaScope => GetConfig("AccelaScope");
        //public static string AccelaGrantType => GetConfig("AccelaGrantType");
        public static string AccelaAgency => GetConfig("av.agency");
        public static string AccelaUserName => GetConfig("av.username");
        public static string AccelaPassword => GetConfig("av.password");
        public static string AccelaClientId => GetConfig("clientId");
        public static string AccelaClientSecret => GetConfig("clientSecret");
        public static string AccelaEnvironment => GetConfig("environment");
        public static string AccelaScope => GetConfig("scope");
        public static string AccelaGrantType => GetConfig("grant");
        //public static string GetConfig(string configName) {
        //    return ConfigurationManager.AppSettings[configName];
        //}

        public static string GetConfig(string configName)
        {

            NameValueCollection avConfig = ConfigurationManager.GetSection(@"paymentAdapter") as NameValueCollection;
            return avConfig[configName];
        }

    }

    public static class DictionaryExtension {
        public static Dictionary<string, object> RemoveNullAndWhiteSpaceValues(this Dictionary<string, object> dic) {
            return dic.Where(prop => {
                var val = prop.Value;

                if (val == null) {
                    return false;
                }

                if (val is string && string.IsNullOrWhiteSpace(val as string)) {
                    return false;
                }
                return true;
            }).ToDictionary(prop => prop.Key, prop => prop.Value);
        }
    }
}