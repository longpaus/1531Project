function bubbleSort(array) {
  for(let i = 0; i < array.length; i++) {
      for(let j = 0; j < array.length - 1; j++) {

          if(array[j] < array[j + 1]) {
              let swap = array[j];
              array[j] = array[j + 1];
              array[j + 1] = swap;
          }
      }
  }
  return array;
}

console.log(bubbleSortAge([1,5,10,4,55,2,4,99]));