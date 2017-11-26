/**
 * Machine Learning with javascript
 * Author: João Gabriel Lima
 * =========================================================
 * Example: iris2.js (plotly3d)
 * =========================================================
 */
/**
 * Import Modules
 */
const KMeans = require('shaman').KMeans;
const dataForge = require('data-forge');
const config = require('./config');
const plotly = require('plotly')(config.USERNAME, config.API_KEY);
const opn = require('opn');

// reading base file and put dataframe on df variable
var df = dataForge.readFileSync('iris.csv').parseCSV();

//Read class values
var class_ = df.getSeries("class").distinct();

//[ 'Iris-setosa', 'Iris-versicolor', 'Iris-virginica' ]
console.log(class_.toArray());

// create a subset and converting all values to float
var subset = df.subset(["sepallength", "sepalwidth", "petallength", "petalwidth"]).select(function (row) {
    return {
        sepallength: parseFloat(row.sepallength),
        sepalwidth: parseFloat(row.sepalwidth),
        petallength: parseFloat(row.petallength),
        petalwidth: parseFloat(row.petalwidth)
    };
});

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
    console.log(err);
    // show the clusters founds
    console.log(clusters);
    // show the centroids
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
            return c[indexes["sepalwidth"]]; // 2 - petallength
        }),
            z: centroids.map(function (c) {
                return c[indexes["petallength"]]; // 2 - petallength
            }),
        mode: 'markers',
        type: 'scatter3d',
        name: 'Centroids',
        marker: {
            color: '#000000',
            symbol: 'cross',
            size: 20
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
                return c[indexes["sepalwidth"]];
            }),
            z:  cluster.map(function (c) {
                return c[indexes["petallength"]];
             }),
            jitter: 0.3,
            mode: 'markers',
            type: 'scatter3d',
            name: 'Cluster ' + index
        }
        // add cluster graph data on plotData
        plotData.push(trace);
    });

    // set plotly graph layout
    var layout = {
        title: 'Iris Clustering 3D',
        xaxis: {
            title: 'sepallength'
        },
        yaxis: {
            title: 'sepalwidth'
        },
        yaxis: {
            title: 'petallength'
        }
    };

    //set graph options
    var graphOptions = {
        layout: layout, //set layout
        filename: 'Iris-clustering-3d', //set filename
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