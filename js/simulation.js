class Simulation {
  constructor(visualizer) {
    this.iterationCount = 0;
    this.iterationInterval = 500;
    this.simulationInterval = null;
    this.visualizer = visualizer;
    this.timeManager = new TimeManager();
    this.activeProcessInstances = [];
    this.processManager = new ProcessManager();
  }

  initialize() {
    this.processManager.createWorkerAndCommunicationTool();
    this.processManager.createLinks();
    this.visualizer.updateWorkers(this.processManager.workers);
    this.visualizer.updateLinks(this.processManager.links);
    this.visualizer.updateCommunicationNodes(
      this.processManager.communicationTools
    );
  }

  simulateIteration() {
    this.startPhase();
    this.processPhase();
    this.endPhase();
  }

  startPhase() {
    this.iterationCount++;
    this.timeManager.incrementTime();
    this.visualizer.updateSimulationTime(this.timeManager);

    this.processManager.processes.forEach((process) => {
      if (process.isStartTiming(this.iterationCount, this.timeManager)) {
        this.startNewProcessInstance(process);
      }
    });
  }

  processPhase() {
    this.processActiveInstances();
    this.processManager.executeTasks(this.visualizer);
  }

  endPhase() {
    // handle end of task and process
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
    this.timeManager = new TimeManager();
    this.activeProcessInstances = [];
    this.processManager.workers.forEach((worker) => {
      worker.tasks = [];
      worker.currentTask = null;
    });
    this.visualizer.updateWorkers(this.processManager.workers);
    this.visualizer.updateTaskStacks(this.processManager.workers);
    this.visualizer.updateSimulationTime(this.timeManager);
  }

  step() {
    this.simulateIteration();
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
    const fromWorker = this.processManager.workers.find(
      (w) => w.name === taskConfig.from
    );
    const toWorker = this.processManager.workers.find(
      (w) => w.name === taskConfig.to
    );
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
      this.visualizer.updateTaskStacks(this.processManager.workers);
      this.moveTask(newTask, fromWorker, toWorker, () => {
        toWorker.currentTask = newTask;
        this.visualizer.updateWorkers(this.processManager.workers);
      });
    }
  }

  moveTask(task, fromWorker, toWorker, callback) {
    fromWorker.removeTask(task);
    this.visualizer.updateTaskStacks(this.processManager.workers);

    const moveTaskVisual = task.by
      ? this.visualizer.moveTaskVisualWithIntermediate.bind(this.visualizer)
      : this.visualizer.moveTaskVisual.bind(this.visualizer);

    const intermediateNode = task.by
      ? this.processManager.communicationTools.find(
          (node) => node.id === task.by
        )
      : null;

    moveTaskVisual(
      task,
      fromWorker,
      toWorker,
      intermediateNode,
      this.iterationInterval,
      () => {
        toWorker.addTask(task);
        this.visualizer.updateWorkers(this.processManager.workers);
        this.visualizer.updateTaskStacks(this.processManager.workers);
        if (callback) callback();
      }
    );
  }

  processActiveInstances() {
    this.activeProcessInstances.forEach((processInstance) => {
      const currentTask =
        processInstance.tasks[processInstance.currentTaskIndex];
      if (currentTask && currentTask.remainingAmount > 0) {
        const worker = this.processManager.workers.find(
          (w) => w.name === currentTask.to
        );
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

  setIterationSpeed(interval) {
    this.iterationInterval = interval;
    if (this.simulationInterval) {
      this.stop();
      this.start();
    }
  }

  setProcesses(processes) {
    this.processManager.setProcesses(processes);
    this.initialize();
  }

  updateLayout() {
    this.processManager.createWorkerAndCommunicationTool();
    this.processManager.createLinks();
    this.visualizer.updateWorkers(this.processManager.workers);
    this.visualizer.updateLinks(this.processManager.links);
    this.visualizer.updateCommunicationNodes(
      this.processManager.communicationTools
    );
  }
}
