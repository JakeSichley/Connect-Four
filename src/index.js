import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import clone from 'clone';

class HistoryItems {
    constructor(p={}) {
        this.col = p.column;
        this.row = p.row;
        this.board = p.board;
        this.player1 = 1;
        this.player2 = 2;
        this.currentPlayer = p.currentPlayer;
        this.gameOver = p.gameOver;
        this.message = p.message;
        this.current = true;
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
      
        this.state = {
            player1: 1,
            player2: 2,
            currentPlayer: null,
            board: [],
            gameOver: false,
            message: '',
        };

        this.history = [];
        this.current = true;
        this.currentIndex = 0;
        this.reversed = false;
      
      this.play = this.play.bind(this);
    }
    
    initBoard() {
        let board = [];
        for (let r = 0; r < 6; r++) {
            let row = [];

            for (let c = 0; c < 7; c++) {
                row.push(null)
            }

            board.push(row);
        }
      
        this.setState({
            board,
            currentPlayer: this.state.player1,
            gameOver: false,
            message: '',
        });

        this.history = [];
        this.current = true;
        this.currentIndex = 0;
        this.reversed = false;
    }
    
    togglePlayer() {
        return (this.state.currentPlayer === this.state.player1) ? this.state.player2 : this.state.player1;
    }

    travelToBoard(i) {
        this.history.map((item) => item.current = false);
        this.history[i].current = true;
        let board = clone(this.history[i].board);
        let player = this.history[i].currentPlayer;
        this.setState({board, currentPlayer: player});

        if (i !== this.history.length - 1) {
            this.current = false;
        } else {
            this.current = true;
        }
        console.log(this.currentIndex);
        this.currentIndex = i;
    }

    sort() {
        this.history.reverse();
        this.reversed = this.reversed ? false : true;
        console.log(this.reversed);
        this.setState({board: this.state.board});
    }
    
    play(c) {
        if (!this.state.gameOver) {
            let board = this.state.board;
            let row = 0;

            if (!this.current) {
                if (this.reversed) {
                    for (let i = 0; i < this.currentIndex; i++) {
                        this.history.shift();
                    }
                } else {
                    this.history.splice(this.currentIndex + 1);
                }
                this.current = true;
            }

            for (let r = 5; r >= 0; r--) {
                if (!board[r][c]) {
                    board[r][c] = this.state.currentPlayer;
                    row = r;
                    break;
                }
            }

            let result = checkAll(board);
            if (result === this.state.player1) {
                this.setState({ board, gameOver: true, message: 'Player 1 (red) wins!' });
            } else if (result === this.state.player2) {
                this.setState({ board, gameOver: true, message: 'Player 2 (yellow) wins!' });
            } else if (result === 'draw') {
                this.setState({ board, gameOver: true, message: 'Draw game.' });
            } else {
                this.setState({ board, currentPlayer: this.togglePlayer()});
            }

            let historyBoard = clone(this.state.board);

            this.history.map((item) => item.current = false);

            if (this.reversed) {
                this.history.unshift(new HistoryItems({column: c, row: row, board: historyBoard, currentPlayer: this.togglePlayer(),
                    gameOver: this.state.gameOver, message: this.state.message}));
            } else {
                this.history.push(new HistoryItems({column: c, row: row, board: historyBoard, currentPlayer: this.togglePlayer(),
                    gameOver: this.state.gameOver, message: this.state.message}));
            }
        } else {
            this.setState({ message: 'Game over. Please start a new game.' });
        }
    }

    componentWillMount() {
        this.initBoard();
    }
    
    render() {
        return (
            <div>
                <div className="button" onClick={() => {this.initBoard()}}>New Game</div>
          
                <table>
                    <thead>
                    </thead>
                    <tbody>
                        {this.state.board.map((row, i) => (<Row key={i} row={row} play={this.play} state={this.state} indexR={i} />))}
                    </tbody>
                </table>
                <p className="message">{this.state.message}</p>
                <p className="message"><b>Timeline</b></p>
                <div className="buttonsort" onClick={() => {this.sort()}}><i>Sort</i></div>
                <ul class = "no-bullets">
                    {this.generateTimeline(this.history)}
                </ul>
            </div>
        );
    }

