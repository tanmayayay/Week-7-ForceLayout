
function simulate(data,svg)
{
   //calculate degree of the nodes:
    let node_degree={}; //initiate an object
   d3.map(data.links,function (d){
       if(node_degree.hasOwnProperty(d.source))
       {
           node_degree[d.source]++
       }
       else{
           node_degree[d.source]=0
       }
       if(node_degree.hasOwnProperty(d.target))
       {
           node_degree[d.target]++
       }
       else{
           node_degree[d.target]=0
       }
   })

    let scale_radius = d3.scaleLinear()
        .domain(d3.extent(Object.values(node_degree)))
        .range([5,15])


    let width = parseInt(svg.attr("viewBox").split(' ')[2])
    let height = parseInt(svg.attr("viewBox").split(' ')[3])
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    let link_elements = svg.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke-width", function (d){
            return d.value
        });
    let node_elements = svg.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", function (d,i) {
            return scale_radius(node_degree[i])
        })
        .attr("fill", function (d,i) {
            return color(d.group)
        })

    let ForceSimulation = d3.forceSimulation(data.nodes)
        .force("collide",
            d3.forceCollide().radius(function (d,i){return scale_radius(node_degree[i])*4}))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody())
        .force("link",d3.forceLink(data.links)
            .id(function (d){return d.index})
            .distance(function (d){return d.value})
            .strength(function (d){return d.value*.1})
        )
        .on("tick", ticked);

    function ticked()
    {
    node_elements
            .attr("cx", function(d) {
                return d.x})
            .attr("cy", function(d) {
                return d.y})

        link_elements
            .attr("x1",function(d){return d.source.x})
            .attr("x2",function(d){return d.target.x})
            .attr("y1",function(d){return d.source.y})
            .attr("y2",function(d){return d.target.y})

        }
}
