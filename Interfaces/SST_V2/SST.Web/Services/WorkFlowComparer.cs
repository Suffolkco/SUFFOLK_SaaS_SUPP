using SST.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace SST.Web.Services
{
    public class WorkFlowComparer : IComparer
    {
        public int Compare(object x, object y)
        {
            var statusDateY = DateTime.ParseExact(((WorkFlowModel)y).StatusDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            var statusDateX = DateTime.ParseExact(((WorkFlowModel)x).StatusDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            var LastModifiedDateY = DateTime.ParseExact(((WorkFlowModel)y).LastModifiedDate, "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
            var LastModifiedDateX = DateTime.ParseExact(((WorkFlowModel)x).LastModifiedDate, "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
            if (DateTime.Compare(statusDateY, statusDateX) == 0)
            {
                return DateTime.Compare(LastModifiedDateY, LastModifiedDateX);
            }
            else
            {
                return DateTime.Compare(statusDateY, statusDateX);
            }
        }
    }
}
