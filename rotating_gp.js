// WARNING: BAD MESSY SPAGHETTI CODE AHEAD
// MAY CAUSE SEVERE HEADACHES
// IM NOT KIDDING

const fs = require("fs")

let str = ";"

let color = 500
let group = 1

const color_offset = 0

let trigger_y_start = 1200

let trigger_y = []

function get_trigger_y(x) {
  if (x < trigger_y.length) {
    trigger_y[x] += 30
    return trigger_y[x]
  } else {
    while (trigger_y.length <= x) {
      trigger_y.push(trigger_y_start)
    }
    return trigger_y[x]
  }
}

let obj_count = 0

let start_col_index = 0

const scale = 0.6

let group_map = {}

function get_group_from_key(key) {
  if (!group_map.hasOwnProperty(key)) group_map[key] = group++
  return group_map[key]
}
/*
//204, 252, 255
let r_factor = 204 * (1 / 255)
let g_factor = 252 * (1 / 255)
let b_factor = 255 * (1 / 255)

//235, 122, 122

let r_factor2 = 235 * (1 / 255)
let g_factor2 = 122 * (1 / 255)
let b_factor2 = 122 * (1 / 255)

let color_change_x = 106.5 * 30
*/

let part_colors = [
  {
    //130, 132, 158
    start: 0,
    r_factor: 130 * (1 / 255),
    g_factor: 132 * (1 / 255),
    b_factor: 158 * (1 / 255),
  },

  {
    start: 237 * 30,
    r_factor: 204 * (1 / 255),
    g_factor: 252 * (1 / 255),
    b_factor: 255 * (1 / 255),
  },

  {
    start: (232 + 86) * 30,
    r_factor: 235 * (1 / 255),
    g_factor: 122 * (1 / 255),
    b_factor: 122 * (1 / 255),
  },
]

function get_color_at(position) {
  for (let i = part_colors.length - 1; i >= 0; i--) {
    if (position > part_colors[i].start) return part_colors[i]
  }
}

//shadow: 1011

//idk why i called it ufo gp its really both parts
let gp = JSON.parse(fs.readFileSync("ufo_gp.json"))

let h = 0
for (b of gp) if (b.y > h) h = b.y
console.log(h)

