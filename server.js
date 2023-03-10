var http = require('http');
var url = require('url');
var querystring = require('querystring');

var fs = require('fs');
var mime = require('mime');

var server = http.createServer(function(request,response){
    console.log(request.url);
    var parsedUrl = url.parse(request.url);
    var resource = parsedUrl.pathname;
    console.log('resource path=%s',resource);
    var resourcePath = '.' + resource

    if (resource == '/get') {

        console.log('--- log start ---');
        var parsedUrl = url.parse(request.url);
        console.log(parsedUrl);
        var parsedQuery = querystring.parse(parsedUrl.query,'&','=');
        console.log(parsedQuery);
        console.log('--- log end ---');

        for (key in parsedQuery) {
            console.log(key + ' ' + parsedQuery[key]);
        }

        response.writeHead(200, {'Content-Type':'text/html'});
        response.end('get - '  + JSON.stringify(parsedQuery));

    } else if (resource == '/post') {
        var postdata = '';
        request.on('data', function (data) {
            postdata = postdata + data;
        });

        request.on('end', function () {
            console.log(postdata);

            var parsedQuery = querystring.parse(postdata);
            console.log(parsedQuery);

            for (key in parsedQuery) {
                console.log(key + ' ' + parsedQuery[key]);
            }

            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end('post - ' + JSON.stringify(parsedQuery));
        });
    } else if (resource.indexOf('/htmls/') == 0) {
        var htmlPath = resource.substring(1);
        console.log('htmlPath='+htmlPath);
        fs.readFile(resourcePath, 'utf-8', function (error, data) {
            if (error) {
                response.writeHead(500, {'Content-Type': 'text/html'});
                response.end('500 Internal Server Error : ' + error);
            } else {
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(data);
            }
        });
    } else if (resource.indexOf('/movies/') == 0) {
        // 1. stream ??????
        var stream = fs.createReadStream(resourcePath);
        // 2. ?????? ????????? stream ??? ?????? ??????????????? ???????????? ?????? count
        var count = 0;
        // 3. ?????? ????????? data??? ????????? ??? ????????? data ????????? ??????
        stream.on('data', function(data) {
            count = count + 1;
            console.log('data count='+count);
            // 3.1. data ???????????? ???????????? ?????? data??? ?????????????????? ??????
            response.write(data);
        });

        // 4. ????????? ????????? ???????????? end ????????? ??????
        stream.on('end', function () {
            console.log('end streaming');
            // 4.1. ?????????????????? ??????????????? ??????
            response.end();
        });

        // 5. ??????????????? ?????? ????????? error ????????? ??????
        stream.on('error', function(err) {
            console.log(err);
            // 5.2. ?????????????????? ?????????????????? ???????????? ????????????
            response.end('500 Internal Server '+err);
        });
    } else if (resource.indexOf('/images/') == 0) {
        var imgPath = resource.substring(1);
        console.log('imgPath='+imgPath);
        var imgMime = mime.getType(imgPath); // lookup -> getType?????? ?????????
        console.log('mime='+imgMime);

        fs.readFile(imgPath, function(error, data) {
            if(error){
                response.writeHead(500, {'Content-Type':'text/html'});
                response.end('500 Internal Server '+error);
            }else{
                response.writeHead(200, {'Content-Type':imgMime});
                response.end(data);
            }
        });
    } else {
        if (resource == '/') {
            response.writeHead(200,{'Content-Type':'text/html'});
            response.end('Hello node.js!!');
        } else {
            response.writeHead(404, {'Content-Type':'text/html'});
            response.end('404 Page Not Found');
        }
    }
});

server.listen(8080, function(){
    console.log('Server is running...');
});
