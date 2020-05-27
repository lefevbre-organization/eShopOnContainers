# Kubernetes (k8s) deploy information

This folder contains files needed to **deploy** eLefebvreOnCotainers in a existing Kubernetes:
This folder contains files needed to **create** a ACS with Kubernetes in Azure (in revision to chnague to Amazon or delete files):

# Scripts:
- `gen-k8s-env.ps1` Script to create a ACS with Kubernetes in Azure
- `deploy-lefebvre.ps1` sustituye a deploy.ps1 para hacer el buid y subida de las imagenes al hub, pudiendo realizar un despliegue en kubernetes (en pruebas)


# YAML files used to deploy to k8s

This is just a brief enumeration of the configuration files used to create the k8s objects. Use as reference to find where specific object is.





- `deploy-ingess.ps1` : lanza el script general nginx-ingress\mandatory.yaml de configuración del ingress
- `deploy-ingess-azure.ps1` : lanza el script general nginx-ingress\cloud-generic.yaml de configuración del ingress para un clousd remoto
- `deploy-ingess-dockerlocal.ps1` : lanza el script general nginx-ingress\cloud-generic.yaml de configuración del ingress
-  

- `deployments-lef.yaml` Contains the definition of all deployments of the eLefebvreOnContainers. Do not contain any infrastructure deployment (so no SQL, Redis, ...).
- `services-lef.yaml` Contains the definition of all services of the eLefebvreOnContainers. Do not contain any infrastructure service (so no SQL, Redis, ...).
- `nosql-data.yaml` Contains the definition of the Mongodb (used by multiples services) deployment and service
- `sql-data.yaml` Contains the definition of the SQL server deployment and service (user by seq)
- `rabbitmq.yaml` Contains the definition of the RabbitMQ deployment and service
- `conf_local.yaml` Contains the configuration map that configures all the Pods to use "local" containers (that is all containers in k8s)
- `conf_cloud.yaml` Contains the configuration map that configures all the Pods to use "cloud" resources (that is use Azure resources instead infrastructure containers). This file is provided with no valid values, just for example.
- `frontend.yaml` Contains the deployment and service definition of the NGINX frontend used as reverse-proxy

# EShopContainers old part
- `basket-data.yaml` Contains the definition of the Redis (used by basket.api) deployment and service
- `keystore-data.yaml` Contains the deployment and service definition of the Redis used to mantain coherence between all the ASP.NET Identity keystores. 


- For more information what kubernetes deployments are, read [Kubernetes help](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- For more information what kubernetes services are, read [Kubernetes help](https://kubernetes.io/docs/concepts/services-networking/service/)


Refer to file [README.k8s.md](./README.k8s.md) for detailed information

Refer to file [README.CICD.k8s.md](./README.CICD.k8s.md) for information about how to set a VSTS build for deploying on k8s

Refer to file [conf-files.md](./conf-files.md) for a brief description of every YAML file in this folder