function gp_get_column(x, layer, placement, part) {
  //console.log("INPUT:", x, layer, placement)

  /* theres an issue now, but it looks like it might just fix itself when i add max and min length so :shrug: */

  let layout = {
    //sides
    first: [],
    last: [],
    pillar: [],
  }
  let first = {
    len_count: 0,
    start_y: 0,

    max_start_y: 0,
  }
  let last = {
    len_count: 0,
    start_y: 0,

    max_start_y: 0,
  }

  let pillar = {
    len_count: 0,
    start_y: 0,

    max_start_y: 0,
  }

  function end_beam_first(y, group) {
    //find max len
    let max_ad_len = 0 //max aditional length

    for (let y2 = y; y2 < h; y2++) {
      if (gp_get_coord(x, y2, layer, part).type == 0) {
        max_ad_len++
      } else {
        break
      }
    }

    if (first.len_count > 0) {
      layout.first.push({
        start: first.start_y,
        length: first.len_count,

        max_start: first.max_start_y,
        max_length: first.len_count + max_ad_len, //max start is the length after the main start, not the max start

        hits_edge: first.max_start_y == 0 ? 1 : first.start_y + first.len_count + max_ad_len >= h ? -1 : 0, //-1 = hits bottom, 0 = no hit, 1 = hits top
        group,
      })
    }
    first.len_count = 0
    first.start_y = y + 1
  }

  function end_beam_last(y, group) {
    let max_ad_len = 0 //max aditional length

    for (let y2 = y; y2 < h; y2++) {
      if (gp_get_coord(x, y2, layer, part).type == 0) {
        max_ad_len++
      } else {
        break
      }
    }
    if (last.len_count > 0) {
      layout.last.push({
        start: last.start_y,
        length: last.len_count,

        max_start: last.max_start_y,
        max_length: last.len_count + max_ad_len, //max start is the length after the main start, not the max start

        hits_edge: last.max_start_y == 0 ? 1 : last.start_y + last.len_count + max_ad_len >= h ? -1 : 0, //-1 = hits bottom, 0 = no hit, 1 = hits top
        group,
      })
    }
    last.len_count = 0
    last.start_y = y + 1
  }

  function end_beam_pillar(y, group) {
    let max_ad_len = 0 //max aditional length

    for (let y2 = y; y2 < h; y2++) {
      if (gp_get_coord(x, y2, layer, part).type == 1) {
        max_ad_len++
      } else {
        break
      }
    }
    if (pillar.len_count > 0) {
      layout.pillar.push({
        start: pillar.start_y,
        length: pillar.len_count,

        max_start: pillar.max_start_y,
        max_length: pillar.len_count + max_ad_len, //max start is the length after the main start, not the max start

        hits_edge: pillar.max_start_y == 0 ? 1 : pillar.start_y + pillar.len_count + max_ad_len >= h ? -1 : 0, //-1 = hits bottom, 0 = no hit, 1 = hits top
        group,
      })
    }
    pillar.len_count = 0
    pillar.start_y = y + 1
  }
  let latest_group = -1
  for (let y = 0; y < h; y++) {
    //first check if theres anything there at all
    let obj = gp_get_coord(x, y, layer, part)
    if (obj.type == 0) {
      if (obj.hasOwnProperty("group")) {
        latest_group = obj.group
      } else {
        latest_group = -1
      }

      let first_side, last_side //blocks adjacent to the visible sides

      //REMEMBER: calculating with layer + 1 (1, 2, 3)
      switch (placement) {
        case 0:
          //first side is towards cylinder
          first_side = layer == 1 ? true : gp_get_coord(x, y, layer - 1, part).type == 0
          //last side is towards neg x
          last_side = gp_get_coord(x - 1, y, layer, part).type == 0
          break
        case 1:
          //first side is towards neg x
          first_side = gp_get_coord(x - 1, y, layer, part).type == 0
          //last side is away from cylinder
          last_side = layer == 3 ? false : gp_get_coord(x, y, layer + 1, part).type == 0
          break
        case 2:
          //first side is away from cylinder
          first_side = layer == 3 ? false : gp_get_coord(x, y, layer + 1, part).type == 0
          //last side is tpwards pos x
          last_side = gp_get_coord(x + 1, y, layer, part).type == 0
          break
        case 3:
          //first side is tpwards pos x
          first_side = gp_get_coord(x + 1, y, layer, part).type == 0
          //last side is towards cylinder
          last_side = layer == 1 ? true : gp_get_coord(x, y, layer - 1, part).type == 0
          break
      }

      //first side
      if (!first_side) {
        //console.log("first side extended")
        // nothing is adjacent to the first side
        first.len_count++
      } else {
        end_beam_first(y, latest_group)
      }
      //last side
      if (!last_side) {
        //console.log("last side extended")
        // nothing is adjacent to the last side
        last.len_count++
      } else {
        //console.log("last side beam end")
        end_beam_last(y, latest_group)
      }
    } else {
      //console.log("both side beam end")
      end_beam_first(y, latest_group)
      end_beam_last(y, latest_group)

      //if (obj_type != -1) y--

      //reached empty spot, so max is also reset
      first.max_start_y = y + 1
      last.max_start_y = y + 1
    }
  }
  end_beam_first(h, latest_group)
  end_beam_last(h, latest_group)
  //pillars
  for (let y = 0; y < h; y++) {
    let obj = gp_get_coord(x, y, layer, part)
    if (obj.type == 1) {
      if (obj.hasOwnProperty("group")) {
        latest_group = obj.group
      } else {
        latest_group = -1
      }
      pillar.len_count++
    } else {
      end_beam_pillar(y, latest_group)
      pillar.max_start_y = y + 1
    }
  }
  end_beam_pillar(h, latest_group)

  return layout
}

//TODO: backside still not working properly with single space in the middle for some reason

