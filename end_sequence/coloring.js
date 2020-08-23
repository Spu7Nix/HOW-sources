//the colored parts of the endsequence

const fs = require("fs")

const hsv = require("rgb-hsv")
const { off } = require("process")

const { drawOutline } = require("./outline.js")

const imgAvg = require("image-average-color")

//spacing between triggers, not physical frames
function time_to_units(time) {
  return 10.3761348908 * time * 30
}
const FRAMESPACING = time_to_units(1 / 24)
const FRAMES = 409 + 350

const stack_spacing = 0.4
const frame_y_spacing = 3

const stack_height = 20

let group = 911

const safetyOffset = 600

const bg_group = group++ //replace with: 2
//group of target obj
const target_group = group++ //replace with: 4

const group3 = group++ //replace with 3

const global_off = time_to_units(43.6)

const col = 990

const ldQuality = 100

/*
1x1, id: 211, scale: 1

3x1, id: 579, scale: 1

4x1, id: 1191, scale: 1

15x1, id: 1757, scale: 2

30x1, id: 1753, scale: 1
*/

/*let str =
  `kS38,1_${bg[0]}_2_${bg[1]}_3_${bg[2]}_11_0_12_0_13_0_4_-1_6_1000_7_0_15` +
  `_1_18_0_8_1|1_0_2_0_3_0_11_0_12_0_13_0_4_-1_6_1001_7` +
  `_1_15_1_18_0_8_1|1_0_2_0_3_0_11_0_12_0_13_0_4_-1_6_1002|1_0_2_0_3_0_6_11`

str += `|1_0_2_255_3_255_7_${image_data[0].color[3] / 255}_6_${1}_8_1_5_0`

str +=
  `,kA13,0,kA15,0,kA16,0,kA14,` +
  `,kA6,13_1009_7_0_15_1_18_0_8_1|1_0_2_0_3_` +
  `0_11_0_12_0_13_0_4_-1_6_1002_5_1_7_0_15_1_18_0_8_1|1_0_2_` +
  `0_3_0_11_0_12_0_13_0_4_-1_6_1005_5_1_7_0_15_1_18_0_8_1|1_0_` +
  `2_0_3_0_11_0_12_0_13_0_4_-1_6_1006_5_1_7_0_15_1_18_0_8_1|` +
  `,kA13,32.5,kA15,0,kA16,0,kA14,,kA6,13,kA7,0,kA17,0,kA18,4,kS39,0,kA2,1,kA3,0,kA8,0,kA4,0,kA9,0,kA10,0,kA11,0;`*/

let rects = [
  {
    ratio: 1,
    id: 211,
    scale: 1,
  },
  {
    ratio: 1 / 3,
    id: 579,
    scale: 1,
  },

  {
    ratio: 1 / 15,
    id: 1757,
    scale: 2,
  },
  {
    ratio: 1 / 30,
    id: 1753,
    scale: 1,
  },
]
let opacity = 122 / 255
/*let str = `kS38,1_0_2_255_3_255_6_990_7_${opacity.toFixed(
  2
)}_8_1_5_0,kA13,0,kA15,0,kA16,0,kA14,,kA6,13,kA7,0,kA17,0,kA18,4,kS39,0,kA2,1,kA3,0,kA8,0,kA4,0,kA9,0,kA10,0,kA11,0;`*/

let str = fs.readFileSync("levelstring.txt")

//let stack_height = 3

const vid_name = "last_part_revised_"

const w = 600
const h = 300

