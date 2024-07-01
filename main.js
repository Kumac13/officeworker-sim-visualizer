let simulation;
let visualizer;

document.addEventListener("DOMContentLoaded", () => {
  const svg = d3.select("#simulation-svg");
  visualizer = new Visualizer(svg);
  simulation = new Simulation(visualizer);

  simulation.initialize();

  document.getElementById("startBtn").addEventListener("click", () => {
    simulation.stop();
    simulation.start();
  });

  document.getElementById("stopBtn").addEventListener("click", () => {
    simulation.stop();
  });

  document.getElementById("apply-config").addEventListener("click", () => {
    const workerCount = parseInt(document.getElementById("worker-count").value);
    if (workerCount >= 2) {
      simulation.stop();
      simulation.createWorkers(workerCount);
      simulation.createCommunicationNodes(); // 通信ノードも再配置
      simulation.createLinks();
      visualizer.updateWorkers(simulation.workers);
      visualizer.updateLinks(simulation.links);
      visualizer.updateCommunicationNodes(simulation.communicationNodes);
    } else {
      alert("Worker count must be at least 2");
    }
  });

  updateSVGSize();
  window.addEventListener("resize", updateSVGSize);
});

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
