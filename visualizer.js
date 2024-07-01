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
      .data(workers)
      .join("g")
      .attr("class", "worker")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    workerNodes.selectAll("circle").remove();
    workerNodes.selectAll("text").remove();

    workerNodes.append("circle").attr("r", 40).attr("fill", "blue");

    workerNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "white")
      .attr("font-size", "16px")
      .text((d) => d.name);

    workerNodes
      .append("text")
      .attr("class", "kind-text")
      .attr("text-anchor", "middle")
      .attr("dy", "20px")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text((d) => d.kind);

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
      .attr("stroke-dasharray", "5,5"); // すべてのラインをドット線に
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
        .attr("y", (_, i) => -20 + i * 15);

      stackGroup.exit().remove();

      stackGroup.attr("y", (_, i) => -20 + i * 15);

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
      .attr("width", 60) // 四角の幅
      .attr("height", 40) // 四角の高さ
      .attr("x", -30) // 中心に配置するためのx座標調整
      .attr("y", -20) // 中心に配置するためのy座標調整
      .attr("fill", "green");

    communicationNodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text((d) => d.id);
  }

  moveTaskVisual(task, fromWorker, toWorker, callback) {
    const taskNode = this.taskLayer
      .append("circle")
      .attr("class", "task")
      .attr("r", 10)
      .attr("fill", "red")
      .attr("cx", fromWorker.x)
      .attr("cy", fromWorker.y);

    taskNode
      .transition()
      .duration(1000)
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
    callback
  ) {
    const taskNode = this.taskLayer
      .append("circle")
      .attr("class", "task")
      .attr("r", 10)
      .attr("fill", "red")
      .attr("cx", fromWorker.x)
      .attr("cy", fromWorker.y);

    // fromWorker から中間点への移動
    taskNode
      .transition()
      .duration(500)
      .attrTween(
        "cx",
        () => (t) => fromWorker.x + (intermediateNode.x - fromWorker.x) * t
      )
      .attrTween(
        "cy",
        () => (t) => fromWorker.y + (intermediateNode.y - fromWorker.y) * t
      )
      .on("end", () => {
        // 中間点から toWorker への移動
        taskNode
          .transition()
          .duration(500)
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
