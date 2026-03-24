const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Логування
ipcMain.on("log-message", (event, msg) => {
  const config = JSON.parse(fs.readFileSync("config.json"));
  fs.appendFileSync(config.logFile, `[${new Date().toISOString()}] ${msg}\n`);
});

// Вибір файлу
ipcMain.handle("select-file", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Text", extensions: ["txt"] }]
  });
  return result.canceled ? null : result.filePaths[0];
});