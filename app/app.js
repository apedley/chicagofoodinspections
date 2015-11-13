$(document).ready(function() {
var query = "https://data.cityofchicago.org/resource/cwig-ma7x.json?$select=dba_name,risk,facility_type,results,violations"; 

var svg = d3.select("body").append('svg')
                .attr('width', 800)
                .attr('height', 600)
                .attr('class', 'board');
var circles = d3.json(query, function(data) {
  svg.selectAll('dataCircle').data(data).enter().append("circle")
  .attr('cx', function(d) { return '10' })
       .attr('cy', function(d) { return '10' })
       .attr('r', function(d) { return '5'})
       .style('fill', function(d) { return 'blue' });
    // .text(function(d) { return d.dba_name; });

});
});