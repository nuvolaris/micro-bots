const glob = require("glob")

let res = "packages:\n"
res += "  default:\n"
res += "    actions:\n"
res += "      microbots:\n"
res += "        function: microbots.zip\n"
res += "        runtime: nodejs:default\n"
res += "        web: true\n"
res += "        annotations:\n"
res += "          provide-api-key: true\n"
res += "        inputs:\n"
res += "          secret:\n"
res += "            value: ${SECRET}\n"


let folders = glob.sync("../robots/*")
for(let folder of folders) {
    //let folder = folders[0]
    let files = glob.sync(folder+"/*.{js,py,go}")
    if(files.length == 0)
        continue
    let package = folder.split("/").slice(-1)[0]
    if(package == "default")
      continue
    res += "  "+package+":\n"
    res += "    actions:\n"
    for(let file of files) {
        // let file = files[0]
        let name = file.split("/").slice(-1)[0].split(".").slice(-2,-1)[0]
        let func = file.split("/").slice(2).join("/")
        res += "      "+name+":\n"
        res += "         function: "+func+"\n"
        res += "         web: true\n"
        res += "         annotations:\n"
        res += "            nimbot: true\n"

    }
}
console.log(res)

