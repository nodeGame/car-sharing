"use strict"

var a =  {
    a: [1 , 2 , 3],
    b: [4, 8],
    c: [1],
    d: [10, 20, 30, 40]
};

var myout = {
    t_a1_b2: { a: 1, b: 2 },
    t_a1_b8: { a: 1, b: 8 },

    t_a2_b2: { a: 2, b: 2 },
    t_a2_b8: { a: 2, b: 8 },

    t_a3_b2: { a: 3, b: 2 },
    t_a3_b8: { a: 3, b: 8 },
}

function myexplode(obj, names) {
    var key, summary, keys, keysLen, totalCombinations;
    var i, len;
    var myobj;
    keys = [];
    totalCombinations = 1;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            summary[key] = {
                length: obj[key].length,
                lastUsed: null
            };
            totalCombinations = totalCombinations * obj[key].length;
            keys.push(key);
        }
    }
    keysLen = keys.length;

    for (i = -1 ; ++i < totalCombinations ; ) {
        myobj = summary[keys];
    }


}

function getNext(obj, keys, lastVisited) {
    var x, y, value, key;
    x = lastVisited[0];
    y = lastVisited[1]+1;
    key = keys[x];
    value = null;
    if ('undefined' !== typeof key) {
        value = obj[key][y];
        if ('undefined' === typeof value) {        
            x = x + 1;
            key = keys[x];
            if ('undefined' !== typeof key) {
                y = 0;
                value = obj[key][y];   
            }
        }
    }
    lastVisited[0] = x;
    lastVisited[1] = y;
    return value;
}

function getNext2(obj, keys, lastVisited) {
    var x, y, value, key;
    // Try to increment to the first element next row.
    x = visited.x + 1;
    y = 0;
    key = keys[x];
    value = null;
    if ('undefined' === typeof key) {
        x = visited.x;
    }
        value = obj[key][y];
        if ('undefined' === typeof value) {        
            x = x - 1;
            key = keys[x];
            if ('undefined' !== typeof key) {
                y = lastVisited[x][lastVisited.length];
                value = obj[key][y];   
            }
        }
    }
    lastVisited[0] = x;
    lastVisited[1] = y;
    return {key: key, value: value, x: x, y: y};
}


function explode(obj) {
    var keys, key;
    var startKey;
    var myobj, name, out;
    var i, j, lenI, lenJ;
    keys = Object.keys(obj);
    startKey = [keys[0]];
    myobj = {};
    myobj[startKey] = obj[startKey][0];
    
    lenJ = obj[startKey].length;
    i = -1, lenI = keys.length;
    for ( ; ++i < lenI ; ) {
        key = keys[i];
       
        getNext(obj, keys, visited)

        if (key === startKey) continue;
        name +=  '_' + key + obj[key][0];
        myobj[key] = obj[key][0];
        console.log(key, i, lenI);
    }

    console.log(myobj);
}


function explode2(obj) {
    var keys, key;
    var startKey;
    var myobj, name, out;
    var i, j, lenI, lenJ;
    var next, visited;
    keys = Object.keys(obj);
    startKey = [keys[0]];
    myobj = {};
    visited = [0, -1];
    myobj[startKey] = obj[startKey][0];
    
    lenJ = obj[startKey].length;
    i = -1, lenI = keys.length;
    for ( ; ++i < lenI ; ) {
        key = keys[i];

        next = getNext(obj, keys, visited);
        while (next !== null) {
            console.log(next);
            next = getNext(obj, keys, visited);
        }
        
        continue;
        if (key === startKey) continue;
        name +=  '_' + key + obj[key][0];
        myobj[key] = obj[key][0];
        console.log(key, i, lenI);
    }

    console.log(myobj);
}

function explode2(obj) {
    var keys, key;
    var startKey;
    var myobj, name, out;
    var i, j, lenI, lenJ;
    var next, visited;
    keys = Object.keys(obj);
    
    i = -1, lenI = keys.length;
    for ( ; ++i < lenI ; ) {
        key = keys[i];
        j = 0;
        visited[i] = [j];
        next = getNext2(obj, keys, visited);
        while (next !== null) {
            console.log(next);
            next = getNext(obj, keys, visited);
        }
        
        continue;
        if (key === startKey) continue;
        name +=  '_' + key + obj[key][0];
        myobj[key] = obj[key][0];
        console.log(key, i, lenI);
    }

    console.log(myobj);
}


console.log(a);
explode2(a);

function buildTreatments(obj, names) {

    var i, j, h, len, lenKeys, lenOtherKey;
    var startKey, name, keys, myobj;
    var out;

    keys = Object.keys(obj);
    lenKeys = keys.length;

    out = {};

    // Begin with a key to combine treatments.
    startKey = keys[0];
    i = -1, len = obj[startKey].length;
    for ( ; ++i < len ; ) {

        name = 't_' + startKey + obj[startKey][i];
        myobj = {};

        // For every other key.
        j = -1;
        for ( ; ++j < lenKeys ; ) {
            if (keys[j] === startKey) continue;

            // .
            h = -1, lenOtherKey = obj[keys[j]].length;
            for ( ; ++h < lenOtherKey ; ) {

                myobj[startKey] = obj[startKey][i];

                name += '_' + keys[j] + obj[keys[j]][h];

                myobj[keys[j]] = obj[keys[j]][h];

            }
            out[name] = myobj;

            // myobj[keys[j]];

        }


    }


    console.log(out);
}

