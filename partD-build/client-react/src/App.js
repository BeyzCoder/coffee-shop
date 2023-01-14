import React, {useEffect} from 'react';
import './App.css';

// Components.
import Employee from "./components/Employee";
import Customer from "./components/Customer";
import Pending from "./components/Pending";
import Orderhistory from  "./components/Orderhistory";

// Routing
import { BrowserRouter, Route, Link, Switch } from "react-router-dom";

function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Home}></Route>
          <Route path="/employee" component={Employee}>
            <Employee></Employee>
          </Route>
          <Route path="/customer" component={Customer}>
            <Customer></Customer>
          </Route>
          <Route path="/pending" component={Pending}>
            <Pending></Pending>
          </Route>
          <Route path="/orderhistory" component={Orderhistory}>
            <Orderhistory></Orderhistory>
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

const Home = () => (
  <div className="container">
    <h2 class="section-header">WELCOME TO KOHI SHOP</h2>
    <Link to="/employee"> <button> Employee </button> </Link>
    <Link to="/customer"> <button> Customer </button> </Link>
  </div>
)

export default App;
