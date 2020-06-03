interface CentinelaResponse {
  errors: any;
  infos: any;
}

export interface CentUser {
  id: number | string | null;
  idNavision: string;
  name: string;
  evaluations: Evaluation[];
  extraElements: any;
}

export interface CentUserResponse extends CentinelaResponse {
  data: CentUser;
}

export interface CentInstance {
  conceptId: number;
  conceptObjectId: number;
  folderId: number;
  evaluated: boolean;
  title: string;
  description: string;
  author: string;
  isArchived: boolean;
  creationDate: string;
  modificationDate: string;
}

export interface CentInstanceResponse extends CentinelaResponse {
  data: CentInstance[];
}

export interface Evaluation {
  evaluationId: number;
  name: string;
  productId: string;
  productName: string;
  clientId: number;
  clientName: string;
  modified: string;
  progress: number;
  status: number;
  risk: boolean;
  normChange: boolean;
  canManage: boolean;
  canModify: boolean;
}

export interface EvaluationResponse extends CentinelaResponse {
  data: Evaluation | Evaluation[];
}

export interface Concept {
  conceptId: number;
  conceptObjectId: number;
  evaluated: boolean;
  title: string;
  description: string | null;
  published: boolean;
  allowPublicShare: boolean;
  publicShared: boolean;
  publicUrl: string;
  isFront: boolean;
  hasProcessOps: boolean;
  hidden: boolean;
  singleInstance: boolean;
  modified: string;
  iD_Version0: number | null;
}
export interface ConceptResponse extends CentinelaResponse {
  data: Concept[];
}

export interface TreeNode {
  folderId: number;
  parentId: number | null;
  name: string;
  description: string | null;
  published: boolean;
  conceptObjectId: number;
  evaluated: boolean;
  concepts: Concept[];
  children: TreeNode[];
  totalConcepts: number;
  isFront: boolean;
  hidden: boolean;
  iD_Version0: number;
  level: number;
}
export interface TreeNodeResponse extends CentinelaResponse {
  data: TreeNode[];
}

export interface Document {
  productId: string;
  productName: string;
  evaluationId: number;
  evaluationName: string;
  clientId: number;
  reportDocumentId: number;
  reportObjectId: number;
  reportId: number;
  reportType: any;
  folderId: number;
  folderName: string;
  conceptId: number;
  conceptObjectId: number;
  conceptObjectName: string;
  clientName: string;
  documentObjectId: number;
  taskId: number;
  name: string;
  source: string;
  participants: any;
  lcoFields: any;
  stringFields: any;
  contentType: string;
  format: string;
  taskType: any;
  status: string;
  author: string;
  creationDate: string;
}

const API_CENTINELA_GATEWAY =
  (window as any).API_CENTINELA_GATEWAY ||
  'https://lexbox-test-apigwcen.lefebvre.es/api/v1/cen';

export interface DocumentResponse extends CentinelaResponse {
  data: Document[];
}

