import { GameStats } from './index';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import fs from 'fs';

const dbFile = './data/db.json';

if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, '{}');
}

const adapter = new FileSync<Store>(dbFile)
const db = low(adapter)

interface Store {
    a: StoredResult[];
    b: StoredResult[];
}

interface StoredResult {
    paddleHitCounter: number;
    score: { 
        left: number,
        right: number
    };
    didAIWin: boolean;
    consecutiveGame: boolean;
}

function averageAndSD(results: number[]): { mean: number, sd: number } {
    const mean = results.reduce((acc, curr) => acc + curr) / results.length;
    const sd = Math.sqrt(results.map(n => n - mean)
        .map(n => n * n)
        .reduce((acc, curr) => acc + curr) / results.length);
    return {
        mean,
        sd
    };
}

function proportionsP(controlProportion: number, experimentSampleSize: number, experimentPropotion: number): number {
    const top = experimentPropotion - controlProportion;
    const bottom = Math.sqrt((controlProportion * (1 - controlProportion)) / experimentSampleSize);
    return top / bottom;
}

export default class Stats {

    constructor() {
        db.defaults({
            a: [],
            b: []
        }).write();
    }

    shouldRunExperiment(): boolean {
        const state = db.getState();
        const aLen = state.a.length;
        const bLen = state.b.length;
        if (aLen + bLen === 0) {
            return Math.random() > 0.5;
        }
        return Math.random() > (bLen / (aLen + bLen));
    }

    addResult(stats: GameStats) {
        const { paddleHitCounter, consecutiveGame, score } = stats;
        const toStore = {
            paddleHitCounter,
            consecutiveGame,
            score,
            didAIWin: score.left > score.right
        };
        if (stats.activeFlags.includes('smartAI')) {
            db.get('b').push(toStore).write();
        } else {
            db.get('a').push(toStore).write();
        }
    }

    getStats(): Store {
        return db.getState();
    }

    getAveragePaddleHist() {
        const paddleHitsA = db.getState().a.map(r => r.paddleHitCounter);
        const paddleHitsB = db.getState().b.map(r => r.paddleHitCounter);
        const meanAndSDA = averageAndSD(paddleHitsA);
        const meanAndSDB = averageAndSD(paddleHitsB);
        return { 
            a: {
                average: meanAndSDA.mean,
                standardDeviation: meanAndSDA.sd,
                sample: paddleHitsA.length
            },
            b: {
                average: meanAndSDB.mean,
                standardDeviation: meanAndSDB.sd,
                sample: paddleHitsB.length
            }
        };
    }

    getAverageScoreDifference() {
        const scoreDiffsA = db.getState().a.map(r => r.score.right - r.score.left);
        const scoreDiffsB = db.getState().b.map(r => r.score.right - r.score.left);

        const meanAndSDA = averageAndSD(scoreDiffsA);
        const meanAndSDB = averageAndSD(scoreDiffsB);
        return { 
            a: {
                mean: meanAndSDA.mean,
                standardDeviation: meanAndSDA.sd,
                sample: scoreDiffsA.length
            },
            b: {
                mean: meanAndSDB.mean,
                standardDeviation: meanAndSDB.sd,
                sample: scoreDiffsB.length
            }
        };
    }
    
    getConsecutiveGamePlayed() {
        const sampleA = db.getState().a.length;
        const sampleB = db.getState().b.length;

        const consecutiveA = db.getState().a.filter(r => r.consecutiveGame).length;
        const consecutiveB = db.getState().b.filter(r => r.consecutiveGame).length;

        const proportionA = consecutiveA / sampleA;
        const proportionB = consecutiveB / sampleB;

        const pValue = proportionsP(proportionA, sampleB, proportionB);
        return { 
            pValue,
            a: {
                sample: sampleA,
                proportion: proportionA
            },
            b: {
                sample: sampleB,
                proportion: proportionB
            }
        }
    }

    getProportionsAIWon() {
        const sampleA = db.getState().a.length;
        const sampleB = db.getState().b.length;

        const consecutiveA = db.getState().a.filter(r => r.didAIWin).length;
        const consecutiveB = db.getState().b.filter(r => r.didAIWin).length;

        const proportionA = consecutiveA / sampleA;
        const proportionB = consecutiveB / sampleB;

        const pValue = proportionsP(proportionA, sampleB, proportionB);
        return {
            pValue,
            a: {
                sample: sampleA,
                proportion: proportionA
            },
            b: {
                sample: sampleB,
                proportion: proportionB
            }
        }
    }

    // averageFieldForCohort()
}