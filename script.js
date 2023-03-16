const height = 300;
const width = 600;

const svg = d3
  .select("main")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];

fetch(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
)
  .then((r) => r.json())
  .then((d) => {
    const categories = svg
      .selectAll("g")
      .data(d.children)
      .enter()
      .append("g")
      .attr("name", (d) => d.name)
      .attr("id", (d) => d.name.toLowerCase());

    let currentCategory = "";
    let yValue = 0;
    d.children.forEach((e, i) => {
      d3.select(`#${e.name.toLowerCase()}`)
        .selectAll("rect")
        .data(e.children)
        .enter()
        .append("rect")
        .attr("class", "tile")
        .attr("data-name", (d) => d.name)
        .attr("data-category", (d) => d.category)
        .attr("data-value", (d) => d.value)
        .attr("width", width * 0.01)
        .attr("height", 10)
        .attr("x", (e, i) => {
          if (currentCategory !== e.category) {
            currentCategory = e.category;
            yValue += 10;
            return 0;
          } else {
            return i * width * 0.01;
          }
        })
        .attr("y", yValue)
        .style("fill", colors[i])
        .on("mouseover", (e, d) => {
          const tooltip = svg
            .append("foreignObject")
            .html(`${d.name}\n${d.category}\n$${d.value}`)
            .attr("id", "tooltip")
            .attr("data-value", d.value);
        })
        .on("mouseout", (e, d) => {
          const tooltip = d3.select("#tooltip");
          tooltip.remove();
        });
    });

    const legend = svg.append("g").attr("id", "legend");

    const legendItems = legend
      .selectAll("rect")
      .data(d.children)
      .enter()
      .append("rect")
      .attr("class", "legend-item")
      .attr("name", (d) => d.name)
      .style("fill", (_, i) => colors[i]);
  });
