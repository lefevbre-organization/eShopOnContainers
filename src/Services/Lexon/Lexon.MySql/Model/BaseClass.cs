using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace Lexon.MySql.Model
{
    public class BaseClass<T>
    {
        internal readonly ILogger<T> log;

        public BaseClass(
            ILogger<T> logger)
        {
            log = logger ?? throw new ArgumentNullException(nameof(logger)); ;
        }

        public void TraceMessage(
            List<ErrorInfo> errors,
            Exception ex,
            int codeError = 1000,
            [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0,
            [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
            [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "")
        {
            if (codeError == 0) return;

            var errorInfo = new ErrorInfo
            {
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

        private static void WriteError(ErrorInfo errorInfo)
        {
            System.Diagnostics.Trace.WriteLine("message: " + errorInfo.message);
            System.Diagnostics.Trace.WriteLine("member name: " + errorInfo.member);
            System.Diagnostics.Trace.WriteLine("source file path: " + errorInfo.source);
            System.Diagnostics.Trace.WriteLine("source line number: " + errorInfo.line);
        }

        public void TraceLog(
            [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0,
            [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
            [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "",
             params string[] parameters)
        {
            var traza = $"FILE[{sourceFilePath}]-PROC[{memberName}] : ";
            foreach (var item in parameters)
            {
                traza += item;
            }
            System.Diagnostics.Trace.WriteLine(traza);
            log.LogDebug(traza);
        }

        public void TraceMessage(
            List<ErrorInfo> errors,
            string ex,
            int codeError = 1000,
            [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0,
            [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
            [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "")
        {
            if (codeError == 0) return;

            var errorInfo = new ErrorInfo
            {
                code = codeError,
                message = ex,
                member = memberName,
                source = sourceFilePath,
                line = sourceLineNumber,
            };

            WriteError(errorInfo);
            errors.Add(errorInfo);
        }
    }
}