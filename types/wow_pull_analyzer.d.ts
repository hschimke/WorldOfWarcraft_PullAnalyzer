interface CachedReports {
    fetched_report_ids: number[],
    fetched_reports: Record<number, ExpectedReport>
}

interface ProgramOptions {
    output_type: string,
    file_name?: string
}

type WipeKillFDTM = undefined | number;
type EncounterDifficulty = number;
type EncounterKillStatus = boolean | undefined;
type ExpectedReportListBody = Record<string, number>[];

interface ExpectedReport {
    start: number,
    fights: {
        boss: number,
        name: string,
        kill: boolean | undefined,
        difficulty: number,
        end_time: number,
        start_time: number
    }[]
}

interface Fight {
    name: string,
    kill: boolean | undefined,
    difficulty: number,
    start: number,
    duration: number
}

interface FightResultClassDataCounter {
    [index: string]: number
}


interface FightResultClassDataFirstSeen {
    [index: string]: WipeKillFDTM | undefined
}

interface FightResultClassData {
    counters: FightResultClassDataCounter,
    firstSeen: FightResultClassDataFirstSeen
}