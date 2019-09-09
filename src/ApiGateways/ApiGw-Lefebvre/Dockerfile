FROM mcr.microsoft.com/dotnet/core/aspnet:2.2 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/core/sdk:2.2 AS build
WORKDIR /src

# Keep the project list and command dotnet restore identical in all Dockfiles to maximize image cache utilization
COPY eLefebvreOnContainers-Main.sln .
COPY docker-compose.dcproj /src/
COPY src/ApiGateways/ApiGw-Lefebvre/ApiGw-Lefebvre.csproj src/ApiGateways/ApiGw-Lefebvre/
COPY src/ApiGateways/ApiGw-Base/OcelotApiGw.csproj src/ApiGateways/ApiGw-Base/
COPY src/ApiGateways/ApiGw-EmailUserAccount/ApiGw-EmailUserAccount.csproj src/ApiGateways/ApiGw-EmailUserAccount/
COPY src/ApiGateways/ApiGw-Lexon/ApiGw-Lexon.csproj src/ApiGateways/ApiGw-Lexon/
COPY src/BuildingBlocks/Devspaces.Support/Devspaces.Support.csproj src/BuildingBlocks/Devspaces.Support/
COPY src/BuildingBlocks/EventBus/EventBus/EventBus.csproj src/BuildingBlocks/EventBus/EventBus/
#COPY src/BuildingBlocks/EventBus/EventBus.Tests/EventBus.Tests.csproj src/BuildingBlocks/EventBus/EventBus.Tests/
COPY src/BuildingBlocks/EventBus/EventBusRabbitMQ/EventBusRabbitMQ.csproj src/BuildingBlocks/EventBus/EventBusRabbitMQ/
COPY src/BuildingBlocks/EventBus/EventBusServiceBus/EventBusServiceBus.csproj src/BuildingBlocks/EventBus/EventBusServiceBus/
#COPY src/BuildingBlocks/EventBus/IntegrationEventLogEF/IntegrationEventLogEF.csproj src/BuildingBlocks/EventBus/IntegrationEventLogEF/
COPY src/BuildingBlocks/EventBus/IntegrationEventLogMongoDB/IntegrationEventLogMongoDB.csproj src/BuildingBlocks/EventBus/IntegrationEventLogMongoDB/
COPY src/BuildingBlocks/WebHostCustomization/WebHost.Customization/WebHost.Customization.csproj src/BuildingBlocks/WebHostCustomization/WebHost.Customization/
COPY src/Services/Lexon/Lexon.API/Lexon.API.csproj src/Services/Lexon/Lexon.API/
COPY src/Services/Lexon/Lexon.FunctionalTests/Lexon.FunctionalTests.csproj src/Services/Lexon/Lexon.FunctionalTests/
COPY src/Services/EmailUserAccount/EmailUserAccount.API/EmailUserAccount.API.csproj src/Services/EmailUserAccount/EmailUserAccount.API/
COPY src/Web/WebStatus/WebStatus.csproj src/Web/WebStatus/
COPY src/Web/RootApp/RootApp.njsproj src/Web/RootApp/
COPY src/Web/WebInbox-Google/WebInbox-Google.njsproj src/Web/WebInbox-Google/
COPY src/Web/WebInbox-ImapSmtp/WebInbox-ImapSmtp.njsproj src/Web/WebInbox-ImapSmtp/
COPY src/Web/WebInbox-Graph/WebInbox-Graph.njsproj src/Web/WebInbox-Graph/
COPY src/Web/MF-LexonConn/MF-LexonConn.njsproj src/Web/MF-LexonConn/
#COPY test/ServicesTests/Application.FunctionalTests/Application.FunctionalTests.csproj test/ServicesTests/Application.FunctionalTests/
#COPY test/ServicesTests/LoadTest/LoadTest.csproj test/ServicesTests/LoadTest/

RUN dotnet restore eLefebvreOnContainers-Main.sln

COPY . .
WORKDIR /src/src/ApiGateways/ApiGw-Lefebvre/
RUN dotnet publish --no-restore -c Release -o /app

FROM build AS publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "ApiGw-Lefebvre.dll"]
