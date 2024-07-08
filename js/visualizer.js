class Visualizer {
  constructor(svg) {
    this.svg = svg;
    this.linkLayer = svg.append("g").attr("class", "link-layer");
    this.taskLayer = svg.append("g").attr("class", "task-layer");
    this.workerLayer = svg.append("g").attr("class", "worker-layer");
    this.communicationLayer = svg
      .append("g")
      .attr("class", "communication-layer");
  }

  updateWorkers(workers) {
    const workerNodes = this.workerLayer
      .selectAll("g.worker")
      .data(workers, (d) => d.id);

    const enterNodes = workerNodes
      .enter()
      .append("g")
      .attr("class", "worker")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    enterNodes.append("circle").attr("r", 40).attr("fill", "blue");

    enterNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "white")
      .attr("font-size", "16px")
      .text((d) => d.name);

    enterNodes
      .append("text")
      .attr("class", "kind-text")
      .attr("text-anchor", "middle")
      .attr("dy", "20px")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text((d) => d.kind);

    enterNodes
      .append("rect")
      .attr("class", "bubble")
      .attr("x", 45)
      .attr("y", 20)
      .attr("width", 150)
      .attr("height", 50)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    enterNodes
      .append("text")
      .attr("class", "bubble-text")
      .attr("x", 50)
      .attr("y", 40)
      .attr("fill", "black")
      .attr("font-size", "12px");

    // Update existing and new nodes
    const allNodes = workerNodes.merge(enterNodes);

    allNodes.attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    allNodes.select(".bubble-text").each(function (d) {
      const taskInfo = d.getCurrentTaskInfo();
      const lines = taskInfo.split("\n");
      d3.select(this)
        .selectAll("tspan")
        .data(lines)
        .join("tspan")
        .attr("x", 50)
        .attr("dy", (_, i) => (i === 0 ? 0 : "1.2em"))
        .text((line) => line);
    });

    workerNodes.exit().remove();

    this.updateTaskStacks(workers);
  }

  updateLinks(links) {
    this.linkLayer
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");
  }

  updateTaskStacks(workers) {
    this.workerLayer.selectAll("g.worker").each(function (d) {
      const stackGroup = d3
        .select(this)
        .selectAll(".task-stack-item")
        .data(d.tasks);

      stackGroup
        .enter()
        .append("rect")
        .attr("class", "task-stack-item")
        .attr("x", 50)
        .attr("width", 40)
        .attr("height", 10)
        .attr("y", (_, i) => 20 - (i + 1) * 15);

      stackGroup.exit().remove();

      stackGroup.attr("y", (_, i) => 20 - (i + 1) * 15);

      d3.select(this)
        .select(".wip-text")
        .text(d.currentTask ? "WIP" : "");
    });
  }

  updateCommunicationNodes(nodes) {
    const communicationNodes = this.communicationLayer
      .selectAll("g.communication-node")
      .data(nodes)
      .join("g")
      .attr("class", "communication-node")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    communicationNodes.selectAll("rect").remove();
    communicationNodes.selectAll("text").remove();

    communicationNodes
      .append("rect")
      .attr("width", 60)
      .attr("height", 40)
      .attr("x", -30)
      .attr("y", -20)
      .attr("fill", "green");

    communicationNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text((d) => d.id);
  }

  moveTaskVisual(task, fromWorker, toWorker, duration, callback) {
    const taskNode = this.taskLayer
      .append("circle")
      .attr("class", "task")
      .attr("r", 10)
      .attr("fill", "red")
      .attr("cx", fromWorker.x)
      .attr("cy", fromWorker.y);

    taskNode
      .transition()
      .duration(duration)
      .attrTween(
        "cx",
        () => (t) => fromWorker.x + (toWorker.x - fromWorker.x) * t
      )
      .attrTween(
        "cy",
        () => (t) => fromWorker.y + (toWorker.y - fromWorker.y) * t
      )
      .on("end", () => {
        taskNode.remove();
        if (callback) callback();
      });
  }

  moveTaskVisualWithIntermediate(
    task,
    fromWorker,
    toWorker,
    intermediateNode,
    duration,
    callback
  ) {
    const halfDuration = duration / 2;
    const taskNode = this.taskLayer
      .append("circle")
      .attr("class", "task")
      .attr("r", 10)
      .attr("fill", "red")
      .attr("cx", fromWorker.x)
      .attr("cy", fromWorker.y);

    taskNode
      .transition()
      .duration(halfDuration)
      .attrTween(
        "cx",
        () => (t) => fromWorker.x + (intermediateNode.x - fromWorker.x) * t
      )
      .attrTween(
        "cy",
        () => (t) => fromWorker.y + (intermediateNode.y - fromWorker.y) * t
      )
      .on("end", () => {
        taskNode
          .transition()
          .duration(halfDuration)
          .attrTween(
            "cx",
            () => (t) =>
              intermediateNode.x + (toWorker.x - intermediateNode.x) * t
          )
          .attrTween(
            "cy",
            () => (t) =>
              intermediateNode.y + (toWorker.y - intermediateNode.y) * t
          )
          .on("end", () => {
            taskNode.remove();
            if (callback) callback();
          });
      });
  }
}
