using System;
using System.Collections.Generic;
using System.Linq;

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

        public void AddData(object resultado, object[] entities)
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


    public class MySqlCompany
    {
        public MySqlCompany()
        {
            Result = new LexCompany();
            Errors = new List<ErrorInfo>();
            Infos = new List<Info>();

        }

        public MySqlCompany(string parameterName, int pageIndex, int pageSize, string bbdd, short? idType) : this()
        {
            ParameterDB = parameterName;
            PageIndex = pageIndex;
            PageSize = pageSize;
            Result.bbdd = bbdd;
            IdType = idType;
        }

  
        #region Properties

        public LexCompany Result { get; set; }

        public List<LexEntity> Data { get; set; }

        public List<ErrorInfo> Errors { get; set; }
        public List<Info> Infos { get; set; }

        public short? IdType { get; set; }

        public int PageIndex { get; set; }

        public int PageSize { get; set; }

        public long? Count { get; set; }

        //private int? IdError { get; set; }

        //private string Error { get; set; }
        private string ParameterDB { get; }

        #endregion Properties

        public void AddData(object DataFromMySql)
        {
            try
            {
                if (DataFromMySql is LexCompany)
                    Result = (LexCompany)DataFromMySql;
                else
                    Infos.Add(new Info() { code = "10", message="No puede obtenerse un LexCompany de los datos obtenidos en Mysql" });

                if (Result.entities is LexEntity[])
                    Data = Result.entities.ToList();
                else
                    Infos.Add(new Info() { code = "11", message = "No puede obtenerse un conjuntos de entidades de los datos obtenidos en Mysql" });

                CompleteData();

                Result.updated = DateTime.Now.Ticks;
            }
            catch (Exception ex)
            {
                Infos.Add(new Info() { code = "12", message = $"Error no controlado al parsear el objeto LexCompany de los datos obtenidos en Mysql + {ex.Message}" });
                //IdError = 101;
                //Error = ex.Message;
            }
        }

        private void CompleteData()
        {

            try
            {
                foreach (var ent in Data)
                {
                    ent.idType = IdType;
                    ent.entityType = IdType != null ? Enum.GetName(typeof(LexonAdjunctionType), IdType) : null;
                }
            }
            catch (Exception ex)
            {

                Infos.Add(new Info() { code = "13", message = $"Error no controlado al completar datos de tipoEntidad en los datos obtenidos en Mysql + {ex.Message}" });

            }
        }

        //public void AddData(object resultado, object[] entities)
        //{
        //    AddData(resultado);
        //    if (entities is IEnumerable<TItems>)
        //        Data = entities as IEnumerable<TItems>;

        //}

        public bool PossibleHasData()
        {
            return (Data != null && Data.Count > 0);
        }

        public void AddOutPutParameters(object idError, object TextError, object Total)
        {
            try
            {
                if (idError is int && (TextError is int || TextError is string))
                    Infos.Add(new Info() { code = idError.ToString(), message = $"MySqlRepository.{ParameterDB} -> {TextError}" });

                if (Total is int)
                    Count = (int?)Total;

                //if (idError is int)
                //    IdError = (int?)idError;

                //if (TextError is int || TextError is string)
                //    Error = TextError.ToString();

                //if (!PossibleHasData())
                //    Errors.Add(new ErrorInfo() { code = IdError.ToString(), member = $"MySqlRepository.{ParameterDB}", message = Error });


            }
            catch (Exception ex)
            {
                Infos.Add(new Info() { code = "14", message = $"Error no controlado al obtener los pàrámetros de salida del Mysql + {ex.Message}" });
            }
        }
        public bool TengoLista()
        {
            return Data?.Count > 0;
        }
    }

}