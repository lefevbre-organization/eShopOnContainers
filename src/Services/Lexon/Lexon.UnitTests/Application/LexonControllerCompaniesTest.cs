using FluentAssertions;
using Lexon.API.Model;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Lexon.UnitTests
{
    public class LexonControllerCompaniesTest : LexonControllerTest
    {
        [Fact]
        public async Task Get_Companies_User_Success()
        {
            //Arrange
            _svcMock.Setup(svc => svc.GetCompaniesbyUserAsync
            (
                It.Is<int>(y => y == fakeData.Ok.pageSize),
                It.IsAny<int>(),
                It.Is<string>(y => y == fakeData.Ok.userFilter)

            ))
            .ReturnsAsync(GetFakeCompanies());
            var expectedResultCount = 3;

            //Act
            var result = await _controller.CompaniesAsync(fakeData.Ok.pageSize, fakeData.Ok.pageIndex, fakeData.Ok.userFilter);

            //Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var classifications = okResult.Value.Should().BeAssignableTo<IEnumerable<LexonCompany>>().Subject;
            classifications.Count().Should().Be(expectedResultCount);
            //var viewResult = Assert.IsType<LexonClassification>(result);
        }

        [Fact]
        public async Task Get_Companies_User_WrongIdUser()
        {
            //Arrange
            _svcMock.Setup(svc => svc.GetCompaniesbyUserAsync
            (
                It.Is<int>(y => y == fakeData.Ok.pageSize),
                It.IsAny<int>(),
                It.Is<string>(y => y == fakeData.Wrong.userFilter)

            ))
            .ReturnsAsync(GetFakeCompanies());
            var expectedResultCount = 3;

            //Act
            var result = await _controller.CompaniesAsync(fakeData.Ok.pageSize, fakeData.Ok.pageIndex, fakeData.Wrong.userFilter);

            //Assert
            var wrongResult = result.Should().BeOfType<BadRequestResult>().Subject;

            //var responseString = await response.Content.ReadAsStringAsync();
            //responseString.Should().Contain("The Email field is required")
            //  .And.Contain("The LastName field is required")
            //  .And.Contain("The Phone field is required");
        }
    }
}