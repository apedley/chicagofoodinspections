var app = {};
app.queryURL = "https://data.cityofchicago.org/resource/cwig-ma7x.json?$select=dba_name,risk,facility_type,results,violations,aka_name,address,city,state,inspection_date,inspection_type,latitude,longitude"; 


app.init = function() {
  app.svg = d3.select("body").append("svg")
                              .attr('width', 1000)
                              .attr('height', 1000)
                              .attr('class', 'background');
  d3.json(app.queryURL, function(error, data) {
    var lats = data.map(function(item) {
      return parseFloat(item.latitude);
    });
    lats = lats.filter(function(item) {
      return typeof item === 'number';
    });
    var longs = data.map(function(item) {
      return parseFloat(item.longitude);
    });
    app.boundaries = {
      latMin: _.min(lats),
      latMax: _.max(lats),
      longMin: _.min(longs),
      longMax: _.max(longs)
    };
    app.size = {
      latitude: app.boundaries.latMax - app.boundaries.latMin,
      longitude: app.boundaries.longMax - app.boundaries.longMin
    };


    app.drawMap(data);
  });


}

app.translateLatitudeToY = function(latitude) {
  return 1000 - (latitude - 41.65)/0.00037;
}
app.translateLongToX = function(longitude) {
  return Math.abs(Math.abs(longitude)-Math.abs(app.boundaries.longMin))/(app.size.longitude/1000)
}

app.drawMap = function(data) {
  app.svg.selectAll('dataCircle').data(data).enter().append("circle")
      .attr('cx', function(d) {
        return app.translateLongToX(parseFloat(d.longitude));
      })
      .attr('cy', function(d) {
        return app.translateLatitudeToY(parseFloat(d.latitude));
      })
      .attr('r', function(d) {
        return 5;
      });
  // var svg = d3.select("body").append('svg')
  //                 .attr('width', 800)
  //                 .attr('height', 600)
  //                 .attr('class', 'board');
  // var space = 10;
  // var circles = d3.json(query, function(data) {
  //   svg.selectAll('dataCircle').data(data).enter().append("circle")
  //   .attr('cx', function(d) { 
  //       if (space > 100) { space = 10; }
        
  //       return space += 10;

  //     })
  //        .attr('cy', function(d) { return  10; })
  //        .attr('r', function(d) { return '5'})
  //        .style('fill', function(d) { 
  //         });

  // });
}
$(document).ready(function() {
  app.init();
});