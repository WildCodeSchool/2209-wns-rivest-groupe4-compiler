import express, { Request, Response } from "express";
import { exec } from "child_process";
import fs from "fs-extra";

const execShellCommand = (cmd: string) => {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (stdout) {
        resolve(stdout);
      } else {
        reject(stderr);
      }
    });
  });
};

const fileRouter = express.Router();

const decodeBase64 = (data: string) => {
  return Buffer.from(data, "base64").toString("ascii");
};

fileRouter.post("/", async (req: Request, res: Response) => {
  const fileContent: string = req.body.code;
  const fileExtension: string = req.body.fileExtension;
  const filename: string =
    fileExtension === "ts"
      ? "./src/child-processes/code.ts"
      : "./src/child-processes/code.js";

  try {
    await fs.createFile(filename);
    await fs.writeFile(filename, decodeBase64(fileContent));
    try {
      let codeResult;
      if (fileExtension === "ts") {
        codeResult = await execShellCommand(
          `tsc ${filename} && node ${filename.replace(".ts", ".js")}`
        );
      }
      if (fileExtension === "js") {
        codeResult = await execShellCommand(`node ${filename}`);
      }
      return res.status(200).send(codeResult);
    } catch (error: any) {
      if (error) {
        res.status(500).send(error);
      }
    }
  } catch (error: any) {
    res.status(500).send(error);
  }
});

export default fileRouter;
