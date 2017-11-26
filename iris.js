/**
 * Machine Learning with javascript
 * Author: João Gabriel Lima
 * =========================================================
 * Example: iris.js
 * =========================================================
 */

/**
 * Import Modules
 */
var stats = require('simple-statistics');
const KMeans = require('shaman').KMeans;
const dataForge = require('data-forge');
const config = require('./config');
const plotly = require('plotly')(config.USERNAME, config.API_KEY);
const opn = require('opn');

// reading base file and put dataframe on df variable
var df = dataForge.readFileSync('iris.csv').parseCSV();

//Read class values
var class_ = df.getSeries("class").distinct();
console.log(class_.toArray()); //[ 'Iris-setosa', 'Iris-versicolor', 'Iris-virginica' ]

// create a subset and converting all values to float
var subset = df.subset(["sepallength", "sepalwidth", "petallength", "petalwidth"]).select(function (row) {
    return {
        sepallength: parseFloat(row.sepallength),
        sepalwidth: parseFloat(row.sepalwidth),
        petallength: parseFloat(row.petallength),
        petalwidth: parseFloat(row.petalwidth)
    };
});

/**
 * Summary function return the overview about the data serie
 * @param column
 * @returns {{min, max, sum: (*|Matrix|number|number), median: (*|Number|number), mode, mean: (*|number), variance: (*|number), stdDeviation: number, quantile: {q1: (*|{q1, q3}), q3: (*|{q1, q3})}}}
 */
function summary(column) {
    return {
        min: stats.min(column),
        max: stats.max(column),
        sum: stats.sum(column),
        median: stats.median(column),
        mode: stats.mode(column),
        mean: stats.mean(column),
        variance: stats.variance(column),
        stdDeviation: stats.standardDeviation(column),
        quantile: {
            q1: stats.quantile(column, 0.25),
            q3: stats.quantile(column, 0.75)
        }
    };
}
// invoke and show summary function for sepalwidth serie
console.log('sepallength');
console.log(summary(subset.getSeries('sepallength').toArray()));
console.log('sepalwidth');
console.log(summary(subset.getSeries('sepalwidth').toArray()));
console.log('petallength');
console.log(summary(subset.getSeries('petallength').toArray()));
console.log('petalwidth');
console.log(summary(subset.getSeries('petalwidth').toArray()));

// dictionary for aux the indexes read
var indexes = {
    sepallength:0,
    sepalwidth:1,
    petallength:2,
    petalwidth:3
}

// build clustering model
var kmeans = new KMeans(3);
// execute clustering using dataset
kmeans.cluster(subset.toRows(), function (err, clusters, centroids) {

    // show any errors
    console.log("ERROR");
    console.log(err);
    // show the clusters founds
    console.log("clusters");
    console.log(clusters);
    // show the centroids
    console.log("clusters");
    console.log(centroids);


    /**
     * Build Plotly graph
     *
     * 0 - sepallength
     * 1 - sepalwidth
     * 2 - petallength
     * 3 - petalwidth
     */
    // build centroids graph model
    var centroidTrace = {
        x: centroids.map(function (c) {
            return c[indexes["sepallength"]]; // 0 - sepallength
        }),
        y: centroids.map(function (c) {
            return c[indexes["petallength"]]; // 2 - petallength
        }),
        mode: 'markers',
        type: 'scatter',
        name: 'Centroids',
        marker: {
            color: '#000000',
            symbol: 'cross',
            size: 10
        }
    };

    // adding centroids data on the plotData array
    var plotData = [centroidTrace];

    // build clusters graph model
    clusters.forEach(function (cluster, index) {
        var trace = {
            x: cluster.map(function (c) {
                return c[indexes["sepallength"]];
            }),
            y: cluster.map(function (c) {
                return c[indexes["petallength"]];
            }),
            jitter: 0.3,
            mode: 'markers',
            type: 'scatter',
            name: 'Cluster ' + index
        }
        // add cluster graph data on plotData
        plotData.push(trace);
    });

    // set plotly graph layout
    var layout = {
        title: 'Iris Clustering',
        xaxis: {
            title: 'sepallength'
        },
        yaxis: {
            title: 'petallength'
        }
    };

    //set graph options
    var graphOptions = {
        layout: layout, //set layout
        filename: 'Iris-clustering', //set filename
        fileopt: 'overwrite' // if exists just overwrite
    };

    //create the graph
    plotly.plot(plotData, graphOptions, function (err, msg) {
        if (!err) {
            // if build without erros show the message and open browser with graph
            console.log('Success! The plot (' + msg.filename + ') can be found at ' + msg.url);
            opn(msg.url);
            process.exit();
        }
    });
});

