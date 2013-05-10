/*
 * app.js
 *
 * jQuery controls for the app
 *
 * Mojiferous
 * 1/30/12
 */

var g_canvas;
var main_canvas;

var mouse_down = false;
var m_loc = [];

//the current direction that the box is moving, 1 is up, 2 is right, 3 is down, 4 is left
var box_move = 0;

var can_width = 600;
var can_height = 600;
var box_height = 60;
var box_width = 60;
var can_x = 10;
var can_y = 10;

var cur_box = [];
var cur_loc = [];

$(window).load(function() {
  //init our canvas and everything else on window load
  main_canvas = document.getElementById('board-canvas');

  if (main_canvas.getContext) {
    g_canvas = new Match_canvas(main_canvas, box_width, box_height, can_x, can_y);

    g_canvas.draw_canvas();
  }

  $(main_canvas).mousedown(function(event) {
    //get the current mouse event xy
    m_loc[0] = event.offsetX;
    m_loc[1] = event.offsetY;
    //determine the current box
    figure_box(m_loc[0],m_loc[1]);

    //mousedown prevents mousemove events from firing without a pressed mouse
    mouse_down = true;
  });
  $(main_canvas).mouseup(function(event) {
    //reset the mousedown and movement variables
    mouse_down = false;
    if (box_move == 1 || box_move == 3) {
      g_canvas.snap_column(cur_box[0],cur_loc[1]);
    } else if (box_move == 2 || box_move ==4) {
      g_canvas.snap_row(cur_box[1],cur_loc[0]);
    }
    box_move = 0;

    g_canvas.set_matches();
    if(g_canvas.has_matches) {
      animate_drops();
    }
  });

  $(main_canvas).mousemove(function(event) {
    //bind the mousemove event to figure when the mouse is being dragged
    if(mouse_down) {
      cur_loc = [];
      cur_loc[0] = -(m_loc[0] - event.offsetX);
      cur_loc[1] = -(m_loc[1] - event.offsetY);

      if(box_move == 0) {
        figure_box_move(cur_loc[0],cur_loc[1]);
      }

      g_canvas.draw_drag(cur_box[0], cur_box[1], box_move, cur_loc[0], cur_loc[1]);

    }
  });
});

/**
 * set a timeout and animation for the dropping blocks
 */
function animate_drops() {
  g_canvas.anim_level++;
  var still_fill = true;
  g_canvas.draw_drops();
  if(g_canvas.anim_level == 10) {
    g_canvas.fill_blanks();
    g_canvas.infill_blocks();
    g_canvas.anim_level = 0;

    //check to see if there are still blank blocks
    still_fill = g_canvas.needs_fill();
    g_canvas.draw_drops();
  }


  //only continue the animation if there are blank blocks
  if(still_fill) {
    var t = setTimeout('animate_drops()',10);
  } else {
    g_canvas.clear_canvas();
    g_canvas.draw_canvas();
  }
}

/**
 * boxes have moved less than a single box wide or high
 * @param x
 * @param y
 * @return {Boolean}
 */
function less_than_single_box(x,y) {
  var tot_x = Math.abs(x);
  var tot_y = Math.abs(y);
  return tot_x < (box_width + 1) && tot_y < (box_height + 1);
}

/**
 * determine which box is currently being dragged
 * @param x
 * @param y
 */
function figure_box(x,y){
  cur_box[0] = Math.floor(x/box_width);
  cur_box[1] = Math.floor(y/box_height);
}


/**
 * determine which direction the box is being dragged
 * @param x
 * @param y
 */
function figure_box_move(x,y) {
  var abs_x = Math.abs(x);
  var abs_y = Math.abs(y);

  if(abs_x > abs_y) {
    //the box is moving in the x direction
    if(x > 0) {
      //moving right
      box_move = 2;
    } else {
      //moving left
      box_move = 4;
    }
  } else {
    //the box is moving in the y direction
    if(y > 0) {
      //moving down
      box_move = 3;
    } else {
      //moving up
      box_move = 1;
    }
  }
}