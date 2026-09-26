import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const downloadsDir = path.join(process.cwd(), "downloads");
    if (!fs.existsSync(downloadsDir)) {
      return NextResponse.json({ downloads: [] });
    }

    const folders = fs.readdirSync(downloadsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const downloadsList = folders.map(folder => {
      const folderPath = path.join(downloadsDir, folder);
      
      // Parse created date from timestamp or use stat birthtime
      const stat = fs.statSync(folderPath);
      let createdDate = stat.birthtime;
      
      // Attempt to parse YYYY-MM-DD_HH-mm-ss from folder name
      const match = folder.match(/_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})$/);
      if (match) {
        const parts = match[1].split('_');
        const dateStr = parts[0];
        const timeStr = parts[1].replace(/-/g, ':');
        createdDate = new Date(`${dateStr}T${timeStr}`);
      }

      let reportData = null;
      const reportPath = path.join(folderPath, "download-report.json");
      if (fs.existsSync(reportPath)) {
        try {
          reportData = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
        } catch (e) {
          console.error("Failed to parse report data", e);
        }
      }

      return {
        name: folder,
        path: folderPath,
        createdDate: createdDate.toISOString(),
        businessImagesDownloaded: reportData ? reportData.businessImagesDownloaded : 0,
        reviewImagesDownloaded: reportData ? reportData.reviewImagesDownloaded : 0
      };
    });

    // Sort newest first
    downloadsList.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    return NextResponse.json({ downloads: downloadsList });
  } catch (error) {
    console.error("Downloads List Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
