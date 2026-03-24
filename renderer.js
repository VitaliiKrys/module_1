const { ipcRenderer } = require("electron");
const natural = require("natural");
const fs = require("fs");
const path = require("path");

let classifier = new natural.BayesClassifier();
let modelTrained = false; // прапорець для перевірки
const config = JSON.parse(fs.readFileSync("config.json"));

// Навчання моделі
function trainModel() {
  const docPath = config.defaultDocPath;
  if (!fs.existsSync(docPath)) {
    alert("Папка documents не знайдена!");
    return;
  }

  const files = fs.readdirSync(docPath);
  if (files.length === 0) {
    alert("У папці documents немає файлів!");
    return;
  }

  files.forEach(file => {
    const filePath = path.join(docPath, file);
    const text = fs.readFileSync(filePath, "utf-8");
    const category = file.split("_")[0]; // категорія з імені файлу
    classifier.addDocument(text, category);
    ipcRenderer.send("log-message", `Added ${file} as ${category}`);
  });

  classifier.train();
  modelTrained = true;
  ipcRenderer.send("log-message", "Model trained successfully");
  alert("Модель навчена!");
}

// Класифікація документа
async function classifyDocument() {
  if (!modelTrained) {
    alert("Спершу навчіть модель!");
    return;
  }

  const filePath = await ipcRenderer.invoke("select-file");
  if (!filePath) return;

  const text = fs.readFileSync(filePath, "utf-8");
  const result = classifier.classify(text);

  ipcRenderer.send("log-message", `Classified ${filePath} as ${result}`);
  document.getElementById("result").innerText = `Категорія: ${result}`;
}

// Прив’язка кнопок
window.onload = () => {
  document.getElementById("trainBtn").onclick = trainModel;
  document.getElementById("classifyBtn").onclick = classifyDocument;
};