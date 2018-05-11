import React from 'react';
import Button from 'antd/lib/button';
import presets from '../util/presets';
import { InputNumber, Menu, Dropdown, Icon, Tooltip } from 'antd';


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
			presets: presets,		// game templates
			running: false,			// loop status
			intervalId: -1,			// used to store game loop intervall
		}

		// function binding
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
			cells: state.presets[0].cells
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

	// counts all active neighbours, and also provides all inactive neighbours for further calculations
	getNeighboursCount(cell) {

		let aliveNeighbours = 0;
		let deadNeighbours = [];

		// iterate 3 X 3 grid around cell
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

		// grid which is rendered
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

		// generate preset selection
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
					<Tooltip title="More Information" placement="left">
						<Button style={{
							right: 10,
							position: 'absolute'
						}} shape="circle" size="large" icon="info" target="_blank" href="https://github.com/Freshchris01/game-of-life-react" />
					</Tooltip>
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

		let newCells = [];
		this.state.cells.map((cell) => {
			newCells.push({ x: cell.x, y: this.mod(cell.y, value) })
		});

		this.setState((state, props) => ({
			rows: value,
			cells: newCells
		}))
	}

	updateCols(value) {
		// integer check
		if (value !== parseInt(value, 10)) {
			return;
		}

		if (value < 5 || value > 50) {
			return;
		}

		let newCells = [];
		this.state.cells.map((cell) => {
			newCells.push({ x: this.mod(cell.x, value), y: cell.y })
		});

		this.setState((state, props) => ({
			cols: value,
			cells: newCells
		}))
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