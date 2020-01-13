using Lefebvre.eLefebvreOnContainers.Models;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Controllers;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Repositories;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.IO;
using System.Threading.Tasks;
using Xunit;
using ILexonAPIIdentityService = Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Infrastructure.Services.IIdentityService;
using Lexon.API.UnitTests;
using Microsoft.eShopOnContainers.BuildingBlocks.EventBus.Abstractions;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.Model;
using System.Collections.Generic;
using Lefebvre.eLefebvreOnContainers.Services.Lexon.API.ViewModel;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace UnitTest.Lexon.API.Application
{
    public class LexonWebApiTest
    {
        private readonly Mock<IUsersRepository> _lexonAPIRepositoryMock;
        private readonly Mock<IUsersService> _lexonAPIServiceMock;
        private readonly Mock<ILexonAPIIdentityService> _identityServiceMock;
        private readonly Mock<IEventBus> _serviceBusMock;
        private readonly Mock<ILogger<LexonController>> _loggerMock;
        private IOptions<LexonSettings> _lexonAPIConfig;

        public LexonWebApiTest()
        {
            _lexonAPIRepositoryMock = new Mock<IUsersRepository>();
            _lexonAPIServiceMock = new Mock<IUsersService>();
            _identityServiceMock = new Mock<ILexonAPIIdentityService>();
            _serviceBusMock = new Mock<IEventBus>();
            _loggerMock = new Mock<ILogger<LexonController>>();
            _lexonAPIConfig = new TestLexonAPIConfigOptions();
        }

        [Fact]
        public async Task Get_user_success()
        {
            //Arrange
            string fakeIdUserNavision = "E1621396";
            Result<LexonUser> fakeUserData = Configuration.GetLexonUserFake(fakeIdUserNavision);

            _lexonAPIRepositoryMock.Setup(x => x.GetAsync(fakeIdUserNavision))
                .Returns(Task.FromResult(fakeUserData));
            _lexonAPIServiceMock.Setup(x => x.GetUserAsync(fakeIdUserNavision))
                .Returns(Task.FromResult(fakeUserData));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);


            //Act
            var lexonController = new LexonController(
                _lexonAPIServiceMock.Object,
                _identityServiceMock.Object,
                _lexonAPIConfig,
                _serviceBusMock.Object);

            var actionResult = await lexonController.UsersAsync(fakeIdUserNavision);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<LexonUser>).errors);
            Assert.Equal(Configuration.FakeIdentityUser, (((ObjectResult)actionResult).Value as Result<LexonUser>).data.Id);
        }

        [Fact]
        public async Task Get_classifications_mail_success()
        {
            //Arrange
            var pageSize = 0;
            var pageIndex = 1;
            short? idType = 1;
            string fakeIdMail = "idMail_01";
            var fakeClassificationSearch = new ClassificationSearch()
            {
                pageIndex = pageIndex,
                pageSize = pageSize,
                bbdd = Configuration.FakeBbdd,
                idFilter = null,
                idMail = fakeIdMail,
                idRelated = 1,
                idType = idType,
                idUser = Configuration.FakeIdentityUser,
                search = null
            };
            Result<List<LexonActuation>> fakeRelationsMail = Configuration.GetLexonRelationsFake(fakeIdMail);

            _lexonAPIRepositoryMock.Setup(x => x.GetClassificationsFromMailAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.FromResult(fakeRelationsMail));
            _lexonAPIServiceMock.Setup(x => x.GetClassificationsFromMailAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<short?>()))
                .Returns(Task.FromResult(fakeRelationsMail));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonController(
                _lexonAPIServiceMock.Object,
                _identityServiceMock.Object,
                _lexonAPIConfig,
                _serviceBusMock.Object);

            var actionResult = await lexonController.ClassificationsAsync(fakeClassificationSearch, Guid.NewGuid().ToString());

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<List<LexonActuation>>).data);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<List<LexonActuation>>).errors);
        }

        [Fact]
        public async Task Get_master_entities_success()
        {
            //Arrange
            Result<List<LexonEntityType>> fakeMasterEntities = Configuration.GetLexonMasterEntities();

            _lexonAPIRepositoryMock.Setup(x => x.GetClassificationMasterListAsync())
                .Returns(Task.FromResult(fakeMasterEntities));
            _lexonAPIServiceMock.Setup(x => x.GetClassificationMasterListAsync())
                .Returns(Task.FromResult(fakeMasterEntities));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonController(
                _lexonAPIServiceMock.Object,
                _identityServiceMock.Object,
                _lexonAPIConfig,
                _serviceBusMock.Object);

            var actionResult = await lexonController.ClassificationsTypesAsync();

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<List<LexonEntityType>>).data);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<List<LexonEntityType>>).errors);
        }

        [Fact]
        public async Task Get_entities_type_file_nosearch_success()
        {
            //Arrange
            short? idType = 1;
            var fakeClassificationSearch = new ClassificationSearch()
            {
                pageIndex = Configuration.FakePageIndex,
                pageSize = Configuration.FakePageSizeAll,
                bbdd = Configuration.FakeBbdd,
                idFilter = null,
                idMail = null,
                idRelated = 1,
                idType = idType,
                idUser = Configuration.FakeIdentityUser,
                search = null
            };

            Result<List<LexonEntityBase>> fakeEntities = Configuration.GetLexonEntitiesList();

            _lexonAPIRepositoryMock.Setup(x => x.GetEntitiesListAsync(Configuration.FakePageSize, Configuration.FakePageIndex, idType, Configuration.FakeIdentityUser, Configuration.FakeBbdd, null))
                .Returns(Task.FromResult(fakeEntities));
            _lexonAPIServiceMock.Setup(x => x.GetEntitiesListAsync(Configuration.FakePageSize, Configuration.FakePageIndex, idType, Configuration.FakeIdentityUser, Configuration.FakeBbdd, null, null))
                .Returns(Task.FromResult(fakeEntities));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonController(
                _lexonAPIServiceMock.Object,
                _identityServiceMock.Object,
                _lexonAPIConfig,
                _serviceBusMock.Object);

            var actionResult = await lexonController.EntitiesAsync(fakeClassificationSearch);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<List<LexonEntityBase>>).data);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<List<LexonEntityBase>>).errors);
        }

        [Fact]
        public async Task Get_entities_type_folder_search_success()
        {
            //Arrange
            short? idType = 13;
            string search = "ROOT";
            var fakeClassificationSearch = new ClassificationSearch()
            {
                pageIndex = Configuration.FakePageIndex,
                pageSize = Configuration.FakePageSizeAll,
                bbdd = Configuration.FakeBbdd,
                idFilter = null,
                idMail = null,
                idRelated = 1,
                idType = idType,
                idUser = Configuration.FakeIdentityUser,
                search = search
            };
            Result<List<LexonEntityBase>> fakeEntities = Configuration.GetLexonEntitiesList();

            _lexonAPIRepositoryMock.Setup(x => x.GetEntitiesListAsync(Configuration.FakePageSize, Configuration.FakePageIndex, idType, Configuration.FakeIdentityUser, Configuration.FakeBbdd, search))
                .Returns(Task.FromResult(fakeEntities));
            _lexonAPIServiceMock.Setup(x => x.GetEntitiesListAsync(Configuration.FakePageSize, Configuration.FakePageIndex, idType, Configuration.FakeIdentityUser, Configuration.FakeBbdd, search, null))
                .Returns(Task.FromResult(fakeEntities));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonController(
                _lexonAPIServiceMock.Object,
                _identityServiceMock.Object,
                _lexonAPIConfig,
                _serviceBusMock.Object);

            var actionResult = await lexonController.EntitiesAsync(fakeClassificationSearch);

            //Assert
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<List<LexonEntityBase>>).data);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<List<LexonEntityBase>>).errors);
        }

        //[Fact]
        //public async Task Get_entities_type_folder_paginated_search_success()
        //{
        //    //Arrange
        //    short? idType = 13;
        //    string search = "ROOT";
        //    var fakeClassificationSearch = new ClassificationSearch()
        //    {
        //        pageIndex = Configuration.FakePageIndex,
        //        pageSize = Configuration.FakePageSize,
        //        bbdd = Configuration.FakeBbdd,
        //        idFilter = null,
        //        idMail = null,
        //        idRelated = 1,
        //        idType = idType,
        //        idUser = Configuration.FakeIdentityUser,
        //        search = search
        //    };
        //    Result<List<LexonEntityBase>> fakeEntities = Configuration.GetLexonEntitiesList();
        //    var totalItems = fakeClassificationSearch.pageIndex * fakeClassificationSearch.pageSize;
        //    Result<PaginatedItemsViewModel<LexonEntityBase>> fakeEntitiesPaginated = new Result<PaginatedItemsViewModel<LexonEntityBase>>(new PaginatedItemsViewModel<LexonEntityBase>(fakeClassificationSearch.pageIndex, fakeClassificationSearch.pageSize, totalItems, fakeEntities.data), fakeEntities.errors);


        //    _lexonAPIRepositoryMock.Setup(x => x.GetEntitiesListAsync(Configuration.FakePageSize, Configuration.FakePageIndex, idType, Configuration.FakeIdentityUser, Configuration.FakeBbdd, search))
        //        .Returns(Task.FromResult(fakeEntitiesPaginated));
        //    _lexonAPIServiceMock.Setup(x => x.GetEntitiesListAsync(Configuration.FakePageSize, Configuration.FakePageIndex, idType, Configuration.FakeIdentityUser, Configuration.FakeBbdd, search, null))
        //        .Returns(Task.FromResult(fakeEntitiesPaginated));
        //    _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

        //    //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

        //    //Act
        //    var lexonController = new LexonController(
        //        _lexonAPIServiceMock.Object,
        //        _identityServiceMock.Object,
        //        _lexonAPIConfig,
        //        _serviceBusMock.Object);

        //    var actionResult = await lexonController.EntitiesAsync(fakeClassificationSearch);

        //    //Assert
        //    Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
        //    Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<List<LexonEntityBase>>).data);
        //    Assert.Empty((((ObjectResult)actionResult).Value as Result<List<LexonEntityBase>>).errors);
        //}

        [Fact]
        public async Task Get_relations_email_success()
        {
            //Arrange
            short? idType = null;
            string fakeIdMail = "mail_13";
            //string fakeHeader = "dddd";
            var fakeClassificationSearch = new ClassificationSearch()
            {
                pageIndex = Configuration.FakePageIndex,
                pageSize = Configuration.FakePageSize,
                bbdd = Configuration.FakeBbdd,
                idFilter = null,
                idMail = fakeIdMail,
                idRelated = 1,
                idType = idType,
                idUser = Configuration.FakeIdentityUser,
                search = null
            };

            Result<List<LexonActuation>> fakeRelations = Configuration.GetRelationsFakeFromMail(fakeIdMail);

            _lexonAPIRepositoryMock.Setup(x => x.GetClassificationsFromMailAsync(Configuration.FakePageSize, Configuration.FakePageIndex, Configuration.FakeIdentityUser, Configuration.FakeBbdd, fakeIdMail))
                .Returns(Task.FromResult(fakeRelations));
            _lexonAPIServiceMock.Setup(x => x.GetClassificationsFromMailAsync(Configuration.FakePageSize, Configuration.FakePageIndex, Configuration.FakeIdentityUser, Configuration.FakeBbdd, fakeIdMail, idType))
                .Returns(Task.FromResult(fakeRelations));
            _identityServiceMock.Setup(x => x.GetUserIdentity()).Returns(Configuration.FakeIdentityUser);

            //_serviceBusMock.Setup(x => x.Publish(It.IsAny<UserCheckoutAcceptedIntegrationEvent>()));

            //Act
            var lexonController = new LexonController(
                _lexonAPIServiceMock.Object,
                _identityServiceMock.Object,
                _lexonAPIConfig,
                _serviceBusMock.Object);

            lexonController.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext()
                {
                    User = new ClaimsPrincipal(
                        new ClaimsIdentity(new Claim[] {
                            new Claim("sub", "testuser"),
                            new Claim("unique_name", "testuser"),
                            new Claim(ClaimTypes.Name, "testuser")
                    }))
                }
            };

            //Act

            var actionResult = await lexonController.ClassificationsAsync(fakeClassificationSearch, Guid.NewGuid().ToString());

            // var actionResult = await lexonController.ClassificationsAsync(fakeClassificationSearch, Guid.NewGuid().ToString()) as AcceptedResult;

            //Assert
            // Assert.NotNull(actionResult);
            Assert.Equal((actionResult as OkObjectResult).StatusCode, (int)System.Net.HttpStatusCode.OK);
            Assert.NotEmpty((((ObjectResult)actionResult).Value as Result<List<LexonActuation>>).data);
            Assert.Empty((((ObjectResult)actionResult).Value as Result<List<LexonActuation>>).errors);
        }





    }

    public class TestLexonAPIConfigOptions : IOptions<LexonSettings>
    {
        private static Lazy<LexonSettings> configuration { get; }

        static TestLexonAPIConfigOptions()
        {
            configuration = new Lazy<LexonSettings>(GetConfiguration);
        }

        public LexonSettings Value
        {
            get { return configuration.Value; }
        }

        private static LexonSettings GetConfiguration()
        {
            var configuration = new LexonSettings();

            new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile("appsettings.Development.json", optional: false, reloadOnChange: true)
                .Build()
                .Bind(configuration);

            return configuration;
        }

    }
}