function gp_get_coord(x, y, layer, part) {
  for (obj of gp) {
    if (obj.x == x && obj.y == y && layer == obj.l && part == obj.p) {
      let ret = { type: obj.t }
      if (obj.hasOwnProperty("g")) ret.group = obj.g
      return ret
    }
  }
  return { type: -1 } //-1 = no object
}
//cylinder: b2 (3), -5
str += `1,211,2,300,3,600,24,3,25,${-5},32,${(400 / 30).toFixed(3)};`
obj_count++

let pillar_main_color = color++
let pillar_dark_color = color++
let pillar_light_color = color++

console.log(`PILLAR COLORS: light: ${pillar_light_color}, main: ${pillar_main_color}, dark: ${pillar_dark_color}`)

const TEST_MODE = false
if (!TEST_MODE) {
  let density = 24 //how many columns per 90 degrees //24
  let repeats = 9 + 7

  let part_groups = [group++, group++]

  console.log("Part groups: ", part_groups)

  //loops over each possible "x position" denoted by n
  for (let n = 0; n < density; n++) {
    let spacing = 600
    //groups for the rotation effect
    let groups = [group++, group++, group++]
    //colors for the rotation effect
    let colors = [color++, color++, color++, color++, color++, color++]
    //hide each color at the start
    for (let i = 2; i < colors.length; i++) {
      hide_start_color(colors[i])
    }
    // start of the triggers (duh)
    let trigger_start = 300 + time_to_units((5.25 / 2 / density) * n)
    //loop through all the times the columns will be reused
    for (let r = 0; r < repeats; r++) {
      //add move + color triggers for each column
      animate_column(groups, colors, trigger_start + time_to_units(5.25 / 2) * r)
    }
    //loop through each layer (from 0 - bottom - to 2 - top)
    for (let l = 0; l < 3; l++) {
      //add movegroup, one for each side (back right, front right, front left, back left)
      let move_groups = [group++, group++, group++, group++]
      //loop through all the times the columns will be reused
      for (let r = 0; r < repeats; r++) {
        //generates one block in each side (back right, front right, front left, back left)
        for (let i = 0; i <= 3; i++) {
          //for z layer
          let order_factor = n + r * density

          let x = r * density + n + (3 - i) * density - 45 // position in gp

          move_movegroup(move_groups[i], i, trigger_start + time_to_units(5.25 / 2) * r, spacing, l)

          for (let part = 0; part < part_groups.length; part++)
            generate_column(
              //z layer
              i == 0 || i == 3 ? -1 : l == 0 && part == 1 ? 5 : 9,
              //z order
              //order is one lower/higher for each and every column
              (i < 2 ? -order_factor * 4 : order_factor * 4) + (i == 0 || i == 3 ? -l * 6 : l * 6),
              //placement (side) (back right, front right, front left, back left)
              i,
              //groups for rotation effect
              groups,
              //colors for rotation effect
              colors,
              //move group (for the "grand movement")
              move_groups[i],
              // x offset
              spacing * r,
              //gp layer
              l,
              //gp x (which column in the gp)
              x,
              part,
              part_groups[part]
            )
        }
      }
    }
  }
} else {
  let groups = [group++, group++, group++]
  let colors = [color++, color++, color++, color++, color++, color++]

  generate_column(
    9,
    //layer is one lower/higher for each and every column
    10,
    2,
    groups,
    colors,
    group++,
    1,

    2,
    5
  )

  move_movegroup(group, 1, 0, 1, 0)
  animate_column(groups, colors, 0, 0)
}

//*/

////////////////
/*


///////////*/

console.log(group_map)
console.log("FINAL OBJ COUNT: ", obj_count)

fs.writeFileSync("levelstring.txt", str)

//one 90 deg rotation
function move_movegroup(move_group, placement, trigger_start, spacing, gp_layer) {
  str += `1,901,2,${trigger_start.toFixed(3)},3,${get_trigger_y(Math.round(trigger_start / 30))},51,${move_group},28,${(
    (200 + 15 * scale + 30 * scale * gp_layer) *
    (placement == 0 || placement == 3 ? 1 : -1)
  ).toFixed(3)},30,${placement == 1 || placement == 3 ? 14 : 15},10,${5.25 / 2};`

  str += `1,901,2,${(trigger_start + time_to_units(5.25 / 2)).toFixed(3)},3,${get_trigger_y(
    Math.round(trigger_start / 30)
  )},51,${move_group},28,${
    //move back
    (-(200 + 15 * scale + 30 * scale * gp_layer) * (placement == 0 || placement == 3 ? 1 : -1) - spacing).toFixed(3)
  },10,0;`

  obj_count += 2
}

