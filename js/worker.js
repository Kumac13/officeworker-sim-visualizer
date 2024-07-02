class Worker {
  constructor(id, name, kind, x, y) {
    this.id = id;
    this.name = name;
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.tasks = [];
    this.currentTask = null;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  removeTask(task) {
    this.tasks = this.tasks.filter((t) => t !== task);
  }

  processTask() {
    if (this.currentTask) {
      this.currentTask.amount--;
      if (this.currentTask.amount <= 0) {
        this.currentTask = null;
      }
    } else if (this.tasks.length > 0) {
      this.currentTask = this.tasks.shift();
    }
  }

  getCurrentTaskInfo() {
    return this.currentTask
      ? `subject: ${this.currentTask.subject}\namount: ${this.currentTask.amount}`
      : "No Task";
  }
}
