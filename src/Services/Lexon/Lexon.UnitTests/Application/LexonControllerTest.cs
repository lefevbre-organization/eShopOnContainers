using Lexon.API;
using Lexon.API.Controllers;
using Lexon.API.Model;
using Lexon.Infrastructure.Services;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using System.Collections.Generic;

namespace Lexon.UnitTests
{
    public class LexonControllerTest
    {
        internal readonly Mock<IUsersService> _svcMock;
        internal readonly LexonController _controller;
        internal readonly Mock<IOptionsSnapshot<LexonSettings>> _lexonSettings;
        internal readonly Mock<IEventBus> _eventBus;

        internal static class fakeData
        {
            internal static class Ok
            {
                internal const string userFilter = "111";
                internal const int pageSize = 10;
                internal const int pageIndex = 0;
            }

            internal static class Wrong
            {
                internal const string userFilter = "999";
                internal const int pageSize = -9;
                internal const int pageIndex = -3;
            }
        }

        public LexonControllerTest()
        {
            _svcMock = new Mock<IUsersService>();
            _lexonSettings = new Mock<IOptionsSnapshot<LexonSettings>>();
            _eventBus = new Mock<IEventBus>();
            _controller = new LexonController(_svcMock.Object, _lexonSettings.Object, _eventBus.Object);
        }

        internal static List<LexonCompany> GetFakeCompanies()
        {
            return new List<LexonCompany>()
                {
                    new LexonCompany()
                    {
                        Name = "Fantasia SA",
                        IdCompany = 201,
                        Logo = "http://url/magic.png"
                    },
                    new LexonCompany()
                    {
                        Name = "Terminator SL",
                        IdCompany = 203,
                        Logo = "http://url/terminatorImage.png"
                    },
                    new LexonCompany()
                    {
                        Name = "Armaggedon SA",
                        IdCompany = 204,
                        Logo = "http://url/boom.png"
                    },
                };
        }

        internal static List<LexonClassification> GetFakeClassifications()
        {
            return new List<LexonClassification>()
                {
                    new LexonClassification()
                    {
                        IdClassification = 12,
                        IdMail="sdasdasdasdasd",
                        IdRelated = 201
                    },
                    new LexonClassification()
                    {
                        IdClassification = 13,
                        IdMail="sdasdasdasasdasdasdasddasdasd",
                        IdRelated = 202
                    },
                    new LexonClassification()
                    {
                        IdClassification = 14,
                        IdMail="sdasdasdasdasdcxzxzcxzcxzcxzc",
                        IdRelated = 203
                    },
                };
        }
    }
}