using Lexon.API.Infrastructure.Exceptions;
using Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using System.Collections.Generic;
using System.Data;

namespace Lexon.Infrastructure.Services
{
    public class LexonBaseClass<T>: BaseClass<T>
    {
        public LexonBaseClass(ILogger<T> logger):base(logger)
        { }

        public void CheckErrorOutParameters(MySqlCommand command, List<ErrorInfo> errors, string idError, string procCaller)
        {
            string codeError = null;
            if (command.Parameters.Contains("P_IDERROR") && command.Parameters["P_IDERROR"].Value != null)
            {
                var idErrorTemp = command.Parameters["P_IDERROR"].Value.ToString();
                if (!string.IsNullOrEmpty(idErrorTemp))
                    codeError = idErrorTemp;
            }
            if (command.Parameters.Contains("P_ERROR") && command.Parameters["P_ERROR"].Value != null)
            {
                var errorTemp = command.Parameters["P_ERROR"].Value.ToString();
                if (!string.IsNullOrEmpty(errorTemp))
                    codeError += $"-{errorTemp}";
            }

            if (codeError != null)
            {
                codeError += $" in {procCaller} - SP[{command.CommandText}]";
                TraceError(errors, new LexonDomainException(codeError), idError, "MYSQL");
            }
        }

        public void AddCommonParameters(string idUser, MySqlCommand command, string nameFilter = "P_FILTER", string filterValue = "{}", bool addParameterId = false)
        {
            command.Parameters.Add(new MySqlParameter(nameFilter, MySqlDbType.String) { Value = filterValue });
            command.Parameters.Add(new MySqlParameter("P_UC", MySqlDbType.Int32) { Value = idUser });
            command.Parameters.Add(new MySqlParameter("P_IDERROR", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
            command.Parameters.Add(new MySqlParameter("P_ERROR", MySqlDbType.String) { Direction = ParameterDirection.Output });
            if (addParameterId)
                command.Parameters.Add(new MySqlParameter("P_ID", MySqlDbType.Int32) { Direction = ParameterDirection.Output });

            command.CommandType = CommandType.StoredProcedure;

            TraceLog(parameters: new string[] { $"SP:{command.CommandText} {nameFilter}='{filterValue}', P_UC={idUser}" });
        }

        public void AddListSearchParameters(int pageSize, int pageIndex, string fieldOrder, string order, MySqlCommand command)
        {
            TraceLog(parameters: new string[] { $"P_PAGE_SIZE:{pageSize} - P_PAGE_NUMBER:{pageIndex} - P_ORDER:{fieldOrder} - P_TYPE_ORDER:{order}" });

            command.Parameters.Add(new MySqlParameter("P_PAGE_SIZE", MySqlDbType.Int32) { Value = pageSize });
            command.Parameters.Add(new MySqlParameter("P_PAGE_NUMBER", MySqlDbType.Int32) { Value = pageIndex });
            command.Parameters.Add(new MySqlParameter("P_TOTAL_REG", MySqlDbType.Int32) { Direction = ParameterDirection.Output });
            if (!string.IsNullOrEmpty(fieldOrder))
                command.Parameters.Add(new MySqlParameter("P_ORDER", MySqlDbType.String) { Value = fieldOrder });
            if (!string.IsNullOrEmpty(order))
                command.Parameters.Add(new MySqlParameter("P_TYPE_ORDER", MySqlDbType.String) { Value = order });
        }

        public int EvaluateErrorCommand(List<ErrorInfo> errors, MySqlCommand command)
        {
            int idError = 0;
            if (command.Parameters["P_IDERROR"].Value is int)
            {
                int.TryParse(command.Parameters["P_IDERROR"].Value.ToString(), out idError);
                //TraceOutputMessage(errors, command.Parameters["P_ERROR"].Value, null, idError);
            }

            return idError;
        }
    }
}