async function drawAll() {
  let x = 0
  let y = stack_height

  const flickerMargin = 10

  let off
  function reset_off() {
    off = {
      x: w * stack_spacing * x - 8 * 30, // + (300 - w / 2) + 10 * 30, //spacing * Math.floor((f + 1) / stack_height),
      y: h * frame_y_spacing * (y + 1) - 30 + 9 * 30, // + (150 - h / 2), //300 + spacing * ((f + 1) % stack_height),
    }
  }
  reset_off()

  function new_stack_frame(f) {
    //new frame stack
    group++

    str += `1,1765,2,${off.x - 30 * 2 + global_off},3,${150 + h / 2 + safetyOffset},57,${group}.${target_group};` //add frame target

    //target: 1765
    str +=
      "1,901," + //move target in
      `2,${f * FRAMESPACING + global_off},` +
      `3,30,` +
      `71,${group3},` +
      `100,1,` +
      `101,0,` +
      `51,${group};`

    str += `1,901,2,${f * FRAMESPACING - flickerMargin + global_off},3,285,58,1,51,${group},10,${stack_height * 0.15};` //move target to follow x

    group++

    str +=
      "1,1049," + //delete frame stacks at start
      `2,0,` +
      `3,${f + 30},` +
      `56,0,` +
      `51,${group};`

    str +=
      "1,1347," + //follow target
      `2,${f * FRAMESPACING - flickerMargin + global_off},` +
      `3,180,` +
      `10,${stack_height * 0.15},` +
      `72,1,73,1,` +
      `71,${group - 1},` +
      `51,${group};`

    str +=
      "1,1049," + //activate frame stack
      `2,${f * FRAMESPACING - flickerMargin + global_off},` +
      `3,150,` +
      `56,1,` +
      `51,${group};`

    //objCount += 8
  }

  new_stack_frame(-1)

  for (let f = 0; f <= FRAMES; f++) {
    y++
    reset_off()

    //copied from xolis code
    if (y > stack_height) {
      y = 0
      x++
      reset_off()

      str +=
        "1,901," + //move frame out of the way
        `2,${f * FRAMESPACING + global_off},` +
        `3,0,` +
        `28,${-1800},` +
        `51,${group};`

      str +=
        "1,1049," + //delete frame stack
        `2,${f * FRAMESPACING + flickerMargin + global_off},` +
        `3,120,` +
        `56,0,` +
        `51,${group};`

      new_stack_frame(f)
    } else {
      str += `1,901,2,${f * FRAMESPACING + global_off},3,0,29,${-h * frame_y_spacing},51,${group};`
      //objCount++
    }

    //console.log("rendering image: " + f)

    if (f <= 409) {
      let path = "frames/color/" + vid_name + ("000000" + f).slice(-6) + ".json"
      let imgPath = "frames/frame_images/" + vid_name + ("000000" + f).slice(-6) + ".png"

      let image_data = JSON.parse(fs.readFileSync(path)).shapes

      if (image_data.length > 0) {
        let getAvgColor = new Promise((resolve, reject) => {
          imgAvg(imgPath, (err, color) => {
            if (err) throw err
            str += `1,29,2,${f * FRAMESPACING + global_off},3,${-30},7,${color[0]},8,${color[1]},9,${color[2]};` // change bg
            resolve()
          })
        })
        await getAvgColor
      }
      //draw img
      await drawImage(
        image_data,
        {
          x: off.x + global_off,
          y: off.y,
        },
        group,
        350,
        1.7
      )
    } else {
      str += `1,29,2,${f * FRAMESPACING + global_off},3,${0},7,${0},8,${0},9,${0};` // change bg
      if (f == 409 + 1) {
        str += `1,899,2,${f * FRAMESPACING + global_off},3,${0},7,${0},8,${0},9,${0},35,0,23,1;` // change bg
      }
      //coloring size: 3/8
      if (f - 409 <= 270)
        str += drawOutline(
          f - 409,
          {
            x: off.x + 20 + global_off,
            y: off.y,
          },
          group
        )

      //247
      if (f - 409 > 188) {
        let path = "frames/color/" + "end_seq_color_" + ("000000" + (f - 409 - 188)).slice(-6) + ".json"
        let image_data = JSON.parse(fs.readFileSync(path)).shapes

        await drawImage(
          image_data,
          {
            x: off.x + 5 * 30 + 5 + global_off,
            y: off.y - 1 * 30 - 4,
          },
          group,
          300,
          1.7 * (3 / 8) * 1.5
        )
      }
    }

    //console.log(str)
  }

  str += `1,1765,2,${300 - w / 2 + global_off},3,${150 + h / 2},57,${group3}.${bg_group}.${target_group};` //target on top left
  str += `1,1007,2,${global_off},3,-30,51,${target_group};` //hide target

  str += `1,901,2,${global_off},3,285,58,1,51,${bg_group},10,240;` //move stuff
  str += `1,901,2,${global_off - 60},3,300,28,-225,51,${bg_group};` //move stuff

  //str += `1,1612,2,0,3,300;` //hide player
  //str += `1,1819,2,0,3,330;` //bg shit

  //delete bg at end
  str += `1,1049,2,${FRAMES * FRAMESPACING + global_off},3,30,56,0,51,${bg_group};`
  //delete last frame stack
  str += `1,1049,2,${FRAMES * FRAMESPACING + global_off},3,30,56,0,51,${group};`

  //delete bg at start
  str += `1,1049,2,${0},3,30,56,0,51,${bg_group};`

  //reveal bg at anim start
  str += `1,1049,2,${global_off},3,30,56,1,51,${bg_group};`

  let scaling = 25
  let mscaling = 8
  //(300 - w/2) - scaling * 15
  //(150 - h/2) - scaling * 15
  str += `1,211,2,${300 - w / 2 - mscaling * 15 + 2 * 30 + global_off},3,${
    150 + 30 * 9
  },24,9,25,8,32,${mscaling},57,${bg_group},21,1;` //left side
  str += `1,211,2,${300 + w / 2 + mscaling * 15 - 2 * 30 + global_off},3,${
    150 + 30 * 9
  },24,9,25,8,32,${mscaling},57,${bg_group},21,1;` //right side

  str += `1,211,2,${300 + global_off},3,${
    150 + h / 2 + scaling * 15 + 30 * 10 - 30 * 2
  },24,9,25,8,32,${scaling},57,${bg_group},21,1;` //top side
  str += `1,211,2,${300 + global_off},3,${
    150 - h / 2 - scaling * 15 + 30 * 10
  },24,9,25,8,32,${scaling},57,${bg_group},21,1;` //bottom side

  //LEVEL SPECIFIC
  str += `1,1007,2,${global_off + FRAMES * FRAMESPACING},3,-30,51,7,35,1;` //overlap
  str += `1,1616,2,${global_off + FRAMES * FRAMESPACING + 300},3,-30,51,902;` //stop

  console.log("Group:", group)
  fs.writeFileSync("levelstring.txt", str)
}

