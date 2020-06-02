// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export const getFileType = fileName => {
    let type;
    switch (fileName.match(/\.[0-9a-z]+$/i)[0]) {
        case '.pdf':
            type = 'application/pdf';
            break;
        case '.doc':
            type = 'application/msword';
            break;
        case '.docx':
            type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
        case '.odt':
            type = 'application/vnd.oasis.opendocument.text';
            break;
        default:
            break;
    }
    return type;
  }
  