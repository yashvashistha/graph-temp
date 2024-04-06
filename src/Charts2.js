import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function Charts2() {
  const svgRef = useRef();
  const [called, setCalled] = useState(false);
  const gdata = [
    {
      source: { name: "Company A", type: "Managment" },
      target: { name: "Company B", type: "IT" },
      relation: "work",
    },
    {
      source: { name: "Company A", type: "Managment" },
      target: { name: "Company C", type: "Finance" },
      relation: "client",
    },
    {
      source: { name: "Company A", type: "Managment" },
      target: { name: "Employee 1", type: "Employee" },
      relation: "employment",
    },
    {
      source: { name: "Company A", type: "Managment" },
      target: { name: "Branch 1", type: "Managment" },
      relation: "branch",
    },
    {
      source: { name: "Company B", type: "Managment" },
      target: { name: "Employee 2", type: "Employee" },
      relation: "employment",
    },
    {
      source: { name: "Company B", type: "Managment" },
      target: { name: "Branch 2", type: "Finance" },
      relation: "client",
    },

    {
      source: { name: "Company C", type: "Finance" },
      target: { name: "Branch 3", type: "Finance" },
      relation: "branch",
    },
    {
      source: { name: "Company C", type: "Finance" },
      target: { name: "Employee 3", type: "Employee" },
      relation: "employment",
    },
    {
      source: { name: "Company B", type: "Finance" },
      target: { name: "Company D", type: "IT" },
      relation: "client",
    },
  ];

  const relationcolorfunc = (rel) => {
    if (rel === "work") return "orange";
    if (rel === "client") return "red";
    if (rel === "employment") return "green";
    if (rel === "branch") return "blue";
  };

  const typecolorfunc = (type) => {
    if (type === "Managment") return "#F9D697";
    if (type === "IT") return "lightblue";
    if (type === "Finance") return "#78FF78";
    if (type === "Employee") return "#FF86FF";
  };

  function linkArc(d) {
    // console.log(d);
    return `
      M${d.source.x},${d.source.y}
      L${d.target.x},${d.target.y}
    `;
  }

  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = event.x;
      d.fy = event.y;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  const chartfunc = () => {
    const width = 750;
    const height = 550;
    const types = Array.from(new Set(gdata.map((d) => d.relation)));
    const nodes = Array.from(
      new Set(gdata.flatMap((l) => [l.source, l.target])),
      (id) => ({
        id,
      })
    );

    const links = gdata.map((d) => Object.create(d));
    // const links = gdata.map((d) => ({
    //   index: Object.create(d),
    //   source: d.source,
    //   target: d.target,
    //   relation: d.relation,
    // }));

    console.log(nodes, links);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3.forceLink(links).id((d) => d)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr(
        "style",
        "max-width: 100%; height: auto; font: 12px sans-serif; background-color:#eaeaea; overflow:scroll"
      );

    // svg
    //   .append("defs")
    //   .selectAll("marker")
    //   .data(types)
    //   .join("marker")
    //   .attr("id", (d) => `arrow-${d}`)
    //   .attr("viewBox", "0 -5 10 10")
    //   .attr("refX", 15)
    //   .attr("refY", -0.5)
    //   .attr("markerWidth", 6)
    //   .attr("markerHeight", 6)
    //   .attr("orient", "auto")
    //   .append("path")
    //   .attr("fill", (d) => "black")
    //   .attr("d", "M0,-5L10,0L0,5");

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", "green")
      .attr("marker-end", (d) => "");

    const node = svg
      .append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation));

    node
      .append("rect")
      .attr("x", -10) // Adjust the x-offset as needed
      .attr("y", -10) // Adjust the y-offset as needed
      .attr("width", 25) // Set the width of the rectangle to cover the image
      .attr("height", 25) // Set the height of the rectangle to cover the image
      .attr("fill", "#eaeaea"); // Set the fill color to white

    node
      .append("image")
      .attr("xlink:href", (d) => {
        // console.log(d);
        if (d.id.type === "Finance") return "./Images/Office-lg.png";
        if (d.id.type === "Managment") return "./Images/Office-lo.png";
        if (d.id.type === "IT") return "./Images/Office-lb.png";
        if (d.id.type === "Employee") return "./Images/UserClient-lp.png";
      })
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 20)
      .attr("height", 20)
      .attr("style", "background-color:#eaeaea;");

    node
      .append("text")
      .attr("x", 8)
      .attr("y", "2em")
      .attr("fill", (d) => typecolorfunc(d.id.type))
      .text((d) => d.id.name)
      .clone(true)
      .lower()
      .attr("fill", "none")
      .attr("stroke", "#eaeaea")
      .attr("stroke-width", 3);

    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  };
  return (
    <div style={{ flex: 1 }}>
      <div>
        <h1>New Graph</h1>
        <button
          onClick={() => {
            if (!called) {
              setCalled((prevCalled) => !prevCalled);
              chartfunc();
            } else {
              setCalled((prevCalled) => !prevCalled);
              d3.select(svgRef.current).selectAll("*").remove();
            }
          }}
        >
          {called ? <>Hide Graph</> : <>Generate Graph</>}
        </button>
      </div>

      <svg ref={svgRef}></svg>
    </div>
  );
}

export default Charts2;
