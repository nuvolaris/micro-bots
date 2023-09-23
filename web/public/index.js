//https://github.com/learning-apache-openwhisk/chapter10-golang/blob/master/vue/src/app/assets.go

const fs = require('fs');

ctypes = {
    "gif": "image/gif",
    "jpg": "image/jpeg",
    "png": "image/png",
    "ico": "image/vnd.microsoft.icon",
    "ttf": "font/ttf",
    "woff": "font/woff",
    "woff2": "font/woff2"
}

function isBinary(file) {
    return file.endsWith(".gif") ||
        file.endsWith(".jpg") ||
        file.endsWith(".png") ||
        file.endsWith(".ico") ||
        file.endsWith(".ttf") ||
        file.endsWith(".woff") ||
        file.endsWith(".woff2")
}


// replace base in html and css
function replaceBase(path, body) {
    // filter .html
    if (!path.endsWith(".html"))
        return body
    // calculate toReplace    
    let a = process.env['__OW_ACTION_NAME'].split("/")
    if (a.length == 3) a.splice(-1, 0, "default")
    let toReplace = a.join("/");
    // replace all
    let toFind = '/nuvolaris/default/skybattle'
    if (toFind != toReplace)
        while (body.indexOf(toFind) != -1)
            body = body.replace(toFind, toReplace)
    return body
}

function body(path) {
    let file = `${__dirname}${path}`
    if (!fs.existsSync(file)) {
        console.log("cannot find " + file)
        return {
            body: "<h1>504 not found</h1>",
            statusCode: 504
        }
    }
    let data = fs.readFileSync(file)
    if (isBinary(path))
        return {
            body: data.toString("base64"),
            statusCode: 200,
            headers: {
                "Content-Type": ctypes[path.split(".").pop()]
            }
        }
    return {
        body: replaceBase(path, data.toString("utf-8")),
        statusCode: 200,
    }
}

function check(args) {
    let res = ""
    if (!("__ow_path" in args)) {
        res = "<h1>Error: not deployed as <tt>--web=true</tt></h1>"
    }
    else if (!("__OW_API_KEY" in process.env)) {
        res = "<h1>Error: not deployed with <tt>-a provide-api-key true</tt>.</h1>"
    }
    else if (!("secret" in args) || args.secret == "") {
        res = "<h1>Error: please set password with <tt>./nuv a update microbots -p secret <b>pick-your-password</b></tt>"
    }
    return res
}


const openwhisk = require("openwhisk")

function isNimbot(a) {
    for (let kv of a.annotations) {
        //console.log(kv)
        if (kv.key == "nimbot")
            return true
    }
    return false
}

function filter(r) {
    let res = []
    for (let a of r) {
        console.log(a)
        if (!isNimbot(a))
            continue
        let namespace = a.namespace
        let package = namespace.split("/")
        if (package.length < 2)
            continue

        let name = `${package[1]}/${a.name}`
        let url = `${namespace}/${a.name}`
        let rec = {
            name: name,
            url: url
        }
        res.push(rec)
    }
    return res
}

function main(args) {
    // check parametes
    res = check(args)
    if (res != "") {
        return { "body": res }
    }
    let path = args['__ow_path'];
    // echo - disabled - for debug only 
    // do not leave enabled as leaks api keys
    /*
    if (path == "/echo") {
        return {
            "body": {
                "args": args,
                "env": process.env
            }
        }
    }/**/
    if (path == "/robots") {
        let ow = openwhisk()
        return ow.actions.list()
            .then(r => ({ body: filter(r) }))
    }
    // check login
    if (path == "/login") {
        res = { "error": "wrong password" }
        if (args.password && args.password == args.secret)
            res = { "token": process.env["__OW_API_KEY"] }
        return {
            "body": res
        }
    }
    // send body
    if (path != "") {
        return body(path)
    }
    // return redirect if no path
    return { "body": `<script>location.href += "/index.html"</script>` }
}

module.exports.main = main