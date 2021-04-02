require("chromedriver");

const wd = require("selenium-webdriver");
//const chrome = require("selenium-webdriver/chrome");  // for headless
const browser = new wd.Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build(); // for headless
//const browser = new wd.Builder().forBrowser('chrome').build(); // for not headless
let matchId = process.argv[2];
let innings = process.argv[3];
// let matchId = "32278";
let batsmenScorecard = [];
let bowlerScorecard = [];
let batsmenKeys = ["playerName", "out", "runs", "ballsPlayed", "fours", "sixes", "strikeRate"];
let bowlerKeys = ["playerName", "overs", "maidenOvers", "runs", "wickets", "noBalls", "wideBalls", "economy"];
async function main(){
    await browser.get("https://www.cricbuzz.com/live-cricket-scores/" + matchId);
    await browser.wait(wd.until.elementLocated(wd.By.css(".cb-nav-bar a"))); // to wait until it is loaded for safety side so thst code doesnt crash
    let buttons = await browser.findElements(wd.By.css(".cb-nav-bar a"));
    await buttons[1].click();
    await browser.wait(wd.until.elementLocated(wd.By.css("#innings_" + innings + " .cb-col.cb-col-100.cb-ltst-wgt-hdr")));
    let tables = await browser.findElements(wd.By.css("#innings_" + innings + " .cb-col.cb-col-100.cb-ltst-wgt-hdr"));
    let inningsBatsmenRows = await tables[0].findElements(wd.By.css(".cb-col.cb-col-100.cb-scrd-itms"));
    for(let i= 0; i< inningsBatsmenRows.length; i++){
        let columns = await inningsBatsmenRows[i].findElements(wd.By.css("div"));
        if(columns.length == 7){ // this if cond as we dont want extras wagera columns
            let data = {};
            for(let j =0; j< columns.length; j++){
                data[batsmenKeys[j]] = await columns[j].getAttribute("innerText");
            }
            batsmenScorecard.push(data);
        }
    } 
    console.log(batsmenScorecard);
    let inningsBowlerRows = await tables[1].findElements(wd.By.css(".cb-col.cb-col-100.cb-scrd-itms"));
    for(let i= 0; i< inningsBowlerRows.length; i++){
        let columns = await inningsBowlerRows[i].findElements(wd.By.css("div"));
        if(columns.length == 8){ // this if cond as we dont want extras wagera columns
            let data = {};
            for(let j =0; j< columns.length; j++){
                data[bowlerKeys[j]] = await columns[j].getAttribute("innerText");
            }
            bowlerScorecard.push(data);
        }
    } 
    console.log(bowlerScorecard);
    await browser.close(); //to close browser


}
main();