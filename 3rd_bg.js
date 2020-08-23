//the bg in the ufo part (i cant believe i spent this mush effort doing something that fills like 5 % of the screen but whatever)

const fs = require("fs")
let str = ";"

let { PI, pow, floor, ceil } = Math

let framecount = 6 //per bg change
let pillarheight = 5
let city_length = 16

let group = 5

let spacing = 30 * (city_length + pillarheight / 2) * 2 + 60

let layerspacing = 45

function create_layer(scale, layer, move, layer_group) {
  const edgecount = Math.ceil(3)

  let shared_props = `24,-3,25,${-1 - layer * 2},21,1,41,1,43,${layer * 10}a${0.6 + layer / 6}a${(5 - layer) / 5}a0a0,`
  let groups = []
  for (let i = 0; i < city_length; i++) groups.push(group++)

  let city = []

  for (let i = 0; i < city_length; i++) {
    let r = (Math.round((pow(Math.random(), 1.8) * 10) / scale) / 10) * scale
    city.push(r * pillarheight)
  }

  //create mountains
  let mountains = create_mountains(city_length, 5)

  //.reduce((a, b) => a + b, 0)
  let mountain_map = []
  let elevation = -mountains.reduce((a, b) => a + b, 0) / 2
  for (let i = 0; i < city_length; i++) {
    if (i == 0 || mountains[i] == mountains[i - 1]) elevation += mountains[i]
    mountain_map.push(elevation)
  }

  //node 3rd_bg.js && C:/Users/spu7n/AppData/Local/Programs/Python/Python37/python.exe d:/levelDebug/levelStringEncrypt.py

  let move_frame_pos = 300

  let frame_pos = 600

  for (let f = 0; f < framecount * 2; f++) {
    let angle = (90 / (framecount * 2)) * f - 45

    if (f != framecount * 2 - 1) {
      if (move) str += `1,901,2,${move_frame_pos},3,${600},51,1,28,${-spacing},20,${layer};`
      move_frame_pos += 45 / (framecount * 2)
    }
    for (let i = 0; i < city_length; i++) {
      let h = city[i]

      let center = {
        x: frame_pos + 30 * i * scale,
        y: 0,
      }

      for (let y = 0; y < edgecount; y++) {
        let obj_pos = {
          x: center.x,
          y: (-1.5 - 3 * y + h) * scale * 30,
        }

        let final_pos = rotate(center.x, center.y, obj_pos.x, obj_pos.y, angle)

        str += `1,579,2,${final_pos[0]},3,${final_pos[1] + layer * layerspacing},32,${3 * scale},6,${
          angle + 90
        },20,${layer},${shared_props}57,1.${layer_group}`

        if (f == framecount) {
          str += `.${groups[i]}`
        }

        str += ";"
      }
    }

    frame_pos += spacing
  }

  move_frame_pos += 45

  for (let f = 0; f < framecount - 1; f++) {
    if (move) str += `1,901,2,${move_frame_pos},3,${600},51,1,28,${spacing},20,${layer};`
    move_frame_pos += 45 / framecount
  }
  move_frame_pos += 45

  //make hills

  for (let f = 0; f < framecount - 1; f++) {
    if (move) str += `1,901,2,${move_frame_pos},3,${600},51,2,28,${-spacing},20,${layer};`
    move_frame_pos += 45 / framecount
  }

  frame_pos = 600 + spacing

  for (let f = 1; f < framecount; f++) {
    let height = f / (framecount - 1)
    height *= height

    let angle = get_angle({
      x: 1,
      y: height,
    })
    for (let i = 0; i < city_length; i++) {
      let corner_pos = (city[i] + height) * 30

      let edge_len = Math.sqrt(1 + height * height)

      let x = frame_pos + 30 * i * scale

      let m = mountains[i]

      //long edge
      str += `1,693,2,${x},3,${(city[i] * scale + (height * scale) / 2) * 30 + layer * layerspacing},32,${
        (edge_len * scale) / Math.SQRT2
      },6,${-m * angle + 45},20,${layer},${shared_props}57,2.${layer_group}`
      if (f == framecount - 1) {
        str += `.${groups[i]}`
      }

      str += ";"

      //short edge

      let s_scale = scale * height
      let yoff = 15 * s_scale

      if (m == -1) {
        //left side
        str += `1,693,2,${x - 15 * scale + s_scale * 15},3,${
          city[i] * 30 * scale + yoff + layer * layerspacing
        },32,${s_scale},6,${90},20,${layer},${shared_props}57,2.${layer_group}`
      } else {
        //right side
        str += `1,693,2,${x + 15 * scale - s_scale * 15},3,${
          city[i] * 30 * scale + yoff + layer * layerspacing
        },32,${s_scale},20,${layer},${shared_props}57,2.${layer_group}`
      }
      if (f == framecount - 1) {
        str += `.${groups[i]}`
      }

      str += ";"
    }
    frame_pos += spacing
  }

  move_frame_pos += 45

  for (let i = 0; i < city_length; i++) {
    str += `1,901,2,${move_frame_pos},3,${600 + 30 * i},51,${groups[i]},29,${
      (mountain_map[i] - city[i]) * 30 * scale
    },10,0.15,20,${layer};`
  }
}

create_layer(0.75, 0, true)

for (let l = 1; l < 5; l++) {
  create_layer(0.75 - l / 10, l, false)
}
console.log("hi")
fs.writeFileSync("levelstring.txt", str)
console.log("hi")
/*
1,1753,2,335.93,3,1072.07,6,-288,20,3,21,2,24,3,25,-1,32,1.,57,2.6.7,64,1,67,1,108,17; == 
1,1753,2,335.93,3,1072.07,108,17,20,3,57,2.6.7,64,1,67,1,25,-1,6,-288,21,2,24,3,32,1.
*/

function rotate(cx, cy, x, y, angle) {
  let radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = cos * (x - cx) + sin * (y - cy) + cx,
    ny = cos * (y - cy) - sin * (x - cx) + cy
  return [nx, ny]
}
function get_length(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

function get_angle(v) {
  let len = get_length(v)
  let vec = {
    x: v.x / len,
    y: v.y / len,
  }
  var angle = Math.atan2(vec.y, vec.x)
  var degrees = (180 * angle) / PI
  return (360 + Math.round(degrees)) % 360
}

function create_mountains(length, peaks) {
  let uphills = []
  let downhills = []
  //up
  let up_count = 0
  let down_count = 0
  const avg_len = length / 2 / peaks
  for (let i = 0; i < peaks - 1; i++) {
    let up_num = getRandomInt(avg_len - 2, avg_len + 2)
    up_count += up_num
    uphills.push(up_num)

    let down_num = getRandomInt(avg_len - 2, avg_len + 2)
    down_count += down_num
    downhills.push(down_num)
  }

  uphills.push(length / 2 - up_count)
  downhills.push(length / 2 - down_count)

  let mountains = []
  for (let i = 0; i < peaks; i++) {
    for (let j = 0; j < uphills[i]; j++) {
      mountains.push(1)
    }
    for (let j = 0; j < downhills[i]; j++) {
      mountains.push(-1)
    }
  }
  return mountains
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}