function generate_column(
  layer,
  order,
  placement,
  groups,
  colors,
  move_group,
  xoff,
  gp_layer,
  gp_x,
  gp_part,
  part_group
) {
  //placement: 0->3 clockwise from backside
  //groups: groups that will be used for the rotation
  //ypos: from 0 -> 5

  //calculate layouts
  let layout = gp_get_column(gp_x, gp_layer + 1, placement, gp_part)
  //console.log(layout)

  const pos = {
    x: 300 + 200 * (placement == 0 || placement == 2 ? 0 : placement == 1 ? 1 : -1) + xoff,
    y: 300,
  }

  let left_edge = groups[0]
  let middle_edge = groups[1]
  let right_edge = groups[2]

  let front_color = colors[2]
  let back_color = colors[3]
  let front_color2 = colors[4]
  let back_color2 = colors[5]

  let hue_factor = gp_layer * 10
  let saturation_factor = 0.7 + (3 - gp_layer) / 6
  let brightness_factor = 0.7 + gp_layer / 3

  let hsb = `,41,1,42,1,43,${hue_factor}a${saturation_factor}a${brightness_factor}a0a0,44,${hue_factor}a${saturation_factor}a${brightness_factor}a0a0`
  let black = `,41,1,42,1,43,0a0a0a0a0,44,0a0a0a0a0`

  //anim (0 deg -> 45 deg)
  //front left

  pushout = (placement == 0 || placement == 2 ? 0 : placement == 1 ? 1 : -1) * 15 * scale

  layer_pushout = gp_layer * pushout * 2

  //makes one side of a beam

  function fill_beam(
    beam,
    obj,
    x_pos,
    y_p,
    obj_len,
    s,
    color1,
    color2,
    group_string,
    group_string2,
    o,
    hack,
    draw_part1,
    draw_part2
  ) {
    let beam_group_string = beam.group == -1 ? "" : `.${get_group_from_key(beam.group)}`
    let set_edge = (start_y) => {
      let y_pos = y_p + start_y // - (30 / 2) * 1.5 * scale + 31.5 //idk why this works it just does (should change if i change scale)
      if (draw_part1 && placement != 0) {
        str += `1,${obj},6,-90,2,${x_pos},3,${y_pos},25,${o},57,${group_string}.${part_group}${beam_group_string},32,${(
          scale * s
        ).toFixed(3)},21,${color1},24,${layer}${hsb};`
        obj_count++
      }

      if (draw_part2 && placement != 3) {
        str += `1,${obj},6,-90,2,${x_pos},3,${y_pos},25,${o},57,${group_string2}.${part_group}${beam_group_string},32,${(
          scale * s
        ).toFixed(3)},21,${color2},24,${placement == 2 && gp_layer != 2 && gp_part == 0 ? layer - 4 : layer}${hsb};`
        obj_count++
      }
    }

    if (beam.hits_edge == 0) {
      /*for (let i = 0; i < Math.max(beam.length - 1, 1); i += obj_len) {
        set_edge(i * 30 * scale)
      }*/
      let i = 0
      while (i < (hack ? beam.length : beam.length - 1)) {
        set_edge(i * 30 * scale)
        i += obj_len
      }
      if (beam.length % obj_len != 0) {
        //add extra edge to top
        set_edge((beam.length - obj_len) * 30 * scale)
      }
    } else if (beam.hits_edge == 1) {
      let i = 0
      do {
        set_edge((beam.length - obj_len - i) * 30 * scale)
        i += obj_len
      } while (i < beam.length)
    } else if (beam.hits_edge == -1) {
      let i = 0
      do {
        set_edge(i * 30 * scale)
        i += obj_len
      } while (i < beam.length)
    }
  }

  function placeBeam(beam, side) {
    if (beam.length < 4) {
      if (beam.max_length >= 4) {
        beam.length = 4
      } else if (beam.start_y - beam.max_start_y + beam.max_length >= 4) {
        if (beam.start_y - beam.max_start_y >= 4 - beam.length) {
          beam.length = 4
          beam.start_y = beam.start_y - (4 - beam.length)
        } else {
          beam.length = 4
          beam.start_y = beam.max_start_y
        }
      }
    }
    let bstart = beam.start * 30 * scale

    if (beam.length == 1 && beam.hits_edge == 0) {
      let x_pos_right = (pos.x + 7.5 * scale + pushout + layer_pushout).toFixed(3)
      let x_pos_left = (pos.x - 7.5 * scale + pushout + layer_pushout).toFixed(3)
      let y_pos = pos.y + 7.5 * scale + bstart

      fill_beam(
        beam,
        211,
        x_pos_left,
        y_pos,
        0.5,
        0.5,
        front_color,
        front_color2,
        `${left_edge}.${move_group}`,
        `${middle_edge}.${move_group}`,
        order + 1,
        true,
        side == 0, //first
        side == 1 //last
      )
      fill_beam(
        beam,
        211,
        x_pos_right,
        y_pos,
        0.5,
        0.5,
        front_color,
        front_color2,
        `${middle_edge}.${move_group}`,
        `${right_edge}.${move_group}`,
        order + 1,
        true,
        side == 0, //first
        side == 1 //last
      )
    } else if (beam.length < 7.5 && beam.hits_edge == 0) {
      //len > 1
      //use edge blocks
      //edge block id: 1191
      //front left
      let x_pos_right = (pos.x + 7.5 * scale + pushout + layer_pushout + 11.25 * 2 * scale).toFixed(3)
      let x_pos_left = (pos.x - 7.5 * scale + pushout + layer_pushout + 11.25 * 2 * scale).toFixed(3)
      let y_pos = bstart + pos.y - (30 / 2) * 1.5 * scale + 31.5

      fill_beam(
        beam,
        1191,
        x_pos_left,
        y_pos,
        2,
        2,
        front_color,
        front_color2,
        `${left_edge}.${move_group}`,
        `${middle_edge}.${move_group}`,
        order + 1,
        false,
        side == 0, //first
        side == 1 //last
      )
      fill_beam(
        beam,
        1191,
        x_pos_right,
        y_pos,
        2,
        2,
        front_color,
        front_color2,
        `${middle_edge}.${move_group}`,
        `${right_edge}.${move_group}`,
        order + 1,
        false,
        side == 0, //first
        side == 1 //last
      )
    } else {
      let x_pos_right = (pos.x + 4.5 + pushout + layer_pushout).toFixed(3)
      let x_pos_left = (pos.x - 15 * scale + 4.5 + pushout + layer_pushout).toFixed(3) //the 4.5 is also random measurment
      let y_pos = bstart + pos.y + 67.5
      //fill_beam(beam, 1757, x_pos_right, y_pos, 7.5)
      //fill_beam(beam, 1757, x_pos_left, y_pos, 7.5)
      fill_beam(
        beam,
        1757,
        x_pos_left,
        y_pos,
        7.5,
        15,
        front_color,
        front_color2,
        `${left_edge}.${move_group}`,
        `${middle_edge}.${move_group}`,
        order + 1,
        false,
        side == 0, //first
        side == 1 //last
      )
      fill_beam(
        beam,
        1757,
        x_pos_right,
        y_pos,
        7.5,
        15,
        front_color,
        front_color2,
        `${middle_edge}.${move_group}`,
        `${right_edge}.${move_group}`,
        order + 1,
        false,
        side == 0, //first
        side == 1 //last
      )
    }

    if (beam.length < 4 && beam.hits_edge == 0) {
      let x_pos = pos.x + pushout + layer_pushout
      let y_pos = pos.y + bstart + 15 * scale

      fill_beam(
        beam,
        211,
        x_pos,
        y_pos,
        1,
        1,
        back_color,
        back_color2,
        `${right_edge}.${move_group}`,
        `${left_edge}.${move_group}`,
        order,
        true,

        side == 1, //last
        side == 0 //first
      )
    } else {
      let x_pos = (pos.x + pushout + layer_pushout + 11.25 * 4 * scale).toFixed(3) //pos.x + pushout + layer_pushout
      let y_pos = pos.y + bstart + 60 * scale

      fill_beam(
        beam,
        1191,
        x_pos,
        y_pos,
        4,
        4,
        back_color,
        back_color2,
        `${right_edge}.${move_group}`,
        `${left_edge}.${move_group}`,
        order,
        false,
        side == 1, //last
        side == 0 //first
      )
    }
  }

  layout.first.forEach((beam) => {
    placeBeam(beam, 0)
  })
  layout.last.forEach((beam) => {
    placeBeam(beam, 1)
  })

  //PILLARS

  layout.pillar.forEach((beam) => {
    let bstart = beam.start * 30 * scale
    //create background beam
    if (beam.length < 4 && beam.hits_edge == 0) {
      let x_pos = pos.x + layer_pushout + pushout
      let y_pos = pos.y + bstart + 15 * scale

      fill_beam(
        beam,
        211,
        x_pos,
        y_pos,
        1,
        1,
        pillar_main_color,
        pillar_main_color,
        `${move_group}`,
        `${move_group}`,
        order - 2,
        true,

        true,
        true
      )
    } else {
      let x_pos = (pos.x + layer_pushout + pushout + 11.25 * 4 * scale).toFixed(3) //pos.x + pushout + layer_pushout
      let y_pos = pos.y + bstart + 60 * scale

      fill_beam(
        beam,
        1191,
        x_pos,
        y_pos,
        4,
        4,
        pillar_main_color,
        pillar_main_color,
        `${move_group}`,
        `${move_group}`,
        order - 2,
        false,

        true,
        true
      )
    }
    //shading obj: 1011
    //add left shading (bright)
    //add right shading (dark)
    let x_pos = pos.x + layer_pushout + pushout
    let y_pos = pos.y + bstart + 15 * scale
    let beam_group_string = beam.group == -1 ? "" : `.${get_group_from_key(beam.group)}`
    for (let y = 0; y < beam.length; y++) {
      /*str += `1,${obj},6,-90,2,${x_pos},3,${y_pos},25,${o},57,${group_string},32,${(scale * s).toFixed(
          3
        )},21,${color1},24,${layer}${hsb};` */

      for (let s = 0; s <= 1; s++) {
        str += `1,${1011},2,${x_pos},3,${y_pos + y * 30 * scale},6,${90 - 180 * s},32,${scale},25,${
          order - 1 + s
        },57,${move_group}.${part_group}${beam_group_string},21,${
          [pillar_dark_color, pillar_light_color][s]
        },24,${layer}${hsb};`
        obj_count++
      }
    }
  })
}

