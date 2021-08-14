import './App.css';
import ChartArea from './components/ChartArea';
import { HashRouter as Router } from 'react-router-dom'
import {Switch, Route} from 'react-router-dom'

function App() {
  return (
    <>
    <Router basename={process.env.PUBLIC_URL}>
        <Switch>
            <Route exact path="/">
                <div className="App">
                    <ChartArea />
                </div>
            </Route>
        </Switch>
    </Router>
    </>
  );
}

export default App;