// For capitzlizing place names
String.prototype.capitalize = function(){
        return this.toLowerCase().replace( /\b\w/g, function (m) {
            return m.toUpperCase();
        });
    };

var app = {};
app.queryURL = "https://data.cityofchicago.org/resource/cwig-ma7x.json?$select=dba_name,risk,facility_type,results,violations,aka_name,address,city,state,inspection_date,inspection_type,latitude,longitude"; 


app.init = function() {
  app.svg = d3.select("body").append("svg")
                              .attr('width', 1500)
                              .attr('height', 1500)
                              .attr('class', 'background');
  $('#dialog').dialog({
    autoOpen: false
  });

  app.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      debugger;
      return "<strong>" + d.dba_name.capitalize() + "</strong><br>" + d.address.capitalize() + "<br><strong>" + d.results + "</strong>";
  });

  
  d3.json(app.queryURL, function(error, data) {
    var lats = data.map(function(item) {

      return parseFloat(item.latitude);
    });
    lats = lats.filter(function(item) {
      if (isNaN(item)) return false;

      return typeof item === 'number';
    });
    var longs = data.map(function(item) {
      
      return parseFloat(item.longitude);
    });
    longs = longs.filter(function(item) {
      
      if (isNaN(item)) return false;
      return typeof item === 'number';
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

app.showDetails = function(data, index) {
  var selector = "#datapoint" + index;
  $("#dialog").dialog("open");
}

app.drawMap = function(data) {
  app.svg.call(app.tip);
  app.svg.selectAll('dataCircle').data(data).enter().append("circle")
      .attr("id", function(d, i) {
        return "datapoint" + i;
      })
      .attr('cx', function(d) {
        return app.translateLongToX(parseFloat(d.longitude))+25;
      })
      .attr('cy', function(d) {
        return app.translateLatitudeToY(parseFloat(d.latitude))+25;
      })
      .attr('r', function(d) {
        return 5;
      })
      .style('fill', function(d) {
        if (d.results.capitalize() === 'Pass') {
          return 'green';
        }
        if (d.results.capitalize() === 'Fail') {
          return 'red';
        }
        if (d.results.capitalize() === 'Out Of Business' || d.results.capitalize() === 'No Entry') {
          return 'black';
        }
        if (d.results.capitalize() === 'Pass W/ Conditions') {
          return 'orange';
        }
        return 'grey'
      })
      .on("mouseover", function(d) {

        app.tip.show(d);
      })
      .on("mouseout", function(d) {
        app.tip.hide();
      })
      .on("click", function(d, i) {
        console.log("clicked");
        app.showDetails(d, i);

      });

}
$(document).ready(function() {
  
  app.init();
});