// its like build helper, but for colors

const fs = require("fs")

let str_in = fs.readFileSync("levelstring.txt").toString()

console.log("level loaded")

let objects = str_in.split(";")

let str = objects.shift() + ";"

let color = 500 //STARTING POINT

let color_map = {}

objects.forEach((objstr) => {
  let obj = decode_obj_string(objstr)
  if (obj["1"] == "899") {
    //color trigger
    let target_col = obj["23"]
    if (color_map.hasOwnProperty(target_col)) {
      obj["23"] = color_map[target_col]
    } else {
      color_map[target_col] = (++color).toString()
      obj["23"] = color_map[target_col]
    }
    //copied color
    if (obj.hasOwnProperty("50")) {
      let copied_col = obj["50"]
      if (color_map.hasOwnProperty(copied_col)) {
        obj["50"] = color_map[copied_col]
      } else {
        color_map[copied_col] = (++color).toString()
        obj["50"] = color_map[copied_col]
      }
    }
  } else {
    //obj

    //color 1
    if (obj.hasOwnProperty("21")) {
      let target_col = obj["21"]
      if (color_map.hasOwnProperty(target_col)) {
        obj["21"] = color_map[target_col]
      } else {
        color_map[target_col] = (++color).toString()
        obj["21"] = color_map[target_col]
      }
    }
    //color 2
    if (obj.hasOwnProperty("22")) {
      let target_col = obj["22"]
      if (color_map.hasOwnProperty(target_col)) {
        obj["22"] = color_map[target_col]
      } else {
        color_map[target_col] = (++color).toString()
        obj["22"] = color_map[target_col]
      }
    }
  }

  //serialize

  let key_val = Object.entries(obj)
  key_val.forEach((e) => {
    str += e[0] + "," + e[1] + ","
  })
  //str.pop()
  str += ";"
})

console.log(color_map)

fs.writeFileSync("levelstring.txt", str)

/*
C:/Users/spu7n/AppData/Local/Programs/Python/Python37/python.exe d:/levelDebug/levelStringDecrypt.py && node color_move.js && C:/Users/spu7n/AppData/Local/Programs/Python/Python37/python.exe d:/levelDebug/levelStringEncrypt.py
*/

function decode_obj_string(objstr) {
  let properties = objstr.split(",")
  let out = {}
  for (let i = 0; i < properties.length; i += 2) {
    out[properties[i]] = properties[i + 1]
  }
  return out
}
