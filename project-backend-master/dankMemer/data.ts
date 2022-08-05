interface trackedUsers {
    userId: number,
    dmId: number
}

interface trackedChannels {
    channelId: number,
    trackedMessages: number[]
    dadJokeStatus: boolean
}

interface intervalTracker {
  channelId: number,
  intervalId: NodeJS.Timer
}

interface data {
    trackedUsers: trackedUsers[],
    trackedChannels: trackedChannels[],
    intervalTracker: intervalTracker[]
}

let data: data = {
  trackedUsers: [],
  trackedChannels: [],
  intervalTracker: []
};

const getData = () => {
  return data;
};

const setData = (newData: data) => {
  data = newData;
  const fs = require('fs');
  fs.writeFileSync('dankMemer/memerSaves.json', JSON.stringify(data, null, 2));
};

const loadData = () => {
  const fs = require('fs');
  try {
    const newData: data = JSON.parse(fs.readFileSync('dankMemer/memerSaves.json'));
    setData(newData);
  } catch (err) {
    const newData = getData();
    setData(newData);
  }
};

export { getData, setData, loadData };
