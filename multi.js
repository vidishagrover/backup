require("chromedriver");

const wd = require("selenium-webdriver");
//const chrome = require("selenium-webdriver/chrome");  // for headless
//const browser = new wd.Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().headless()).build(); // for headless
let browser = new wd.Builder().forBrowser('chrome').build(); // for not headless
let matchId = process.argv[2];
let innings = process.argv[3];
// let matchId = "32278";
let batsmenUrls = [];
let bowlerUrls = [];
let careerData = [];
let fs = require("fs");
let playersAdded = 0;
// async se 
async function getData(url, i, totalPlayers){
    let browser = new wd.Builder().forBrowser('chrome').build(); // kyuki ab async bnarhe h sbke keliye apna  browser khulega
    await browser.get(url);
        await browser.wait(wd.until.elementLocated(wd.By.css("table.cb-col-100.cb-plyr-thead")));
        let tables = await browser.findElements(wd.By.css("table.cb-col-100.cb-plyr-thead"));
        let battingKeys = [];
        let bowlingKeys = [];
        for(let j = 0; j < tables.length ; j++){
            let keyColumns = await tables[j].findElements(wd.By.css("thead th"));
            for(let k = 1; k <  keyColumns.length; k++){
                let title =  await keyColumns[k].getAttribute("title");
                title = title.split(" ").join("");
                if(j == 0){
                    battingKeys.push(title);
                }else {
                    bowlingKeys.push(title);
                }
            }
            let data = {};
            let dataRows = await tables[j].findElements(wd.By.css("tbody tr"));
            for(let k = 0; k < dataRows.length; k++ ){
                let tempData = {};
                let dataColumns = await dataRows[k].findElements(wd.By.css("td"));
                let matchType = await dataColumns[0].getAttribute("innerText");
                for(let l = 1; l < dataColumns.length; l++) {
                    tempData[j == 0 ? battingKeys[l-1] : bowlingKeys[l-1]] = await dataColumns[l].getAttribute("innerText");
                }
                data[matchType] = tempData;
            }
            careerData[i][j == 0 ? "battingCareer" : "bowlingCareer"] = data;
        }
        playersAdded += 1;
        if(playersAdded == totalPlayers){
        fs.writeFileSync("career.json", JSON.stringify(careerData));
        // as terminal show output upto two levels so thats why file is created
        //json file as contains objected data
        // write files contains string so converted object into string by JSON.stringify 
        }
        browser.close();
}
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
        if(columns.length == 7){
        let url = await (await columns[0].findElement(wd.By.css("a"))).getAttribute("href");
        let playerName = await columns[0].getAttribute('innerText');
        careerData.push({"playerName" : playerName});
        batsmenUrls.push(url);
        }
    } 
    let inningsBowlerRows = await tables[1].findElements(wd.By.css(".cb-col.cb-col-100.cb-scrd-itms"));
    for(let i= 0; i< inningsBowlerRows.length; i++){
        let columns = await inningsBowlerRows[i].findElements(wd.By.css("div"));
        if(columns.length == 8){
        let url = await (await columns[0].findElement(wd.By.css("a"))).getAttribute("href");
        let playerName = await columns[0].getAttribute('innerText');
        careerData.push({"playerName" : playerName});
        bowlerUrls.push(url);
        }
       
    } 
    let finalUrls = batsmenUrls.concat(bowlerUrls);
    //console.log(finalUrls);
    //for(url of finalUrls){
    for(let i = 0; i < finalUrls.length; i++){
     getData(finalUrls[i], i , finalUrls.length);
    }
    await browser.close(); //to close browser


}
main();