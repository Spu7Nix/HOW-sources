// script for generating the waves trail (duh)

const fs = require("fs")

let str = ";"

//dot = 1764
//fpy = 1814

let res = 100
let group = 1

let c = 2

let c2 = 2.06
let offset = 0.7

let block_dist = Math.round(res / 10)

function normalize(p, len) {
  if ((p[0] == 0 && p[1] == 0) || len == 0) {
    return [0, 0]
  }
  var angle = Math.atan2(p[1], p[0])
  var nx = Math.cos(angle) * len
  var ny = Math.sin(angle) * len
  return [nx, ny]
}

for (let i = 0; i < res; i++) {
  group += 1
  let x = Math.sin((i / res) * (c2 - offset) + offset) * 230
  let x_derivative = -Math.cos((i / res) * (c2 - offset) + offset)

  /*
    1,1838,2,0,3,5.83344,64,1,67,1,6,45,24,5,32,0.55;
    1,1838,2,0,3,-5.83344,64,1,67,1,6,-135,24,5,32,0.55;
    1,1764,2,0,3,0,32,2;
    */

  str += `1,1765,2,${600 - x},3,300,57,1.${group},25,${200 - i * 2},41,1,43,${0}a${1.5 - x / 400}a${0.5}a0a0,32,2;`

  str += `1,1814,2,210,3,${120 + i * 20},91,${(i / res) * c},51,${group},10,20,90,1;`
  group += 1

  str += `1,1347,2,210,3,${120 + i * 20 - 10},72,1,73,1,10,999,71,${group - 1},51,${group};`

  let edges = 10

  for (let e = 0; e < edges; e++) {
    let angle = (e / edges) * Math.PI * 2
    let radius = 6

    let light_vector = normalize([-1, 1], 1)
    let pos_vector = normalize([Math.cos(angle), Math.sin(angle)], 1)

    let dot_product = light_vector[0] * pos_vector[0] + light_vector[1] * pos_vector[1]

    let order = x_derivative > 0 ? res - i : -25 - i

    str += `1,1764,2,${600 - x + Math.cos(angle) * radius},3,${
      300 + Math.sin(angle) * radius
    },64,1,67,1,6,45,32,0.6,25,${order},24,${x_derivative > 0 ? -3 : 7},41,1,43,${0}a${1.5 - x / 400 - 0.3}a${
      (1 + dot_product) / 2
    }a0a0,57,${group};`
  }

  /*str +=
      `1,1764,2,${360 - x - 3.53553 * 0.9},3,${300 + 3.53553 * 0.9},64,1,67,1,6,45,32,1.28,25,${201 -
        i * 2},41,1,43,${0}a${1.5 - x / 400 - 0.3}a${0.8}a0a0,57,${group};` +
      `1,1764,2,${360 - x + 3.53553 * 0.9},3,${300 - 3.53553 * 0.9},64,1,67,1,6,-135,32,1.28,25,${201 -
        i * 2},41,1,43,${0}a${1.5 - x / 400 + 0.3}a${0.2}a0a0,57,${group};`*/
}

fs.writeFileSync("levelstring.txt", str)

/*
node wave_trail.js && C:/Users/spu7n/AppData/Local/Programs/Python/Python37/python.exe d:/levelDebug/levelStringEncrypt.py

*/
