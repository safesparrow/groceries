import React from 'react';
import './App.css';
import './Firebase';
import {Tabs} from 'react-bootstrap'
import Tab from "react-bootstrap/Tab";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <div>
      <Tabs>
      <Tab eventKey='dictionary' title='Dictionary'>
        Test
      </Tab>
          <Tab eventKey='ddictionary' title='dDictionary'>
              Test
          </Tab>
      </Tabs>
    </div>
  );
}

export default App;
