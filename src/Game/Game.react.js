import React from 'react';
import debounce from 'lodash';
import Button from 'antd/lib/button';
import { InputNumber } from 'antd';


class Game extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			cols: 50,
			rows: 50,
			cells: [
				{ x: 25, y: 25 },
				{ x: 24, y: 26 },
				{ x: 25, y: 26 },
				{ x: 26, y: 26 },
				{ x: 24, y: 27 },
				{ x: 26, y: 27 },
				{ x: 25, y: 28 },
			],
			presets: [
				// glider
				[
					{ x: 1, y: 0 },
					{ x: 2, y: 1 },
					{ x: 0, y: 2 },
					{ x: 1, y: 2 },
					{ x: 2, y: 2 }
				],
				// small explorer
				[
					{ x: 25, y: 25 },
					{ x: 24, y: 26 },
					{ x: 25, y: 26 },
					{ x: 26, y: 26 },
					{ x: 24, y: 27 },
					{ x: 26, y: 27 },
					{ x: 25, y: 28 },
				],
				[
					{ x: 0, y: 0 },
				]
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
		this.resetCells = this.resetCells.bind(this);
		this.getNeighboursCount = this.getNeighboursCount.bind(this);
	}

	// real modulo function, also for negative nubmers
	mod(n, m) {
		return ((n % m) + m) % m;
	}

	resetCells() {
		this.setState((state, props) => ({
			cells: state.presets[0]
		}))
	}

	nextStep() {
		let newCells = [];
		let emptyCells = [];

		// foreach active cell
		this.state.cells.map((cell, idx) => {

			//calculate neighbours
			let result = this.getNeighboursCount(cell);
			let aliveNeighbours = result.count;
			emptyCells = emptyCells.concat(result.deadNeighbours);

			if (aliveNeighbours === 2 || aliveNeighbours === 3) {
				console.log(`Neighbours: ${aliveNeighbours} adding ${JSON.stringify(cell)}`);

				// cell already in new cell?				
				if (newCells.findIndex(item => item.x === cell.x && item.y === cell.y) === -1) {
					newCells.push(cell);
				}
			}
		});

		// for all empty cells around active cells
		emptyCells.map((cell, idx) => {
			let aliveNeighbours = this.getNeighboursCount(cell).count;

			if (aliveNeighbours === 3) {

				// cell already in new cell?
				if (newCells.findIndex(item => item.x === cell.x && item.y === cell.y) === -1) {
					newCells.push(cell);
				}
			}
		});


		console.log(newCells);
		this.setState((state, props) => {
			return { ...state, cells: newCells }
		});
	}

	findAliveCell(x, y) {
		return this.state.cells.find(cell => { return cell.x === x && cell.y === y });
	}

	getNeighboursCount(cell) {

		let aliveNeighbours = 0;
		let deadNeighbours = [];

		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				if (x === 0 && y === 0) {
					continue;
				}

				// if grid is active cell
				if (this.findAliveCell(this.mod(cell.x + x, this.state.cols), this.mod((cell.y + y), this.state.rows)) !== undefined) {
					aliveNeighbours++;
				} else {
					deadNeighbours.push({ x: this.mod(cell.x + x, this.state.cols), y: this.mod((cell.y + y), this.state.rows) });
				}
			}
		}

		return { count: aliveNeighbours, deadNeighbours: deadNeighbours };
	}

	render() {

		let grid = [];

		for (let y = 0; y < this.state.rows; y++) {
			grid.push([]);
			for (let x = 0; x < this.state.cols; x++) {
				let position = {
					left: `${10 * x}px`,
					top: `${10 * y}px`,
					position: 'absolute',
					backgroundColor: this.findAliveCell(x, y) ? 'green' : 'red'
				};
				grid[y].push(
					<div key={x + "" + y}
						style={{ ...style.cell, ...style.alive, ...position }}>
					</div>
				);
			}
		}

		return (
			<div style={style.container}>
				{grid}
				<div style={style.controls}>
					<div>
						<label>Rows</label>
						<InputNumber value={this.state.rows} onChange={this.updateRows} min={5} max={50} />
					</div>
					<div>
						<label>Cols</label>
						<InputNumber value={this.state.cols} onChange={this.updateCols} min={5} max={50} />
					</div>
					<Button onClick={this.nextStep} style={{ display: this.state.running ? 'none' : 'inline-block' }}>Next step</Button>
					<Button onClick={this.togglePlayPause}>{this.state.running ? 'Pause' : 'Play'}</Button>

				</div>
			</div>
		);
	}

	updateRows(value) {
		// integer check
		if (value !== parseInt(value, 10)) {
			return;
		}

		if (value < 5 || value > 50) {
			return;
		}
		this.setState((state, props) => {
			return {
				...state,
				rows: value,
			}
		});
		this.resetCells();
	}

	updateCols(value) {
		// integer check
		if (value !== parseInt(value, 10)) {
			return;
		}

		if (value < 5 || value > 50) {
			return;
		}
		this.setState((state, props) => ({
			cols: value,
		}))

		this.resetCells();
	}

	// set and clear loop
	togglePlayPause() {
		let intervalId = -1;
		if (!this.state.running) {
			intervalId = setInterval(this.nextStep, 500);
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
		//margin: '0 auto'
	},

	controls: {
		position: 'absolute',
		bottom: '30px',
		left: '30px'
	},

	cell: {
		height: '10px',
		width: '10px',
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