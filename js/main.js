let simulation;
let visualizer;

document.addEventListener("DOMContentLoaded", () => {
  const svg = d3.select("#simulation-svg");
  visualizer = new Visualizer(svg);
  simulation = new Simulation(visualizer);

  document.getElementById("startBtn").addEventListener("click", () => {
    simulation.start();
    console.log("Start button clicked");
  });

  document.getElementById("stopBtn").addEventListener("click", () => {
    simulation.stop();
    console.log("Stop button clicked");
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    simulation.reset();
    console.log("Reset button clicked");
  });

  document.getElementById("stepBtn").addEventListener("click", () => {
    simulation.step();
    console.log("Step button clicked");
  });

  const settingsModal = document.getElementById("settingsModal");
  const settingsBtn = document.getElementById("settingsBtn");
  const applyBtn = document.getElementById("applySettings");
  const cancelBtn = document.getElementById("cancelSettings");

  settingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "block";
    loadCurrentSettings();
  });

  applyBtn.addEventListener("click", () => {
    applySettings();
    settingsModal.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target == settingsModal) {
      settingsModal.style.display = "none";
    }
  });

  const logModal = document.getElementById("logModal");
  const logBtn = document.getElementById("logBtn");
  const closeLogBtn = document.getElementById("closeLog");

  logBtn.addEventListener("click", () => {
    logModal.style.display = "block";
    displayLog();
  });

  closeLogBtn.addEventListener("click", () => {
    logModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target == logModal) {
      logModal.style.display = "none";
    }
  });

  document
    .getElementById("addProcessBtn")
    .addEventListener("click", addProcess);
  document
    .getElementById("removeProcessBtn")
    .addEventListener("click", removeProcess);
  document
    .getElementById("processContainer")
    .addEventListener("click", (event) => {
      if (event.target.classList.contains("addTaskBtn")) {
        addTask(event.target.closest(".task-container"));
      } else if (event.target.classList.contains("removeTaskBtn")) {
        removeTask(event.target.closest(".task-container"));
      }
    });

  updateSVGSize();
  window.addEventListener("resize", updateSVGSize);
});

function loadCurrentSettings() {
  document.getElementById("iterationSpeed").value =
    simulation.iterationInterval;
  document.getElementById("minutesPerIteration").value =
    simulation.timeManager.timeConfig.minutesPerIteration;
  document.getElementById("minutesPerHour").value =
    simulation.timeManager.timeConfig.minutesPerHour;
  document.getElementById("hoursPerDay").value =
    simulation.timeManager.timeConfig.hoursPerDay;
  document.getElementById("daysPerWeek").value =
    simulation.timeManager.timeConfig.daysPerWeek;
  document.getElementById("weeksPerMonth").value =
    simulation.timeManager.timeConfig.weeksPerMonth;
  document.getElementById("monthsPerYear").value =
    simulation.timeManager.timeConfig.monthsPerYear;
}

function applySettings() {
  simulation.stop();

  simulation.timeManager.timeConfig = {
    minutesPerIteration: parseInt(
      document.getElementById("minutesPerIteration").value
    ),
    minutesPerHour: parseInt(document.getElementById("minutesPerHour").value),
    hoursPerDay: parseInt(document.getElementById("hoursPerDay").value),
    daysPerWeek: parseInt(document.getElementById("daysPerWeek").value),
    weeksPerMonth: parseInt(document.getElementById("weeksPerMonth").value),
    monthsPerYear: parseInt(document.getElementById("monthsPerYear").value),
  };

  const newIterationSpeed = parseInt(
    document.getElementById("iterationSpeed").value
  );
  simulation.setIterationSpeed(newIterationSpeed);

  applyProcessSettings();
}

