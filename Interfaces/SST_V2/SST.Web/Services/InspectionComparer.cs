using SST.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace SST.Web.Services
{
    public class InspectionComparer : IComparer
    {
        public int Compare(object x, object y)
        {
            var inspDateY = DateTime.ParseExact(((InspectionModel)y).CompletedDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);
            var inspDateX = DateTime.ParseExact(((InspectionModel)x).CompletedDate, "yyyy-MM-dd", CultureInfo.InvariantCulture);

            return DateTime.Compare(inspDateY, inspDateX);

        }
    }
}
