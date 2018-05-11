import React from 'react';
import debounce from 'lodash';
import Button from 'antd/lib/button';
import { InputNumber, Menu, Dropdown, Icon } from 'antd';


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
				{
					displayName: 'Empty',
					name: 'empty',
					cells: [

					]
				},
				{
					displayName: 'Glider',
					name: 'glider',
					cells:
						[
							{ x: 1, y: 0 },
							{ x: 2, y: 1 },
							{ x: 0, y: 2 },
							{ x: 1, y: 2 },
							{ x: 2, y: 2 }
						]
				}, {
					displayName: 'Small Explorer',
					name: 'smallExplorer',
					cells:
						[
							{ x: 25, y: 25 },
							{ x: 24, y: 26 },
							{ x: 25, y: 26 },
							{ x: 26, y: 26 },
							{ x: 24, y: 27 },
							{ x: 26, y: 27 },
							{ x: 25, y: 28 },
						]
				},
				{
					displayName: 'Tumbler',
					name: 'tumbler',
					cells:
						[
							{ x: 23, y: 25 },
							{ x: 24, y: 25 },
							{ x: 26, y: 25 },
							{ x: 27, y: 25 },
							{ x: 23, y: 26 },
							{ x: 24, y: 26 },
							{ x: 26, y: 26 },
							{ x: 27, y: 26 },
							{ x: 24, y: 27 },
							{ x: 26, y: 27 },
							{ x: 22, y: 28 },
							{ x: 24, y: 28 },
							{ x: 26, y: 28 },
							{ x: 28, y: 28 },
							{ x: 22, y: 29 },
							{ x: 24, y: 29 },
							{ x: 26, y: 29 },
							{ x: 28, y: 29 },
							{ x: 22, y: 30 },
							{ x: 23, y: 30 },
							{ x: 27, y: 30 },
							{ x: 28, y: 30 },
						]
				}
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
		this.loadPreset = this.loadPreset.bind(this);
		this.toggleCell = this.toggleCell.bind(this);
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
				//console.log(`Neighbours: ${aliveNeighbours} adding ${JSON.stringify(cell)}`);

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
					left: `${15 * x}px`,
					top: `${15 * y}px`,
					position: 'absolute',
					backgroundColor: this.findAliveCell(x, y) ? '#2c3e50' : '#95a5a6'
				};
				grid[y].push(
					<div key={x + "" + y}
						onClick={() => this.toggleCell(x, y)}
						style={{ ...style.cell, ...style.alive, ...position }}>
					</div>
				);
			}
		}

		const presets = (
			<Menu>
				{this.state.presets.map((preset, idx) => {
					return (
						<Menu.Item key={`preset${idx}`}>
							<a onClick={() => this.loadPreset(idx)}>{preset.displayName}</a>
						</Menu.Item>
					);
				})}
			</Menu>
		);

		return (
			<div style={style.container}>
				{grid}
				<div style={style.controls}>
					<div>
						<label style={{ marginRight: '15px' }}>Rows</label>
						<InputNumber value={this.state.rows} onChange={this.updateRows} min={5} max={50} />
					</div>
					<div style={{ marginTop: '5px' }}>
						<label style={{ marginRight: '15px' }}>Cols</label>
						<InputNumber value={this.state.cols} onChange={this.updateCols} min={5} max={50} />
					</div>
					<Button onClick={this.nextStep} style={{ display: this.state.running ? 'none' : 'inline-block' }}>Next step <Icon type="double-right" /></Button>
					<Button onClick={this.togglePlayPause} style={{ marginTop: '10px', marginLeft: 8 }}>{this.state.running ? 'Pause' : 'Play'}</Button>
					<Dropdown overlay={presets}>
						<Button style={{ marginLeft: 8 }}>Load Preset <Icon type="up" /></Button>
					</Dropdown>
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

	loadPreset(id) {
		this.setState((state, props) => ({
			cells: state.presets[id].cells
		}));
	}

	toggleCell(x, y) {

		let cellIndex = this.state.cells.findIndex(item => item.x === x && item.y === y);

		if (cellIndex === -1) { // insert
			this.setState((state, props) => ({
				cells: [...state.cells, { x: x, y: y }]
			}));
		} else {				// remove
			this.setState((state, props) => ({
				cells: state.cells.filter(cell => { return !(cell.x === x && cell.y === y) })
			}));
		}
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
		width: '100vw'
	},

	cell: {
		height: '15px',
		width: '15px',
		border: '1px solid rgba(132, 132, 132, 0.15)'
	},

	alive: {
		backgroundColor: 'green'
	},

	dead: {
		backgroundColor: 'red'
	}
}


export default Game;