import got, { Got, OptionsOfJSONResponseBody } from 'got';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import fs_prom from 'fs/promises';
import { resolve } from 'path';

const secrets = { 'keys': { 'api_key': process.env.API_KEY } };
const DB_FILE = 'db.json';

let cached_reports: CachedReports;

try {
    cached_reports = JSON.parse((await fs_prom.readFile(resolve('./', DB_FILE))).toString());
    console.log('Found cached data.')
} catch (e) {
    console.log('Creating new cache.');
    cached_reports = {
        fetched_report_ids: [],
        fetched_reports: {}
    };
}

let program_options: ProgramOptions = {
    output_type: 'text'
}

class FightResult {
    name = '';
    data: FightResultClassData = {
        counters: {
            normalWipes: 0,
            normalKills: 0,
            normalUnknown: 0,
            heroicWipes: 0,
            heroicKills: 0,
            heroicUnknown: 0,
            mythicWipes: 0,
            mythicKills: 0,
            mythicUnknown: 0,
            raidfinderWipes: 0,
            raiderfinderKills: 0,
            raidfinderUnknown: 0,
            unknownWipes: 0,
            unknownKills: 0,
            unknownUnknown: 0
        },
        firstSeen: {
            normalWipesFDTM: undefined,
            normalKillsFDTM: undefined,
            heroicWipesFDTM: undefined,
            heroicKillsFDTM: undefined,
            mythicWipesFDTM: undefined,
            mythicKillsFDTM: undefined,
            raidfinderWipesFDTM: undefined,
            raidfinderKillsFDTM: undefined,
            unknownKillsFDTM: undefined,
            unknownWipesFDTM: undefined
        }
    };

    constructor(name_input: string) {
        this.name = name_input;
        this.data.counters.normalWipes = 0
        this.data.counters.normalKills = 0;
        this.data.counters.normalUnknown = 0;
        this.data.counters.heroicWipes = 0;
        this.data.counters.heroicKills = 0;
        this.data.counters.heroicUnknown = 0;
        this.data.counters.mythicWipes = 0;
        this.data.counters.mythicKills = 0;
        this.data.counters.mythicUnknown = 0;
        this.data.counters.raidfinderWipes = 0;
        this.data.counters.raiderfinderKills = 0;
        this.data.counters.raidfinderUnknown = 0;
        this.data.counters.unknownWipes = 0;
        this.data.counters.unknownKills = 0
        this.data.counters.unknownUnknown = 0;
    }

