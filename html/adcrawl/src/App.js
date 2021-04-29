import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Navigation from './Navigation';
import Scraper from './Scraper';
import DataLog from './DataLog';

// const strapi = 'http://localhost:1337';

class App extends React.Component {

  // Scraper contains URL input field & function to scrape external site & save results to database
  // DataLog displays all results saved in database

  render() {
    return (
      <Router>
        <div>
          <Navigation />

          <Switch>

            <Route path="/data">
              <DataLog />
            </Route>

            <Route path="/">
              <Scraper />
            </Route>

          </Switch>
        </div>
      </Router>
    )
  }
}
export default App;
