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

namespace UnitTest.Lexon.MySql.Application
{
    public class LexonMySqlWebApiTest
    {
        private readonly Mock<ILexonMySqlRepository> _lexonMysqlRepositoryMock;
        private readonly Mock<ILexonMySqlService> _lexonMysqlServiceMock;
        private readonly Mock<ILexonMySqlIdentityService> _identityServiceMock;
        //private readonly Mock<IEventBus> _serviceBusMock;
        private readonly Mock<ILogger<LexonMySqlController>> _loggerMock;

        public LexonMySqlWebApiTest()
        {
            _lexonMysqlRepositoryMock = new Mock<ILexonMySqlRepository>();
            _lexonMysqlServiceMock = new Mock<ILexonMySqlService>();
            _identityServiceMock = new Mock<ILexonMySqlIdentityService>();
            //_serviceBusMock = new Mock<IEventBus>();
            _loggerMock = new Mock<ILogger<LexonMySqlController>>();
        }

        [Fact]
        public async Task Get_classifications_mail_success()
        {
            //Arrange
            var pageSize = 0;
            var pageIndex = 1;
            short? idType = 1;
            string bbdd = "lexon_admin_02";
            string idUser = "449";
            string idMail = "idMail_01";
            var fakeCustomerId = "1";
            var fakeCustomerBasket = GetLexonRelationsFake(fakeCustomerId);

            //_lexonMysqlRepositoryMock.Setup(x => x.SearchRelationsAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<short?>(), It.IsAny<string>(), It.IsAny<string>(),It.IsAny<string>()))
            //    .Returns(Task.FromResult(fakeCustomerBasket));
            //_identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(fakeCustomerId);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            //var basketController = new LexonMySqlController(
            //    _loggerMock.Object,
            //    _lexonMysqlRepositoryMock.Object,
            //    _identityServiceMock.Object,
            //    _serviceBusMock.Object);

            //var actionResult = await basketController.GetBasketByIdAsync(fakeCustomerId);

            //Assert
            //Assert.Equal((actionResult.Result as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            //Assert.Equal((((ObjectResult)actionResult.Result).Value as CustomerBasket).BuyerId, fakeCustomerId);
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

        private Result<JosRelationsList> GetLexonRelationsFake(string fakeCustomerId)
        {
            return new Result<JosRelationsList>();
            //{
            //    Items = new List<BasketItem>()
            //        {
            //            new BasketItem()
            //        }
            //};
        }

    }
}
