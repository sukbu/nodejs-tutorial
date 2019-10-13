// refactoring
module.exports = {
    HTML: function (title, list, body, control) {
      return `
      <!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        <p>${body}</p>
      </body>
      </html>
    `;
    },
    list: function (files) {
      var list = '<ul>';
      var i = 0;
      while (i < files.length) {
        list = list + `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
        i = i + 1;
      }
      list = list + '</ul>';
  
      return list;
    }
  }

