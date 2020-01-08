FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-buster-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.0-buster AS build
WORKDIR /src

COPY "eLefebvreOnContainers-ServicesAndWebApps.sln" "eLefebvreOnContainers-ServicesAndWebApps.sln"

COPY "ApiGateways/ApiGw-Base/OcelotApiGw.csproj" "ApiGateways/ApiGw-Base/OcelotApiGw.csproj"
COPY "ApiGateways/Web.Bff.Lexon/aggregator/Web.Lexon.HttpAggregator/Web.Lexon.HttpAggregator.csproj" "ApiGateways/Web.Bff.Lexon/aggregator/Web.Lexon.HttpAggregator/Web.Lexon.HttpAggregator.csproj"
COPY "ApiGateways/Web.Bff.Shopping/aggregator/Web.Shopping.HttpAggregator.csproj" "ApiGateways/Web.Bff.Shopping/aggregator/Web.Shopping.HttpAggregator.csproj"
COPY "BuildingBlocks/Devspaces.Support/Devspaces.Support.csproj" "BuildingBlocks/Devspaces.Support/Devspaces.Support.csproj"
COPY "BuildingBlocks/EventBus/EventBus/EventBus.csproj" "BuildingBlocks/EventBus/EventBus/EventBus.csproj"
COPY "BuildingBlocks/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj" "BuildingBlocks/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj"
COPY "BuildingBlocks/EventBus/EventBusServiceBus/EventBusServiceBus.csproj" "BuildingBlocks/EventBus/EventBusServiceBus/EventBusServiceBus.csproj"
COPY "BuildingBlocks/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj" "BuildingBlocks/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj"
COPY "BuildingBlocks/EventBus/IntegrationEventLogMongoDB/IntegrationEventLogMongoDB.csproj" "BuildingBlocks/EventBus/IntegrationEventLogMongoDB/IntegrationEventLogMongoDB.csproj"
COPY "BuildingBlocks/Models/Lefebvre.Models/Lefebvre.Models.csproj" "BuildingBlocks/Models/Lefebvre.Models/Lefebvre.Models.csproj"
COPY "BuildingBlocks/WebHostCustomization/WebHost.Customization/WebHost.Customization.csproj" "BuildingBlocks/WebHostCustomization/WebHost.Customization/WebHost.Customization.csproj"
COPY "Services/Account/Account.API/Account.API.csproj" "Services/Account/Account.API/Account.API.csproj"
COPY "Services/Basket/Basket.API/Basket.API.csproj" "Services/Basket/Basket.API/Basket.API.csproj"
COPY "Services/Basket/Basket.FunctionalTests/Basket.FunctionalTests.csproj" "Services/Basket/Basket.FunctionalTests/Basket.FunctionalTests.csproj"
COPY "Services/Basket/Basket.UnitTests/Basket.UnitTests.csproj" "Services/Basket/Basket.UnitTests/Basket.UnitTests.csproj"
COPY "Services/Catalog/Catalog.API/Catalog.API.csproj" "Services/Catalog/Catalog.API/Catalog.API.csproj"
COPY "Services/Catalog/Catalog.FunctionalTests/Catalog.FunctionalTests.csproj" "Services/Catalog/Catalog.FunctionalTests/Catalog.FunctionalTests.csproj"
COPY "Services/Catalog/Catalog.UnitTests/Catalog.UnitTests.csproj" "Services/Catalog/Catalog.UnitTests/Catalog.UnitTests.csproj"
COPY "Services/Identity/Identity.API/Identity.API.csproj" "Services/Identity/Identity.API/Identity.API.csproj"
COPY "Services/Lexon/Lexon.API/Lexon.API.csproj" "Services/Lexon/Lexon.API/Lexon.API.csproj"
COPY "Services/Lexon/Lexon.MySql.UnitTests/Lexon.MySql.UnitTests.csproj" "Services/Lexon/Lexon.MySql.UnitTests/Lexon.MySql.UnitTests.csproj"
COPY "Services/Lexon/Lexon.MySql/Lexon.MySql.csproj" "Services/Lexon/Lexon.MySql/Lexon.MySql.csproj"
COPY "Services/Location/Locations.API/Locations.API.csproj" "Services/Location/Locations.API/Locations.API.csproj"
COPY "Services/Location/Locations.FunctionalTests/Locations.FunctionalTests.csproj" "Services/Location/Locations.FunctionalTests/Locations.FunctionalTests.csproj"
COPY "Services/Ordering/Ordering.API/Ordering.API.csproj" "Services/Ordering/Ordering.API/Ordering.API.csproj"
COPY "Services/Ordering/Ordering.BackgroundTasks/Ordering.BackgroundTasks.csproj" "Services/Ordering/Ordering.BackgroundTasks/Ordering.BackgroundTasks.csproj"
COPY "Services/Ordering/Ordering.Domain/Ordering.Domain.csproj" "Services/Ordering/Ordering.Domain/Ordering.Domain.csproj"
COPY "Services/Ordering/Ordering.FunctionalTests/Ordering.FunctionalTests.csproj" "Services/Ordering/Ordering.FunctionalTests/Ordering.FunctionalTests.csproj"
COPY "Services/Ordering/Ordering.Infrastructure/Ordering.Infrastructure.csproj" "Services/Ordering/Ordering.Infrastructure/Ordering.Infrastructure.csproj"
COPY "Services/Ordering/Ordering.SignalrHub/Ordering.SignalrHub.csproj" "Services/Ordering/Ordering.SignalrHub/Ordering.SignalrHub.csproj"
COPY "Services/Ordering/Ordering.UnitTests/Ordering.UnitTests.csproj" "Services/Ordering/Ordering.UnitTests/Ordering.UnitTests.csproj"
COPY "Services/Webhooks/Webhooks.API/Webhooks.API.csproj" "Services/Webhooks/Webhooks.API/Webhooks.API.csproj"
COPY "Tests/Services/Application.FunctionalTests/Application.FunctionalTests.csproj" "Tests/Services/Application.FunctionalTests/Application.FunctionalTests.csproj"
COPY "Web/WebGoogleClient/WebGoogleClient.csproj" "Web/WebGoogleClient/WebGoogleClient.csproj"
COPY "Web/WebhookClient/WebhookClient.csproj" "Web/WebhookClient/WebhookClient.csproj"
COPY "Web/WebImapClient/WebImapClient.csproj" "Web/WebImapClient/WebImapClient.csproj"
COPY "Web/WebLexonClient/WebLexonClient.csproj" "Web/WebLexonClient/WebLexonClient.csproj"
COPY "Web/WebMVC/WebMVC.csproj" "Web/WebMVC/WebMVC.csproj"
COPY "Web/WebOffice365Client/WebOffice365Client.csproj" "Web/WebOffice365Client/WebOffice365Client.csproj"
COPY "Web/WebPortalClient/WebPortalClient.csproj" "Web/WebPortalClient/WebPortalClient.csproj"
COPY "Web/WebSPA/WebSPA.csproj" "Web/WebSPA/WebSPA.csproj"
COPY "Web/WebStatusLef/WebStatusLef.csproj" "Web/WebStatusLef/WebStatusLef.csproj"

COPY "docker-compose.dcproj" "docker-compose.dcproj"

COPY "NuGet.config" "NuGet.config"

RUN dotnet restore "eLefebvreOnContainers-ServicesAndWebApps.sln"
COPY . .
WORKDIR /src/Web/WebStatusLef
RUN dotnet publish --no-restore -c Release -o /app

FROM build AS publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "WebStatusLef.dll"]

