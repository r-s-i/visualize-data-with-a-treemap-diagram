const body = d3.select("body");

const clientHeight = window.innerHeight;
const clientWidth = window.innerWidth;
const height = clientHeight * 0.8;
const width = clientWidth * 0.8;
const area = height * width;

const svg = d3
  .select("main")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const colors = [
  "#ADD8E6",
  "#FFC0CB",
  "#98FB98",
  "#FFDAB9",
  "#E6E6FA",
  "#F5F5DC",
  "#D3D3D3",
];

fetch(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
)
  .then((r) => r.json())
  .then((d) => {
    let sumAllMovies = 0;
    const categoriesSumOfValues = [0, 0, 0, 0, 0, 0, 0];
    // Finds sum of each category and of all:
    d.children.forEach((outerE, i) => {
      outerE.children.forEach((innerE) => {
        sumAllMovies += Number(innerE.value);
        categoriesSumOfValues[i] += Number(innerE.value);
      });
    });
    // Sort to be descending:
    categoriesSumOfValues.sort((a, b) => b - a);
    // Needs to be sorted to be put in the right parentElement:
    d.children.sort((a, b) => {
      const sumA = a.children.reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue.value);
      }, 0);
      const sumB = b.children.reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue.value);
      }, 0);
      return sumB - sumA;
    });

    /*
      Creates an array that will be used to give
      each rect (category) correct width, height, x, and y dimensions:
    */
    let dimensionsOfRects = [];
    remainingWidth = width;
    remainingHeight = height;
    sumOfUsedWidth = 0;
    sumOfUsedHeight = 0;
    categoriesSumOfValues.forEach((element, i) => {
      let rectArea = (element / sumAllMovies) * area;
      if (i % 2 == 0) {
        remainingWidth -= rectArea / remainingHeight;
        sumOfUsedWidth += rectArea / remainingHeight;
        dimensionsOfRects[i] = [
          rectArea / remainingHeight,
          remainingHeight,
          sumOfUsedWidth,
          sumOfUsedHeight,
        ];
      } else {
        remainingHeight -= rectArea / remainingWidth;
        sumOfUsedHeight += rectArea / remainingWidth;
        dimensionsOfRects[i] = [
          remainingWidth,
          rectArea / remainingWidth,
          sumOfUsedWidth,
          sumOfUsedHeight,
        ];
      }
    });

    // Draws each rect of categories (7 in all):
    const categories = svg
      .selectAll("g")
      .data(d.children)
      .enter()
      .append("g")
      .attr("name", (e) => e.name)
      .attr("id", (e) => e.name)
      .attr("value", (_, i) => categoriesSumOfValues[i])
      .attr("x", (e, i) => {
        if (i === 0) {
          return 0;
        } else {
          return dimensionsOfRects[i - 1][2];
        }
      })
      .attr("y", (e, i) => {
        if (i === 0) {
          return 0;
        } else {
          return dimensionsOfRects[i - 1][3];
        }
      })
      .attr("width", (e, i) => {
        return dimensionsOfRects[i][0];
      })
      .attr("height", (e, i) => {
        return dimensionsOfRects[i][1];
      })
      // Draws rect inside of categories (100 in all).
      .each(function (funcE, funcI) {
        // Setup for current category (cc):
        const parentElement = d3.select(this);
        const parentWidth = parentElement._groups[0][0].attributes.width.value;
        const parentHeight =
          parentElement._groups[0][0].attributes.height.value;
        const parentX = parentElement._groups[0][0].attributes.x.value;
        const parentY = parentElement._groups[0][0].attributes.y.value;

        // Set up the layout spesific for cc:
        const treemapLayout = d3.treemap().size([parentWidth, parentHeight]);

        // Create the treemap for cc:
        const cells = treemapLayout(
          d3
            .hierarchy(funcE)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value)
        ).descendants();

        // Create rects (movies) for cc:
        parentElement
          .selectAll("rect")
          .data(cells)
          .enter()
          .append("rect")
          // Code to pass tests, start:
          .attr("class", (d, i) => {
            if (d.data.category) {
              return "tile";
            } else {
              return "parent";
            }
          })
          .attr("data-name", (d, i) => {
            return d.data.name;
          })
          .attr("data-category", (d, i) => {
            if (d.data.category) {
              return d.data.category;
            } else {
              return "parent";
            }
          })
          .attr("data-value", (d, i) => {
            if (d.data.value) {
              return d.data.value;
            } else {
              return "parent";
            }
          })
          // Code to pass tests, stop:
          .attr("transform", `translate(${parentX}, ${parentY})`)
          .attr("x", (d) => d.x0)
          .attr("y", (d) => d.y0)
          .attr("width", (d) => {
            const rectWidth = d.x1 - d.x0;
            return rectWidth;
          })
          .attr("height", (d) => {
            const rectHeight = d.y1 - d.y0;
            return rectHeight;
          })
          .attr("fill", () => {
            return colors[funcI];
          })
          .on("mouseover", (e, d) => {
            const tooltip = svg
              .append("foreignObject")
              .html(
                `<aside id="info">
                  <div>${d.data.name}</div>
                  <div>${d.data.category}</div>
                  <div>$${d.data.value}</div>
                </aside>
                `
              )
              .attr("id", "tooltip")
              .attr("data-value", d.value)
              .attr("y", () => {
                const yCord = Number(d.y0) + Number(parentY);
                if (yCord > height * 0.5) {
                  return 0;
                }
                return "80%";
              });
          })
          .on("mouseout", (e, d) => {
            const tooltip = d3.select("#tooltip");
            tooltip.remove();
          });

        // Create a new text element, and align it with its rect:
        namesArr = [];
        parentElement
          .selectAll("foreignObject")
          .data(cells)
          .enter()
          .append("foreignObject")
          .attr("x", (d) => {
            return d.x0;
          })
          .attr("y", (d) => {
            return d.y0;
          })
          .attr("width", (d) => d.x1 - d.x0)
          .attr("height", (d) => d.y1 - d.y0)
          .html((d, i) => {
            if (i === 0) {
            } else {
              namesArr.push(d.data.name);
              return `
              <div id="movie-text-outer">
                <div id="movie-text">
                  ${d.data.name}
                </div>
              </div>
              `;
            }
          })
          .attr("font-size", () => {
            console.log(clientHeight);
            if (clientHeight * 2 < clientWidth) {
              return "0.55vw";
            } else {
              return "0.55vh";
            }
          })
          .attr("transform", `translate(${parentX}, ${parentY})`)
          .attr("color", "black")
          .attr("pointer-events", "none"); // so movie rects events handlers will work
      });

    // Adding Legend with g elements:
    const legend = d3
      .select("body")
      .append("svg")
      .attr("id", "legend")
      .attr("width", width)
      .attr("height", height / 2)
      .selectAll("g")
      .data(d.children)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        return `translate(0, ${30 * i + 20})`;
      });

    // Adding rects inside of g elements:
    legend
      .append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("class", "legend-item")
      .style("fill", (d, i) => {
        return colors[i];
      });

    // Adding text inside of g elements:
    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 14)
      .attr("font-size", 12)
      .text((d, i) => {
        return d.name;
      })
      .style("fill", "white");
  });
