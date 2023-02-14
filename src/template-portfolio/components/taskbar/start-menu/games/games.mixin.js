export default {
  data() {
    return {
      // tic tac toe game
      isTicTacToeGameStarted: false,
      isTicTacToeGameFinished: false,
      isTicTacToeAiTurn: false,
      ticTacToeBoardArr: [...Array(9).fill(null)],
      ticTacToeSelectedSymbol: "X",
      ticTacToeCurrentSymbol: "X",
      ticTacToeCurrentTurn: 0,
      ticTacToeGameIcon: `<img src="assets/images/games/tic-tac-toe.svg" alt="tic tac toe" draggable="false">`,

      // memory card game
      memoryCardDelay: 800,
      memoryCardMatches: 0,
      memoryCardTurns: 0,
      memoryCardGameIcon: `<img src="assets/images/games/memory-card/memory-card.svg" alt="memory card" draggable="false">`,
      memoryCardItems: [
        "alarm",
        "alarm",
        "apple",
        "apple",
        "basketball",
        "basketball",
        "bowling",
        "bowling",
        "cookie",
        "cookie",
        "grapes",
        "grapes",
        "seedling",
        "seedling",
        "sunflower",
        "sunflower",
      ],

      // snake game
      snakeAnimationFrame: null,
      isSnakeGameRunning: false,
      isSnakeGameOver: false,
      snakeBoardEl: null,
      snakeGridColumns: null,
      snakeGridRows: null,
      snakeBodyCoords: [],
      snakeAppleCoords: null,
      snakeDirection: { x: 0, y: 0 },
      snakeLastDirection: { x: 0, y: 0 },
      snakeHeadDirection: null,
      snakeSpeed: 2,
      snakeLastTime: 0,
      snakeBodyParts: 0,
      snakeExpansionRate: 1,
      snakeScore: 0,
      snakeGameIcon: `<img src="assets/images/games/snake.svg" alt="snake" draggable="false">`,
    };
  },
  mounted() {},
  methods: {
    // tic tac toe change selected symbol
    ticTacToeChangeSymbol(e) {
      const symbol = e.target.innerHTML;

      if (this.isTicTacToeGameStarted || this.ticTacToeSelectedSymbol === symbol) { return; }

      this.ticTacToeSelectedSymbol = this.ticTacToeCurrentSymbol = symbol;
    },

    // tic tac toe player turn
    ticTacToePlayerTurn(e) {
      const box = e.target;
      const boxIndex = [...box.parentElement.children].findIndex(el => el === box);

      if (this.isTicTacToeGameFinished || this.isTicTacToeAiTurn || box.innerHTML !== "") { return; }

      // start the game at the first time
      !this.isTicTacToeGameStarted && (this.isTicTacToeGameStarted = true);

      box.innerHTML = this.ticTacToeBoardArr[boxIndex] = this.ticTacToeCurrentSymbol;

      // play sparkle sound
      this.gameSparkle.play();

      // tic tac toe check winner
      this.ticTacToeSetWinner(this.ticTacToeGetWinner());

      this.ticTacToeCurrentTurn++;
      if (this.isTicTacToeGameFinished || this.ticTacToeCurrentTurn === 9) { return; }

      // switch to the next symbol
      this.ticTacToeCurrentSymbol = this.ticTacToeCurrentSymbol === "X" ? "O" : "X";

      // tic tac toe ai turn
      this.isTicTacToeAiTurn = true;
      this.ticTacToeAiTurn();
    },

    // tic tac toe ai turn
    ticTacToeAiTurn() {
      if (this.isTicTacToeGameFinished || this.ticTacToeCurrentTurn === 9) { return; }

      const allBoxes = [...document.querySelectorAll(".ticTacToeWindow__boxes .ticTacToeWindow__btn")];
      const emptyBoxes = allBoxes.reduce((empties, box, index) => {
        box.innerHTML === "" && empties.push({ index, box });
        return empties;
      }, []);
      const oneMoveAiWin = () => {
        return emptyBoxes.find(box => {
          const virtualBoard = [...this.ticTacToeBoardArr];
          virtualBoard[box.index] = this.ticTacToeCurrentSymbol;

          return this.ticTacToeGetWinner(virtualBoard) && box;
        });
      };
      const oneMoveAiLose = () => {
        return emptyBoxes.find(box => {
          const virtualBoard = [...this.ticTacToeBoardArr];
          virtualBoard[box.index] = this.ticTacToeSelectedSymbol;

          return this.ticTacToeGetWinner(virtualBoard) && box;
        });
      };
      let chosenBox;

      if (oneMoveAiWin()) {
        chosenBox = oneMoveAiWin();
      } else if (oneMoveAiLose()) {
        chosenBox = oneMoveAiLose();
      } else {
        chosenBox = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
      }

      setTimeout(() => {
        chosenBox.box.innerHTML = this.ticTacToeCurrentSymbol;
        this.ticTacToeBoardArr[chosenBox.index] = this.ticTacToeCurrentSymbol;

        // play sparkle sound
        this.gameSparkle.play();

        // tic tac toe check winner
        this.ticTacToeSetWinner(this.ticTacToeGetWinner());

        if (this.isTicTacToeGameFinished) { return; }

        // switch to the next symbol
        this.ticTacToeCurrentSymbol = this.ticTacToeCurrentSymbol === "X" ? "O" : "X";

        this.ticTacToeCurrentTurn++;
        this.isTicTacToeAiTurn = false;
      }, 800);
    },

    // tic tac toe check winner
    ticTacToeCheckWinner(board, n1, n2, n3) {
      return (
        board[n1] === board[n2] &&
        board[n2] === board[n3] &&
        board[n1] !== null
      );
    },

    // tic tac toe get winner
    ticTacToeGetWinner(board = this.ticTacToeBoardArr) {
      if (this.ticTacToeCheckWinner(board, 0, 1, 2)) {
        return "row1";
      } else if (this.ticTacToeCheckWinner(board, 3, 4, 5)) {
        return "row2";
      } else if (this.ticTacToeCheckWinner(board, 6, 7, 8)) {
        return "row3";
      } else if (this.ticTacToeCheckWinner(board, 0, 3, 6)) {
        return "col1";
      } else if (this.ticTacToeCheckWinner(board, 1, 4, 7)) {
        return "col2";
      } else if (this.ticTacToeCheckWinner(board, 2, 5, 8)) {
        return "col3";
      } else if (this.ticTacToeCheckWinner(board, 0, 4, 8)) {
        return "cross1";
      } else if (this.ticTacToeCheckWinner(board, 2, 4, 6)) {
        return "cross2";
      } else {
        return false;
      }
    },

    // tic tac toe set winner
    ticTacToeSetWinner(winnerLine) {
      if (!winnerLine) { return; }

      const ticTacToeEl = document.querySelector(".ticTacToeWindow__boxes");

      ticTacToeEl.classList.add(`winner-${winnerLine}`);

      // game ended actions
      if (this.ticTacToeSelectedSymbol === this.ticTacToeCurrentSymbol) {
        // play success sound
        this.gameSuccess.play();

        // show game won message
        this.setNotification({
          id: 'ticTacToeGameWon',
          msg: ticTacToeEl.dataset.gameWonMsg,
          icon: this.ticTacToeGameIcon,
        });

      } else {
        // play failure sound
        this.gameFailure.play();

        // show game over message
        this.setNotification({
          id: 'ticTacToeGameOver',
          msg: ticTacToeEl.dataset.gameOverMsg,
          icon: this.ticTacToeGameIcon,
        });
      }

      this.isTicTacToeGameFinished = true;
    },

    // tic tac toe restart
    ticTacToeRestart() {
      const ticTacToeEl = document.querySelector(".ticTacToeWindow__boxes");
      const boxes = ticTacToeEl.querySelectorAll(".ticTacToeWindow__btn");

      ticTacToeEl.classList.forEach(item => item.startsWith("winner-") && ticTacToeEl.classList.remove(item));

      boxes.forEach(box => box.innerHTML = "");

      // reset game values
      this.isTicTacToeGameStarted = false;
      this.isTicTacToeGameFinished = false;
      this.isTicTacToeAiTurn = false;
      this.ticTacToeBoardArr = [...Array(9).fill(null)];
      this.ticTacToeCurrentSymbol = this.ticTacToeSelectedSymbol;
      this.ticTacToeCurrentTurn = 0;
    },
    // ------------------------

    // memory card sort the cards array randomly
    memoryCardSortRandomly() {
      this.memoryCardItems.sort(() => Math.random() - 0.5);
    },

    // memory card flip card
    memoryCardFlipCard(e) {
      // flip the clicked card
      const el = e.currentTarget;
      el.classList.add("card-flipped");

      const memoryCards = [...document.querySelectorAll(".memoryCardWindow__btn--card")];
      const flippedCards = memoryCards.filter(card => card.classList.contains("card-flipped"));
      const flippedCardsLength = flippedCards.length;

      if (flippedCardsLength === 2) {
        // check if cards matched
        this.matchingCards(flippedCards);
      }
    },

    // memory card check if there matches
    matchingCards(flippedCards) {
      const cardsList = document.querySelector(".memoryCardWindow__boxes");
      const possibleMatches = cardsList.children.length / 2;

      // get clicked cards names
      let cardsNames = [];
      flippedCards.forEach(card => cardsNames.push(card.dataset.name));

      // check if cards matched
      cardsList.classList.add("prevent-click");
      if (cardsNames[0] === cardsNames[1]) {

        setTimeout(() => this.gameShortSuccess.play(), this.memoryCardDelay / 2);
        setTimeout(() => {
          [flippedCards[0], flippedCards[1]].forEach(card => {
            card.classList.add("card-matched");
            card.setAttribute("tabindex", "-1");
          });
          [flippedCards[0], flippedCards[1]].forEach(card => card.classList.remove("card-flipped"));

          cardsList.classList.remove("prevent-click");

          this.memoryCardMatches++;

          // game ended with win
          if (this.memoryCardMatches == possibleMatches) {
            // play success sound
            this.gameSuccess.play();

            // show game won message
            this.setNotification({
              id: 'memoryCardGameWon',
              msg: cardsList.dataset.gameWonMsg,
              icon: this.memoryCardGameIcon,
            });
          }
        }, this.memoryCardDelay);

      } else {
        setTimeout(() => this.gameShortFailure.play(), this.memoryCardDelay / 2);
        setTimeout(() => {
          [flippedCards[0], flippedCards[1]].forEach(card => card.classList.remove("card-flipped"));

          cardsList.classList.remove("prevent-click");

          this.memoryCardTurns++;
        }, this.memoryCardDelay);
      }
    },

    // memory card restart
    memoryCardRestart() {
      const cardsList = document.querySelector(".memoryCardWindow__boxes");
      const memoryCards = cardsList.querySelectorAll(".memoryCardWindow__btn");

      // remove classes form the cards container
      cardsList.classList.contains("prevent-click") && cardsList.classList.remove("prevent-click");

      // remove classes form every card
      memoryCards.forEach(card => card.classList.forEach(item => item.startsWith("card-") && card.classList.remove(item)));

      // resort the cards array
      this.memoryCardSortRandomly();

      // reset game values
      this.memoryCardMatches = 0;
      this.memoryCardTurns = 0;

      // play sparkle sound
      this.gameSparkle.play();
    },
    // ------------------------

    // snake game main loop
    snakeMainLoop(currentTime) {
      if (!this.isSnakeGameRunning) { return; }

      // stop when game over
      if (this.isSnakeGameOver) {
        // play failure sound
        this.gameFailure.play();

        // show game over message
        return this.setNotification({
          id: 'snakeGameOver',
          msg: this.snakeBoardEl.dataset.gameOverMsg,
          icon: this.snakeGameIcon,
        });
      }

      this.snakeAnimationFrame = window.requestAnimationFrame(this.snakeMainLoop);

      // setup game speed
      const timeDifference = (currentTime - this.snakeLastTime) / 1000;
      if (timeDifference < 1 / this.snakeSpeed) { return; }

      this.snakeLastTime = currentTime;

      // update/render the snake/apple
      this.snakeBoardEl.innerHTML = "";
      this.snakeUpdateSnake();
      this.snakeUpdateApple();
      this.snakeRenderSnake();
      this.snakeRenderApple();

      // check the snake death
      this.snakeCheckDeath();
    },

    // start the snake game loop
    snakeGameLoopStart() {
      this.isSnakeGameRunning = true;
      this.snakeAnimationFrame = window.requestAnimationFrame(this.snakeMainLoop);
    },

    // stop the snake game loop
    snakeGameLoopStop() {
      this.isSnakeGameRunning = false;
      cancelAnimationFrame(this.snakeAnimationFrame);
    },

    // snake get grid columns/rows count
    snakeGetGridCounts() {
      this.snakeBoardEl = document.querySelector(".snakeWindow__boxes");

      const boardStyle = getComputedStyle(this.snakeBoardEl);

      this.snakeGridColumns = boardStyle.gridTemplateColumns.split(" ").length;
      this.snakeGridRows = boardStyle.gridTemplateRows.split(" ").length;
    },

    // manage snake body movement
    snakeBodyMovement(e) {
      const snakeWin = document.getElementById("snakeWindow");
      if (!snakeWin.classList.contains("appsWindow__open")) { return; }

      switch (e.key || this.touchSwipeDir) {
        case "ArrowUp":
        case "swipedUp":
          if (this.snakeLastDirection.y !== 0) break;
          this.snakeDirection = { x: 0, y: -1 };
          this.snakeHeadDirection = "up";
          break;

        case "ArrowDown":
        case "swipedDown":
          if (this.snakeLastDirection.y !== 0) break;
          this.snakeDirection = { x: 0, y: 1 };
          this.snakeHeadDirection = "down";
          break;

        case "ArrowLeft":
        case "swipedLeft":
          if (this.snakeLastDirection.x !== 0) break;
          this.snakeDirection = { x: -1, y: 0 };
          this.snakeHeadDirection = "left";
          break;

        case "ArrowRight":
        case "swipedRight":
          if (this.snakeLastDirection.x !== 0) break;
          this.snakeDirection = { x: 1, y: 0 };
          this.snakeHeadDirection = "right";
          break;
      }
    },

    // snake game update the snake
    snakeUpdateSnake() {
      if (!this.snakeBodyCoords.length) { return; }

      for (let i = this.snakeBodyCoords.length - 2; i >= 0; i--) {
        this.snakeBodyCoords[i + 1] = { ...this.snakeBodyCoords[i] };
      }

      this.snakeBodyCoords[0].x += this.snakeDirection.x;
      this.snakeBodyCoords[0].y += this.snakeDirection.y;

      this.snakeLastDirection = this.snakeDirection;

      // snake handle going outside grid
      this.snakeGoOutsideHandle();
    },

    // snake game update the apple
    snakeUpdateApple() {
      // check if snake & apple coordinates are equal
      if (this.snakeAppleCoords && this.isSnakeHitApple(this.snakeAppleCoords)) {

        // play collect coin sound
        this.gameCollectCoin.play();

        // increase game score
        this.snakeScore += 1;
        (this.snakeScore / 7) % 1 === 0 && this.snakeSpeed++;

        // expand the snake body
        this.snakeBodyExpand(this.snakeExpansionRate);

        // get random coordinates for the apple
        this.snakeAppleCoords = this.snakeRandomAppleCoords();
      }
    },

    // snake game render the snake
    snakeRenderSnake() {
      if (!this.snakeBodyCoords.length) { return; }

      this.snakeBodyCoords.forEach((point, index) => {
        const snakeBody = document.createElement("div");

        if (index === 0) {
          snakeBody.classList.add(`head-dir-${this.snakeHeadDirection}`);
        }

        snakeBody.classList.add("snakeWindow__snakeBody");
        snakeBody.style.setProperty("grid-column-start", point.x);
        snakeBody.style.setProperty("grid-row-start", point.y);

        this.snakeBoardEl.appendChild(snakeBody);
      });
    },

    // snake game render the apple
    snakeRenderApple() {
      if (!this.snakeAppleCoords) { return; }

      const appleBody = document.createElement("div");

      appleBody.classList.add("snakeWindow__apple");
      appleBody.style.setProperty("grid-column-start", this.snakeAppleCoords.x);
      appleBody.style.setProperty("grid-row-start", this.snakeAppleCoords.y);

      this.snakeBoardEl.appendChild(appleBody);
    },

    // get random coordinates for the snake body
    snakeRandomSnakeCoords() {
      let coords;

      while (!coords || this.snakeBodyCoords.x === coords.x && this.snakeBodyCoords.y === coords.y) {
        const x = Math.floor(Math.random() * this.snakeGridColumns) + 1;
        const y = Math.floor(Math.random() * this.snakeGridRows) + 1;

        coords = { x, y };
      }

      return coords;
    },

    // get random coordinates for the apple
    snakeRandomAppleCoords() {
      let coords;

      while (!coords || this.snakeBodyCoords.some(p => p.x === coords.x && p.y === coords.y)) {
        const x = Math.floor(Math.random() * this.snakeGridColumns) + 1;
        const y = Math.floor(Math.random() * this.snakeGridRows) + 1;

        coords = { x, y };
      }

      return coords;
    },

    // check if snake & apple coordinates are equal
    isSnakeHitApple(appleCoords) {
      return this.snakeBodyCoords[0].x === appleCoords.x && this.snakeBodyCoords[0].y === appleCoords.y;
    },

    // expand the snake body
    snakeBodyExpand(rate) {
      this.snakeBodyParts += rate;

      for (let i = 0; i < this.snakeBodyParts; i++) {
        this.snakeBodyCoords.push({ ...this.snakeBodyCoords[this.snakeBodyCoords.length - 1] });
      }

      this.snakeBodyParts = 0;
    },

    // snake handle going outside grid
    snakeGoOutsideHandle() {
      if (this.snakeBodyCoords[0].x < 1) {
        this.snakeBodyCoords[0].x = this.snakeGridColumns;
      }

      if (this.snakeBodyCoords[0].x > this.snakeGridColumns) {
        this.snakeBodyCoords[0].x = 1;
      }

      if (this.snakeBodyCoords[0].y < 1) {
        this.snakeBodyCoords[0].y = this.snakeGridRows;
      }

      if (this.snakeBodyCoords[0].y > this.snakeGridRows) {
        this.snakeBodyCoords[0].y = 1;
      }
    },

    // check the snake death
    snakeCheckDeath() {
      if (this.snakeBodyCoords.length < 5) { return; }

      const snakeHead = this.snakeBodyCoords[0];
      const snakeBody = this.snakeBodyCoords.slice(1);

      this.isSnakeGameOver = snakeBody.some(p => p.x === snakeHead.x && p.y === snakeHead.y);
    },

    // snake game restart
    snakeGameRestart() {
      this.isSnakeGameOver = false;
      this.snakeBodyCoords.splice(0, this.snakeBodyCoords.length, this.snakeRandomSnakeCoords());
      this.snakeAppleCoords = this.snakeRandomAppleCoords();
      this.snakeDirection = { x: 0, y: 0 };
      this.snakeLastDirection = { x: 0, y: 0 };
      this.snakeHeadDirection = null;
      this.snakeScore = 0;
      this.snakeSpeed = 2;

      // cancel the last animation frame
      this.snakeGameLoopStop();

      // start the game main loop
      this.snakeGameLoopStart();
    },
  },
};
