using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Runtime.Caching;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;
using log4net;
using System.Web.Script.Serialization;

namespace suffolk.lims {

        public class Utility {
            private static readonly ILog Logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

            private static JavaScriptSerializer _serializer;
            public static JavaScriptSerializer Serializer => _serializer ?? (_serializer = new JavaScriptSerializer());

            public static string SerializeToJson<T>(T obj) {
                return Serializer.Serialize(obj);
            }

            public static T DeserializeFromJson<T>(string jsonString) {
                return Serializer.Deserialize<T>(jsonString);
            }

            public static T DeserializeJson<T>(string jsonString) {
                var ser = new DataContractJsonSerializer(typeof(T));
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

            public static object GetCache(string key) {
                ObjectCache cache = MemoryCache.Default;
                dynamic content = cache[key];
                return content;
            }

            public static void SetCache(string key, object content, int expiresIn = 86400, bool neverExpires = false) {
                var policy = new CacheItemPolicy();
                if (!neverExpires) {
                    // Cache expires every 120 minutes
                    policy.AbsoluteExpiration = DateTime.UtcNow.AddSeconds(expiresIn);
                }
                ObjectCache cache = MemoryCache.Default;
                cache.Set(key, content, policy);
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

            public static void LogError(Exception e) {
                var s = $"{e.Message} {e.InnerException?.Message ?? ""}";
                LogError(s);
            }

            public static void LogError(string s) {
                Console.WriteLine(s);
                Logger.Error(s);
            }

            public static void LogWarning(Exception e) {
                var s = $"{e.Message} {e.InnerException?.Message ?? ""}";
                LogWarning(s);
            }

            public static void LogWarning(string s) {
                Console.WriteLine(s);
                Logger.Warn(s);
            }

            public static void LogInfo(string s) {
                Console.WriteLine(s);
                Logger.Info(s);
            }
        
        }

        public class Config {
            public static string AccelaAccessTokenUrl => GetConfig("AccelaAccessTokenUrl");
            public static string AccelaRequestUrl => GetConfig("AccelaRequestUrl");
            public static string AccelaAgency => GetConfig("AccelaAgency");
            public static string AccelaUserName => GetConfig("AccelaUsername");
            public static string AccelaPassword => GetConfig("AccelaPassword");
            public static string AccelaClientId => GetConfig("AccelaClientId");
            public static string AccelaClientSecret => GetConfig("AccelaClientSecret");
            public static string AccelaEnvironment => GetConfig("AccelaEnvironment");
            public static string AccelaScope => GetConfig("AccelaScope");
            public static string AccelaGrantType => GetConfig("AccelaGrantType");
            public static string InputPath => GetConfig("InputPath");
            public static string OutputPath => GetConfig("OutputPath");
            public static string GetConfig(string configName) {
                return ConfigurationManager.AppSettings[configName];
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
