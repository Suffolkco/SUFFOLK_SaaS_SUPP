using InterfaceLib.Common.GenericQueryService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace InterfaceLib.Common.Service
{
    public class GenericQueryAPIHelper : APIHelper
    {
        private const string GENERIC_QUERY_PATH = "/v3/search/generic/{0}";

        public GenericQueryAPIHelper()
        {
            log = log4net.LogManager.GetLogger(typeof(GenericQueryAPIHelper));
        }
        public ReturnInfo query(string sessionId, string sqlName, ParameterModel[] paramArray, int startRow, int endRow)
        {
            ReturnInfo rInfo = new ReturnInfo();
            Dictionary<string, string> body = new Dictionary<string, string>();

            for (int i = 0; i < paramArray.Length; i++)
            {
                body.Add(paramArray[i].name,paramArray[i].value);
            }
            int limit = 1000;
            if(endRow - startRow <= 999)
            {
                limit = endRow - startRow + 1;
            }
            KeyValuePair<bool,dynamic> result = Execute<dynamic>(HttpMethod.Post, $"{string.Format(GENERIC_QUERY_PATH, sqlName)}?offset={startRow}&limit={limit}", sessionId, body);

            if (result.Key)
            {
                rInfo.returnCode = "0";
                rInfo.result = result.Value;
            }

            return rInfo;
        }
    }
}