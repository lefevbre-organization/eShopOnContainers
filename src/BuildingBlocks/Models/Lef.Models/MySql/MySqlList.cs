using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class MySqlList<T>
    {
        public MySqlList()
        {
            //Entities = new List<T>();
            Errors = new List<ErrorInfo>();
            Infos = new List<Info>();

        }

        public MySqlList(T t) : this()
        {
            data = t;
        }

        public MySqlList(T t, List<ErrorInfo> errors, List<Info> infos, int? totalRegs ) 
        {
            data = t;
            Errors = errors;
            Infos = infos;
            TotalRegs = totalRegs;
        }

        public MySqlList(T t, string parameterName) : this(t)
        {

            ParameterDB = parameterName;
        }

        public T data { get; set; }

        public List<ErrorInfo> Errors { get; set; }
        public List<Info> Infos { get; set; }

        //public List<T> Entities { get; set; }

        public int? TotalRegs { get; set; }

        private int? IdError { get; set; }

        private string Error { get; set; }
        private string ParameterDB { get; }

        public void AddData(object DataFromMySql)
        {
            try
            {
                if (DataFromMySql is T)
                    data = (T)DataFromMySql;
            }
            catch (System.Exception ex)
            {
                IdError = 101;
                Error = ex.Message;
            }
        }

        public bool PossibleHasData()
        {
            return (IdError == null && Error == null);
        }

        public void AddOutPutParameters(object idError, object TextError, object Total)
        {
            try
            {
                if (idError is int)
                    IdError = (int?)idError;

                if (TextError is int || TextError is string)
                    Error = TextError.ToString();

                if (!PossibleHasData())
                    Errors.Add(new ErrorInfo() { code = IdError.ToString(), member = $"MySqlRepository.{ParameterDB}", message = Error });
                
                if (Total is int)
                    TotalRegs = (int?)Total;
            }
            catch (System.Exception exp)
            {
                IdError = 100;
                Error = exp.Message;
            }
        }
    }
}