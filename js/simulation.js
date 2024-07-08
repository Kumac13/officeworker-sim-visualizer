class Simulation {
  constructor(visualizer) {
    this.workers = [];
    this.links = [];
    this.iterationCount = 0;
    this.iterationInterval = 500;
    this.simulationInterval = null;
    this.visualizer = visualizer;
    this.communicationNodes = [];
    this.timeManager = new TimeManager();
    this.processes = [];
    this.activeProcessInstances = [];
  }

  initialize() {
    this.createWorkersAndNodesFromProcesses();
    this.createLinks();
    this.visualizer.updateWorkers(this.workers);
    this.visualizer.updateLinks(this.links);
    this.visualizer.updateCommunicationNodes(this.communicationNodes);
  }

  simulateIteration() {
    this.iterationCount++;
    this.timeManager.incrementTime();
    this.visualizer.updateSimulationTime(this.timeManager);

    this.processes.forEach((process) => {
      if (this.shouldTriggerProcess(process)) {
        this.startNewProcessInstance(process);
      }
    });

    this.processActiveInstances();
    this.processTasks();
  }

  start() {
    this.stop();
    this.simulationInterval = setInterval(
      () => this.simulateIteration(),
      this.iterationInterval
    );
  }

  stop() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  reset() {
    this.stop();
    this.iterationCount = 0;
    this.activeProcessInstances = [];
    this.workers.forEach((worker) => {
      worker.tasks = [];
      worker.currentTask = null;
    });
    this.visualizer.updateWorkers(this.workers);
    this.visualizer.updateTaskStacks(this.workers);
    this.timeManager = new TimeManager();
  }

  step() {
    this.simulateIteration();
  }

  createWorkersAndNodesFromProcesses() {
    const workerNames = new Set();
    const communicationNodeNames = new Set();

    this.processes.forEach((process) => {
      process.tasks.forEach((task) => {
        workerNames.add(task.from);
        workerNames.add(task.to);
        if (task.by) {
          communicationNodeNames.add(task.by);
        }
      });
    });

    this.workers = Array.from(workerNames).map((name, index) => {
      const angle = (index / workerNames.size) * 2 * Math.PI - Math.PI / 2;
      const svg = d3.select("#simulation-svg");
      const width = svg.node().clientWidth;
      const height = svg.node().clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return new Worker(index + 1, name, x, y);
    });

    this.communicationNodes = Array.from(communicationNodeNames).map(
      (name, index) => {
        const angle =
          (index / communicationNodeNames.size) * 2 * Math.PI - Math.PI / 2;
        const svg = d3.select("#simulation-svg");
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.4;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return { id: name, x: x, y: y };
      }
    );
  }

  createLinks() {
    this.links = [];
    for (let i = 0; i < this.workers.length; i++) {
      for (let j = i + 1; j < this.workers.length; j++) {
        this.links.push({
          source: this.workers[i],
          target: this.workers[j],
          type: "worker",
        });
      }
    }
    this.workers.forEach((worker) => {
      this.communicationNodes.forEach((node) => {
        this.links.push({
          source: worker,
          target: node,
          type: "communication",
        });
      });
    });
  }

  shouldTriggerProcess(process) {
    const totalMinutes =
      this.iterationCount * this.timeManager.timeConfig.minutesPerIteration;
    const minutesPerHour = this.timeManager.timeConfig.minutesPerHour;
    const hoursPerDay = this.timeManager.timeConfig.hoursPerDay;
    const daysPerWeek = this.timeManager.timeConfig.daysPerWeek;
    const weeksPerMonth = this.timeManager.timeConfig.weeksPerMonth;
    const monthsPerYear = this.timeManager.timeConfig.monthsPerYear;

    switch (process.timing) {
      case "perminutes":
        return totalMinutes % process.frequency === 0;
      case "hourly":
        return totalMinutes % (minutesPerHour / process.frequency) === 0;
      case "daily":
        return (
          totalMinutes %
            ((minutesPerHour * hoursPerDay) / process.frequency) ===
          0
        );
      case "weekly":
        return (
          totalMinutes %
            ((minutesPerHour * hoursPerDay * daysPerWeek) /
              process.frequency) ===
          0
        );
      case "monthly":
        return (
          totalMinutes %
            ((minutesPerHour * hoursPerDay * daysPerWeek * weeksPerMonth) /
              process.frequency) ===
          0
        );
      case "yearly":
        return (
          totalMinutes %
            ((minutesPerHour *
              hoursPerDay *
              daysPerWeek *
              weeksPerMonth *
              monthsPerYear) /
              process.frequency) ===
          0
        );
      default:
        return false;
    }
  }

  startNewProcessInstance(process) {
    const processInstance = {
      process,
      currentTaskIndex: 0,
      tasks: process.tasks.map((task) => ({
        ...task,
        remainingAmount: task.amount,
      })),
    };
    this.activeProcessInstances.push(processInstance);
    this.startNextTask(processInstance);
  }

  startNextTask(processInstance) {
    if (processInstance.currentTaskIndex < processInstance.tasks.length) {
      const taskConfig =
        processInstance.tasks[processInstance.currentTaskIndex];
      this.createAndMoveTask(taskConfig, processInstance);
    } else {
      const index = this.activeProcessInstances.indexOf(processInstance);
      if (index > -1) {
        this.activeProcessInstances.splice(index, 1);
      }
    }
  }

  createAndMoveTask(taskConfig, processInstance) {
    const fromWorker = this.workers.find((w) => w.name === taskConfig.from);
    const toWorker = this.workers.find((w) => w.name === taskConfig.to);
    if (fromWorker && toWorker) {
      const newTask = new Task(
        taskConfig.id,
        taskConfig.subject,
        fromWorker.id,
        toWorker.id,
        1,
        1,
        taskConfig.remainingAmount,
        "",
        "",
        taskConfig.by
      );
      fromWorker.addTask(newTask);
      this.visualizer.updateTaskStacks(this.workers);
      this.moveTask(newTask, fromWorker, toWorker, () => {
        toWorker.currentTask = newTask;
        this.visualizer.updateWorkers(this.workers);
      });
    }
  }

  moveTask(task, fromWorker, toWorker, callback) {
    fromWorker.removeTask(task);
    this.visualizer.updateTaskStacks(this.workers);

    const moveTaskVisual = task.by
      ? this.visualizer.moveTaskVisualWithIntermediate.bind(this.visualizer)
      : this.visualizer.moveTaskVisual.bind(this.visualizer);

    const intermediateNode = task.by
      ? this.communicationNodes.find((node) => node.id === task.by)
      : null;

    moveTaskVisual(
      task,
      fromWorker,
      toWorker,
      intermediateNode,
      this.iterationInterval,
      () => {
        toWorker.addTask(task);
        this.visualizer.updateWorkers(this.workers);
        this.visualizer.updateTaskStacks(this.workers);
        if (callback) callback();
      }
    );
  }

  processActiveInstances() {
    this.activeProcessInstances.forEach((processInstance) => {
      const currentTask =
        processInstance.tasks[processInstance.currentTaskIndex];
      if (currentTask && currentTask.remainingAmount > 0) {
        const worker = this.workers.find((w) => w.name === currentTask.to);
        if (
          worker &&
          worker.currentTask &&
          worker.currentTask.id === currentTask.id
        ) {
          worker.currentTask.amount--;
          currentTask.remainingAmount--;
          if (currentTask.remainingAmount <= 0) {
            worker.currentTask = null;
            processInstance.currentTaskIndex++;
            this.startNextTask(processInstance);
          }
        }
      }
    });
  }

  processTasks() {
    this.workers.forEach((worker) => {
      if (!worker.currentTask && worker.tasks.length > 0) {
        worker.currentTask = worker.tasks.shift();
      }
    });
    this.visualizer.updateWorkers(this.workers);
  }

  setIterationSpeed(interval) {
    this.iterationInterval = interval;
    if (this.simulationInterval) {
      this.stop();
      this.start();
    }
  }

  setProcesses(processes) {
    this.processes = processes;
    console.log("Processes set:", this.processes);
    this.initialize();
  }

  updateLayout() {
    this.createWorkersAndNodesFromProcesses();
    this.createLinks();
    this.visualizer.updateWorkers(this.workers);
    this.visualizer.updateLinks(this.links);
    this.visualizer.updateCommunicationNodes(this.communicationNodes);
  }
}
