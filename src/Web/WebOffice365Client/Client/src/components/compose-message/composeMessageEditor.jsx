import React, {Fragment, useEffect, useRef} from 'react';
import {
  RichTextEditorComponent,
  Toolbar,
  Inject,
  Image,
  Link,
  HtmlEditor,
  Count,
  QuickToolbar,
  Table,
  ToolbarSettingsModel
} from '@syncfusion/ej2-react-richtexteditor';
import i18n from 'i18next';
import { L10n } from '@syncfusion/ej2-base';
import useComponentSize from '@rehooks/component-size'

// RichTextEditor items list
const items = [
  'FontName',
  'Formats',
  'Bold',
  'Italic',
  'Underline',
  'StrikeThrough',
  'FontColor',
  'Alignments',
  'OrderedList',
  'UnorderedList',
  'Outdent',
  'Indent',
  'CreateLink',
  'Image',
  'BackgroundColor',
  'LowerCase',
  'UpperCase',
  '|',
  'FontSize',
  'SuperScript',
  'SubScript',
  '|',
  'CreateTable',
  '|',
  'ClearFormat',
  'Print',
  'SourceCode',
  'FullScreen',
  '|',
  'Undo',
  'Redo'
];

L10n.load({
  'es-ES': {
    richtexteditor: {
      alignments: 'Alineaciones',
      justifyLeft: 'Alinear a la izquierda',
      justifyCenter: 'Alinear al centro',
      justifyRight: 'Alinear a la derecha',
      justifyFull: 'Alinear Justificar',
      fontName: 'Nombre de la fuente',
      fontSize: 'Tamaño de fuente',
      fontColor: 'Color de fuente',
      backgroundColor: 'Color de fondo',
      bold: 'Negrita',
      italic: 'Itálica',
      underline: 'Subrayado',
      strikethrough: 'Tachado',
      clearFormat: 'Borrar formato',
      clearAll: 'Limpiar todo',
      cut: 'Cortar',
      copy: 'Copiar',
      paste: 'Pegar',
      unorderedList: 'Lista con viñetas',
      orderedList: 'Lista numerada',
      indent: 'Aumentar sangría',
      outdent: 'Disminuir sangría',
      undo: 'Deshacer',
      redo: 'Rehacer',
      superscript: 'Superíndice',
      subscript: 'Subíndice',
      createLink: 'Insertar hipervínculo',
      openLink: 'Enlace abierto',
      editLink: 'Editar enlace',
      removeLink: 'Remover enlace',
      image: 'Insertar imagen',
      replace: 'Reemplazar',
      align: 'Alinear',
      caption: 'Captura de imagen',
      remove: 'Eliminar',
      insertLink: 'Insertar el link',
      display: 'Monitor',
      altText: 'Texto alternativo',
      dimension: 'Cambiar tamaño',
      fullscreen: 'Maximizar',
      maximize: 'Maximizar',
      minimize: 'Minimizar',
      lowerCase: 'Minúscula',
      upperCase: 'Mayúscula',
      print: 'Impresión',
      formats: 'Formato',
      sourcecode: 'Vista de código',
      preview: 'Avance',
      viewside: 'ViewSide',
      insertCode: 'Insertar codigo',
      linkText: 'Mostrar texto',
      linkTooltipLabel: 'Título',
      linkWebUrl: 'Dirección web',
      linkTitle: 'Insertar título',
      linkurl: 'http://example.com',
      linkOpenInNewWindow: 'Abrir enlace en una nueva ventana',
      linkHeader: 'Insertar enlace',
      dialogInsert: 'Insertar',
      dialogCancel: 'Cancelar',
      dialogUpdate: 'Actualizar',
      imageHeader: 'Insertar imagen',
      imageLinkHeader: 'También puede proporcionar un enlace desde la web',
      mdimageLink: 'Proporcione una URL para su imagen',
      imageUploadMessage: 'Suelta la imagen aquí o navega para subir',
      imageDeviceUploadMessage: 'Haga clic aquí para subir',
      imageAlternateText: 'Texto alternativo',
      alternateHeader: 'Texto alternativo',
      browse: 'Vistazo',
      imageUrl: 'http://example.com/image.png',
      imageCaption: 'Subtítulo',
      imageSizeHeader: 'Tamaño de la imagen',
      imageHeight: 'Altura',
      imageWidth: 'Anchura',
      textPlaceholder: 'Insertar texto',
      inserttablebtn: 'Insertar tabla',
      tabledialogHeader: 'Insertar tabla',
      tableWidth: 'Anchura',
      cellpadding: 'Padding',
      cellspacing: 'Espaciado',
      columns: 'Número de columnas',
      rows: 'Número de filas',
      tableRows: 'Filas de mesa',
      tableColumns: 'Columnas de tabla',
      tableCellHorizontalAlign: 'Alineación horizontal de celda de tabla',
      tableCellVerticalAlign: 'Alineación vertical de celda de tabla',
      createTable: 'Crear tabla',
      removeTable: 'Eliminar tabla',
      tableHeader: 'Encabezado de tabla',
      tableRemove: 'Eliminar tabla',
      tableCellBackground: 'Fondo de celda de tabla',
      tableEditProperties: 'Propiedades de edición de tabla',
      styles: 'Estilos',
      insertColumnLeft: 'Insertar columna a la izquierda',
      insertColumnRight: 'Insertar columna a la derecha',
      deleteColumn: 'Eliminar columna',
      insertRowBefore: 'Insertar fila antes',
      insertRowAfter: 'Insertar fila después',
      deleteRow: 'Borrar fila',
      tableEditHeader: 'Editar cabecera',
      TableHeadingText: 'Texto cabecera',
      TableColText: 'Columna',
      imageInsertLinkHeader: 'Insertar el link',
      editImageHeader: 'Editar imagen',
      alignmentsDropDownLeft: 'Alinear a la izquierda',
      alignmentsDropDownCenter: 'Alinear al centro',
      alignmentsDropDownRight: 'Alinear a la derecha',
      alignmentsDropDownJustify: 'Alinear Justificar',
      imageDisplayDropDownInline: 'En línea',
      imageDisplayDropDownBreak: 'Descanso',
      tableInsertRowDropDownBefore: 'Insertar fila antes',
      tableInsertRowDropDownAfter: 'Insertar fila después de',
      tableInsertRowDropDownDelete: 'Borrar fila',
      tableInsertColumnDropDownLeft: 'Insertar columna a la izquierda',
      tableInsertColumnDropDownRight: 'Insertar columna a la derecha',
      tableInsertColumnDropDownDelete: 'Eliminar columna',
      tableVerticalAlignDropDownTop: 'Alinear la parte superior',
      tableVerticalAlignDropDownMiddle: 'Alinear Medio',
      tableVerticalAlignDropDownBottom: 'Alinear la parte inferior',
      tableStylesDropDownDashedBorder: 'Fronteras discontinuas',
      tableStylesDropDownAlternateRows: 'Filas Alternas',
      pasteFormat: 'Pegar formato',
      pasteFormatContent: 'Copiar formato',
      plainText: 'Texto sin formato',
      cleanFormat: 'Limpiar',
      keepFormat: 'Mantener',
      paragraph: 'Párrafo'
    }
  }
});

