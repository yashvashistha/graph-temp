import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { toBePartiallyChecked } from "@testing-library/jest-dom/matchers";
import gdata from "./apidata";

const Chart = () => {
  const [suits] = useState(gdata.links);
  const svgRef = useRef();
  const svgheadRef = useRef();
  const [called, setCalled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [nodeinfo, setNodeInfo] = useState(null);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const headfunc = () => {
    const width = 1450;
    const height = 50;
    const svghead = d3
      .select(svgheadRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr(
        "style",
        "max-width: 100%; height: auto; font: 12px sans-serif; background-color:#eaeaea; overflow:scroll"
      );

    // Type Part
    const categoryColors = {
      Managment: "#F9D697",
      IT: "lightblue",
      Finance: "#78FF78",
      Employee: "#FF86FF",
    };
    const legendtype = svghead
      .append("g")
      .attr("transform", "translate(-650, -5)");
    legendtype
      .selectAll("rect")
      .data(Object.keys(categoryColors))
      .enter()
      .append("rect")
      .attr("x", (d, i) => {
        if (d === "Finance") return i * 75;
        if (d === "Employee") return i * 75;
        return i * 100;
      })
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => categoryColors[d]);
    legendtype
      .selectAll("text")
      .data(Object.keys(categoryColors))
      .enter()
      .append("text")
      .attr("x", (d, i) => {
        if (d === "Finance") return i * 75 + 25;
        if (d === "Employee") return i * 75 + 25;
        return i * 100 + 25;
      })
      .attr("y", 15)
      .text((d) => d);
    svghead
      .append("text")
      .attr("x", -600)
      .attr("y", -10)
      .attr("font-weight", "bold")
      .text("Company / Employee Type");

    // Relation Part
    const relationColors = {
      work: "orange",
      client: "red",
      branch: "blue",
      employment: "green",
    };

    const legendrelation = svghead
      .append("g")
      .attr("transform", "translate(350, -5)");

    legendrelation
      .selectAll("rect")
      .data(Object.keys(relationColors))
      .enter()
      .append("rect")
      .attr("x", (d, i) => {
        return i * 70;
      })
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", (d) => relationColors[d]);

    legendrelation
      .selectAll("text")
      .data(Object.keys(relationColors))
      .enter()
      .append("text")
      .attr("x", (d, i) => {
        return i * 70 + 25;
      })
      .attr("y", 15)
      .text((d) => d);
    svghead
      .append("text")
      .attr("x", 400)
      .attr("y", -10)
      .attr("font-weight", "bold")
      .text("Companies Relationship");
  };

  const chartfunc = (sQuery) => {
    const width = 1450;
    const height = 3000;
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
        d.fx = d.x;
        d.fy = d.y;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    function filterDataById(id) {
      return links.reduce(
        (acc, d) => {
          if (d.source.id === id) {
            acc.childs.push(d.target);
          }
          if (d.target.id === id) {
            acc.parents.push(d.source);
          }
          return acc;
        },
        { childs: [], parents: [] }
      );
    }

    function handleClick(event, d) {
      const filteredData = filterDataById(d.id);
      console.log(filteredData);
      setNodeInfo({ node: d, data: filteredData });
    }

    const nodes = Array.from(
      new Set(suits.flatMap((l) => [l.source, l.target])),
      (id) => ({
        id,
        catagory: gdata.nodes.find((suit) => suit.id === id || suit.id === id)
          .catagory,
      })
    );
    const links = suits.map((d) => Object.create(d));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-1200))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr(
        "style",
        "max-width: 100%; height: auto; font: 12px sans-serif; background-color:#eaeaea; overflow: auto auto; border:1px solid black"
      );

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow-work")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 23)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "orange")
      .attr("d", "M0,-5L10,0L0,5");
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow-client")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 23)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "red")
      .attr("d", "M0,-5L10,0L0,5");
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow-branch")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 23)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "blue")
      .attr("d", "M0,-5L10,0L0,5");
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow-employment")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 23)
      .attr("refY", 0)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "green")
      .attr("d", "M0,-5L10,0L0,5");

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-width", 1)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("stroke", (d) => relationcolorfunc(d.type))
      .attr("marker-end", (d) => `url(#arrow-${d.type})`);

    const node = svg
      .append("g")
      .attr("fill", "currentColor")
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation))
      .on("click", handleClick);

    node
      .append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 25)
      .attr("height", 25)
      .attr("fill", "#eaeaea");

    node
      .append("image")
      .attr("xlink:href", (d) => {
        if (d.catagory === "Finance") return "./Images/Office-lg.png";
        if (d.catagory === "Managment") return "./Images/Office-lo.png";
        if (d.catagory === "IT") return "./Images/Office-lb.png";
        if (d.catagory === "Employee") return "./Images/UserClient-lp.png";
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
      .attr("fill", (d) => typecolorfunc(d.catagory))
      .text((d) => d.id)
      .clone(true)
      .lower()
      .attr("fill", "none")
      .attr("stroke", "#eaeaea")
      .attr("stroke-width", 3);

    if (sQuery) {
      const matchedNodes = nodes.filter((node) =>
        node.id.toLowerCase().includes(sQuery.toLowerCase().trim())
      );
      node.selectAll("rect").attr("fill", "#eaeaea");
      matchedNodes.forEach((matchedNode) => {
        const nodeGroup = node.filter((d) => d.id === matchedNode.id);
        nodeGroup
          .selectAll("text")
          .attr("font-size", "24px")
          .attr("y", "1.8em")
          .attr("stroke-width", 1)
          .attr("font-weight", "bolder");
      });
    }

    simulation.on("tick", () => {
      link.attr("d", linkArc);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  };

  const handleZoomIn = () => {
    d3.select(svgRef.current).call(zoom.scaleBy, 1.2);
  };
  const handleZoomOut = () => {
    d3.select(svgRef.current).call(zoom.scaleBy, 0.8);
  };
  const zoom = d3.zoom().on("zoom", (event) => {
    d3.select(svgRef.current).attr("transform", event.transform);
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1, width: "100%" }}>
        <h1>Graph</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search for a company or employee"
        />
        <button
          onClick={() => {
            if (called) {
              d3.select(svgRef.current).selectAll("*").remove();
              chartfunc(searchQuery);
            }
          }}
        >
          Search
        </button>
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button
          onClick={() => {
            if (!called) {
              setCalled((prevCalled) => !prevCalled);
              chartfunc(null);
              headfunc();
            } else {
              setCalled((prevCalled) => !prevCalled);
              d3.select(svgRef.current).selectAll("*").remove();
            }
          }}
        >
          {called ? <>Hide Graph</> : <>Generate Graph</>}
        </button>
      </div>
      <div
        style={{
          flex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          width: "100%",
          overflow: "auto auto",
        }}
      >
        <div style={{ height: "9%", width: "94%", backgroundColor: "#eaeaea" }}>
          <svg ref={svgheadRef}></svg>
        </div>
        <div
          style={{
            height: "80%",
            width: "95%",
            overflow: "auto auto",
            backgroundColor: "#eaeaea",
          }}
        >
          <svg ref={svgRef}></svg>
        </div>
      </div>
      {nodeinfo && (
        <div
          style={{
            position: "absolute",
            width: "30%",
            height: "max-content",
            minHeight: "40%",
            top: "40%",
            left: "35%",
            border: "1px solid black",
            background: "white",
          }}
        >
          <div>
            <h3>Name: {nodeinfo.node.id}</h3>
            <h4>Type: {nodeinfo.node.catagory}</h4>
            <div
              style={{
                display: "flex",
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                overflow: "auto",
              }}
            >
              <h6>
                Connected To:{" "}
                {nodeinfo.data.childs.map((child) => <p>{child.id}</p>) || (
                  <p>No connection</p>
                )}
              </h6>
              <h6>
                Connected From:{" "}
                {nodeinfo.data.parents.map((parent) => <p>{parent.id}</p>) || (
                  <p>No connection</p>
                )}
              </h6>
            </div>
          </div>
          <button
            style={{
              position: "absolute",
              right: "0px",
              top: "1px",
              borderStyle: "none",
            }}
            onClick={() => {
              setNodeInfo(null);
            }}
          >
            X
          </button>
        </div>
      )}
    </div>
  );
};

export default Chart;
