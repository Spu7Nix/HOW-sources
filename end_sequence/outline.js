//the last part with no color

const fs = require("fs")

const { parse } = require("svg-parser")
const simplify = require("simplify-js")

const svg_data = fs.readFileSync("./frames/frame_images/end_sequence0001-0350.svg").toString()

const parsed = parse(svg_data)

const frames = parsed.children[0].children[0].children

const size_low_bound = 4
const ld_size_low_bound = 10
const line_quality = 3 //lower number results in smaller lines

module.exports = {
  drawOutline(f, pos, group) {
    let obj = 0
    let str = ""
    let frame = frames[f - 1]
    const paths = frame.children[0].children

    //fs.writeFileSync("simplified.svg", simplified)

    let polylines = []

    let b_points = 0
    let a_points = 0

    //console.log(paths.length)

    paths.forEach((p, i) => {
      let d = p.properties.d
      let nums = d.split(/[ ,]+/)

      //if ((nums.length - 1) * 0.5 > 5) {
      let line = []

      for (let i = 2; i < nums.length - 1; i += 2) {
        let x = parseFloat(nums[i])
        let y = parseFloat(nums[i + 1])
        //console.log(nums[i], nums[i + 1], nums.length, i)
        line.push({
          x: x,
          y: y,
        })
      }

      a_points += line.length

      const simplified = simplify(line, line_quality, true)

      b_points += simplified.length

      polylines.push(simplified)
      //}
    })

    //console.log(a_points, b_points)

    //convert to level data

    let scale = 0.02 //0.05
    polylines.forEach((line) => {
      for (let i = 0; i < line.length - 1; i++) {
        let pa = line[i] //point a
        let pb = line[i + 1] //point b

        let vector = {
          x: pb.x - pa.x,
          y: pb.y - pa.y,
        }

        let size = get_length(vector) * scale

        if (size > 100 * scale) {
          str += `1,1753,2,${((pa.x + pb.x) * 15 * scale + pos.x).toFixed(3)},3,${(
            pos.y -
            (pa.y + pb.y) * 15 * scale
          ).toFixed(3)},32,${size.toFixed(3)},6,${get_angle(vector).toFixed(3)},24,7,25,1800,21,991,20,1,57,${group};`
          obj++
        } else if (size > size_low_bound * scale) {
          str += `1,1757,2,${((pa.x + pb.x) * 15 * scale + pos.x).toFixed(3)},3,${(
            pos.y -
            (pa.y + pb.y) * 15 * scale
          ).toFixed(3)},32,${(size * 2).toFixed(3)},6,${get_angle(vector).toFixed(
            3
          )},24,7,25,1800,21,991,20,1,57,${group}`
          if (size < ld_size_low_bound * scale) str += ",103,1"
          str += ";"

          obj++
        } /* else if (size > 0.5 * scale) {
          str += `1,579,2,${((pa.x + pb.x) * 15 * scale + pos.x).toFixed(3)},3,${(
            pos.y -
            (pa.y + pb.y) * 15 * scale
          ).toFixed(3)},32,${size.toFixed(3)},6,${get_angle(vector).toFixed(3)},24,9,25,1800,21,2,20,1,57,1;`
          obj++
        }*/
      }
    })
    console.log(obj)
    return str
  },
}

//fs.writeFileSync("levelstring.txt", str)

// node . && C:/Users/spu7n/AppData/Local/Programs/Python/Python37/python.exe d:/svg-to-gd/levelStringEncrypt.py

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
  var degrees = (180 * angle) / Math.PI
  return (360 + Math.round(degrees)) % 360
}
