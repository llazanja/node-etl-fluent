import * as fs from 'fs';
import * as path from 'path';

const executionDir = process.argv[2];
const flowDir = path.join(executionDir, 'flow');
const finalizeDir = path.join(executionDir, 'finalize');


(async () => {
    const flowDirs = fs.readdirSync(flowDir).sort((a, b) => a.localeCompare(b));

    for (let dir of flowDirs) {
        await processDir(dir);
    }
})();

//createExecutionChain();

function createExecutionChain(): Promise<any[][]> {
    let executionChain: Promise<any[][]> = Promise.resolve([]);
    const flowDirs = fs.readdirSync(flowDir).sort((a, b) => a.localeCompare(b));

    flowDirs.forEach(dir => {
        const files = fs.readdirSync(path.join(flowDir, dir));
        
        executionChain = executionChain.then(() => {
            const tasks: Promise<any[]>[] = [];

            files.forEach(file => {
                const task = require(path.join(flowDir, dir, file));
                tasks.push(task);
            });
            
            return Promise.all(tasks);
        });
    });
    
    return executionChain;
}

async function processDir(dir: string) {
    const files = fs.readdirSync(path.join(flowDir, dir));
        
    const tasks: Promise<any[]>[] = [];

    files.forEach(file => {
        const task = require(path.join(flowDir, dir, file));
        tasks.push(task);
    });
    
    await Promise.all(tasks);
}
