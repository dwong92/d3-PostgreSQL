import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function LinePlot({
  width = 700,
  height = 460,
  marginTop = 80,
  marginRight = 80,
  marginBottom = 80,
  marginLeft = 80,
}) {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState(10);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [activeGroups, setActiveGroups] = useState([]);
  const svgRef = useRef();
  const [inputValue, setInputValue] = useState(10);

  useEffect(() => {
    d3.dsv(" ", "/sample.csv").then((parsedData) => {
      const formattedData = parsedData
        .map((row) => ({
          plant: row.plant,
          branch: row.branch,
          ctime: +row.ctime,
          metric: +row.metric,
        }))
        .sort((a, b) => a.ctime - b.ctime);

      setData(formattedData);

      const uniqueGroups = Array.from(
        new Set(formattedData.map((d) => `${d.plant} - ${d.branch}`))
      );
      setSelectedGroups(uniqueGroups);
      setActiveGroups(uniqueGroups);
    });
  }, []);

  useEffect(() => {
    if (!data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const filteredData = data.filter((d) =>
      activeGroups.includes(`${d.plant} - ${d.branch}`)
    );

    const groupedData = d3.group(
      filteredData,
      (d) => `${d.plant} - ${d.branch}`
    );

    console.log("groupedData", groupedData)

    // Apply slice to show only the last `filter` points for each group
    groupedData.forEach((values, key, map) => {
      map.set(key, values.slice(-filter));
    });

    console.log("groupedData after Slice", groupedData)


    // Collect all visible data points for scale calculation
    const visibleData = Array.from(groupedData.values()).flat();

    console.log("visibleData", visibleData)

    // Update x and y scales based on visibleData
    const x = d3
      .scaleTime()
      .domain(d3.extent(visibleData, (d) => new Date(d.ctime * 1000)))
      .range([marginLeft, width - marginRight])
      .nice();

    const yPadding =
      (d3.max(visibleData, (d) => d.metric) -
        d3.min(visibleData, (d) => d.metric)) *
      0.1;

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(visibleData, (d) => d.metric) - yPadding,
        d3.max(visibleData, (d) => d.metric) + yPadding,
      ])
      .range([height - marginBottom, marginTop])
      .nice();

    const line = d3
      .line()
      .x((d) => x(new Date(d.ctime * 1000)))
      .y((d) => y(d.metric));

    const colorScale = d3
      .scaleOrdinal(d3.schemeCategory10)
      .domain(selectedGroups);

    const lineGroup = svg.append("g");
    
    groupedData.forEach((values, key) => {
      lineGroup
        .append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", colorScale(key))
        .attr("stroke-width", 1.5)
        .attr("d", line);

        console.log(`${colorScale(key)}`)
    });

    // Tooltip setup
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Add circles for filtered data points
    lineGroup
      .selectAll("circle")
      .data(visibleData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(new Date(d.ctime * 1000)))
      .attr("cy", (d) => y(d.metric))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `Plant: ${d.plant}<br>Branch: ${d.branch}<br>X: ${new Date(
              d.ctime * 1000
            ).toLocaleString()}<br>Y: ${d.metric}`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d")));

    // Add y-axis
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y));
  }, [data, width, height, marginTop, marginRight, marginBottom, marginLeft, activeGroups, filter]);

  const handleFilterUpdate = () => {
    if (inputValue > 0) {
      setFilter(Number(inputValue));
    } else {
      alert("Please enter a valid positive number.");
    }
  };

  const toggleGroup = (group) => {
    setActiveGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  return (
    <div>
      <label htmlFor="entryCount">Range:</label>
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleFilterUpdate}>Update</button>

      <div style={{ marginTop: "20px" }}>
        <h3>Filter Lines:</h3>
        {selectedGroups.map((group) => (
          <div key={group}>
            <label>
              <input
                type="checkbox"
                checked={activeGroups.includes(group)}
                onChange={() => toggleGroup(group)}
              />
              {group}
            </label>
          </div>
        ))}
      </div>

      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}
