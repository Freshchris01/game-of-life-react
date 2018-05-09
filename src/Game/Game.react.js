import React from 'react';



class Game extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			cols: 30,
			rows: 30,
			cells: [
				{ x: 1, y: 0 },
				{ x: 2, y: 1 },
				{ x: 0, y: 2 },
				{ x: 1, y: 2 },
				{ x: 2, y: 2 },

			],
			running: false
		}

		this.nextStep = this.nextStep.bind(this);
		this.findAliveCell = this.findAliveCell.bind(this);
		this.mod = this.mod.bind(this);
	}

	mod(n, m) {
		return ((n % m) + m) % m;
	}

	nextStep() {
		let newCells = [];

		// foreach alive cell
		for (let gridX = 0; gridX < this.state.cols; gridX++) {
			for (let gridY = 0; gridY < this.state.rows; gridY++) {

				let currentCell = this.findAliveCell(gridX, gridY);

				//calculate neighbours
				let aliveNeighbours = 0;
				for (let x = -1; x <= 1; x++) {
					for (let y = -1; y <= 1; y++) {
						if (x === 0 && y === 0) {
							continue;
						}

						if (this.findAliveCell(this.mod(gridX + x, this.state.cols), this.mod((gridY + y), this.state.cols)) !== undefined) {
							aliveNeighbours++;
						}
					}

				}
				if (currentCell && (aliveNeighbours === 2 || aliveNeighbours === 3)) {
					console.log(`Neighbours: ${aliveNeighbours}`);
					newCells.push(currentCell);
				}

				if (!currentCell && (aliveNeighbours === 3)) {
					newCells.push({ x: gridX, y: gridY });
					console.log('Neighbours: ' + aliveNeighbours);
				}
			}
		}

		this.setState((state, props) => {
			return { ...state, cells: newCells }
		});
	}

	findAliveCell(x, y) {
		let cell = this.state.cells.find(cell => { return cell.x === x && cell.y === y });
		return cell;
	}

	render() {

		let grid = [];

		for (let y = 0; y < this.state.rows; y++) {
			grid.push([]);
			for (let x = 0; x < this.state.cols; x++) {
				let position = {
					left: `${40 * x}px`,
					top: `${40 * y}px`,
					position: 'absolute',
					backgroundColor: this.findAliveCell(x, y) ? 'green' : 'red'
				};
				grid[y].push(
					<div key={x + "" + y}
						style={{ ...style.cell, ...style.alive, ...position }}>{x} - {y}
					</div>
				);
			}
		}

		return (
			<div style={style.container}>
				{grid}
				<button onClick={this.nextStep}>Next step</button>
			</div>
		);
	}
}

const style = {

	container: {
		width: '100%'
	},

	cell: {
		height: '40px',
		width: '40px',
		border: '1px solid black'
	},

	alive: {
		backgroundColor: 'green'
	},

	dead: {
		backgroundColor: 'red'
	}
}


export default Game;