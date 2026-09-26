import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

export async function POST(req: Request) {
  try {
    const { folderName } = await req.json();
    
    if (!folderName) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folderPath = path.join(process.cwd(), "downloads", folderName);
    
    if (!fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Folder does not exist" }, { status: 404 });
    }

    const platform = os.platform();
    
    return new Promise<NextResponse>((resolve) => {
      let cmd: string;
      let args: string[];
      
      if (platform === 'win32') {
        cmd = 'explorer.exe';
        args = [folderPath];
      } else if (platform === 'darwin') {
        cmd = 'open';
        args = [folderPath];
      } else {
        cmd = 'xdg-open';
        args = [folderPath];
      }

      console.log(`Attempting to open folder with: ${cmd} "${folderPath}"`);

      import('child_process').then(({ execFile }) => {
        execFile(cmd, args, (error, stdout, stderr) => {
          if (error) {
            // explorer.exe often returns exit code 1 even on success
            if (platform === 'win32' && error.code === 1) {
              console.log('explorer.exe exited with code 1 (normal behavior on Windows). Folder opened successfully.');
              resolve(NextResponse.json({ success: true }));
            } else {
              console.error(`Failed to open folder. Error:`, error);
              console.error(`stderr:`, stderr);
              resolve(NextResponse.json({ error: "Failed to open folder" }, { status: 500 }));
            }
          } else {
            console.log(`Successfully opened folder: ${folderPath}`);
            resolve(NextResponse.json({ success: true }));
          }
        });
      });
    });

  } catch (error) {
    console.error("Open Folder Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
