export interface Implantation {
  Id: number;
  Description: string;
  Organization: string;
  Type: string;
}

export interface Phase {
  Id: number;
  Description: string;
}

export interface ProductType {
  Id: number;
  Name: string;
}

export interface CentinelaResponse {
  results: {
    data: Implantation[] | ProductType[] | Phase[];
    count: number;
  };
}

export const getImplantations = (
  user: string,
  search: string,
  pageSize: number,
  currentPage: number
): CentinelaResponse => {
  return {
    results: {
      count: 10,
      data: [
        {
          Id: 1,
          Description: 'Implantación de datos personales 2019',
          Organization: 'DANONE',
          Type: 'CENTINELA PROTECCIÓN DE DATOS'
        },
        {
          Id: 2,
          Description: 'Implantación de datos personales 2019',
          Organization: 'CAF Madrid',
          Type: 'CENTINELA PROTECCIÓN DE DATOS'
        },
        {
          Id: 3,
          Description:
            'Implantación de Protección de datos en el sector de seguros según normativa',
          Organization: 'Santa Lucía S.A.',
          Type: 'CENTINELA PROTECCIÓN DE DATOS'
        },
        {
          Id: 4,
          Description:
            'Implantación de conytratos de prestación de servicios y suministros',
          Organization: 'PRYCONSA, S.A.',
          Type: 'CENTINELA PROTECCIÓN DE DATOS'
        },
        {
          Id: 5,
          Description: 'Mi implantación de GDPR',
          Organization: 'Amazon, S.L.',
          Type: 'CENTINELA PROTECCIÓN DE DATOS'
        },
        {
          Id: 6,
          Description: 'Mi implantación de GDPR',
          Organization: 'IKEA, SL',
          Type: 'CENTINELA PROTECCIÓN DE DATOS'
        }
        // {
        //   Id: 7,
        //   Description:
        //     'Implantación de conytratos de prestación de servicios y suministros',
        //   Organization: 'DANONDE'
        // },
        // {
        //   Id: 8,
        //   Description: 'Implantación de datos personales 2019',
        //   Organization: 'Amazon, S.L.'
        // },
        // {
        //   Id: 9,
        //   Description:
        //     'Implantación de conytratos de prestación de servicios y suministros',
        //   Organization: 'DANONE'
        // },
        // {
        //   Id: 10,
        //   Description:
        //     'Implantación de conytratos de prestación de servicios y suministros',
        //   Organization: 'DANONDE'
        // }
      ]
    }
  };
};

export const getProducts = (): ProductType[] => {
  return [
    {
      Id: 1,
      Name: 'Mediación'
    },
    {
      Id: 2,
      Name: 'CENTINELA 2'
    },
    {
      Id: 3,
      Name: 'CENTINELA Protección de datos'
    },
    {
      Id: 4,
      Name: 'ISO 19602 COMPLIANCE Fiscal'
    },
    {
      Id: 5,
      Name: 'CENTINELA BPT'
    },
    {
      Id: 6,
      Name: 'COMPLIANCE Penal'
    }
  ];
};

export const getPhases = (
  user: string,
  implantation: number
): CentinelaResponse => {
  return {
    results: {
      count: 0,
      data: [
        {
          Id: 1,
          Description: 'LIDERAZGO CENTRADO EN LA SEGURIDAD Y COMPROMISO'
        },
        {
          Id: 2,
          Description: 'REGISTRO DE ACTIVIDADES DE TRATAMIENTO'
        },
        {
          Id: 3,
          Description: 'ANÁLISIS BÁSICO Y EVALUACIÓN DEL IMPACTO'
        },
        {
          Id: 4,
          Description: 'GESTIÓN Y EVALUACIÓN DE RIESGOS'
        },
        {
          Id: 5,
          Description: 'MEDIDAS TÉCNICAS Y ORGANIZATIVAS'
        },
        {
          Id: 6,
          Description: 'DERECHOS DE LOS USUARIOS'
        },
        {
          Id: 7,
          Description: 'GESTIÓN DE BRECHAS DE SEGURIDAD'
        },
        {
          Id: 8,
          Description: 'MEJORA CONTINUA'
        },
        {
          Id: 9,
          Description: 'INFORMES'
        },
        {
          Id: 10,
          Description: 'CARPETA PERSONALIZADA'
        }
      ]
    }
  };
};
