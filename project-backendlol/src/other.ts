import { setData, data } from './dataStore';

/*
  The clear function sets the dataStore back to its initial state
*/
function clearV1() {
  const newData: data = {
    users: [],
    channels: [],
    dms: [],
    tokens: []
  };
  setData(newData);
}

export { clearV1 };
