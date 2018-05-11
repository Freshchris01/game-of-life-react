import React from 'react';



class Game extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			cols: 10,
			rows: 10,
			cells: [
				{ x: 1, y: 0 },
				{ x: 2, y: 1 },
				{ x: 0, y: 2 },
				{ x: 1, y: 2 },
				{ x: 2, y: 2 },

			],
			running: false,
			intervalId: -1,
		}

		this.nextStep = this.nextStep.bind(this);
		this.findAliveCell = this.findAliveCell.bind(this);
		this.mod = this.mod.bind(this);
		this.updateCols = this.updateCols.bind(this);
		this.updateRows = this.updateRows.bind(this);
		this.togglePlayPause = this.togglePlayPause.bind(this);
	}

	mod(n, m) {
		return ((n % m) + m) % m;
	}

	nextStep() {
		let newCells = [];

		// foreach grid
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

						// if grid is active cell
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
				<div style={style.controls}>
					<p>
						<label>Rows</label>
						<input type="number" value={this.state.rows} onChange={this.updateRows} />
					</p>
					<p>
						<label>Cols</label>
						<input type="number" value={this.state.cols} onChange={this.updateCols} />
					</p>
					<button onClick={this.nextStep} style={{ display: this.state.running ? 'none' : 'inline-block' }}>Next step</button>
					<button onClick={this.togglePlayPause}>{this.state.running ? 'Pause' : 'Play'}</button>

				</div>
			</div>
		);
	}

	updateRows(e) {
		e.persist();
		this.setState((state, props) => {
			return {
				...state,
				rows: e.target.value
			}
		});
	}

	updateCols(e) {
		e.persist();
		this.setState((state, props) => ({
			cols: e.target.value
		}))
	}

	// set and clear loop
	togglePlayPause() {
		let intervalId = -1;
		if (!this.state.running) {
			intervalId = setInterval(this.nextStep, 1000);
		} else {
			clearInterval(this.state.intervalId);
		}
		this.setState((state, props) => ({
			running: !state.running,
			intervalId: intervalId
		}))
	}
}
const style = {

	container: {
		position: 'relative',
		margin: '0 auto'
	},

	controls: {
		position: 'absolute',
		bottom: '30px',
		left: '30px'
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