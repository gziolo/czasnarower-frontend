/*jshint unused:false, strict:false */
define(function() {
    return function(facade, $) {
        'use strict';

        var plotSizes = {};
        var plotCanvas = null;

        var showUserResults = function(target, stats, ticks, races) {
            if (plotCanvas) {
                plotCanvas.destroy();
            }
            $.jqplot.postDrawHooks.push(function() {
                $('#' + target + ' .loader-progress').hide();
            });

            $.jqplot.preDrawHooks.push(function() {
                $('#' + target + ' .loader-progress').show();
            });
            plotCanvas = $.jqplot(target, stats, {
                grid: {
                    drawGridlines: true,
                    background: '#ffffff',
                    borderWidth: 0,
                    shadow: false
                },
                legend: {
                    show: true,
                    location: 'es'
                },
                seriesDefaults: {
                    renderer: $.jqplot.BarRenderer,
                    rendererOptions: {
                        fillToZero: true,
                        barMargin: 5,
                        showMarker: false
                    },
                    shadow: false
                },
                series: [{
                    label: 'Procent 1 miejsca w kategorii',
                    rendererOptions: {
                        barMargin: 1,
                        barPadding: 1
                    }
                }, {
                    label: 'Procent 1 miejsca open',
                    xaxis: 'x2axis',
                    rendererOptions: {
                        barMargin: 1,
                        barPadding: 1
                    }
                }],
                axesDefaults: {
                    tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                    labelRenderer: $.jqplot.CanvasAxisLabelRenderer
                },
                axes: {
                    xaxis: {
                        renderer: $.jqplot.CategoryAxisRenderer,
                        ticks: ticks,
                        tickOptions: {
                            fontSize: '8pt',
                            angle: -45,
                            showGridline: false,
                            markSize: 0,
                            formatString: '%d%',
                            formatter: function(x, y) {}
                        }

                    },
                    x2axis: {
                        ticks: ticks,
                        renderer: $.jqplot.CategoryAxisRenderer,
                        tickOptions: {
                            show: false
                        }
                    },
                    yaxis: {
                        tickOptions: {
                            formatString: '%d%'
                        },
                        min: 0,
                        max: 100
                    }
                }

            });

            $('#' + target).bind('jqplotDataHighlight', function(ev, seriesIndex, pointIndex, data) {
                $('#highlightedResult').html('<big><strong>' + data[1] + ' % ' + '</strong></big> ' + ' (' + ticks[pointIndex] + ') ' + races[pointIndex]);
            }).bind('jqplotDataUnhighlight', function(ev) {
                $('#highlightedResult').html('<i>Najedź kursorem myszy <big>nad słupek</big> aby wyświetlić szczegóły wyniku.</i>');
            });
        };

        return {
            init: function(data) {
                facade.listen('plot-show-user-results', this.showUserResults, this);
            },
            showUserResults: function(messageInfo) {
                var radio, options;

                if (!messageInfo.data.stats || !messageInfo.data.stats.length || !messageInfo.data.ticks) {
                    return;
                }

                // Check if user has more than 1 sort of shedule-results
                // if yes add radiobuttons to filter by race-sort
                var categories = messageInfo.data.categories;
                var categories_labels = messageInfo.data.categories_labels;
                var unique = categories.filter(function(value, index, self) {
                    return self.indexOf(value) === index;
                });

                if (unique.length > 1) {
                    options = $('<div id="categorySelect">Wybierz kategorię: </div>');
                    $('#results_stats').before(options);
                    radio = $('<label class="radio inline"><input checked type="radio" name="category" value="0"/>wszystkie<label>');
                    options.append(radio);

                    /*jshint forin:false */
                    for (var cat in unique) {
                        radio = $('<label class="radio inline"><input type="radio" name="category" value="' + unique[cat] + '"/>' + (categories_labels[unique[cat]] ? categories_labels[unique[cat]] : 'kategoria ' + unique[cat]) + ' <label>');
                        options.append(radio);
                    }

                    $('input[name=category]').on('change', function() {
                        var stats, ticks, races;

                        var cat = +$(this).val();
                        if (cat > 0) {
                            stats = [
                                [],
                                []
                            ];
                            ticks = [];
                            races = [];

                            for (var i = 0; i < messageInfo.data.categories.length; i++) {
                                if (messageInfo.data.categories[i] === cat) {
                                    stats[0].push(messageInfo.data.stats[0][i]);
                                    stats[1].push(messageInfo.data.stats[1][i]);
                                    ticks.push(messageInfo.data.ticks[i]);
                                    races.push(messageInfo.data.races[i]);

                                }
                            }
                            showUserResults('results_stats', stats, ticks, races);
                        } else {
                            showUserResults('results_stats', messageInfo.data.stats, messageInfo.data.ticks, messageInfo.data.races);
                        }

                    });
                }

                var requiredScripts = ['js/jqplot/excanvas.min.js', 'js/jqplot/jquery.jqplot.min.js', 'js/jqplot/plugins/jqplot.barRenderer.min.js', 'js/jqplot/plugins/jqplot.canvasTextRenderer.min.js',
                    'js/jqplot/plugins/jqplot.canvasAxisTickRenderer.min.js', 'js/jqplot/plugins/jqplot.canvasAxisLabelRenderer.min.js', 'js/jqplot/plugins/jqplot.categoryAxisRenderer.min.js',
                    'js/jqplot/plugins/jqplot.pointLabels.min.js', 'js/jqplot/plugins/jqplot.highlighter.min.js'
                ];
                facade.requireScripts(requiredScripts, function() {
                    showUserResults('results_stats', messageInfo.data.stats, messageInfo.data.ticks, messageInfo.data.races);
                });
            },
            destroy: function() {}
        };
    };
});