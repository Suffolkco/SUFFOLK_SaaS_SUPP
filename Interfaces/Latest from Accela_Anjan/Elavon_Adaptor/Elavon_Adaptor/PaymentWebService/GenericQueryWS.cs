using System;
using System.ServiceModel;
using System.Collections.Generic;
using System.Configuration;
using System.Xml;
using InterfaceLib.Common.GenericQueryService;
using System.Text;

namespace InterfaceLib.Common.Service
{
    public class GenericQueryWS
    {
        private static log4net.ILog log = log4net.LogManager.GetLogger(typeof(GenericQueryWS));

        private static String GENERICQUERYSERVICE_URL = "/av-biz-ws-0.9/services/GenericQueryService?wsdl";
        private string bizUrl;

        public GenericQueryWS(string bizUrl)
        {
            this.bizUrl = bizUrl;
        }

        public string QueryFromAAMulti(Dictionary<string, string> map, string queryStringName, string sessionId)
        {
            ParameterModel[] p = new ParameterModel[map.Count ];
            Int32 i = 0;
            foreach (string key in map.Keys)
            {
                string value;
                map.TryGetValue(key, out value);
                p[i] = new ParameterModel();
                p[i].name = key;
                p[i].value = value;
                i = i + 1;
            }
            //BasicHttpBinding binding = new BasicHttpBinding();
            //binding.MaxReceivedMessageSize = 2147483647;
            //binding.ReaderQuotas = XmlDictionaryReaderQuotas.Max;
            //EndpointAddress address = new EndpointAddress(bizUrl + GENERICQUERYSERVICE_URL);
            //GenericQueryService.GenericQueryClient client = new GenericQueryService.GenericQueryClient(binding, address);
            GenericQueryAPIHelper client = new GenericQueryAPIHelper();

            StringBuilder sb = new StringBuilder();
            Int32 num = 1;
            while (true)
            {
                ReturnInfo rinfo = new ReturnInfo();
                rinfo = client.query(sessionId, queryStringName, p, num, num + 49999);
                string returnCode = rinfo.returnCode;
                if ((!("0" == returnCode)))
                   
                {
                    log.Error("queryAA.fail:" + rinfo.returnMessage);
                    throw new Exception("queryAA.fail:" + rinfo.returnMessage);
                }

                if ((num == 1 & rinfo.result != null))
                {
                    sb.Append(rinfo.result.Substring(0, rinfo.result.Length - 1));
                    num += 50000;
                }
                else if ((rinfo.result != null))
                {
                    sb.Append(",").Append(rinfo.result.Substring(1, rinfo.result.Length - 1));
                }
                else
                {
                    break; // TODO: might not be correct. Was : Exit While
                }
            }
            if ((!string.IsNullOrEmpty(sb.ToString().Trim())))
            {
                sb.Append("]");
            }
            //log.Info(queryStringName.Replace("_", " ") + " " + msg.getValue("aa.success"))
            return sb.ToString();
        }
        public ReturnInfo QueryFromAA(Dictionary<string, string> map, string queryStringName, string sessionId)
        {

            ParameterModel[] p = new ParameterModel[map.Count];
            Int32 i = 0;
            foreach (string key in map.Keys)
            {
                string value;
                map.TryGetValue(key, out value);
                p[i] = new ParameterModel();
                p[i].name = key;
                p[i].value = value;
                i = i + 1;
            }
            //BasicHttpBinding binding = new BasicHttpBinding();
            //binding.MaxReceivedMessageSize = 2147483647;
            //binding.ReaderQuotas = XmlDictionaryReaderQuotas.Max;
            //EndpointAddress address = new EndpointAddress(bizUrl + GENERICQUERYSERVICE_URL);
            //GenericQueryService.GenericQueryClient client = new GenericQueryService.GenericQueryClient(binding, address);
            GenericQueryAPIHelper client = new GenericQueryAPIHelper();
            StringBuilder sb = new StringBuilder();
            Int32 num = 1;
            ReturnInfo rinfo = new ReturnInfo();
            while (true)
            {
                
                rinfo = client.query(sessionId, queryStringName, p, num, num + 49999);
                //dynamic returnCode = rinfo.returnCode;
                //if ((!("0" == returnCode)))
                     string returnCode = rinfo.returnCode;
                if ((!("0" == returnCode)))
                {
                    log.Error("queryAA.fail:" + rinfo.returnMessage);
                    throw new Exception("queryAA.fail:" + rinfo.returnMessage);
                }
                else
                {
                    return rinfo;
                }
                
            }

            return rinfo;
        }


        public ParameterModel[] PrepareParameters(Dictionary<string, string> parameters)
        {
            List<ParameterModel> result = new List<ParameterModel>();
            foreach (KeyValuePair<string, string> kvp in parameters)
            {
                ParameterModel p = new ParameterModel();
                p.name = kvp.Key;
                p.value = kvp.Value;
                result.Add(p);
            }
            return result.ToArray();
        }

    }
}
