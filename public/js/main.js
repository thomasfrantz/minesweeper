/**
 *
 *  PUBLIC METHODS : 
 *  CheckMines() -Returns-> array of coordinates+value [{x:5,y:0,value:mine}] or [{x:4,y:0,value:1}] or [{x:2,y:0,value:blank}{x:2,y:1,value:blank}]
 *
 * make a saved map of already played 
 * 
 */

function mineSweeper (div, conf){

  var state = {
    "board" : div,
    "conf" : conf,
    "mineField" : [],
    "status" : "null"
  };

  function getState(){
    return state;
  }

  function getBoard(){
    return state.board;
  }

  function getConf(){
    return state.conf;
  }

  function getMineField(){
    return state.mineField;
  }

  function setMineField(newMineField){
    state.mineField = newMineField;
  }

  function getStatus(){
    return state.status;
  }

  function setStatus(newState){
    if(typeof newState === "string"){
      return state.status = newState;
    }else{
      throw "Wrong typeof for newState";
    }
  }

  function isInside(coord){
    var conf = getConf();

    return (coord.y<conf.vertSize && coord.y>=0 && coord.x<conf.horiSize && coord.x>=0);
  }

  function isMine(coord){
    var mineField = getMineField();
    return mineField[coord.y][coord.x].value === "m";
  }


  function initiateBoard(){
    var conf = getConf();
    var mineField = getMineField();

    if(conf.mineNumber >= conf.horiSize*conf.vertSize){
      throw "The number of mines is too high compared to the number of squares";
    }

    for(var y = 0; y < conf.vertSize; y++){
      var hor = [];
      for(var x = 0; x < conf.horiSize;x++){
        var square = {
          "x":x,
          "y":y,
          "value":0,
          "show":false,
          "clicked":false,
          "flag":false
        };
        hor.push(square);
      }
      mineField.push(hor);
    }
    //setMineField(mineField);
    setStatus("Board initiated");
  }

  function incrementNeighbours(mine){
    var mineField = getMineField();
    for (var i = -1; i <= 1; i++){
      for (var j = -1; j <= 1; j++){
        neighbourX = mine.x+j;
        neighbourY = mine.y+i;
        if(isInside({"y" : neighbourY, "x" : neighbourX}) && !isMine(mineField[neighbourY][neighbourX])){
          mineField[neighbourY][neighbourX].value += 1;
        }
      }
    }
    //setMineField(mineField);
  }

  function setValues(){
    var conf = getConf();
    var mineField = getMineField();

    if(getStatus() !== "Board initiated" ){
      throw "Wrong state";
    }

    var i = 0;
    while(i < conf.mineNumber){
      var x = Math.floor(Math.random()*conf.horiSize);
      var y = Math.floor(Math.random()*conf.vertSize);
      if(!isMine(mineField[y][x])){
        mineField[y][x].value = "m";
        incrementNeighbours({"x" : x, "y" : y});
        i++;
      }
    }
    //setMineField(mineField);
    setStatus("Values set");
  }

  function renderBoard(){
    var board = getBoard();
    var conf = getConf();

    board.innerHTML = "";
    board.style.width = (conf.squareSize+2)*conf.horiSize+"px";
    for(var y = 0; y<conf.vertSize; y++){
      for(var x = 0; x<conf.horiSize;x++){
        var square = document.createElement("div");
        square.className = "square "+x+";"+y;
        square.style.width = conf.squareSize+"px";
        square.style.height = conf.squareSize+"px";
        square.style.lineHeight = conf.squareSize+"px";
        square.style.textAlign = "center";
        board.appendChild(square);
      }
    }
    setStatus("Board rendered");
  }

  function checkSquare(coord){
    var mineField = getMineField();
    var square = mineField[coord.y][coord.x];
    var state = getState();

    if(square.show === false && square.flag === false){
      square.show = true;
      square.clicked = true;

      if(square.value === 0){
        for (var i = -1; i <= 1; i++){
          for (var j = -1; j <= 1; j++){
            neighbourX = square.x+j;
            neighbourY = square.y+i;
            neighbour = {"y" : neighbourY, "x" : neighbourX};
            if(isInside(neighbour) && mineField[neighbourY][neighbourX].show !== true){
              state = checkSquare({"y":neighbourY, "x":neighbourX});
            }
          }
        }
      }else if(square.value === "m"){
        alert("Boom");
        setStatus("Game Over");
      }
    }
    
    return state;
  }

  function leftClick(e){
    var squareDiv = e.target;

    var coordRegExp = /(\d*;\d*)/;
    var coord = coordRegExp.exec(squareDiv.className)[0].split(";");

    var newState = checkSquare({"x":coord[0],"y":coord[1]});

    renderState(newState);
  }

  function addLeftClick(coord){
    var board = getBoard();
    var squareIndex = coord.x+coord.y*conf.vertSize;
    var square = board.childNodes[squareIndex];

    square.addEventListener("click", leftClick);
  }

  function flagSquare(coord){
    var mineField = getMineField();
    var square = mineField[coord.y][coord.x];
    var state = getState();

    if(square.show === false){
      square.flag = !square.flag;
    }
    
    return state;
  }

  function rightClick(e){
    var squareDiv = e.target;

    var coordRegExp = /(\d*;\d*)/;
    var coord = coordRegExp.exec(squareDiv.className)[0].split(";");

    var newState = flagSquare({"x":coord[0],"y":coord[1]});

    renderState(newState);
    return false;
  }

  function addRightClick(coord){
    var board = getBoard();
    var squareIndex = coord.x+coord.y*conf.vertSize;
    var square = board.childNodes[squareIndex];

    square.addEventListener("contextmenu", rightClick, false);
  }

  function addEvents(){

    if(getStatus() !== "Board rendered" ){
      throw "Wrong state";
    }

    for(var y = 0; y<conf.vertSize; y++){
      for(var x = 0; x<conf.horiSize;x++){
        addLeftClick({"x":x, "y":y});
        addRightClick({"x":x, "y":y});
      }
    }
    setStatus("Ready to click");

  }

  function start(){

    initiateBoard();
    setValues();
    renderBoard();
    addEvents();

    var status = getStatus();
    if(status !== "Ready to click" ){
      throw "Problem after : "+status;
    }
  }

  function renderSquare(coord, value, isClicked){
    var conf = getConf();
    var board = getBoard();
      
    var valueRegExp = / value([0-8]|m)/;
    var squareIndex = coord.x+coord.y*conf.vertSize;
    var square = board.childNodes[squareIndex];

    if(!valueRegExp.test(square.className)){
      if(value === "flag"){
        square.className += " flag";
      }else{
        square.className += " show value"+value;
        square.innerHTML= value;
        if(!isClicked){
          square.className += " notClicked";
        }
      }
    }
  }

  function renderState(newState){
    var board = newState.board;
    var mineField = newState.mineField;
    var status = newState.status;

    //if(status !== "Game ongoing"){
    if(status === "Game Over"){
      for(var y = 0; y < conf.vertSize; y++){
        for(var x = 0; x < conf.horiSize;x++){
          renderSquare({"x":x, "y":y}, mineField[y][x].value, mineField[y][x].clicked);  
        }
      }
      setStatus("Fail");
    }else if(status !== "Ready to click"){
      throw "Problem after : "+status+"\n State can't be rendered off a game";
    }

    for(var y = 0; y < conf.vertSize; y++){
      for(var x = 0; x < conf.horiSize;x++){
        if(mineField[y][x].show){
          renderSquare({"x":x, "y":y}, mineField[y][x].value, true);
        }else if(mineField[y][x].flag){
          renderSquare({"x":x, "y":y}, "flag", false);
        }
      }
    }
  }

  return {

    "start" : start,
    "renderState" : renderState,
    "show" : function(){
      var board = "";
      for(var y = 0; y < conf.vertSize; y++){
        for(var x = 0; x < conf.horiSize;x++){
          board+= "[x:"+x+"; y:"+y+"; value:"+state.mineField[y][x].value+"]";
        }
        board += "\n";
      }
      console.log(board);
    }

  };
};



var squareSize = 50;

var conf = {
  "horiSize": 10,
  "vertSize": 10,
  "mineNumber": 12,
  "squareSize": 70
};

var game = mineSweeper(document.getElementsByClassName("grid")[0], conf);
game.start();
//game.show();

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