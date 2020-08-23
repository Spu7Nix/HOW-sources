//just for testing the outline

const fs = require("fs")
const { drawOutline } = require("./outline.js")

let str = ";"
const stack_height = 4
const spacing = 600

for (let f = 1; f <= 273; f++) {
  let off = {
    x: spacing * Math.floor(f / stack_height),
    y: 300 + spacing * (f % stack_height),
  }

  if (off.y == 300) {
    str += `1,901,2,${f * 10},3,${30},28,${-spacing},29,${spacing * (stack_height - 1)},51,1;` // move frame
  } else {
    str += `1,901,2,${f * 10},3,${30},29,${-spacing},51,1;` // move frame
  }

  str += drawOutline(f, off, 1)
}
fs.writeFileSync("levelstring.txt", str)

//node outline_test.js && C:/Users/spu7n/AppData/Local/Programs/Python/Python37/python.exe d:/svg-to-gd/levelStringEncrypt.py
