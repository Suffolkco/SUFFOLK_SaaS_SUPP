using SST.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace SST.Web.Services
{
    public class TankComparer : IComparer
    {
        public int Compare(object x, object y)
        {
            var SCDHSTankNumberX = Int32.Parse(((TankModel)x).SCDHSTankNumber);
            var SCDHSTankNumberY = Int32.Parse(((TankModel)y).SCDHSTankNumber);
            return SCDHSTankNumberX.CompareTo(SCDHSTankNumberY);
        }
    }
}
