﻿using Lefebvre.eLefebvreOnContainers.Models;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Controllers;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.IO;
using System.Threading.Tasks;
using Xunit;
using ILexonMySqlIdentityService = Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Services.IIdentityService;
using Lexon.MySql.UnitTests;

namespace UnitTest.Lexon.MySql.Application
{
    public class LexonMySqlWebApiTest
    {
        private readonly Mock<ILexonMySqlRepository> _lexonMysqlRepositoryMock;
        private readonly Mock<ILexonMySqlService> _lexonMysqlServiceMock;
        private readonly Mock<ILexonMySqlIdentityService> _identityServiceMock;
        //private readonly Mock<IEventBus> _serviceBusMock;
        private readonly Mock<ILogger<LexonMySqlController>> _loggerMock;

        private IOptions<LexonMySqlSettings> _lexonMySqlConfig;

        public LexonMySqlWebApiTest()
        {
            _lexonMysqlRepositoryMock = new Mock<ILexonMySqlRepository>();
            _lexonMysqlServiceMock = new Mock<ILexonMySqlService>();
            _identityServiceMock = new Mock<ILexonMySqlIdentityService>();
            //_serviceBusMock = new Mock<IEventBus>();
            _loggerMock = new Mock<ILogger<LexonMySqlController>>();
            _lexonMySqlConfig = new TestLexonMySqlConfigOptions();
        }



        [Fact]
        public async Task Get_user_success()
        {
            //Arrange
            string fakeIdUserNavision = "E1621396";
            Result<JosUser> fakeUserData = Configuration.GetLexonUserFake(fakeIdUserNavision);

            _lexonMysqlRepositoryMock.Setup(x => x.GetUserAsync(fakeIdUserNavision))
                .Returns(Task.FromResult(fakeUserData));
            _lexonMysqlServiceMock.Setup(x => x.GetUserAsync(fakeIdUserNavision))
                .Returns(Task.FromResult(fakeUserData));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);


            //Act
            var lexonController = new LexonMySqlController(
                _lexonMysqlServiceMock.Object,
                _lexonMySqlConfig,
                _identityServiceMock.Object);

