import React, { Component } from 'react';
import './App.css';
import Game from './Game/Game.react';

class App extends Component {
	render() {
		return (
			<div className="App" style={styles}>
				<Game />
			</div>
		);
	}
}

const styles = {
	display: 'flex',
	height: '100vh'
}

export default App;
