// For capitzlizing place names
String.prototype.capitalize = function(){
        return this.toLowerCase().replace( /\b\w/g, function (m) {
            return m.toUpperCase();
        });
    };

var app = {};
app.queryURL = "https://data.cityofchicago.org/resource/cwig-ma7x.json?facility_type=Restaurant&$select=dba_name,risk,facility_type,results,violations,aka_name,address,city,state,inspection_date,inspection_type,latitude,longitude&$limit=3000"; 


app.init = function() {
  app.svg = d3.select("body").append("svg")
                              .attr('width', 1500)
                              .attr('height', 1500)
                              .attr('class', 'background');
  $('#dialog').dialog({
    autoOpen: false,
    width: 800
  });

  app.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
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
  $("#dialog").dialog("close");
  var selector = "#datapoint" + index;
  var name = data.dba_name.capitalize();
  var address = data.address.capitalize();
  var city = data.city.capitalize();
  var date = data.inspection_date;
  var state = data.state;
  var type = data.inspection_type;
  var violations = data.violations || "None listed";
  violations = violations.capitalize();
  violations = violations.split('|');

  var result = data.results;
  
  var htmlString =  "<ul>";

  htmlString = htmlString + "<li><strong>Result: </strong><span class='" + result.replace(/\s/g, '').replace(/\//g, '') + "'>" + result + "</span></li>";

  htmlString = htmlString + "<li><strong>Address: </strong>" + address + "</li>"
                  + "<li><strong>Date: </strong>" + date + "</li>"
                  + "<li><strong>Type: </strong>" + type + "</li>"
                  + "<li><strong>Violations: </strong><br>" + violations.join("<br><br>") + "</li>"
                  + "</ul>";


  $('#dialog').dialog('option', 'title', name);;
  $("#dialog").html(htmlString);
  $("#dialog").dialog("open");
  debugger;
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
        return 4;
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
        app.showDetails(d, i);

      });

}
$(document).ready(function() {
  
  app.init();
});