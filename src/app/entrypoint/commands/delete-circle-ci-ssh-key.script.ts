#!/usr/bin/env node


//ts-node src/app/entrypoint/commands/delete-circle-ci-ssh-key.script.ts --project=user-service --sshKey="privateKeyHere"
import yargs from "yargs"
import {hideBin} from "yargs/helpers"
import * as circleciService from "../../../services/circleci.service";
import env from "../../../common/env";

const argv: any = yargs(hideBin(process.argv)).argv

const execute = async () => {

    if(!argv.project) throw new Error("Project is required");

    if(!argv.fingerprint) throw new Error("Fingerprint is required");
    //get all projects
    const projectsResponse = await circleciService.getProjects();

    // console.log("project response", projectsResponse);

    if(projectsResponse.error) throw new Error(projectsResponse.error);

    for(let project of projectsResponse.data){
        if(project.reponame !== argv.project) continue;

        if(project.username !== env.circleciOrg) continue;


        await processSSHKey(project, argv);
    }

    process.exit(0);
};


async function processSSHKey(project: any, argv: Record<string, any>){

    const vcsSlug: string = `${project.vcs_type}/${project.username}/${project.reponame}`;

    const projectResponse = await circleciService.getProjectByName(vcsSlug);

    console.log("projectResponse", projectResponse.data?.length);

    if(projectResponse.error) throw new Error(projectResponse.error);


    const createSSHKeyResponse = await circleciService.deleteSSHKey(vcsSlug, {
        hostname: argv.host || null,
        fingerprint: argv.fingerprint
    });

    console.log("sshKeyResponse", createSSHKeyResponse);
}
execute();
