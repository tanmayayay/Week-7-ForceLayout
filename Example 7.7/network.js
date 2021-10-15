
function simulate(data,svg)
{
    let width = parseInt(svg.attr("viewBox").split(' ')[2])
    let height = parseInt(svg.attr("viewBox").split(' ')[3])
    let main_group = svg.append("g")
        .attr("transform", "translate(0, 50)")

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
        .range([5,20])
    let scale_link_stroke_width = d3.scaleLinear()
        .domain(d3.extent(data.links,function (d){return d.value}))
        .range([1,5])





    let color = d3.scaleOrdinal(d3.schemeCategory10);
    let link_elements = main_group.append("g")
        .attr('transform',`translate(${width/2},${height/2})`)
        .selectAll(".line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke-width", function (d){
            return scale_link_stroke_width(d.value)
        });
    let node_elements = main_group.append("g")
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll(".circle")
        .data(data.nodes)
        .enter()
        .append('g')
        .attr("class",function (d){return "gr_"+d.group.toString()})
        .on("mouseenter",function (d,data){
            node_elements.classed("inactive",true)
            d3.selectAll(".gr_"+data.group.toString()).classed("inactive",false)
        })
        .on("mouseleave",function (d,data){
            d3.selectAll(".inactive").classed("inactive",false)
        })
    node_elements.append("circle")
        .attr("r", function (d,i) {
            return scale_radius(node_degree[i])
        })
        .attr("fill", function (d,i) {
            return color(d.group)
        })

    node_elements.append("text")
        .attr("class","label")
        .attr("text-anchor","middle")
        .text(function (d){return d.name})

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
        .attr('transform', function(d){return `translate(${d.x},${d.y})`})
        link_elements
            .attr("x1",function(d){return d.source.x})
            .attr("x2",function(d){return d.target.x})
            .attr("y1",function(d){return d.source.y})
            .attr("y2",function(d){return d.target.y})

        }


    svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed));
    function zoomed({transform}) {
        main_group.attr("transform", transform);
    }




}
