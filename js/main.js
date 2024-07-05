let simulation;
let visualizer;

document.addEventListener("DOMContentLoaded", () => {
  const svg = d3.select("#simulation-svg");
  visualizer = new Visualizer(svg);
  simulation = new Simulation(visualizer);

  simulation.initialize();

  // 既存のボタンイベントリスナー
  document.getElementById("startBtn").addEventListener("click", () => {
    simulation.stop();
    simulation.start();
  });

  document.getElementById("stopBtn").addEventListener("click", () => {
    simulation.stop();
  });

  // モーダル関連の要素とイベントリスナー
  const modal = document.getElementById("settingsModal");
  const settingsBtn = document.getElementById("settingsBtn");
  const applyBtn = document.getElementById("applySettings");
  const cancelBtn = document.getElementById("cancelSettings");

  settingsBtn.addEventListener("click", () => {
    modal.style.display = "block";
    loadCurrentSettings();
  });

  applyBtn.addEventListener("click", () => {
    applySettings();
    modal.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  });

  updateSVGSize();
  window.addEventListener("resize", updateSVGSize);
});

function loadCurrentSettings() {
  document.getElementById("iterationSpeed").value = simulation.iterationInterval;
  document.getElementById("workerCount").value = simulation.workers.length;
  document.getElementById("minutesPerIteration").value = simulation.timeManager.timeConfig.minutesPerIteration;
  document.getElementById("minutesPerHour").value = simulation.timeManager.timeConfig.minutesPerHour;
  document.getElementById("hoursPerDay").value = simulation.timeManager.timeConfig.hoursPerDay;
  document.getElementById("daysPerWeek").value = simulation.timeManager.timeConfig.daysPerWeek;
  document.getElementById("weeksPerMonth").value = simulation.timeManager.timeConfig.weeksPerMonth;
  document.getElementById("monthsPerYear").value = simulation.timeManager.timeConfig.monthsPerYear;
}

function applySettings() {
  const workerCount = parseInt(document.getElementById("workerCount").value);
  if (workerCount >= 2) {
    simulation.stop();
    simulation.createWorkers(workerCount);
    simulation.createCommunicationNodes();
    simulation.createLinks();
    visualizer.updateWorkers(simulation.workers);
    visualizer.updateLinks(simulation.links);
    visualizer.updateCommunicationNodes(simulation.communicationNodes);

    simulation.timeManager.timeConfig = {
      minutesPerIteration: parseInt(document.getElementById("minutesPerIteration").value),
      minutesPerHour: parseInt(document.getElementById("minutesPerHour").value),
      hoursPerDay: parseInt(document.getElementById("hoursPerDay").value),
      daysPerWeek: parseInt(document.getElementById("daysPerWeek").value),
      weeksPerMonth: parseInt(document.getElementById("weeksPerMonth").value),
      monthsPerYear: parseInt(document.getElementById("monthsPerYear").value),
    };

    const newIterationSpeed = parseInt(document.getElementById("iterationSpeed").value);
    simulation.setIterationSpeed(newIterationSpeed);
  } else {
    alert("Worker count must be at least 2");
  }
}

function updateSVGSize() {
  const svg = d3.select("#simulation-svg");
  svg.attr("width", window.innerWidth).attr("height", window.innerHeight * 0.8);

  if (simulation) {
    simulation.createWorkers(simulation.workers.length);
    simulation.createCommunicationNodes();
    simulation.createLinks();
    visualizer.updateWorkers(simulation.workers);
    visualizer.updateLinks(simulation.links);
    visualizer.updateCommunicationNodes(simulation.communicationNodes);
  }
}
