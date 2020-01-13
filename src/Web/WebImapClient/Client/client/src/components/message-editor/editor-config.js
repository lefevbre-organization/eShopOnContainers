const editorConfig = {
  menubar: false,
  statusbar: false,
  toolbar: 'fontselect',
  font_formats: "Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Open Sans=Open Sans,helvetica,sans-serif;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats",
  plugins: 'autoresize lists',
  content_style: 'body {padding:0}', // DOESN'T WORK
  browser_spellcheck: true,
  paste_data_images: true,
  entity_encoding: 'named', // Converts characters to html entities ' ' > &nbsp;
  formats: {
    isotope_code: {
      block: 'pre', classes: ['code']
    }
  }
};

export default editorConfig;
