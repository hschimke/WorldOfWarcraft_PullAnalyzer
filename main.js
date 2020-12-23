const request = require('request');
const yargs = require('yargs');
const fs = require('fs');

const secrets = require('./secrets.json');

var cached_reports;

try {
    cached_reports = require('./db.json');
} catch (e) {
    cached_reports = {
        fetched_report_ids: [],
        fetched_reports: {}
    };
}

var output_type = "text";

class FightResult {
    constructor(name_input) {
        this.name = name_input;
        this.normalWipes = 0
        this.normalKills = 0;
        this.normalUnknown = 0;
        this.heroicWipes = 0;
        this.heroicKills = 0;
        this.heroicUnknown = 0;
        this.mythicWipes = 0;
        this.mythicKills = 0;
        this.mythicUnknown = 0;
        this.raidfinderWipes = 0;
        this.raiderfinderKills = 0;
        this.raidfinderUnknown = 0;
        this.unknownWipes = 0;
        this.unknownKills = 0
        this.unknownUnknown = 0;
    }

    prettyPrint() {
        let output = 'Fight: ';
        output += this.name;
        output += "\n\t";
        output += "Normal Kills: " + this.normalKills;
        output += "\n\t";
        output += "Normal Wipes: " + this.normalWipes;
        if (!(this.normalWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First Normal Wipe: " + new Date(this.normalWipesFDTM);
        }
        if (!(this.normalKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First Normal Kill: " + new Date(this.normalKillsFDTM);
        }
        output += "\n\t";
        output += "Heroic Kills: " + this.heroicKills;
        output += "\n\t";
        output += "Heroic Wipes: " + this.heroicWipes;
        if (!(this.heroicWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First Heroic Wipe: " + new Date(this.heroicWipesFDTM);
        }
        if (!(this.heroicKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First Heroic Kill: " + new Date(this.heroicKillsFDTM);
        }
        output += "\n\t";
        output += "Mythic Kills: " + this.mythicKills;
        output += "\n\t";
        output += "Mythic Wipes: " + this.mythicWipes;
        if (!(this.mythicWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First Mythic Wipe: " + new Date(this.mythicWipesFDTM);
        }
        if (!(this.mythicKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First Mythic Kill: " + new Date(this.mythicKillsFDTM);
        }
        output += "\n\t";
        output += "RF Kills: " + this.raiderfinderKills;
        output += "\n\t";
        output += "RF Wipes: " + this.raidfinderWipes;
        if (!(this.raidfinderWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First RF Wipe: " + new Date(this.raidfinderWipesFDTM);
        }
        if (!(this.raidfinderKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First RF Kill: " + new Date(this.raidfinderKillsFDTM);
        }
        output += "\n\t";
        output += "Unknown Kills: " + this.unknownKills;
        output += "\n\t";
        output += "Unknown Wipes: " + this.unknownWipes;
        if (!(this.unknownWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First Unknown Wipe: " + new Date(this.unknownWipesFDTM);
        }
        if (!(this.unknownKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First Unknown Kill: " + new Date(this.unknownKillsFDTM);
        }
        return output;
    }

    prettyPrintCSV(separator) {
        let output = '';
        output += this.name;
        output += separator;
        output += this.normalKills;
        output += separator;
        output += this.normalWipes;
        output += separator;
        if (!(this.normalWipesFDTM === undefined)) {
            output += new Date(this.normalWipesFDTM);
        }
        output += separator;
        if (!(this.normalKillsFDTM === undefined)) {
            output += new Date(this.normalKillsFDTM);
        }
        output += separator;
        output += this.heroicKills;
        output += separator;
        output += this.heroicWipes;
        output += separator;
        if (!(this.heroicWipesFDTM === undefined)) {
            output += new Date(this.heroicWipesFDTM);
        }
        output += separator;
        if (!(this.heroicKillsFDTM === undefined)) {
            output += new Date(this.heroicKillsFDTM);
        }
        output += separator;
        output += this.mythicKills;
        output += separator;
        output += this.mythicWipes;
        output += separator;
        if (!(this.mythicWipesFDTM === undefined)) {
            output += new Date(this.mythicWipesFDTM);
        }
        output += separator;
        if (!(this.mythicKillsFDTM === undefined)) {
            output += new Date(this.mythicKillsFDTM);
        }
        output += separator;
        output += this.raiderfinderKills;
        output += separator;
        output += this.raidfinderWipes;
        output += separator;
        if (!(this.raidfinderWipesFDTM === undefined)) {
            output += new Date(this.raidfinderWipesFDTM);
        }
        output += separator;
        if (!(this.raidfinderKillsFDTM === undefined)) {
            output += new Date(this.raidfinderKillsFDTM);
        }
        output += separator;
        output += this.unknownKills;
        output += separator;
        output += this.unknownWipes;
        output += separator;
        if (!(this.unknownWipesFDTM === undefined)) {
            output += new Date(this.unknownWipesFDTM);
        }
        output += separator;
        if (!(this.unknownKillsFDTM === undefined)) {
            output += new Date(this.unknownKillsFDTM);
        }
        return output;
    }

    static getHeader(separator){
        let output = '';
        output += 'Fight';
        output += separator;
        output += "Normal Kills";
        output += separator;
        output += "Normal Wipes";
        output += separator;
        output += "First Normal Wipe"
        output += separator;
        output += "First Normal Kill";
        output += separator;
        output += "Heroic Kills";
        output += separator;
        output += "Heroic Wipes";
        output += separator;
        output += "First Heroic Wipe";
        output += separator;
        output += "First Heroic Kill";
        output += separator;
        output += "Mythic Kills";
        output += separator;
        output += "Mythic Wipes";
        output += separator;
        output += "First Mythic Wipe";
        output += separator;
        output += "First Mythic Kill";
        output += separator;
        output += "RF Kills";
        output += separator;
        output += "RF Wipes";
        output += separator;
        output += "First RF Wipe";
        output += separator;
        output += "First RF Kill";
        output += separator;
        output += "Unknown Kills";
        output += separator;
        output += "Unknown Wipes";
        output += separator;
        output += "First Unknown Wipe";
        output += separator;
        output += "First Unknown Kill";
        return output;
    }

    static getMember(difficulty, kill) {
        let membername = '';
        switch (difficulty) {
            case 2:
                membername += "raidfinder";
                break;
            case 3:
                membername += "normal";
                break;
            case 4:
                membername += "heroic";
                break;
            case 5:
                membername += "mythic";
                break;
            default:
                membername += "unknown";
                break;
        }
        switch (kill) {
            case true:
                membername += "Kills";
                break;
            case false:
                membername += "Wipes";
                break;
            case undefined:
                membername += "Unknown";
                break;
        }
        return membername;
    }

    static getMemberSeen(difficulty, kill) {
        return FightResult.getMember(difficulty, kill) + "FDTM";
    }
}

let cache_hits = 0;
let cache_misses = 0;

const api_key = '?api_key=' + secrets.keys.api_key;
const base_uri = 'https://www.warcraftlogs.com:443/v1';
const report_list_api_user = '/reports/user/';
const report_list_api_guild = '/reports/guild/';
const report_api = '/report/fights/';

let options = {
    json: true,
    headers: {
        'Connection': 'keep-alive'
    }
};

function getReportListUser(userName) {
    console.log(`Logs for user ${userName}`);
    return getReportListFromURL(base_uri + report_list_api_user + userName + api_key);
}

function getReportListGuild(guildname, guildserver, guildregion) {
    console.log(`Logs for guild: ${guildname} on ${guildserver} in ${guildregion}`);
    return getReportListFromURL(base_uri + report_list_api_guild + guildname + "/" + guildserver + "/" + guildregion + api_key);
}

function getReportListFromURL(url) {
    return new Promise((resolve, reject) => {

        request(url, options, (error, res, body) => {
            if (error) {
                reject(error);
            };
            if (!error && res.statusCode == 200) {
                let ids = [];
                body.forEach((item) => {
                    ids.push(item['id']);
                });
                resolve(ids);
            };
        });
    });
}

function getReport(id, report_db) {
    //console.log(`Getting Report: ${id} from ${base_uri+report_api+id+api_key}`);
    return new Promise((resolve, reject) => {
        if (report_db.fetched_report_ids.includes(id)) {
            cache_hits++;
            resolve(report_db.fetched_reports[id]);
        } else {
            request(base_uri + report_api + id + api_key, options, (error, res, body) => {
                if (error) {
                    reject(error);
                };
                if (!error && res.statusCode == 200) {
                    cache_misses++;
                    report_db.fetched_report_ids.push(id);
                    report_db.fetched_reports[id] = body;
                    resolve(report_db.fetched_reports[id]);
                };
            });
        }
    });
}

function handle_id_list(data) {
    let report_ids = data;

    let promises = [];
    let fight_list = [];

    console.log("Found: " + report_ids.length + " reports");

    let reports_db = cached_reports;

    report_ids.forEach((id) => {
        promises.push(getReport(id, reports_db));
    });

    Promise.all(promises).then((results_list) => {
        console.log("Downloaded: " + cache_misses + " new reports, using " + cache_hits + " cached reports");
        results_list.forEach((result) => {
            handle_report(result, fight_list);
        });
    }).then(function () {
        completed(fight_list);
    });
}

function handle_report(data, fights) {
    //console.log("Found " + data['fights'].length + " fights in report.");
    data['fights'].forEach((item_in) => {
        //console.log( item_in['id'] + " - " + item_in['name'] + " :: " + item_in['kill']);

        // Collect only fights with a non-zero boss id.
        if (item_in['boss'] > 0) {
            fights.push({
                name: item_in['name'],
                kill: item_in['kill'],
                difficulty: item_in['difficulty'],
                start: data['start'],
                duration: (item_in["end_time"] - item_in["start_time"])
            });
        }
    });
}

function completed(fights) {
    let results = {};

    console.log("Processing: " + fights.length + " fights");

    fights.forEach((fight) => {
        let name = fight['name'];
        if (!(name in results)) {
            results[name] = new FightResult(name);
        }
        results[name][FightResult.getMember(fight['difficulty'], fight['kill'])]++;

        let hld = FightResult.getMemberSeen(fight['difficulty'], fight['kill']);
        if (!(hld in results[name])) {
            results[name][hld] = fight["start"];
        } else if (results[name][hld] > fight["start"]) {
            results[name][hld] = fight["start"];
        }
    });

    if( output_type == "text" ){
        Object.keys(results).forEach(function (key) {
            console.log(results[key].prettyPrint());
        });
    }else if( output_type == "csv" ){
        console.log(FightResult.getHeader(','))
        Object.keys(results).forEach(function (key) {
            console.log(results[key].prettyPrintCSV(','));
        });
    }

    saveData();
}

function saveData() {
    fs.writeFile("db.json", JSON.stringify(cached_reports), "utf8", () => {
        console.log("DB Saved");
    });
}

const argv = yargs
    .command('guild', 'Process data for a guild')
    .option('guild_name', {
        description: 'The name of the guild to process',
        alias: 'g',
        type: 'string',
    })
    .option('guild_server', {
        description: 'Home server for the guild',
        alias: 's',
        type: 'string',
    })
    .option('guild_region', {
        description: 'The geographic region of the server where the guild is',
        alias: 'r',
        type: 'string',
    })
    .command('user', 'Process data for one user')
    .option('user_name', {
        description: 'WC logs username',
        alias: 'u',
        type: 'string'
    })
    .command('csv', "Produce CSV output")
    .help()
    .alias('help', 'h')
    .argv;

function run() {

    if( argv.csv){
        output_type = "csv";
    }

    if (argv.guild) {
        getReportListGuild(argv.guild_name, argv.guild_server, argv.guild_region).then(handle_id_list);
    } else if (argv.user) {
        getReportListUser(argv.user_name).then(handle_id_list);
    } else {
    }
}

run();