//RichTextEditor ToolbarSettings
const toolbarSettings = {
  items: items,
  type: 'MultiRow',
  enableFloating: false
};

const ComposeMessageEditor = props => {
  const ref = useRef(null);
  let size = useComponentSize(ref);
  const { onChange, defaultValue = '' } = props;

  useEffect(()=>{
    const toolbar = document.getElementById('toolsRTE_2_toolbar');
    if(toolbar) {
      toolbar.style.width = size.width+'px';
    }
  }, [size])

  useEffect(()=>{
    const instance1 = window.WEBSPELLCHECKER.init({
      container: document.getElementById("toolsRTE_2"),
      lang: 'es_ES',
      detectLocalizationLanguage: true,
      serviceId: window.WEBSPELLCHECKER_CODE,
      enableGrammar: true,
      enableBadgeButton: true
    });

    return ()=>{
      //instance1.destroy();
    }
  }, [])

  return (
    <Fragment>
      <div ref={ref} className="text-editor-container">
        <RichTextEditorComponent
          id='toolsRTE_2'
          showCharCount={false}
          locale={i18n.language.startsWith('es') ? 'es-ES' : i18n.language}
          insertImageSettings={{ saveFormat: 'Base64' }}
          toolbarSettings={toolbarSettings}
          value={defaultValue}
          blur={(content) => {
            onChange && onChange(content.value);
          }}
          change={content => {
            onChange && onChange(content.value);
          }}>
          <Inject
            services={[
              Toolbar,
              Image,
              Link,
              HtmlEditor,
              Count,
              QuickToolbar,
              Table
            ]}
          />
        </RichTextEditorComponent>
      </div>
      <style jsx>{`
        .text-editor-container {
          height: auto;
        }

        .text-editor-container .e-richtexteditor:not(.e-rte-tb-expand) {
          border: 0px solid rgba(0, 0, 0, 0.12);
        }

        .text-editor-container #toolsRTE_2 {
          min-height: 90%;
          max-height: 90%
        }
        .e-rte-toolbar.e-toolbar {
          height: auto;
          position: fixed;
        }
        .e-content.e-lib.e-keyboard {
          overflow-y: hidden;
        }
        .e-richtexteditor.e-rte-tb-expand {
          border: none;
        }
        .e-richtexteditor.e-rte-tb-expand .e-rte-content {
          border-bottom: none;
        }
        .e-rte-field .e-checkbox-wrapper {
          display: none;
        }
      `}</style>
    </Fragment>
  );
};

export default ComposeMessageEditor;
