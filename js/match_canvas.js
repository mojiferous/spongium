/**
 * canvas object to handle matching
 * @param main_canvas
 * @param box_width
 * @param box_height
 * @param sq_across
 * @param sq_high
 */

//this is the "infill" value, what the app replaces blank tiles with, in this case the 5-fingered hand
var kINFILL_VAL = 12;

function Match_canvas(main_canvas, box_width, box_height, sq_across, sq_high, game_type) {
  this.canvas = main_canvas.getContext('2d');
  this.sprites = document.getElementById('sprites');

  //set up the parts of the canvas
  this.b_width = box_width;
  this.b_height = box_height;
  this.across = sq_across;
  this.high = sq_high;
  this.tot_width = this.b_width*this.across;
  this.tot_height = this.b_height*this.high;

  this.values = [];
  this.temp_vals = [];

  this.color_vals = 12;

  this.has_matches = false;
  this.anim_level = 0;

  this.game_type = game_type;

  this.init();
}

/**
 * init a basic canvas
 */
Match_canvas.prototype.init = function(){
  var x; var y;
  for(x=0; x<this.across; x++) {
    this.values[x] = [];
    for(y=0; y<this.high; y++) {
      this.values[x][y] = Math.round(Math.random()*(this.color_vals-1));
    }
  }
  this.clear_canvas();
};

/**
 * clear the canvas
 */
Match_canvas.prototype.clear_canvas = function() {
//  this.canvas.clearRect(0,0,this.tot_width,this.tot_height);
  this.canvas.fillStyle = "black";
  this.canvas.fillRect(0, 0, this.tot_width, this.tot_height);
};

/**
 * draw the canvas
 */
Match_canvas.prototype.draw_canvas = function() {
  var x; var y;
  for(x=0; x<this.across; x++) {
    for(y=0; y<this.high; y++) {
      this.draw_background(x,y);
      this.draw_box(x,y,0,0);
    }
  }
};

/**
 * draw an individual box at x,y and with offset_x,offset_y
 * @param x
 * @param y
 * @param offset_x
 * @param offset_y
 */
Match_canvas.prototype.draw_box = function(x,y,offset_x,offset_y) {
  this.canvas.drawImage(this.sprites, (this.values[x][y]+1)*60, 0, 60, 60, (this.b_width*x)+offset_x, (this.b_height*y)+offset_y, this.b_width, this.b_height);
};

/**
 * draw the background tiles
 * @param x
 * @param y
 */
Match_canvas.prototype.draw_background = function(x,y) {
  this.canvas.drawImage(this.sprites, 0, 0, 60, 60, (this.b_width*x), (this.b_height*y), this.b_width, this.b_height);
};

/**
 * draw the draw from an event
 * @param box_x
 * @param box_y
 * @param drag_direction
 * @param offset_x
 * @param offset_y
 */
Match_canvas.prototype.draw_drag = function(box_x, box_y, drag_direction, offset_x, offset_y) {
  switch (drag_direction) {
    case 1:
      //dragging up
      this.draw_column(box_x, offset_y, true);
      if(offset_y < 0) {
        this.draw_column(box_x, offset_y+this.tot_height, false);
      } else {
        this.draw_column(box_x, offset_y-this.tot_height, false);
      }
      break;
    case 2:
      //dragging right
      this.draw_row(box_y, offset_x, true);
      if(offset_x > 0) {
        this.draw_row(box_y, offset_x-this.tot_width, false);
      } else {
        this.draw_row(box_y, offset_x+this.tot_width, false);
      }
      break;
    case 3:
      //dragging down
      this.draw_column(box_x, offset_y, true);
      if(offset_y > 0 ) {
        this.draw_column(box_x, offset_y-this.tot_height, false);
      } else {
        this.draw_column(box_x, offset_y+this.tot_height, false);
      }
      break;
    case 4:
      //dragging left
      this.draw_row(box_y, offset_x, true);
      if(offset_x < 0) {
        this.draw_row(box_y, offset_x+this.tot_width, false);
      } else {
        this.draw_row(box_y, offset_x-this.tot_width, false);
      }
      break;
  }
};