            var actionResult = await lexonController.UserAsync(fakeIdUserNavision);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<JosUser>).errors);
            Assert.Equal(449, (((ObjectResult)actionResult).Value as Result<JosUser>).data.IdUser);
        }


        [Fact]
        public async Task Get_classifications_mail_success()
        {
            //Arrange
            var pageSize = 0;
            var pageIndex = 1;
            short? idType = 1;
            string fakeIdMail = "idMail_01";
            var fakeRelationsMail = Configuration.GetLexonRelationsFake(fakeIdMail);

            _lexonMysqlRepositoryMock.Setup(x => x.SearchRelationsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<short?>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.FromResult(fakeRelationsMail));
            _lexonMysqlServiceMock.Setup(x => x.GetRelationsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<short?>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.FromResult(fakeRelationsMail));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonMySqlController(
                _lexonMysqlServiceMock.Object,
                _lexonMySqlConfig,
                _identityServiceMock.Object);

            var actionResult = await lexonController.RelationsAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, fakeIdMail);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.Equal((((ObjectResult)actionResult).Value as Result<JosRelationsList>).data.Uid, fakeIdMail);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<JosRelationsList>).data.Actuaciones);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<JosRelationsList>).errors);
        }

        [Fact]
        public async Task Get_master_entities_success()
        {
            //Arrange
            Result<JosEntityTypeList> fakeMasterEntities = Configuration.GetLexonMasterEntities();

            _lexonMysqlRepositoryMock.Setup(x => x.GetMasterEntitiesAsync())
                .Returns(Task.FromResult(fakeMasterEntities));
            _lexonMysqlServiceMock.Setup(x => x.GetMasterEntitiesAsync())
                .Returns(Task.FromResult(fakeMasterEntities));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonMySqlController(
                _lexonMysqlServiceMock.Object,
                _lexonMySqlConfig,
                _identityServiceMock.Object);

            var actionResult = await lexonController.GetMasterEntitiesAsync();

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<JosEntityTypeList>).data.Entities);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<JosEntityTypeList>).errors);
        }

        [Fact]
        public async Task Get_entities_type_file_nosearch_success()
        {
            //Arrange
            var pageSize = 20;
            var pageIndex = 1;
            short? idType = 1;

            Result<JosEntityList> fakeEntities = Configuration.GetLexonEntitiesList();

            _lexonMysqlRepositoryMock.Setup(x => x.SearchEntitiesAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, null, null))
                .Returns(Task.FromResult(fakeEntities));
            _lexonMysqlServiceMock.Setup(x => x.GetEntitiesAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, null, null))
                .Returns(Task.FromResult(fakeEntities));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonMySqlController(
                _lexonMysqlServiceMock.Object,
                _lexonMySqlConfig,
                _identityServiceMock.Object);

            var actionResult = await lexonController.EntitiesAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, null, null);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<JosEntityList>).data.Entities);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<JosEntityList>).errors);
        }

        [Fact]
        public async Task Get_entities_type_folder_search_success()
        {
            //Arrange
            var pageSize = 20;
            var pageIndex = 1;
            short? idType = 13;
            string search = "ROOT";
            Result<JosEntityList> fakeEntities = Configuration.GetLexonEntitiesList();

            _lexonMysqlRepositoryMock.Setup(x => x.SearchEntitiesAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, search, null))
                .Returns(Task.FromResult(fakeEntities));
            _lexonMysqlServiceMock.Setup(x => x.GetEntitiesAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, search, null))
                .Returns(Task.FromResult(fakeEntities));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonMySqlController(
                _lexonMysqlServiceMock.Object,
                _lexonMySqlConfig,
                _identityServiceMock.Object);

            var actionResult = await lexonController.EntitiesAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, search, null);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<JosEntityList>).data.Entities);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<JosEntityList>).errors);
        }

        [Fact]
        public async Task Get_relations_email_success()
        {
            //Arrange
            var pageSize = 20;
            var pageIndex = 1;
            short? idType = null;
            string fakeIdMail = "mail_13";
            Result<JosRelationsList> fakeRelations = Configuration.GetRelationsFakeFromMail(fakeIdMail);

            _lexonMysqlRepositoryMock.Setup(x => x.SearchRelationsAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, fakeIdMail))
                .Returns(Task.FromResult(fakeRelations));
            _lexonMysqlServiceMock.Setup(x => x.GetRelationsAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, fakeIdMail))
                .Returns(Task.FromResult(fakeRelations));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonMySqlController(
                _lexonMysqlServiceMock.Object,
                _lexonMySqlConfig,
                _identityServiceMock.Object);

            var actionResult = await lexonController.RelationsAsync(pageSize, pageIndex, idType, Configuration.FakeBbdd, Configuration.FakeIdentityUser, fakeIdMail);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<JosRelationsList>).data.Actuaciones);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<JosRelationsList>).errors);
        }

        //[Fact]
        //public async Task Doing_Checkout_Without_Basket_Should_Return_Bad_Request()
        //{
        //    var fakeCustomerId = "2";
        //    _lexonMysqlRepositoryMock.Setup(x => x.GetBasketAsync(It.IsAny<string>()))
        //        .Returns(Task.FromResult((CustomerBasket)null));
        //    _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(fakeCustomerId);

        //    //Act
        //    var basketController = new BasketController(
        //        _loggerMock.Object,
        //        _lexonMysqlRepositoryMock.Object,
        //        _identityServiceMock.Object,
        //        _serviceBusMock.Object);

        //    var result = await basketController.CheckoutAsync(new BasketCheckout(), Guid.NewGuid().ToString()) as BadRequestResult;
        //    Assert.NotNull(result);
        //}

        //[Fact]
        //public async Task Doing_Checkout_Wit_Basket_Should_Publish_UserCheckoutAccepted_Integration_Event()
        //{
        //    var fakeCustomerId = "1";
        //    var fakeCustomerBasket = GetCustomerBasketFake(fakeCustomerId);

        //    _lexonMysqlRepositoryMock.Setup(x => x.GetBasketAsync(It.IsAny<string>()))
        //         .Returns(Task.FromResult(fakeCustomerBasket));

        //    _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(fakeCustomerId);

        //    var basketController = new BasketController(
        //        _loggerMock.Object,
        //        _lexonMysqlRepositoryMock.Object,
        //        _identityServiceMock.Object,
        //        _serviceBusMock.Object);

        //    basketController.ControllerContext = new ControllerContext()
        //    {
        //        HttpContext = new DefaultHttpContext()
        //        {
        //            User = new ClaimsPrincipal(
        //                new ClaimsIdentity(new Claim[] {
        //                    new Claim("sub", "testuser"),
        //                    new Claim("unique_name", "testuser"),
        //                    new Claim(ClaimTypes.Name, "testuser")
        //                     }))
        //        }
        //    };

        //    //Act
        //    var result = await basketController.CheckoutAsync(new BasketCheckout(), Guid.NewGuid().ToString()) as AcceptedResult;

        //    _serviceBusMock.Verify(mock => mock.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()), Times.Once);

        //    Assert.NotNull(result);
        //}



    }

    public class TestLexonMySqlConfigOptions : IOptions<LexonMySqlSettings>
    {
        private static Lazy<LexonMySqlSettings> configuration { get; }

        static TestLexonMySqlConfigOptions()
        {
            configuration = new Lazy<LexonMySqlSettings>(GetConfiguration);
        }

        public LexonMySqlSettings Value
        {
            get { return configuration.Value; }
        }

        private static LexonMySqlSettings GetConfiguration()
        {
            var configuration = new LexonMySqlSettings();
            //var path = Path.Combine("config", "appsettings.development.json");

            //c:\azure-devops\git\eShopOnContainers\src\Services\Lexon\Lexon.MySql\
            new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile("appsettings.Development.json", optional: false, reloadOnChange: true)
                .Build()
                .Bind(configuration);

            //.GetSection(nameof(LexonSettings))
            //.Bind(configuration);

            return configuration;
        }
    }
}