using System;
using System.Collections.Generic;
using System.Linq;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
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

        public List<LexMailActuation> DataActuation { get; set; }

        public List<ErrorInfo> Errors { get; set; }
        public List<Info> Infos { get; set; }

        public short? IdType { get; set; }

        public int PageIndex { get; set; }

        public int PageSize { get; set; }

        public long? Count { get; set; }

        private string ParameterDB { get; }

        #endregion Properties

        public void AddData(object DataFromMySql)
        {
            try
            {
                if (DataFromMySql is LexCompany)
                    Result = (LexCompany)DataFromMySql;
                else
                    Infos.Add(new Info() { code = "510", message = "No puede obtenerse un LexCompany de los datos obtenidos en Mysql" });

                if (Result.entities is LexEntity[])
                    Data = Result.entities.ToList();
                else
                    Infos.Add(new Info() { code = "511", message = "No puede obtenerse un conjuntos de entidades de los datos obtenidos en Mysql" });

                CompleteData();

                Result.updated = DateTime.Now.Ticks;
            }
            catch (Exception ex)
            {
                Infos.Add(new Info() { code = "512", message = $"Error no controlado al parsear el objeto LexCompany de los datos obtenidos en Mysql + {ex.Message}" });
            }
        }

        public void AddRelationsMail(LexMailActuation relationsMail)
        {
            try
            {
                if (relationsMail is LexMailActuation)
                    CompleteDataRelations(relationsMail);
                else
                    Infos.Add(new Info() { code = "511", message = "No puede obtenerse las relaciones del mail de los datos obtenidos en Mysql" });
            }
            catch (Exception ex)
            {
                Infos.Add(new Info() { code = "512", message = $"Error no controlado al parsear el objeto Relaciones de los datos obtenidos en Mysql + {ex.Message}" });
            }
        }

        private void CompleteDataRelations(LexMailActuation relationsMail)
        {
            Result.mailActuations = new LexMailActuation[] { relationsMail };
            DataActuation = Result.mailActuations.ToList();

            foreach (var ent in DataActuation)
            {
                foreach (var act in ent.actuaciones)
                {
                    act.entityType = Enum.GetName(typeof(LexonAdjunctionType), act.TipoRelacion);
                    act.date = act.Fecha;
                    act.name = act.Nombre;
                    act.description = act.Asunto;
                    act.idMail = relationsMail.uid;
                    act.idRelated = act.IdRelacion;
                    act.entityIdType = act.TipoRelacion;
                }
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
                Infos.Add(new Info() { code = "513", message = $"Error no controlado al completar datos de tipoEntidad en los datos obtenidos en Mysql + {ex.Message}" });
            }
        }

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
            }
            catch (Exception ex)
            {
                Infos.Add(new Info() { code = "514", message = $"Error no controlado al obtener los pàrámetros de salida del Mysql + {ex.Message}" });
            }
        }

        public bool TengoLista()
        {
            return Data?.Count > 0;
        }

        public bool TengoActuaciones()
        {
            return DataActuation?.Count > 0;
        }
    }
}