function animate_column(groups, colors, trigger_start) {
  let current_pos = trigger_start
  //color_trigger_y = 900

  let side_1 = colors[0]
  let side_2 = colors[1]

  let middle_col_val = 30
  let { r_factor, g_factor, b_factor } = get_color_at(current_pos)

  //254, 255, 224
  let highlight_col = {
    r: 254 * r_factor,
    g: 255 * g_factor,
    b: 224 * b_factor,
  }

  //26, 13, 43

  let shadow_col = {
    r: 15 * r_factor,
    g: 13 * g_factor,
    b: 18 * b_factor,
  }

  let middle_col = {
    r: middle_col_val * r_factor,
    g: middle_col_val * g_factor,
    b: middle_col_val * b_factor,
  }

  change_color(side_1, middle_col, 0, trigger_start)
  change_color(side_2, shadow_col, 0, trigger_start)

  change_color(side_1, highlight_col, 5.25 / 3, current_pos + 2)
  change_color(side_2, middle_col, 5.25 / 2, current_pos + 2)

  let left_edge = groups[0]
  let middle_edge = groups[1]
  let right_edge = groups[2]

  let front_color = colors[2]
  color_copy(front_color, side_1, current_pos)

  let back_color = colors[3]
  color_copy(back_color, side_2, current_pos)
  //moves

  str += `1,901,2,${current_pos.toFixed(3)},3,${get_trigger_y(Math.round(current_pos / 30))},51,${left_edge},28,${(
    -9 * scale
  ).toFixed(3)},30,15,10,${5.25 / 4},20,1;`
  str += `1,901,2,${current_pos.toFixed(3)},3,${get_trigger_y(Math.round(current_pos / 30))},51,${right_edge},28,${(
    9 * scale
  ).toFixed(3)},30,15,10,${5.25 / 4},20,1;`
  str += `1,901,2,${current_pos.toFixed(3)},3,${get_trigger_y(Math.round(current_pos / 30))},51,${middle_edge},28,${(
    -15 * scale
  ).toFixed(3)},30,0,10,${5.25 / 4},20,1;`

  obj_count += 3

  let front_color2 = colors[4]
  hide_color(front_color2, current_pos)
  let back_color2 = colors[5]
  hide_color(back_color2, current_pos)
  //moves  and color changes
  current_pos += time_to_units(5.25 / 4)
  trigger_y_start = 900

  color_copy(front_color2, side_2, current_pos)
  color_copy(back_color2, side_1, current_pos)

  hide_color(front_color, current_pos)
  hide_color(back_color, current_pos)

  str += `1,901,2,${current_pos.toFixed(3)},3,${get_trigger_y(Math.round(current_pos / 30))},51,${left_edge},28,${(
    9 * scale
  ).toFixed(3)},30,15,10,${5.25 / 4},20,1;`
  str += `1,901,2,${current_pos.toFixed(3)},3,${get_trigger_y(Math.round(current_pos / 30))},51,${right_edge},28,${(
    -9 * scale
  ).toFixed(3)},30,15,10,${5.25 / 4},20,1;`

  str += `1,901,2,${current_pos.toFixed(3)},3,${get_trigger_y(Math.round(current_pos / 30))},51,${middle_edge},28,${(
    30 * scale
  ).toFixed(3)},30,0,10,0,20,1;`
  str += `1,901,2,${current_pos.toFixed(3)},3,${get_trigger_y(Math.round(current_pos / 30))},51,${middle_edge},28,${(
    -15 * scale
  ).toFixed(3)},30,0,10,${5.25 / 4},20,1;`
  obj_count += 4

  current_pos += time_to_units(5.25 / 4)
  trigger_y_start = 900
}

