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
    public class LexonControllerClassificationsTest : LexonControllerTest
    {
        [Fact]
        public async Task Get_Classifications_User_Success()
        {
            //Arrange
            _svcMock.Setup(svc => svc.GetClassificationListAsync
            (
                It.Is<int>(y => y == fakeData.Ok.pageSize),
                It.IsAny<int>(),
                It.Is<string>(y => y == fakeData.Ok.userFilter)

            ))
            .ReturnsAsync(GetFakeClassifications());
            var expectedResultCount = 3;

            //Act
            var result = await _controller.ClassificationsAsync(fakeData.Ok.pageSize, fakeData.Ok.pageIndex, fakeData.Ok.userFilter);

            //Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var classifications = okResult.Value.Should().BeAssignableTo<IEnumerable<LexonClassification>>().Subject;
            classifications.Count().Should().Be(expectedResultCount);
            //var viewResult = Assert.IsType<LexonClassification>(result);
        }
    }
}