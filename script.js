const height = 300;
const width = 600;

const svg = d3
  .select("main")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

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

    d.children.forEach((e, i) => {
      d3.select(`#${e.name.toLowerCase()}`)
        .selectAll("rect")
        .data(e.children)
        .enter()
        .append("rect")
        .attr("class", "tile")
        .attr("name", (d) => d.name);
    });
  });
