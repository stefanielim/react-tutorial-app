import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const className = 'square' + (props.hasWon ? ' square--highlighted' : '');
  return (
    <button 
      className={className}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
          key={i}
          value={this.props.squares[i]}
          hasWon={this.props.winningSquares.includes(i)}
          onClick={() => this.props.onClick(i)}
        />
    );
  }

  render() {
    const boardSize = 3;
    let rows = [];
    for (let row = 0; row < boardSize; row++) {
      let rowSquares = [];
      for (let column = 0; column < boardSize; column++) {
        rowSquares.push(this.renderSquare(row * boardSize + column));
      }
      rows.push(<div key={row} className="board-row">{rowSquares}</div>)
    }
    return (
      <div>{rows}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastMove: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      ascendingHistory: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWin(squares).winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastMove: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  sortHistory() {
    this.setState({
      ascendingHistory: !this.state.ascendingHistory,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const stepNumber = this.state.stepNumber;
    const ascendingHistory = this.state.ascendingHistory;
    const {winner, winningSquares} = calculateWin(current.squares);
    const hasRemainingMoves = current.squares.includes(null);

    let moves = history.map((step, move) => {
      const lastMove = step.lastMove;
      const lastMoveCol = lastMove % 3;
      const lastMoveWid = Math.floor(lastMove / 3);
      const desc = move ?
        `Go to move #${move} - (${lastMoveCol},${lastMoveWid})` :
        'Go to game start';
      return (
        <li key={move}>
          <button 
            className={'button ' + (stepNumber === move ? 'button--active' : '') } 
            onClick={() => this.jumpTo(move)}
          >{desc}</button>
        </li>
      );
    });
    if (!ascendingHistory) moves.reverse();

    let status;
    if (winner) {
      status = 'Winner: ' + winner; 
    } else {
      if (!hasRemainingMoves) {
        status = 'Draw :(';
      } else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            winningSquares={winningSquares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <p>Move History - {ascendingHistory ? 'Ascending' : 'Descending'}</p>
            <button onClick={() => this.sortHistory()}>{ascendingHistory ? 'Sort Descending' : 'Sort Ascending'}</button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWin(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningSquares: lines[i],
      };
    }
  }
  return {
    winner: null,
    winningSquares: [],
  };
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
