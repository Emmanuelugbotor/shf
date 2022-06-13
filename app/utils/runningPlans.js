const { Packages } = require("../utils/packages");
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

exports.packagesPlans = async (result, callback) => {

  let pending = [];

  let running = [];

  var runningCounter = 0;
  var completedCounter = 0;
  var runningTotalAmt = 0;
  var TOTALAMT = 0;
  
  if (result && Object.entries(result).length !== 0) {
    for (var obj of result) {
      obj.status == "pending" ? pending.push(obj) : running.push(obj);
    }

  if (running.length) {
    runningCounter = running.length;
    // for (var i = 0; i < running.length; i++) {
    running.forEach(async (items, index) => {
      let { Price, Duration, Returns } =
        Packages[items.package.split("$")[0]][items.package.split("$")[1]];

      let price = parseInt(items.amount);
      TOTALAMT += parseInt(items.amount);
      items.Price = price;
      items.Duration = Duration;
      items.Returns = Returns;
      items.package = items.package
        .split("$")[0]
        .toUpperCase()
        .concat(`$${items.package.split("$")[1]}`);

      var today = new Date();
      var now =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      var due_date = new Date(items.duedate);
      ExpireddDate =
        due_date.getFullYear() +
        "-" +
        (due_date.getMonth() + 1) +
        "-" +
        due_date.getDate();
      // if (ExpireddDate < now) {
      if (due_date < today) {
        completedCounter++;
        // runningTotalAmt = 0;
        items.status = "Completed";
        runningCounter -= 1;

        let result = returnOfInvestment(
          items.Duration,
          items.Returns,
          items.Price,
          now,
          due_date
        );

        runningTotalAmt += result.result;
        running[index].roi = result.result;
      }
      else {
        let result = returnOfInvestment(
          items.Duration,
          items.Returns,
          items.Price,
          now,
          due_date
        );
        runningTotalAmt += result.result;
        running[index].roi = result.result;
      }
    });
  }
  callback(false, {pending, running, runningCounter,  pendingCounter: pending.length,  runningTotalAmt, completedCounter,  TOTALAMT,  })

  }
  else{
    callback(false, null)
  }

  // return {
  //   pending,
  //   running, 
  //   runningCounter,
  //   pendingCounter: pending.length,
  //   runningTotalAmt,
  //   completedCounter,
  //   TOTALAMT,
  // };
};

const returnOfInvestment = (
  duration,
  returnStr,
  price,
  todaysDate,
  dueDate
) => {
  let perdayInterest = dateDiffInDays(new Date(todaysDate), new Date(dueDate));

  let due = parseInt(duration.split(" ")[0]) - perdayInterest;
  // console.log("DUE", parseInt(-6))
  // console.log("perdayInterest", perdayInterest)
  let returnDays = ["daily", "weekly"];
  let totalDue = parseInt(duration.split(" ")[0]);
  var result = 0;

  returnStr.split("%")[1] == "weekly"
    ? (totalDue = parseInt(duration.split(" ")[0]) / 7)
    : totalDue;

  // console.log("totalDue", totalDue)
  if (perdayInterest <= 0) {
    // console.log("INVESTMENT PRICE ", price)
    // console.log("INVESTMENT DURATION ", due)
    // console.log("INVESTMENT returns ", returnStr.split("%")[1].trim(), returnDays[0])
    // console.log("NOW AMOUNT ",  (parseInt(returnStr.split("%")[0]) / 100) * price * totalDue + price)
    // console.log("NOW AMOUNT ",  (parseFloat(returnStr.split("%")[0]) / 100) * price * totalDue + price)
    result =
      (parseInt(returnStr.split("%")[0]) / 100) * price * totalDue + price;
    // console.log("result fro invest", result);
    return { result };
  } else if (returnStr.split("%")[1].trim() == returnDays[0]) {
    // console.log("INVESTMENT PRICE ", price)
    // console.log("INVESTMENT DURATION ", due)
    // console.log("INVESTMENT returns ", returnStr.split("%")[1].trim(), returnDays[0])
    // console.log("NOW AMOUNT ",  (parseInt(returnStr.split("%")[0]) / 100) * price * due + price)
    result = (parseInt(returnStr.split("%")[0]) / 100) * price * due + price;
    return { result };
  } else {
    result =
      (parseInt(returnStr.split("%")[0]) / 100) * price * parseInt(due / 7) +
      price;
    return { result };
  }
};

function dateDiffInDays(a, b) {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

exports.validateWithdrawalRequest = (result) => {
  var today = new Date();
  var now =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let outPut = [];

  // for(var i=0; i< result.length; i++){
  //   if(result[i].status == "Completed"){
  //     outPut = result[i]
  //   }
  // }

  if (result) {
    result.forEach((element) => {
      if (element.status == "Completed") {
        outPut.push(element);
      }
    });
  }

  if (outPut.length) {
    for (var i = 0; i < outPut.length; i++) {
      var due_date = new Date(outPut[i].duedate);

      if (outPut[i].ref_amt > 0) {
        let result = returnOfInvestment(
          outPut[i].Duration,
          outPut[i].Returns,
          outPut[i].ref_amt,
          now,
          due_date
        );
        outPut[i].totalProfit = result.result;
      } else {
        let result = returnOfInvestment(
          outPut[i].Duration,
          outPut[i].Returns,
          outPut[i].Price,
          now,
          due_date
        );
        outPut[i].totalProfit = result.result;
      }
    }
  }

  return { outPut };
};
