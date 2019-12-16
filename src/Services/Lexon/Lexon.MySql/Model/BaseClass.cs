using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Model
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

        private void WriteError(ErrorInfo errorInfo)
        {
            WriteLine("member name: " + errorInfo.member);
            WriteLine("member name: " + errorInfo.member);
            WriteLine("source file path: " + errorInfo.source);
            WriteLine("source line number: " + errorInfo.line);
        }

        private void WriteLine(string msg)
        {
            log.LogDebug(msg);
            System.Diagnostics.Trace.WriteLine(msg);
        }

        public void TraceLog(
            [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0,
            [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
            [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "",
             params string[] parameters)
        {
            WriteLine($"FILE[{sourceFilePath}]//PROC[{memberName}] : ");
            foreach (var item in parameters)
            {
               WriteLine(item);
            }
        }

        public void TraceOutputMessage(
            List<ErrorInfo> errors,
            object exMessage,
            object codeError = null,
            [System.Runtime.CompilerServices.CallerLineNumber] int sourceLineNumber = 0,
            [System.Runtime.CompilerServices.CallerMemberName] string memberName = "",
            [System.Runtime.CompilerServices.CallerFilePath] string sourceFilePath = "")
        {
            if (codeError == null || !(codeError is int) || (int)codeError == 0 || exMessage == null || !(exMessage is string))
                return;

            var errorInfo = new ErrorInfo
            {
                code = (int)codeError,
                message = (string)exMessage,
                member = memberName,
                source = sourceFilePath,
                line = sourceLineNumber,
            };

            WriteError(errorInfo);
            errors.Add(errorInfo);
        }

        private void TraceMessage(List<ErrorInfo> errors, string v, int value)
        {
            throw new NotImplementedException();
        }
    }
}