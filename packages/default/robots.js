function filter(r) {
    let res = []
    for (let a of r) {
        console.log(a)
        // if(! isNimbot(a))
        // continue
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

const openwhisk = require("openwhisk")
function main(args) {
    // check parametes
    let ow = openwhisk()
    return ow.actions.list()
        .then(r => ({ body: filter(r) }))
}

module.exports.main = main