/**
 * redraw a row from a drag
 * @param row
 * @param offset
 * @param should_clear (should the canvas be cleared?)
 */
Match_canvas.prototype.draw_row = function(row, offset, should_clear) {
  var x;
  if(should_clear == true) {
    this.canvas.fillStyle = "black";
    this.canvas.fillRect(0,row*this.b_height,this.tot_width,this.b_height);

    //draw the background
    for(x=0; x<this.across; x++) {
      this.draw_background(x,row);
    }
  }

  for(x=0; x<this.across; x++) {
    this.draw_box(x,row,offset,0);
  }
};

/**
 * redraw a column from a drag
 * @param column
 * @param offset
 * @param should_clear (should the canvas be cleared? set to a value when the fill is happening)
 */
Match_canvas.prototype.draw_column = function(column, offset, should_clear) {
  var y;
  if(should_clear == true) {
    this.canvas.fillStyle = "black";
    this.canvas.fillRect(column*this.b_width,0,this.b_width,this.tot_height);

    //draw the background
    for(y=0; y<this.high; y++) {
      this.draw_background(column,y);
    }
  }

  for(y=0; y<this.high; y++) {
    this.draw_box(column,y,0,offset);
  }
};

/**
 * code for drawing partially offset columns for the "dropping" effect when matches are made
 * @param column
 * @param start
 * @param num_boxes
 * @param offset
 */
Match_canvas.prototype.draw_partial_column = function(column, start, num_boxes, offset) {
  var y;
  this.canvas.fillStyle = "black";
  this.canvas.fillRect(column*this.b_width,start*this.b_height,this.b_width,num_boxes*this.b_height);

  for(y=start; y<(start+num_boxes); y++) {
    this.draw_background(column,y);
  }

  for(y=start; y<(start+num_boxes); y++) {
    this.draw_box(column,y,0,offset);
  }
};

/**
 * draw the dropping tiles
 */
Match_canvas.prototype.draw_drops = function() {
  var x; var y;
  for(x=0; x<this.across; x++) {
    var still_clean = true;
    for(y=(this.high-1); y>0; y--) {
      if(still_clean) {
        if(this.values[x][y] == -1) {
          still_clean = false;
          this.draw_partial_column(x,0,y,this.anim_level*(this.b_height/10));
        }
      }
    }
  }
};

/**
 * fill blank values from the bottom up
 */
Match_canvas.prototype.fill_blanks = function() {
  var x; var y;
  for(x=0; x<this.across; x++) {
    for(y=(this.high-1); y>0; y--) {
      if(this.values[x][y] == -1) {
        this.values[x][y] = this.values[x][y-1];
        this.values[x][y-1] = -1;
      }
    }
  }
};

/**
 * fill blank blocks from the top
 */
Match_canvas.prototype.infill_blocks = function() {
  var x;
  for(x=0; x<this.across; x++) {
    if(this.values[x][0] == -1) {
      if(this.game_type[kGAME_CLEAR_BOARD]) {
        //this game clears the board
        this.values[x][0] = kINFILL_VAL;
      } else {
        //this game replaces the cleared pieces
        this.values[x][0] = Math.round(Math.random()*(this.color_vals-1));
      }
    }
  }
};

/**
 * checks the board to see if fill is still necessary
 * @return {Boolean}
 */
Match_canvas.prototype.needs_fill = function() {
  var x; var y;
  var ret_val = false;
  for(x=0; x<this.across; x++) {
    for(y=0; y<this.high; y++) {
      if(this.values[x][y] == -1) {
        ret_val = true;
      }
    }
  }

  return ret_val;
};

/**
 * snap the row into place after drag
 * @param row
 * @param offset
 */
