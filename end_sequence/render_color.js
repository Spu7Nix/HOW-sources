//images -> shapes using geometrize

const fs = require("fs")

const util = require("util")

const FRAMECOUNT = 163
const FRAMESTART = 0

const exec = util.promisify(require("child_process").exec)

async function render() {
  for (let i = 0; i < FRAMECOUNT; i++) {
    let num = ("000000" + (i + FRAMESTART)).slice(-6)

    let arg_str = `frames/frame_images/end_seq_color_${num}.png
frames/color/end_seq_color_${num}.json
frames/color/end_seq_color_${num}.png`

    fs.writeFileSync("geometrize_args.txt", arg_str)

    console.log(`Started drawing ${num}`)

    await exec("geometrize --script_file D:/svg-to-gd/gd-image-maker.chai")
  }
}

render()
