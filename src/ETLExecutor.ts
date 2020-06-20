import * as fs from 'fs';
import * as path from 'path';
import logger from './Logger';

const executionDir = process.argv[2];
const flowDir = path.join(executionDir, 'flow');
const finalizeDir = path.join(executionDir, 'finalize');

const flowDirsRelative = fs.readdirSync(flowDir).sort((a, b) => a.localeCompare(b));
const flowDirsAbsolute = flowDirsRelative.map(dir => path.join(flowDir, dir));

let startTime: [number, number];

const executionStart: Promise<void> = new Promise(resolve => {
    generateFlowchartInput(path.join(__dirname, '../flowchart', 'input.mmd'), flowDir, flowDirsRelative);
    startTime = process.hrtime();
    resolve();
});
let executionChain: Promise<void> = Promise.resolve(executionStart);

for (let dir of flowDirsAbsolute) {
    const taskFunctions: Function[] = fs.readdirSync(dir).map(file => path.join(dir, file)).map(file => require(file).default);
    
    executionChain = executionChain.then(getNextExecutionChainPart(taskFunctions));
}

const taskFunctions: Function[] = fs.readdirSync(finalizeDir).map(file => path.join(finalizeDir, file)).map(file => require(file).default);

executionChain = executionChain.then(getNextExecutionChainPart(taskFunctions));

executionChain.then(() => {
    const endTime = process.hrtime(startTime);
    logger.info(`Execution time: ${endTime[0]},${Math.round(endTime[1] / 1000000)}ms`);
});

function getNextExecutionChainPart(taskFunctions: Function[]) {
    return () => {
        taskFunctions.forEach(taskFunction => logger.info(`Begin executing task: ${taskFunction.name}`));
        const tasks = taskFunctions.map(func => func());
    
        return Promise.all(tasks)
            .catch(err => {
                logger.error(err);
                process.exit(0);
            })
            .then(() => taskFunctions.forEach(taskFunction => logger.info(`Finished executing task: ${taskFunction.name}`)));
    }
}

function generateFlowchartInput(filePath: string, flowDir: string, flowDirs: string[]) {
    let flowchartInput: string = 'graph LR\r\n';
    let previousFiles: string[] = [];
    let previousDir: string = '';
    for (let i = 0, len = flowDirs.length; i < len; i++) {
        const dir = flowDirs[i];
        const files = fs.readdirSync(path.join(flowDir, dir));

        if (previousFiles.length > 0) {
            flowchartInput = previousFiles.reduce(
                (flowchartInput, previousFile) => {
                    const taskFunction: Function = require(path.join(flowDir, previousDir, previousFile)).default;

                    return `${flowchartInput}   ${previousFile}(${previousFile} - ${taskFunction.name})-->${previousDir}END{${previousDir}-END}\r\n`;
                },
                flowchartInput
            );
            flowchartInput = `${flowchartInput}   ${previousDir}END{${previousDir}-END}-->${dir}\r\n`;

            previousFiles.splice(0, previousFiles.length);
        }
        previousFiles = previousFiles.concat(files);

        flowchartInput = `${flowchartInput}   ${dir}-->${dir}BEGIN{${dir}-BEGIN}\r\n`;

        flowchartInput = files.reduce(
            (flowchartInput, file) => {
                const taskFunction: Function = require(path.join(flowDir, dir, file)).default;

                return `${flowchartInput}   ${dir}BEGIN{${dir}-BEGIN}-->${file}(${file} - ${taskFunction.name})\r\n`;
            },
            flowchartInput
        );

        previousDir = dir;
    }

    if (previousFiles.length > 0) {
        flowchartInput = previousFiles.reduce(
            (flowchartInput, previousFile) => {
                const taskFunction: Function = require(path.join(flowDir, previousDir, previousFile)).default;

                return `${flowchartInput}   ${previousFile}(${previousFile} - ${taskFunction.name})-->${previousDir}END{${previousDir}-END}\r\n`;
            },
            flowchartInput
        );
    }
    
    fs.writeFile(filePath, flowchartInput, () => logger.info('Created flowchart input file'));
}