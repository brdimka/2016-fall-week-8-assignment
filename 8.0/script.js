console.log('8.3');

var m = {t:100,r:100,b:100,l:100};
var outerWidth = document.getElementById('canvas').clientWidth,
    outerHeight = document.getElementById('canvas').clientHeight;
var w = outerWidth - m.l - m.r,
    h = outerHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width',outerWidth)
    .attr('height',outerHeight)
    .append('g')
    .attr('transform','translate(' + m.l + ',' + m.t + ')');

//d3.set to hold a unique array of airlines
var airlines = d3.set();

//Scale
var scaleX = d3.scaleTime()
    .range([0,w]);
var scaleColor = d3.scaleOrdinal()
    .range(['#fd6b5a','#03afeb','orange','#06ce98','blue']);
var scaleY = d3.scaleLinear()
    .domain([0,1000])
    .range([h,0]);

//Axis
var axisX = d3.axisBottom()
    .scale(scaleX)
    .tickSize(-h);
var axisY = d3.axisLeft()
    .scale(scaleY)
    .tickSize(-w);

//Line generator
var lineGenerator = d3.line()
    .x(function(d){return scaleX(d.year)})
    .y(function(d){return scaleY(d.value)})
    .curve(d3.curveCardinal);

d3.queue()
    .defer(d3.csv, '../data/bos-sfo-flight-fare.csv',parse)
    .await(function(err, data){

        //Mine the data to set the scales
        scaleX.domain( d3.extent(data,function(d){return d.travelDate}) );
        scaleColor.domain( airlines.values() );

        //Add buttons
        d3.select('.btn-group')
            .selectAll('.btn')
            .data( airlines.values() )
            .enter()
            .append('a')
            .html(function(d){return d})
            .attr('href','#')
            .attr('class','btn btn-default')
            .style('color','white')
            .style('background',function(d){return scaleColor(d)})
            .style('border-color','white')
            .on('click',function(d){
                //Hint: how do we filter flights for particular airlines?
                //data.filter(...)

                //How do we then update the dots?
            });

        //Draw axis
        plot.append('g').attr('class','axis axis-x')
            .attr('transform','translate(0,'+h+')')
            .call(axisX);
        plot.append('g').attr('class','axis axis-y')
            .call(axisY);

        draw(data);

    });

function draw(rows){
    //IMPORTANT: data transformation
    var flightsByTravelDate = d3.nest().key(function(d){return d.travelDate})
        .entries(rows);

    flightsByTravelDate.forEach(function(day){
       day.averagePrice = d3.mean(day.values, function(d){return d.price});
    });

    console.log(flightsByTravelDate);

    //Draw dots

    function draw(rows){
      var node = plot.selectAll('.node')
        .data(rows,function(d){return d.values});
        //enter
        var nodeEnter = node.enter()
          .append('circle')
          .attr('class','node')
          .on('click',function(d,i))

    })
    .on('mouseenter',function(d){
      var tooltip = d3.select('custom-tooltip');
      tooltip.select('title')
        .html(d.item + ', ' + d.flightsByTravelDate())
      tooltip.select('.value')
        .html(d.value);
    })
    .on('mousemove',function(d){
      var tooltip = d3.select('.custom-tooltip');
      var xy = d3.mouse(d3.select('.container').node());
      tooltip
        .style('left',xy[0]+10+'px')
        .style('top',xy[1]+10+'px');
    })
    .on('mouseleave',function(d){
      var tooltip = d3.select('custom-tooltip');
      tooltip.transition().style('opacity',0);
    })
    nodeEnter
      .attr('cx',function(d){return scaleX(d.flightsByTravelDate)})
      .attr('cy',function(d){return scaleY(d.price)})
      .merge(node)
      .attr('r',4)
      .attr('cx',function(d){return scaleX(d.flightsByTravelDate)})
      .attr('cy',function(d){return scaleY(d.price)})
      .style('fill',function(d){return scaleColor(d.price)});

    node.exit().remove();

    plot.select('.axis-x')
      .datum(rows)
      .transtion()
      .attr('d',function(datum){
        return lineGenerator(datum);
      })
      .style('fill','none')
      .style('stroke-width','2px')
      .style('stroke',function(datum){
        return scaleColor(datum[0].item);
      });
    }

}

function parse(d){

    if( !airlines.has(d.airline) ){
        airlines.add(d.airline);
    }

    return {
        airline: d.airline,
        price: +d.price,
        travelDate: new Date(d.travelDate),
        duration: +d.duration,
        id: d.id
    }
}