    generateTimeline(history) {
        let arr = [];
        for (let i = 0; i < history.length; i++) {
            if (!history[i].current) {
                arr.push((<li key={history[i].col.toString() + ':' + history[i].row.toString()}>
                <button onClick={() => this.travelToBoard(i)}>{((history[i].row * -1) + 6).toString() + ':' + (history[i].col + 1).toString()}</button>
                </li>))
            } else {
                arr.push((<li key={history[i].col.toString() + ':' + history[i].row.toString()}>
                <button onClick={() => {this.travelToBoard(i)}}><b>{((history[i].row * -1) + 6).toString() + ':' + (history[i].col + 1).toString()}</b></button>
                </li>))
            }
        }
    
        return arr;
    }
}
  
const Row = ({ row, play, state, indexR }) => {
    return (
        <tr>
            {row.map((cell, i) => <Cell key={i} value={cell} columnIndex={i} play={play} index={indexR} state={state} />)}
        </tr>
    );
};

const Cell = ({ value, columnIndex, play, index, state }) => {
    let color = 'white';
    
    if (value === 1) {
        color = 'red';
    } else if (value === 2) {
        color = 'yellow';
    }
    
    let winningCoordinates = checkAll(state.board, true);

    if (winningCoordinates) {
        if ((columnIndex === winningCoordinates[1][0] && index === winningCoordinates[0][0]) ||
            (columnIndex === winningCoordinates[1][1] && index === winningCoordinates[0][1]) ||
            (columnIndex === winningCoordinates[1][2] && index === winningCoordinates[0][2]) ||
            (columnIndex === winningCoordinates[1][3] && index === winningCoordinates[0][3]))
        {
            return (
                <td>
                    <div className="winningcell" onClick={() => {play(columnIndex)}}>
                        <div className={color}></div>
                    </div>
                </td>
            );
        } else {
            return (
                <td>
                    <div className="cell" onClick={() => {play(columnIndex)}}>
                        <div className={color}></div>
                    </div>
                </td>
            );
        }
    } else {
        return (
            <td>
                <div className="cell" onClick={() => {play(columnIndex)}}>
                    <div className={color}></div>
                </div>
            </td>
        );
    }
};

function checkAll(board, coordinates = false) {
    return checkVertical(board, coordinates) || checkDiagonalRight(board, coordinates) || checkDiagonalLeft(board, coordinates) || checkHorizontal(board, coordinates) || checkDraw(board);
}

function checkVertical(board, coordinates) {
    for (let r = 3; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            if (board[r][c]) {
                if (board[r][c] === board[r - 1][c] &&
                    board[r][c] === board[r - 2][c] &&
                    board[r][c] === board[r - 3][c]) {
                    if (coordinates) {
                        return [[r, r - 1, r - 2, r - 3], [c, c, c, c]];
                    } else {
                        return board[r][c];
                    }
                }
            }
        }
    }
}

function checkHorizontal(board, coordinates) {
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c]) {
                if (board[r][c] === board[r][c + 1] && 
                    board[r][c] === board[r][c + 2] &&
                    board[r][c] === board[r][c + 3]) {
                    if (coordinates) {
                        return [[r, r, r, r], [c, c + 1, c + 2, c + 3]];
                    } else {
                        return board[r][c];
                    }
                }
            }
        }
    }
}

function checkDiagonalRight(board, coordinates) {
    for (let r = 3; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
            if (board[r][c]) {
                if (board[r][c] === board[r - 1][c + 1] &&
                    board[r][c] === board[r - 2][c + 2] &&
                    board[r][c] === board[r - 3][c + 3]) {
                    if (coordinates) {
                        return [[r, r - 1, r - 2, r - 3], [c, c + 1, c + 2, c + 3]];
                    } else {
                        return board[r][c];
                    }
                }
            }
        }
    }
}

function checkDiagonalLeft(board, coordinates) {
    for (let r = 3; r < 6; r++) {
        for (let c = 3; c < 7; c++) {
            if (board[r][c]) {
                if (board[r][c] === board[r - 1][c - 1] &&
                    board[r][c] === board[r - 2][c - 2] &&
                    board[r][c] === board[r - 3][c - 3]) {
                    if (coordinates) {
                        return [[r, r - 1, r - 2, r - 3], [c, c - 1, c - 2, c - 3]];
                    } else {
                        return board[r][c];
                    }
                }
            }
        }
    }
}

function checkDraw(board, coordinates) {
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            if (board[r][c] === null) {
                return null;
            }
        }
    }

    return 'draw';
}

ReactDOM.render(<App />, document.getElementById('root'));