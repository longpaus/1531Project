const isPrime = (num) => {
    for(let i = 2; i < num; i++ ){
      if(num % i === 0){
        return true
      }
    }
    return false
  }
function factors(num) {
    let i = 2
    const factors = []
    while(i <= num){
      if(isPrime(i) && num % i === 0){
          factors.push(i)
      }else{
        i++
      }
    }
    return factors
  }
  
  console.log(factors(24))
  