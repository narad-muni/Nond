const fs = require('fs');
const pdfmake = require('pdfmake');

const html = '<html><body><h1>Hello, world!</h1></body></html>';

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/fonts/Roboto-Regular.ttf',
    bold: 'node_modules/pdfmake/fonts/Roboto-Medium.ttf',
    italics: 'node_modules/pdfmake/fonts/Roboto-Italic.ttf',
    bolditalics: 'node_modules/pdfmake/fonts/Roboto-MediumItalic.ttf'
  }
};

const docDefinition = {
  content: [
    { html: html }
  ],
  defaultStyle: {
    font: 'Roboto'
  }
};

const printer = new pdfmake(fonts);
const pdfDoc = printer.createPdfKitDocument(docDefinition);

pdfDoc.pipe(fs.createWriteStream('output.pdf'));
pdfDoc.end();
