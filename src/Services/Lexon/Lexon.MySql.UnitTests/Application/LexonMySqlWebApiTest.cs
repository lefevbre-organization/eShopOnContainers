using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.IntegrationsEvents.Events;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
//using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Controllers;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;
using ILexonMySqlIdentityService = Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Services.IIdentityService;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Controllers;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql.Infrastructure.Services;
using Lefebvre.eLefebvreOnContainers.Models;
using Microsoft.Extensions.Options;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API;
using System.IO;
using Microsoft.Extensions.Configuration;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.MySql;

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
        public async Task Get_classifications_mail_success()
        {
            //Arrange
            var pageSize = 0;
            var pageIndex = 1;
            short? idType = 1;
            string bbdd = "lexon_admin_02";
            string fakeIdUser = "449";
            string fakeIdMail = "idMail_01";
            var fakeCustomerId = "1";
            var fakeRelationsMail = GetLexonRelationsFake(fakeIdMail);

            _lexonMysqlRepositoryMock.Setup(x => x.SearchRelationsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<short?>(), It.IsAny<string>(), It.IsAny<string>(),It.IsAny<string>()))
                .Returns(Task.FromResult(fakeRelationsMail));
            _lexonMysqlServiceMock.Setup(x => x.GetRelationsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<short?>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.FromResult(fakeRelationsMail));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(fakeCustomerId);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonMySqlController(
                _lexonMysqlServiceMock.Object,
                _lexonMySqlConfig);

            var actionResult = await lexonController.RelationsAsync(pageSize, pageIndex, idType, bbdd, fakeIdUser, fakeIdMail);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.Equal((((ObjectResult)actionResult).Value as Result<JosRelationsList>).data.Uid, fakeIdMail);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<JosRelationsList>).data.Actuaciones);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<JosRelationsList>).errors);
        }


        //[Fact]
        //public async Task Post_customer_basket_success()
        //{
        //    //Arrange
        //    var fakeCustomerId = "1";
        //    var fakeCustomerBasket = GetCustomerBasketFake(fakeCustomerId);

        //    _lexonMysqlRepositoryMock.Setup(x => x.UpdateBasketAsync(It.IsAny<CustomerBasket>()))
        //        .Returns(Task.FromResult(fakeCustomerBasket));
        //    _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(fakeCustomerId);
        //    _serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

        //    //Act
        //    var basketController = new BasketController(
        //        _loggerMock.Object,
        //        _lexonMysqlRepositoryMock.Object,
        //        _identityServiceMock.Object,
        //        _serviceBusMock.Object);

        //    var actionResult = await basketController.UpdateBasketAsync(fakeCustomerBasket);

        //    //Assert
        //    Assert.Equal((actionResult.Result as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
        //    Assert.Equal((((ObjectResult)actionResult.Result).Value as CustomerBasket).BuyerId, fakeCustomerId);
        //}

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

        //private CustomerBasket GetCustomerBasketFake(string fakeCustomerId)
        //{
        //    return new CustomerBasket(fakeCustomerId)
        //    {
        //        Items = new List<BasketItem>()
        //        {
        //            new BasketItem()
        //        }
        //    };
        //}

        private Result<JosRelationsList> GetLexonRelationsFake(string fakeIdMail)
        {
            var resultado = new Result<JosRelationsList>(new JosRelationsList());
            resultado.data.Uid = fakeIdMail;
            resultado.data.Actuaciones = new JosActuation[]
            {
                new JosActuation()
            };
            return resultado;

        }



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