drawAll()

async function drawImage(shapes, offset, stack_group, shape_num, image_scale) {
  //str += drawOutline(f, offset)

  //let bg = shapes.shift().color

  //str += `1,29,2,${f * frame_y_spacing},3,${0},7,${bg[0] * opacity},8,${bg[1] * opacity},9,${bg[2] * opacity};` // change bg
  /*if (offset.y == 300 && f > 0) {
    str += `1,901,2,${f * frame_y_spacing},3,${30},28,${-spacing},29,${spacing * (stack_height - 1)},51,1;` // move frame
  } else {
    str += `1,901,2,${f * frame_y_spacing},3,${30},29,${-spacing},51,1;` // move frame
  }*/

  //let image_scale = 1.7 //1.5 * 0.4
  for (let i = 0; i < shape_num; i++) {
    let shape = shapes[i]
    let color = hsv(shape.color[0], shape.color[1], shape.color[2])
    switch (shape.type) {
      case 2:
        //rectangle

        //find what rectangle it is
        let ratio = Math.abs(shape.data[3] - shape.data[1]) / Math.abs(shape.data[2] - shape.data[0])

        let sval = Infinity,
          sindex = 0
        rects.forEach((rect, j) => {
          let diff = Math.abs(rect.ratio - ratio)
          if (diff < sval) {
            sval = diff
            sindex = j
          }
        })

        //find the position
        let position = {
          x: (shape.data[2] + shape.data[0]) * 0.5 * image_scale,
          y: (shape.data[3] + shape.data[1]) * 0.5 * image_scale,
        }

        //find scale
        let scale = (Math.abs(shape.data[2] - shape.data[0]) * rects[sindex].scale * image_scale) / 30

        //add the object
        //str += `1,${rects[sindex].id},2,${position.x},2,${position.y},6,${shape.data[4]},32,${scale};`
        if (scale > 0.001)
          str +=
            `1,${rects[sindex].id},` +
            `2,${(offset.x + position.x).toFixed(3)},` +
            `3,${(offset.y - position.y).toFixed(3)},` +
            `6,${shape.data[4]},` +
            `41,1,` +
            `43,${map(color[0], 0, 360, -180, 180)}a${map(color[1], 0, 100, 0, 1)}a${map(
              color[2],
              0,
              100,
              0,
              1
            )}a0a0,` +
            `32,${scale.toFixed(3)},` +
            `21,${col},` +
            `24,${7},` +
            `25,${1010 + i},57,${stack_group}`

        break

      case 32:
        //circle

        let s = (shape.data[2] * 4 * image_scale) / 15

        if (s > 0.001)
          str +=
            `1,1764,` +
            `2,${(offset.x + shape.data[0] * image_scale).toFixed(3)},` +
            `3,${(offset.y - shape.data[1] * image_scale).toFixed(3)},` +
            `41,1,` +
            `43,${map(color[0], 0, 360, -180, 180)}a${map(color[1], 0, 100, 0, 1)}a${map(
              color[2],
              0,
              100,
              0,
              1
            )}a0a0,` +
            `32,${s.toFixed(3)},` +
            `21,${col},` +
            `24,${7},` +
            `25,${1010 + i},57,${stack_group}`

        break
    }
    if (i > ldQuality) str += ",103,1"
    str += ";"
  }
}

//python levelStringDecrypt.py && node coloring.js && python levelStringEncrypt.py

function map(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}
