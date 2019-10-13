var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control) {
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
}


function templateList(files) {
  var list = '<ul>';
  var i = 0;
  while (i < files.length) {
    list = list + `<li><a href="/?id=${files[i]}">${files[i]}</a></li>`;
    i = i + 1;
  }
  list = list + '</ul>';

  return list;
}


var server = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;

  if (pathname == '/') {
    if (queryData.id === undefined) {
      fs.readdir('./data', function (error, files) {
        var title = 'Welcome';
        var description = 'Hello Node.js';
        var list = templateList(files);
        var template = templateHTML(title, list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(template);
      })
    } else {
      fs.readdir('./data', function (error, files) {
        fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
          var list = templateList(files);
          var title = queryData.id;
          var template = templateHTML(title, list,
            `<h2>${title}</h2>${description}`,
            ` <a href="/create">create</a> 
              <a href="/update?id=${title}">update</a>
              <form action="delete_process" method="POST">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    }
  } else if (pathname === '/create') {
    fs.readdir('./data', function (error, files) {
      var title = 'Web - create';
      var list = templateList(files);
      var template = templateHTML(title, list,
        `
        <form action="/create_process" method="POST">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
            <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
            <input type="submit">
        </p>
        </form>
        `, '');
      response.writeHead(200);
      response.end(template);
    })
  } else if (pathname === '/create_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;

      if (body.length > 1e6) {
        request.connection.destroy();
      }
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var title = post.title;
      var description = post.description;

      fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        if (err) throw err;
        console.log()

        response.writeHead(302, { Location: `/?id=${title}` });
        response.end();
      })

      //console.log(post.title);
    });
  } else if (pathname === '/update') {
    fs.readdir('./data', function (error, files) {
      fs.readFile(`data/${queryData.id}`, 'utf8', function (err, description) {
        var list = templateList(files);
        var title = queryData.id;
        var template = templateHTML(title, list,
          `
          <form action="/update_process" method="POST">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
              <textarea name="description" placeholder="description" >${description}</textarea>
          </p>
          <p>
              <input type="submit">
          </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(template);
      });
    });
  } else if (pathname === '/update_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;

      if (body.length > 1e6) {
        request.connection.destroy();
      }
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function (err) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
          if (err) throw err;
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        })
        if (err) {
          console.log('error: ' + err);
          throw err;
        }
      })
    });
  } else if (pathname === '/delete_process') {
    var body = '';
    request.on('data', function (data) {
      body += data;
      if (body.length > 1e6) {
        request.connection.destroy();
      }
    });
    request.on('end', function () {
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`, function (err) {
        response.writeHead(302, { Location: `/` });
        response.end();
      })
    });
  } else {
    response.writeHead(404);
    response.end('404 Not found');
  }

});
server.listen(3000);