function applyProcessSettings() {
  const processSettings = document.querySelectorAll(
    "#processContainer .process"
  );
  const processes = [];

  processSettings.forEach((processElement, index) => {
    const processName = processElement.querySelector(
      "input[name='process-name']"
    ).value;
    const timing = processElement.querySelector("select[name='timing']").value;
    const frequency = parseInt(
      processElement.querySelector("input[name='frequency']").value
    );
    const tasks = [];

    const taskElements = processElement.querySelectorAll(".task");
    taskElements.forEach((taskElement) => {
      const task = new Task(
        parseInt(taskElement.querySelector("input[name='id']").value),
        taskElement.querySelector("input[name='subject']").value,
        taskElement.querySelector("input[name='from']").value,
        taskElement.querySelector("input[name='to']").value,
        1,
        1,
        parseInt(taskElement.querySelector("input[name='amount']").value),
        null,
        null,
        taskElement.querySelector("input[name='by']").value
      );
      tasks.push(task);
    });

    const process = new Process(processName, timing, frequency, tasks);

    processes.push(process);
  });

  simulation.setProcesses(processes);
}

function addProcess() {
  const processContainer = document.getElementById("processContainer");
  const processTemplate = document.querySelector(".process").cloneNode(true);
  processTemplate.querySelector("input[name='process-name']").value = "";
  processTemplate.querySelector("input[name='frequency']").value = "";
  const taskContainer = processTemplate.querySelector(".task-container");
  taskContainer.innerHTML = `
    <h4>Task Settings</h4>
    <button class="addTaskBtn">+</button><button class="removeTaskBtn">-</button>
    <div class="task">
      <label>id</label>
      <input type="number" name="id" />
      <label>subject</label>
      <input type="text" name="subject" />
      <label>from</label>
      <input type="text" name="from" />
      <label>to</label>
      <input type="text" name="to" />
      <label>by</label>
      <input type="text" name="by" />
      <label>amount</label>
      <input type="number" name="amount" />
    </div>
  `;
  processContainer.appendChild(processTemplate);
}

function removeProcess() {
  const processContainer = document.getElementById("processContainer");
  if (processContainer.children.length > 1) {
    processContainer.removeChild(processContainer.lastChild);
  }
}

function addTask(taskContainer) {
  const tasks = taskContainer.querySelectorAll(".task");
  const newTaskId = tasks.length + 1;

  const taskTemplate = taskContainer.querySelector(".task").cloneNode(true);
  taskTemplate.querySelector("input[name='id']").value = newTaskId;
  taskTemplate.querySelector("input[name='subject']").value = "";
  taskTemplate.querySelector("input[name='from']").value = "";
  taskTemplate.querySelector("input[name='to']").value = "";
  taskTemplate.querySelector("input[name='by']").value = "";
  taskTemplate.querySelector("input[name='amount']").value = "";
  taskContainer.appendChild(taskTemplate);
}

function removeTask(taskContainer) {
  const tasks = taskContainer.querySelectorAll(".task");
  if (tasks.length > 1) {
    taskContainer.removeChild(tasks[tasks.length - 1]);
    tasks.forEach((task, index) => {
      if (index < tasks.length - 1) {
        task.querySelector("input[name='id']").value = index + 1;
      }
    });
  }
}

function updateSVGSize() {
  const svg = d3.select("#simulation-svg");
  svg.attr("width", window.innerWidth).attr("height", window.innerHeight * 0.8);

  if (simulation) {
    simulation.updateLayout();
  }
}

function displayLog() {
  const logContent = document.getElementById("logContent");
  logContent.innerHTML = "";

  simulation.workers.forEach((worker) => {
    const workerLog = document.createElement("div");
    workerLog.innerHTML = `<h3>${worker.name}</h3>
      <p>Current Task: ${worker.currentTask ? worker.currentTask.subject : "None"}</p>
      <p>Tasks:</p>
      <ul>${worker.tasks.map((task) => `<li>${task.subject}</li>`).join("")}</ul>`;
    logContent.appendChild(workerLog);
  });
}
