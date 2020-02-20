using System;
using System.Collections.Generic;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class MySqlList<T, TItems>
    {
        public MySqlList()
        {
            //Entities = new List<T>();
            Errors = new List<ErrorInfo>();
            Infos = new List<Info>();

        }

        public MySqlList(T t) : this()
        {
            result = t;
        }

        public MySqlList(T t, string parameterName, int pageIndex, int pageSize) : this(t)
        {
            ParameterDB = parameterName;
            PageIndex = pageIndex;
            PageSize = pageSize;
        }

        public MySqlList(T t, List<ErrorInfo> errors, List<Info> infos, long? totalRegs ) 
        {
            result = t;
            Errors = errors;
            Infos = infos;
            Count = totalRegs;
        }
        public T result { get; set; }

        public IEnumerable<TItems> Data { get; set; }

        public List<ErrorInfo> Errors { get; set; }
        public List<Info> Infos { get; set; }

        public int PageIndex { get;  set; }

        public int PageSize { get; set; }

        public long? Count { get; set; }

        private int? IdError { get; set; }

        private string Error { get; set; }
        private string ParameterDB { get; }

        public void AddData(object DataFromMySql)
        {
            try
            {
                if (DataFromMySql is T)
                    result = (T)DataFromMySql;

            }
            catch (Exception ex)
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
                    Count = (int?)Total;
            }
            catch (Exception exp)
            {
                IdError = 100;
                Error = exp.Message;
            }
        }

        public void AddData(JosEntityTypeList resultado, object[] entities)
        {
            AddData(resultado);
            if (entities is IEnumerable<TItems>)
                Data = entities as IEnumerable<TItems>;

        }

        public bool TengoLista()
        {
            var listado = (Data as List<TItems>);
            return listado?.Count > 0;
        }
    }
}