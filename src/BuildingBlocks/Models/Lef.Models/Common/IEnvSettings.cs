﻿namespace Microsoft.eShopOnContainers.BuildingBlocks.Lefebvre.Models
{
    public interface IEnvSettings
    {
        string ConnectionString { get; set; }
        string DefaultEnvironment { get; set; }
        string[] Environments { get; set; }
        EnvironmentModel[] EnvModels { get; set; }
    }
}