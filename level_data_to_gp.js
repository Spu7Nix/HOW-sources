// converting format level to json file that i can work with

const fs = require("fs")

let file = fs.readFileSync("levelstring.txt").toString()

let objects = file.split(";")

let new_objects = []
const layers = 3

for (obj of objects) {
  let parameters = obj.split(",")
  let val = false
  let last_key = ""

  let x, y, layer, type, part, group
  for (p of parameters) {
    if (val) {
      if (last_key == 2) {
        x = (parseFloat(p) - 7.5) / 15
      } else if (last_key == 3) {
        y = (parseFloat(p) - 7.5) / 15
      } else if (last_key == 20) {
        let layer_lit = parseInt(p)
        layer = ((layer_lit - 1) % layers) + 1
        if (layer_lit <= layers) {
          part = 0
        } else {
          part = 1
        }
      } else if (last_key == 1) {
        switch (p) {
          case "916":
            type = 0 //normal block
            break

          case "853":
            type = 1 //cylinder
            break
        }
      } else if (last_key == 57) {
        let groups = p.split(".")
        group = groups[0]
      }

      val = false
    } else {
      last_key = parseFloat(p)
      val = true
    }
  }
  //console.log(x, y, layer)
  new_objects.push({
    x: x,
    y: y,
    l: layer,
    t: type,
    p: part,
    g: group,
  })
}

console.log(new_objects.length)

fs.writeFileSync("ufo_gp.json", JSON.stringify(new_objects))
