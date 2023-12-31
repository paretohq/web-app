import { randomUUID } from "crypto";
import { Octokit } from "octokit";
import generatorWorflowFileBuilder from "../builders/files/generatorWorkflowFileBuilder";
import paretoJsonBuilder from "../builders/files/paretoJsonBuilder";
import sodiumize from "./sodiumize";

export default class Kitter {
  octokit;
  repo_name: string;

  constructor() {
    this.octokit = new Octokit({ auth: process.env.PARETO_PAT });
    this.repo_name = randomUUID();
  }

  async createParetoRepo() {
    try {
      await this.octokit.request("POST /orgs/{org}/repos", {
        org: "paretohq",
        name: this.repo_name,
        description: "New Pareto Repository",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      console.log(
        "\x1b[32m",
        `Repository: ${this.repo_name} created successfully`,
        "\x1b[0m",
      );
      return true;
    } catch (error) {
      console.log("\x1b[31m", "Filed Step: createParetoRepo()", "\x1b[0m");
      return false;
    }
  }

  async putParetoSchemaFile() {
    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: "paretohq",
        repo: this.repo_name,
        path: ".pareto/schema.json",
        message: "Create .pareto/schema.json",
        content: btoa(paretoJsonBuilder()),
      });

      console.log(
        "\x1b[32m",
        "Pareto schema file created successfully",
        "\x1b[0m",
      );
      return true;
    } catch (error) {
      console.log("\x1b[31m", "Filed Step: putParetoSchemaFile()", "\x1b[0m");
      return false;
    }
  }

  async putGeneratorActionFile() {
    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: "paretohq",
        repo: this.repo_name,
        path: ".github/workflows/pareto-generate.yml",
        message: "Create generation workflow",
        content: btoa(generatorWorflowFileBuilder()),
      });
      console.log(
        "\x1b[32m",
        "Generation workflow file created successfully",
        "\x1b[0m",
      );
      return true;
    } catch (error) {
      console.log(
        "\x1b[31m",
        "Filed Step: putGeneratorActionFile()",
        "\x1b[0m",
      );
      return false;
    }
  }

  async putParetoSecretToken() {
    try {
      const public_key = await this.octokit.request(
        "GET /repos/{owner}/{repo}/actions/secrets/public-key",
        {
          owner: "paretohq",
          repo: this.repo_name,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );

      const encrypted_value = await sodiumize(
        public_key.data.key,
        process.env.PARETO_PAT!,
      );

      await this.octokit.request(
        "PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}",
        {
          owner: "paretohq",
          repo: this.repo_name,
          secret_name: "PARETO_PAT",
          encrypted_value,
          key_id: public_key.data.key_id,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );

      console.log(
        "\x1b[32m",
        "Pareto secret token added successfully",
        "\x1b[0m",
      );
      return true;
    } catch (error) {
      console.log("\x1b[31m", "Filed Step: puParetoSecretToken()", "\x1b[0m");
      return false;
    }
  }
}
