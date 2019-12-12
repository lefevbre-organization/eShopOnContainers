FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-buster-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:3.0-buster AS build
WORKDIR /src

COPY "eLefebvreOnContainers-ServicesAndWebApps.sln" "eLefebvreOnContainers-ServicesAndWebApps.sln"

COPY "ApiGateways/ApiGw-Base/OcelotApiGw.csproj" "ApiGateways/ApiGw-Base/OcelotApiGw.csproj"
COPY "BuildingBlocks/Devspaces.Support/Devspaces.Support.csproj" "BuildingBlocks/Devspaces.Support/Devspaces.Support.csproj"
COPY "BuildingBlocks/EventBus/EventBus/EventBus.csproj" "BuildingBlocks/EventBus/EventBus/EventBus.csproj"
COPY "BuildingBlocks/EventBus/EventBus.Tests/EventBus.Tests.csproj" "BuildingBlocks/EventBus/EventBus.Tests/EventBus.Tests.csproj"
COPY "BuildingBlocks/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj" "BuildingBlocks/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj"
COPY "BuildingBlocks/EventBus/EventBusServiceBus/EventBusServiceBus.csproj" "BuildingBlocks/EventBus/EventBusServiceBus/EventBusServiceBus.csproj"
COPY "BuildingBlocks/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj" "BuildingBlocks/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj"
COPY "BuildingBlocks/WebHostCustomization/WebHost.Customization/WebHost.Customization.csproj" "BuildingBlocks/WebHostCustomization/WebHost.Customization/WebHost.Customization.csproj"

# Lefebvre projects
COPY "BuildingBlocks/EventBus/IntegrationEventLogMongoDB/IntegrationEventLogMongoDB.csproj" "BuildingBlocks/EventBus/IntegrationEventLogMongoDB/IntegrationEventLogMongoDB.csproj"
COPY "Services/Account/Account.API/Account.API.csproj" "Services/Account/Account.API/Account.API.csproj"
COPY "Services/Lexon/Lexon.API/Lexon.API.csproj" "Services/Lexon/Lexon.API/Lexon.API.csproj"
COPY "Services/Lexon/Lexon.MySql/Lexon.MySql.csproj" "Services/Lexon/Lexon.MySql/Lexon.MySql.csproj"
COPY "Web/WebGoogleClient/WebGoogleClient.csproj" "Web/WebGoogleClient/WebGoogleClient.csproj"
COPY "Web/WebLexonClient/WebLexonClient.csproj" "Web/WebLexonClient/WebLexonClient.csproj"
COPY "Web/WebOffice365Client/WebOffice365Client.csproj" "Web/WebOffice365Client/WebOffice365Client.csproj"
COPY "Web/WebPortalClient/WebPortalClient.csproj" "Web/WebPortalClient/WebPortalClient.csproj"
COPY "Web/WebImapClient/WebImapClient.csproj" "Web/WebImapClient/WebImapClient.csproj"
COPY "Web/WebStatusLef/WebStatusLef.csproj" "Web/WebStatusLef/WebStatusLef.csproj"

COPY "docker-compose.dcproj" "docker-compose.dcproj"

COPY "NuGet.config" "NuGet.config"

RUN dotnet restore "eLefebvreOnContainers-ServicesAndWebApps.sln"

COPY . .
WORKDIR /src/src/Services/Lexon/Lexon.API
RUN dotnet publish --no-restore -c Release -o /app

#FROM build as unittest
#WORKDIR /src/src/Services/Lexon/Lexon.UnitTests

#FROM build as functionaltest
#WORKDIR /src/src/Services/Lexon/Lexon.FunctionalTests

FROM build AS publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
#RUN ls -lha /app
ENTRYPOINT ["dotnet", "Lexon.API.dll"]