    prettyPrint() {
        let output = 'Fight: ';
        output += this.name;
        output += "\n\t";
        output += "Normal Kills: " + this.data.counters.normalKills;
        output += "\n\t";
        output += "Normal Wipes: " + this.data.counters.normalWipes;
        if (!(this.data.firstSeen.normalWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First Normal Wipe: " + new Date(this.data.firstSeen.normalWipesFDTM);
        }
        if (!(this.data.firstSeen.normalKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First Normal Kill: " + new Date(this.data.firstSeen.normalKillsFDTM);
        }
        output += "\n\t";
        output += "Heroic Kills: " + this.data.counters.heroicKills;
        output += "\n\t";
        output += "Heroic Wipes: " + this.data.counters.heroicWipes;
        if (!(this.data.firstSeen.heroicWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First Heroic Wipe: " + new Date(this.data.firstSeen.heroicWipesFDTM);
        }
        if (!(this.data.firstSeen.heroicKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First Heroic Kill: " + new Date(this.data.firstSeen.heroicKillsFDTM);
        }
        output += "\n\t";
        output += "Mythic Kills: " + this.data.counters.mythicKills;
        output += "\n\t";
        output += "Mythic Wipes: " + this.data.counters.mythicWipes;
        if (!(this.data.firstSeen.mythicWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First Mythic Wipe: " + new Date(this.data.firstSeen.mythicWipesFDTM);
        }
        if (!(this.data.firstSeen.mythicKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First Mythic Kill: " + new Date(this.data.firstSeen.mythicKillsFDTM);
        }
        output += "\n\t";
        output += "RF Kills: " + this.data.counters.raiderfinderKills;
        output += "\n\t";
        output += "RF Wipes: " + this.data.counters.raidfinderWipes;
        if (!(this.data.firstSeen.raidfinderWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First RF Wipe: " + new Date(this.data.firstSeen.raidfinderWipesFDTM);
        }
        if (!(this.data.firstSeen.raidfinderKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First RF Kill: " + new Date(this.data.firstSeen.raidfinderKillsFDTM);
        }
        output += "\n\t";
        output += "Unknown Kills: " + this.data.counters.unknownKills;
        output += "\n\t";
        output += "Unknown Wipes: " + this.data.counters.unknownWipes;
        if (!(this.data.firstSeen.unknownWipesFDTM === undefined)) {
            output += "\n\t";
            output += "First Unknown Wipe: " + new Date(this.data.firstSeen.unknownWipesFDTM);
        }
        if (!(this.data.firstSeen.unknownKillsFDTM === undefined)) {
            output += "\n\t";
            output += "First Unknown Kill: " + new Date(this.data.firstSeen.unknownKillsFDTM);
        }
        return output;
    }

    prettyPrintCSV(separator: string) {
        let output = '';
        output += '"' + this.name + '"';
        output += separator;
        output += this.data.counters.normalKills;
        output += separator;
        output += this.data.counters.normalWipes;
        output += separator;
        if (!(this.data.firstSeen.normalWipesFDTM === undefined)) {
            output += new Date(this.data.firstSeen.normalWipesFDTM);
        }
        output += separator;
        if (!(this.data.firstSeen.normalKillsFDTM === undefined)) {
            output += new Date(this.data.firstSeen.normalKillsFDTM);
        }
        output += separator;
        output += this.data.counters.heroicKills;
        output += separator;
        output += this.data.counters.heroicWipes;
        output += separator;
        if (!(this.data.firstSeen.heroicWipesFDTM === undefined)) {
            output += new Date(this.data.firstSeen.heroicWipesFDTM);
        }
        output += separator;
        if (!(this.data.firstSeen.heroicKillsFDTM === undefined)) {
            output += new Date(this.data.firstSeen.heroicKillsFDTM);
        }
        output += separator;
        output += this.data.counters.mythicKills;
        output += separator;
        output += this.data.counters.mythicWipes;
        output += separator;
        if (!(this.data.firstSeen.mythicWipesFDTM === undefined)) {
            output += new Date(this.data.firstSeen.mythicWipesFDTM);
        }
        output += separator;
        if (!(this.data.firstSeen.mythicKillsFDTM === undefined)) {
            output += new Date(this.data.firstSeen.mythicKillsFDTM);
        }
        output += separator;
        output += this.data.counters.raiderfinderKills;
        output += separator;
        output += this.data.counters.raidfinderWipes;
        output += separator;
        if (!(this.data.firstSeen.raidfinderWipesFDTM === undefined)) {
            output += new Date(this.data.firstSeen.raidfinderWipesFDTM);
        }
        output += separator;
        if (!(this.data.firstSeen.raidfinderKillsFDTM === undefined)) {
            output += new Date(this.data.firstSeen.raidfinderKillsFDTM);
        }
        output += separator;
        output += this.data.counters.unknownKills;
        output += separator;
        output += this.data.counters.unknownWipes;
        output += separator;
        if (!(this.data.firstSeen.unknownWipesFDTM === undefined)) {
            output += new Date(this.data.firstSeen.unknownWipesFDTM);
        }
        output += separator;
        if (!(this.data.firstSeen.unknownKillsFDTM === undefined)) {
            output += new Date(this.data.firstSeen.unknownKillsFDTM);
        }
        return output;
    }

    static getHeader(separator: string) {
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

    static getMember(difficulty: EncounterDifficulty, kill: EncounterKillStatus) {
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

    static getMemberSeen(difficulty: EncounterDifficulty, kill: EncounterKillStatus) {
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

const options: OptionsOfJSONResponseBody = {
    responseType: 'json',
    headers: {
        'Connection': 'keep-alive'
    },
    method: 'GET',
    dnsCache: true,
    retry: 2,
    timeout: {
        request: 10000
    }
};

function getReportListUser(userName: string) {
    console.log(`Logs for user ${userName}`);
    return getReportListFromURL(base_uri + report_list_api_user + userName + api_key);
}

function getReportListGuild(guildname: string, guildserver: string, guildregion: string) {
    console.log(`Logs for guild: ${guildname} on ${guildserver} in ${guildregion}`);
    return getReportListFromURL(base_uri + report_list_api_guild + guildname + "/" + guildserver + "/" + guildregion + api_key);
}

async function getReportListFromURL(url: string) {
    let ids: Array<number> = [];
    try {
        const response = await got<ExpectedReportListBody>(url, options);
        if (response.statusCode == 200) {
            response.body.forEach((item) => {
                ids.push(item['id']);
            });
        }
    } catch (error) {
        console.log(error);
    }
    return ids;
}

async function getReport(id: number, report_db: CachedReports): Promise<ExpectedReport> {
    //console.log(`Getting Report: ${id} from ${base_uri+report_api+id+api_key}`);
    let ret_value: ExpectedReport = {
        start: 0,
        fights: []
    };
    if (report_db.fetched_report_ids.includes(id)) {
        cache_hits++;
        ret_value = report_db.fetched_reports[id];
    } else {
        try {
            const response = await got<ExpectedReport>(base_uri + report_api + id + api_key, options);
            if (response.statusCode == 200) {
                cache_misses++;
                report_db.fetched_report_ids.push(id);
                report_db.fetched_reports[id] = response.body;
                ret_value = report_db.fetched_reports[id];
            }
        } catch (error) {
            console.log(error);
        }
    }
    return ret_value;
}

function handle_id_list(data: number[]) {
    let report_ids = data;

    let promises: Promise<ExpectedReport>[] = [];
    let fight_list: Fight[] = [];

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

function handle_report(data: ExpectedReport, fights: Fight[]) {
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

function completed(fights: Fight[]) {
    let results: Record<string, FightResult> = {};

    console.log("Processing: " + fights.length + " fights");

    fights.forEach((fight) => {
        let name = fight['name'];
        if (!(name in results)) {
            results[name] = new FightResult(name);
        }
        results[name].data.counters[FightResult.getMember(fight['difficulty'], fight['kill'])]++;

        const hld = FightResult.getMemberSeen(fight['difficulty'], fight['kill']);
        const foundSeen = results[name].data.firstSeen[hld] !== undefined;
        if (!(hld in results[name])) {
            results[name].data.firstSeen[hld] = fight["start"];
        } else if (results[name].data.firstSeen[hld] !== undefined) {
            if (<number>results[name].data.firstSeen[hld] > fight["start"]) {
                results[name].data.firstSeen[hld] = fight["start"];
            }
        }
    });

    let output_data = '';

    if (program_options.output_type == "text") {
        Object.keys(results).forEach(function (key) {
            output_data += results[key].prettyPrint() + '\n';
        });
    } else if (program_options.output_type == "csv") {
        output_data += FightResult.getHeader(',') + '\n';
        Object.keys(results).forEach(function (key) {
            output_data += results[key].prettyPrintCSV(',') + '\n';
        });
    }

    if (program_options.file_name == '' || program_options.file_name == undefined) {
        console.log(output_data);
    } else {
        fs.writeFile(resolve(program_options.file_name), output_data, 'utf8', () => {
            console.log("Output saved to: " + program_options.file_name);
        });
    }

    saveData();
}

function saveData() {
    fs.writeFile(resolve("db.json"), JSON.stringify(cached_reports), "utf8", () => {
        console.log("DB Saved");
    });
}

const parser = yargs(hideBin(process.argv))
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
    .option("file_name", {
        description: "Output filename",
        alias: 'f',
        type: 'string',
        default: ''
    })
    .conflicts('guild', 'user')
    .command('csv', "Produce CSV output")
    .help()
    .alias('help', 'h');

const argv = await parser.argv;

function run() {

    if (argv.csv) {
        program_options.output_type = "csv";
    }

    program_options.file_name = argv.file_name;

    if (argv.guild && argv.guild_name != undefined && argv.guild_server != undefined && argv.guild_region != undefined) {
        getReportListGuild(argv.guild_name, argv.guild_server, argv.guild_region).then(handle_id_list);
    } else if (argv.user && argv.user_name != undefined) {
        getReportListUser(argv.user_name).then(handle_id_list);
    } else {
    }
}

run();