export const getUser = async (
  navisionUser: string
): Promise<CentUserResponse> => {
  const url = `${API_CENTINELA_GATEWAY}/user?idNavisionUser=${navisionUser}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return result;
  } catch (err) {
    throw err;
  }
};

export const getEvaluations = (navisionUser: string): EvaluationResponse => {
  return {
    errors: [],
    infos: [],
    data: [
      {
        evaluationId: 4509,
        name: 'Prueba compartir',
        productId: 'one',
        productName: 'Centinela con Protección de Datos',
        clientId: 129,
        clientName: 'AFFIN Solutions S.L',
        modified: '2020-03-17T09:44:19.45',
        progress: 0,
        status: 0,
        risk: false,
        normChange: false,
        canManage: true,
        canModify: true
      },
      {
        evaluationId: 4534,
        name: 'ijhoi',
        productId: 'one',
        productName: 'Centinela Protección de Datos',
        clientId: 64,
        clientName: 'Casa, SL',
        modified: '2020-03-29T11:30:49.273',
        progress: 2,
        status: 0,
        risk: false,
        normChange: false,
        canManage: true,
        canModify: true
      },
      {
        evaluationId: 4581,
        name: 'miñoprotegedatos',
        productId: 'one',
        productName: 'Centinela Protección de Datos',
        clientId: 64,
        clientName: 'Casa, SL',
        modified: '2020-04-21T17:37:21.193',
        progress: 1,
        status: 0,
        risk: false,
        normChange: false,
        canManage: true,
        canModify: true
      },
      {
        evaluationId: 4583,
        name: 'Prueba nuevo campo usuario',
        productId: 'one',
        productName: 'Centinela Protección de Datos',
        clientId: 129,
        clientName: 'AFFIN Solutions S.L',
        modified: '2020-04-06T08:26:49.7',
        progress: 0,
        status: 0,
        risk: false,
        normChange: false,
        canManage: true,
        canModify: true
      },
      {
        evaluationId: 4592,
        name: 'pueba sino',
        productId: 'one',
        productName: 'Centinela Protección de Datos',
        clientId: 129,
        clientName: 'AFFIN Solutions S.L',
        modified: '2020-04-21T12:25:51.33',
        progress: 0,
        status: 0,
        risk: false,
        normChange: false,
        canManage: true,
        canModify: true
      }
    ]
  };
};

export const getEvaluationById = (
  navisionUser: string,
  evaluation: string
): EvaluationResponse => {
  return {
    errors: [],
    infos: [],
    data: {
      evaluationId: 4509,
      name: 'Prueba compartir',
      productId: 'one',
      productName: 'Centinela Protección de Datos',
      clientId: 129,
      clientName: 'AFFIN Solutions S.L',
      modified: '2020-03-17T09:44:19.45',
      progress: 0,
      status: 0,
      risk: false,
      normChange: false,
      canManage: true,
      canModify: true
    }
  };
};

export const getEvaluationTree = async (
  navisionUser: string,
  evaluation: string
): Promise<TreeNodeResponse> => {
  const url = `${API_CENTINELA_GATEWAY}/evaluations/tree/getbyid?idNavisionUser=${navisionUser}&idEvaluation=${evaluation}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return result;
  } catch (err) {
    throw err;
  }
};

export const getInstances = async (
  navisionUser: string,
  conceptId: string
): Promise<CentInstanceResponse> => {
  const url = `${API_CENTINELA_GATEWAY}/concepts/instances?idNavisionUser=${navisionUser}&idConcept=${conceptId}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return result;
  } catch (err) {
    throw err;
  }
};

export const getResults = async (
  navisionUser: string,
  search: string
): Promise<DocumentResponse> => {
  const url = `${API_CENTINELA_GATEWAY}/documents?idNavisionUser=${navisionUser}&search=${search}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return result;
  } catch (err) {
    throw err;
  }
};

export const getDocumentsByInstance = async (
  navisionUser: string,
  conceptObjectId: number
): Promise<DocumentResponse> => {
  const url = `${API_CENTINELA_GATEWAY}/documents/instance?idNavisionUser=${navisionUser}&conceptObjectId=${conceptObjectId}`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return result;
  } catch (err) {
    throw err;
  }
};

export const uploadFile = async (
  navisionUser: string,
  conceptId: number,
  doc: any
) => {
  const url = `${API_CENTINELA_GATEWAY}/concepts/files/post`;
  const body = {
    idNavision: navisionUser,
    conceptId,
    name: doc.name,
    contentFile: doc.content
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    await response.json();

    return response.status;
  } catch (err) {
    throw err;
  }
};

export const downloadFile = async (
  documentId: number,
  navisionUser: string,
  progressCallback: any
) => {
  const url = `${API_CENTINELA_GATEWAY}/concepts/files/get?idNavisionUser=${navisionUser}&idDocument=${documentId}`;

  try {
    let progress = 0;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/text',
        'Content-Type': 'application/json'
      }
    });

    if (response.status !== 200) {
      return response;
    }

    if (response && response.headers) {
      const contentLength = +(response as any).headers.get('Content-Length');
      progressCallback &&
        progressCallback({ length: contentLength, progress: progress });

      const reader = (response as any).body.getReader();
      let receivedLength = 0; // received that many bytes at the moment
      let chunks = []; // array of received binary chunks (comprises the body)

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        chunks.push(value);
        receivedLength += value.length;

        progress = Math.ceil((receivedLength * 100) / contentLength);
        progressCallback && progressCallback({ progress: progress });
      }

      let chunksAll = new Uint8Array(receivedLength); // (4.1)
      let position = 0;
      for (let chunk of chunks) {
        chunksAll.set(chunk, position); // (4.2)
        position += chunk.length;
      }

      let result = new TextDecoder('utf-8').decode(chunksAll);

      // We're done!
      let commits = JSON.parse(result);
      progressCallback && progressCallback({ progress: 100 });

      return { ...commits, status: 200 };
    }
  } catch (err) {
    throw err;
  }
};
