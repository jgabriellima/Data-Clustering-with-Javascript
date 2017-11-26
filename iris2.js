/**
 * Machine Learning with javascript
 * Author: João Gabriel Lima
 * =========================================================
 * Example: iris2.js ml-kmeans
 * =========================================================
 */

const kmeans = require('ml-kmeans');
const config = require('./config');
const plotly = require('plotly')(config.USERNAME, config.API_KEY);
const opn = require('opn');
var stats = require('simple-statistics');
const dataForge = require('data-forge');
const _ = require('underscore');
//https://github.com/mljs/distance
const distance = require('ml-distance').distance;
const zscore = require('zscore').default;

// read csv file
var df = dataForge.readFileSync('../datasets/iris.csv').parseCSV();

// create a subset removing the
var subset = df.subset(["sepallength", "sepalwidth", "petallength", "petalwidth"]).select(function (row) {
    return _.mapObject(row, function(val, key) {
        return parseFloat(val);
    });
});

//https://mljs.github.io/kmeans/#kmeans
var options ={
    maxIterations:1000, //Maximum of iterations allowed
    tolerance: 0, //Error tolerance
    withIterations:false, //Store clusters and centroids for each iteration
    distanceFunction: distance.squaredEuclidean,
    initialization: 'random' // 'mostDistant', 'random' or Array<Array<number>>
};

/**
 *
 * kmeans(data: Array<Array<number>>, K: number, options: [object]): KMeansResult
 *
 * @type {KMeansResult}
 * 'clusters': Array of indexes for the clusters.
 * 'centroids': Array with the resulting centroids.
 * 'iterations': Number of iterations that took to converge
 */
var ans = kmeans(subset.toRows(), 3,options);

// create a new column with cluster information
subset = subset.withSeries("cluster", function() {
    return new dataForge.Series({
        values: ans.clusters
    })
});
// create a new column with class information for compare with clusterization results
subset = subset.withSeries("class", function() {
    return new dataForge.Series({
        values: df.getSeries("class").toArray()
    })
});

// build centroids graph model
var centroidTrace = {
    x: ans.centroids.map(function (c) {
        return c.centroid[0]
    }),
    y: ans.centroids.map(function (c) {
        return c.centroid[2]
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

// data vector
var plotData = [centroidTrace];

// Return the unique values on cluster column
var clusters = subset.getSeries("cluster").distinct().toArray();

// for each cluster, add the points for build graph
clusters.forEach(function (cluster, index) {
    var trace = {
        x: _.filter(subset.toArray(), function(o){ return o['cluster'] == cluster; }).map(function (c) {
            return c["sepallength"];
        }),
        y: _.filter(subset.toArray(), function(o){ return o['cluster'] == cluster; }).map(function (c) {
            return c["petallength"];
        }),
        jitter: 0.3,
        mode: 'markers',
        type: 'scatter',
        name: 'Cluster '+ index
    }
    // adding the data cluster on vector
    plotData.push(trace);
});

// set plotly graph layout
var layout = {
    title: 'Iris Clustering - version 2',
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
    filename: 'Iris-clustering-2', //set filename
    fileopt: 'overwrite' // if exists just overwrite
};

// create the graph
plotly.plot(plotData, graphOptions, function (err, msg) {
    if (!err) {
        // if build without erros show the message and open browser with graph
        console.log('Success! The plot (' + msg.filename + ') can be found at ' + msg.url);
        opn(msg.url);
        process.exit();
    }
});

/**
 * Allows to compute for a new array of points their cluster id
 * nearest(data: Array<Array<number>>): Array<number>
 * @type {Array.<Number>}
 */
var r = ans.nearest([[5.1,3.5,1.4,0.2],[5.8,2.7,5.1,1.9],[5.4,3.9,1.7,0.4]])
console.log(r)

const myStandardizedArray = zscore(subset.getSeries("sepallength").toArray());
console.log(myStandardizedArray);