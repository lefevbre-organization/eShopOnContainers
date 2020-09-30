﻿using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Text;

namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public class BaseClass<T>
    {
        internal readonly ILogger<T> log;
            
        public BaseClass(
            ILogger<T> logger)
        {
            log = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public string RemoveProblematicChars(string inputString)
        {
            // string inputString = "Räksmörgås";

            Encoding iso = Encoding.GetEncoding(
                "ISO-8859-1",
                new EncoderReplacementFallback(string.Empty),
                new DecoderExceptionFallback()
                );

            string latinText = iso.GetString(
                Encoding.Convert(
                    Encoding.UTF8,
                    iso,
                    Encoding.UTF8.GetBytes(inputString)
                )
            );
            return latinText;
        }

        public void TraceRepositoryError(
            List<ErrorInfo> errors,
            Exception ex,
            string codeError = "XX00",
            string areaError = "MONGO",
            [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0,
            [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
            [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "")
        {
            if (codeError == "XX00") return;

            var errorInfo = new ErrorInfo
            {
                area = areaError,
                code = codeError,
                message = ex.Message,
                member = memberName,
                source = sourceFilePath,
                line = sourceLineNumber,
                detail = ex.StackTrace
            };

            WriteError(errorInfo);
            errors.Add(errorInfo);
        }

        private void WriteError(ErrorInfo errorInfo)
        {
            WriteLine($"origin: {errorInfo.member}[{errorInfo.line}]-> error: {errorInfo.detail}");
        }

        public void WriteLine(string msg)
        {
            log.LogDebug(msg);
            System.Diagnostics.Trace.WriteLine(msg);
        }

        public void WriteError(string msg)
        {
            log.LogError(msg);
            System.Diagnostics.Trace.WriteLine(msg);
        }

        public void TraceLog(
            [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0,
            [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
            [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "",
             params string[] parameters)
        {
            var builder = new StringBuilder();
            builder.AppendLine($"FILE[{sourceFilePath}]//PROC[{memberName}] : ");
            foreach (var item in parameters)
            {
                builder.Append($"{item} ");
            }
            WriteLine(builder.ToString());
        }

        //public Exception GetInfoErrorFromParameters(object codeError, object valueError)
        //{
        //    if (codeError == null || exMessage == null || !(exMessage is string))
        //        return;
        //}

        public void TraceOutputMessage(
            List<ErrorInfo> errors,
            object exMessage,
            string detailError = null,
            object codeError = null,
            [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0,
            [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
            [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "")
        {
            //if (codeError == null || !(codeError is int) || (int)codeError == 0 || exMessage == null || !(exMessage is string))
            //    return;
            if (codeError == null || exMessage == null || !(exMessage is string))
                return;

            var errorInfo = new ErrorInfo
            {
                code = codeError.ToString(),
                message = (string)exMessage,
                member = memberName,
                source = sourceFilePath,
                line = sourceLineNumber,
                detail = detailError
            };

            WriteError(errorInfo);
            errors.Add(errorInfo);
        }

        public int GetIntOutputParameter(object outputData)
        {
            if (outputData == null || !(outputData is int))
                return 0;

            return (int)outputData;
        }

        public void TraceInfo(
            List<Info> infos,
            string message,
            string codeInfo = "XX00")
        {
            if (codeInfo == "XX00") return;

            var info = new Info
            {
                code = codeInfo,
                message = message
            };

            infos.Add(info);
        }

        public string ManageCreateMessage(
            string msgError,
            string msgModify,
            string msgInsert,
            List<Info> infos,
            List<ErrorInfo> errors,
            ReplaceOneResult resultReplace)
        {
            if (resultReplace.IsAcknowledged)
            {
                if (resultReplace.MatchedCount > 0 && resultReplace.ModifiedCount > 0)
                {
                    TraceInfo(infos, msgModify);
                }
                else if (resultReplace.MatchedCount == 0 && resultReplace.IsModifiedCountAvailable && resultReplace.ModifiedCount == 0)
                {
                    TraceInfo(infos, msgInsert);
                    return resultReplace.UpsertedId.ToString();
                }
            }
            else
            {
                TraceRepositoryError(errors, new Exception(msgError), "CreateRawError");
            }
            return null;
        }
        public static UpdateOptions GetUpsertOptions()
        {
            return new UpdateOptions { IsUpsert = true };
        }
    }
}