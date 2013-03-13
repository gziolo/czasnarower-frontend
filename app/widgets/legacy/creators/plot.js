/*global Core:false */
Core.Creator.register('plot', function(facade, $) {
  "use strict";

  var plotSizes = {};
  var showUserResults = function(target, stats, ticks, races) {
    $.jqplot(target, stats, {
      grid : {
        drawGridlines : true,
        background : '#ffffff',
        borderWidth : 0,
        shadow : false
      },
      legend : {
        show : true,
        location : 'es'
      },
      seriesDefaults : {
        renderer : $.jqplot.BarRenderer,
        rendererOptions : {
          fillToZero : true,
          barMargin : 5,
          showMarker : false
        },
        shadow : false
      },
      series : [ {
        label : 'Procent 1 miejsca w kategorii',
        rendererOptions : {
          barMargin : 1,
          barPadding : 1
        }
      }, {
        label : 'Procent 1 miejsca open',
        xaxis : 'x2axis',
        rendererOptions : {
          barMargin : 1,
          barPadding : 1
        }
      } ],
      axesDefaults : {
        tickRenderer : $.jqplot.CanvasAxisTickRenderer,
        labelRenderer : $.jqplot.CanvasAxisLabelRenderer
      },
      axes : {
        xaxis : {
          renderer : $.jqplot.CategoryAxisRenderer,
          ticks : ticks,
          tickOptions : {
            fontSize : '8pt',
            angle : -45,
            showGridline : false,
            markSize : 0,
            formatString : '%d%',
            formatter : function(x, y) {}
          }

        },
        x2axis : {
          ticks : ticks,
          renderer : $.jqplot.CategoryAxisRenderer,
          tickOptions : {
            show : false
          }
        },
        yaxis : {
          tickOptions : {
            formatString : '%d%'
          },
          min : 0,
          max : 100
        }
      }

    });

    $('#' + target).bind('jqplotDataHighlight', function(ev, seriesIndex, pointIndex, data) {
      $('#highlightedResult').html('<big><strong>' + data[1] + ' % ' + '</strong></big> ' + ' (' + ticks[pointIndex] + ') ' + races[pointIndex]);
    }).bind('jqplotDataUnhighlight', function(ev) {
      $('#highlightedResult').html('<i>Najedź kursorem myszy <big>nad słupek</big> aby wyświetlić szczegóły wyniku.</i>');
    });
  };

  var showTrackProfile = function(target, elevations) {

    var plot1 = $.jqplot(target, [ elevations, elevations ], {
      grid : {
        gridLineColor : '#cccccc'
      },
      series : [ {
        fill : true,
        shadow : false,
        rendererOptions : {
          highlightMouseOver : false
        }
      }, {
        xaxis : 'x2axis',
        yaxis : 'yaxis',
        renderer : $.jqplot.BarRenderer,
        rendererOptions : {
          barMargin : 0,
          barPadding : 0
        },
        color : 'rgba(255,255,255,0)',
        shadow : false
      } ],
      axesDefaults : {
        tickRenderer : $.jqplot.CanvasAxisTickRenderer,
        labelRenderer : $.jqplot.CanvasAxisLabelRenderer
      },
      axes : {
        xaxis : {
          min : 0,
          pad : 0,
          tickOptions : {
            formatString : '%.2f km'
          }
        },
        x2axis : {
          renderer : $.jqplot.CategoryAxisRenderer,
          tickOptions : {
            show : false
          }
        },
        yaxis : {
          tickOptions : {
            formatString : '%d m'
          }
        }
      },
      cursor : {
        show : false,
        showMarker : false,
        tooltipFormatString : '%s m',
        useAxesFormatters : false
      }
    });

    $('#' + target).bind('jqplotDataHighlight', function(ev, seriesIndex, pointIndex, data) {
      facade.notify({
        type : 'track-view-update-mousemarker',
        data : {
          show : true,
          location : data[2],
          altitude : data[1].toFixed(2),
          distance : elevations[pointIndex][0].toFixed(2)
        }
      });
      $('#highlightedResult').html('Wysokość: <big><strong>' + data[1].toFixed(2) + ' m ' + '</strong></big> | ' + elevations[pointIndex][0].toFixed(2) + ' km');

    }

    ).bind('jqplotDataUnhighlight', function(ev) {
      facade.notify({
        type : 'track-view-update-mousemarker',
        data : {
          show : false,
          location : null
        }
      });
      $('#highlightedResult').html('<i>Najedź kursorem myszy <big>na wykres</big> aby wyświetlić szczegóły.</i>');
    });

    plotSizes[target] = $('#' + target).width();

    $(window).resize(function(event, ui) {
      if (plotSizes[target] != $('#' + target).width()) {
        plotSizes[target] = $('#' + target).width();
        plot1.replot({});
      }
    });

  };

  return {
    init : function(data) {
      facade.listen('plot-show-user-results', this.showUserResults, this);
      facade.listen('plot-show-track-profile', this.showTrackProfile, this);
    },
    showUserResults : function(messageInfo) {
      if (!messageInfo.data.stats || !messageInfo.data.stats.length || !messageInfo.data.ticks) {
        return;
      }
      var requiredScripts = [ 'js/jqplot/excanvas.min.js', 'js/jqplot/jquery.jqplot.min.js', 'js/jqplot/plugins/jqplot.barRenderer.min.js', 'js/jqplot/plugins/jqplot.canvasTextRenderer.min.js',
          'js/jqplot/plugins/jqplot.canvasAxisTickRenderer.min.js', 'js/jqplot/plugins/jqplot.canvasAxisLabelRenderer.min.js', 'js/jqplot/plugins/jqplot.categoryAxisRenderer.min.js',
          'js/jqplot/plugins/jqplot.pointLabels.min.js', 'js/jqplot/plugins/jqplot.highlighter.min.js' ];
      facade.requireScripts(requiredScripts, function() {
        showUserResults('results_stats', messageInfo.data.stats, messageInfo.data.ticks, messageInfo.data.races);
      });
    },
    showTrackProfile : function(messageInfo) {
      if (!messageInfo.data.elevations || !messageInfo.data.elevations.length) {
        return;
      }
      var requiredScripts = [ 'js/jqplot/excanvas.min.js', 'js/jqplot/jquery.jqplot.min.js', 'js/jqplot/plugins/jqplot.barRenderer.min.js', 'js/jqplot/plugins/jqplot.canvasTextRenderer.min.js',
          'js/jqplot/plugins/jqplot.canvasAxisTickRenderer.min.js', 'js/jqplot/plugins/jqplot.canvasAxisLabelRenderer.min.js', 'js/jqplot/plugins/jqplot.categoryAxisRenderer.min.js',
          'js/jqplot/plugins/jqplot.pointLabels.min.js', 'js/jqplot/plugins/jqplot.cursor.min.js' ];
      facade.requireScripts(requiredScripts, function() {
        showTrackProfile(messageInfo.data.target, messageInfo.data.elevations);
      });
    },
    destroy : function() {}
  };
});
