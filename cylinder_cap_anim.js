//making the top and bottom of the cylinder animation

const fs = require("fs")
let str = ";"

//124

//62

//36

//START ELLIPSE HEIGHT: 36/62

const start_width = 400 / 3
const end_width = 400

const frames = 60

const blockscale = 7
const { pow, sin, cos, PI } = Math

const ellipse_points = 12

const startheight = 110
const endheight = 330

const topstart = endheight - (endheight - startheight) / 2
const topend = endheight

const botstart = (endheight - startheight) / 2
const botend = 0

const spacing = 660
const stack_height = 3

const FRAMESPACING = 15

for (let f = 0; f < frames; f++) {
  let off = {
    x: 300 + spacing * Math.floor(f / stack_height),
    y: 300 + spacing * (f % stack_height),
  }
  if (f > 0) {
    if (off.y == 300) {
      str += `1,901,2,${f * FRAMESPACING},3,${30},28,${-spacing},29,${spacing * (stack_height - 1)},51,1;` // move frame

      /*str += `1,901,2,${(frames + (frames - f - 1)) * FRAMESPACING},3,${30},28,${spacing},29,${
        -spacing * (stack_height - 1)
      },51,1;`*/
    } else {
      str += `1,901,2,${f * FRAMESPACING},3,${30},29,${-spacing},51,1;` // move frame
      //str += `1,901,2,${(frames + (frames - f - 1)) * FRAMESPACING},3,${30},29,${spacing},51,1;` // move frame
    }
  }

  //draw frame
  let t = easeInOutExpo(f / frames)

  let width = end_width * t + start_width * (1 - t) //interpolation a la sput

  let frame_x = off.x

  let left_x = frame_x - width / 2
  let right_x = frame_x + width / 2

  //ellipse
  let ellipse_height = between(t, 12 / 33, 0)

  generate_arc(true)
  generate_arc(false)

  function generate_arc(top) {
    let height = top ? between(t, topstart, topend) : between(t, botstart, botend)

    str += `1,211,2,${left_x - 15 * blockscale},3,${
      off.y + height + (top ? -15 : 15) * blockscale
    },32,${blockscale},57,1;`
    str += `1,211,2,${right_x + 15 * blockscale},3,${
      off.y + height + (top ? -15 : 15) * blockscale
    },32,${blockscale},57,1;`

    let previous_point = {
      x: top ? left_x : right_x,
      y: off.y,
    }

    for (let i = 1; i <= ellipse_points; i++) {
      let angle = PI * (top ? 1 : 2) - (i / ellipse_points) * PI

      let point = {
        x: between((cos(angle) + 1) * 0.5, left_x, right_x),
        y: off.y + (width / 2) * sin(angle) * ellipse_height,
      }

      //str += `1,1765,2,${point.x},3,${point.y};`

      //vector between the two points
      let vec = {
        x: point.x - previous_point.x,
        y: point.y - previous_point.y,
      }

      let len = get_length(vec)

      //normalized
      let vecnorm = {
        x: vec.x / len,
        y: vec.y / len,
      }

      //point of block
      let blockpos = {
        x: (previous_point.x + point.x) / 2 - vecnorm.y * blockscale * 15,
        y: (previous_point.y + point.y) / 2 + vecnorm.x * blockscale * 15,
      }

      let blockangle = get_angle(vecnorm)

      str += `1,211,2,${blockpos.x},3,${blockpos.y + height},32,${blockscale},6,${360 - blockangle},57,1;`
      previous_point = point
    }
  }

  let height = between(t, botstart, botend)

  //convex arc
  let previous_point = {
    x: left_x,
    y: off.y,
  }

  //cover
  str += `1,211,2,${frame_x - width / 4},3,${off.y + height - width / 4},32,${width / 60},57,1,20,1;`
  str += `1,211,2,${frame_x + width / 4},3,${off.y + height - width / 4},32,${width / 60},57,1,20,1;`

  for (let i = 1; i <= ellipse_points; i++) {
    let angle = PI - (i / ellipse_points) * PI

    let point = {
      x: between((cos(angle) + 1) * 0.5, left_x, right_x),
      y: off.y + (width / 2) * sin(angle) * ellipse_height,
    }

    //str += `1,1765,2,${point.x},3,${point.y};`

    //vector between the two points
    let vec = {
      x: point.x - previous_point.x,
      y: point.y - previous_point.y,
    }

    let len = get_length(vec)

    //normalized
    let vecnorm = {
      x: vec.x / len,
      y: vec.y / len,
    }

    //point of block
    let blockpos = {
      x: (previous_point.x + point.x) / 2 + (vec.y * 3) / 2,
      y: (previous_point.y + point.y) / 2 - (vec.x * 3) / 2,
    }

    let blockangle = get_angle(vecnorm)

    str += `1,579,2,${blockpos.x},3,${blockpos.y + height},32,${(len / 30) * 3},6,${360 - blockangle + 90},57,1,20,1;`
    previous_point = point
  }
}

fs.writeFileSync("levelstring.txt", str)

/*
function easeInOutExpo(x) {
  return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? pow(2, 20 * x - 10) / 2 : (2 - pow(2, -20 * x + 10)) / 2
}
*/

function easeInOutExpo(time) {
  if (time < 0.5) return 0.5 * pow(2, 10 * (time * 2 - 1))
  return 0.5 * (-pow(2, -10 * (time * 2 - 1)) + 2)
}

function between(fac, point1, point2) {
  return point1 + fac * (point2 - point1)
}

function sinbetween(fac, point1, point2) {
  let anglestart = Math.asin(point1)
  let angleend = Math.asin(point2)
  return sin(anglestart + fac * (angleend - anglestart))
}

//node cylinder_cap_anim.js && C:/Users/spu7n/AppData/Local/Programs/Python/Python37/python.exe d:/levelDebug/levelStringEncrypt.py

function get_length(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

function get_angle(v) {
  let len = get_length(v)
  let vec = {
    x: v.x / len,
    y: v.y / len,
  }
  let angle = Math.atan2(vec.y, vec.x)
  let degrees = (180 * angle) / Math.PI
  return (360 + Math.round(degrees)) % 360
}
