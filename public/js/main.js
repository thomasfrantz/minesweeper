var squareSize = 50;

var conf = {
  horiSize: 10,
  vertSize: 6,
  mineNumber: 20
};

function mineSweeper (div, conf){


  function isMine(mine, coord){
    return (mine.x === coord.x && mine.y === coord.y);
  };

  var isThere = memoize(function(mineField, coord){
    var already = false;
    mineField.forEach(function(mine){
      if(isMine(mine, coord)) {
        already = true;
      }
    });
    return already;
  });

  function setMines(conf){
    var mineField = [];
    var i = 0;
    while(i < conf.mineNumber){
      var coord = {
        "x" : Math.floor(Math.random()*conf.horiSize),
        "y" : Math.floor(Math.random()*conf.vertSize)
      };
      if(!isThere(mineField, coord)){
        mineField.push(coord);
        i++; 
      }
    }
    return mineField;
  }

  var state = {
    "board" : div,
    "conf" : conf,
    "mineField" : setMines(conf)
  };

  return {

    "reset" : function(){
      state.board.innerHTML = "";
    },

    "render" : function(){
      this.reset();
      state.board.style.width = (squareSize+2)*state.conf.horiSize+"px";
      for(var y = 0; y<state.conf.vertSize; y++){
        for(var x = 0; x<state.conf.horiSize;x++){
          var square = document.createElement("div");
          square.className = x+";"+y;
          square.style.width = squareSize+"px";
          square.style.height = squareSize+"px";
          square.addEventListener("click",this.checkMines);
          state.board.appendChild(square);
        }
      }
    },

    "showMines" : function(){
      console.log(state.mineField);
      state.mineField.forEach(function(mine){
        var square = document.getElementsByClassName(mine.x+";"+mine.y)[0];
        square.style.backgroundColor = "red";
      });
    },

    "checkMines" : function(clickedSquare){
      var coord = clickedSquare.target.className.split(";");
      
      var clickedCoord = {
        "x" : parseInt(coord[0]),
        "y" : parseInt(coord[1])
      }
      if( isThere(state.mineField, clickedCoord)){
        console.log("Perdu :p");
      }else{

      };
    }

  };
};

var game = mineSweeper(document.getElementsByClassName("grid")[0], conf);
game.render();
game.showMines();

/**
 * memoize function, by @philogb, Addy Osmani, Mathias Bynens and Dmitry Baranovsky. Seen on https://addyosmani.com/blog/faster-javascript-memoization/
 * @param  {Function} fn : function to be memoized
 * @return {Function}      : memoized function
 */
function memoize( fn ) {
    return function () {
        var args = Array.prototype.slice.call(arguments),
            hash = "",
            i = args.length;
        currentArg = null;
        while (i--) {
            currentArg = args[i];
            hash += (currentArg === Object(currentArg)) ? JSON.stringify(currentArg) : currentArg;
        }
        fn.memoize = fn.memoize || {};
        if(hash in fn.memoize){
          console.log("re-try");
          return fn.memoize[hash];
        }else{
          console.log("first try");
          return fn.memoize[hash] = fn.apply(this, args);
        }
    };
};