Match_canvas.prototype.snap_row = function(row, offset) {
  var x;
  var move_amount = Math.round(offset/this.b_width)*-1;

  var vals = [];
  for(x=0; x<this.across; x++) {
    var new_val = x+move_amount;

    if (new_val < 0 ){
      new_val = this.across + new_val;
    }
    if (new_val > (this.across-1)) {
      new_val = 0 + (new_val-this.across);
    }

    vals[x] = this.values[new_val][row];
  }

  for(x=0; x<this.across; x++) {
    this.values[x][row] = vals[x];
  }

  this.clear_canvas();
  this.draw_canvas();

  return move_amount > 0;
};

/**
 * snap a column into place after drag
 * @param column
 * @param offset
 */
Match_canvas.prototype.snap_column = function(column, offset) {
  var y;
  var move_amount = Math.round(offset/this.b_height)*-1;

  var vals = [];
  for(y=0; y<this.high; y++) {
    var new_val = y+move_amount;

    if(new_val < 0) {
      new_val = this.high + new_val;
    }
    if(new_val > (this.high-1)) {
      new_val = 0 + (new_val-this.high);
    }

    vals[y] = this.values[column][new_val];
  }

  for(y=0; y<this.high; y++) {
    this.values[column][y] = vals[y];
  }

  this.clear_canvas();
  this.draw_canvas();

  return move_amount > 0;
};


/**
 * function to determine how many match 3+ matches there are on the board, and clear them
 */
Match_canvas.prototype.set_matches = function() {
  var x; var y;
  for(x=0; x<this.across; x++) {
    for(y=0; y<this.high; y++) {
      this.temp_vals = [];
      //take the current board and clone it, so the value check function can set values to -1 and not worry
      //about messing with the live value arrays
      this.clone_values(this.temp_vals, this.values);

      //save the block value and the number of like blocks so we can process the results later
      var block_val = this.temp_vals[x][y];
      var like_val = this.return_like_values_from_point(x,y,block_val);
      if(like_val > 2) {
        //@todo add handling for scoring, etc. here
        //set blocks of three or more to -1
        this.clone_values(this.values, this.temp_vals);

        this.has_matches = true;
      }
    }
  }

  //clear and redraw
  this.clear_canvas();
  this.draw_canvas();
};


/**
 * function to clone arrays while leaving the original intact,
 * used since javascript assignment passes the array by reference
 * @param array_a
 * @param array_b
 */
Match_canvas.prototype.clone_values = function(array_a, array_b) {
  var xx;
  var yy;
  for(xx=0; xx<this.across; xx++) {
    array_a[xx] = [];
    for(yy=0; yy<this.high; yy++) {
      array_a[xx][yy] = array_b[xx][yy];
    }
  }
};


/**
 * regressive function to return a value for boxes of like color adjacent to the passed box
 * @param x
 * @param y
 * @param box_val
 * @return {Number}
 */
Match_canvas.prototype.return_like_values_from_point = function(x,y, box_val) {
  var ret_val = 0;

  if(this.temp_vals[x][y] >= kINFILL_VAL) {
    //this is a holder value, don't count it
    return 0;
  }

  if(this.temp_vals[x][y] > -1) {
    //set this block to -1 so it isn't counted twice. The return value starts at 1, since it includes this block
    this.temp_vals[x][y] = -1;
    ret_val = 1;
  } else {
    //if this block is set to -1, it has already been counted, return 0
    return 0;
  }

  if(x > 0) {
    //is the box to the left the same?
    if(this.temp_vals[x-1][y] == box_val) {
      ret_val+=this.return_like_values_from_point(x-1,y,box_val);
    }
  }
  if(y > 0) {
    //is the box above the same?
    if(this.temp_vals[x][y-1] == box_val) {
      ret_val+=this.return_like_values_from_point(x,y-1,box_val);
    }
  }
  if(x < (this.across-1)) {
    //how about the box to the right?
    if(this.temp_vals[x+1][y] == box_val) {
      ret_val+=this.return_like_values_from_point(x+1,y,box_val);
    }
  }
  if(y < (this.high-1)) {
    //and the box to the left?
    if(this.temp_vals[x][y+1] == box_val) {
      ret_val+=this.return_like_values_from_point(x,y+1,box_val);
    }
  }

  return ret_val;
};