# Containerized Lefebvre - Lexon Service
Lexon containerized application, cross-platform and microservices architecture.

Based in Catalog.API (version date 20190821)


Check procedures on how to get it started at the Wiki:
https://github.com/dotnet/eShopOnContainers/wiki

## Sincronization with upstream

- [X] version 20190821
- [ ] version 20190910 (iteration 5)


## Implementation differences

### References

- Exclude project IntegrationEventLofEF and WebHost.Customization
- [ ] Add Project of IntegrationEventLogMongoDB ( need revision)
- Not implementation nugets of Insights
- In general, keep the version´s nugets libraries of the rest of solutions`s services

### Dockerfile

Only copy de projects in relation with this api

### Program

- Not implement migrations (is a mongodb project)
- Not implement insights (in study)
- Not implement Azure.Vault (temporary)

### Startup

- Refactorize the methods in Extensions/CustomExtensionsMethods.cs
- AddAppInsight (not implemented)
- AddCustomDbContext (not neccessary)
- AddCustomOptions (similar with other class of settings)
- AddIntegrationServices (only add de rabbitmq, thes AzureServiceBus is not implemented)
- [ ] AddEventBus (only add de rabbitmq, thes AzureServiceBus is not implemented, needed test)
- AddSwagger
- [ ] AddCustomHealthCheck (in work)

### Infrastucture

#### ActionResults

Identical

#### Exceptions

Only changue the name

#### Filters

Identical

### ViewModel

Identical, but need review the location Microsoft.eShopOnContainers.Services.Lexon.API.ViewModel

## IntegrationEvents

## Model