function hide_start_color(id) {
  str += `1,899,2,${0},3,${start_col_index * 15},7,${0},8,${0},9,${0},35,0.0,23,${id},36,1;`
  obj_count++
  start_col_index++
}

function change_color(id, col, duration, current_pos) {
  str += `1,899,2,${(current_pos + color_offset).toFixed(3)},3,${get_trigger_y(
    Math.round(current_pos / 30)
  )},7,${col.r.toFixed(1)},8,${col.g.toFixed(1)},9,${col.b.toFixed(1)},23,${id},10,${duration};`
  obj_count++
  trigger_y_start += 30
}

function hide_color(id, current_pos) {
  str += `1,899,2,${(current_pos - color_offset).toFixed(3)},3,${get_trigger_y(
    Math.round(current_pos / 30)
  )},7,${0},8,${0},9,${0},35,0.0,23,${id},36,1,20,1;`
  obj_count++
  trigger_y_start += 30
}

function color_copy(id, source, current_pos) {
  //1,899,2,225,3,105,36,1,7,255,8,255,9,255,10,0,35,1,23,55,50,66;
  str += `1,899,2,${(current_pos + color_offset).toFixed(3)},3,${get_trigger_y(
    Math.round(current_pos / 30)
  )},7,255,8,255,9,255,23,${id},50,${source},10,0,20,1;`
  obj_count++
  trigger_y_start += 30
}

function time_to_units(time) {
  return 10.3761348908 * time * 30
}

/*
node rotating_gp.js && C:/Users/spu7n/AppData/Local/Programs/Python/Python37/python.exe d:/levelDebug/levelStringEncrypt.py
*/
