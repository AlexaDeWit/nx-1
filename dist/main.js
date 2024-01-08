import core from '@actions/core';
import crypto from 'node:crypto';
import { readJsonFile, writeJsonFile } from 'nx/src/utils/fileutils.js';
import { execFileSync } from 'node:child_process';
import { nx, nxJsonPath, runner } from './nx.js';
const tmpRunnerID = crypto.randomUUID();
const overrideNxJson = () => {
    const nxJson = readJsonFile(nxJsonPath);
    writeJsonFile(nxJsonPath, {
        ...nxJson,
        tasksRunnerOptions: {
            ...nxJson.tasksRunnerOptions,
            [tmpRunnerID]: {
                runner
            }
        }
    });
    return {
        revert: () => writeJsonFile(nxJsonPath, nxJson)
    };
};
export function run() {
    const args = core.getInput('nx').split(' ');
    try {
        const { revert } = overrideNxJson();
        execFileSync(nx, [...args, `--runner=${tmpRunnerID}`], { stdio: 'inherit' });
        revert();
    }
    catch (error) {
        core.setFailed(error);
    }
}
