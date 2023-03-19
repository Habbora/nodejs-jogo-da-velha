const WebSocket = require('ws');

const tabuleiroWidth = 3
const tabuleiroHeight = 3
const tabuleiroArray = []
let playerSelector = 0
const playerPiece = ['O', 'X']
let isGameOver = false
let msgHeader = `Vez do jogador: ${playerPiece[playerSelector]}`

function createTabuleiroDataStructure() {
  const numberOfPixels = tabuleiroWidth * tabuleiroHeight

  for (let index = 0; index < numberOfPixels; index++) {
      tabuleiroArray[index] = "";
  }
}

function tabuleiroIsGamerOver() {
  let counter = 0
  let PlayerWin = ""
  let msg = ``

  for (let index = 0; index < tabuleiroArray.length; index++) {
      if (tabuleiroArray[index] == "") counter++;
  }

  if (counter == 0) {isGameOver = true}

  // Verifica o vencedor em linha
  for (let column = 0; column < tabuleiroHeight; column++) {
      const pixelIndex = column * tabuleiroHeight
      if (tabuleiroArray[pixelIndex] != "") {
          const aux1 = (tabuleiroArray[pixelIndex] == tabuleiroArray[pixelIndex + 1])
          const aux2 = (tabuleiroArray[pixelIndex] == tabuleiroArray[pixelIndex + 2])
          const aux3 = aux1 && aux2
          if (aux3) {
              isGameOver = true
              PlayerWin = tabuleiroArray[pixelIndex]
          }
      }
  }

  // Verifica o vencedor em coluna
  for (let row = 0; row < tabuleiroWidth; row++) {
      const pixelIndex = row
      if (tabuleiroArray[pixelIndex] != "") {
          const aux1 = (tabuleiroArray[pixelIndex] == tabuleiroArray[pixelIndex + tabuleiroHeight * 1])
          const aux2 = (tabuleiroArray[pixelIndex] == tabuleiroArray[pixelIndex + tabuleiroHeight * 2])
          const aux3 = aux1 && aux2
          if (aux3) {
              isGameOver = true
              PlayerWin = tabuleiroArray[pixelIndex]
          }
      }
  }

  // Verifica o vencedor a diagonal 1
  if (tabuleiroArray[0] != "") {
      const aux1 = (tabuleiroArray[0] == tabuleiroArray[1 + tabuleiroHeight * 1])
      const aux2 = (tabuleiroArray[0] == tabuleiroArray[2 + tabuleiroHeight * 2])
      const aux3 = aux1 && aux2
      if (aux3) {
          isGameOver = true
          PlayerWin = tabuleiroArray[0]
      }
  }

  // Verifica o vencedor a diagonal 2
  if (tabuleiroArray[2] != "") {
      const aux1 = (tabuleiroArray[2] == tabuleiroArray[1 + tabuleiroHeight * 1])
      const aux2 = (tabuleiroArray[2] == tabuleiroArray[0 + tabuleiroHeight * 2])
      const aux3 = aux1 && aux2
      if (aux3) {
          isGameOver = true
          PlayerWin = tabuleiroArray[2]
      }
  }

  if (isGameOver) {
      if (PlayerWin != "") {
          msg += `O player ${PlayerWin} ganhou!`
      } else {
          msg += `O jogo acabou em empate!`
      }
      msgHeader = msg
  } 
}

function tabuleiroSelectCase(index) {
  if (isGameOver) return

  if (tabuleiroArray[index] == ""){
      tabuleiroArray[index] = playerPiece[playerSelector]
      if (playerSelector == 0) playerSelector = 1
      else playerSelector = 0
  } else {
      console.log("Casa já está ocupada e não pode ser selecionada.")
  }
  msgHeader = `Vez do jogador: ${playerPiece[playerSelector]}`
  tabuleiroIsGamerOver()
}

const wss = new WebSocket.Server({ port: 8080 });

function webSocketSend(ws) {
  ws.send(JSON.stringify({
    tabuleiroArray,
    msgHeader
  }));
}

wss.on('connection', function connection(ws) {
  console.log('Nova conexão estabelecida');
  
  ws.on('message', function incoming(message) {
    const command = JSON.parse(message.toString())
    if (command.emit == 'reset') {
      isGameOver = false
      playerSelector = 0
      msgHeader = `Vez do jogador: ${playerPiece[playerSelector]}`
      createTabuleiroDataStructure()
      webSocketSend(ws)
    } else if (command.emit == 'get-tabuleiro') {
      webSocketSend(ws)
    } else if (command.emit == 'select-case') {
      tabuleiroSelectCase(command.index)
      console.log(tabuleiroArray)
      webSocketSend(ws)
    }
    console.log(command)
  });

  ws.on('close', function close() {
    console.log('Conexão fechada');
  });
});

createTabuleiroDataStructure()